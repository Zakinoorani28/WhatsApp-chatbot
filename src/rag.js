import { ChatGroq } from "@langchain/groq";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Embeddings } from "@langchain/core/embeddings";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { pipeline } from "@xenova/transformers";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Local HuggingFace embeddings class running @xenova/transformers (Xenova/all-MiniLM-L6-v2)
 */
export class LocalHuggingFaceEmbeddings extends Embeddings {
  constructor(fields = {}) {
    super(fields);
    this.modelName = fields.model || "Xenova/all-MiniLM-L6-v2";
    this.pipe = null;
  }

  async getPipeline() {
    if (!this.pipe) {
      this.pipe = await pipeline("feature-extraction", this.modelName);
    }
    return this.pipe;
  }

  async embedDocuments(texts) {
    const pipe = await this.getPipeline();
    const embeddings = [];
    for (const text of texts) {
      const output = await pipe(text, { pooling: "mean", normalize: true });
      embeddings.push(Array.from(output.data));
    }
    return embeddings;
  }

  async embedQuery(text) {
    const pipe = await this.getPipeline();
    const output = await pipe(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
}

let retriever = null;
let ragChain = null;

/**
 * Initializes RAG pipeline: loads text, splits chunks, computes embeddings, builds vector store & retriever, and builds LCEL chain.
 */
export async function initRAG() {
  if (ragChain && retriever) {
    return { retriever, ragChain };
  }

  console.log("📖 Loading knowledge base from src/knowledge/aiseason.txt...");
  const knowledgePath = path.join(__dirname, "knowledge", "aiseason.txt");

  if (!fs.existsSync(knowledgePath)) {
    throw new Error(`Knowledge file not found at ${knowledgePath}`);
  }

  const rawText = fs.readFileSync(knowledgePath, "utf-8");

  // Split text using RecursiveCharacterTextSplitter (chunkSize: 500, chunkOverlap: 50)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const docs = await splitter.createDocuments([rawText]);
  console.log(`🧩 Loaded ${docs.length} chunks into MemoryVectorStore`);

  // Local HuggingFace embeddings
  const modelName = process.env.EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2";
  const embeddings = new LocalHuggingFaceEmbeddings({ model: modelName });

  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  retriever = vectorStore.asRetriever({ k: 3 });

  // RAG Chain using strict LCEL pipe syntax from course slides
  ragChain = RunnableSequence.from([
    {
      context: retriever.pipe((docs) =>
        docs.map((d) => d.pageContent).join("\n\n"),
      ),
      question: new RunnablePassthrough(),
    },
    ChatPromptTemplate.fromTemplate(`
      You are an AI assistant for AI Season Bootcamp.
      Answer the question using ONLY the context below.
      If the answer isn't in the context, say: 
      "I don't have that info in my knowledge base, but I can try to help from my general knowledge!"
      
      Context: {context}
      
      Question: {question}
      
      Concise answer (2-4 sentences for WhatsApp):
    `),
    new ChatGroq({
      apiKey: process.env.GROQ_API_KEY || "dummy-key",
      model: process.env.LLM_MODEL || "openai/gpt-oss-120b",
      modelName: process.env.LLM_MODEL || "openai/gpt-oss-120b",
      temperature: 0.3,
      maxTokens: 400,
    }),

    new StringOutputParser(),
  ]);

  console.log("RAG ready ✓");
  return { retriever, ragChain };
}

export const initializeRAG = initRAG;

/**
 * Invokes RAG chain with user query
 */
export async function queryRAG(question) {
  try {
    if (!ragChain) {
      await initRAG();
    }

    console.log(`🔍 RAG query: ${question}`);
    const answer = await ragChain.invoke(question);
    return answer;
  } catch (error) {
    console.error(
      `💥 RAG query failed for "${question}":`,
      error?.message || error,
    );
    return null;
  }
}

/**
 * Synchronous keyword routing check covering 40+ course topics
 */
export function isKnowledgeBaseQuery(message) {
  if (!message || typeof message !== "string") return false;

  const keywords = [
    "ai season",
    "bootcamp",
    "langchain",
    "lcel",
    "runnable",
    "rag",
    "retriever",
    "embedding",
    "embeddings",
    "vector store",
    "vector",
    "chunk",
    "chunking",
    "similarity search",
    "tool",
    "tools",
    "tool calling",
    "@tool",
    "bind_tools",
    "react",
    "agent",
    "agents",
    "memory",
    "groq",
    "baileys",
    "langgraph",
    "node",
    "nodes",
    "edge",
    "edges",
    "checkpointer",
    "lpu",
    "prompt",
    "chain",
    "model",
    "token",
    "tokens",
    "context",
    "similarity",
    "whatsapp",
    "qr scan",
    "session",
    "multimodal",
    "stateful",
    "schema",
    "parser",
    "sequence",
    "parallel",
    "branch",
  ];

  const lowerMsg = message.toLowerCase();
  return keywords.some((keyword) => lowerMsg.includes(keyword));
}

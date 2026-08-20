import { ChatGroq } from "@langchain/groq";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { queryRAG, isKnowledgeBaseQuery } from "./rag.js";
import {
  getPersonalInfoSummary,
  isMemoryQuery,
  getConversationHistory,
  updateMemory,
} from "./memory.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Single LLM instance created at module load
 */
const modelId = process.env.LLM_MODEL || 'openai/gpt-oss-120b';

export const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || 'dummy-key',
  model: modelId,
  modelName: modelId,
  temperature: 0.7,
  maxTokens: 800,
});

/**
 * Production-Grade System Prompt
 */
const SYSTEM_PROMPT = `You are an intelligent AI assistant 
for AI Season Bootcamp on WhatsApp.

YOUR CAPABILITIES:
1. Answer questions about AI Season course content (RAG-powered)
2. Remember personal information users share with you
3. Have natural conversations with memory of what was said

YOUR PERSONALITY:
- Friendly, helpful, and conversational
- Keep WhatsApp replies concise (3-5 lines max)
- Use light emojis to be approachable
- If user shares personal info, acknowledge it warmly

IMPORTANT RULES:
- When someone shares personal info (name, age, hobby etc.),
  acknowledge it and confirm you've remembered it
  Example: "Nice to meet you Ali! I've noted that you're 21. 😊"
- Never make up information you weren't told
- Stay helpful and on-topic for AI learning

Current conversation context:
{history}

Personal info you know about this user:
{userContext}`;

/**
 * LCEL General Chat Chain using MessagesPlaceholder("history")
 */
export const conversationChain = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_PROMPT],
  new MessagesPlaceholder("history"),
  ["human", "{message}"],
])
  .pipe(llm)
  .pipe(new StringOutputParser());

/**
 * Main Message Processing Function using 3-Path Pure JS + LCEL Router
 */
export async function processMessage(phone, userMessage) {
  try {
    // Step 1: Always update memory with incoming user message
    updateMemory(phone, userMessage, "user");

    // PATH A — Memory Query (Zero LLM Tokens)
    if (isMemoryQuery(userMessage)) {
      console.log(`[${phone}] Route: MEMORY | ~0 tokens`);
      const response = getPersonalInfoSummary(phone);
      updateMemory(phone, response, "assistant");
      return response;
    }

    // PATH B — RAG Query (Knowledge Base Lookup, ~300 Tokens)
    if (isKnowledgeBaseQuery(userMessage)) {
      console.log(`[${phone}] Route: RAG | ~300 tokens`);
      const ragResponse = await queryRAG(userMessage);
      if (ragResponse) {
        updateMemory(phone, ragResponse, "assistant");
        return ragResponse;
      }
      console.log(
        `[${phone}] RAG returned null. Falling through to PATH C General LLM...`,
      );
    }

    // PATH C — General Conversational LLM (~800 Tokens Capped)
    const rawHistory = getConversationHistory(phone);
    const historyMessages = rawHistory.map((m) =>
      m.role === "human"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content),
    );

    const personalContext = getPersonalInfoSummary(phone);
    const estimatedTokens = Math.round(
      JSON.stringify([SYSTEM_PROMPT, ...rawHistory, userMessage]).length / 4,
    );

    console.log(`[${phone}] Route: LLM | ~${estimatedTokens} tokens`);

    const response = await conversationChain.invoke({
      history: historyMessages,
      message: userMessage,
      userContext: personalContext,
    });

    // Step 3: Save response to memory
    updateMemory(phone, response, "assistant");

    // Step 4: Return response
    return response;
  } catch (error) {
    console.error("💥 Chain error:", error);
    const errorStr = String(error?.message || error);
    if (errorStr.includes("429")) {
      return "I'm a bit busy right now, please try again in a moment! 🙏";
    }
    return "Something went wrong. Please try again!";
  }
}

// Aliases for compatibility
export const processUserMessage = processMessage;
export const initChain = async () => {};

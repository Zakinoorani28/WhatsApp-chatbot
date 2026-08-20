# Project Change & Activity Log (`context.md`)

This document maintains a continuous log of all modifications, file creations, updates, deletions, and structural changes performed in this repository across session prompts.

---

## 📅 Session Log: 2026-08-20 (Task 6 — Week 2 Complete)

### 🟢 Added Files

- **`context.md`**: Active project activity log tracking all workspace additions, updates, deletions, and operational history.
- **`examples.md`**: Conversation examples demonstrating all 11 checklist requirements across 4 scenarios (Personal Info, RAG Queries, Mixed Flow, Pakistani Informal Urdu/English).
- **`package.json`**: Root project configuration with ES Modules (`"type": "module"`), dependencies, and Node engine `>=20.0.0`.
- **`.env.example` & `.env`**: Configuration templates for `GROQ_API_KEY`, `LLM_MODEL=llama-3.3-70b-versatile`, and `EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2`.
- **`.gitignore`**: Git rules ignoring `auth_info_baileys/`, `node_modules/`, `.env`, and `*.log`.
- **`src/knowledge/aiseason.txt`**: Knowledge base text document containing 10 comprehensive sections (8-10 sentences each).
- **`src/rag.js`**: RAG pipeline built with LangChain LCEL (`RunnableSequence.from`), local embeddings (`Xenova/all-MiniLM-L6-v2`), `MemoryVectorStore`, and 40+ sync keywords.
- **`src/memory.js`**: Personal information memory system (Regex extraction for name, age, city, profession, hobbies, food, color, facts + Pakistani informal patterns + 20-message conversation history store).
- **`src/chain.js`**: Main LangChain LCEL Brain implementing 3 routing paths (Path A: Memory Query zero-token, Path B: RAG Query ~300 tokens, Path C: General Conversational LLM ~800 tokens with history & personal context).
- **`src/whatsapp.js`**: Baileys WhatsApp connection handler with terminal QR code scan (`qrcode-terminal`), status updates (`composing`), message router, and user promise queue.
- **`README.md`**: Complete repository documentation and setup guide.

### 🔄 Updated Files

- **`package.json`**: Name updated to `aiseason-whatsapp-bot`, added Node `>=20.0.0` engine requirement.
- **`src/knowledge/aiseason.txt`**: Expanded each of the 10 sections to 8-10 detailed technical sentences.
- **`src/rag.js`**: Updated to use `RunnableSequence.from([...])`, `RunnablePassthrough()`, `ChatGroq(llama-3.3-70b-versatile, temperature: 0.3, maxTokens: 400)`, `LocalHuggingFaceEmbeddings`, and 40+ keywords.
- **`src/memory.js`**: Implemented `getOrCreateSession(phone)`, `extractPersonalInfo(message)` (English + Urdu regex patterns), `updateMemory`, `getPersonalInfoSummary`, `isMemoryQuery` (15+ trigger phrases), and `getConversationHistory` (returns last 8 messages).
- **`src/chain.js`**: Created module-level singleton `llm` ChatGroq instance, `conversationChain` with `MessagesPlaceholder("history")`, `processMessage(phone, userMessage)` 3-path LCEL router with token logging `console.log(\`[${phone}] Route: MEMORY/RAG/LLM | ~${tokens} tokens\`)`.
- **`src/whatsapp.js`**: Added concurrency queue protection per phone number, `initRAG()`, silent pino logger, `browser: ["AI Season Bot", "Chrome", "1.0.0"]`, and presence indicators.
- **`examples.md`**: Updated with 4 complete scenarios explicitly labeled with execution paths (MEMORY/RAG/LLM).
- **`README.md`**: Updated with exact architecture, stack, setup, run instructions, and submission checklist.

### 🔴 Deleted Files

- _None_

---

## 🛠️ Current Operational Status

- All required project files created and verified without placeholders (`src/rag.js`, `src/memory.js`, `src/chain.js`, `src/knowledge/aiseason.txt`, `examples.md`, `package.json`).
- Syntax & execution verified with Node.js ES Modules.
- Complete activity log maintained in `context.md`.

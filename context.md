# Project Change & Activity Log (`context.md`)

This document maintains a continuous log of all modifications, file creations, updates, deletions, and structural changes performed in this repository across session prompts.

---

## 📅 Session Log: 2026-08-20 (Task 6 — Week 2 Complete & Tested)

### 🟢 Added Files

- **`context.md`**: Active project activity log tracking all workspace additions, updates, deletions, and operational history.
- **`examples.md`**: Conversation examples demonstrating all 11 checklist requirements across 4 scenarios (Personal Info, RAG Queries, Mixed Flow, Pakistani Informal Urdu/English).
- **`package.json`**: Root project configuration with ES Modules (`"type": "module"`), dependencies, and Node engine `>=20.0.0`.
- **`.env.example` & `.env`**: Configuration templates for `GROQ_API_KEY`, `LLM_MODEL=openai/gpt-oss-120b`, and `EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2`.
- **`.gitignore`**: Git rules ignoring `auth_info_baileys/`, `node_modules/`, `.env`, and `*.log`.
- **`src/knowledge/aiseason.txt`**: Knowledge base text document containing 10 comprehensive sections (8-10 sentences each).
- **`src/rag.js`**: RAG pipeline built with LangChain LCEL (`RunnableSequence.from`), local embeddings (`Xenova/all-MiniLM-L6-v2`), `MemoryVectorStore`, and 40+ sync keywords.
- **`src/memory.js`**: Personal information memory system (Regex extraction for name, age, city, profession, hobbies, food, color, facts + Pakistani informal patterns + Urdu stop-words filter + 20-message conversation history store).
- **`src/chain.js`**: Main LangChain LCEL Brain implementing 3 routing paths (Path A: Memory Query zero-token, Path B: RAG Query ~300 tokens, Path C: General Conversational LLM with history & personal context).
- **`src/whatsapp.js`**: Baileys WhatsApp connection handler with terminal QR code scan (`qrcode-terminal`), status updates (`composing`), message router, and user promise queue.
- **`README.md`**: Complete repository documentation and setup guide.

### 🔄 Updated Files

- **`src/memory.js`**: Added stop-words filter (`['batao', 'kya', 'hai', 'kon', 'kaun', 'hu', 'hoon', 'bata', 'bataiye']`) to prevent false positive name extraction and added Urdu query triggers (`'mera naam batao'`, `'name batao'`, `'kya passand'`).
- **`src/chain.js`**: Resolved `ChatGroq` model property requirement for Groq SDK.
- **`.env`**: Configured `LLM_MODEL=openai/gpt-oss-120b` for Groq API integration.

### 🔴 Deleted Files

- _None_

---

## 🛠️ Current Operational Status

- Fully tested on live WhatsApp with real Baileys session.
- 0-token memory queries, RAG lookups, and conversational LLM responses verified in live terminal logs.
- Ready for submission & continuous execution.

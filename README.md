# AI Season WhatsApp Bot

## Baileys + LangChain + RAG + Conversational Memory

### Stack

- **WhatsApp:** Baileys (free, QR scan, no API needed)
- **LLM:** Groq `llama-3.3-70b-versatile` (free)
- **Framework:** LangChain JS (LCEL pipelines)
- **RAG:** MemoryVectorStore + HuggingFace embeddings (local)
- **Memory:** In-memory Map with personal info extraction

---

### LangChain Architecture

```
src/rag.js      ← RAG pipeline (retriever | prompt | llm | parser)
src/memory.js   ← Personal info detection + storage
src/chain.js    ← Main brain: routes → memory/RAG/LLM
src/whatsapp.js ← Baileys connector (not submitted)
```

---

### Setup

```bash
npm install
cp .env.example .env
# Add GROQ_API_KEY from console.groq.com
```

---

### Run

```bash
npm start
# Scan QR code with WhatsApp
# Message the bot!
```

---

### What to Submit

- `src/rag.js`
- `src/memory.js`
- `src/chain.js`
- `src/knowledge/aiseason.txt`
- `examples.md`
- `package.json`

> **DO NOT submit:** `src/whatsapp.js`, `auth_info_baileys/`, `node_modules/`

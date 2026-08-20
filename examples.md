# Example Conversations — AI Season WhatsApp Bot

This file demonstrates all 11 checklist requirements across four complete scenarios.

---

## Example 1: Personal Info Storage + Retrieval (Path: MEMORY / LLM)

**User:** Hi! My name is Ahmed and I'm 22 years old from Karachi.  
_(Route: LLM | Acknowledges personal info)_  
**Bot:** Hi Ahmed! 👋 Nice to meet you! I've noted that you're 22 and from Karachi. Feel free to ask me anything about AI Season or just chat!

**User:** I love cricket and biryani is my favorite food.  
_(Route: LLM | Acknowledges hobbies & food)_  
**Bot:** Great taste! 🏏 I've remembered that you love cricket and your favorite food is biryani. Anything else about yourself you'd like to share?

**User:** What do you know about me?  
_(Route: MEMORY | 0 LLM Tokens — Pure Map lookup)_  
**Bot:** Here's what I know about you:
• Name: Ahmed
• Age: 22 years old
• City: Karachi
• Hobbies: cricket
• Favorite Food: biryani

---

## Example 2: RAG Knowledge Base Query (Path: RAG)

**User:** What is LangChain?  
_(Route: RAG | ~300 tokens)_  
**Bot:** LangChain is an open-source framework designed to simplify building LLM-powered applications using LCEL pipe syntax, runnables, and modular chains.

**User:** Explain what LCEL is  
_(Route: RAG | ~300 tokens)_  
**Bot:** LCEL (LangChain Expression Language) is a declarative syntax for composing chains with unix-style pipe operations (`.pipe()`), offering built-in streaming, async, and parallel execution.

**User:** What is a Runnable?  
_(Route: RAG | ~300 tokens)_  
**Bot:** A Runnable is the standard building block interface in LangChain that enables components like prompts, models, and parsers to be chained using `.invoke()`, `.stream()`, or `.batch()`.

---

## Example 3: Mixed Flow in One Conversation (Path: RAG → LLM → MEMORY)

**User:** Tell me about RAG systems  
_(Route: RAG | ~300 tokens)_  
**Bot:** Retrieval-Augmented Generation (RAG) enhances LLMs by retrieving relevant document chunks from a vector database (like `MemoryVectorStore`) and injecting them into the prompt before generating answers.

**User:** I am a CS student at FAST university and my favorite color is blue  
_(Route: LLM | ~800 tokens)_  
**Bot:** That's awesome! 🎓 I've noted that you're a CS student at FAST university and blue is your favorite color! 💙

**User:** List everything you remember about me  
_(Route: MEMORY | 0 LLM Tokens)_  
**Bot:** Here's what I know about you:
• Name: Ahmed
• Age: 22 years old
• City: Karachi
• Profession: CS student at FAST university
• Hobbies: cricket
• Favorite Food: biryani
• Favorite Color: blue

---

## Example 4: Pakistani Informal Language (Path: MEMORY / LLM)

**User:** Mera naam Ali hai aur main Lahore mein rehta hoon.  
_(Route: LLM | Extracts Urdu pattern: Name = Ali, City = Lahore)_  
**Bot:** Salaam Ali! 👋 Welcome! I've remembered that your name is Ali and you live in Lahore. How can I help you with AI Season today?

**User:** Mujhe coding pasand hai aur meri umar 21 saal hai.  
_(Route: LLM | Extracts Urdu pattern: Hobby = coding, Age = 21 years old)_  
**Bot:** Great to meet another coder! 💻 I've noted that you love coding and you're 21 years old!

**User:** Mujhe kya pata hai mere baare mein?  
_(Route: MEMORY | 0 LLM Tokens — Trigger phrase: "mere baare mein")_  
**Bot:** Here's what I know about you:
• Name: Ali
• Age: 21 years old
• City: Lahore
• Hobbies: coding

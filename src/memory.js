import { HumanMessage, AIMessage } from "@langchain/core/messages";

/**
 * In-memory JavaScript Map storing session state per cleaned phone number
 */
export const memoryStore = new Map();

/**
 * Returns existing session or creates a new structured session object
 */
export function getOrCreateSession(phone) {
  if (!phone) return null;
  const cleanPhone = String(phone).replace("@s.whatsapp.net", "").trim();

  if (!memoryStore.has(cleanPhone)) {
    memoryStore.set(cleanPhone, {
      personalInfo: {
        name: null,
        age: null,
        city: null,
        profession: null,
        hobbies: [],
        favoriteFood: null,
        favoriteColor: null,
        preferences: [],
        facts: [],
      },
      conversationHistory: [],
      lastUpdated: new Date(),
    });
  }
  return memoryStore.get(cleanPhone);
}

/**
 * Trims trailing punctuation and whitespace from extracted regex strings
 */
function cleanExtractedValue(text) {
  if (!text) return null;
  return text
    .trim()
    .replace(/[.,!?]+$/g, "")
    .trim();
}

/**
 * Extracts personal information using English and Urdu/Pakistani informal regex patterns.
 * Never returns null for detected fields.
 */
export function extractPersonalInfo(message) {
  if (!message || typeof message !== "string") return {};

  const extracted = {};
  const msg = message.trim();

  // 1. Name Patterns
  const namePatterns = [
    /my name is ([a-zA-Z\s]+?)(?:\s+(?:and|i|my|who|living|from)|$|\.|,|!)/i,
    /naam mera ([a-zA-Z\s]+?)(?:\s+hai|\.|$)/i,
    /mera naam ([a-zA-Z\s]+?)(?:\s+hai|\.|$)/i,
    /mujhe ([a-zA-Z\s]+?) kehte hain/i,
    /call me ([a-zA-Z\s]+?)(?:\s+(?:and|i|my)|$|\.|,|!)/i,
    /^i am ([a-zA-Z]{2,20})$/i,
    /^i'm ([a-zA-Z]{2,20})$/i,
  ];

  for (const pattern of namePatterns) {
    const match = msg.match(pattern);
    if (match && match[1]) {
      const val = cleanExtractedValue(match[1]);
      const lower = val.toLowerCase();
      const stopWords = ['a', 'an', 'the', 'student', 'developer', 'boy', 'girl', 'batao', 'kya', 'hai', 'kon', 'kaun', 'hu', 'hoon', 'bata', 'bataiye'];
      if (val && !stopWords.includes(lower)) {
        extracted.name = val;
        break;
      }
    }
  }

  // 2. Age Patterns
  const agePatterns = [
    /(?:i am|i'm|my age is)\s+(\d{1,3})\s*(?:years old|year old|saal ka hoon|saal ki hoon)?/i,
    /(\d{1,3})\s*(?:saal ka hoon|saal ki hoon|saal ka|saal ki)/i,
    /meri umar\s+(\d{1,3})/i,
    /umar mera\s+(\d{1,3})/i,
  ];

  for (const pattern of agePatterns) {
    const match = msg.match(pattern);
    if (match && match[1]) {
      const ageNum = parseInt(match[1], 10);
      if (ageNum > 0 && ageNum < 120) {
        extracted.age = `${ageNum} years old`;
        break;
      }
    }
  }

  // 3. City Patterns
  const cityPatterns = [
    /(?:i live in|i'm from|i am from|i'm in)\s+([a-zA-Z\s]+?)(?:\s+(?:and|i|my)|$|\.|,|!)/i,
    /main\s+([a-zA-Z\s]+?)\s+mein rehta/i,
    /main\s+([a-zA-Z\s]+?)\s+se hoon/i,
    /from\s+(karachi|lahore|islamabad|rawalpindi|peshawar|quetta|multan|faisalabad|sialkot)/i,
  ];

  for (const pattern of cityPatterns) {
    const match = msg.match(pattern);
    if (match && match[1]) {
      const val = cleanExtractedValue(match[1]);
      if (val) {
        extracted.city = val;
        break;
      }
    }
  }

  // 4. Profession Patterns
  const professionPatterns = [
    /(?:i am a|i'm a|i work as|i work at|my job is|student at)\s+([a-zA-Z\s]+?)(?:\s+(?:and|i|my)|$|\.|,|!)/i,
    /(?:cs student|developer|engineer|software engineer|doctor|teacher|designer|freelancer)/i,
  ];

  for (const pattern of professionPatterns) {
    const match = msg.match(pattern);
    if (match) {
      const val = cleanExtractedValue(match[1] || match[0]);
      if (val) {
        extracted.profession = val;
        break;
      }
    }
  }

  // 5. Hobbies Patterns
  const hobbyPatterns = [
    /(?:my hobby is|i enjoy|i'm into)\s+([a-zA-Z\s,]+?)(?:\s+(?:and|my)|$|\.|,|!)/i,
    /(?:i like|i love)\s+(cricket|football|coding|reading|gaming|swimming|travelling|music|painting|singing|cooking|ai agents)/i,
    /mujhe\s+([a-zA-Z\s]+?)\s+pasand hai/i,
  ];

  for (const pattern of hobbyPatterns) {
    const match = msg.match(pattern);
    if (match && match[1]) {
      const val = cleanExtractedValue(match[1]);
      if (val) {
        extracted.hobbies = [val];
        break;
      }
    }
  }

  // 6. Food Patterns
  const foodPatterns = [
    /my favorite food is\s+([a-zA-Z\s]+?)(?:\s+(?:and|my)|$|\.|,|!)/i,
    /i love eating\s+([a-zA-Z\s]+?)(?:\s+(?:and|my)|$|\.|,|!)/i,
    /i like\s+([a-zA-Z\s]+?)\s+food/i,
    /(biryani|pizza|burger|pasta|nihari|karahi|tikka)/i,
  ];

  for (const pattern of foodPatterns) {
    const match = msg.match(pattern);
    if (match && match[1]) {
      const val = cleanExtractedValue(match[1]);
      if (val) {
        extracted.favoriteFood = val;
        break;
      }
    }
  }

  // 7. Color Patterns
  const colorPatterns = [
    /my favorite color is\s+([a-zA-Z\s]+?)(?:\s+(?:and|my)|$|\.|,|!)/i,
    /i love the color\s+([a-zA-Z\s]+?)(?:\s+(?:and|my)|$|\.|,|!)/i,
    /color is\s+(blue|red|green|black|white|yellow|purple|pink|orange)/i,
  ];

  for (const pattern of colorPatterns) {
    const match = msg.match(pattern);
    if (match && match[1]) {
      const val = cleanExtractedValue(match[1]);
      if (val) {
        extracted.favoriteColor = val;
        break;
      }
    }
  }

  if (Object.keys(extracted).length > 0) {
    console.log(`🧠 Extracted personal info: ${JSON.stringify(extracted)}`);
  }
  return extracted;
}

/**
 * Updates user memory with new messages and merges personal info without overwriting
 */
export function updateMemory(phone, message, role = "user") {
  const session = getOrCreateSession(phone);
  if (!session) return;

  if (role === "user") {
    const extracted = extractPersonalInfo(message);

    // Merge single string fields (do not overwrite existing with null)
    const singleFields = [
      "name",
      "age",
      "city",
      "profession",
      "favoriteFood",
      "favoriteColor",
    ];
    for (const field of singleFields) {
      if (extracted[field]) {
        session.personalInfo[field] = extracted[field];
      }
    }

    // Merge array fields (push new items & deduplicate)
    const arrayFields = ["hobbies", "preferences", "facts"];
    for (const field of arrayFields) {
      if (Array.isArray(extracted[field])) {
        for (const item of extracted[field]) {
          if (!session.personalInfo[field].includes(item)) {
            session.personalInfo[field].push(item);
          }
        }
      }
    }
  }

  // Push message to conversationHistory
  session.conversationHistory.push({
    role,
    content: message,
    timestamp: Date.now(),
  });

  // Store last 20 messages per phone
  if (session.conversationHistory.length > 20) {
    session.conversationHistory = session.conversationHistory.slice(-20);
  }

  session.lastUpdated = new Date();
}

/**
 * Formats structured personal info summary string
 */
export function getPersonalInfoSummary(phone) {
  const session = getOrCreateSession(phone);
  if (!session) {
    return "I don't know anything about you yet. Tell me your name, age, hobbies, or anything about yourself!";
  }

  const info = session.personalInfo;
  const lines = [];

  if (info.name) lines.push(`• Name: ${info.name}`);
  if (info.age) lines.push(`• Age: ${info.age}`);
  if (info.city) lines.push(`• City: ${info.city}`);
  if (info.profession) lines.push(`• Profession: ${info.profession}`);
  if (info.hobbies && info.hobbies.length > 0)
    lines.push(`• Hobbies: ${info.hobbies.join(", ")}`);
  if (info.favoriteFood) lines.push(`• Favorite Food: ${info.favoriteFood}`);
  if (info.favoriteColor) lines.push(`• Favorite Color: ${info.favoriteColor}`);
  if (info.preferences && info.preferences.length > 0)
    lines.push(`• Preferences: ${info.preferences.join(", ")}`);
  if (info.facts && info.facts.length > 0)
    lines.push(`• Other facts: ${info.facts.join(", ")}`);

  if (lines.length === 0) {
    return "I don't know anything about you yet. Tell me your name, age, hobbies, or anything about yourself!";
  }

  return `Here's what I know about you:\n${lines.join("\n")}`;
}

/**
 * Detects if user message is a personal memory query (15+ trigger phrases in English & Urdu)
 */
export function isMemoryQuery(message) {
  if (!message || typeof message !== "string") return false;

  const keywords = [
    'what do you know about me',
    'who am i',
    'tell me about myself',
    'what have i told you',
    'list everything',
    'remember about me',
    'what do you remember',
    'mujhe kya pata',
    'mere baare mein',
    'about me',
    'what is my name',
    'do you know me',
    'my details',
    'mera naam kya hai',
    'meri info',
    'mera naam batao',
    'name batao',
    'mera naam kya hai',
    'kya passand',
    'kya pasand',
  ];


  const lowerMsg = message.toLowerCase();
  return keywords.some((keyword) => lowerMsg.includes(keyword));
}

/**
 * Returns last 8 messages formatted for LangChain [{ role, content }]
 */
export function getConversationHistory(phone) {
  const session = getOrCreateSession(phone);
  if (!session) return [];

  const history = session.conversationHistory.slice(-8);
  return history.map((msg) => ({
    role: msg.role === "user" ? "human" : "assistant",
    content: msg.content,
  }));
}

/**
 * Resets session memory for a phone number
 */
export function clearMemory(phone) {
  const cleanPhone = String(phone).replace("@s.whatsapp.net", "").trim();
  memoryStore.delete(cleanPhone);
}

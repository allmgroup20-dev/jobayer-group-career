type LaneType = "greeting" | "farewell" | "thanks" | "confirmation" | "identity";
type FastLaneResult = { reply: string; lane: LaneType } | null;

type Pattern = { regex: RegExp; lane: LaneType };

const PATTERNS: Pattern[] = [
  // ── Greetings (English) ──
  { regex: /^(hi|hello|hey|howdy|greetings)\b/i, lane: "greeting" },
  { regex: /^(good\s*(morning|afternoon|evening|day))\b/i, lane: "greeting" },
  { regex: /^(what'?s\s*up|sup|yo)\b/i, lane: "greeting" },
  { regex: /^(nice\s*to\s*(meet|see)|pleased\s*to\s*meet)\b/i, lane: "greeting" },
  // ── Greetings (Bengali) ──
  { regex: /^(আসসালামু|ওয়ালাইকুম|সালাম|হ্যালো|হাই|হেলো)\b/i, lane: "greeting" },
  { regex: /^(শুনো|শুনি|কেমন\s*আছেন|কেমন\s*আছো|ভালো\s*ত)\b/i, lane: "greeting" },
  { regex: /^(কে\s*আছেন|কেউ\s*আছেন)\b/i, lane: "greeting" },
  // ── Farewells ──
  { regex: /^(bye|goodbye|see\s*you|talk\s*to\s*you\s*late?r|take\s*care)\b/i, lane: "farewell" },
  { regex: /^(আল্লাহ\s*হাফেজ|খোদা\s*হাফেজ|বাই|বিদায়|পরে\s*কথা\s*বলবো|পরে\s*দেখা)\b/i, lane: "farewell" },
  // ── Thanks ──
  { regex: /^(thanks|thank\s*you|thankyou|thnx|ty)\b/i, lane: "thanks" },
  { regex: /^(ধন্যবাদ|থ্যাংকস|থ্যাংক\s*ইউ|অনেক\s*ধন্যবাদ)\b/i, lane: "thanks" },
  // ── Confirmations ──
  { regex: /^(ok|okay|k|kk|sure|yes|yeah|yep|yup|right|got\s*it|understood|cool|alright|fine)\b$/i, lane: "confirmation" },
  { regex: /^(হ্যা|হ্যাঁ|ঠিক\s*আছে|আচ্ছা|থিক\s*আছে|বেশ|বুঝেছি|বুঝলাম|ওকে|ওকে)\b/i, lane: "confirmation" },
  // ── Identity (who are you?) ──
  { regex: /^(who\s*are\s*you|what\s*are\s*you|tell\s*me\s*about\s*yourself)\b/i, lane: "identity" },
  { regex: /^(তুমি\s*কে|আপনি\s*কে|কে\s*তুমি|কে\s*আপনি|কি\s*তুমি|কী\s*তুমি)\b/i, lane: "identity" },
];

const GREETING_REPLIES: Record<string, { en: string; bn: string }> = {
  greeting: {
    en: "Hello! 👋 Welcome to Jobayer Group Career. I'm your AI assistant. How can I help you today? You can ask me about our courses, membership plans, commission structure, or anything else you'd like to know.",
    bn: "হ্যালো! 👋 জবায়ের গ্রুপ ক্যারিয়ারে আপনাকে স্বাগতম। আমি আপনার AI সহায়ক। আজকে কীভাবে আপনাকে সাহায্য করতে পারি? আপনি আমাদের কোর্স, মেম্বারশিপ প্ল্যান, কমিশন স্ট্রাকচার বা অন্য কিছু জানতে চাইতে পারেন।",
  },
  farewell: {
    en: "Take care! 🙏 Feel free to message me anytime if you have questions about Jobayer Group Career. Wishing you success!",
    bn: "শুভ বিদায়! 🙏 জবায়ের গ্রুপ ক্যারিয়ার সম্পর্কে কোনো প্রশ্ন থাকলে যেকোনো সময় মেসেজ করতে পারেন। আপনার সাফল্য কামনা করি!",
  },
  thanks: {
    en: "You're most welcome! 😊 Is there anything else I can help you with?",
    bn: "আপনাকে স্বাগতম! 😊 আর কোনো কিছুতে কি সাহায্য করতে পারি?",
  },
  confirmation: {
    en: "Great! What else would you like to know about Jobayer Group Career?",
    bn: "চমৎকার! জবায়ের গ্রুপ ক্যারিয়ার সম্পর্কে আর কী জানতে চান?",
  },
  identity: {
    en: "I'm an AI assistant for Jobayer Group Career 🤖 I'm here to help you learn about our training programs, membership plans, commission opportunities, and anything related to building a career with us. Feel free to ask me anything!",
    bn: "আমি জবায়ের গ্রুপ ক্যারিয়ারের জন্য একটি AI সহায়ক 🤖 আমি এখানে আছি আমাদের ট্রেনিং প্রোগ্রাম, মেম্বারশিপ প্ল্যান, কমিশন সুযোগ এবং আমাদের সাথে ক্যারিয়ার গড়ার বিষয়ে আপনাকে সাহায্য করতে। নির্দ্বিধায় কিছু জিজ্ঞাসা করুন!",
  },
};

export function fastLane(text: string, lang: "en" | "bn" = "en"): FastLaneResult {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 100) return null;

  for (const { regex, lane } of PATTERNS) {
    if (regex.test(trimmed)) {
      const reply = lang === "bn" ? GREETING_REPLIES[lane].bn : GREETING_REPLIES[lane].en;
      return { reply, lane };
    }
  }

  return null;
}

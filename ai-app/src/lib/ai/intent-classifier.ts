import type { Intent, DepartmentId } from "./brain/types";

type IntentRoute = { intent: Intent; department: DepartmentId };

const INTENT_PATTERNS: { regex: RegExp; route: IntentRoute }[] = [
  // ── greeting ──
  { regex: new RegExp(`^(hi|hello|hey|howdy|greetings|good\\s*(morning|afternoon|evening|day)|what'?s\\s*up|sup|yo|নমস্কার|আসসালামু|ওয়ালাইকুম|সালাম|হ্যালো|হাই|হেলো)(?![\\p{L}\\p{N}_])`, "iu"), route: { intent: "greeting", department: "customer_experience" } },
  // ── farewell ──
  { regex: new RegExp(`^(bye|goodbye|see\\s*you|talk\\s*to\\s*you\\s*late?r|take\\s*care|আল্লাহ\\s*হাফেজ|খোদা\\s*হাফেজ|বাই|বিদায়)(?![\\p{L}\\p{N}_])`, "iu"), route: { intent: "farewell", department: "customer_experience" } },
  // ── product_inquiry (courses, services, products) ──
  { regex: /(কি\s*কোর্স|কোন\s*কোর্স|course|training|প্রশিক্ষণ|শিখতে\s*চাই|পড়তে\s*চাই|program|প্রোগ্রাম|product|পণ্য|service|সেবা|offer|অফার|কি\s*আছে|কী\s*আছে|বিস্তারিত|details|কাজ\s*কি|বিষয়ে\s*বলুন)/i, route: { intent: "product_inquiry", department: "sales" } },
  // ── price_inquiry ──
  { regex: /(দাম|মূল্য|price|cost|কত\s*টাকা|কত\s*দাম|রেট|rate|চার্জ|charge|fee|fee|budget|বাজেট|সাশ্রয়ী|affordable|cheap|cheapest|cheaper|discount|ডিসকাউন্ট|ছাড়)/i, route: { intent: "price_inquiry", department: "sales" } },
  // ── purchase (ready to buy) ──
  { regex: /(কিনতে\s*চাই|kinit?\s*chai|kine\s*nibo|order\s*করতে\s*চাই|buy\s*now|আর্ডার|enroll|এনরোল|join\s*now|register\s*me|একটিভেট|activate|subscription|সাবস্ক্রাইব|পেমেন্ট|payment|পে\s*করবো|pay\s*now|checkout|চেকআউট)/i, route: { intent: "purchase", department: "sales" } },
  // ── registration (want to join/signup) ──
  { regex: /(জয়েন|join|register|রেজিস্টার|সাইন\s*আপ|sign\s*up|সাইনআপ|মেম্বার\s*হতে\s*চাই|member\s*হতে|অ্যাকাউন্ট\s*খুলতে\s*চাই|account|খুলতে\s*চাই|আইডি\s*খুলতে|start|স্টার্ট|how\s*to\s*join|কিভাবে\s*জয়েন|কেমনে\s*জইন|যোগ\s*দিতে\s*চাই)/i, route: { intent: "registration", department: "member_success" } },
  // ── support (help/issue/problem) ──
  { regex: /(help|সাহায্য|problem|সমস্যা|issue|ইস্যু|error|এরর|ভুল|bug|বাগ|fix|ফিক্স|not\s*working|কাজ\s*করছে\s*না|কাজ\s*করে\s*না|support|সাপোর্ট|টেকনিক্যাল|technical|গড়মিল|কিছু\s*ঠিক\s*হচ্ছে\s*না)/i, route: { intent: "support", department: "customer_experience" } },
  // ── complaint (angry/dissatisfied) ──
  { regex: /(complaint|কমপ্লেইন|অভিযোগ|fraud|ভুয়া|scam|প্রতারনা|cheat|ঠকানো|ঠকায়|রেফান্ড|refund|ফেরত|money\s*back|টাকা\s*ফেরত|খারাপ|bad|worst|noc?t\s*good|ভালো\s*না|ক্ষতি|harm|missleading|মিসলিডিং|থাগি|ঠগি)/i, route: { intent: "complaint", department: "psychology" } },
  // ── feedback (suggestion/opinion/review) ──
  { regex: /(feedback|ফিডব্যাক|suggestion|সাজেশন|opinion|মতামত|review|রিভিউ|পর্যালোচনা|recommend|রেকমেন্ড|উন্নতি|improve|improvement|ভালো\s*লাগছে|ভালো\s*লাগে)/i, route: { intent: "feedback", department: "customer_experience" } },
  // ── referral (team/invite/refer) ──
  { regex: /(refer|রেফার|referral|রেফারেল|invite|ইনভাইট|team|টিম|team\s*member|টিম\s*মেম্বার|downline|ডাউনলাইন|আন্ডার|under\s*me|লিংক|link|affiliate|এফিলিয়েট|বুকিশ|booking|referral\s*link|রেফারেল\s*লিংক)/i, route: { intent: "referral", department: "sales" } },
  // ── commission_inquiry (commission/earnings) ──
  { regex: /(commission|কমিশন|income|আয়|earn|আয়\s*করে|কত\s*আয়|কত\s*টাকা\s*পাবো|profit|লাভ|লাভের\s*হিসাব|বোনাস|bonus|ইনসেনটিভ|incentive|পেমেন্ট\s*স্ট্রাকচার)/i, route: { intent: "commission_inquiry", department: "member_success" } },
  // ── withdrawal (withdraw money) ──
  { regex: /(withdraw|উইথড্র|withdrawal|উত্তোলন|টাকা\s*তোলা|টাকা\s*উঠানো|টাকা\s*পাবো\s*কখন|কিভাবে\s*টাকা\s*উঠাবো|কেমনে\s*টাকা\s*উঠামু|পেমেন্ট\s*পাবো\s*কখন|balance\s*transfer|ব্যাংক|bank|bkash|বিকাশ|নগদ|nagad|রকেট|rocket)/i, route: { intent: "withdrawal", department: "operations" } },
  // ── training ──
  { regex: /(training|ট্রেনিং|learn|শিখতে\s*চাই|ক্লাস|class|কোর্স\s*করে|study|পড়া|পড়াশোনা|lesson|লেসন|টিউটোরিয়াল|tutorial|guide|গাইড|কিভাবে\s*শিখবো|কেমনে\s*শিকমু)/i, route: { intent: "training", department: "member_success" } },
  // ── motivation ──
  { regex: /(motivation|মোটিভেশন|উৎসাহ|উদ্বুদ্ধ|confidence|আত্মবিশ্বাস|ভয়\s*লাগছে|ভয়\s*পাই|সাহস|সপ্ন|স্বপ্ন|হতাশ|হতাশা|উদাস|মন\s*খারাপ|depressed|ডিপ্রেশন|এগোতে\s*পারছি\s*না|পিছিয়ে|পিছাইয়া|সফল\s*হতে\s*চাই|change\s*mylife|life\s*change)/i, route: { intent: "motivation", department: "psychology" } },
];

export function classifyIntentFree(text: string): IntentRoute | null {
  const lower = text.toLowerCase().trim();
  for (const { regex, route } of INTENT_PATTERNS) {
    if (regex.test(lower)) return route;
  }
  return null;
}

export { INTENT_PATTERNS };
export type { IntentRoute };

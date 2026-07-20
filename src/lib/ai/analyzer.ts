export type Mood = "enthusiastic" | "neutral" | "skeptical" | "bored" | "distracted";
export type Dialect = "dhaka" | "chittagong" | "sylhet" | "rural" | "standard";
export type Religion = "muslim" | "hindu" | "christian" | "unknown";
export type TrustLevel = "trusting" | "neutral" | "defensive" | "suspicious";
export type ControlResistance = "low" | "medium" | "high";
export type ManipulationVulnerability = "low" | "medium" | "high";
export type FearProfile = "financial_loss" | "social_status" | "being_deceived" | "losing_autonomy" | "unknown";
export type MaskStatus = "open" | "partial" | "masked";
export type CommStyle = "analytical" | "emotional" | "direct" | "warm" | "standard";
export type TrustReadiness = "ready" | "needs_time" | "skeptical";
export type DecisionMode = "system1_fast" | "system2_analytical" | "mixed";
export type SpendStyle = "tightwad" | "spendthrift" | "balanced";
export type AdlerianNeed = "victim_mindset" | "people_pleasing" | "postponed_happiness" | "superiority_inferiority" | "lack_of_belonging" | "none";
export type BuyerPersonality = "apathetic" | "self_actualizing" | "analytical" | "relater" | "driver" | "socialized" | "unknown";
export type BuyingMotivation = "gain_oriented" | "fear_oriented" | "mixed" | "unknown";
export type CustomerNeed = "money" | "security" | "being_liked" | "status_prestige" | "health_fitness" | "praise_recognition" | "power_influence" | "leading_field" | "love_companionship" | "personal_growth" | "personal_transformation" | "unknown";

/* ===== KOTLER MARKETING TYPES (Philip Kotler — Marketing Management) ===== */
export type MarketSegment = "geographic" | "demographic" | "psychographic" | "behavioral" | "unknown";
export type TargetingStrategy = "undifferentiated" | "differentiated" | "concentrated" | "micromarketing" | "unknown";
export type BrandPosition = "value_leader" | "quality_leader" | "innovation_leader" | "service_leader" | "cost_leader" | "niche_leader" | "unknown";
export type ProductLifecycleStage = "introduction" | "growth" | "maturity" | "decline" | "unknown";
export type PricingStrategy = "skimming" | "penetration" | "competitive" | "value_based" | "cost_plus" | "psychological" | "unknown";
export type CommunicationChannel = "advertising" | "public_relations" | "sales_promotion" | "direct_marketing" | "digital" | "events" | "personal_selling" | "word_of_mouth" | "unknown";
export type LoyaltyStage = "suspect" | "prospect" | "first_time" | "repeat" | "loyal" | "advocate" | "unknown";
export type ServiceQuality = "tangibility" | "reliability" | "responsiveness" | "assurance" | "empathy" | "unknown";
export type GrowthStrategy = "market_penetration" | "market_development" | "product_development" | "diversification" | "unknown";
export type BuyingSituation = "straight_rebuy" | "modified_rebuy" | "new_task" | "unknown";
export type CompetitivePosition = "market_leader" | "market_challenger" | "market_follower" | "market_nicher" | "unknown";
export type AdopterCategory = "innovator" | "early_adopter" | "early_majority" | "late_majority" | "laggard" | "unknown";
export type ChannelLevel = "direct" | "one_level" | "two_level" | "three_level" | "unknown";
export type GlobalEntryMode = "export" | "licensing" | "joint_venture" | "direct_investment" | "unknown";
export type CSRDimension = "people" | "planet" | "profit" | "unknown";

const MOOD_PATTERNS: Record<Mood, RegExp[]> = {
  enthusiastic: [
    /\b(?:great|excellent|wonder|amazing|awesome|fantastic|thank|thanks|dhan|ধন্যবাদ|চমৎকার|দারুন|ভাল)\b/i,
    /(?:interested|আগ্রহী|চাই|চায়)\b.{0,30}(?:join|যোগ|করব|start|শুরু)/i,
    /(?:tell me more|আরও বলুন|বিস্তারিত|details?|how to join)/i,
  ],
  neutral: [
    /\b(?:ok|okay|ঠিক আছে|হ্যা|হ্যাঁ|ji|জি|ki|কি|accha|আচ্ছা)\b/i,
    /^.{1,30}\?$/,
    /(?:what is|কি|কী|who|কে|where|কোথায়|when|কখন)/i,
  ],
  skeptical: [
    /\b(?:really|সত্যি|সত্যিই|নিশ্চিত|true|จริง)\b/i,
    /(?:scam|fraud|প্রতারণা|ভুয়া|ঠকা|cheat|fake)/i,
    /(?:doubt|সন্দেহ|কনফিউজড|confus)/i,
    /(?:prove|প্রমাণ|show me|দেখান|example|উদাহরণ)/i,
    /(?:too good|এত ভাল|suspicious|সন্দেহজনক)/i,
  ],
  bored: [
    /\b(?:hmm|হুম|hm|ok ok|tell me|bolen|বলেন|shune|শুনে)\b/i,
    /^.{1,10}$/,  // very short replies
    /(?:later|পরে|after|after|time|সময়).{0,20}(?:no|nι|না|নাই)/i,
  ],
  distracted: [
    /\b(?:busy|ব্যস্ত|later|পরে|call me|ফোন|phone|time|সময়|now|এখন|নাই)\b/i,
    /(?:no time|সময় নেই|free নাই|later|পরে বলবেন)/i,
    /(?:work|কাজ|job|চাকরি).{0,20}(?:doing|করছি|busy|ব্যস্ত)/i,
  ],
};

const DIALECT_PATTERNS: Record<Dialect, RegExp[]> = {
  dhaka: [/\b(?:আইচ্ছা|কইত|কইলাম|বইলা|মইন্যা|হইবো|খাইত|যাইত|কইতাছ)\b/i],
  chittagong: [/\b(?:হুনি|হুনছ|হুনবা|কিতা|গরর|ঘুরর|মারে|তুইলা|ফাটায়|নিগর|বাইয়া)\b/i],
  sylhet: [/\b(?:বেরা|বেরি|হেলা|হেলি|হেইতা|খালি|খন|বাইরে|গরিব|হইবো|মারি)\b/i],
  rural: [/\b(?:গাঁও|গেরাম|মফস্বল|বিলাত|গিরিব|গিরিব|ন rid)\b/i],
  standard: [],
};

const RELIGION_PATTERNS: Record<Religion, RegExp[]> = {
  muslim: [
    /\b(?:allah|আল্লাহ|inshaallah|ইনশাআল্লাহ|mashaallah|মাশাআল্লাহ|alhamdulillah|আলহামদুলিল্লাহ|assalamu|আসসালামু)\b/i,
    /\b(?:namaz|নামাজ|roja|রোজা|kuran|কুরআন|masjid|মসজিদ|eid|ঈদ)\b/i,
    /\b(?:muhammad|মুহাম্মদ|s|স:)|\b(?:sal allahu)\b/i,
  ],
  hindu: [
    /\b(?:nomoskar|নমস্কার|hari|হরি|krishna|কৃষ্ণ|shiva|শিব|durga|দুর্গা)\b/i,
    /\b(?:mandir|মন্দির|puja|পূজা|durgapuja|দুর্গাপূজা)\b/i,
  ],
  christian: [
    /\b(?:jesus|যীশু|christ|খ্রিস্ট|church|গির্জা|bible|বাইবেল)\b/i,
    /\b(?:easter|ইস্টার|christmas|ক্রিসমাস)\b/i,
  ],
  unknown: [],
};

const PAIN_POINT_PATTERNS: Record<string, RegExp[]> = {
  no_income: [
    /(?:income|money|earn|income|টাকা|আয়|রোজগার).{0,30}(?:no|not|none|নাই|না|নেই)/i,
    /(?:no|not|none|নাই|না).{0,30}(?:income|money|work|job|চাকরি|কাজ)/i,
    /(?:unemployed|বেকার|কাজ নেই)/i,
    /(?:struggling|স্ট্রাগল|কষ্ট).{0,20}(?:financially|money|টাকা)/i,
  ],
  scam_fear: [
    /(?:scam|fraud|fake|cheat|প্রতারণা|ভুয়া|ঠক)/i,
    /(?:trust|বিশ্বাস).{0,20}(?:not|no|নাই)/i,
    /(?:suspicious|সন্দেহজনক|সন্দেহ)/i,
    /(?:legit|real?.{0,10}(?:program|business|কাজ|বিজনেস))/i,
  ],
  pricing: [
    /(?:price|cost|fee|charge|মূল্য|দাম|খরচ|টাকা).{0,20}(?:high|more|বেশি|ঢের)/i,
    /(?:how much|কত টাকা)/i,
    /(?:expensive|দামী|ব্যয়বহুল)/i,
    /(?:money back| refund|টাকা ফেরত)/i,
  ],
  no_skill: [
    /(?:no|don't|can't|নাই|পারি না|না জানি).{0,30}(?:skill|expert|experience|experience|দক্ষতা|অভিজ্ঞতা)/i,
    /(?:teach?|training|প্রশিক্ষণ|শিখতে)/i,
    /(?:beginner|new|start|শুরু|নতুন)/i,
    /(?:computer|tech|টেক).{0,20}(?:no|not|নাই)/i,
  ],
  no_time: [
    /(?:no|not|busy|free|সময়|time|ব্যস্ত).{0,20}(?:time|সময়)/i,
    /(?:full time|full-time|whole day|সারাদিন)/i,
    /(?:job|চাকরি).{0,20}(?:time|সময়)/i,
    /(?:family|পরিবার|kids|ছেলে|মেয়ে).{0,20}(?:time|সময়)/i,
  ],
};

const INTEREST_PATTERNS: Record<string, RegExp[]> = {
  freelancing: [
    /(?:freelanc|ফ্রিল্যান্স)/i,
    /(?:online.{0,10}(?:work|job|earn|income|কাজ|আয়))/i,
    /(?:fiverr|upwork|freelancer)/i,
    /(?:remote.{0,10}(?:work|job))/i,
  ],
  digital_marketing: [
    /(?:marketing|মার্কেটিং)/i,
    /(?:social media|সোশ্যাল মিডিয়া|facebook|youtube)/i,
    /(?:ads?|advertise|প্রচার|বিজ্ঞাপন)/i,
    /(?:seo|digital)/i,
  ],
  web_design: [
    /(?:web|website|ওয়েবসাইট|ওয়েব)/i,
    /(?:design|ডিজাইন)/i,
    /(?:wordpress|shopify)/i,
    /(?:developer|ডেভেলপার)/i,
  ],
  video_editing: [
    /(?:video|ভিডিও)/i,
    /(?:edit|এডিট)/i,
    /(?:youtube|টিউব)/i,
    /(?:content.{0,10}(?:create|make))/i,
  ],
  programming: [
    /(?:program|code|coding|প্রোগ্রাম|কোড)/i,
    /(?:app|application|mobile.{0,10}(?:dev|app))/i,
    /(?:software|সফটওয়্যার)/i,
    /(?:python|javascript|php|react)/i,
  ],
  spoken_english: [
    /(?:english|ইংরেজি|ইংলিশ)/i,
    /(?:spoken|speaking|বলা)/i,
    /(?:language|ভাষা|ল্যাঙ্গুয়েজ)/i,
    /(?:communication|কমিউনিকেশন)/i,
  ],
};

const TRUST_PATTERNS: Record<TrustLevel, RegExp[]> = {
  trusting: [
    /\b(?:trust|বিশ্বাস|believe|আস্থা|confident|আত্মবিশ্বাস)\b/i,
    /(?:thank you|ধন্যবাদ|great|চমৎকার).{0,30}(?:help|সাহায্য|guide|গাইড)/i,
    /(?:sure|অবশ্যই|ok|ঠিক আছে).{0,20}(?:tell me|বলুন|আপনিই|you decide)/i,
  ],
  neutral: [
    /\b(?:ok|okay|ঠিক আছে|হ্যাঁ|accha|আচ্ছা|ji|জি)\b/i,
    /(?:tell me|বলুন|what is|কি|how|কিভাবে).{0,20}(?:more|আরও)/i,
    /^.{3,30}\?$/,
  ],
  defensive: [
    /\b(?:why|কেন|how|কিভাবে).{0,30}(?:trust|বিশ্বাস|believe|আস্থা|sure|নিশ্চিত)\b/i,
    /(?:not sure|নিশ্চিত না| doubt|সন্দেহ|confus|কনফিউজ)/i,
    /(?:need|চাই).{0,20}(?:proof|প্রমাণ|time|সময়|think|ভাবি)/i,
    /(?:too good|এত ভাল|suspicious|সন্দেহজনক|scam|প্রতারণা)/i,
  ],
  suspicious: [
    /\b(?:scam|fraud|cheat|fake|ভুয়া|প্রতারণা|ঠক)\b/i,
    /(?:prove|প্রমাণ|show.{0,10}evidence|legal|আইন).{0,30}(?:first|আগে|document|কাগজ)/i,
    /(?:police|থানা|court|কোর্ট|lawyer|আইনজীবী|complaint|অভিযোগ)/i,
    /(?:don't|না).{0,10}(?:trust|বিশ্বাস|believe|আস্থা)/i,
  ],
};

const CONTROL_RESISTANCE_PATTERNS: Record<ControlResistance, RegExp[]> = {
  low: [
    /\b(?:you decide|আপনিই বলুন|whatever|যাই বলেন|up to you)\b/i,
    /(?:tell me|বলুন|guide|গাইড|suggest|পরামর্শ).{0,20}(?:what to|কি|what should)/i,
    /(?:please|প্লিজ|অনুগ্রহ).{0,20}(?:help|সাহায্য|show|দেখান)/i,
  ],
  medium: [
    /\b(?:ok but|ঠিক আছে কিন্তু|yes but|হ্যাঁ কিন্তু|maybe|হয়তো)\b/i,
    /(?:let me|আমি.{0,10}(?:think|ভাবি|see|দেখি|check|চেক))/i,
    /(?:need.{0,20}(?:info|তথ্য|details|বিস্তারিত|understand|বুঝি))/i,
  ],
  high: [
    /\b(?:no|না|nah|nι)\b/i,
    /(?:don't|করবেন না|stop|বন্ধ|enough|ঢের|my choice|আমার সিদ্ধান্ত)/i,
    /(?:i will|আমি.{0,10}(?:decide|সিদ্ধান্ত|know|জানি|choose|নেব))/i,
    /(?:not interested|আগ্রহী না|busy|ব্যস্ত|later|পরে).{0,20}(?:no|না|don't|নাই)/i,
  ],
};

const MANIPULATION_VULNERABILITY_PATTERNS: Record<ManipulationVulnerability, RegExp[]> = {
  low: [
    /\b(?:prove|প্রমাণ|evidence|document|কাগজ|legal|আইনি)\b/i,
    /(?:check|চেক|verify|ভেরিফাই|research|রিসার্চ).{0,20}(?:first|আগে|before|পূর্বে)/i,
    /(?:scam|fraud|fake|প্রতারণা).{0,20}(?:detect|identify|চেনা)/i,
    /\b(?:reference|রেফারেন্স|source|উৎস|link|লিংক)\b/i,
  ],
  medium: [
    /\b(?:trust|বিশ্বাস|believe|আস্থা).{0,20}(?:you|আপনাকে|them|তাদের)\b/i,
    /(?:ok tell me|বলুন|show me|দেখান|interested|আগ্রহী)/i,
    /(?:how much|কত|price|দাম|cost|খরচ|join|যোগদান)/i,
  ],
  high: [
    /\b(?:please|প্লিজ).{0,20}(?:help|সাহায্য|tell|বলুন|show|দেখান)\b/i,
    /(?:urgent|জরুরি|immediate|এখনি|quick|দ্রুত).{0,20}(?:need|চাই|help|সাহায্য)/i,
    /(?:desperate|হতাশ|struggl|স্ট্রাগল|suffer|কষ্ট).{0,20}(?:money|টাকা|income|আয়)/i,
    /(?:any.{0,10}(?:help|সাহায্য|work|কাজ|job|চাকরি)).{0,20}(?:please|প্লিজ|need|চাই)/i,
  ],
};

const FEAR_PATTERNS: Record<FearProfile, RegExp[]> = {
  financial_loss: [
    /\b(?:money|টাকা|income|আয়).{0,30}(?:loss|ক্ষতি|waste|নষ্ট|risk|ঝুঁকি)\b/i,
    /(?:savings|সঞ্চয়|investment|বিনিয়োগ).{0,20}(?:lost|হারিয়ে|gone|নেই|risk|ঝুঁকি)/i,
    /(?:expensive|দামী|costly|ব্যয়বহুল|waste|নষ্ট).{0,20}(?:money|টাকা|taka|টাকা)/i,
    /(?:poor|গরিব|beggar|ভিক্ষুক).{0,20}(?:become|হয়ে|become|হওয়া)/i,
  ],
  social_status: [
    /\b(?:people|মানুষ|লোক).{0,20}(?:think|ভাববে|say|বলবে|judge|বিচার)\b/i,
    /(?:embarrass|লজ্জা|shame|অপমান|prestige|মর্যাদা|izzat|ইজ্জত)/i,
    /(?:family|পরিবার|parents|বাবা|mother|মা).{0,20}(?:ashamed|লজ্জিত|upset|মনঃক্ষুণ্ণ)/i,
    /(?:society|সমাজ|community|কমিউনিটি|village|গ্রাম).{0,20}(?:gossip|গসিপ|talk|কথা)/i,
  ],
  being_deceived: [
    /\b(?:scam|fraud|cheat|fake|প্রতারণা|ভুয়া|ঠক)\b/i,
    /(?:trust|বিশ্বাস|believe|আস্থা).{0,20}(?:broken|ভাঙা|betray|প্রতারণা|lost|হারানো)/i,
    /(?:fool|বোকা|foolish|মূর্খ).{0,20}(?:make|বানানো|treated|ব্যবহার)/i,
    /(?:deceive|প্রতারণা|mislead|ভুল.{0,10}পথে|dishonest|অসৎ)/i,
  ],
  losing_autonomy: [
    /\b(?:control|নিয়ন্ত্রণ|freedom|স্বাধীনতা|choice|পছন্দ|option|অপশন)\b/i,
    /(?:trap|ফাঁদ|bind|বাঁধা|pressure|চাপ|force|জোর).{0,20}(?:me|আমাকে|into|করানো)/i,
    /(?:my.{0,10}(?:decision|সিদ্ধান্ত|life|জীবন|choice|পছন্দ))/i,
    /(?:don't|না).{0,20}(?:control|নিয়ন্ত্রণ|dominate|আধিপত্য|tell.{0,10}what|বলে)/i,
  ],
  unknown: [],
};

const MASK_PATTERNS: Record<MaskStatus, RegExp[]> = {
  open: [
    /\b(?:honest|সত্যি|truth|সত্য|real|আসল|actually|আসলে)\b/i,
    /(?:struggl|স্ট্রাগল|struggle|কষ্ট|hard|কঠিন|difficult|সমস্যা)/i,
    /(?:feel|অনুভব|feelings|আবেগ|emotion|অনুভূতি).{0,30}(?:lonely|একা|sad|দুঃখ|frustrat|হতাশ)/i,
    /(?:need|চাই|want|চাই|require|দরকার).{0,20}(?:help|সাহায্য|support|সাপোর্ট|guidance|পরামর্শ)/i,
  ],
  partial: [
    /\b(?:fine|ভালো|ok|ঠিক|alright|আচ্ছা)\b/i,
    /(?:normal|স্বাভাবিক|same|একই|usual|সাধারণ).{0,20}(?:nothing|কিছু না|everything|সব ঠিক)/i,
    /(?:i'm ok|আমি ঠিক|no problem|সমস্যা নেই|it's ok|ঠিক আছে).{0,20}(?:but|কিন্তু)/i,
  ],
  masked: [
    /\b(?:great|চমৎকার|perfect|পারফেক্ট|excellent|excellent|all good|সব ভালো)\b/i,
    /(?:everything|সবকিছু).{0,20}(?:fine|ভালো|great|চমৎকার|perfect|পারফেক্ট)/i,
    /(?:no.{0,10}(?:problem|সমস্যা|issue|কিছু|worry|চিন্তা))/i,
    /(?:never|কখনো না|nothing|কিছু না|no need|দরকার নেই).{0,20}(?:better|ভালো|fine|ঠিক)/i,
  ],
};

export function detectLanguage(text: string): "bn" | "en" | "mixed" {
  const bengaliChars = text.match(/[\u0980-\u09FF]/g);
  if (!bengaliChars) return "en";
  const ratio = bengaliChars.length / text.length;
  if (ratio > 0.3) return "bn";
  if (ratio > 0.05) return "mixed";
  return "en";
}

export function analyzePainPoints(text: string): string[] {
  const found: string[] = [];
  for (const [pain, patterns] of Object.entries(PAIN_POINT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        found.push(pain);
        break;
      }
    }
  }
  return found;
}

export function analyzeInterests(text: string): string[] {
  const found: string[] = [];
  for (const [interest, patterns] of Object.entries(INTEREST_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        found.push(interest);
        break;
      }
    }
  }
  return found;
}

export function detectMood(text: string): Mood {
  const scores: Record<Mood, number> = { enthusiastic: 0, neutral: 0, skeptical: 0, bored: 0, distracted: 0 };
  for (const [mood, patterns] of Object.entries(MOOD_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) scores[mood as Mood] += 1.5;
    }
  }
  const len = text.length;
  if (len < 15) scores.bored += 1;
  if (text.includes("?")) scores.neutral += 0.5;
  if (text.includes("!")) scores.enthusiastic += 1;
  if (/\b(?:no|na|nah|ন|না)\b/i.test(text) && /\b(?:but|kintu|কিন্তু|তবে)\b/i.test(text)) scores.skeptical += 2;
  let best: Mood = "neutral";
  let bestScore = 0;
  for (const [mood, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = mood as Mood; }
  }
  return best;
}

export function detectDialect(text: string): Dialect {
  for (const [dialect, patterns] of Object.entries(DIALECT_PATTERNS)) {
    if (dialect === "standard") continue;
    for (const pattern of patterns) {
      if (pattern.test(text)) return dialect as Dialect;
    }
  }
  return "standard";
}

export function detectReligion(text: string): Religion {
  for (const [religion, patterns] of Object.entries(RELIGION_PATTERNS)) {
    if (religion === "unknown") continue;
    for (const pattern of patterns) {
      if (pattern.test(text)) return religion as Religion;
    }
  }
  return "unknown";
}

export function detectTrustLevel(text: string): TrustLevel {
  const scores: Record<TrustLevel, number> = { trusting: 0, neutral: 0, defensive: 0, suspicious: 0 };
  for (const [level, patterns] of Object.entries(TRUST_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) scores[level as TrustLevel] += 1.5;
    }
  }
  const len = text.length;
  if (len < 10) scores.neutral += 1;
  if (/\b(?:but|kintu|কিন্তু|তবে)\b/i.test(text) && /\b(?:ok|ঠিক)\b/i.test(text)) scores.defensive += 1;
  if (text.includes("??") || text.includes("!!")) scores.suspicious += 0.5;
  let best: TrustLevel = "neutral";
  let bestScore = 0;
  for (const [level, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = level as TrustLevel; }
  }
  return best;
}

export function detectControlResistance(text: string): ControlResistance {
  const scores: Record<ControlResistance, number> = { low: 0, medium: 0, high: 0 };
  for (const [level, patterns] of Object.entries(CONTROL_RESISTANCE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) scores[level as ControlResistance] += 1.5;
    }
  }
  if (text.includes("?")) scores.medium += 0.5;
  if (/\b(?:my|আমার|i|আমি)\b/i.test(text) && /\b(?:want|চাই|will|করব|need|দরকার)\b/i.test(text)) scores.high += 1;
  let best: ControlResistance = "medium";
  let bestScore = 0;
  for (const [level, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = level as ControlResistance; }
  }
  return best;
}

export function detectManipulationVulnerability(text: string): ManipulationVulnerability {
  const scores: Record<ManipulationVulnerability, number> = { low: 0, medium: 0, high: 0 };
  for (const [level, patterns] of Object.entries(MANIPULATION_VULNERABILITY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) scores[level as ManipulationVulnerability] += 1.5;
    }
  }
  const urgent = /\b(?:urgent|জরুরি|now|এখন|fast|দ্রুত|quick|তাড়াতাড়ি)\b/i.test(text);
  const desperate = /\b(?:please|প্লিজ|beg|ভিক্ষা|help.{0,10}me|আমাকে সাহায্য)\b/i.test(text);
  if (urgent && desperate) scores.high += 2;
  if (text.includes("?")) scores.medium += 0.5;
  let best: ManipulationVulnerability = "medium";
  let bestScore = 0;
  for (const [level, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = level as ManipulationVulnerability; }
  }
  return best;
}

export function detectFearProfile(text: string): FearProfile {
  for (const [fear, patterns] of Object.entries(FEAR_PATTERNS)) {
    if (fear === "unknown") continue;
    for (const pattern of patterns) {
      if (pattern.test(text)) return fear as FearProfile;
    }
  }
  return "unknown";
}

export function detectMaskStatus(text: string): MaskStatus {
  const scores: Record<MaskStatus, number> = { open: 0, partial: 0, masked: 0 };
  for (const [status, patterns] of Object.entries(MASK_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) scores[status as MaskStatus] += 1.5;
    }
  }
  const len = text.length;
  if (len < 20) scores.masked += 1;
  if (len > 50) scores.open += 0.5;
  if (text.includes("?")) scores.partial += 0.5;
  let best: MaskStatus = "partial";
  let bestScore = 0;
  for (const [status, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = status as MaskStatus; }
  }
  return best;
}

const COMM_STYLE_PATTERNS: Record<CommStyle, RegExp[]> = {
  analytical: [/\b(?:because|reason|logic|data|evidence|prove|fact|figure|percent|specifically|compare|analysis)\b/i, /\d+%/],
  emotional: [/\b(?:feel|felt|hope|wish|dream|scared|worried|excited|love|hate|happy|sad|cry|heart|soul|believe|trust)\b/i, /(?:আমার মনে হয়|আমি বিশ্বাস করি|ভয়|আশা|স্বপ্ন)/i],
  direct: [/\b(?:tell me|give me|show me|i want|i need|now|fast|quick|straight|urgent|important)\b/i, /^.{0,50}\?$/],
  warm: [/\b(?:please|thanks|thank|appreciate|bless|kind|nice|lovely|wonderful|friend|brother|sister|bhai|apa)\b/i, /(?:ভাই|বোন|আপা|দাদা|ধন্যবাদ|please)/i],
  standard: [],
};

const TRUST_READINESS_PATTERNS: Record<TrustReadiness, RegExp[]> = {
  ready: [/\b(?:tell me more|how to|i want|interested|join|যোগ|শুরু|interested|আগ্রহী)\b/i, /(?:how can i|kivabe|কিভাবে|what to do|ki korte hobe)/i],
  needs_time: [/\b(?:later|maybe|think|consider|after|next|soon|soon|time|সময়|পরে|চিন্তা)\b/i, /(?:dekhi|দেখি|vabi|ভাবি|need time)/i],
  skeptical: [/\b(?:really|sure|scam|fraud|doubt|prove|show|true|সত্যি|নিশ্চিত|প্রতারণা|সন্দেহ)\b/i, /(?:too good|trust issue|বিশ্বাস হয় না|previous|আগে)/i],
};

export function detectCommStyle(text: string): CommStyle {
  const scores: Record<CommStyle, number> = { analytical: 0, emotional: 0, direct: 0, warm: 0, standard: 0 };
  for (const [style, patterns] of Object.entries(COMM_STYLE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) scores[style as CommStyle] += 2;
    }
  }
  const words = text.split(/\s+/).length;
  if (words > 30) scores.analytical += 1;
  if (text.includes("?") && text.length < 60) scores.direct += 1;
  if (scores.analytical > 0 || scores.emotional > 0 || scores.direct > 0 || scores.warm > 0) {
    let best: CommStyle = "standard"; let bestScore = 0;
    for (const [s, sc] of Object.entries(scores)) {
      if (sc > bestScore) { bestScore = sc; best = s as CommStyle; }
    }
    return best;
  }
  return "standard";
}

export function detectTrustReadiness(text: string): TrustReadiness {
  const scores: Record<TrustReadiness, number> = { ready: 0, needs_time: 0, skeptical: 0 };
  for (const [status, patterns] of Object.entries(TRUST_READINESS_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) scores[status as TrustReadiness] += 2;
    }
  }
  let best: TrustReadiness = "needs_time"; let bestScore = 0;
  for (const [s, sc] of Object.entries(scores)) {
    if (sc > bestScore) { bestScore = sc; best = s as TrustReadiness; }
  }
  return best;
}

const SPEND_STYLE_PATTERNS: Record<SpendStyle, RegExp[]> = {
  tightwad: [
    /\b(?:price|cost|expense|save|saving|budget|cheap|discount|deal|afford|expensive|costly|overpriced|waste|economy|cheapest)\b/i,
    /(?:how much|koto|দাম|কত টাকা|মূল্য|খরচ|সস্তা|দামী|ডিসকাউন্ট|ছাড়|কম দাম)/i,
    /(?:return|investment|roi|worth it|value for money|মূল্যায়ন)/i,
  ],
  spendthrift: [
    /\b(?:quality|premium|exclusive|best|top|luxury|elite|worth|investment|value|superior|unique|special|limited)\b/i,
    /(?:এক্সক্লুসিভ|প্রিমিয়াম|সেরা|উৎকৃষ্ট|বিশেষ|গুণগত)/i,
    /(?:i deserve|i want the best|life is short|you get what you pay|treat myself)/i,
  ],
  balanced: [],
};

export function detectSpendStyle(text: string): SpendStyle {
  const tw = SPEND_STYLE_PATTERNS.tightwad.reduce((s, p) => s + (p.test(text) ? 1 : 0), 0);
  const st = SPEND_STYLE_PATTERNS.spendthrift.reduce((s, p) => s + (p.test(text) ? 1 : 0), 0);
  if (tw > st && tw >= 2) return "tightwad";
  if (st > tw && st >= 2) return "spendthrift";
  return "balanced";
}

const DECISION_MODE_PATTERNS: Record<DecisionMode, RegExp[]> = {
  system1_fast: [
    /\b(?:yes|no|ok|tell me|want|need|now|right now|i like|interested|give me|show me|how much|koto|দাম|কত|cost)\b/i,
    /(?:excited|worried|scared|happy|sad|angry|love|hate|feel|ভয়|চাই|দরকার|এখনি|তাড়াতাড়ি)/i,
    /^.{1,50}$/,  // short messages
  ],
  system2_analytical: [
    /\b(?:compare|specific|exactly|reason|because|explain|difference|why|how exactly|evidence|data|research|details)\b/i,
    /\b(?:percent|percentage|ratio|average|statistics|analysis|analyz|evaluate|assess)\b/i,
    /\b(?:tell more|details|বিস্তারিত|ডিটেল|compare|তুলনা|specification|স্পেসিফিকেশন)\b/i,
    /.{200,}/,  // long messages
  ],
  mixed: [],
};

export function detectDecisionMode(text: string): DecisionMode {
  const s1Score = DECISION_MODE_PATTERNS.system1_fast.reduce((s, p) => s + (p.test(text) ? 1 : 0), 0);
  const s2Score = DECISION_MODE_PATTERNS.system2_analytical.reduce((s, p) => s + (p.test(text) ? 1 : 0), 0);
  const words = text.split(/\s+/).length;
  const hasQuestion = text.includes("?");
  if (s1Score >= 2 && s2Score <= 1 && words < 30) return "system1_fast";
  if (s2Score >= 2 || (words > 40 && hasQuestion)) return "system2_analytical";
  if (s1Score === s2Score && s1Score > 0) return "mixed";
  if (words < 15) return "system1_fast";
  return "mixed";
}

const ADLERIAN_PATTERNS: Record<AdlerianNeed, RegExp[]> = {
  victim_mindset: [
    /(?:i can't because|আমি পারি না কারণ|আমার দ্বারা হবে না|ভাগ্য খারাপ|আমার luck খারাপ)/i,
    /(?:past|অতীত|আগে).{0,30}(?:ruined|নষ্ট|ক্ষতি|damage|ভেঙে|বাধা)/i,
    /(?:no choice|choice নাই|no option|option নাই|বাধ্য|উপায় নেই)/i,
    /(?:always|সবসময়).{0,20}(?:bad|খারাপ|problem|সমস্যা|misfortune|দুর্ভাগ্য)/i,
  ],
  people_pleasing: [
    /(?:what will people say|লোক কী বলবে|মানুষ কী ভাববে|সমাজ কী বলবে)/i,
    /(?:everyone|সবাই).{0,20}(?:approve|accept|agree|মত|ভাল|পছন্দ)/i,
    /(?:ashamed|লজ্জা|শরম|face|মুখ দেখাব).{0,20}(?:family|পরিবার|people|লোক)/i,
    /(?:disappoint|নিরাশ|upset|মন খারাপ).{0,20}(?:family|পরিবার|father|mother|parents|বাবা|মা)/i,
  ],
  postponed_happiness: [
    /(?:when i get success|if i earn|যখন সফল হব|যখন টাকা হবে|আমি পারলে).{0,30}(?:then|তখন|will|হব|করব)/i,
    /(?:after|পরে).{0,20}(?:success|সফল|rich|ধনী|earn|আয়).{0,20}(?:happy|সুখী|enjoy|উপভোগ)/i,
    /(?:one day|একদিন|someday|কোনো একদিন).{0,30}(?:happy|সুখী|good life|ভাল জীবন)/i,
  ],
  superiority_inferiority: [
    /(?:i am not good enough|আমি যথেষ্ট ভাল না|আমি পারব না|আমি পিছিয়ে|আমি কম)/i,
    /(?:others are better|অনেকে বেশি|সবাই এগিয়ে|অনেকের চেয়ে|তুলনায় পিছিয়ে)/i,
    /(?:i am better|আমি আলাদা|আমি স্পেশাল|আমি সবার থেকে|শুধু আমি পারি)/i,
    /(?:nobody understands|কেউ বোঝে না|কেউ বুঝবে না|কেউ বুঝতে চায় না)/i,
  ],
  lack_of_belonging: [
    /(?:alone|একা|alone|alone|isolated|আইসোলেটেড|lonely|নিঃসঙ্গ)/i,
    /(?:nobody cares|কেউ care করে না|কেউ খোঁজ নেয় না|কেউ সাহায্য করে না)/i,
    /(?:not part of|আমি অংশ না|fit in|fit করি না|বিলং করি না)/i,
    /(?:outsider|বাইরের|আউটসাইডার|different|অন্য রকম|আলাদা)/i,
  ],
  none: [],
};

export function detectAdlerianNeed(text: string): { need: AdlerianNeed; confidence: number; evidence: string } {
  let bestNeed: AdlerianNeed = "none";
  let bestScore = 0;
  let bestEvidence = "";
  for (const [need, patterns] of Object.entries(ADLERIAN_PATTERNS)) {
    if (need === "none") continue;
    let score = 0;
    const matches: string[] = [];
    for (const pat of patterns) {
      if (pat.test(text)) { score++; matches.push(pat.source); }
    }
    if (score > bestScore) { bestScore = score; bestNeed = need as AdlerianNeed; bestEvidence = matches.slice(0, 2).join(", "); }
  }
  return { need: bestNeed, confidence: bestScore > 0 ? Math.min(bestScore / 3, 1) : 0, evidence: bestEvidence };
}

/* ===== BRIAN TRACY — BUYER PERSONALITY & MOTIVATION PATTERNS ===== */
const BUYER_PERSONALITY_PATTERNS: Record<BuyerPersonality, RegExp[]> = {
  apathetic: [/\b(?:whatever|যাই হোক|যাই হোক না কেন|what does it matter|কী আসে যায়|i don't care|my concern না)\b/i, /^.{1,15}$/, /(?:not interested|interested না|আগ্রহ নাই|আগ্রহ নেই)/i],
  self_actualizing: [/\b(?:i know exactly|আমি জানি|i want this|এইটা চাই|i have decided|আমি ঠিক করেছি|just tell me|শুধু বলুন)\b/i, /(?:i have researched|আমি রিসার্চ করেছি|i compared|তুলনা করেছি|i know what|জানি কী চাই)/i],
  analytical: [/\b(?:details|বিস্তারিত|data|ডেটা|specific|স্পেসিফিক|exactly|exact|evidence|প্রমাণ|research|রিসার্চ)\b/i, /(?:compare|তুলনা|difference|পার্থক্য|percentage|percent|statistics|পরিসংখ্যান)/i, /(?:prove|প্রমাণ|show me|দেখান|numbers|সংখ্যা|guarantee|গ্যারান্টি)/i],
  relater: [/\b(?:my friend|আমার বন্ধু|my family|আমার পরিবার|others|অন্যেরা|people say|লোক বলে|what do you think|আপনার মতামত)\b/i, /(?:recommend|রেকমেন্ড|refer|রেফার|trust|trusted|বিশ্বাস|safe|নিরাপদ)/i, /(?:relationship|সম্পর্ক|help|সাহায্য|care|যত্ন)/i],
  driver: [/\b(?:now|এখন|right now|এখনই|fast|দ্রুত|quick|তাড়াতাড়ি|straight|সোজা|directly|সরাসরি)\b/i, /(?:bottom line|সার কথা|conclusion|সিদ্ধান্ত|result|ফলাফল|point|পয়েন্ট|hurry|তাড়া)/i, /(?:short|সংক্ষেপে|brief|briefly|summary|summary)/i],
  socialized: [/\b(?:status|স্ট্যাটাস|prestige|প্রতিপত্তি|recognition|স্বীকৃতি|achievement|অর্জন|certificate|সার্টিফিকেট)\b/i, /(?:leading|লিডিং|top|টপ|best|best|award|অ্যাওয়ার্ড|exclusive|এক্সক্লুসিভ)/i, /(?:premium|প্রিমিয়াম|VIP|ভিআইপি|distinguished|বিশিষ্ট)/i],
  unknown: [],
};

const BUYING_MOTIVATION_PATTERNS: Record<BuyingMotivation, RegExp[]> = {
  gain_oriented: [/\b(?:earn|income|আয়|make money|টাকা|profit|লাভ|gain|লাভ|benefit|সুবিধা|improve|উন্নতি|growth|গ্রোথ)\b/i, /(?:get|পাব|বাড়বে|increase|বাড়াতে|more|আরও|better|ভাল|achieve|অর্জন)/i, /(?:opportunity|সুযোগ|success|সফল|future|ভবিষ্যৎ|dream|স্বপ্ন)/i],
  fear_oriented: [/\b(?:lose|হারাব|loss|ক্ষতি|miss|মিস|waste|নষ্ট|risk|রিস্ক|scam|প্রতারণা|cheat|ঠকা)\b/i, /(?:afraid|ভয়|worried|চিন্তিত|scared| scared|nervous|নার্ভাস|anxious|উদ্বিগ্ন)/i, /(?:regret|আফসোস|guarantee|গ্যারান্টি|safe?|নিরাপদ|secure?|সুরক্ষিত)/i, /(?:too good|এত ভাল|suspicious|সন্দেহজনক|doubt|সন্দেহ)/i],
  mixed: [],
  unknown: [],
};

const CUSTOMER_NEED_PATTERNS: Record<CustomerNeed, RegExp[]> = {
  money: [/\b(?:money|টাকা|income|আয়|earn|earn|financial|আর্থিক|wealth|ধন|rich|ধনী|expensive|দামি)\b/i, /(?:price|দাম|cost|খরচ|budget|বাজেট|afford|সামর্থ্য|commission|কমিশন)/i],
  security: [/\b(?:secure|নিরাপদ|safe|নিরাপত্তা|stable|স্থিতিশীল|steady|স্থির|guaranteed|গ্যারান্টিড|protect|সুরক্ষা)\b/i, /(?:risk|রিস্ক|risk free|ঝুঁকিমুক্ত|insurance|বীমা|backup|ব্যাকআপ|safety|নিরাপত্তা)/i],
  being_liked: [/\b(?:like|পছন্দ|love|ভালবাসা|approve|অনুমোদন|accept|গ্রহণ|popular|জনপ্রিয়|friends|বন্ধুরা)\b/i, /(?:people|lok|মানুষ|society|সমাজ|community|কমিউনিটি|belong|বিলং)/i],
  status_prestige: [/\b(?:status|স্ট্যাটাস|prestige|প্রতিপত্তি|position|পজিশন|respect|সম্মান|admire|প্রশংসা|impress|impress)\b/i, /(?:brand|ব্র্যান্ড|exclusive|এক্সক্লুসিভ|premium|প্রিমিয়াম|VIP|ভিআইপি|superior|উন্নত)/i],
  health_fitness: [/\b(?:health|স্বাস্থ্য|fitness|ফিটনেস|exercise|ব্যায়াম|diet|ডায়েট|weight|ওজন|disease|রোগ)\b/i, /(?:energy|এনার্জি|strong|strong|fit|fit|mental|মেন্টাল|stress|স্ট্রেস)/i],
  praise_recognition: [/\b(?:praise|প্রশংসা|recognition|স্বীকৃতি|appreciation|কৃতজ্ঞতা|award|পুরস্কার|honor|সম্মান|compliment|তারিফ)\b/i, /(?:certificate|সার্টিফিকেট|badge|ব্যাজ|achievement|অর্জন|milestone|মাইলস্টোন)/i],
  power_influence: [/\b(?:power|ক্ষমতা|control|নিয়ন্ত্রণ|influence|প্রভাব|lead|নেতৃত্ব|authority|কর্তৃত্ব|decide|সিদ্ধান্ত)\b/i, /(?:manage|ম্যানেজ|direct|নির্দেশ|command|কমান্ড|rule|শাসন)/i],
  leading_field: [/\b(?:first|প্রথম|best|শ্রেষ্ঠ|top|টপ|leading|লিডিং|pioneer|অগ্রগামী|innovator|উদ্ভাবক)\b/i, /(?:expert|এক্সপার্ট|specialist|বিশেষজ্ঞ|cutting edge|অত্যাধুনিক|advanced|উন্নত)/i],
  love_companionship: [/\b(?:love|ভালবাসা|relationship|সম্পর্ক|companion|সঙ্গী|partner|সঙ্গী|family|পরিবার|together|একসাথে)\b/i, /(?:lonely|নিঃসঙ্গ|alone|একা|togetherness|একত্রিতা|belong|বিলং)/i],
  personal_growth: [/\b(?:learn|শিখা|growth|গ্রোথ|develop|উন্নয়ন|improve|উন্নতি|skill|স্কিল|knowledge|জ্ঞান)\b/i, /(?:education|শিক্ষা|course|কোর্স|training|প্রশিক্ষণ|self improvement|আত্মউন্নয়ন|potential|সম্ভাবনা)/i],
  personal_transformation: [/\b(?:change|পরিবর্তন|transform|রূপান্তর|new me|নতুন আমি|different|ভিন্ন|breakthrough|ব্রেকথ্রু)\b/i, /(?:life changing|জীবন বদলানো|turnaround|পাল্টানো|reset|রিসেট|rebirth|পুনর্জন্ম)/i],
  unknown: [],
};

export function detectBuyerPersonality(text: string): { personality: BuyerPersonality; confidence: number; evidence: string } {
  let best: BuyerPersonality = "unknown";
  let bestScore = 0;
  let bestEv = "";
  for (const [p, pats] of Object.entries(BUYER_PERSONALITY_PATTERNS)) {
    if (p === "unknown") continue;
    let score = 0;
    const m: string[] = [];
    for (const pat of pats) { if (pat.test(text)) { score++; m.push(pat.source); } }
    if (score > bestScore) { bestScore = score; best = p as BuyerPersonality; bestEv = m.slice(0, 2).join(", "); }
  }
  return { personality: best, confidence: bestScore > 0 ? Math.min(bestScore / 2.5, 1) : 0, evidence: bestEv };
}

export function detectBuyingMotivation(text: string): { motivation: BuyingMotivation; confidence: number; evidence: string } {
  const gainScore = BUYING_MOTIVATION_PATTERNS.gain_oriented.reduce((s, p) => s + (p.test(text) ? 1 : 0), 0);
  const fearScore = BUYING_MOTIVATION_PATTERNS.fear_oriented.reduce((s, p) => s + (p.test(text) ? 1 : 0), 0);
  if (gainScore >= 2 && fearScore === 0) return { motivation: "gain_oriented", confidence: Math.min(gainScore / 3, 1), evidence: "gain patterns detected" };
  if (fearScore >= 2 && gainScore === 0) return { motivation: "fear_oriented", confidence: Math.min(fearScore / 3, 1), evidence: "fear/loss patterns detected" };
  if (gainScore >= 1 && fearScore >= 1) return { motivation: "mixed", confidence: 0.8, evidence: `gain=${gainScore}, fear=${fearScore}` };
  return { motivation: "unknown", confidence: 0, evidence: "" };
}

export function detectCustomerNeed(text: string): { need: CustomerNeed; confidence: number; evidence: string } {
  let best: CustomerNeed = "unknown";
  let bestScore = 0;
  let bestEv = "";
  for (const [n, pats] of Object.entries(CUSTOMER_NEED_PATTERNS)) {
    if (n === "unknown") continue;
    let score = 0;
    const m: string[] = [];
    for (const pat of pats) { if (pat.test(text)) { score++; m.push(pat.source); } }
    if (score > bestScore) { bestScore = score; best = n as CustomerNeed; bestEv = m.slice(0, 2).join(", "); }
  }
  return { need: best, confidence: bestScore > 0 ? Math.min(bestScore / 2, 1) : 0, evidence: bestEv };
}

export function extractKeywords(text: string): string[] {
  const stopWords = new Set(["the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","can","could","shall","should","may","might","must","i","you","he","she","it","we","they","me","him","her","us","them","my","your","his","its","our","their","this","that","these","those","and","or","but","if","because","as","until","while","of","at","by","for","with","about","against","between","into","through","during","before","after","above","below","from","up","down","to","in","out","on","off","over","under","again","further","then","once","here","there","when","where","why","how","all","each","every","both","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","am", "এবং", "এই", "ও", "করা", "করে", "কাছে", "কিন্তু", "কেউ", "কোন", "তা", "থেকে", "দেওয়া", "দিয়ে", "দ্বারা", "ধরন", "না", "নিয়ে", "পরে", "প্রতি", "বলে", "বহু", "বা", "বিনা", " মধ্যে", "ভিতর", "মতো", "যখন", "যা", "যে", "সঙ্গে", "সব", "সহ", "সে"]);
  const words = text.toLowerCase().split(/[\s,;:.!?()\[\]{}""'']+/).filter(w => w.length > 2 && !stopWords.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);
}

/* ===== KOTLER MARKETING DETECTION FUNCTIONS ===== */

const MARKET_SEGMENT_PATTERNS: Record<MarketSegment, RegExp[]> = {
  geographic: [/\b(?:ঢাকা|dhaka|গ্রাম|village|শহর|city|মফস্বল|গাঁও|জেলা|district|চট্টগ্রাম|সিলেট|রাজশাহী|খুলনা)\b/i, /\b(?:urban|rural|city|town|গ্রামীণ|শহুরে)\b/i],
  demographic: [/\b(?:ছাত্র|student|গৃহিণী|homemaker|চাকরি|job|ব্যবসা|business|বয়স|age|আয়|income|পুরুষ|মহিলা|male|female)\b/i, /\b(?:teen|young|old|বৃদ্ধ|যুবক|কিশোর|শিশু)\b/i],
  psychographic: [/\b(?:লাইফস্টাইল|lifestyle|ভ্যালু|value|ব্যক্তিত্ব|personality|আগ্রহ|interest|opinion|মতামত)\b/i, /\b(?:স্বপ্ন|dream|গোল|goal|আকাঙ্ক্ষা|aspiration|class|শ্রেণি)\b/i],
  behavioral: [/\b(?:প্রথমবার|first time|আবার|again|রয়্যাল|loyal|নিয়মিত|regular|অনেক দিন|long time)\b/i, /\b(?:কিনেছি|bought|ব্যবহার|use|পছন্দ|favorite|prefer|পছন্দ করি)\b/i],
  unknown: [],
};

export function detectMarketSegment(text: string): { segment: MarketSegment; confidence: number; evidence: string } {
  let best: MarketSegment = "unknown";
  let bestScore = 0;
  let bestEv = "";
  for (const [seg, pats] of Object.entries(MARKET_SEGMENT_PATTERNS)) {
    if (seg === "unknown") continue;
    let score = 0;
    const m: string[] = [];
    for (const pat of pats) { if (pat.test(text)) { score++; m.push(pat.source); } }
    if (score > bestScore) { bestScore = score; best = seg as MarketSegment; bestEv = m.slice(0, 2).join(", "); }
  }
  return { segment: best, confidence: bestScore > 0 ? Math.min(bestScore / 2, 1) : 0, evidence: bestEv };
}

const TARGETING_STRATEGY_PATTERNS: Record<TargetingStrategy, RegExp[]> = {
  undifferentiated: [/\b(?:সবার জন্য|সবাই|সকল|everyone|all people|mass|general|সাধারণ|একই)\b/i, /\b(?:one size|একই পণ্য|same for all)\b/i],
  differentiated: [/\b(?:আলাদা|different|বিভিন্ন|separate|multiple|একাধিক|customize|কাস্টমাইজ)\b/i, /\b(?:গ্রুপ|group|segment|সেগমেন্ট|type|টাইপ অনুযায়ী)\b/i],
  concentrated: [/\b(?:নির্দিষ্ট|specific|niche|particular|বিশেষ|কেবলমাত্র|only for|শুধু)\b/i, /\b(?:focus|ফোকাস|specialize|স্পেশালাইজ)\b/i],
  micromarketing: [/\b(?:আমার জন্য|personal|ব্যক্তিগত|individual|ইন্ডিভিজুয়াল|tailor|tailored)\b/i, /\b(?:one on one|একসাথে একজন|individualized)\b/i],
  unknown: [],
};

export function detectTargetingStrategy(text: string): { strategy: TargetingStrategy; confidence: number; evidence: string } {
  let best: TargetingStrategy = "unknown";
  let bestScore = 0;
  let bestEv = "";
  for (const [strat, pats] of Object.entries(TARGETING_STRATEGY_PATTERNS)) {
    if (strat === "unknown") continue;
    let score = 0;
    const m: string[] = [];
    for (const pat of pats) { if (pat.test(text)) { score++; m.push(pat.source); } }
    if (score > bestScore) { bestScore = score; best = strat as TargetingStrategy; bestEv = m.slice(0, 2).join(", "); }
  }
  return { strategy: best, confidence: bestScore > 0 ? Math.min(bestScore / 2, 1) : 0, evidence: bestEv };
}

const BRAND_POSITION_PATTERNS: Record<BrandPosition, RegExp[]> = {
  value_leader: [/\b(?:সেরা মান|best value|সস্তা|cheap|affordable|সাশ্রয়ী|economy|ইকোনমি)\b/i, /\b(?:সর্বনিম্ন দাম|lowest price|budget|বাজেট)\b/i],
  quality_leader: [/\b(?:সেরা কোয়ালিটি|best quality|উচ্চ মান|high quality|premium|প্রিমিয়াম|superior|উন্নত)\b/i, /\b(?:টেকসই|durable|trusted|বিশ্বস্ত|reliable|নির্ভরযোগ্য)\b/i],
  innovation_leader: [/\b(?:অত্যাধুনিক|cutting edge|innovative|উদ্ভাবনী|first|প্রথম|newest|নতুনত্ব)\b/i, /\b(?:revolutionary|বিপ্লবী|breakthrough|ব্রেকথ্রু|unique|অনন্য)\b/i],
  service_leader: [/\b(?:সেরা সাপোর্ট|best support|২৪\/৭|always available|dedicated|ডেডিকেটেড)\b/i, /\b(?:personalized|ব্যক্তিগতকৃত|custom care|কাস্টমার কেয়ার|service|সেবা)\b/i],
  cost_leader: [/\b(?:সবচেয়ে সস্তা|cheapest|lowest cost|ন্যূনতম খরচ|minimum cost)\b/i, /\b(?:মূল্য যুদ্ধ|price war|discount|ডিসকাউন্ট|সবচেয়ে কম)\b/i],
  niche_leader: [/\b(?:নির্দিষ্ট ক্ষেত্রে সেরা|best in|বিশেষায়িত|specialized|expert in|এক্সপার্ট)\b/i, /\b(?:niche|কেবলমাত্র এই ক্ষেত্রে|only this domain)\b/i],
  unknown: [],
};

export function detectBrandPosition(text: string): { position: BrandPosition; confidence: number; evidence: string } {
  let best: BrandPosition = "unknown";
  let bestScore = 0;
  let bestEv = "";
  for (const [pos, pats] of Object.entries(BRAND_POSITION_PATTERNS)) {
    if (pos === "unknown") continue;
    let score = 0;
    const m: string[] = [];
    for (const pat of pats) { if (pat.test(text)) { score++; m.push(pat.source); } }
    if (score > bestScore) { bestScore = score; best = pos as BrandPosition; bestEv = m.slice(0, 2).join(", "); }
  }
  return { position: best, confidence: bestScore > 0 ? Math.min(bestScore / 2, 1) : 0, evidence: bestEv };
}

const PLC_PATTERNS: Record<ProductLifecycleStage, RegExp[]> = {
  introduction: [/\b(?:নতুন|new|only just|সবে শুরু|শুরু করেছি|launch|লঞ্চ|fresh|fresh|introductory)\b/i, /\b(?:first time|প্রথমবার|trial|try|trying|পরীক্ষা)\b/i],
  growth: [/\b(?:বাড়ছে|growing|বৃদ্ধি|increasing|fast|দ্রুত|popular|জনপ্রিয়|many joining|অনেকে যোগ)\b/i, /\b(?:expanding|সম্প্রসারণ|more people|আরও মানুষ|rising|উঠছে)\b/i],
  maturity: [/\b(?:established|প্রতিষ্ঠিত|stable|স্থিতিশীল|standard|স্ট্যান্ডার্ড|well known|সুপরিচিত)\b/i, /\b(?:many options|অনেক অপশন|competition|প্রতিযোগিতা|saturated|saturated)\b/i],
  decline: [/\b(?:কমে যাচ্ছে|declining|decreasing|old|পুরনো|outdated|সেকেলে|obsolete|অপ্রচলিত)\b/i, /\b(?:replace|প্রতিস্থাপন|better alternative|ভাল বিকল্প|not popular|আর জনপ্রিয় না)\b/i],
  unknown: [],
};

export function detectPLCStage(text: string): { stage: ProductLifecycleStage; confidence: number; evidence: string } {
  let best: ProductLifecycleStage = "unknown";
  let bestScore = 0;
  let bestEv = "";
  for (const [stg, pats] of Object.entries(PLC_PATTERNS)) {
    if (stg === "unknown") continue;
    let score = 0;
    const m: string[] = [];
    for (const pat of pats) { if (pat.test(text)) { score++; m.push(pat.source); } }
    if (score > bestScore) { bestScore = score; best = stg as ProductLifecycleStage; bestEv = m.slice(0, 2).join(", "); }
  }
  return { stage: best, confidence: bestScore > 0 ? Math.min(bestScore / 2, 1) : 0, evidence: bestEv };
}

const PRICING_STRATEGY_PATTERNS: Record<PricingStrategy, RegExp[]> = {
  skimming: [/\b(?:প্রথমে বেশি দাম|premium price|high initial|উচ্চ মূল্য|exclusive price|এক্সক্লুসিভ দাম)\b/i, /\b(?:top end|high end|luxury|বিলাসিতা|expensive|দামি)\b/i],
  penetration: [/\b(?:কম দামে বাজার দখল|low price|cheap|সস্তা|low cost|affordable|affordable|সাশ্রয়ী)\b/i, /\b(?:ডিসকাউন্ট|discount|সবচেয়ে কম|lowest price|introductory|প্রবর্তক মূল্য)\b/i],
  competitive: [/\b(?:বাজারের সাথে|market price|বাজার দর|same as others|অন্যদের মতো|competitive)\b/i, /\b(?:standard rate|স্ট্যান্ডার্ড রেট|market rate|বাজার মূল্য)\b/i],
  value_based: [/\b(?:মূল্য অনুযায়ী|worth it|value for money|মূল্যায়ন|প্রাপ্তির মূল্য|deserve this)\b/i, /\b(?:investment|বিনিয়োগ|return|রিটার্ন|ভ্যালু|value based)\b/i],
  cost_plus: [/\b(?:cost +|খরচ +|production cost|উৎপাদন খরচ|margin|মার্জিন|overhead)\b/i, /\b(?:cost based|cost ক্যালকুলেশন)\b/i],
  psychological: [/\b(?:মাত্র|only| всего|just|শুধু|499|৯৯৯|daily|দৈনিক|installment|কিস্তি)\b/i, /\b(?:per day|daily cost|per month|মাসিক|মাসে মাত্র)\b/i],
  unknown: [],
};

export function detectPricingStrategy(text: string): { strategy: PricingStrategy; confidence: number; evidence: string } {
  let best: PricingStrategy = "unknown";
  let bestScore = 0;
  let bestEv = "";
  for (const [st, pats] of Object.entries(PRICING_STRATEGY_PATTERNS)) {
    if (st === "unknown") continue;
    let score = 0;
    const m: string[] = [];
    for (const pat of pats) { if (pat.test(text)) { score++; m.push(pat.source); } }
    if (score > bestScore) { bestScore = score; best = st as PricingStrategy; bestEv = m.slice(0, 2).join(", "); }
  }
  return { strategy: best, confidence: bestScore > 0 ? Math.min(bestScore / 2, 1) : 0, evidence: bestEv };
}

const COMM_CHANNEL_PATTERNS: Record<CommunicationChannel, RegExp[]> = {
  advertising: [/\b(?:ad|বিজ্ঞাপন|advertise|প্রচার|Facebook ad|Google ad|টিভি|TV|billboard|বিলবোর্ড)\b/i],
  public_relations: [/\b(?:press|প্রেস|news|সংবাদ|media|মিডিয়া|PR|interview|সাক্ষাৎকার|event|ইভেন্ট)\b/i],
  sales_promotion: [/\b(?:discount|ডিসকাউন্ট|offer|অফার|coupon|কুপন|sale|বিক্রয়|promotion|cashback)\b/i],
  direct_marketing: [/\b(?:call|কল|SMS|email|ইমেইল|message*|whatsapp|phone|ফোন)\b/i, /\b(?:personal message|personal offer|personal call)\b/i],
  digital: [/\b(?:Facebook|YouTube|website|ওয়েবসাইট|social media|সোশ্যাল মিডিয়া|online|অনলাইন|SEO|Google)\b/i],
  events: [/\b(?:event|ইভেন্ট|seminar|সেমিনার|workshop|ওয়ার্কশপ|webinar|ওয়েবিনার|fair|মেলা)\b/i],
  personal_selling: [/\b(?:face to face|সাক্ষাৎ|meeting|মিটিং|personal visit|ব্যক্তিগত দেখা|salesperson|বিক্রয়কর্মী)\b/i],
  word_of_mouth: [/\b(?:friend|বন্ধু|family|পরিবার|recommend|recommend|refer|ref|বলেছে|মুখে মুখে)\b/i],
  unknown: [],
};

export function detectCommunicationChannel(text: string): { channel: CommunicationChannel; confidence: number; evidence: string } {
  let best: CommunicationChannel = "unknown";
  let bestScore = 0;
  let bestEv = "";
  for (const [ch, pats] of Object.entries(COMM_CHANNEL_PATTERNS)) {
    if (ch === "unknown") continue;
    let score = 0;
    const m: string[] = [];
    for (const pat of pats) { if (pat.test(text)) { score++; m.push(pat.source); } }
    if (score > bestScore) { bestScore = score; best = ch as CommunicationChannel; bestEv = m.slice(0, 2).join(", "); }
  }
  return { channel: best, confidence: bestScore > 0 ? Math.min(bestScore / 2, 1) : 0, evidence: bestEv };
}

const LOYALTY_STAGE_PATTERNS: Record<LoyaltyStage, RegExp[]> = {
  suspect: [/\b(?:interested?|আগ্রহী|maybe|হয়তো|what is|কী|tell me|বলুন)\b/i, /\b(?:first time talking|প্রথমবার কথা|new here|নতুন)\b/i],
  prospect: [/\b(?:how to|কিভাবে|join|যোগ|cost|দাম|price|মূল্য|benefits|সুবিধা|compare|তুলনা)\b/i],
  first_time: [/\b(?:just bought|এইমাত্র কিনেছি|purchased|purchase|ordered|order|ordered|অর্ডার করেছি)\b/i, /\b(?:new member|নতুন সদস্য|registered|registration|just joined)\b/i],
  repeat: [/\b(?:again|আবার|another|আরেকটি|more|আরও|also|second time|দ্বিতীয়বার)\b/i, /\b(?:already have|ইতিমধ্যে আছে|existing|বর্তমান|customer already)\b/i],
  loyal: [/\b(?:always|সবসময়|only|শুধু|prefer|পছন্দ করি|favorite|প্রিয়|trust|trusted|বিশ্বাস)\b/i, /\b(?:regular|নিয়মিত|long time customer|দীর্ঘদিনের)\b/i],
  advocate: [/\b(?:recommend|রেকমেন্ড|refer|referral|বলেছি|suggest|suggestion|শেয়ার|share|brought|এনেছি)\b/i, /\b(?:my friends|আমার বন্ধুরা|my family|আমার পরিবার|আমার টিম)\b/i],
  unknown: [],
};

export function detectLoyaltyStage(text: string): { stage: LoyaltyStage; confidence: number; evidence: string } {
  let best: LoyaltyStage = "suspect";
  let bestScore = 0;
  let bestEv = "";
  for (const [stg, pats] of Object.entries(LOYALTY_STAGE_PATTERNS)) {
    if (stg === "unknown") continue;
    let score = 0;
    const m: string[] = [];
    for (const pat of pats) { if (pat.test(text)) { score++; m.push(pat.source); } }
    if (score > bestScore) { bestScore = score; best = stg as LoyaltyStage; bestEv = m.slice(0, 2).join(", "); }
  }
  return { stage: best, confidence: bestScore > 0 ? Math.min(bestScore / 3, 1) : 0, evidence: bestEv };
}

const SERVICE_QUALITY_PATTERNS: Record<ServiceQuality, RegExp[]> = {
  tangibility: [/\b(?:look|দেখতে|ui|website|ওয়েবসাইট|ডিজাইন|design|appearance|চেহারা|প্যাকেজিং)\b/i, /\b(?:physical|ফিজিক্যাল|office|অফিস|স্থান|environment|পরিবেশ)\b/i],
  reliability: [/\b(?:ভরসা|dependable|নির্ভরযোগ্য|consistent|consistent|accura|সঠিক|promise|প্রতিশ্রুতি)\b/i, /\b(?:on time|সময়ে|delivery|ডেলিভারি|time|deadline|ডেডলাইন)\b/i],
  responsiveness: [/\b(?:slow|ধীর|late|দেরি|delay|delay|wait|অপেক্ষা|quick|দ্রুত না)\b/i, /\b(?:response|উত্তর|reply|জবাব|answer|no reply|কোন উত্তর নাই)\b/i],
  assurance: [/\b(?:trust|trust|confident|আত্মবিশ্বাসী|sure|নিশ্চিত|knowledge|জ্ঞান|expert|এক্সপার্ট)\b/i, /\b(?:credible|বিশ্বাসযোগ্য|qualified|যোগ্য|trained|প্রশিক্ষিত)\b/i],
  empathy: [/\b(?:care|যত্ন|understand|বুঝে|listen|শোনে|empathy|সহানুভূতি|feelings|অনুভূতি)\b/i, /\b(?:rude|অভদ্র|not listening|শোনে না|doesn't care|কেয়ার করে না)\b/i],
  unknown: [],
};

export function detectServiceQualityIssue(text: string): { dimension: ServiceQuality; severity: "high" | "medium" | "low" | "none"; evidence: string } {
  let best: ServiceQuality = "unknown";
  let bestScore = 0;
  let bestEv = "";
  for (const [dim, pats] of Object.entries(SERVICE_QUALITY_PATTERNS)) {
    if (dim === "unknown") continue;
    let score = 0;
    const m: string[] = [];
    for (const pat of pats) { if (pat.test(text)) { score++; m.push(pat.source); } }
    if (score > bestScore) { bestScore = score; best = dim as ServiceQuality; bestEv = m.slice(0, 2).join(", "); }
  }
  const severity = bestScore >= 3 ? "high" : bestScore >= 2 ? "medium" : bestScore >= 1 ? "low" : "none";
  return { dimension: best, severity, evidence: bestEv };
}

const GROWTH_STRATEGY_PATTERNS: Record<GrowthStrategy, RegExp[]> = {
  market_penetration: [/\b(?:আরও বেশি|more|বাজার শেয়ার|market share|increase|বাড়াতে|grow|গ্রোথ|existing)\b/i, /\b(?:লয়াল|loyal|retention|retain)\b/i],
  market_development: [/\b(?:নতুন বাজার|new market|new area|নতুন এলাকা|different city|different country)\b/i, /\b(?:expand|সম্প্রসারিত|new segment|নতুন সেগমেন্ট|new people)\b/i],
  product_development: [/\b(?:new product|নতুন পণ্য|new course|নতুন কোর্স|feature|নতুন ফিচার|improve|উন্নতি)\b/i, /\b(?:upgrade|innovation|উদ্ভাবন|better version|ভাল ভার্সন)\b/i],
  diversification: [/\b(?:different business|ভিন্ন ব্যবসা|new industry|নতুন ইন্ডাস্ট্রি|unrelated|একেবারে আলাদা)\b/i, /\b(?:completely different|সম্পূর্ণ ভিন্ন|new venture|নতুন উদ্যোগ)\b/i],
  unknown: [],
};

export function detectGrowthStrategy(text: string): { strategy: GrowthStrategy; confidence: number; evidence: string } {
  let best: GrowthStrategy = "unknown";
  let bestScore = 0;
  let bestEv = "";
  for (const [st, pats] of Object.entries(GROWTH_STRATEGY_PATTERNS)) {
    if (st === "unknown") continue;
    let score = 0;
    const m: string[] = [];
    for (const pat of pats) { if (pat.test(text)) { score++; m.push(pat.source); } }
    if (score > bestScore) { bestScore = score; best = st as GrowthStrategy; bestEv = m.slice(0, 2).join(", "); }
  }
  return { strategy: best, confidence: bestScore > 0 ? Math.min(bestScore / 2, 1) : 0, evidence: bestEv };
}

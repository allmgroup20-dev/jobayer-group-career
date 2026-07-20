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

export function extractKeywords(text: string): string[] {
  const stopWords = new Set(["the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","can","could","shall","should","may","might","must","i","you","he","she","it","we","they","me","him","her","us","them","my","your","his","its","our","their","this","that","these","those","and","or","but","if","because","as","until","while","of","at","by","for","with","about","against","between","into","through","during","before","after","above","below","from","up","down","to","in","out","on","off","over","under","again","further","then","once","here","there","when","where","why","how","all","each","every","both","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","am", "এবং", "এই", "ও", "করা", "করে", "কাছে", "কিন্তু", "কেউ", "কোন", "তা", "থেকে", "দেওয়া", "দিয়ে", "দ্বারা", "ধরন", "না", "নিয়ে", "পরে", "প্রতি", "বলে", "বহু", "বা", "বিনা", " মধ্যে", "ভিতর", "মতো", "যখন", "যা", "যে", "সঙ্গে", "সব", "সহ", "সে"]);
  const words = text.toLowerCase().split(/[\s,;:.!?()\[\]{}""'']+/).filter(w => w.length > 2 && !stopWords.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);
}

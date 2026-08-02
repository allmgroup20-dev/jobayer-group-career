export interface QualityScore {
  score: number;
  reason: string;
  details: Record<string, number>;
}

const WEIGHTS = {
  minLength: 0.15,
  depth: 0.25,
  personalization: 0.15,
  structure: 0.15,
  specificity: 0.20,
  uniqueness: 0.10,
};

function scoreMinLength(answer: string): number {
  const len = answer.length;
  if (len < 30) return 0;
  if (len < 60) return 0.3;
  if (len < 120) return 0.5;
  if (len < 200) return 0.7;
  return 1.0;
}

function scoreDepth(answer: string): number {
  let score = 0;
  if (/\d+/.test(answer)) score += 0.3;
  if (/(উদাহরণ|example|যেমন|like|for instance|e\.g\.)/i.test(answer)) score += 0.2;
  if (/(প্রথমে|প্রথম|first|second|then|তারপর|পরবর্তী|finally|শেষে|ধাপ|step)/i.test(answer)) score += 0.2;
  if (/(because|কারণ|meaning|মানে|that means|অর্থাৎ|মোটকথা)/i.test(answer)) score += 0.15;
  if (answer.split(/[.!?।?!]+/).filter(Boolean).length >= 3) score += 0.15;
  return Math.min(score, 1.0);
}

function scorePersonalization(answer: string): number {
  let score = 0;
  if (/(আপনার|তোমার|your|you're|you'll|you've)/i.test(answer)) score += 0.4;
  if (/(আমি|আমাদের|we|our|us)/i.test(answer)) score += 0.2;
  if (/(চান|পারবেন|করতে\s*পারবেন|can\s*|will\s*|আগ্রহী|interested)/i.test(answer)) score += 0.2;
  if (/(recommend|সাজেস্ট|সুপারিশ|পরামর্শ|বলছি|suggest)/i.test(answer)) score += 0.2;
  return Math.min(score, 1.0);
}

function scoreStructure(answer: string): number {
  let score = 0;
  const lines = answer.split("\n").filter(Boolean);
  if (lines.length >= 2) score += 0.2;
  if (answer.includes("\n\n") || answer.includes("\r\n\r\n")) score += 0.2;
  if (/[।!?]/.test(answer) || /[.!?]/.test(answer)) score += 0.2;
  if (/[১-৯]|\d+\.|\*|•|-/.test(answer)) score += 0.2;
  if (/(শিরোনাম|headline|বিষয়|topic|summary|সারাংশ|মূল\s*কথা)/i.test(answer)) score += 0.2;
  return Math.min(score, 1.0);
}

function scoreSpecificity(answer: string): number {
  let score = 0;
  if (/(টাকা|BDT|TK|taka|%\s*|টাকা\s*থেকে|টাকা\s*পর্যন্ত)/i.test(answer)) score += 0.25;
  if (/[০-৯]+|[0-9]+/.test(answer)) score += 0.15;
  if (/(Jobayer|জবায়ের|courses|কোর্স|program|প্রোগ্রাম|training|ট্রেনিং|membership|মেম্বারশিপ)/i.test(answer)) score += 0.2;
  if (/(কোম্পানি|company|organization|group|গ্রুপ|platform)/i.test(answer)) score += 0.2;
  if (answer.length > 150) score += 0.2;
  return Math.min(score, 1.0);
}

function scoreUniqueness(answer: string): number {
  const words = answer.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 5) return 0;

  const unique = new Set(words);
  const ratio = unique.size / words.length;
  if (ratio > 0.7) return 1.0;
  if (ratio > 0.55) return 0.6;
  if (ratio > 0.4) return 0.3;
  return 0;
}

const BANNED_PATTERNS = [
  /^(ok|okay|k|kk|sure|yes|yeah|no|na|thanks|thank you|bye|goodbye|ধন্যবাদ|ঠিক আছে|আচ্ছা|ওকে|হ্যা|হ্যাঁ|বাই)$/i,
  /^(I understand|I see|ঠিক|বুঝলাম|বুঝেছি|থিক আছে)$/i,
  /(system instructions|your task|respond as|you are an ai|test answer|debug)/i,
  /^\[.*\]$/,
  /^\{.*\}$/,
];

export function isBannedAnswer(answer: string): boolean {
  const trimmed = answer.trim();
  if (trimmed.length < 10) return true;
  for (const p of BANNED_PATTERNS) {
    if (p.test(trimmed)) return true;
  }
  return false;
}

export function scoreQuality(question: string, answer: string): QualityScore {
  if (isBannedAnswer(answer)) {
    return { score: 0, reason: "Banned pattern or too short", details: {} };
  }

  const scores = {
    minLength: scoreMinLength(answer),
    depth: scoreDepth(answer),
    personalization: scorePersonalization(answer),
    structure: scoreStructure(answer),
    specificity: scoreSpecificity(answer),
    uniqueness: scoreUniqueness(answer),
  };

  const rawScore = (
    scores.minLength * WEIGHTS.minLength +
    scores.depth * WEIGHTS.depth +
    scores.personalization * WEIGHTS.personalization +
    scores.structure * WEIGHTS.structure +
    scores.specificity * WEIGHTS.specificity +
    scores.uniqueness * WEIGHTS.uniqueness
  );

  const score = Math.round(Math.min(rawScore, 1.0) * 10);

  let reason: string;
  if (score >= 8) reason = "Excellent";
  else if (score >= 6) reason = "Good";
  else if (score >= 4) reason = "Average";
  else reason = "Poor";

  return { score, reason, details: scores };
}

export const QUALITY_THRESHOLD = 7;

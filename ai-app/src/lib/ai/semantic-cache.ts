export interface SkillEntry {
  id: number;
  question: string;
  answer: string;
  keywords: string;
}

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]|_/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 1);
}

function buildVector(words: string[], vocab: Map<string, number>): number[] {
  const vec = new Array(vocab.size).fill(0);
  const tf = new Map<string, number>();
  for (const w of words) tf.set(w, (tf.get(w) || 0) + 1);
  for (const [w, count] of tf) {
    const idx = vocab.get(w);
    if (idx !== undefined) vec[idx] = 1 + Math.log10(count);
  }
  return vec;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function buildVocab(entries: SkillEntry[]): Map<string, number> {
  const vocab = new Map<string, number>();
  for (const e of entries) {
    for (const w of tokenize(e.question)) {
      if (!vocab.has(w)) vocab.set(w, vocab.size);
    }
  }
  return vocab;
}

function buildVectors(entries: SkillEntry[], vocab: Map<string, number>): Map<number, number[]> {
  const vecs = new Map<number, number[]>();
  for (const e of entries) {
    vecs.set(e.id, buildVector(tokenize(e.question), vocab));
  }
  return vecs;
}

const MIN_SEMANTIC_THRESHOLD = 0.15;
const CACHE_TTL = 60_000;

let cachedSkills: SkillEntry[] | null = null;
let cachedVocab: Map<string, number> = new Map();
let cachedVectors: Map<number, number[]> = new Map();
let lastCacheTime = 0;

export function setSemanticCache(skills: SkillEntry[]): void {
  cachedSkills = skills;
  cachedVocab = buildVocab(skills);
  cachedVectors = buildVectors(skills, cachedVocab);
  lastCacheTime = Date.now();
}

function isCacheStale(skillsLength: number): boolean {
  return Date.now() - lastCacheTime > CACHE_TTL || !cachedSkills || cachedSkills.length !== skillsLength;
}

export function semanticSearch(
  query: string,
  skills: SkillEntry[]
): { skill: SkillEntry; score: number } | null {
  if (isCacheStale(skills.length)) {
    setSemanticCache(skills);
  }

  const queryVec = buildVector(tokenize(query), cachedVocab);
  if (queryVec.every(v => v === 0)) return null;

  let best: { skill: SkillEntry; score: number } | null = null;

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    const vec = cachedVectors.get(skill.id);
    if (!vec) continue;

    // Keyword bonus: exact keyword hits boost score
    const kwList = skill.keywords?.split(",").map(k => k.trim().toLowerCase()).filter(Boolean) || [];
    const queryLower = query.toLowerCase();
    let kwBonus = 0;
    for (const kw of kwList) {
      if (queryLower.includes(kw)) kwBonus += 0.08;
    }

    const semanticScore = cosineSimilarity(queryVec, vec);
    const totalScore = semanticScore + kwBonus;

    if (totalScore > MIN_SEMANTIC_THRESHOLD && (!best || totalScore > best.score)) {
      best = { skill, score: totalScore };
    }
  }

  return best;
}

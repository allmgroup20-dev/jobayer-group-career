// ── In-memory LRU cache for brain responses with TTL ──
interface CacheEntry {
  response: string;
  model: string;
  tokens: number;
  agentsUsed: string[];
  departmentsUsed: string[];
  department: string;
  intent: string;
  chainType: string;
  cachedAt: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_SIZE = 500;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

function hashKey(text: string, language: string, mood: string): string {
  const raw = `${text.slice(0, 200).toLowerCase()}|${language}|${mood}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export function getCached(text: string, language: string, mood: string): CacheEntry | null {
  const key = hashKey(text, language, mood);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > entry.ttl) {
    cache.delete(key);
    return null;
  }
  // Move to end (most recently used) — delete + re-set
  cache.delete(key);
  cache.set(key, entry);
  return entry;
}

export function setCache(
  keyInput: string,
  language: string,
  mood: string,
  entry: Omit<CacheEntry, "cachedAt" | "ttl">,
  ttl = DEFAULT_TTL_MS,
): void {
  const key = hashKey(keyInput, language, mood);
  if (cache.size >= MAX_SIZE) {
    // Evict oldest (first key)
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { ...entry, cachedAt: Date.now(), ttl });
}

export function clearCache(): void {
  cache.clear();
}

export function getCacheSize(): number {
  return cache.size;
}

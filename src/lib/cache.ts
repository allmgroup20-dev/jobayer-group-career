import { initEnv } from "@/lib/env";

let kvCache: KVNamespace | null = null;

export async function getKV(): Promise<KVNamespace | null> {
  if (kvCache) return kvCache;
  try {
    const env = await initEnv();
    kvCache = env.CACHE;
    return kvCache;
  } catch {
    return null;
  }
}

export async function getCached<T>(key: string, ttl = 60): Promise<T | null> {
  try {
    const kv = await getKV();
    if (!kv) return null;
    const raw = await kv.get(key, "text");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > ttl * 1000) {
      kv.delete(key).catch(() => {});
      return null;
    }
    return parsed.data as T;
  } catch {
    return null;
  }
}

export async function setCached(key: string, data: unknown): Promise<void> {
  try {
    const kv = await getKV();
    if (!kv) return;
    await kv.put(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export async function invalidateCache(keyOrPrefix: string): Promise<void> {
  try {
    const kv = await getKV();
    if (!kv) return;
    if (keyOrPrefix.endsWith(":*")) {
      const prefix = keyOrPrefix.slice(0, -2);
      const listed = await kv.list({ prefix });
      for (const k of listed.keys) {
        kv.delete(k.name).catch(() => {});
      }
    } else {
      await kv.delete(keyOrPrefix);
    }
  } catch {}
}

const memoStore = new Map<string, { data: unknown; ts: number }>();

export function memo<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const existing = memoStore.get(key);
  if (existing && Date.now() - existing.ts < ttlMs) {
    return Promise.resolve(existing.data as T);
  }
  return fn().then(data => {
    memoStore.set(key, { data, ts: Date.now() });
    return data;
  });
}

export function clearMemo(): void {
  memoStore.clear();
}

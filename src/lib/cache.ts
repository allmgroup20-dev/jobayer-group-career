import { getCloudflareContext } from "@opennextjs/cloudflare";

let kvCache: KVNamespace | null = null;

export async function getKV(): Promise<KVNamespace | null> {
  if (kvCache) return kvCache;
  try {
    const ctx = await getCloudflareContext({ async: true });
    kvCache = (ctx.env as any).CACHE as KVNamespace | null;
    if (!kvCache) kvCache = null;
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

export async function invalidateCache(key: string): Promise<void> {
  try {
    const kv = await getKV();
    if (!kv) return;
    await kv.delete(key);
  } catch {}
}

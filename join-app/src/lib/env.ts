import { getCloudflareContext } from "@opennextjs/cloudflare";

let cache: { DB: D1Database } | null = null;

export async function getDB(): Promise<{ DB: D1Database }> {
  if (cache) return cache;
  try {
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as any).DB as D1Database;
    if (!db) throw new Error("DB binding 'DB' is undefined");
    cache = { DB: db };
    return cache;
  } catch (e) {
    const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";
    if (isDev) {
      try {
        const mod = await import("./local-d1");
        const local = mod.createLocalDB();
        cache = { DB: local as unknown as D1Database };
        return cache;
      } catch (localErr) {
        console.warn("Local D1 fallback failed:", (localErr as Error)?.message);
      }
    }
    throw e instanceof Error ? e : new Error("Database connection failed");
  }
}

let kvCache: { CACHE: KVNamespace } | null = null;

// Shared KV namespace (same as the root admin app). Screenshots are stored
// here under 'shots:' keys with a TTL so they auto-delete after verification.
export async function getKV(): Promise<{ CACHE: KVNamespace }> {
  if (kvCache) return kvCache;
  try {
    const ctx = await getCloudflareContext({ async: true });
    const kv = (ctx.env as any).CACHE as KVNamespace;
    if (!kv) throw new Error("KV binding 'CACHE' is undefined");
    kvCache = { CACHE: kv };
    return kvCache;
  } catch (e) {
    throw e instanceof Error ? e : new Error("KV connection failed");
  }
}

export async function getGoogleClientId(): Promise<string> {
  return process.env.GOOGLE_CLIENT_ID || "";
}

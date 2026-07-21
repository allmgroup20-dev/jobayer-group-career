import { getCloudflareContext } from "@opennextjs/cloudflare";

let envCache: { DB: D1Database; CACHE: KVNamespace } | null = null;
let envPromise: Promise<{ DB: D1Database; CACHE: KVNamespace }> | null = null;

export async function initEnv(): Promise<{ DB: D1Database; CACHE: KVNamespace }> {
  if (envCache) return envCache;
  if (envPromise) return envPromise;
  envPromise = (async () => {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as any;
    const db = env.DB as D1Database;
    const kv = (env.CACHE ?? null) as KVNamespace | null;
    if (!db) throw new Error("D1 binding 'DB' is undefined");
    envCache = { DB: db, CACHE: kv! };
    return envCache;
  })();
  return envPromise;
}

export function getCachedEnv(): { DB: D1Database; CACHE: KVNamespace } | null {
  return envCache;
}

import { getCloudflareContext } from "@opennextjs/cloudflare";

const ENV_TIMEOUT_MS = 10000;

let envCache: { DB: D1Database; CACHE: KVNamespace } | null = null;
let envPromise: Promise<{ DB: D1Database; CACHE: KVNamespace }> | null = null;

export async function initEnv(): Promise<{ DB: D1Database; CACHE: KVNamespace }> {
  if (envCache) return envCache;

  if (envPromise) {
    try {
      return await envPromise;
    } catch {
      envPromise = null;
      return initEnv();
    }
  }

  envPromise = (async () => {
    const ctx = await Promise.race([
      getCloudflareContext({ async: true }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("getCloudflareContext timed out")), ENV_TIMEOUT_MS)
      ),
    ]);
    const e = ctx.env as any;
    const db = e.DB as D1Database;
    const kv = (e.CACHE ?? null) as KVNamespace | null;
    if (!db) throw new Error("D1 binding 'DB' is undefined");
    envCache = { DB: db, CACHE: kv! };
    return envCache;
  })();

  try {
    return await envPromise;
  } catch (err) {
    envPromise = null;
    throw err;
  }
}

export function getCachedEnv(): { DB: D1Database; CACHE: KVNamespace } | null {
  return envCache;
}

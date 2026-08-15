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

export async function getGoogleClientId(): Promise<string> {
  return process.env.GOOGLE_CLIENT_ID || "";
}

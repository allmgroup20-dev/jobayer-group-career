let localDBInstance: ReturnType<typeof import("./local-d1").createLocalDB> | null = null;
let localDBInit = false;

async function getLocalDB() {
  if (!localDBInit) {
    localDBInit = true;
    try {
      const { createLocalDB } = await import("./local-d1");
      localDBInstance = createLocalDB();
    } catch (e) {
      console.warn("Local D1 not available:", (e as Error)?.message);
    }
  }
  return localDBInstance;
}

export async function getDB(): Promise<{ DB: D1Database }> {
  const db = process.env.DB as unknown as D1Database | undefined;
  if (db) return { DB: db };
  const local = await getLocalDB();
  if (local) return { DB: local as unknown as D1Database };
  throw new Error("D1 Database not available - run migrations first");
}

export async function ensureDB(): Promise<D1Database> {
  const { DB } = await getDB();
  return DB;
}

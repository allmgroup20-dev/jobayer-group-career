import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

interface CloudflareEnv {
  DB: D1Database;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  SITE_NAME: string;
  SITE_URL: string;
  OPENROUTER_API_KEY: string;
  WHATSAPP_API_KEY: string;
  SSLCOMMERZ_STORE_ID: string;
  SSLCOMMERZ_STORE_PASS: string;
}

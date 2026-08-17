import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

interface CloudflareEnv {
  DB: D1Database;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  SITE_NAME: string;
  SITE_URL: string;
  OPENROUTER_API_KEY: string;
  WHATSAPP_API_KEY: string;
  WHATSAPP_PHONE_ID: string;
  WHATSAPP_VERIFY_TOKEN: string;
  TELEGRAM_BOT_TOKEN: string;
  MESSENGER_PAGE_TOKEN: string;
  PUBLIC_URL: string;
  SSLCOMMERZ_STORE_ID: string;
  SSLCOMMERZ_STORE_PASSWORD: string;
  SSLCOMMERZ_IS_LIVE: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_PEOPLE_SCOPES: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
}

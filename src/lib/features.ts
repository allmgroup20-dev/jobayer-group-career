import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached } from "@/lib/cache";

// Central feature flags for the main app worker.
//
// Every flag defaults to OFF so the platform keeps working without external
// services. Admin can flip them from /company/features (feature_flags table).

/**
 * WhatsApp number verification (OTP) — controlled by the WHATSAPP_VERIFY_ENABLED env var.
 *
 * When enabled, OTP send/verify/login require a real code delivered over
 * WhatsApp. When disabled (default), verification is bypassed:
 *  - /api/auth/otp/send returns a devCode without sending anything
 *  - /api/auth/otp/verify auto-verifies any number
 *  - /api/auth/otp/login logs in / auto-registers without a code
 *  - /api/workers/profile (PUT) allows phone changes without OTP proof
 */
export function isWhatsappVerifyEnabled(): boolean {
  return process.env.WHATSAPP_VERIFY_ENABLED === "true";
}

const FLAGS_CACHE = "feature_flags";

async function getAllFeatureFlags(): Promise<Record<string, boolean>> {
  const cached = await getCached<Record<string, boolean>>(FLAGS_CACHE, 30);
  if (cached) return cached;
  const db = await getDB();
  const rows = await query<{ feature_key: string; enabled: number }>(
    db,
    "SELECT feature_key, enabled FROM feature_flags"
  );
  const flags: Record<string, boolean> = {};
  for (const row of rows) flags[row.feature_key] = row.enabled === 1;
  await setCached(FLAGS_CACHE, flags);
  return flags;
}

/**
 * Server-side feature flag check. Every flag defaults to OFF when missing.
 * Cache is short (30s) so admin toggles apply quickly.
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  try {
    const flags = await getAllFeatureFlags();
    return flags[key] === true;
  } catch {
    return false;
  }
}

export const FEATURE_FLAGS_CACHE_KEY = FLAGS_CACHE;
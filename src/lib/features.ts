// Central feature flags for the main app worker.
//
// Every flag defaults to OFF so the platform keeps working without external
// services. To turn one back on, set the matching env var to "true" in
// wrangler.jsonc (vars) or in the Cloudflare dashboard.

/**
 * WhatsApp number verification (OTP) — currently DISABLED.
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

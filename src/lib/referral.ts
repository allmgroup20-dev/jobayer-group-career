// Fresh single-use referral links. Every share (WhatsApp / copy / Telegram /
// QR / invite) must produce a DIFFERENT link, so a new token is generated on
// each issuance. Attribution keeps working because the register page reads
// only the `ref` (workerId) query param — the `r` token is for uniqueness.
export function generateRefToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function buildReferralLink(origin: string, redirectPath: string, workerId: string, token: string): string {
  return `${origin}${redirectPath}?ref=${encodeURIComponent(workerId)}&r=${token}`;
}

export function buildReferralShareText(lang: "bn" | "en", link: string): string {
  if (lang === "bn") {
    return `🎯 Jobayer Group Career — ৯৭০+ প্রিমিয়াম রিসোর্স মাত্র ৳৯৯ থেকে!\n৯৭০+ রিসোর্স — একসাথে শিখি: ${link}`;
  }
  return `🎯 Join Jobayer Group Career — 970+ premium resources from just ৳99!\n970+ resources — let's learn together: ${link}`;
}

// Client-side fallback (used when the API is unreachable): still issues a
// brand-new unique token so sharing never reuses the same link.
export function freshReferralLink(origin: string, redirectPath: string, workerId: string): { link: string; text: string } {
  const link = buildReferralLink(origin, redirectPath, workerId, generateRefToken());
  return { link, text: "" };
}
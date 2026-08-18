import { NextRequest, NextResponse } from "next/server";
import { requireWorker } from "@/lib/auth/guard";
import { buildReferralLink, buildReferralShareText, generateRefToken } from "@/lib/referral";

// Every GET issues a brand-new single-use referral link (unique `r` token) so
// dashboard / QR / invites / onboarding always share a DIFFERENT link. Only the
// authenticated worker may request their own link.
export async function GET(request: NextRequest) {
  try {
    const workerId = request.nextUrl.searchParams.get("workerId") || "";
    if (!workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }
    const payload = await requireWorker(request, workerId);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const lang = request.nextUrl.searchParams.get("lang") === "en" ? "en" : "bn";
    const origin = request.nextUrl.origin;
    const redirectPath = request.nextUrl.searchParams.get("redirectPath") || "/register";
    const token = generateRefToken();
    const link = buildReferralLink(origin, redirectPath, workerId, token);
    const text = buildReferralShareText(lang, link);

    return NextResponse.json({ link, shareText: text, token });
  } catch (error) {
    console.error("Referral link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
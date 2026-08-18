import { NextRequest, NextResponse } from "next/server";
import { verifyWorkerFromCookies } from "@/lib/session";
import { buildShareLink, buildShareText, generateRoundToken } from "@/lib/share";

// Every GET issues a brand-new single-use link so the "Your Referral Link"
// card shows a DIFFERENT link each time it is shared (copy / WhatsApp / QR).
// The token is unique but attribution works purely via the `ref` (workerId).
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const siteUrl = process.env.SITE_URL || "https://youtube.earner.workers.dev";
    const token = generateRoundToken();

    return NextResponse.json({
      workerId,
      referralLink: buildShareLink(siteUrl, workerId, token),
      shareText: buildShareText(siteUrl, workerId, token),
      siteUrl,
    });
  } catch (error) {
    console.error("Referral config error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyWorkerFromCookies } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const siteUrl = process.env.SITE_URL || "https://youtube.allmgroup20.workers.dev";

    return NextResponse.json({
      workerId,
      referralLink: `${siteUrl}/?ref=${workerId}`,
      shareText: `🎯 এখনই জয়েন করুন! Jobayer Group-এ প্রিমিয়াম রিসোর্স, বোনাস ও রেফারেল আয়ের সুযোগ।\nআমার রেফারেল: ${siteUrl}/?ref=${workerId}`,
      siteUrl,
    });
  } catch (error) {
    console.error("Referral config error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

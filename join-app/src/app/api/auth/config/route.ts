import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    siteName: process.env.SITE_NAME || "Jobayer Group Join",
    siteUrl: process.env.SITE_URL || "https://youtube.offer.dev",
  });
}

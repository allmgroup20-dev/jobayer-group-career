import { NextResponse } from "next/server";
import { isWhatsappVerificationEnabled } from "@/lib/features";

// Tells the UI whether WhatsApp number verification is active. When disabled
// the pages hide every OTP step and let the user continue with just their
// phone number.
export async function GET() {
  return NextResponse.json({ enabled: await isWhatsappVerificationEnabled() });
}

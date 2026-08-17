import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googlePeopleScopes: process.env.GOOGLE_PEOPLE_SCOPES || "",
    facebookAppId: process.env.FACEBOOK_APP_ID || "",
  });
}

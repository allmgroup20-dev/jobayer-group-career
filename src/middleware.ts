import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function signHMAC(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyToken(token: string, secret: string): Promise<{ sub: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const expectedSig = await signHMAC(secret, `${parts[0]}.${parts[1]}`);
    if (parts[2] !== expectedSig) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/company") && pathname !== "/company/login") {
    const token = request.cookies.get("company_token")?.value;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not configured");
    }
    if (!token || !(await verifyToken(token, jwtSecret || ""))) {
      const loginUrl = new URL("/company/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  const lang = request.cookies.get("lang")?.value || "bn";
  response.headers.set("x-language", lang);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|locales|_next/data|images|fonts|sounds|manifest\\.json|sw\\.js|workbox-.*\\.js).*)"],
};

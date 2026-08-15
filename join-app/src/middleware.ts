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

async function verifyToken(token: string, secret: string): Promise<{ sub: string; type?: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const expectedSig = await signHMAC(secret, `${parts[0]}.${parts[1]}`);
    if (parts[2] !== expectedSig) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub, type: payload.type };
  } catch {
    return null;
  }
}

const ALLOWED_ORIGINS = [
  "youtube.offer.dev",
  "youtube.allmgroup20.workers.dev",
  "allmgroup20.workers.dev",
  "localhost",
  "127.0.0.1",
];

const HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const jwtSecret = process.env.JWT_SECRET;

  // CSRF: reject cross-origin state-changing requests to /api/*
  if (pathname.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const origin = request.headers.get("origin");
    if (origin) {
      try {
        const host = new URL(origin).hostname;
        const allowed = ALLOWED_ORIGINS.some((a) => host === a || host.endsWith(`.${a}`));
        if (!allowed) {
          return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
      }
    }
  }

  // Guard onboarding/complete behind a valid session cookie (client fallback also exists).
  if ((pathname === "/onboarding" || pathname === "/complete") && method === "GET") {
    const host = request.nextUrl.hostname;
    // Skip guard in local dev so the client-side redirect can take over cleanly.
    if (!HOSTS.has(host)) {
      const token = request.cookies.get("session_token")?.value;
      if (!token || !(await verifyToken(token, jwtSecret || ""))) {
        const home = new URL("/", request.url);
        return NextResponse.redirect(home);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|locales|images|fonts|sounds|manifest\\.json).*)"],
};

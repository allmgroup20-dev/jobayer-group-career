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
  "career.jobayergroup.com",
  "jobayer-group-career.allmgroup20.workers.dev",
  "localhost",
  "127.0.0.1",
];

// Canonical host: keep every browser navigation on the origin registered in
// Google Cloud Console. Otherwise Google OAuth fails with origin_mismatch on
// the workers.dev link even though the same page works on the custom domain.
const CANONICAL_HOST = "career.jobayergroup.com";
const DEV_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const jwtSecret = process.env.JWT_SECRET;

  // Redirect non-canonical hostname navigations (e.g. *.workers.dev, preview
  // links) to the canonical domain so OAuth/CSRF always sees one origin.
  // /api/* is excluded so same-origin fetches and external integrations
  // keep working regardless of which host served them.
  if (!pathname.startsWith("/api/") && (method === "GET" || method === "HEAD")) {
    const host = request.nextUrl.hostname;
    if (!DEV_HOSTS.has(host) && host !== CANONICAL_HOST) {
      const url = request.nextUrl.clone();
      url.protocol = "https:";
      url.host = CANONICAL_HOST;
      return NextResponse.redirect(url, 301);
    }
  }

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

  if (pathname.startsWith("/company") && pathname !== "/company/login") {
    const token = request.cookies.get("company_token")?.value;
    if (!token || !(await verifyToken(token, jwtSecret || ""))) {
      const loginUrl = new URL("/company/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if ((pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname === "/onboarding") && method === "GET") {
    const token = request.cookies.get("session_token")?.value;
    if (!token || !(await verifyToken(token, jwtSecret || ""))) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  const lang = request.cookies.get("lang")?.value || "bn";
  response.headers.set("x-language", lang);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|locales|_next/data|images|fonts|sounds|manifest\\.json|sw\\.js|workbox-.*\\.js).*)"],
};

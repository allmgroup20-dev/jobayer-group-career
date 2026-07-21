import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function verifyToken(token: string, secret: string): { sub: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/company")) {
    const token = request.cookies.get("company_token")?.value;
    if (!token || !verifyToken(token, process.env.JWT_SECRET || "default-secret")) {
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|locales|_next/data|images|fonts|sounds|manifest\\.json|sw\\.js|workbox-.*\\.js).*)"],
};

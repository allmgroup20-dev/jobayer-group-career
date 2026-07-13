import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const lang = request.cookies.get("lang")?.value || "bn";
  response.headers.set("x-language", lang);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|locales).*)"],
};

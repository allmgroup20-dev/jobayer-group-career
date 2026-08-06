import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "session_token";
export const COMPANY_COOKIE = "company_token";
export const WORKER_TTL = 7 * 24 * 60 * 60;
export const WORKER_REMEMBER_TTL = 30 * 24 * 60 * 60;
export const COMPANY_TTL = 24 * 60 * 60;

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function cookieOptions(maxAge: number, remember = false) {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setSessionCookie(response: NextResponse, token: string, remember = false): NextResponse {
  response.cookies.set(SESSION_COOKIE, token, cookieOptions(remember ? WORKER_REMEMBER_TTL : WORKER_TTL, remember));
  return response;
}

export function setCompanyCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COMPANY_COOKIE, token, cookieOptions(COMPANY_TTL));
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, "", cookieOptions(0));
  return response;
}

export function getSessionToken(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE)?.value ?? null;
}

export function getCompanyToken(request: NextRequest): string | null {
  return request.cookies.get(COMPANY_COOKIE)?.value ?? null;
}

export function verifyWorkerFromCookies(request: NextRequest): Promise<{ sub: string; type: string } | null> {
  const token = getSessionToken(request);
  if (!token) return Promise.resolve(null);
  return import("@/lib/auth").then(({ verifyToken, getJwtSecret }) => verifyToken(token, getJwtSecret()));
}

import type { NextRequest } from "next/server";
import { getSessionToken, getCompanyToken } from "./session";
import { verifyToken, verifyCompanyToken, getJwtSecret } from "./index";

export async function requireWorker(request: NextRequest, workerId?: string): Promise<{ sub: string; type: string } | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  const payload = await verifyToken(token, getJwtSecret());
  if (!payload || payload.type !== "worker") return null;
  if (workerId && payload.sub !== workerId) return null;
  return payload;
}

export async function requireCompany(request: NextRequest): Promise<{ sub: string; type: string } | null> {
  const token = getCompanyToken(request);
  if (!token) return null;
  const payload = await verifyCompanyToken(token, getJwtSecret());
  if (!payload || payload.type !== "company") return null;
  return payload;
}

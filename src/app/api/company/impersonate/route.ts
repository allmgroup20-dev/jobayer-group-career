import { NextRequest, NextResponse } from "next/server";
import { queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateToken, verifyCompanyToken, getJwtSecret } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { workerId } = await request.json() as { workerId: string };
    if (!workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }

    const companyToken = request.cookies.get("company_token")?.value;
    if (!companyToken) {
      return NextResponse.json({ error: "Not authenticated as company" }, { status: 401 });
    }

    const jwtSecret = getJwtSecret();
    const payload = await verifyCompanyToken(companyToken, jwtSecret);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired company session" }, { status: 401 });
    }

    const db = await getDB();
    const worker = await queryFirst<{ worker_id: string; name: string }>(
      db, "SELECT worker_id, name FROM workers WHERE worker_id = ?",
      [workerId]
    );

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const token = await generateToken(worker.worker_id, jwtSecret);
    const response = NextResponse.json({ workerId: worker.worker_id, name: worker.name });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

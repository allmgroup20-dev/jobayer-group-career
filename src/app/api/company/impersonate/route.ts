import { NextRequest, NextResponse } from "next/server";
import { queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateToken, verifyCompanyToken } from "@/lib/auth";

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

    const payload = verifyCompanyToken(companyToken, process.env.JWT_SECRET || "default-secret");
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

    const token = generateToken(worker.worker_id, process.env.JWT_SECRET || "default-secret");

    return NextResponse.json({ token, workerId: worker.worker_id, name: worker.name });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

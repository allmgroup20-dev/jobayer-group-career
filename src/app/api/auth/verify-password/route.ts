import { NextRequest, NextResponse } from "next/server";
import { queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { hashWorkerPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { workerId, password } = await request.json() as { workerId: string; password: string };
    if (!workerId || !password) {
      return NextResponse.json({ valid: false, error: "workerId and password required" }, { status: 400 });
    }
    const db = await getDB();
    const worker = await queryFirst<{ password: string }>(db, "SELECT password FROM workers WHERE worker_id = ?", [workerId]);
    if (!worker) {
      return NextResponse.json({ valid: false, error: "Worker not found" }, { status: 404 });
    }
    const hashed = await hashWorkerPassword(password);
    const valid = hashed === worker.password;
    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false, error: "Internal error" }, { status: 500 });
  }
}

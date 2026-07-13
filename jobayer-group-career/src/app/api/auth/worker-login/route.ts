import { NextRequest, NextResponse } from "next/server";
import { queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { verifyWorkerPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json() as { phone: string; password: string };
    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password required" }, { status: 400 });
    }

    const worker = await queryFirst<{ worker_id: string; name: string; password: string }>(
      await getDB(),
      "SELECT worker_id, name, password FROM workers WHERE phone = ? AND membership_status = 'active'",
      [phone]
    );

    if (!worker) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyWorkerPassword(password, worker.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken(worker.worker_id, process.env.JWT_SECRET || "default-secret");
    return NextResponse.json({ token, workerId: worker.worker_id, name: worker.name });
  } catch (error) {
    console.error("Worker login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { workerId, credentialId, publicKey, deviceName } = await request.json() as {
      workerId: string; credentialId: string; publicKey: string; deviceName?: string;
    };
    if (!workerId || !credentialId || !publicKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const env = await getDB();
    await execute(env,
      `INSERT INTO biometric_credentials (worker_id, credential_id, public_key, device_name)
       VALUES (?, ?, ?, ?)`,
      [workerId, credentialId, publicKey, deviceName || ""]
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "Credential already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { workerId } = await request.json() as { workerId: string };
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });
    const env = await getDB();
    await execute(env, "DELETE FROM biometric_credentials WHERE worker_id = ?", [workerId]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
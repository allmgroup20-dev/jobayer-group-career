import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { ensureWorkerProfileColumns, queryFirst } from "@/lib/queries";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Certificate ID required" }, { status: 400 });
    }
    const env = await getDB();
    await ensureWorkerProfileColumns(env);

    const row = await queryFirst<{ name: string; certificate_id: string; share_task_completed_at: string | null }>(
      env,
      "SELECT name, certificate_id, share_task_completed_at FROM workers WHERE certificate_id = ?",
      [id]
    );

    if (!row) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({
      certificateId: row.certificate_id,
      name: row.name || "",
      completedAt: row.share_task_completed_at || null,
      siteUrl: process.env.SITE_URL || "https://youtube.earner.workers.dev",
    });
  } catch (error) {
    console.error("Certificate verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { ensureWorkerProfileColumns, execute, queryFirst } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";

const NAME_LOCK_DAYS = 30;

function addDays(iso: string, days: number): Date {
  const d = new Date(iso.replace(" ", "T"));
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function lockInfo(editedAt: string | null): { nameLocked: boolean; nameLockedUntil: string | null } {
  if (!editedAt) return { nameLocked: false, nameLockedUntil: null };
  const until = addDays(editedAt, NAME_LOCK_DAYS);
  return {
    nameLocked: until.getTime() > Date.now(),
    nameLockedUntil: until.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Certificate ID required" }, { status: 400 });
    }
    const env = await getDB();
    await ensureWorkerProfileColumns(env);

    const row = await queryFirst<{
      worker_id: string;
      name: string;
      certificate_name: string | null;
      certificate_name_edited_at: string | null;
      certificate_id: string;
      share_task_completed_at: string | null;
    }>(
      env,
      `SELECT worker_id, name, certificate_name, certificate_name_edited_at,
              certificate_id, share_task_completed_at
       FROM workers WHERE certificate_id = ?`,
      [id]
    );

    if (!row) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const payload = await verifyWorkerFromCookies(request);
    const isOwner = !!payload && payload.sub === row.worker_id;
    const { nameLocked, nameLockedUntil } = lockInfo(row.certificate_name_edited_at);
    const certName = row.certificate_name || row.name || "";

    return NextResponse.json({
      certificateId: row.certificate_id,
      name: certName,
      completedAt: row.share_task_completed_at || null,
      siteUrl: process.env.SITE_URL || "https://youtube.earner.workers.dev",
      target: Number(process.env.SHARE_TARGET) || 30,
      isOwner,
      certName,
      nameLocked,
      nameLockedUntil,
    });
  } catch (error) {
    console.error("Certificate verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Certificate ID required" }, { status: 400 });
    }

    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => null) as { name?: string } | null;
    const raw = (body?.name || "").trim();
    if (raw.length < 2 || raw.length > 60) {
      return NextResponse.json({ error: "নাম ২ থেকে ৬০ অক্ষরের মধ্যে হতে হবে" }, { status: 400 });
    }
    if (/[\u0000-\u001F\u007F]/.test(raw)) {
      return NextResponse.json({ error: "নামে অবৈধ অক্ষর আছে" }, { status: 400 });
    }

    const env = await getDB();
    await ensureWorkerProfileColumns(env);

    const row = await queryFirst<{ worker_id: string; certificate_name_edited_at: string | null }>(
      env,
      "SELECT worker_id, certificate_name_edited_at FROM workers WHERE certificate_id = ?",
      [id]
    );

    if (!row) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    if (row.worker_id !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { nameLocked, nameLockedUntil } = lockInfo(row.certificate_name_edited_at);
    if (nameLocked) {
      return NextResponse.json(
        { error: "নামটি ৩০ দিনের জন্য লক আছে", nameLocked: true, nameLockedUntil },
        { status: 403 }
      );
    }

    const now = new Date();
    const nowIso = now.toISOString().replace("T", " ").slice(0, 19);
    await execute(
      env,
      "UPDATE workers SET certificate_name = ?, certificate_name_edited_at = ? WHERE certificate_id = ?",
      [raw, nowIso, id]
    );

    return NextResponse.json({
      success: true,
      certName: raw,
      nameLocked: true,
      nameLockedUntil: lockInfo(nowIso).nameLockedUntil,
    });
  } catch (error) {
    console.error("Certificate name update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
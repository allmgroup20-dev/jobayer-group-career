import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json() as {
      contactName?: string;
      canBeContacted?: boolean;
      canSeeProfile?: boolean;
    };

    const db = await ensureDB();
    const existing = await db.prepare("SELECT id FROM user_phonebooks WHERE id = ?").bind(id).first() as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const updates: string[] = [];
    const vals: unknown[] = [];

    if (body.contactName !== undefined) {
      updates.push("contact_name = ?");
      vals.push(body.contactName);
    }
    if (body.canBeContacted !== undefined) {
      updates.push("can_be_contacted = ?");
      vals.push(body.canBeContacted ? 1 : 0);
    }
    if (body.canSeeProfile !== undefined) {
      updates.push("can_see_profile = ?");
      vals.push(body.canSeeProfile ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("last_checked_at = ?");
    vals.push(new Date().toISOString());
    vals.push(id);

    await db.prepare(`UPDATE user_phonebooks SET ${updates.join(", ")} WHERE id = ?`).bind(...vals).run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Phonebook update error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await ensureDB();
    await db.prepare("DELETE FROM user_phonebooks WHERE id = ?").bind(id).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Phonebook delete error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

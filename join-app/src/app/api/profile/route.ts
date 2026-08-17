import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { ensureWorkerProfileColumns, execute, queryFirst } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";
import { normalizePhone } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const body = await request.json() as Record<string, any>;

    const env = await getDB();

    const hasLocation =
      body.country !== undefined || body.city !== undefined ||
      body.division !== undefined || body.district !== undefined || body.upazila !== undefined;
    if (hasLocation) {
      await ensureWorkerProfileColumns(env);
    }

    const updates: string[] = [];
    const params: unknown[] = [];

    const isWhatsappVerifyEnabled = process.env.WHATSAPP_VERIFY_ENABLED === "true";

    if (body.name) { updates.push("name = ?"); params.push(body.name); }
    if (body.email !== undefined) { updates.push("email = ?"); params.push(body.email || null); }
    if (body.avatarUrl) { updates.push("avatar_url = ?"); params.push(body.avatarUrl); }
    if (body.phone) {
      const cleanPhone = normalizePhone(String(body.phone));
      if (!cleanPhone || cleanPhone.length < 10) {
        return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
      }
      // phone is UNIQUE — reject a number already taken by another worker.
      const existing = await queryFirst<{ worker_id: string }>(
        env, "SELECT worker_id FROM workers WHERE phone = ?", [cleanPhone]
      );
      if (existing && existing.worker_id !== workerId) {
        return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
      }
      updates.push("phone = ?");
      params.push(cleanPhone);
    }
    if (body.ageGroup !== undefined) { updates.push("age_group = ?"); params.push(body.ageGroup || null); }
    if (body.occupation !== undefined) { updates.push("occupation = ?"); params.push(body.occupation || null); }
    if (body.educationLevel !== undefined) { updates.push("education_level = ?"); params.push(body.educationLevel || null); }
    if (body.gender !== undefined) { updates.push("gender = ?"); params.push(body.gender || null); }
    if (body.country !== undefined) { updates.push("country = ?"); params.push(body.country || null); }
    if (body.city !== undefined) { updates.push("city = ?"); params.push(body.city || null); }
    if (body.division !== undefined) { updates.push("division = ?"); params.push(body.division || null); }
    if (body.district !== undefined) { updates.push("district = ?"); params.push(body.district || null); }
    if (body.upazila !== undefined) { updates.push("upazila = ?"); params.push(body.upazila || null); }
    if (body.goal !== undefined) { updates.push("goal = ?"); params.push(body.goal || null); }
    if (body.preferredLearningTime !== undefined) { updates.push("preferred_learning_time = ?"); params.push(body.preferredLearningTime || null); }
    if (body.referralSource !== undefined) { updates.push("referral_source = ?"); params.push(body.referralSource || null); }
    if (body.communicationPreference !== undefined) { updates.push("communication_preference = ?"); params.push(body.communicationPreference || null); }
    if (body.budgetRange !== undefined) { updates.push("budget_range = ?"); params.push(body.budgetRange || null); }
    if (body.religion !== undefined) { updates.push("religion = ?"); params.push(body.religion || null); }
    if (body.preferredLanguage !== undefined) { updates.push("preferred_language = ?"); params.push(body.preferredLanguage || null); }
    if (body.interestsUpdatedAt !== undefined) { updates.push("interests_updated_at = ?"); params.push(body.interestsUpdatedAt); }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    params.push(workerId);

    await execute(env,
      `UPDATE workers SET ${updates.join(", ")} WHERE worker_id = ?`,
      params
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

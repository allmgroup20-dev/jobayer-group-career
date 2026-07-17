import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { hashWorkerPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  if (!workerId) {
    return NextResponse.json({ error: "workerId required" }, { status: 400 });
  }

  try {
    const worker = await queryFirst<Record<string, any>>(
      await getDB(),
      `SELECT w.worker_id, w.name, w.phone, w.email, w.sponsor_id, w.sponsor_name,
              w.level, w.join_date, w.balance, w.total_earned, w.total_spent,
              w.total_team_members, w.membership_status, w.preferred_language,
              w.age_group, w.occupation, w.education_level, w.avatar_url,
              w.gender, w.country, w.city, w.goal, w.preferred_learning_time,
               w.referral_source, w.communication_preference, w.budget_range,
               w.religion,
               w.interests_updated_at, w.created_at, w.updated_at,
              cl.level_name, cl.level_name_bn
       FROM workers w
       LEFT JOIN commission_levels cl ON cl.level_number = w.level AND cl.is_active = 1
       WHERE w.worker_id = ?`,
      [workerId]
    );

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json({
      workerId: worker.worker_id,
      name: worker.name,
      phone: worker.phone,
      email: worker.email,
      sponsorId: worker.sponsor_id,
      sponsorName: worker.sponsor_name,
      level: worker.level,
      levelName: worker.level_name || `Level ${worker.level}`,
      levelNameBn: worker.level_name_bn || null,
      joinDate: worker.join_date,
      balance: worker.balance,
      totalEarned: worker.total_earned,
      totalSpent: worker.total_spent,
      totalTeamMembers: worker.total_team_members,
      membershipStatus: worker.membership_status,
      preferredLanguage: worker.preferred_language || "bn",
      ageGroup: worker.age_group || null,
      occupation: worker.occupation || null,
      educationLevel: worker.education_level || null,
      avatarUrl: worker.avatar_url || null,
      gender: worker.gender || null,
      country: worker.country || null,
      city: worker.city || null,
      goal: worker.goal || null,
      preferredLearningTime: worker.preferred_learning_time || null,
      referralSource: worker.referral_source || null,
      communicationPreference: worker.communication_preference || "whatsapp",
      budgetRange: worker.budget_range || null,
      religion: worker.religion || null,
      profileCompleted: !!(worker.name && !worker.name.startsWith("User") && (worker.age_group || worker.occupation || worker.education_level || worker.religion)),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, any>;
    const { workerId } = body;
    if (!workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }

    const env = await getDB();
    const updates: string[] = [];
    const params: unknown[] = [];

    if (body.name) { updates.push("name = ?"); params.push(body.name); }
    if (body.email !== undefined) { updates.push("email = ?"); params.push(body.email || null); }
    if (body.password) {
      const hashed = await hashWorkerPassword(body.password);
      updates.push("password = ?");
      params.push(hashed);
    }
    if (body.preferredLanguage) { updates.push("preferred_language = ?"); params.push(body.preferredLanguage); }
    if (body.ageGroup) { updates.push("age_group = ?"); params.push(body.ageGroup); }
    if (body.occupation) { updates.push("occupation = ?"); params.push(body.occupation); }
    if (body.educationLevel) { updates.push("education_level = ?"); params.push(body.educationLevel); }
    if (body.avatarUrl) { updates.push("avatar_url = ?"); params.push(body.avatarUrl); }
    if (body.gender) { updates.push("gender = ?"); params.push(body.gender); }
    if (body.country) { updates.push("country = ?"); params.push(body.country); }
    if (body.city) { updates.push("city = ?"); params.push(body.city); }
    if (body.goal) { updates.push("goal = ?"); params.push(body.goal); }
    if (body.preferredLearningTime) { updates.push("preferred_learning_time = ?"); params.push(body.preferredLearningTime); }
    if (body.referralSource) { updates.push("referral_source = ?"); params.push(body.referralSource); }
    if (body.communicationPreference) { updates.push("communication_preference = ?"); params.push(body.communicationPreference); }
    if (body.budgetRange) { updates.push("budget_range = ?"); params.push(body.budgetRange); }
    if (body.religion) { updates.push("religion = ?"); params.push(body.religion); }

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

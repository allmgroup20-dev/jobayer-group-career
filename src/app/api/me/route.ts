import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { queryFirstSafe } from "@/lib/db/queries";
import { verifyWorkerFromCookies } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const db = await getDB();
    const worker = await queryFirstSafe<Record<string, any>>(
      db,
      `SELECT w.worker_id, w.name, w.phone, w.email, w.google_id, w.sponsor_id, w.sponsor_name,
              w.level, w.join_date, w.membership_status, w.avatar_url, w.preferred_language,
              w.age_group, w.occupation, w.education_level, w.gender, w.country, w.city,
              w.division, w.district, w.upazila, w.city_corporation, w.ward, w.area, w.union_name, w.pourashava,
              w.goal, w.preferred_learning_time, w.referral_source, w.communication_preference,
              w.budget_range, w.religion, w.total_team_members, w.resource_income,
              w.interests_updated_at, w.created_at
       FROM workers w WHERE w.worker_id = ?`,
      [workerId]
    );
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }
    const joinsRow = await queryFirstSafe<{ total: number }>(db, "SELECT COUNT(*) AS total FROM workers WHERE sponsor_id = ?", [workerId]);
    const referralJoins = joinsRow?.total ?? 0;
    const looksLikePhone = (value?: string) => {
      if (!value) return false;
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 13;
    };
    return NextResponse.json({
      worker_id: worker.worker_id,
      workerId: worker.worker_id,
      name: worker.name || "",
      phone: looksLikePhone(worker.phone) ? worker.phone : "",
      email: worker.email || "",
      avatarUrl: worker.avatar_url || null,
      googleId: worker.google_id || null,
      sponsorId: worker.sponsor_id || null,
      sponsorName: worker.sponsor_name || null,
      level: worker.level ?? 1,
      joinDate: worker.join_date || null,
      membershipStatus: worker.membership_status || "general",
      preferredLanguage: worker.preferred_language || "bn",
      ageGroup: worker.age_group || "",
      occupation: worker.occupation || "",
      educationLevel: worker.education_level || "",
      gender: worker.gender || "",
      country: worker.country || "",
      city: worker.city || "",
      division: worker.division || "",
      district: worker.district || "",
      upazila: worker.upazila || "",
      cityCorporation: worker.city_corporation || "",
      ward: worker.ward || "",
      area: worker.area || "",
      union: worker.union_name || "",
      pourashava: worker.pourashava || "",
      goal: worker.goal || "",
      preferredLearningTime: worker.preferred_learning_time || "",
      referralSource: worker.referral_source || "",
      communicationPreference: worker.communication_preference || "whatsapp",
      budgetRange: worker.budget_range || "",
      religion: worker.religion || "",
      totalTeamMembers: worker.total_team_members ?? 0,
      resourceIncome: worker.resource_income ?? 0,
      referralJoins,
      interestsUpdatedAt: worker.interests_updated_at || null,
      profileCompleted: !!(
        worker.age_group && worker.occupation && worker.education_level &&
        worker.gender && worker.country && worker.city && worker.goal &&
        worker.preferred_learning_time && worker.referral_source &&
        worker.communication_preference && worker.religion
      ),
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

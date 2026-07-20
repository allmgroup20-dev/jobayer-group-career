import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

const SECTOR_COMM_GUIDE: Record<string, { en: string; bn: string }> = {
  student: { en: "Speak their language — focus on education, career growth, affordability. Use 'learning', 'skill', 'future'.", bn: "তাদের ভাষায় কথা বলুন — শিক্ষা, ক্যারিয়ার গ্রোথ, মূল্যের ওপর ফোকাস করুন। 'শেখা', 'দক্ষতা', 'ভবিষ্যত' শব্দ ব্যবহার করুন।" },
  homemaker: { en: "Speak their language — family benefits, security, ease of use. Use 'family', 'security', 'easy'.", bn: "তাদের ভাষায় কথা বলুন — পরিবারের সুবিধা, নিরাপত্তা, সহজ ব্যবহার। 'পরিবার', 'নিরাপত্তা', 'সহজ' শব্দ ব্যবহার করুন।" },
  job_holder: { en: "Speak their language — extra income, time efficiency, side hustle. Use 'additional income', 'time saving'.", bn: "তাদের ভাষায় কথা বলুন — অতিরিক্ত আয়, সময় বাঁচানো, সাইড হাস্টল। 'অতিরিক্ত আয়', 'সময় বাঁচানো' শব্দ ব্যবহার করুন।" },
  business_owner: { en: "Speak their language — ROI, leverage, scalability. Use 'growth', 'profit', 'expansion'.", bn: "তাদের ভাষায় কথা বলুন — ROI, লিভারেজ, স্কেলেবিলিটি। 'গ্রোথ', 'লাভ', 'সম্প্রসারণ' শব্দ ব্যবহার করুন।" },
  freelancer: { en: "Speak their language — flexibility, income stability, global opportunities. Use 'freedom', 'global', 'stable income'.", bn: "তাদের ভাষায় কথা বলুন — নমনীয়তা, আয়ের স্থিতিশীলতা, বিশ্বব্যাপী সুযোগ। 'স্বাধীনতা', 'গ্লোবাল', 'স্থিতিশীল আয়' শব্দ ব্যবহার করুন।" },
  rural: { en: "Speak their language — simple, trust-based, community. Use 'village', 'trust', 'community', 'support'.", bn: "তাদের ভাষায় কথা বলুন — সহজ, বিশ্বাস-ভিত্তিক, সম্প্রদায়। 'গ্রাম', 'বিশ্বাস', 'সম্প্রদায়', 'সাপোর্ট' শব্দ ব্যবহার করুন।" },
  unemployed: { en: "Speak their language — hope, opportunity, transformation. Use 'new beginning', 'chance', 'hope', 'change'.", bn: "তাদের ভাষায় কথা বলুন — আশা, সুযোগ, পরিবর্তন। 'নতুন শুরু', 'সুযোগ', 'আশা', 'পরিবর্তন' শব্দ ব্যবহার করুন।" },
};

function getCommGuide(sector: string | null): { en: string; bn: string } {
  return SECTOR_COMM_GUIDE[sector || ""] || { en: "Listen first. Understand their world. Build trust before presenting anything.", bn: "আগে শুনুন। তাদের জগত বুঝুন। কিছু উপস্থাপনের আগে বিশ্বাস তৈরি করুন।" };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  try {
    const db = await getDB();
    let members;
    if (workerId) {
      members = await query(
        db,
        `WITH RECURSIVE subtree AS (
           SELECT worker_id, parent_id FROM mlm_tree WHERE worker_id = ?
           UNION ALL
           SELECT t.worker_id, t.parent_id
           FROM mlm_tree t
           INNER JOIN subtree s ON t.parent_id = s.worker_id
         )
         SELECT w.worker_id, w.name, w.phone, w.level, w.join_date,
                w.total_team_members, w.occupation, t.parent_id,
                COALESCE(p.sector, '') as sector
         FROM workers w
         INNER JOIN mlm_tree t ON w.worker_id = t.worker_id
         LEFT JOIN ai_phone_profiles p ON w.phone = p.phone
         WHERE w.membership_status IN ('general', 'premium')
         AND w.worker_id IN (SELECT worker_id FROM subtree)
          ORDER BY t.level_number ASC
          LIMIT 1000`,
         [workerId]
      );
    } else {
      members = await query(
        db,
        `SELECT w.worker_id, w.name, w.phone, w.level, w.join_date,
                w.total_team_members, w.occupation, t.parent_id,
                COALESCE(p.sector, '') as sector
         FROM workers w
         INNER JOIN mlm_tree t ON w.worker_id = t.worker_id
         LEFT JOIN ai_phone_profiles p ON w.phone = p.phone
         WHERE w.membership_status IN ('general', 'premium')
         ORDER BY t.level_number ASC
         LIMIT 1000`,
         []
      );
    }

    const enriched = (members || []).map((m: any) => ({
      ...m,
      commGuide: getCommGuide(m.sector || m.occupation),
    }));

    return NextResponse.json({ members: enriched, total: enriched.length });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

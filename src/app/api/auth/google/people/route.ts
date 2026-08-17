import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { requireWorker } from "@/lib/auth/guard";
import { normalizePhone } from "@/lib/auth";

const PERSON_FIELDS = "birthdays,genders,organizations,addresses,phoneNumbers";

type PeoplePerson = {
  birthdays?: { metadata?: { primary?: boolean }; date?: { year?: number; month?: number; day?: number } }[];
  genders?: { value?: string }[];
  organizations?: { type?: string; name?: string; title?: string }[];
  addresses?: { type?: string; city?: string; region?: string; formattedValue?: string }[];
  phoneNumbers?: { value?: string; canonicalForm?: string }[];
};

async function fetchPeople(accessToken: string): Promise<PeoplePerson> {
  const res = await fetch(
    `https://people.googleapis.com/v1/people/me?personFields=${PERSON_FIELDS}&sources=READ_SOURCE_TYPE_PROFILE`,
    { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" } }
  );
  if (!res.ok) throw new Error("people api failed");
  return res.json();
}

function ageFromBirthday(date?: { year?: number; month?: number; day?: number }): number | null {
  if (!date?.year || !date?.month || !date?.day) return null;
  const now = new Date();
  let age = now.getFullYear() - date.year;
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if (m < date.month || (m === date.month && d < date.day)) age--;
  return age >= 0 && age <= 110 ? age : null;
}

// Map a Google organization title to our coded occupation values (best effort).
function mapOccupation(text?: string): string | null {
  const s = (text || "").toLowerCase();
  if (!s) return null;
  if (/(student|university|college|school)/.test(s)) return "student";
  if (/freelanc/.test(s)) return "freelancer";
  if (/(youtube|content creator|influencer|creator)/.test(s)) return "content_creator";
  if (/(teacher|professor|lecturer|faculty|school teacher)/.test(s)) return "teacher";
  if (/(doctor|physician|nurse|dentist|health)/.test(s)) return "doctor";
  if (/(engineer|developer|programmer|technician|software)/.test(s)) return "engineer";
  if (/(business|entrepreneur|founder|owner|shop)/.test(s)) return "business";
  if (/(government|govt|bank|police|military|officer)/.test(s)) return "govt_job";
  if (/(manager|analyst|executive|accountant|marketing|sales|hr|admin|associate)/.test(s)) return "employed";
  if (/(homemaker|housewife)/.test(s)) return "homemaker";
  if (/retired/.test(s)) return "retired";
  if (/(unemployed|job seeker|seeking)/.test(s)) return "unemployed";
  return null;
}

// Map a Google org type to our coded education levels (BD convention, best effort).
function mapEducation(type?: string): string | null {
  if (type === "universities") return "bachelor";
  if (type === "colleges") return "hsc";
  if (type === "schools") return "ssc";
  return null;
}

// ---- Bangladesh division/district fuzzy match against our static geo index ----
type GeoIndex = { divisions: { id: string; en: string; bn: string; districts: { id: string; en: string; bn: string }[] }[] };

let geoCache: GeoIndex | null = null;

async function loadGeoIndex(): Promise<GeoIndex> {
  if (geoCache) return geoCache;
  const base = process.env.SITE_URL || "https://career.jobayergroup.com";
  const res = await fetch(`${base}/geo/index.json`, { cache: "force-cache" });
  if (!res.ok) throw new Error("geo index failed");
  geoCache = (await res.json()) as GeoIndex;
  return geoCache;
}

const normGeo = (s?: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

async function matchGeo(city?: string, region?: string): Promise<{ division?: string; district?: string } | null> {
  const index = await loadGeoIndex().catch(() => null);
  if (!index) return null;
  const hay = [normGeo(region), normGeo(city)].filter(Boolean).join(" ");
  if (!hay) return null;
  const matches = new Map<string, string>();
  for (const div of index.divisions) {
    for (const dist of div.districts) {
      const dn = normGeo(dist.en);
      const dnb = normGeo(dist.bn);
      if ((dn && (hay.includes(dn) || dn.includes(hay))) || (dnb && (hay.includes(dnb) || dnb.includes(hay)))) {
        matches.set(dist.en, div.en);
      }
    }
  }
  if (matches.size === 1) {
    const [district, division] = [...matches.entries()][0];
    return { division, district };
  }
  return null;
}

// Fetches Google People data once and fills ONLY empty profile fields.
// The access token is never stored. Returns the list of updated fields.
export async function enrichWorkerProfile(
  env: any,
  workerId: string,
  accessToken: string
): Promise<string[]> {
  const person = await fetchPeople(accessToken);

  const worker = await queryFirst<Record<string, any>>(
    env,
    `SELECT name, phone, gender, age_group, occupation, education_level, city, division, district
     FROM workers WHERE worker_id = ?`,
    [workerId]
  );
  if (!worker) return [];

  const updates: string[] = [];
  const params: unknown[] = [];

  // Gender (exact codes match the onboarding options).
  const gender = person.genders?.find((g) => g.value)?.value?.toLowerCase();
  if (!worker.gender && (gender === "male" || gender === "female" || gender === "other")) {
    updates.push("gender = ?");
    params.push(gender);
  }

  // Age from birthday.
  const bday = person.birthdays?.find((b) => b.date?.year);
  const age = bday ? ageFromBirthday(bday.date) : null;
  if (!worker.age_group && age !== null) {
    updates.push("age_group = ?");
    params.push(String(age));
  }

  // Occupation from org title (coded best-effort).
  const orgText = person.organizations
    ?.map((o) => [o.title, o.name].filter(Boolean).join(" "))
    .find(Boolean);
  const occupation = mapOccupation(orgText);
  if (!worker.occupation && occupation) {
    updates.push("occupation = ?");
    params.push(occupation);
  }

  // Education level from org type (coded best-effort).
  const eduOrg = person.organizations?.find((o) => o.type && mapEducation(o.type));
  const education = eduOrg ? mapEducation(eduOrg.type) : null;
  if (!worker.education_level && education) {
    updates.push("education_level = ?");
    params.push(education);
  }

  // Address -> city + division/district (only when we're confident).
  const addr = person.addresses?.find((a) => a.city || a.region || a.formattedValue);
  if (addr) {
    const city = (addr.city || addr.region || addr.formattedValue?.split(",")[0]?.trim() || "").trim();
    if (!worker.city && city) {
      updates.push("city = ?");
      params.push(city);
    }
    const geo = await matchGeo(addr.city, addr.region).catch(() => null);
    if (geo) {
      if (!worker.division && geo.division) {
        updates.push("division = ?");
        params.push(geo.division);
      }
      if (!worker.district && geo.district) {
        updates.push("district = ?");
        params.push(geo.district);
      }
    }
  }

  // Phone: only replace a placeholder (google_/fb_/email) with a real BD
  // number that isn't already registered to another worker.
  const isPlaceholder = /^(google_|fb_)/.test(worker.phone || "") || (worker.phone || "").includes("@");
  if (isPlaceholder) {
    const rawPhone = person.phoneNumbers?.find((p) => p.canonicalForm || p.value);
    if (rawPhone) {
      const clean = normalizePhone(rawPhone.canonicalForm || rawPhone.value || "");
      if (clean.length === 13 && clean.startsWith("880")) {
        const taken = await queryFirst<{ worker_id: string }>(
          env, "SELECT worker_id FROM workers WHERE phone = ?", [clean]
        );
        if (!taken) {
          updates.push("phone = ?");
          params.push(clean);
        }
      }
    }
  }

  if (updates.length === 0) return [];

  updates.push("updated_at = datetime('now')");
  params.push(workerId);
  await execute(env, `UPDATE workers SET ${updates.join(", ")} WHERE worker_id = ?`, params);
  return updates;
}

export async function POST(request: NextRequest) {
  try {
    if (!(process.env.GOOGLE_PEOPLE_SCOPES || "")) {
      return NextResponse.json({ error: "Not configured" }, { status: 501 });
    }
    const { accessToken } = await request.json() as { accessToken?: string };
    if (!accessToken) {
      return NextResponse.json({ error: "accessToken required" }, { status: 400 });
    }

    const payload = await requireWorker(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const updated = await enrichWorkerProfile(await getDB(), payload.sub, accessToken);
    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    console.error("Google people enrichment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

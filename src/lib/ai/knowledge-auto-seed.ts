import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

const SOURCE = "auto_seed";

async function upsertKnowledge(db: any, category: string, title: string, content: string, tags: string[], confidence = 0.85): Promise<void> {
  try {
    const existing = await query<any>(
      db,
      "SELECT id FROM knowledge_entries WHERE title = ? AND source_name = ? LIMIT 1",
      [title, SOURCE]
    );
    if (existing.length > 0) {
      await execute(
        db,
        "UPDATE knowledge_entries SET content = ?, confidence = ?, updated_at = datetime('now') WHERE id = ?",
        [content, confidence, existing[0].id]
      );
    } else {
      await execute(
        db,
        "INSERT INTO knowledge_entries (category, title, content, source_type, source_name, confidence, tags, is_active, created_at, updated_at) VALUES (?, ?, ?, 'auto', ?, ?, ?, 1, datetime('now'), datetime('now'))",
        [category, title, content, SOURCE, confidence, tags.join(",")]
      );
    }
  } catch {}
}

export async function autoSeedKnowledge(): Promise<{ seeded: number; categories: string[] }> {
  const dbRaw = await getDB();
  if (!dbRaw) return { seeded: 0, categories: [] };
  const db = { DB: dbRaw.DB };
  let count = 0;
  const cats = new Set<string>();

  try {
    // 1. Seed products
    const products = await query<any>(
      db,
      "SELECT name, name_bn, description, description_bn, price, category, commission_percentage, commission_fixed FROM products WHERE is_active = 1 LIMIT 50"
    );
    for (const p of products) {
      const cat = p.category || "Products";
      cats.add(cat);
      const content = `${p.name}${p.name_bn ? ` / ${p.name_bn}` : ""}\nPrice: ৳${p.price}\n${p.description || p.description_bn || ""}${p.commission_percentage ? `\nCommission: ${p.commission_percentage}%` : ""}`;
      await upsertKnowledge(db, cat, `Product: ${p.name}`, content, [cat, "product", "pricing"], 0.95);
      count++;
    }

    // 2. Seed courses
    const courses = await query<any>(
      db,
      "SELECT c.title, c.title_bn, c.description, c.description_bn, c.price, c.is_premium, cc.name as category_name FROM courses c LEFT JOIN course_categories cc ON c.category_id = cc.id WHERE c.is_visible = 1 LIMIT 50"
    );
    for (const c of courses) {
      const cat = c.category_name || "Courses";
      cats.add(cat);
      const premiumTag = c.is_premium ? "Premium" : "Free";
      const content = `${c.title}${c.title_bn ? ` / ${c.title_bn}` : ""}\nPrice: ${c.price > 0 ? `৳${c.price}` : "Free"} (${premiumTag})\n${c.description || c.description_bn || ""}`;
      await upsertKnowledge(db, cat, `Course: ${c.title}`, content, [cat, "course", premiumTag], 0.9);
      count++;
    }

    // 3. Seed trainers
    const trainers = await query<any>(
      db,
      "SELECT name, name_bn, title, specialty, bio, experience_years, institution FROM trainers WHERE is_active = 1 LIMIT 30"
    );
    for (const t of trainers) {
      const content = `${t.name}${t.name_bn ? ` / ${t.name_bn}` : ""}\n${t.title || ""}${t.specialty ? `\nSpecialty: ${t.specialty}` : ""}${t.experience_years ? `\nExperience: ${t.experience_years} years` : ""}\n${t.bio || ""}`;
      await upsertKnowledge(db, "Trainers", `Trainer: ${t.name}`, content, ["trainer", "instructor", t.specialty || "general"], 0.9);
      count++;
    }

    // 4. Seed institutions
    const institutions = await query<any>(
      db,
      "SELECT name, name_bn, description, description_bn FROM institutions WHERE is_active = 1 LIMIT 20"
    );
    for (const inst of institutions) {
      const content = `${inst.name}${inst.name_bn ? ` / ${inst.name_bn}` : ""}\n${inst.description || inst.description_bn || ""}`;
      await upsertKnowledge(db, "Institutions", `Institution: ${inst.name}`, content, ["institution", "partner"], 0.85);
      count++;
    }

    // 5. Seed commission levels
    const levels = await query<any>(
      db,
      "SELECT level_number, level_name, level_name_bn, percentage, fixed_amount FROM commission_levels WHERE is_active = 1 ORDER BY level_number ASC LIMIT 20"
    );
    if (levels.length > 0) {
      const content = levels.map((l: any) =>
        `Level ${l.level_number}: ${l.level_name}${l.level_name_bn ? ` / ${l.level_name_bn}` : ""} — ${l.percentage ? `${l.percentage}%` : ""}${l.fixed_amount ? ` + ৳${l.fixed_amount}` : ""}`
      ).join("\n");
      await upsertKnowledge(db, "Income", "Commission Structure", content, ["commission", "income", "levels"], 0.95);
      count++;
    }

    // 6. Seed company settings (pricing, offers)
    const settings = await query<any>(
      db,
      "SELECT setting_key, setting_value FROM company_settings WHERE setting_type = 'pricing' OR setting_key LIKE '%price%' OR setting_key LIKE '%fee%' OR setting_key LIKE '%commission%' LIMIT 30"
    );
    for (const s of settings) {
      await upsertKnowledge(db, "Company", `Setting: ${s.setting_key}`, `${s.setting_key}: ${s.setting_value}`, ["company", "setting", "pricing"], 0.9);
      count++;
    }

    // 7. Seed membership pricing from resource_purchases or company_settings
    const memberships = await query<any>(
      db,
      "SELECT setting_key, setting_value FROM company_settings WHERE setting_key IN ('premium_price', 'vip_price', 'standard_price', 'monthly_membership', 'yearly_membership', 'lifetime_membership') LIMIT 10"
    );
    for (const m of memberships) {
      await upsertKnowledge(db, "Pricing", `Membership: ${m.setting_key}`, `${m.setting_key}: ৳${m.setting_value}`, ["membership", "pricing", "plan"], 0.95);
      count++;
    }
    // Fallback: if no DB settings, use known pricing
    if (memberships.length === 0) {
      await upsertKnowledge(db, "Pricing", "Membership: Premium Plan", "Premium: 1,500 TK one-time", ["membership", "pricing", "premium"], 0.9);
      await upsertKnowledge(db, "Pricing", "Membership: VIP Plan", "VIP: 5,000 TK one-time", ["membership", "pricing", "vip"], 0.9);
      await upsertKnowledge(db, "Pricing", "Membership: Standard Plan", "Standard: Free (basic access)", ["membership", "pricing", "free"], 0.9);
      count += 3;
    }

  } catch (e) {
    console.error("[AutoSeed] Error:", (e as Error)?.message);
  }

  return { seeded: count, categories: [...cats] };
}

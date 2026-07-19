import { NextResponse } from "next/server";
import { batch } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { courses, categoryOrder, categoryNames } from "@/data/courses-data";
import { invalidateCache } from "@/lib/cache";

const BATCH_SIZE = 100;

export async function POST() {
  try {
    const db = await getDB();

    // Normalize category names: lowercase variants -> canonical
    const catCanon = new Map<string, string>();
    catCanon.set("eshikhon", "E-Shikhon");
    catCanon.set("10ms pdf", "10MS PDF");
    catCanon.set("youtube marketing", "YouTube Marketing");
    catCanon.set("spoken english", "Spoken English");

    const getCanon = (name: string) => catCanon.get(name.toLowerCase()) || name;

    // Collect unique categories preserving order
    const seenCats = new Set<string>();
    const uniqueCats: { name: string; bn: string }[] = [];

    for (const rawCat of categoryOrder) {
      const cat = getCanon(rawCat);
      const key = cat.toLowerCase();
      if (seenCats.has(key)) continue;
      seenCats.add(key);
      const bn = categoryNames[rawCat] || categoryNames[cat] || cat;
      uniqueCats.push({ name: cat, bn });
    }

    // Build category ID map (1-based)
    const catMap = new Map<string, number>();
    uniqueCats.forEach((c, i) => catMap.set(c.name, i + 1));

    // ── Clear existing data ──
    await batch(db, [
      { sql: "DELETE FROM course_category_map" },
      { sql: "DELETE FROM course_files" },
      { sql: "DELETE FROM courses" },
      { sql: "DELETE FROM course_categories" },
    ]);

    // ── Batch insert categories ──
    const catInserts = uniqueCats.map((c, i) => ({
      sql: "INSERT INTO course_categories (id, name, name_bn, icon, is_visible, sort_order) VALUES (?, ?, ?, '📌', 1, 0)",
      params: [i + 1, c.name, c.bn],
    }));
    for (let i = 0; i < catInserts.length; i += BATCH_SIZE) {
      await batch(db, catInserts.slice(i, i + BATCH_SIZE));
    }

    // ── Batch insert courses + files (parallel IDs: course id = array index + 1) ──
    const courseBatchSize = 50; // smaller to stay within limits
    for (let start = 0; start < courses.length; start += courseBatchSize) {
      const chunk = courses.slice(start, start + courseBatchSize);
      const stmts: { sql: string; params: unknown[] }[] = [];

      for (let j = 0; j < chunk.length; j++) {
        const course = chunk[j];
        const courseId = start + j + 1;
        const canonCat = getCanon(course.cat);
        const catId = catMap.get(canonCat) || null;

        stmts.push({
          sql: `INSERT INTO courses (id, title, title_bn, description, description_bn, is_new, is_visible, icon, price, is_premium)
               VALUES (?, ?, ?, ?, ?, 0, 1, ?, 0, 1)`,
          params: [courseId, course.title, null, course.desc, null, course.icon || "📌"],
        });
        if (catId) {
          stmts.push({
            sql: "INSERT OR IGNORE INTO course_category_map (course_id, category_id) VALUES (?, ?)",
            params: [courseId, catId],
          });
        }
        stmts.push({
          sql: `INSERT INTO course_files (course_id, label, label_bn, url, file_type, sort_order)
               VALUES (?, ?, ?, ?, 'link', 0)`,
          params: [courseId, "Course Link", "কোর্স লিংক", course.url],
        });
      }

      await batch(db, stmts);
    }

    await invalidateCache("courses");
    await invalidateCache("course_categories");
    return NextResponse.json({
      success: true,
      categoriesSeeded: uniqueCats.length,
      coursesSeeded: courses.length,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error",
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { courses, categoryOrder, categoryNames } from "@/data/courses-data";
import { invalidateCache } from "@/lib/cache";

export async function POST() {
  try {
    const db = await getDB();

    const existing = await query<{ cnt: number }>(db, "SELECT COUNT(*) as cnt FROM courses");
    if (existing[0]?.cnt > 0) {
      return NextResponse.json({ error: "Courses already exist. Delete all first if you want to re-seed." }, { status: 400 });
    }

    const catMap = new Map<string, number>();

    for (const cat of categoryOrder) {
      const bn = categoryNames[cat] || cat;
      const existingCat = await query<{ id: number }>(db, "SELECT id FROM course_categories WHERE name = ?", [cat]);
      if (existingCat.length > 0) {
        catMap.set(cat, existingCat[0].id);
      } else {
        await execute(db, "INSERT INTO course_categories (name, name_bn, is_visible) VALUES (?, ?, 1)", [cat, bn]);
        const result = await query<{ id: number }>(db, "SELECT id FROM course_categories WHERE name = ?", [cat]);
        if (result.length > 0) catMap.set(cat, result[0].id);
      }
    }

    let count = 0;
    for (const course of courses) {
      const catId = catMap.get(course.cat) || null;
      await execute(db,
        `INSERT INTO courses (title, title_bn, description, description_bn, category_id, is_new, is_visible, icon, price, is_premium)
         VALUES (?, ?, ?, ?, ?, 0, 1, ?, 0, 0)`,
        [course.title, null, course.desc, null, catId, course.icon || "📌"]
      );
      count++;

      await execute(db,
        `INSERT INTO course_files (course_id, label, label_bn, url, file_type, sort_order)
         VALUES (?, ?, ?, ?, 'link', 0)`,
        [count, "Course Link", "কোর্স লিংক", course.url]
      );
    }

    await invalidateCache("courses");
    return NextResponse.json({ success: true, categoriesSeeded: catMap.size, coursesSeeded: count });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}

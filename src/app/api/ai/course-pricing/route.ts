import { NextRequest, NextResponse } from "next/server";
import { queryFirst, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { callAI } from "@/lib/ai/router";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { courseId: number };
    if (!body.courseId) {
      return NextResponse.json({ error: "courseId required" }, { status: 400 });
    }

    const db = await getDB();
    const course = await queryFirst<any>(db,
      `SELECT c.id, c.title, c.title_bn as titleBn, c.description, c.description_bn as descriptionBn,
              c.is_new as isNew, c.is_visible as isVisible, c.icon, c.price, c.is_premium as isPremium,
              (SELECT COUNT(*) FROM course_files cf WHERE cf.course_id = c.id) as fileCount,
              (SELECT json_group_array(cat.name) FROM course_category_map m JOIN course_categories cat ON cat.id = m.category_id WHERE m.course_id = c.id) as categoryNames,
              (SELECT json_group_array(cat.name_bn) FROM course_category_map m JOIN course_categories cat ON cat.id = m.category_id WHERE m.course_id = c.id) as categoryNamesBn
       FROM courses c WHERE c.id = ?`,
      [body.courseId]
    );
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const catNames = course.categoryNames ? JSON.parse(course.categoryNames).join(", ") : "";
    const catNamesBn = course.categoryNamesBn ? JSON.parse(course.categoryNamesBn).join(", ") : "";

    const prompt = `You are a pricing analyst. Given a course/resource, suggest an appropriate price in BDT and whether it should be premium (paid).

Course Information:
- Title: ${course.title}
- Bengali Title: ${course.titleBn || "N/A"}
- Description: ${course.description || "N/A"}
- Bengali Description: ${course.descriptionBn || "N/A"}
- Categories: ${catNames || catNamesBn || "Uncategorized"}
- Number of Files: ${course.fileCount || 1}
- Current Price: ${course.price || 0} BDT
- Current Premium Status: ${course.isPremium === 1 ? "Premium" : "Free"}

Analyze based on:
1. Number of files/resources (more files = higher value)
2. Category type (technical/professional courses = higher price)
3. Title and description quality and specificity
4. Market benchmarks for similar resources

Respond with valid JSON only (no markdown):
{
  "suggestedPriceBDT": <number>,
  "suggestedIsPremium": <true|false>,
  "reasoning": "<brief 1-sentence explanation in Bengali>",
  "confidence": <0.0-1.0>
}`;

    const response = await callAI({ messages: [{ role: "user", content: prompt }] }, 800);

    let suggestion;
    try {
      const cleaned = response.text.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
      suggestion = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({
        error: "AI returned invalid JSON",
        rawResponse: response.text,
      }, { status: 422 });
    }

    return NextResponse.json({
      courseId: course.id,
      courseTitle: course.title,
      suggestion,
      model: response.model,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "AI pricing analysis failed"
    }, { status: 500 });
  }
}

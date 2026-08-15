import { NextResponse } from "next/server";
import { queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached } from "@/lib/cache";

export async function GET() {
  try {
    const cached = await getCached<{ students: number; courses: number }>("home:stats", 300);
    if (cached) {
      return NextResponse.json(cached);
    }
    const db = await getDB();
    const students =
      (await queryFirst<{ c: number }>(
        db,
        "SELECT COUNT(*) as c FROM workers WHERE membership_status IN ('general', 'premium')"
      ))?.c ?? 0;
    const courses =
      (await queryFirst<{ c: number }>(db, "SELECT COUNT(*) as c FROM courses WHERE is_visible = 1"))?.c ?? 0;
    const data = { students, courses };
    await setCached("home:stats", data);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ students: 0, courses: 0 });
  }
}

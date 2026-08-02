import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export interface SkillPath {
  pathId: number;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  totalCourses: number;
  estimatedDays: number;
}

export interface SkillPathCourse {
  courseId: number;
  title: string;
  titleBn: string;
  sortOrder: number;
  estimatedDays: number;
  isRequired: boolean;
}

export interface Prerequisite {
  courseId: number;
  prerequisiteId: number;
  isRequired: boolean;
}

export async function ensureLearningTables(): Promise<void> {
  try {
    const db = await ensureDB();
    await db.prepare(`CREATE TABLE IF NOT EXISTS skill_paths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_bn TEXT,
      description TEXT,
      description_bn TEXT,
      icon TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS skill_path_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      estimated_days INTEGER DEFAULT 7,
      UNIQUE(path_id, course_id)
    )`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS course_prerequisites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      prerequisite_course_id INTEGER NOT NULL,
      is_required INTEGER DEFAULT 1,
      UNIQUE(course_id, prerequisite_course_id)
    )`).run();
  } catch {}
}

// ── Predefined skill paths ──
const DEFAULT_PATHS = [
  {
    name: "English for Career",
    name_bn: "ক্যারিয়ারের জন্য ইংরেজি",
    description: "From basic English to job-ready communication skills",
    description_bn: "বেসিক ইংরেজি থেকে চাকরির উপযোগী যোগাযোগ দক্ষতা",
    courses: [
      { title: "Spoken English Basics", titleBn: "স্পোকেন ইংলিশ বেসিক", days: 14 },
      { title: "Business Communication", titleBn: "ব্যবসায়িক যোগাযোগ", days: 14 },
      { title: "Interview Preparation", titleBn: "ইন্টারভিউ প্রস্তুতি", days: 7 },
      { title: "CV & Resume Writing", titleBn: "সিভি ও রিজিউম রাইটিং", days: 7 },
    ],
  },
  {
    name: "Digital Marketing",
    name_bn: "ডিজিটাল মার্কেটিং",
    description: "Master online marketing from fundamentals to advanced",
    description_bn: "অনলাইন মার্কেটিং fundamental থেকে advanced",
    courses: [
      { title: "Social Media Marketing", titleBn: "সোশ্যাল মিডিয়া মার্কেটিং", days: 14 },
      { title: "SEO Fundamentals", titleBn: "SEO ফান্ডামেন্টাল", days: 14 },
      { title: "Content Marketing", titleBn: "কন্টেন্ট মার্কেটিং", days: 7 },
      { title: "Facebook & Instagram Ads", titleBn: "ফেসবুক ও ইনস্টাগ্রাম অ্যাডস", days: 14 },
    ],
  },
  {
    name: "Freelancing Career",
    name_bn: "ফ্রিল্যান্সিং ক্যারিয়ার",
    description: "Start and grow your freelancing business from scratch",
    description_bn: "শূন্য থেকে ফ্রিল্যান্সিং ব্যবসা শুরু ও বাড়ান",
    courses: [
      { title: "Freelancing Fundamentals", titleBn: "ফ্রিল্যান্সিং ফান্ডামেন্টাল", days: 7 },
      { title: "Marketplace Profile Setup", titleBn: "মার্কেটপ্লেস প্রোফাইল সেটআপ", days: 3 },
      { title: "Client Communication", titleBn: "ক্লায়েন্ট কমিউনিকেশন", days: 7 },
      { title: "Project Management", titleBn: "প্রজেক্ট ম্যানেজমেন্ট", days: 7 },
      { title: "Scaling Your Business", titleBn: "ব্যবসা স্কেলিং", days: 14 },
    ],
  },
  {
    name: "Business & Entrepreneurship",
    name_bn: "ব্যবসা ও উদ্যোক্তা",
    description: "Start and grow your own business",
    description_bn: "নিজের ব্যবসা শুরু ও বাড়ান",
    courses: [
      { title: "Business Planning", titleBn: "ব্যবসায়িক পরিকল্পনা", days: 14 },
      { title: "Financial Management", titleBn: "আর্থিক ব্যবস্থাপনা", days: 14 },
      { title: "Marketing Strategy", titleBn: "মার্কেটিং স্ট্র্যাটেজি", days: 14 },
    ],
  },
];

export async function seedDefaultPaths(): Promise<void> {
  const db = await ensureDB();
  try {
    const existing = await db.prepare("SELECT COUNT(*) as cnt FROM skill_paths").first() as any;
    if (existing && existing.cnt > 0) return;

    for (const path of DEFAULT_PATHS) {
      // Create path
      await db.prepare(
        "INSERT INTO skill_paths (name, name_bn, description, description_bn) VALUES (?, ?, ?, ?)"
      ).bind(path.name, path.name_bn, path.description, path.description_bn).run();

      const pathRow = await db.prepare("SELECT id FROM skill_paths ORDER BY id DESC LIMIT 1").first() as any;
      if (!pathRow) continue;

      // Link courses by title match
      for (let i = 0; i < path.courses.length; i++) {
        const cp = path.courses[i];
        const courseRow = await db.prepare(
          "SELECT id FROM courses WHERE title LIKE ? OR title_bn LIKE ? LIMIT 1"
        ).bind(`%${cp.title}%`, `%${cp.titleBn}%`).first() as any;

        if (courseRow) {
          await db.prepare(
            "INSERT OR IGNORE INTO skill_path_courses (path_id, course_id, sort_order, estimated_days) VALUES (?, ?, ?, ?)"
          ).bind(pathRow.id, courseRow.id, i + 1, cp.days).run();
        }
      }
    }
  } catch (e) {
    console.error("[LearningGraph] seed error:", (e as Error)?.message);
  }
}

export async function getSkillPaths(): Promise<SkillPath[]> {
  const db = await ensureDB();
  try {
    return await query<SkillPath>(
      { DB: db },
      `SELECT p.id as pathId, p.name, p.name_bn as nameBn, p.description,
              p.description_bn as descriptionBn, p.icon,
              (SELECT COUNT(*) FROM skill_path_courses WHERE path_id = p.id) as totalCourses,
              COALESCE((SELECT SUM(estimated_days) FROM skill_path_courses WHERE path_id = p.id), 0) as estimatedDays
       FROM skill_paths p WHERE p.is_active = 1 ORDER BY p.id`
    );
  } catch { return []; }
}

export async function getPathCourses(pathId: number): Promise<SkillPathCourse[]> {
  const db = await ensureDB();
  try {
    return await query<SkillPathCourse>(
      { DB: db },
      `SELECT c.id as courseId, c.title, c.title_bn as titleBn, spc.sort_order as sortOrder,
              spc.estimated_days as estimatedDays,
              COALESCE((SELECT is_required FROM course_prerequisites WHERE course_id = c.id AND prerequisite_course_id IS NOT NULL), 1) as isRequired
       FROM skill_path_courses spc
       JOIN courses c ON c.id = spc.course_id
       WHERE spc.path_id = ? AND c.is_visible = 1
       ORDER BY spc.sort_order`,
      [pathId]
    );
  } catch { return []; }
}

export async function getRecommendedPath(
  phone: string
): Promise<{ path: SkillPath; progress: number } | null> {
  const paths = await getSkillPaths();
  if (paths.length === 0) return null;

  const db = await ensureDB();

  // Check what courses the user has already purchased
  const purchased = await query<any>(
    { DB: db },
    "SELECT DISTINCT course_id FROM resource_purchases WHERE worker_id = ? AND course_id IS NOT NULL",
    [phone]
  );
  const purchasedIds = new Set(purchased.map((r: any) => r.course_id));

  // Find path with most unpurchased courses (best potential)
  let bestPath: SkillPath | null = null;
  let bestScore = -1;

  for (const path of paths) {
    const courses = await getPathCourses(path.pathId);
    const unpurchased = courses.filter((c) => !purchasedIds.has(c.courseId)).length;
    const progress = courses.length > 0 ? Math.round(((courses.length - unpurchased) / courses.length) * 100) : 0;

    // Score: prioritize paths with some progress but not complete
    const score = progress > 0 && progress < 100 ? progress + 50 : progress === 0 ? 100 : 0;
    if (score > bestScore) {
      bestScore = score;
      bestPath = path;
    }
  }

  if (!bestPath) {
    bestPath = paths[0]; // fallback to first
  }

  const pathCourses = await getPathCourses(bestPath.pathId);
  const purchasedCount = pathCourses.filter((c) => purchasedIds.has(c.courseId)).length;
  const progress = pathCourses.length > 0 ? Math.round((purchasedCount / pathCourses.length) * 100) : 0;

  return { path: bestPath, progress };
}

export function buildLearningPathContext(
  paths: SkillPath[],
  recommended: { path: SkillPath; progress: number } | null,
  lang: string
): string {
  if (paths.length === 0) return "";

  const header = lang === "bn"
    ? "## লার্নিং পাথ\nনিচের স্কিল পাথগুলো অনুসরণ করে আপনি আপনার ক্যারিয়ার গড়তে পারেন:\n"
    : "## Learning Paths\nFollow these skill paths to build your career:\n";

  const lines: string[] = [header];

  for (const p of paths) {
    const name = lang === "bn" ? p.nameBn : p.name;
    const desc = lang === "bn" ? p.descriptionBn : p.description;
    const days = lang === "bn" ? `${p.estimatedDays} দিন` : `${p.estimatedDays} days`;
    const courses = lang === "bn" ? `${p.totalCourses}টি কোর্স` : `${p.totalCourses} courses`;
    lines.push(`- **${name}** — ${desc} (${courses}, ${days})`);
  }

  if (recommended) {
    const name = lang === "bn" ? recommended.path.nameBn : recommended.path.name;
    lines.push(lang === "bn"
      ? `\n⭐ **সাজেস্টেড:** ${name} (অগ্রগতি: ${recommended.progress}%)`
      : `\n⭐ **Recommended:** ${name} (Progress: ${recommended.progress}%)`);
  }

  return lines.join("\n") + "\n";
}

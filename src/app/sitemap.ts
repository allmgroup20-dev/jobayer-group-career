import type { MetadataRoute } from "next";
import { getDB } from "@/lib/db";

const BASE = process.env.SITE_URL || "https://career.jobayergroup.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/courses`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/membership`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  let courseUrls: MetadataRoute.Sitemap = [];
  try {
    const env = await getDB();
    const courses = await env.DB.prepare(
      "SELECT id, updated_at FROM courses WHERE is_visible = 1"
    ).all() as { results: { id: number; updated_at: string | null }[] };
    courseUrls = (courses.results || []).map((c) => ({
      url: `${BASE}/courses/${c.id}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable at build — serve static routes only
  }

  return [...staticRoutes, ...courseUrls];
}
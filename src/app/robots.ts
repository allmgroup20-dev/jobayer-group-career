import type { MetadataRoute } from "next";

const BASE = process.env.SITE_URL || "https://career.jobayergroup.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/company/", "/checkout", "/cart"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
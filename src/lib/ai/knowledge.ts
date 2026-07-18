import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

interface KnowledgePage {
  title: string;
  content: string;
  category: string;
}

export async function getKnowledgeContext(): Promise<string> {
  const db = await ensureDB();
  const pages = await query<KnowledgePage>(
    { DB: db },
    "SELECT title, content, category FROM ai_knowledge_pages WHERE is_active = 1 ORDER BY category ASC LIMIT 200"
  );

  if (!pages.length) return "";

  const sections = pages.map(
    (p) => `[${p.category}] ${p.title}\n${p.content}`
  );

  return "COMPANY INFORMATION:\n" + sections.join("\n\n");
}

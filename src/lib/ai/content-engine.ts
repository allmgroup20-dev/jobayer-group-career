export type ContentType = "blog" | "social" | "marketing" | "training" | "newsletter";
export type ContentLanguage = "en" | "bn";

export interface ContentRequest {
  type: ContentType;
  topic: string;
  language: ContentLanguage;
  tone?: "professional" | "friendly" | "motivational" | "formal" | "casual";
  keywords?: string[];
  wordCount?: number;
  targetAudience?: string;
}

export interface ContentResult {
  title: string;
  body: string;
  excerpt: string;
  hashtags: string[];
  estimatedReadMinutes: number;
}

export function buildContentPrompt(req: ContentRequest): string {
  const toneGuide: Record<string, string> = {
    professional: "Use a polished, business-appropriate tone. Be data-driven and credible.",
    friendly: "Use a warm, conversational tone. Be approachable and relatable.",
    motivational: "Use inspiring, uplifting language. Encourage action and belief.",
    formal: "Use strict professional language. Follow formal structure.",
    casual: "Use everyday language. Be light and easy to read.",
  };

  const typeGuide: Record<string, string> = {
    blog: "Write a full blog article with an engaging headline, introduction, body sections with subheadings, and a conclusion with call-to-action.",
    social: "Write a short social media post optimized for engagement. Include a hook, value statement, and call-to-action.",
    marketing: "Write persuasive marketing copy that highlights benefits, includes social proof, and drives conversion.",
    training: "Write educational training material with clear learning objectives, step-by-step explanations, and practical examples.",
    newsletter: "Write a newsletter with a personal greeting, key updates, featured content, and a closing note.",
  };

  const languageNote = req.language === "bn"
    ? "Write entirely in Bengali (Bangla). Use natural Bangla expressions and phrasing."
    : "Write entirely in English. Use natural English expressions and phrasing.";

  const audienceNote = req.targetAudience
    ? `Target audience: ${req.targetAudience}`
    : "Target audience: general Bangladeshi professionals interested in career growth and AI-powered business.";

  const keywordNote = req.keywords?.length
    ? `Include these keywords naturally: ${req.keywords.join(", ")}`
    : "";

  const wordNote = req.wordCount
    ? `Aim for approximately ${req.wordCount} words.`
    : "Aim for 300-500 words.";

  return [
    `## CONTENT GENERATION REQUEST`,
    `You are a professional content writer for Jobayer Group Career, an AI-powered career and MLM platform in Bangladesh.`,
    ``,
    `Type: ${req.type.toUpperCase()}`,
    `Topic: ${req.topic}`,
    `Tone: ${toneGuide[req.tone || "professional"]}`,
    `Style: ${typeGuide[req.type]}`,
    languageNote,
    audienceNote,
    keywordNote,
    wordNote,
    ``,
    `Return your response in the following JSON format:`,
    `{ "title": "...", "body": "...", "excerpt": "...", "hashtags": ["..."] }`,
    ``,
    `Body should use markdown formatting. Excerpt should be 1-2 sentences max.`,
  ].join("\n");
}

export function parseContentResponse(raw: string, language: ContentLanguage): ContentResult {
  try {
    const parsed = JSON.parse(raw);
    const body = parsed.body || raw;
    const wordCount = body.split(/\s+/).length;
    return {
      title: parsed.title || "",
      body,
      excerpt: parsed.excerpt || body.slice(0, 150) + "...",
      hashtags: parsed.hashtags || [],
      estimatedReadMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    };
  } catch {
    const lines = raw.split("\n").filter(Boolean);
    const title = lines[0]?.replace(/^#+\s*/, "") || "";
    const wordCount = raw.split(/\s+/).length;
    return {
      title,
      body: raw,
      excerpt: raw.slice(0, 150) + "...",
      hashtags: [],
      estimatedReadMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    };
  }
}

const CONTENT_TEMPLATES: Record<ContentType, { subjects: string[]; subjectsBn: string[] }> = {
  blog: {
    subjects: [
      "How AI is Transforming Network Marketing in Bangladesh",
      "5 Reasons to Start Your AI-Powered Career Today",
      "The Future of MLM: Why Technology Matters",
      "From Zero to Hero: Success Stories from Our Community",
    ],
    subjectsBn: [
      "কীভাবে AI নেটওয়ার্ক মার্কেটিং পরিবর্তন করছে বাংলাদেশে",
      "AI-চালিত ক্যারিয়ার শুরু করার ৫টি কারণ",
      "এমএলএম-এর ভবিষ্যৎ: প্রযুক্তি কেন গুরুত্বপূর্ণ",
      "শূন্য থেকে হিরো: আমাদের কমিউনিটির সফলতার গল্প",
    ],
  },
  social: {
    subjects: ["Ready to level up?", "Your future starts now", "Success tip of the day"],
    subjectsBn: ["উন্নতির জন্য প্রস্তুত?", "আপনার ভবিষ্যৎ শুরু এখনই", "আজকের সাফল্যের টিপস"],
  },
  marketing: {
    subjects: ["Join the AI Revolution", "Unlock Your Earning Potential", "Why Wait? Start Today"],
    subjectsBn: ["AI বিপ্লবে যোগ দিন", "আপনার আয়ের সম্ভাবনা আনলক করুন", "কেন অপেক্ষা? আজই শুরু করুন"],
  },
  training: {
    subjects: ["Mastering AI Tools for Business Growth", "Effective Communication in Network Marketing"],
    subjectsBn: ["ব্যবসা বৃদ্ধির জন্য AI টুলস আয়ত্ত করা", "নেটওয়ার্ক মার্কেটিংয়ে কার্যকর যোগাযোগ"],
  },
  newsletter: {
    subjects: ["This Week in AI & Career Growth", "Monthly Update: New Features & Opportunities"],
    subjectsBn: ["এই সপ্তাহে AI ও ক্যারিয়ার গ্রোথ", "মাসিক আপডেট: নতুন ফিচার ও সুযোগ"],
  },
};

export function getContentIdeas(type: ContentType, language: ContentLanguage): string[] {
  const template = CONTENT_TEMPLATES[type] || CONTENT_TEMPLATES.blog;
  return language === "bn" ? template.subjectsBn : template.subjects;
}

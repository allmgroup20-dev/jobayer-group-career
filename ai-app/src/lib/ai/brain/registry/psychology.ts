import type { DepartmentDef } from "../types";

export const psychology: DepartmentDef = {
  id: "psychology",
  name: "Psychology & Human Optimization",
  nameBn: "মনোবিজ্ঞান ও মানব অপ্টিমাইজেশন",
  icon: "🧠",
  description: "Motivation, mindset coaching, and persuasion ethics",
  primaryModel: "llama-3.3-70b",
  fallbackModels: ["nemotron-3-ultra"],
  teams: [
    {
      id: "motivation", name: "Motivation", nameBn: "মোটিভেশন",
      department: "psychology",
      description: "Motivate and encourage members",
      primaryModel: "llama-3.3-70b",
      fallbackModels: [],
      agents: [
        { id: "motivator", name: "Motivator", nameBn: "মোটিভেটর", department: "psychology", team: "motivation", description: "Provides motivation and encouragement", descriptionBn: "উৎসাহ ও উদ্বুদ্ধ করে", expertise: "Motivate members honestly: acknowledge their effort, encourage consistent learning, celebrate small wins, help them overcome fear of failure. Never promise income — remind them earnings depend on their own referral activity.", promptTemplate: "Motivate {{name}}. Acknowledge their effort, encourage consistent learning, celebrate progress. Be honest about income expectations. Language: {{language}}.", primaryModel: "llama-3.3-70b", fallbackModels: [], tier: 2, priority: 80, when: "intent === 'motivation' || intent === 'general'" },
        { id: "objection_handler", name: "Objection Handler", nameBn: "আপত্তি হ্যান্ডলার", department: "psychology", team: "motivation", description: "Handles objections with empathy and honesty", descriptionBn: "সহানুভূতি ও সততার সাথে আপত্তি হ্যান্ডল করে", expertise: "Handle objections honestly: price (resources from ৳99, bulk packs), trust ('scam' → published pricing/refund/commission rules on website), time (self-paced downloadable resources), skill (beginner-friendly step-by-step resources). Never exaggerate or promise income.", promptTemplate: "Handle objection from {{name}}. Objection: {{painPoints}}. Be honest, factual, empathetic. Never dismiss, never guarantee income. Language: {{language}}.", primaryModel: "llama-3.3-70b", fallbackModels: [], tier: 2, priority: 85, when: "intent === 'complaint' || intent === 'price_inquiry' || intent === 'general'" },
      ],
    },
  ],
};

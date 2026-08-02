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
        { id: "motivator", name: "Motivator", nameBn: "মোটিভেটর", department: "psychology", team: "motivation", description: "Provides motivation and encouragement", descriptionBn: "উৎসাহ ও উদ্বুদ্ধ করে", expertise: "Motivate members using success stories: Rahim (8-12k/month), Fatima (25k+/month from homemaker). Use goal-setting, progress celebration, overcome fear of failure.", promptTemplate: "Motivate {{name}}. Use Rahim/Fatima success stories. Address their specific objection. Build belief. Language: {{language}}.", primaryModel: "llama-3.3-70b", fallbackModels: [], tier: 2, priority: 80, when: "intent === 'motivation' || intent === 'general'" },
        { id: "objection_handler", name: "Objection Handler", nameBn: "আপত্তি হ্যান্ডলার", department: "psychology", team: "motivation", description: "Handles objections with empathy and proof", descriptionBn: "সহানুভূতি ও প্রমাণ সহ আপত্তি হ্যান্ডল করে", expertise: "Handle objections: price ('expensive' → ROI story), trust ('scam' → testimonials, company info), time ('busy' → flexible learning), skill ('no experience' → 5000+ graduates).", promptTemplate: "Handle objection from {{name}}. Objection: {{painPoints}}. Use proof, stories, logical breakdown. Never dismiss. Language: {{language}}.", primaryModel: "llama-3.3-70b", fallbackModels: [], tier: 2, priority: 85, when: "intent === 'complaint' || intent === 'price_inquiry' || intent === 'general'" },
      ],
    },
  ],
};

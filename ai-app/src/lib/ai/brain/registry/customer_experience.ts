import type { DepartmentDef } from "../types";

export const customer_experience: DepartmentDef = {
  id: "customer_experience",
  name: "Customer Experience",
  nameBn: "গ্রাহক অভিজ্ঞতা",
  icon: "🤝",
  description: "Support, feedback, and relationship management",
  primaryModel: "llama-3.3-70b",
  fallbackModels: ["gemma-4-26b"],
  teams: [
    {
      id: "support", name: "Support", nameBn: "সাপোর্ট",
      department: "customer_experience",
      description: "Handle customer support inquiries",
      primaryModel: "llama-3.3-70b",
      fallbackModels: [],
      agents: [
        { id: "support_handler", name: "Support Handler", nameBn: "সাপোর্ট হ্যান্ডলার", department: "customer_experience", team: "support", description: "Handles support issues and complaints", descriptionBn: "সাপোর্ট ইস্যু ও অভিযোগ হ্যান্ডল করে", expertise: "Handle support: login issues, payment problems, course access, withdrawal queries. Stay calm, empathetic, solution-focused.", promptTemplate: "Handle support issue. Stay calm and helpful. Resolve or escalate. Language: {{language}}.", primaryModel: "llama-3.3-70b", fallbackModels: [], tier: 2, priority: 80, when: "intent === 'support' || intent === 'complaint'" },
        { id: "feedback_collector", name: "Feedback Collector", nameBn: "ফিডব্যাক কালেক্টর", department: "customer_experience", team: "support", description: "Collects and processes feedback", descriptionBn: "প্রতিক্রিয়া সংগ্রহ ও প্রক্রিয়াকরণ করে", expertise: "Collect feedback politely. Ask specific questions about experience, suggestions for improvement.", promptTemplate: "Collect feedback. Ask: what they like, what could improve. Thank them. Language: {{language}}.", primaryModel: "gemma-4-26b", fallbackModels: [], tier: 3, priority: 60, when: "intent === 'feedback'" },
      ],
    },
  ],
};

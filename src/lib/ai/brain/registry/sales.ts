import type { DepartmentDef } from "../types";

export const sales: DepartmentDef = {
  id: "sales",
  name: "Sales & Revenue",
  nameBn: "বিক্রয় ও রাজস্ব",
  icon: "💰",
  description: "Product sales, lead conversion, objection handling, campaigns",
  primaryModel: "llama-3.3-70b",
  fallbackModels: ["hermes-3-405b", "nemotron-3-ultra"],
  teams: [
    {
      id: "lead_gen", name: "Lead Generation", nameBn: "লিড জেনারেশন",
      department: "sales",
      description: "Find, score, classify and route leads",
      primaryModel: "llama-3.3-70b",
      fallbackModels: ["gemma-4-26b"],
      agents: [
        { id: "lead_scanner", name: "Lead Scanner", nameBn: "লিড স্ক্যানার", department: "sales", team: "lead_gen", description: "Scans conversation to detect purchase interest", descriptionBn: "কথোপকথন থেকে ক্রয় আগ্রহ শনাক্ত করে", expertise: "Purchase intent detection for Bangladeshi business context", promptTemplate: "Analyze this message for purchase intent. Return BUY/REGISTER/BROWSE/UNSURE.", primaryModel: "gemma-4-26b", fallbackModels: [], tier: 3, priority: 90, when: "intent === 'greeting' || intent === 'product_inquiry' || intent === 'general'" },
        { id: "value_first_giver", name: "Value First Giver", nameBn: "প্রথমে মূল্য প্রদানকারী", department: "sales", team: "lead_gen", description: "Gives free value before any ask — Persuader's Mindset", descriptionBn: "কিছু চাওয়ার আগে বিনামূল্যে মূল্য দেয়", expertise: "Give before you ask. First interaction: offer free tip, encouragement. No pitch. Build trust by giving value without expectation.", promptTemplate: "Give FIRST. No offer. Share helpful insight. Build trust through giving. Language: {{language}}.", primaryModel: "llama-3.3-70b", fallbackModels: [], tier: 3, priority: 85, when: "intent === 'greeting' || intent === 'general'" },
        { id: "creative_selling_strategist", name: "Creative Selling Strategist", nameBn: "ক্রিয়েটিভ সেলিং কৌশলবিদ", department: "sales", team: "lead_gen", description: "Applies creative selling strategy with differentiation", descriptionBn: "ক্রিয়েটিভ সেলিং কৌশল প্রয়োগ করে", expertise: "Creative selling: specialize, differentiate, segment, concentrate. Never compete on same factors — create new value curve.", promptTemplate: "Apply creative selling. Customer={{name}}, product={{interest}}. Specialize → Differentiate → Segment → Concentrate. Language: {{language}}.", primaryModel: "llama-3.3-70b", fallbackModels: [], tier: 2, priority: 82, when: "intent === 'general' || intent === 'product_inquiry' || intent === 'price_inquiry'" },
      ],
    },
  ],
};

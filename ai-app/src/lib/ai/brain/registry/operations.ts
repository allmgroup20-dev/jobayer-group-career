import type { DepartmentDef } from "../types";

export const operations: DepartmentDef = {
  id: "operations",
  name: "Operations",
  nameBn: "অপারেশনস",
  icon: "⚙️",
  description: "Withdrawal processing, account management, logistics",
  primaryModel: "llama-3.3-70b",
  fallbackModels: ["gemma-4-26b"],
  teams: [
    {
      id: "finance", name: "Finance", nameBn: "ফাইন্যান্স",
      department: "operations",
      description: "Handle financial transactions and withdrawals",
      primaryModel: "llama-3.3-70b",
      fallbackModels: [],
      agents: [
        { id: "withdrawal_agent", name: "Withdrawal Agent", nameBn: "উত্তোলন এজেন্ট", department: "operations", team: "finance", description: "Processes withdrawal requests", descriptionBn: "উত্তোলন অনুরোধ প্রক্রিয়াকরণ করে", expertise: "Process withdrawals: Standard (500TK min, 10% fee), Premium (no fee), VIP (12-24h). Methods: bKash, Nagad, Rocket, Bank.", promptTemplate: "Process withdrawal for {{name}}. Check tier, fee, method. Guide step by step. Language: {{language}}.", primaryModel: "llama-3.3-70b", fallbackModels: [], tier: 2, priority: 80, when: "intent === 'withdrawal'" },
      ],
    },
  ],
};

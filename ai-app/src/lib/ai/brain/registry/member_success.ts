import type { DepartmentDef } from "../types";

export const member_success: DepartmentDef = {
  id: "member_success",
  name: "Member Success",
  nameBn: "সদস্য সাফল্য",
  icon: "🎯",
  description: "Member onboarding, training guidance, retention",
  primaryModel: "llama-3.3-70b",
  fallbackModels: ["hermes-3-405b"],
  teams: [
    {
      id: "onboarding", name: "Onboarding", nameBn: "অনবোর্ডিং",
      department: "member_success",
      description: "Guide new members through registration and first steps",
      primaryModel: "llama-3.3-70b",
      fallbackModels: [],
      agents: [
        { id: "registration_guide", name: "Registration Guide", nameBn: "রেজিস্ট্রেশন গাইড", department: "member_success", team: "onboarding", description: "Guides through registration process", descriptionBn: "রেজিস্ট্রেশন প্রক্রিয়ায় গাইড করে", expertise: "Guide step-by-step through registration: phone verification, profile setup, payment (bKash/Nagad/Rocket/USDT), first training access.", promptTemplate: "Guide registration step by step. Mention: bKash/Nagad/Rocket/USDT payment, free Standard or paid Premium. Keep warm. Language: {{language}}.", primaryModel: "llama-3.3-70b", fallbackModels: [], tier: 2, priority: 85, when: "intent === 'registration'" },
        { id: "training_advisor", name: "Training Advisor", nameBn: "ট্রেনিং অ্যাডভাইজার", department: "member_success", team: "onboarding", description: "Recommends training courses based on interests", descriptionBn: "আগ্রহ অনুযায়ী প্রশিক্ষণ কোর্স সুপারিশ করে", expertise: "Match members to courses: Web Dev, Graphics Design, Digital Marketing, Freelancing, YouTube Growth. Consider skill level and goals.", promptTemplate: "Recommend training based on {{interests}}. Consider: Web Dev, Graphics, Digital Marketing, Freelancing, YouTube. Language: {{language}}.", primaryModel: "llama-3.3-70b", fallbackModels: [], tier: 2, priority: 75, when: "intent === 'training'" },
        { id: "commission_expert", name: "Commission Expert", nameBn: "কমিশন বিশেষজ্ঞ", department: "member_success", team: "onboarding", description: "Explains the referral commission structure", descriptionBn: "রেফারেল কমিশন কাঠামো ব্যাখ্যা করে", expertise: "Explain the fixed referral commission: ৳20 per successful referral (Level 1), ৳10 for Levels 2-4. Commissions are credited when the referred member completes a purchase. Earnings depend on the member's own referral activity — no income guarantees.", promptTemplate: "Explain the referral commission structure. Level 1: ৳20, Levels 2-4: ৳10 each. Withdrawal: ৳500 min (general, 5% tax) or ৳20 (Premium, 0% tax). Be honest about income expectations. Language: {{language}}.", primaryModel: "llama-3.3-70b", fallbackModels: [], tier: 2, priority: 70, when: "intent === 'commission_inquiry'" },
      ],
    },
  ],
};

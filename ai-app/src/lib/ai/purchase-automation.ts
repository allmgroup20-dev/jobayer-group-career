export interface PurchasePlan {
  name: string;
  nameBn: string;
  price: number;
  duration: string;
  features: string[];
  featuresBn: string[];
  isPremium: boolean;
}

const PLANS: PurchasePlan[] = [
  {
    name: "Standard",
    nameBn: "স্ট্যান্ডার্ড",
    price: 0,
    duration: "lifetime",
    features: ["Free access to basic training", "Earn up to 10% commission on referrals", "Access to community group"],
    featuresBn: ["বেসিক ট্রেনিংয়ে ফ্রি অ্যাক্সেস", "রেফারেল থেকে ১০% কমিশন আয়", "কমিউনিটি গ্রুপে অ্যাক্সেস"],
    isPremium: false,
  },
  {
    name: "Premium",
    nameBn: "প্রিমিয়াম",
    price: 1500,
    duration: "lifetime",
    features: ["All Standard features", "Advanced training modules", "25% commission on referrals", "Priority support", "Team building tools"],
    featuresBn: ["স্ট্যান্ডার্ডের সব সুবিধা", "অ্যাডভান্সড ট্রেনিং মডিউল", "রেফারেলে ২৫% কমিশন", "প্রায়োরিটি সাপোর্ট", "টিম বিল্ডিং টুলস"],
    isPremium: true,
  },
  {
    name: "VIP",
    nameBn: "ভিআইপি",
    price: 5000,
    duration: "lifetime",
    features: ["All Premium features", "VIP exclusive trainings", "40% commission on referrals", "Personal AI assistant", "Direct mentorship", "Early access to new products"],
    featuresBn: ["প্রিমিয়ামের সব সুবিধা", "ভিআইপি এক্সক্লুসিভ ট্রেনিং", "রেফারেলে ৪০% কমিশন", "পার্সোনাল AI অ্যাসিস্ট্যান্ট", "ডাইরেক্ট মেন্টরশিপ", "নতুন পণ্যে অগ্রিম অ্যাক্সেস"],
    isPremium: true,
  },
];

export function getPlans(): PurchasePlan[] {
  return PLANS;
}

export function getPlanByName(name: string): PurchasePlan | undefined {
  return PLANS.find((p) => p.name.toLowerCase() === name.toLowerCase());
}

export function buildPurchaseContext(lang: string): string {
  const header = lang === "bn"
    ? "## সদস্যপদ প্ল্যান\n"
    : "## Membership Plans\n";

  const plans = PLANS.map((plan) => {
    const name = lang === "bn" ? plan.nameBn : plan.name;
    const features = lang === "bn" ? plan.featuresBn : plan.features;
    const priceText = plan.price === 0
      ? (lang === "bn" ? "ফ্রি" : "Free")
      : `৳${plan.price}`;

    const featureLines = features.map((f) => `  • ${f}`).join("\n");

    return [
      `### ${name} — ${priceText}`,
      featureLines,
    ].join("\n");
  }).join("\n\n");

  return `${header}\n${plans}\n\n`;
}

export function buildOrderContext(
  plans: PurchasePlan[],
  lang: string
): string {
  if (lang === "bn") {
    return `**কিভাবে অর্ডার করবেন:**\nআগ্রহী প্ল্যান নির্বাচন করুন → "কিনতে চাই" বলুন → পেমেন্ট অপশন পাবেন (bKash/Nagad/SSLCommerz/Cash on Delivery) → কনফার্ম করলে অর্ডার তৈরি হবে।\n\nপ্রয়োজনীয় তথ্য: আপনার নাম, ফোন নাম্বার, ঠিকানা (যদি COD হয়)`;
  }
  return `**How to order:**\nSelect your plan → say "I want to buy" → choose payment method (bKash/Nagad/SSLCommerz/Cash on Delivery) → confirm and order will be created.\n\nInfo needed: your name, phone number, address (if COD)`;
}

export function getRecommendedPlan(
  leadScore: number,
  totalOrders: number,
  isWorker: boolean
): string {
  if (leadScore >= 80 || totalOrders >= 5) return "VIP";
  if (leadScore >= 50 || totalOrders >= 2 || isWorker) return "Premium";
  return "Standard";
}

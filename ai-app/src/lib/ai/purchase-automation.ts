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
    features: ["Free registration", "970+ premium resources available from ৳99 each", "৳20 fixed commission per successful referral (Level 1), ৳10 for Levels 2-4", "Withdraw from ৳500", "5% withdrawal tax"],
    featuresBn: ["ফ্রি রেজিস্ট্রেশন", "৯৭০+ প্রিমিয়াম রিসোর্স, ৳৯৯ থেকে", "প্রতি সফল রেফারেলে ৳২০ কমিশন (লেভেল ১), লেভেল ২-৪ এ ৳১০", "৳৫০০ থেকে উত্তোলন", "৫% উইথড্রয়াল ট্যাক্স"],
    isPremium: false,
  },
  {
    name: "Premium",
    nameBn: "প্রিমিয়াম",
    price: 5200,
    duration: "lifetime",
    features: ["Granted with the all-resources unlock (৳5,200 one-time)", "970+ premium resources all unlocked", "0% withdrawal tax", "Withdraw from ৳20", "Priority support"],
    featuresBn: ["সব রিসোর্স আনলক প্যাকেজে পাওয়া যায় (৳৫,২০০ এককালীন)", "৯৭০+ প্রিমিয়াম রিসোর্স সব আনলক", "০% উইথড্রয়াল ট্যাক্স", "৳২০ থেকে উত্তোলন", "প্রায়োরিটি সাপোর্ট"],
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
    return `**কিভাবে অর্ডার করবেন:**\nআগ্রহী রিসোর্স নির্বাচন করুন → "কিনতে চাই" বলুন → পেমেন্ট অপশন পাবেন (bKash/Nagad/SSLCommerz/Cash on Delivery) → কনফার্ম করলে অর্ডার তৈরি হবে।\n\nপ্রয়োজনীয় তথ্য: আপনার নাম, ফোন নাম্বার, ঠিকানা (যদি COD হয়)`;
  }
  return `**How to order:**\nSelect your resource → say "I want to buy" → choose payment method (bKash/Nagad/SSLCommerz/Cash on Delivery) → confirm and order will be created.\n\nInfo needed: your name, phone number, address (if COD)`;
}

export function getRecommendedPlan(
  leadScore: number,
  totalOrders: number,
  isWorker: boolean
): string {
  if (leadScore >= 80 || totalOrders >= 5) return "Premium";
  if (leadScore >= 50 || totalOrders >= 2 || isWorker) return "Premium";
  return "Standard";
}

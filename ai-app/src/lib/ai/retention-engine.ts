import { query, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { analyzeEmotionTrend } from "./emotion-tracker";
import type { EmotionSummary } from "./emotion-tracker";

export type RetentionAction = "personal_offer" | "free_upgrade" | "mentor_call" | "resource_unlock" | "success_story" | "payment_plan" | "support_checkin" | "reengagement_quiz";

export interface RetentionPlan {
  phone: string;
  action: RetentionAction;
  reason: string;
  priority: number;
  message: string;
  messageBn: string;
}

const ACTION_TEMPLATES: Record<RetentionAction, { en: string; bn: string }> = {
  personal_offer: {
    en: "Hi {{name}}, we noticed you haven't been active lately. Here's a special offer just for you — {{discount}}% off on {{product}}. Use code {{coupon}}. We'd love to have you back!",
    bn: "হাই {{name}}, আমরা দেখেছি আপনি কিছুদিন ধরে সক্রিয় নেই। আপনার জন্য একটি বিশেষ অফার — {{product}}-এ {{discount}}% ছাড়। কোড {{coupon}} ব্যবহার করুন। আপনাকে আবার পেয়ে আমরা খুশি হব!",
  },
  free_upgrade: {
    en: "Hi {{name}}, did you know registration is free? You can explore the app and sample resources anytime, and unlock premium resources individually (from ৳99) whenever you're ready. Happy to help you get started!",
    bn: "হাই {{name}}, আপনি কি জানেন রেজিস্ট্রেশন ফ্রি? আপনি যেকোনো সময় অ্যাপটি দেখতে পারেন এবং রিসোর্স দেখতে পারেন, আর প্রস্তুত হলে ৳৯৯ থেকে প্রিমিয়াম রিসোর্স আলাদাভাবে আনলক করতে পারেন। শুরু করতে সাহায্য করতে পেরে খুশি হব!",
  },
  mentor_call: {
    en: "Hi {{name}}, would you like a free 1-on-1 support session? Our team can help you get started with the right resource and explain the referral program. Just reply 'YES' and we'll schedule it.",
    bn: "হাই {{name}}, আপনি কি একটি ফ্রি ১-অন-১ সাপোর্ট সেশন চান? আমাদের টিম আপনাকে সঠিক রিসোর্স দিয়ে শুরু করতে এবং রেফারেল প্রোগ্রাম বুঝতে সাহায্য করতে পারে। শুধু 'হ্যাঁ' লিখুন, আমরা সময় নির্ধারণ করব।",
  },
  resource_unlock: {
    en: "Hi {{name}}, you have free resources available to explore! Start with the sample resources in the app, and unlock more premium resources (from ৳99) whenever you're ready. Happy learning!",
    bn: "হাই {{name}}, আপনার জন্য ফ্রি রিসোর্স দেখার সুযোগ আছে! অ্যাপের নমুনা রিসোর্স দিয়ে শুরু করুন, আর প্রস্তুত হলে ৳৯৯ থেকে আরও প্রিমিয়াম রিসোর্স আনলক করুন। শুভ শেখা!",
  },
  success_story: {
    en: "Hi {{name}}, did you know {{story}}? Many of our members started just like you. Check out what's available in the resource library and see what you can learn!",
    bn: "হাই {{name}}, আপনি কি জানেন {{story}}? আমাদের অনেক সদস্য আপনার মতোই শুরু করেছিলেন। রিসোর্স লাইব্রেরিতে কী আছে দেখুন এবং দেখুন আপনি কী শিখতে পারেন!",
  },
  payment_plan: {
    en: "Hi {{name}}, we understand financial situations vary. Resources are available individually (from ৳99) so you can start small and unlock more later. We're happy to help you choose what fits best!",
    bn: "হাই {{name}}, আমরা বুঝি আর্থিক পরিস্থিতি ভিন্ন হয়। রিসোর্সগুলো আলাদাভাবে পাওয়া যায় (৳৯৯ থেকে), তাই আপনি ছোট করে শুরু করতে পারেন এবং পরে আরও আনলক করতে পারেন। আপনার জন্য সবচেয়ে উপযুক্ত কী তা বেছে নিতে আমরা সাহায্য করতে পেরে খুশি!",
  },
  support_checkin: {
    en: "Hi {{name}}, just checking in — how are things going? Is there anything we can help you with? We're here for you!",
    bn: "হাই {{name}}, শুধু খোঁজ নিচ্ছি — কেমন যাচ্ছে? আমরা কীভাবে সাহায্য করতে পারি? আমরা আপনার জন্য এখানে আছি!",
  },
  reengagement_quiz: {
    en: "Hi {{name}}! Quick quiz: Which digital skill would help you most in today's market? Reply with your answer and we'll recommend a resource from our library!",
    bn: "হাই {{name}}! দ্রুত কুইজ: আজকের বাজারে কোন ডিজিটাল দক্ষতা আপনার জন্য সবচেয়ে উপকারী হবে? উত্তর দিন, আমরা আমাদের লাইব্রেরি থেকে একটি রিসোর্স সুপারিশ করব!",
  },
};

export async function analyzeRetentionNeed(
  phone: string,
  name?: string | null
): Promise<RetentionPlan | null> {
  try {
    const db = await ensureDB();
    const emotionSummary = await analyzeEmotionTrend(phone, 30);

    // Get behavior scores
    const scores = await query<any>(
      { DB: db },
      "SELECT lead_score, churn_probability, purchase_intent, segment FROM user_behavior_scores WHERE worker_id = ?",
      [phone]
    );

    const churnProb = scores.length > 0 ? scores[0].churn_probability || 0 : 0;
    const segment = scores.length > 0 ? scores[0].segment || "new" : "new";
    const leadScore = scores.length > 0 ? scores[0].lead_score || 0 : 0;

    // Get proactive followup count
    const followups = await query<any>(
      { DB: db },
      "SELECT followup_count FROM proactive_followups WHERE phone = ?",
      [phone]
    );
    const followupCount = followups.length > 0 ? followups[0].followup_count : 0;

    // Get last activity
    const lastActivity = await query<any>(
      { DB: db },
      "SELECT total_chats, updated_at FROM ai_phone_profiles WHERE phone = ?",
      [phone]
    );
    const totalChats = lastActivity.length > 0 ? lastActivity[0].total_chats || 0 : 0;
    const lastActive = lastActivity.length > 0 ? lastActivity[0].updated_at : null;

    // Calculate days since last activity
    let daysSinceActive = 999;
    if (lastActive) {
      const diff = Date.now() - new Date(lastActive).getTime();
      daysSinceActive = Math.floor(diff / 86400000);
    }

    // Decision logic
    const isChurning = churnProb > 60 || emotionSummary.riskLevel === "high";
    const isAtRisk = churnProb > 30 || emotionSummary.riskLevel === "medium" || (emotionSummary.negativeRatio || 0) > 40;
    const isInactive = daysSinceActive > 14 && totalChats > 2;
    const isNew = totalChats <= 2 && daysSinceActive > 2;
    const isActive = totalChats > 5 && daysSinceActive <= 3;
    const triedTooMany = followupCount >= 3;

    let action: RetentionAction;
    let reason: string;
    let priority: number;

    if (isChurning && !triedTooMany) {
      action = "personal_offer";
      reason = "High churn risk — personalized offer to re-engage";
      priority = 1;
    } else if (isChurning && triedTooMany) {
      action = "mentor_call";
      reason = "Already tried offers — personal touch needed";
      priority = 2;
    } else if (emotionSummary.riskLevel === "medium" && segment === "at_risk") {
      action = "success_story";
      reason = "Medium risk with declining mood — inspiration needed";
      priority = 2;
    } else if (isInactive && !triedTooMany) {
      action = "reengagement_quiz";
      reason = "Inactive for 2+ weeks — fun re-engagement";
      priority = 3;
    } else if (isInactive && triedTooMany) {
      action = "support_checkin";
      reason = "Many followups but inactive — gentle check-in";
      priority = 3;
    } else if (isNew && daysSinceActive > 2) {
      action = "free_upgrade";
      reason = "New user not active after initial contact — free trial offer";
      priority = 2;
    } else if (segment === "active_buyer" && daysSinceActive > 7) {
      action = "resource_unlock";
      reason = "Active buyer gone quiet — free resource to re-spark interest";
      priority = 3;
    } else if (segment === "premium" && daysSinceActive > 5) {
      action = "mentor_call";
      reason = "Premium member inactive — high-value retention needed";
      priority = 1;
    } else {
      action = "support_checkin";
      reason = "General check-in";
      priority = 4;
    }

    const template = ACTION_TEMPLATES[action];
    const userName = name || "there";

    return {
      phone, action, reason, priority,
      message: template.en.replace(/\{\{name\}\}/g, userName),
      messageBn: template.bn.replace(/\{\{name\}\}/g, userName),
    };
  } catch {
    return null;
  }
}

export async function getRetentionBatch(
  limit: number = 10
): Promise<RetentionPlan[]> {
  const db = await ensureDB();

  // Get users at risk (high churn probability or negative emotion trend)
  const atRisk = await query<any>(
    { DB: db },
    `SELECT w.worker_id, w.name
     FROM workers w
     LEFT JOIN user_behavior_scores s ON w.worker_id = s.worker_id
     WHERE (s.churn_probability > 30 OR s.segment IN ('at_risk', 'churned'))
       AND w.is_active = 1
     ORDER BY s.churn_probability DESC
     LIMIT ?`,
    [limit]
  );

  const plans: RetentionPlan[] = [];
  for (const user of atRisk) {
    const plan = await analyzeRetentionNeed(user.worker_id, user.name);
    if (plan) plans.push(plan);
  }

  return plans.sort((a, b) => a.priority - b.priority).slice(0, limit);
}

export async function executeRetentionAction(
  phone: string,
  action: RetentionAction,
  message: string
): Promise<boolean> {
  try {
    const { sendMessage } = await import("@/lib/whatsapp");
    const result = await sendMessage(phone, message);
    if (result.success) {
      await execute(
        { DB: await ensureDB() },
        "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'outbound', 'sent', 'retention', datetime('now'))",
        [phone, message]
      );
    }
    return result.success;
  } catch {
    return false;
  }
}

export function buildRetentionContext(
  summary: EmotionSummary,
  lang: string
): string {
  if (summary.totalEntries === 0) return "";

  const riskLabel = lang === "bn"
    ? ({ low: "কম", medium: "মাঝারি", high: "উচ্চ" } as Record<string, string>)
    : ({ low: "Low", medium: "Medium", high: "High" } as Record<string, string>);

  const header = lang === "bn" ? "## রিটেনশন এনালাইসিস" : "## Retention Analysis";

  if (summary.riskLevel === "high") {
    return `${header}\n${lang === "bn" ? "⚠️ চার্ন রিস্ক: উচ্চ — জরুরি রিটেনশন অ্যাকশন প্রয়োজন" : "⚠️ Churn Risk: HIGH — urgent retention action needed"}\n`;
  }
  if (summary.riskLevel === "medium") {
    return `${header}\n${lang === "bn" ? "⚡ চার্ন রিস্ক: মাঝারি — সক্রিয় রাখতে ফলোআপ দিন" : "⚡ Churn Risk: MEDIUM — follow up to keep engaged"}\n`;
  }
  return "";
}

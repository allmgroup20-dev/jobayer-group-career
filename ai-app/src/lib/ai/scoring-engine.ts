export interface LeadScores {
  interestScore: number;
  buyingScore: number;
  priorityScore: number;
  engagementScore: number;
  recencyScore: number;
  totalScore: number;
  lastActiveDays: number;
  totalChats: number;
  totalOrders: number;
  totalSpent: number;
}

export function calculateScores(profile: {
  total_chats?: number;
  total_orders?: number;
  total_spent?: number;
  created_at?: string;
  updated_at?: string;
  last_message_at?: string;
  interests?: string | string[];
  pain_points?: string | string[];
  trust_score?: number;
  membership_status?: string;
}): LeadScores {
  const now = Date.now();

  // Recency: when was the last activity
  const lastActiveStr = profile.last_message_at || profile.updated_at || profile.created_at || "";
  const lastActive = lastActiveStr ? new Date(lastActiveStr).getTime() : now;
  const lastActiveDays = Math.max(0, Math.floor((now - lastActive) / 86400000));
  const recencyScore = Math.max(0, Math.round(100 - Math.min(lastActiveDays * 3, 95)));

  // Engagement: based on total chats
  const totalChats = profile.total_chats || 0;
  const engagementScore = Math.min(100, Math.round(totalChats * 5));

  // Interest: based on interests count + pain points + trust
  const interests = typeof profile.interests === "string"
    ? profile.interests.split(",").filter(Boolean)
    : Array.isArray(profile.interests) ? profile.interests : [];
  const painPoints = typeof profile.pain_points === "string"
    ? profile.pain_points.split(",").filter(Boolean)
    : Array.isArray(profile.pain_points) ? profile.pain_points : [];
  const interestScore = Math.min(100, Math.round(
    (interests.length * 15) + (painPoints.length * 10) + ((profile.trust_score || 50) * 0.3)
  ));

  // Buying: based on orders + membership
  const totalOrders = profile.total_orders || 0;
  const totalSpent = profile.total_spent || 0;
  const membershipBonus = profile.membership_status === "vip" ? 30 : profile.membership_status === "premium" ? 20 : 0;
  const buyingScore = Math.min(100, Math.round(
    (totalOrders * 15) + (Math.min(totalSpent, 10000) / 200) + membershipBonus
  ));

  // Priority: weighted combination
  const priorityScore = Math.min(100, Math.round(
    (recencyScore * 0.25) + (engagementScore * 0.20) + (interestScore * 0.25) + (buyingScore * 0.30)
  ));

  const totalScore = Math.round((interestScore + buyingScore + priorityScore + engagementScore + recencyScore) / 5);

  return {
    interestScore, buyingScore, priorityScore, engagementScore, recencyScore,
    totalScore, lastActiveDays, totalChats, totalOrders, totalSpent,
  };
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  if (score >= 40) return "lukewarm";
  if (score >= 20) return "cool";
  return "cold";
}

export function getScoreLabelBn(score: number): string {
  if (score >= 80) return "হট";
  if (score >= 60) return "ওয়ার্ম";
  if (score >= 40) return "হালকা";
  if (score >= 20) return "কুল";
  return "কোল্ড";
}

export function buildScoreContext(scores: LeadScores, language: string): string {
  const label = language === "bn" ? getScoreLabelBn(scores.totalScore) : getScoreLabel(scores.totalScore);
  const lines = [
    language === "bn"
      ? `## লিড স্কোর: ${scores.totalScore}/100 (${label})`
      : `## Lead Score: ${scores.totalScore}/100 (${label})`,
    language === "bn"
      ? `• ইন্টারেস্ট: ${scores.interestScore}/100 | বায়িং: ${scores.buyingScore}/100 | প্রায়োরিটি: ${scores.priorityScore}/100`
      : `• Interest: ${scores.interestScore}/100 | Buying: ${scores.buyingScore}/100 | Priority: ${scores.priorityScore}/100`,
    language === "bn"
      ? `• শেষ অ্যাক্টিভ: ${scores.lastActiveDays} দিন আগে | মোট চ্যাট: ${scores.totalChats} | অর্ডার: ${scores.totalOrders}`
      : `• Last active: ${scores.lastActiveDays}d ago | Chats: ${scores.totalChats} | Orders: ${scores.totalOrders}`,
  ];
  return lines.join("\n");
}

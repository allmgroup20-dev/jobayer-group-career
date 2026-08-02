export interface SegmentInfo {
  segment: string;
  label: string;
  labelBn: string;
  priority: number;
  description: string;
  descriptionBn: string;
}

export interface CampaignSuggestion {
  name: string;
  nameBn: string;
  targetSegment: string;
  messageTemplate: string;
  messageTemplateBn: string;
  priorityScore: number;
  reason: string;
}

export function detectSegment(scores: {
  recencyScore: number;
  engagementScore: number;
  interestScore: number;
  buyingScore: number;
  leadScore: number;
  churnProbability?: number;
  purchaseIntent?: number;
  lifetimeValue?: number;
  totalOrders?: number;
}): SegmentInfo {
  const { recencyScore, engagementScore, interestScore, buyingScore, leadScore } = scores;

  // VIP: high buying + high engagement + high recency
  if (buyingScore >= 70 && engagementScore >= 60 && recencyScore >= 50) {
    return {
      segment: "vip",
      label: "VIP Member",
      labelBn: "ভিআইপি সদস্য",
      priority: 1,
      description: "High-value repeat buyers with strong engagement",
      descriptionBn: "উচ্চমূল্যের পুনঃক্রেতা, শক্তিশালী সম্পৃক্ততা",
    };
  }

  // Active Buyer: medium-high buying + recent activity
  if (buyingScore >= 40 && recencyScore >= 60) {
    return {
      segment: "active_buyer",
      label: "Active Buyer",
      labelBn: "সক্রিয় ক্রেতা",
      priority: 2,
      description: "Regular purchasers with recent activity",
      descriptionBn: "নিয়মিত ক্রেতা, সাম্প্রতিক কার্যকলাপ",
    };
  }

  // Engaged Learner: high interest + high engagement but low buying
  if (interestScore >= 60 && engagementScore >= 50 && buyingScore < 40) {
    return {
      segment: "engaged_learner",
      label: "Engaged Learner",
      labelBn: "সক্রিয় শিক্ষার্থী",
      priority: 3,
      description: "High interest and engagement, low purchasing so far",
      descriptionBn: "উচ্চ আগ্রহ ও সম্পৃক্ততা, কিন্তু ক্রয় কম",
    };
  }

  // At Risk: low recency + previously engaged
  if (recencyScore < 30 && engagementScore >= 40) {
    return {
      segment: "at_risk",
      label: "At Risk",
      labelBn: "ঝুঁকিতে",
      priority: 4,
      description: "Previously engaged but now inactive — needs re-engagement",
      descriptionBn: "পূর্বে সক্রিয় ছিল কিন্তু এখন নিষ্ক্রিয় — পুনরায় যুক্ত করা প্রয়োজন",
    };
  }

  // New: very new, low everything
  if (leadScore < 30 && engagementScore < 30) {
    return {
      segment: "new",
      label: "New Lead",
      labelBn: "নতুন লিড",
      priority: 5,
      description: "New contact, minimal history — needs onboarding",
      descriptionBn: "নতুন যোগাযোগ, ন্যূনতম ইতিহাস — অনবোর্ডিং প্রয়োজন",
    };
  }

  // Dormant: low everything
  return {
    segment: "dormant",
    label: "Dormant",
    labelBn: "নিষ্ক্রিয়",
    priority: 6,
    description: "Low across all metrics — may need re-activation campaign",
    descriptionBn: "সব মেট্রিকে কম — পুনরায় সক্রিয়করণ প্রয়োজন হতে পারে",
  };
}

export function suggestCampaign(
  segment: SegmentInfo,
  interests: string[],
  lang: string
): CampaignSuggestion {
  const baseSuggestions: Record<string, Omit<CampaignSuggestion, "targetSegment" | "priorityScore">> = {
    vip: {
      name: "VIP Loyalty Reward",
      nameBn: "ভিআইপি লয়্যালটি রিওয়ার্ড",
      messageTemplate: `Hi {{name}}, as our valued VIP member, here's an exclusive offer just for you! Get {{discount}}% off on {{product}}. Use code {{coupon}}. Limited time offer!`,
      messageTemplateBn: `হাই {{name}}, আমাদের মূল্যবান ভিআইপি সদস্য হিসেবে, আপনার জন্য একটি এক্সক্লুসিভ অফার! {{product}}-এ {{discount}}% ছাড় পান। কোড {{coupon}} ব্যবহার করুন। সময় সীমিত!`,
      reason: "Reward high-value members to boost retention and referrals",
    },
    active_buyer: {
      name: "Cross-sell Campaign",
      nameBn: "ক্রস-সেল ক্যাম্পেইন",
      messageTemplate: `Hi {{name}}, customers who bought {{product}} also love {{recommendation}}. Check it out now!`,
      messageTemplateBn: `হাই {{name}}, যারা {{product}} কিনেছেন তারা {{recommendation}}-ও পছন্দ করেন। এখনই দেখুন!`,
      reason: "Cross-sell complementary products to active buyers",
    },
    engaged_learner: {
      name: "Course-to-Product Bridge",
      nameBn: "কোর্স টু প্রোডাক্ট ব্রিজ",
      messageTemplate: `Hi {{name}}, we noticed you're learning about {{topic}}. Take the next step with our {{product}} — special price for learners!`,
      messageTemplateBn: `হাই {{name}}, আমরা দেখেছি আপনি {{topic}} সম্পর্কে শিখছেন। {{product}} দিয়ে পরবর্তী পদক্ষেপ নিন — শিক্ষার্থীদের জন্য বিশেষ মূল্য!`,
      reason: "Convert engaged learners into paying customers",
    },
    at_risk: {
      name: "Re-engagement Campaign",
      nameBn: "পুনরায় যুক্ত করার ক্যাম্পেইন",
      messageTemplate: `Hi {{name}}, we miss you! Here's a {{discount}}% welcome-back coupon: {{coupon}}. Come see what's new!`,
      messageTemplateBn: `হাই {{name}}, আমরা আপনাকে মিস করছি! একটি {{discount}}% ওয়েলকাম-ব্যাক কুপন: {{coupon}}। নতুন কী দেখুন!`,
      reason: "Re-engage dormant high-potential leads with incentive",
    },
    new: {
      name: "Welcome & Onboarding",
      nameBn: "স্বাগতম ও অনবোর্ডিং",
      messageTemplate: `Hi {{name}}, welcome! Here's a free {{resource}} to get started. Let us know if you need any help!`,
      messageTemplateBn: `হাই {{name}}, স্বাগতম! শুরু করতে একটি ফ্রি {{resource}} নিন। কোনো সাহায্যের প্রয়োজন হলে জানাবেন!`,
      reason: "Onboard new contacts and introduce value proposition",
    },
    dormant: {
      name: "Re-activation Campaign",
      nameBn: "পুনরায় সক্রিয়করণ ক্যাম্পেইন",
      messageTemplate: `Hi {{name}}, it's been a while! Check out what's new: {{product}}. First purchase gets {{discount}}% off!`,
      messageTemplateBn: `হাই {{name}}, অনেক দিন হলো! নতুন কী দেখুন: {{product}}। প্রথম ক্রয়ে {{discount}}% ছাড়!`,
      reason: "Reactivate cold leads with new offerings",
    },
  };

  const base = baseSuggestions[segment.segment] || baseSuggestions.dormant;
  const interestTopic = interests.length > 0 ? interests[0] : "our products";

  return {
    ...base,
    targetSegment: segment.segment,
    priorityScore: segment.priority,
    messageTemplate: base.messageTemplate.replace("{{topic}}", interestTopic),
    messageTemplateBn: base.messageTemplateBn.replace("{{topic}}", interestTopic),
  };
}

export function buildSegmentContext(
  segment: SegmentInfo,
  campaign: CampaignSuggestion,
  lang: string
): string {
  const label = lang === "bn" ? segment.labelBn : segment.label;
  const desc = lang === "bn" ? segment.descriptionBn : segment.description;
  const campaignName = lang === "bn" ? campaign.nameBn : campaign.name;
  const template = lang === "bn" ? campaign.messageTemplateBn : campaign.messageTemplate;

  return [
    `## Marketing Intelligence`,
    `Segment: **${label}** — ${desc}`,
    `Suggested Campaign: **${campaignName}**`,
    `Template: ${template}`,
  ].join("\n");
}

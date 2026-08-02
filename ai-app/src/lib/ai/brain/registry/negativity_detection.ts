import type { DepartmentDef } from "../types";

export const negativity_detection: DepartmentDef = {
  id: "negativity_detection",
  name: "Negativity Detection & Sensitivity",
  nameBn: "নেতিবাচকতা শনাক্তকরণ ও সংবেদনশীলতা",
  icon: "🛡️",
  description: "Detect and handle negative sentiment, complaints, and churn risk",
  primaryModel: "gemma-4-26b",
  fallbackModels: [],
  teams: [
    {
      id: "sentiment", name: "Sentiment Analysis", nameBn: "সেন্টিমেন্ট বিশ্লেষণ",
      department: "negativity_detection",
      description: "Detect negative sentiment and churn signals",
      primaryModel: "gemma-4-26b",
      fallbackModels: [],
      agents: [
        { id: "sentiment_detector", name: "Sentiment Detector", nameBn: "সেন্টিমেন্ট ডিটেক্টর", department: "negativity_detection", team: "sentiment", description: "Detects negative sentiment from message text", descriptionBn: "মেসেজ টেক্সট থেকে নেতিবাচক সেন্টিমেন্ট শনাক্ত করে", expertise: "Detect negative sentiment: anger, frustration, distrust, disappointment. Flag for special handling.", promptTemplate: "Analyze sentiment. Return POSITIVE/NEUTRAL/NEGATIVE/ANGRY. If NEGATIVE or ANGRY, brief reason.", primaryModel: "gemma-4-26b", fallbackModels: [], tier: 3, priority: 70, when: "true" },
      ],
    },
  ],
};

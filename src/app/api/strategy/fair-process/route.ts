import { NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query } from "@/lib/db/queries"

const PRINCIPLES = [
  { id: 1, key: "engagement", nameEn: "Engagement", nameBn: "অংশগ্রহণ", icon: "🗣️", color: "#6366f1",
    descEn: "Involve people in decisions that affect them. Listen to their input and let them challenge ideas.",
    descBn: "লোকেদের তাদের প্রভাবিত করে এমন সিদ্ধান্তে যুক্ত করুন। তাদের ইনপুট শুনুন এবং তাদের ধারণা চ্যালেঞ্জ করতে দিন।",
    why: "People support what they help create. Engagement builds ownership and commitment.",
    whyBn: "লোকেরা যা তৈরি করতে সাহায্য করে তা সমর্থন করে। অংশগ্রহণ মালিকানা এবং প্রতিশ্রুতি তৈরি করে।",
    applyToMembers: "Ask members what features they want. Let them vote on new courses. Run feedback surveys and show results.",
    applyToTeam: "Include team members in strategy discussions. Let them propose solutions before you dictate them." },
  { id: 2, key: "explanation", nameEn: "Explanation", nameBn: "ব্যাখ্যা", icon: "📖", color: "#10b981",
    descEn: "Explain the reasoning behind every decision. People accept outcomes they don't like if they understand why.",
    descBn: "প্রতিটি সিদ্ধান্তের পিছনে যুক্তি ব্যাখ্যা করুন। লোকেরা তারা পছন্দ করে না এমন ফলাফল গ্রহণ করে যদি তারা কেন তা বোঝে।",
    why: "Fair Process doesn't mean everyone gets what they want — it means everyone understands why decisions were made.",
    whyBn: "ফেয়ার প্রসেস মানে সবাই যা চায় তা পাওয়া নয় — এর অর্থ সবাই বোঝে কেন সিদ্ধান্ত নেওয়া হয়েছে।",
    applyToMembers: "When changing pricing or policies, explain the 'why' behind it. Share cost data, market realities, and value delivered.",
    applyToTeam: "Before announcing changes, explain the reasoning. Connect decisions to company goals and customer needs." },
  { id: 3, key: "clarity", nameEn: "Expectation Clarity", nameBn: "প্রত্যাশার স্বচ্ছতা", icon: "🎯", color: "#f59e0b",
    descEn: "Make rules and expectations clear from the start. No hidden agendas or surprises.",
    descBn: "নিয়ম এবং প্রত্যাশা শুরু থেকেই পরিষ্কার করুন। কোন লুকানো এজেন্ডা বা চমক নেই।",
    why: "When expectations are clear, people know what's expected and what they can expect in return. Removes anxiety.",
    whyBn: "যখন প্রত্যাশা পরিষ্কার হয়, লোকেরা জানে কী প্রত্যাশিত এবং বিনিময়ে তারা কী আশা করতে পারে। উদ্বেগ দূর করে।",
    applyToMembers: "Clearly state commission structures, payout timelines, and terms upfront. No fine print surprises.",
    applyToTeam: "Set clear KPIs, growth paths, and evaluation criteria. Everyone knows how to succeed." },
]

export async function GET() {
  try {
    const env = await getDB()
    const saved = await query<any>(env, "SELECT * FROM ai_knowledge_distribution WHERE source_id = 'blue_ocean_strategy' AND knowledge_title LIKE '%Fair Process%' LIMIT 1")
    return NextResponse.json({
      principles: PRINCIPLES,
      knowledge: saved.length > 0 ? { title: saved[0].knowledge_title, content: saved[0].knowledge_content } : null,
    })
  } catch {
    return NextResponse.json({ principles: PRINCIPLES, knowledge: null })
  }
}

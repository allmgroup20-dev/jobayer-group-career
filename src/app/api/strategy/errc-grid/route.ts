import { NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query } from "@/lib/db/queries"

const GRID_FRAMEWORK = {
  quadrants: [
    { key: "eliminate", label: "ELIMINATE", labelBn: "বাদ দিন", color: "#ef4444", icon: "✂️",
      desc: "Factors the industry takes for granted but no longer add value. Remove them.",
      descBn: "শিল্প যে বিষয়গুলিকে মঞ্জুর করে নেয় কিন্তু আর মূল্য যোগ করে না। সেগুলি সরান।",
      questions: ["What do competitors fight over that customers don't care about?", "What steps can we remove from the process?", "What fees or complexity can we eliminate?"],
      platformExamples: ["Hidden transaction fees", "Complex registration forms", "Manual approval delays", "Confusing commission structures"] },
    { key: "reduce", label: "REDUCE", labelBn: "কমিয়ে দিন", color: "#f59e0b", icon: "📉",
      desc: "Factors below industry standard. Simplify what's over-designed or over-priced.",
      descBn: "শিল্প মানের নীচে ফ্যাক্টর। অতিরিক্ত ডিজাইন বা অতিরিক্ত দামের জিনিস সরল করুন।",
      questions: ["What's overly complicated?", "What can we simplify without losing value?", "What's overpriced relative to value delivered?"],
      platformExamples: ["Reduce marketing jargon", "Reduce pressure selling", "Reduce email frequency", "Reduce learning curve time"] },
    { key: "raise", label: "RAISE", labelBn: "বাড়িয়ে দিন", color: "#6366f1", icon: "📈",
      desc: "Factors above industry standard. Invest in what customers truly value.",
      descBn: "শিল্প মানের উপরে ফ্যাক্টর। গ্রাহকরা যা সত্যিই মূল্য দেয় তাতে বিনিয়োগ করুন।",
      questions: ["What do customers wish was better?", "Where can we set a new industry standard?", "What under-served need can we over-deliver on?"],
      platformExamples: ["Raise trust via transparent policies", "Raise support quality with AI agents", "Raise income potential with better tools", "Raise community engagement"] },
    { key: "create", label: "CREATE", labelBn: "তৈরি করুন", color: "#10b981", icon: "✨",
      desc: "Factors never offered before. Create entirely new sources of value.",
      descBn: "পূর্বে কখনও দেওয়া হয়নি এমন ফ্যাক্টর। মূল্যের সম্পূর্ণ নতুন উৎস তৈরি করুন।",
      questions: ["What can we offer that no one else does?", "What new technology can we leverage?", "What unmet need can we address innovatively?"],
      platformExamples: ["AI Psychology Agents", "WhatsApp-integrated learning", "Zero-tax premium withdrawal", "Personal strategy coach"] },
  ],
}

export async function GET() {
  try {
    const env = await getDB()
    const saved = await query<any>(env, "SELECT * FROM ai_knowledge_distribution WHERE source_id = 'blue_ocean_strategy' AND knowledge_title LIKE '%ERRC Grid%' LIMIT 1")
    return NextResponse.json({
      framework: GRID_FRAMEWORK,
      knowledge: saved.length > 0 ? { title: saved[0].knowledge_title, content: saved[0].knowledge_content } : null,
    })
  } catch {
    return NextResponse.json({ framework: GRID_FRAMEWORK, knowledge: null })
  }
}

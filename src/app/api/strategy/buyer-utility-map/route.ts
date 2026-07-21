import { NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query } from "@/lib/db/queries"

const UTILITY_STAGES = [
  { id: 1, key: "purchase", nameEn: "Purchase", nameBn: "ক্রয়", icon: "🛒",
    descEn: "How easy is it to buy? Is the purchasing process simple, transparent, and frictionless?",
    descBn: "কেনা কতটা সহজ? ক্রয় প্রক্রিয়া কি সহজ, স্বচ্ছ এবং বাধাহীন?",
    blockers: ["Complex checkout", "Hidden fees", "Too many steps", "Payment confusion"],
    ourEdge: "WhatsApp-based registration, 3-step checkout, transparent pricing" },
  { id: 2, key: "delivery", nameEn: "Delivery", nameBn: "ডেলিভারি", icon: "📦",
    descEn: "How fast is delivery? Is the product/service accessible immediately after purchase?",
    descBn: "ডেলিভারি কত দ্রুত? ক্রয়ের পরপরই কি পণ্য/সেবা অ্যাক্সেসযোগ্য?",
    blockers: ["Slow onboarding", "Delayed access", "Physical shipping costs", "Setup complexity"],
    ourEdge: "Instant access after payment, WhatsApp delivery, no physical shipping" },
  { id: 3, key: "use", nameEn: "Use", nameBn: "ব্যবহার", icon: "💻",
    descEn: "How convenient is the product to use? Is it intuitive and requires minimal training?",
    descBn: "পণ্যটি ব্যবহার করা কতটা সুবিধাজনক? এটি কি স্বজ্ঞাত এবং ন্যূনতম প্রশিক্ষণের প্রয়োজন?",
    blockers: ["Steep learning curve", "Complex interface", "Needs constant support", "Language barriers"],
    ourEdge: "Bengali-first interface, AI-guided learning, mobile-optimized" },
  { id: 4, key: "supplements", nameEn: "Supplements", nameBn: "পরিপূরক", icon: "🧩",
    descEn: "What extra products, services, or tools are needed to get full value?",
    descBn: "সম্পূর্ণ মূল্য পেতে কী অতিরিক্ত পণ্য, পরিষেবা বা সরঞ্জাম প্রয়োজন?",
    blockers: ["Requires extra purchases", "Needs third-party tools", "Missing features", "Add-on costs"],
    ourEdge: "All-in-one platform: courses, CRM, commission tracking, community" },
  { id: 5, key: "maintenance", nameEn: "Maintenance", nameBn: "রক্ষণাবেক্ষণ", icon: "🔧",
    descEn: "How easy is it to maintain, update, or get support for the product?",
    descBn: "পণ্যটির রক্ষণাবেক্ষণ, আপডেট বা সহায়তা পাওয়া কতটা সহজ?",
    blockers: ["No support after sale", "Expensive maintenance", "Slow updates", "Complex troubleshooting"],
    ourEdge: "24/7 AI support, continuous content updates, community help" },
  { id: 6, key: "disposal", nameEn: "Disposal", nameBn: "নিষ্পত্তি", icon: "♻️",
    descEn: "How easy is it to stop, cancel, or replace the product? Is there lock-in?",
    descBn: "পণ্যটি বন্ধ করা, বাতিল করা বা প্রতিস্থাপন করা কতটা সহজ? কি লক-ইন আছে?",
    blockers: ["Difficult cancellation", "Long contracts", "Data lock-in", "No refund policy"],
    ourEdge: "No long-term contracts, easy cancellation, data export available" },
]

export async function GET() {
  try {
    const env = await getDB()
    const saved = await query<any>(env, "SELECT * FROM ai_knowledge_distribution WHERE source_id = 'blue_ocean_strategy' AND knowledge_title LIKE '%Buyer Utility Map%' LIMIT 1")
    return NextResponse.json({
      stages: UTILITY_STAGES,
      knowledge: saved.length > 0 ? { title: saved[0].knowledge_title, content: saved[0].knowledge_content } : null,
    })
  } catch {
    return NextResponse.json({ stages: UTILITY_STAGES, knowledge: null })
  }
}

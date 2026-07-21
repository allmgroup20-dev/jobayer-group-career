import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query } from "@/lib/db/queries"

const CORRIDOR_FRAMEWORK = {
  steps: [
    { id: 1, key: "mass_price", nameEn: "Identify Mass Price Level", nameBn: "গণ মূল্য স্তর চিহ্নিত করুন", descEn: "What price level makes your offering irresistible to the mass of target buyers? Not what the market will bear — what creates a mass market.", descBn: "কোন মূল্য স্তর লক্ষ্য ক্রেতাদের জন্য আপনার অফারকে অপ্রতিরোধ্য করে তোলে? বাজার যা নিতে পারে তা নয় — কী একটি গণ বাজার তৈরি করে।" },
    { id: 2, key: "three_references", nameEn: "Check 3 Reference Points", nameBn: "৩টি রেফারেন্স পয়েন্ট চেক করুন", descEn: "1) Substitute products (cheaper alternatives solving same need) 2) Competitor products (similar offerings) 3) Look-alike products (different industries, same customer)", descBn: "১) বিকল্প পণ্য (একই প্রয়োজন সমাধান করে এমন সস্তা বিকল্প) ২) প্রতিযোগী পণ্য (অনুরূপ অফার) ৩) সদৃশ পণ্য (একই গ্রাহক, ভিন্ন শিল্প)" },
    { id: 3, key: "target_costing", nameEn: "Apply Target Costing", nameBn: "টার্গেট কস্টিং প্রয়োগ করুন", descEn: "Set the price first (based on mass appeal), then design the cost structure to deliver profitably at that price.", descBn: "প্রথমে দাম নির্ধারণ করুন (গণ আবেদনের উপর ভিত্তি করে), তারপর সেই দামে লাভজনকভাবে সরবরাহ করতে খরচ কাঠামো ডিজাইন করুন।" },
    { id: 4, key: "volume_math", nameEn: "Calculate Break-Even Volume", nameBn: "ব্রেক-ইভেন ভলিউম গণনা করুন", descEn: "How many units do you need to sell at the corridor price to break even? Is this volume realistic for your target market?", descBn: "করিডোর মূল্যে ব্রেক-ইভেন করতে কত ইউনিট বিক্রি করতে হবে? এই ভলিউম কি আপনার লক্ষ্য বাজারের জন্য বাস্তবসম্মত?" },
  ],
  referencePoints: [
    { key: "substitutes", nameEn: "Substitute Products", nameBn: "বিকল্প পণ্য", exampleEn: "If you sell an online course, substitutes include physical books, YouTube, local coaching centers.", exampleBn: "আপনি যদি একটি অনলাইন কোর্স বিক্রি করেন, বিকল্পগুলির মধ্যে রয়েছে ফিজিক্যাল বই, YouTube, স্থানীয় কোচিং সেন্টার।" },
    { key: "competitors", nameEn: "Competitor Products", nameBn: "প্রতিযোগী পণ্য", exampleEn: "Other platforms offering similar courses, memberships, or earning opportunities.", exampleBn: "অনুরূপ কোর্স, সদস্যপদ, বা আয়ের সুযোগ দেওয়া অন্যান্য প্ল্যাটফর্ম।" },
    { key: "look_alikes", nameEn: "Look-Alike Products", nameBn: "সদৃশ পণ্য", exampleEn: "Monthly subscription services (Netflix, phone bills, utility payments) — what does the same customer pay monthly?", exampleBn: "মাসিক সাবস্ক্রিপশন পরিষেবা (Netflix, ফোন বিল, ইউটিলিটি পেমেন্ট) — একই গ্রাহক মাসিক কত টাকা দেয়?" },
  ],
}

export async function GET() {
  try {
    const env = await getDB()
    const saved = await query<any>(env, "SELECT * FROM ai_knowledge_distribution WHERE source_id = 'blue_ocean_strategy' AND knowledge_title LIKE '%Price Corridor%' LIMIT 1")
    return NextResponse.json({
      framework: CORRIDOR_FRAMEWORK,
      knowledge: saved.length > 0 ? { title: saved[0].knowledge_title, content: saved[0].knowledge_content } : null,
    })
  } catch {
    return NextResponse.json({ framework: CORRIDOR_FRAMEWORK, knowledge: null })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      product?: string; targetCost?: number; competitorPrice?: number; perceivedValue?: number
    }
    const { product, targetCost, competitorPrice, perceivedValue } = body
    const corridorLow = competitorPrice ? Math.round(competitorPrice * 0.6) : null
    const corridorHigh = perceivedValue ? Math.round(perceivedValue * 0.8) : null
    return NextResponse.json({
      query: { product, targetCost, competitorPrice, perceivedValue },
      corridor: { low: corridorLow, high: corridorHigh },
      steps: CORRIDOR_FRAMEWORK.steps.map((s) => ({
        step: s, prompt: `Evaluate ${product || "our offering"} through ${s.nameEn}: ${s.descEn}`,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query } from "@/lib/db/queries"

const FRAMEWORK_QUESTIONS = [
  { id: 1, key: "price", nameEn: "Price — Is the price accessible to the mass?", nameBn: "মূল্য — দাম কি গণমানুষের কাছে পৌঁছানো যায়?", descEn: "Does the price sit within the Price Corridor of the Mass? Can the largest pool of target buyers afford it?", descBn: "দাম কি Price Corridor of the Mass-এর মধ্যে আছে? লক্ষ্য ক্রেতাদের বৃহত্তম পুল কি এটি কিনতে পারে?", checklist: ["Set price based on mass appeal, not cost-plus", "Check 3 reference points (substitutes, competitors, look-alikes)", "Price is within corridor range"] },
  { id: 2, key: "cost", nameEn: "Cost — Can we profit at this price?", nameBn: "খরচ — আমরা কি এই দামে লাভ করতে পারি?", descEn: "Can we produce and deliver at the corridor price while still making a profit? Use target costing.", descBn: "আমরা কি করিডোর মূল্যে উৎপাদন ও সরবরাহ করতে পারি এবং এখনও মুনাফা করতে পারি? টার্গেট কস্টিং ব্যবহার করুন।", checklist: ["Design cost to meet target price", "Simplify operations to reduce cost", "Achieve target profit margin at corridor price"] },
  { id: 3, key: "partners", nameEn: "Partners — Can we leverage partnerships?", nameBn: "অংশীদার — আমরা কি অংশীদারিত্ব ব্যবহার করতে পারি?", descEn: "What partnerships, channels, and innovations help deliver value at low cost while maintaining quality?", descBn: "কোন অংশীদারিত্ব, চ্যানেল এবং উদ্ভাবন কম খরচে মূল্য সরবরাহ করতে সাহায্য করে?", checklist: ["Identify strategic partners to share costs", "Explore platform models (reduce asset ownership)", "Use partner channels for distribution"] },
  { id: 4, key: "volume", nameEn: "Volume — Is the break-even volume realistic?", nameBn: "ভলিউম — ব্রেক-ইভেন ভলিউম কি বাস্তবসম্মত?", descEn: "What volume do we need to break even? Is this realistic given market size, capacity, and adoption rate?", descBn: "ব্রেক-ইভেন করতে আমাদের কী ভলিউম দরকার? বাজারের আকার, ক্ষমতা এবং গ্রহণের হার বিবেচনা করে কি এটি বাস্তবসম্মত?", checklist: ["Calculate break-even volume", "Compare to realistic market adoption rate", "Consider scaling timeline (months 1-3, 4-6, 7-12)"] },
]

const PRICING_STRATEGIES = [
  { strategy: "Starter (Educational)", price: "৳500-৳999/mo", target: "Students, unemployed, first-time earners", corridorCheck: "Below most competitor pricing; accessible to mass" },
  { strategy: "Professional (Income Builder)", price: "৳1,500-৳2,999/mo", target: "Working professionals, part-time earners", corridorCheck: "Matches competitor range; value justified" },
  { strategy: "Premium (Business Growth)", price: "৳5,000-৳9,999/mo", target: "Business owners, full-time earners", corridorCheck: "Above mass corridor; premium features justify" },
]

export async function GET() {
  try {
    const env = await getDB()
    const saved = await query<any>(env, "SELECT * FROM ai_knowledge_distribution WHERE source_id = 'blue_ocean_strategy' AND knowledge_title LIKE '%Business Model%' LIMIT 1")
    return NextResponse.json({
      questions: FRAMEWORK_QUESTIONS,
      strategies: PRICING_STRATEGIES,
      knowledge: saved.length > 0 ? { title: saved[0].knowledge_title, content: saved[0].knowledge_content } : null,
    })
  } catch {
    return NextResponse.json({ questions: FRAMEWORK_QUESTIONS, strategies: PRICING_STRATEGIES, knowledge: null })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { product?: string; targetPrice?: number; targetCost?: number }
    const { product, targetPrice, targetCost } = body
    const margin = targetPrice && targetCost ? targetPrice - targetCost : null
    const marginPercent = margin && targetPrice ? Math.round((margin / targetPrice) * 100) : null
    return NextResponse.json({
      query: { product, targetPrice, targetCost },
      analysis: {
        margin,
        marginPercent: marginPercent ? `${marginPercent}%` : null,
        isViable: marginPercent ? marginPercent >= 30 : null,
        recommendations: FRAMEWORK_QUESTIONS.map((q) => ({
          question: q, prompt: q.checklist.map((c) => `☐ ${c}`).join("\n"),
        })),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

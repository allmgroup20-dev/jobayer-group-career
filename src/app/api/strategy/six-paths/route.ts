import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query } from "@/lib/db/queries"

const SIX_PATHS = [
  { id: 1, key: "alternative_industries", nameEn: "Across Alternative Industries", nameBn: "বিকল্প শিল্প জুড়ে", descEn: "Compete beyond your industry's boundaries — look at what substitutes customers use instead.", descBn: "শিল্পের সীমানা পেরিয়ে প্রতিযোগিতা — গ্রাহকরা আপনার পণ্যের পরিবর্তে কী ব্যবহার করে তা দেখুন।" },
  { id: 2, key: "strategic_groups", nameEn: "Across Strategic Groups", nameBn: "কৌশলগত গ্রুপ জুড়ে", descEn: "Combine the best of different strategic groups within your industry to create a new value curve.", descBn: "আপনার শিল্পের বিভিন্ন কৌশলগত গ্রুপের সেরা দিক একত্রিত করে একটি নতুন ভ্যালু বক্ররেখা তৈরি করুন।" },
  { id: 3, key: "buyer_chain", nameEn: "Across the Chain of Buyers", nameBn: "ক্রেতা শৃঙ্খল জুড়ে", descEn: "Target a different buyer group — the user, the influencer, or the purchaser — not just the one everyone else targets.", descBn: "একটি ভিন্ন ক্রেতা গ্রুপ টার্গেট করুন — ব্যবহারকারী, প্রভাবক, বা ক্রেতা — সবাই যাকে টার্গেট করে তাকে নয়।" },
  { id: 4, key: "complementary_offerings", nameEn: "Across Complementary Offerings", nameBn: "পরিপূরক অফার জুড়ে", descEn: "Solve the total solution customers need by looking at what they use before, during, and after your product.", descBn: "গ্রাহকরা আপনার পণ্যের আগে, সময় এবং পরে কী ব্যবহার করে তা দেখে সম্পূর্ণ সমাধান দিন।" },
  { id: 5, key: "functional_emotional", nameEn: "Across Functional or Emotional Appeal", nameBn: "কার্যকরী বা আবেগপূর্ণ আবেদন জুড়ে", descEn: "Flip the industry's dominant appeal — add emotion to a functional industry or function to an emotional one.", descBn: "শিল্পের প্রভাবশালী আবেদন উল্টে দিন — কার্যকরী শিল্পে আবেগ যোগ করুন বা আবেগপূর্ণ শিল্পে কার্যকারিতা যোগ করুন।" },
  { id: 6, key: "time_trends", nameEn: "Across Time", nameBn: "সময় জুড়ে", descEn: "Look at trends shaping your industry and act on what customers will want 3-5 years from now.", descBn: "আপনার শিল্পকে গঠনকারী ট্রেন্ডগুলি দেখুন এবং ৩-৫ বছর পরে গ্রাহকরা কী চাইবেন তা নিয়ে এখনই কাজ করুন।" },
]

const EXAMPLE_INSIGHTS = [
  { pathId: 1, exampleEn: "Cirque du Soleil: Instead of competing with traditional circuses (animal shows, star performers), they created a new category combining theater, music, and acrobatics.", exampleBn: "Cirque du Soleil: ঐতিহ্যবাহী সার্কাসের সাথে প্রতিযোগিতা না করে (প্রাণী শো, তারকা অভিনয়শিল্পী), তারা থিয়েটার, সঙ্গীত এবং অ্যাক্রোবেটিকসের সমন্বয়ে একটি নতুন ক্যাটাগরি তৈরি করেছে।" },
  { pathId: 2, exampleEn: "Toyota Lexus: Combined the reliability of mass-market cars with the luxury features of high-end brands at a mid-range price.", exampleBn: "Toyota Lexus: মাঝারি দামে হাই-এন্ড ব্র্যান্ডের বিলাসবহুল বৈশিষ্ট্যের সাথে গণবাজার গাড়ির নির্ভরযোগ্যতা একত্রিত করেছে।" },
  { pathId: 3, exampleEn: "Novo Nordisk: Instead of targeting doctors (prescribers), they targeted patients directly with educational programs.", exampleBn: "Novo Nordisk: ডাক্তারদের টার্গেট না করে (প্রেসক্রাইবার), তারা সরাসরি রোগীদের শিক্ষামূলক প্রোগ্রাম দিয়ে টার্গেট করেছে।" },
  { pathId: 4, exampleEn: "IKEA: Solved the total home furnishing experience — design, furniture, delivery, assembly instructions, all in one.", exampleBn: "IKEA: সম্পূর্ণ হোম ফার্নিশিং অভিজ্ঞতা সমাধান করেছে — ডিজাইন, আসবাবপত্র, ডেলিভারি, অ্যাসেম্বলি নির্দেশনা, সব একসাথে।" },
  { pathId: 5, exampleEn: "The Body Shop: Added emotional appeal (ethical beauty, no animal testing) to a functional industry (soap and lotion).", exampleBn: "The Body Shop: একটি কার্যকরী শিল্পে (সাবান এবং লোশন) আবেগপূর্ণ আবেদন যোগ করেছে (নৈতিক সৌন্দর্য, কোনো প্রাণী পরীক্ষা নয়)।" },
  { pathId: 6, exampleEn: "Netflix: Saw the trend of streaming (internet speed, digital content) and moved from DVD rental to streaming before anyone else.", exampleBn: "Netflix: স্ট্রিমিংয়ের ট্রেন্ড (ইন্টারনেট স্পিড, ডিজিটাল কন্টেন্ট) দেখে অন্যদের আগে DVD ভাড়া থেকে স্ট্রিমিংয়ে চলে গেছে।" },
]

export async function GET() {
  try {
    const env = await getDB()
    const saved = await query<any>(env, "SELECT * FROM ai_knowledge_distribution WHERE source_id = 'blue_ocean_strategy' AND knowledge_title LIKE 'Six Paths%' LIMIT 1")
    return NextResponse.json({
      paths: SIX_PATHS,
      examples: EXAMPLE_INSIGHTS,
      knowledge: saved.length > 0 ? { title: saved[0].knowledge_title, content: saved[0].knowledge_content } : null,
    })
  } catch {
    return NextResponse.json({ paths: SIX_PATHS, examples: EXAMPLE_INSIGHTS, knowledge: null })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { industry: string; product?: string }
    const { industry, product } = body
    return NextResponse.json({
      query: { industry, product },
      analysis: SIX_PATHS.map((p) => ({
        path: p,
        prompt: `Analyze ${product || industry} through ${p.nameEn}. ${p.descEn} What opportunities exist?`,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query } from "@/lib/db/queries"

export async function GET() {
  try {
    const env = await getDB()
    const saved = await query<any>(env, "SELECT * FROM ai_knowledge_distribution WHERE source_id = 'blue_ocean_strategy' AND knowledge_title = 'Core Principle — Value Innovation' LIMIT 1")
    return NextResponse.json({
      concept: {
        title: "Value Innovation",
        subtitle: "The cornerstone of Blue Ocean Strategy — pursuing differentiation AND low cost simultaneously",
        definition: "Value Innovation is the simultaneous pursuit of differentiation and low cost, creating a leap in value for both the company and its customers. It's not about beating the competition, but about making the competition irrelevant by creating a new value curve.",
        principles: [
          { key: "simultaneous", name: "Differentiation + Low Cost", nameBn: "পার্থক্য + কম খরচ", desc: "Break the value-cost trade-off. Don't choose between unique and affordable — be both.", descBn: "মূল্য-খরচ ট্রেড-অফ ভাঙুন। অনন্য এবং সাশ্রয়ী — দুটোই হোন।" },
          { key: "create_demand", name: "Create New Demand", nameBn: "নতুন চাহিদা তৈরি করুন", desc: "Don't fight over existing customers — create new demand from noncustomers.", descBn: "বিদ্যমান গ্রাহকদের নিয়ে লড়াই করবেন না — অ-গ্রাহকদের থেকে নতুন চাহিদা তৈরি করুন।" },
          { key: "make_irrelevant", name: "Make Competition Irrelevant", nameBn: "প্রতিযোগিতাকে অপ্রাসঙ্গিক করুন", desc: "When value innovation succeeds, competitors become irrelevant because the rules of the game have changed.", descBn: "যখন ভ্যালু ইনোভেশন সফল হয়, প্রতিযোগীরা অপ্রাসঙ্গিক হয়ে যায় কারণ খেলার নিয়ম পরিবর্তিত হয়েছে।" },
          { key: "whole_system", name: "Whole System Approach", nameBn: "পুরো সিস্টেম পদ্ধতি", desc: "Value innovation requires aligning the entire system — price, cost, utility, adoption — around the new value proposition.", descBn: "ভ্যালু ইনোভেশনের জন্য পুরো সিস্টেমকে একত্রিত করতে হবে — দাম, খরচ, উপযোগিতা, গ্রহণ — নতুন মূল্য প্রস্তাবের চারপাশে।" },
        ],
        ericExample: "The classic example is the ERRC Grid in action: Cirque du Soleil ELIMINATED animal shows and star performers, REDUCED thrill and danger, RAISED theater and music quality, and CREATED a new artistic circus genre.",
      },
      knowledge: saved.length > 0 ? { title: saved[0].knowledge_title, content: saved[0].knowledge_content } : null,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

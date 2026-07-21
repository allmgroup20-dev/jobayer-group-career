import { NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query } from "@/lib/db/queries"

const TRAPS = [
  { id: 1, key: "best_in_industry", nameEn: "Trap 1: 'We must be the best in our industry'", nameBn: "ফাঁদ ১: 'আমাদের শিল্পে সেরা হতে হবে'", icon: "🏆",
    trapDesc: "Believing the only way to succeed is to outperform competitors on the same metrics everyone measures.",
    trapDescBn: "বিশ্বাস করা যে সফল হওয়ার একমাত্র উপায় হল সবাই যে মেট্রিকে পরিমাপ করে তাতে প্রতিযোগীদের ছাড়িয়ে যাওয়া।",
    blueOceanShift: "Instead of being the best, change the definition of the industry. Redefine what 'winning' means.",
    blueOceanShiftBn: "সেরা হওয়ার পরিবর্তে, শিল্পের সংজ্ঞা পরিবর্তন করুন। 'জেতা' বলতে কী বোঝায় তা পুনরায় সংজ্ঞায়িত করুন।",
    example: "Instead of trying to have the 'cheapest courses', redefine as 'the only platform with AI psychology agents that guide your success'.",
    exampleBn: "'সস্তার কোর্স' দেওয়ার চেষ্টা না করে, 'একমাত্র প্ল্যাটফর্ম যার AI সাইকোলজি এজেন্ট আপনার সাফল্য গাইড করে' হিসাবে পুনরায় সংজ্ঞায়িত করুন।" },
  { id: 2, key: "differentiation_cost", nameEn: "Trap 2: 'Differentiation costs more'", nameBn: "ফাঁদ ২: 'পার্থক্য করতে বেশি খরচ হয়'", icon: "💸",
    trapDesc: "Assuming you must choose between unique (expensive) and affordable (commodity).",
    trapDescBn: "ধরে নেওয়া যে আপনাকে অনন্য (ব্যয়বহুল) এবং সাশ্রয়ী (কমোডিটি) এর মধ্যে বেছে নিতে হবে।",
    blueOceanShift: "Value Innovation achieves both. Use target costing to design low cost AND high differentiation simultaneously.",
    blueOceanShiftBn: "ভ্যালু ইনোভেশন উভয়ই অর্জন করে। একই সাথে কম খরচ এবং উচ্চ পার্থক্য ডিজাইন করতে টার্গেট কস্টিং ব্যবহার করুন।",
    example: "AI agents cost less than a human team but deliver 10x more personalized service. Lower cost + higher differentiation.",
    exampleBn: "AI এজেন্টরা মানব টিমের চেয়ে কম খরচ করে কিন্তু ১০x বেশি ব্যক্তিগতকৃত সেবা দেয়। কম খরচ + উচ্চ পার্থক্য।" },
  { id: 3, key: "customers_define", nameEn: "Trap 3: 'Customers define the market'", nameBn: "ফাঁদ ৩: 'গ্রাহকরা বাজার নির্ধারণ করে'", icon: "👂",
    trapDesc: "Letting existing customers define what your product should be, limiting innovation to incremental improvements.",
    trapDescBn: "বিদ্যমান গ্রাহকদের নির্ধারণ করতে দেওয়া আপনার পণ্য কী হওয়া উচিত, উদ্ভাবনকে ক্রমবর্ধমান উন্নতিতে সীমাবদ্ধ করা।",
    blueOceanShift: "Lead customers to new value they haven't imagined. Don't ask what they want — show them what's possible.",
    blueOceanShiftBn: "গ্রাহকদের নতুন মূল্যে নিয়ে যান যা তারা কল্পনাও করেনি। তারা কী চায় জিজ্ঞাসা করবেন না — কী সম্ভব তা দেখান।",
    example: "Customers didn't ask for AI psychology agents — they didn't know it was possible. Now they can't imagine the platform without it.",
    exampleBn: "গ্রাহকরা AI সাইকোলজি এজেন্ট চাননি — তারা জানতেন না এটি সম্ভব। এখন তারা প্ল্যাটফর্মটি ছাড়া কল্পনা করতে পারে না।" },
  { id: 4, key: "existing_demand", nameEn: "Trap 4: 'Focus only on existing demand'", nameBn: "ফাঁদ ৪: 'শুধু বিদ্যমান চাহিদায় ফোকাস'", icon: "🎯",
    trapDesc: "Fighting over the same pool of existing customers instead of creating new demand.",
    trapDescBn: "নতুন চাহিদা তৈরি করার পরিবর্তে একই পুলের বিদ্যমান গ্রাহকদের নিয়ে লড়াই করা।",
    blueOceanShift: "Create new demand from the Three Tiers of Noncustomers. Expand the market, don't just share it.",
    blueOceanShiftBn: "অ-গ্রাহকদের তিন স্তর থেকে নতুন চাহিদা তৈরি করুন। বাজার সম্প্রসারিত করুন, শুধু ভাগ করবেন না।",
    example: "Instead of competing with other online course platforms, target rural women, retirees, and students who never considered online earning.",
    exampleBn: "অন্যান্য অনলাইন কোর্স প্ল্যাটফর্মের সাথে প্রতিযোগিতা না করে, গ্রামীণ মহিলা, অবসরপ্রাপ্ত এবং শিক্ষার্থীদের টার্গেট করুন যারা কখনও অনলাইন আয়ের কথা ভাবেনি।" },
  { id: 5, key: "differentiation_low_cost", nameEn: "Trap 5: 'Strategy = differentiation OR low cost'", nameBn: "ফাঁদ ৫: 'কৌশল = পার্থক্য অথবা কম খরচ'", icon: "⚖️",
    trapDesc: "The belief that strategy is fundamentally a choice between being unique (high margin) or cheap (high volume).",
    trapDescBn: "বিশ্বাস যে কৌশল মূলত অনন্য (উচ্চ মার্জিন) বা সস্তা (উচ্চ ভলিউম) হওয়ার মধ্যে একটি পছন্দ।",
    blueOceanShift: "Pursue BOTH simultaneously through Value Innovation. Break the trade-off.",
    blueOceanShiftBn: "ভ্যালু ইনোভেশনের মাধ্যমে একই সাথে উভয়ই অনুসরণ করুন। ট্রেড-অফ ভাঙুন।",
    example: "Premium features (high perceived value) delivered at low cost (AI automation, no physical infrastructure, WhatsApp-based).",
    exampleBn: "প্রিমিয়াম বৈশিষ্ট্য (উচ্চ অনুভূত মান) কম খরচে বিতরণ করা হয়েছে (AI অটোমেশন, কোন শারীরিক পরিকাঠামো নেই, WhatsApp-ভিত্তিক)।" },
  { id: 6, key: "execution_separate", nameEn: "Trap 6: 'Execution is separate from strategy'", nameBn: "ফাঁদ ৬: 'বাস্তবায়ন কৌশল থেকে আলাদা'", icon: "🧩",
    trapDesc: "Thinking you can design a strategy in isolation and then 'roll it out' without involving those who execute it.",
    trapDescBn: "মনে করা যে আপনি আলাদাভাবে একটি কৌশল ডিজাইন করতে পারেন এবং তারপর এটি 'রোল আউট' করতে পারেন যারা এটি বাস্তবায়ন করে তাদের যুক্ত না করেই।",
    blueOceanShift: "Build execution INTO strategy from day one via Fair Process. Engage, explain, set clear expectations.",
    blueOceanShiftBn: "ফেয়ার প্রসেসের মাধ্যমে প্রথম দিন থেকেই কৌশলে বাস্তবায়ন তৈরি করুন। যুক্ত করুন, ব্যাখ্যা করুন, স্পষ্ট প্রত্যাশা সেট করুন।",
    example: "When launching new features, involve top members in beta testing. Their feedback shapes the final product, and they become champions.",
    exampleBn: "নতুন বৈশিষ্ট্য চালু করার সময়, বিটা টেস্টিংয়ে শীর্ষ সদস্যদের যুক্ত করুন। তাদের প্রতিক্রিয়া চূড়ান্ত পণ্যকে আকার দেয় এবং তারা চ্যাম্পিয়ন হয়ে ওঠে।" },
]

export async function GET() {
  try {
    const env = await getDB()
    const saved = await query<any>(env, "SELECT * FROM ai_knowledge_distribution WHERE source_id = 'blue_ocean_strategy' AND knowledge_title LIKE '%Red Ocean Traps%' LIMIT 1")
    return NextResponse.json({
      traps: TRAPS,
      knowledge: saved.length > 0 ? { title: saved[0].knowledge_title, content: saved[0].knowledge_content } : null,
    })
  } catch {
    return NextResponse.json({ traps: TRAPS, knowledge: null })
  }
}

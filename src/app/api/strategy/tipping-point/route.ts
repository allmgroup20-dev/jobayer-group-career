import { NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query } from "@/lib/db/queries"

const HURDLES = [
  { id: 1, key: "cognitive", nameEn: "Cognitive Hurdle", nameBn: "জ্ঞানগত বাধা", icon: "🧠",
    descEn: "People don't see the need for change. They're comfortable with the status quo.",
    descBn: "লোকেরা পরিবর্তনের প্রয়োজন দেখে না। তারা স্থিতাবস্থায় স্বাচ্ছন্দ্য বোধ করে।",
    solution: "Make them experience the worst reality directly. Show the data and consequences, don't just tell.",
    solutionBn: "তাদের সরাসরি সবচেয়ে খারাপ বাস্তবতা অনুভব করান। ডেটা এবং পরিণতি দেখান, শুধু বলবেন না।",
    example: "Show a member how much they're losing by not upgrading — real numbers, real comparison.",
    exampleBn: "একজন সদস্যকে দেখান আপগ্রেড না করে তারা কতটা হারাচ্ছে — প্রকৃত সংখ্যা, প্রকৃত তুলনা।" },
  { id: 2, key: "resource", nameEn: "Resource Hurdle", nameBn: "সম্পদের বাধা", icon: "💰",
    descEn: "Limited budget, staff, or time. 'We can't afford to do this.'",
    descBn: "সীমিত বাজেট, কর্মী বা সময়। 'আমরা এটি করতে পারি না।'",
    solution: "Concentrate resources on high-impact activities. Trade from low-impact areas. Partner for mutual gain.",
    solutionBn: "উচ্চ-প্রভাব কার্যক্রমে সম্পদ কেন্দ্রীভূত করুন। নিম্ন-প্রভাব এলাকা থেকে বাণিজ্য করুন। পারস্পরিক লাভের জন্য অংশীদার হন।",
    example: "Instead of a full marketing team, use AI agents for 80% of customer interactions and free up human team for high-value tasks.",
    exampleBn: "পূর্ণ মার্কেটিং টিমের পরিবর্তে, ৮০% গ্রাহক মিথস্ক্রিয়ার জন্য AI এজেন্ট ব্যবহার করুন এবং উচ্চ-মূল্যের কাজের জন্য মানব টিমকে মুক্ত করুন।" },
  { id: 3, key: "motivational", nameEn: "Motivational Hurdle", nameBn: "প্রেরণার বাধা", icon: "🔥",
    descEn: "People resist change. They're comfortable or afraid of the unknown.",
    descBn: "লোকেরা পরিবর্তন প্রতিরোধ করে। তারা স্বাচ্ছন্দ্যপূর্ণ বা অজানা ভয়ে ভীত।",
    solution: "Identify 'kingpin' influencers — the 20% that drives 80% of influence. Win them first. Their conversion pulls others.",
    solutionBn: "'কিংপিন' প্রভাবকদের চিহ্নিত করুন — যারা ২০% প্রভাব চালায়। তাদের প্রথমে জয় করুন। তাদের রূপান্তর অন্যদের টানে।",
    example: "Get top-performing members to share their success stories. One testimonial from a respected peer beats 10 company messages.",
    exampleBn: "শীর্ষ-পারফর্মিং সদস্যদের তাদের সাফল্যের গল্প শেয়ার করতে দিন। একজন সম্মানিত সহকর্মীর একটি প্রশংসাপত্র ১০টি কোম্পানির বার্তাকে হারায়।" },
  { id: 4, key: "political", nameEn: "Political Hurdle", nameBn: "রাজনৈতিক বাধা", icon: "🏛️",
    descEn: "Powerful opponents block change. Internal politics, vested interests, or influential skeptics.",
    descBn: "শক্তিশালী বিরোধীরা পরিবর্তন আটকায়। অভ্যন্তরীণ রাজনীতি, স্বার্থান্বেষী মহল বা প্রভাবশালী সন্দেহবাদী।",
    solution: "Find and neutralize key opposition. Build a coalition of angels — supporters who carry weight. Isolate the blockers.",
    solutionBn: "মূল বিরোধীদের খুঁজুন এবং নিরপেক্ষ করুন। এঞ্জেলদের একটি জোট তৈরি করুন — যে সমর্থকরা ওজন বহন করে। ব্লকারদের বিচ্ছিন্ন করুন।",
    example: "Address concerns of veteran team leads individually before rolling out changes. Turn them into champions.",
    exampleBn: "পরিবর্তন চালু করার আগে প্রবীণ টিম লিডদের উদ্বেগ পৃথকভাবে সমাধান করুন। তাদের চ্যাম্পিয়নে পরিণত করুন।" },
]

export async function GET() {
  try {
    const env = await getDB()
    const saved = await query<any>(env, "SELECT * FROM ai_knowledge_distribution WHERE source_id = 'blue_ocean_strategy' AND knowledge_title LIKE '%Tipping Point%' LIMIT 1")
    return NextResponse.json({
      hurdles: HURDLES,
      knowledge: saved.length > 0 ? { title: saved[0].knowledge_title, content: saved[0].knowledge_content } : null,
    })
  } catch {
    return NextResponse.json({ hurdles: HURDLES, knowledge: null })
  }
}

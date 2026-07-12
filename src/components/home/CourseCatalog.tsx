"use client";

import { useState } from "react";
import Link from "next/link";

const categories = [
  { icon: "💼", title: "ফ্রিল্যান্সিং ও অনলাইন আর্নিং", count: 30 },
  { icon: "💻", title: "প্রোগ্রামিং ও আইটি ডেভেলপমেন্ট", count: 20 },
  { icon: "📢", title: "ডিজিটাল মার্কেটিং ও এসইও", count: 28 },
  { icon: "🌍", title: "ই-কমার্স ও অনলাইন ব্যবসা", count: 25 },
  { icon: "🎨", title: "UI/UX, মোশন গ্রাফিক্স ও থ্রিডি", count: 22 },
  { icon: "📚", title: "ভাষা শিক্ষা ও চাকরি প্রস্তুতি", count: 35 },
  { icon: "🛠️", title: "সফটওয়্যার টুলস", count: 40 },
  { icon: "🏛️", title: "প্রতিষ্ঠানসমূহ", count: 9 },
  { icon: "👑", title: "শীর্ষ প্রশিক্ষকবৃন্দ", count: 12 },
];

const institutions = [
  "📘 টেন মিনিট স্কুল (10MS)", "📗 ঘুড়ি লার্নিং (Ghoori Learning)", "📙 স্কিল আপ (Skill Up)",
  "📕 ইশিখন (eShikhon.com)", "📊 মায়াজাল (Mayajal)", "🖥️ MSB Academy",
  "⚙️ ক্রিয়েটিভ আইটি (Creative IT)", "🧩 প্রব্লেম কেআই (Problem KI)", "📖 রেপটো (REPTO)",
];

const trainers = [
  "👑 আয়মান সাদিক", "🎯 মুনজারিন শহীদ", "💻 ঝংকার মাহবুব", "🚀 খালিদ ফারহান",
  "🎨 সাদমান সাদিক", "🌍 ফ্রিল্যান্সার নাসিম", "🎤 তাহসান খান", "📱 জুবায়ের হোসাইন",
  "📊 আবতাহি ইপ্তেসাম", "🕌 মাহাদে হাসান", "💼 ভৈভব সিসিনিটি", "🔍 সোবান তারিক",
];

export default function CourseCatalog() {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-br from-primary/5 to-primary/5 border border-primary/20">
      <div className="section-header">
        <div className="badge mx-auto mb-3">🎯 দেখুন — ২৩০+ কোর্সে আপনি কী পাচ্ছেন</div>
        <h3 className="text-lg md:text-xl font-black text-text">২৩০+ প্রিমিয়াম কোর্স — ১০টি বিভাগে</h3>
        <p className="text-sm font-semibold text-text-secondary mt-1">শুধু একটি প্যাকেজেই সবকিছু</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-border hover:border-info/30 hover:shadow-sm transition-all">
            <span className="text-2xl leading-none">{cat.icon}</span>
            <div>
              <span className="font-bold text-sm text-text leading-tight block">{cat.title}</span>
              <span className="text-xs text-text-secondary">{cat.count}+ কোর্স</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-border bg-white text-info font-extrabold text-sm cursor-pointer transition-all hover:border-info hover:bg-info/5"
        >
          📂 {showAll ? "সংকুচিত করুন" : "সব প্ল্যাটফর্ম ও ট্রেইনার দেখুন (২১টি)"}
          <span className={`transition-transform duration-300 ${showAll ? "rotate-180" : ""}`}>▼</span>
        </button>
        {showAll && (
          <div className="mt-4 grid gap-4">
            <div className="rounded-xl p-4 bg-white border border-border">
              <h4 className="font-black text-sm text-text mb-3">🏛️ প্রতিষ্ঠানসমূহ</h4>
              <p className="text-xs font-semibold text-text-secondary mb-3">যেসব প্ল্যাটফর্মের কোর্স আপনি পাচ্ছেন</p>
              <div className="flex flex-wrap gap-2">
                {institutions.map((item) => (
                  <span key={item} className="px-3 py-2 rounded-full bg-white border border-border font-bold text-xs text-text">{item}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-4 bg-white border border-border">
              <h4 className="font-black text-sm text-text mb-3">👨‍🏫 শীর্ষ প্রশিক্ষকবৃন্দ</h4>
              <p className="text-xs font-semibold text-text-secondary mb-3">যেসব তারকা প্রশিক্ষকের কোর্স আপনি পাচ্ছেন</p>
              <div className="flex flex-wrap gap-2">
                {trainers.map((item) => (
                  <span key={item} className="px-3 py-2 rounded-full bg-white border border-border font-bold text-xs text-text">{item}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-4">
        <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange to-orange-dark text-white font-black text-sm no-underline shadow-lg shadow-orange/30 hover:-translate-y-0.5 transition-all cursor-pointer">
          📚 সম্পূর্ণ ক্যাটালগ দেখুন →
        </Link>
      </div>
    </div>
  );
}

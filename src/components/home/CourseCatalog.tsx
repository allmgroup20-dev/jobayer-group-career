"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { courseCategories, trainers, platforms } from "@/data/landing-page-data";

export default function CourseCatalog() {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-br from-primary/5 to-primary/5 border border-primary/20">
      <div className="section-header">
        <div className="badge mx-auto mb-3">🎯 দেখুন — ২৩০+ কোর্সে আপনি কী পাচ্ছেন</div>
        <h3 className="text-lg md:text-xl font-black text-text">২৩০+ প্রিমিয়াম কোর্স — {courseCategories.length}টি বিভাগে</h3>
        <p className="text-sm font-semibold text-text-secondary mt-1">দেশের সেরা {trainers.length} জন প্রশিক্ষকের কোর্স</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {courseCategories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-border hover:border-info/30 hover:shadow-sm transition-all">
            <span className="text-2xl leading-none">{cat.icon}</span>
            <div>
              <span className="font-bold text-sm text-text leading-tight block">{cat.title}</span>
              <span className="text-xs text-text-secondary">{cat.courses.length}+ কোর্স</span>
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
              <h4 className="font-black text-sm text-text mb-3">🏛️ প্ল্যাটফর্মসমূহ</h4>
              <p className="text-xs font-semibold text-text-secondary mb-3">যেসব প্ল্যাটফর্মের কোর্স আপনি পাচ্ছেন</p>
              <div className="flex flex-wrap gap-3">
                {platforms.map((p) => (
                  <div key={p.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-border">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-bg relative flex-shrink-0">
                      <Image src={p.logo} alt={p.nameBn} fill className="object-contain p-1" sizes="32px" />
                    </div>
                    <span className="font-bold text-xs text-text">{p.nameBn}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-4 bg-white border border-border">
              <h4 className="font-black text-sm text-text mb-3">👨‍🏫 শীর্ষ প্রশিক্ষকবৃন্দ</h4>
              <p className="text-xs font-semibold text-text-secondary mb-3">যেসব তারকা প্রশিক্ষকের কোর্স আপনি পাচ্ছেন</p>
              <div className="flex flex-wrap gap-2">
                {trainers.map((t) => (
                  <div key={t.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-border">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-info to-orange relative flex-shrink-0">
                      <Image src={t.image} alt={t.nameBn} fill className="object-cover" sizes="32px" />
                    </div>
                    <span className="font-bold text-xs text-text">{t.nameBn} — {t.specialty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-4">
        <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange to-orange-dark text-white font-black text-sm no-underline shadow-lg shadow-orange/30 hover:-translate-y-0.5 transition-all cursor-pointer">
          📚 সম্পূর্ণ ক্যাটালগ দেখুন →
        </Link>
      </div>
    </div>
  );
}

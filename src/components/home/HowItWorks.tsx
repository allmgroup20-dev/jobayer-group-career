"use client";

import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { howItWorksSteps, howItWorksFooterNoteBn, howItWorksFooterNoteEn } from "@/data/landing-page-data";

export default function HowItWorks() {
  const { lang } = useLanguageStore();

  return (
    <div className="rounded-3xl p-6 md:p-8 bg-white border border-border/80 shadow-sm">
      <div className="section-header">
        <div className="badge mx-auto mb-3">🚀 {lang === "bn" ? "কিভাবে কাজ করে" : "How It Works"}</div>
        <h3 className="text-xl md:text-2xl font-black text-primary">
          {lang === "bn" ? "আপনার নতুন ডিজিটাল ক্যারিয়ারে ৩টি ধাপ" : "Your 3-Step Path to a New Digital Career"}
        </h3>
      </div>

      <div className="grid gap-5 mt-6 sm:grid-cols-3">
        {howItWorksSteps.map((s, i) => (
          <div key={i} className="group flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-gradient-to-b from-accent/[0.03] to-bg border border-border/60 hover:border-accent/20 hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl shadow-md shadow-primary/20">
                {s.icon}
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-primary-dark text-[10px] font-black flex items-center justify-center shadow-sm">
                {lang === "bn" ? s.num : s.numEn}
              </span>
            </div>
            <div>
              <h4 className="font-black text-base text-text mb-1">{lang === "bn" ? s.titleBn : s.titleEn}</h4>
              <p className="text-xs text-text-secondary font-semibold leading-relaxed">{lang === "bn" ? s.descBn : s.descEn}</p>
            </div>
            <span className="text-[10px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
              {lang === "bn" ? s.highlightBn : s.highlightEn}
            </span>
          </div>
        ))}
      </div>

      <div className="text-center mt-6 p-4 rounded-xl bg-gradient-to-r from-accent/5 to-secondary/5 border border-accent/10">
        <p className="text-xs md:text-sm font-bold text-text-secondary mb-4">
          {lang === "bn" ? howItWorksFooterNoteBn : howItWorksFooterNoteEn}
        </p>
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent via-accent-light to-accent text-white font-black text-sm no-underline shadow-lg shadow-accent/30 hover:shadow-accent/50 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]"
        >
          <span>✅ {lang === "bn" ? "এখনই শুরু করুন" : "Start Now"}</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}

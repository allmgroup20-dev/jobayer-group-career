"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { heroData, heroSectionBadgeBn, heroSectionBadgeEn, heroFeatureGridItems } from "@/data/landing-page-data";

function toBn(v: number) {
  return String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)]);
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent/8 blur-[140px] animate-blob" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/8 blur-[120px] animate-blob" style={{ animationDelay: "-4s" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] animate-blob" style={{ animationDelay: "-8s" }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg/80 to-transparent" />
    </div>
  );
}

export default function HeroSection() {
  const { lang } = useLanguageStore();
  const [liveCount, setLiveCount] = useState(866);
  const [memberCount, setMemberCount] = useState(1200);
  const [courseCount, setCourseCount] = useState(230);
  const [trainerCount, setTrainerCount] = useState(12);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch("/api/dashboard/summar")
      .then(r => r.json().catch(() => null))
      .then(d => {
        if (d && typeof d === 'object' && 'totalMembers' in d) {
          setMemberCount(Number((d as Record<string, unknown>).totalMembers));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setLiveCount((p) => p + Math.floor(Math.random() * 3) + 1), 20000);
    return () => clearInterval(id);
  }, []);

  const h = heroData;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0F1F3D] to-[#0D1B30]">
      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 md:pt-28 md:pb-32">
        <div className={`text-center transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {/* Top badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-5">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 border border-accent/25 backdrop-blur-sm text-accent-light text-sm font-bold">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-lg shadow-success/50" />
              {toBn(liveCount)}+ {lang === "bn" ? "সক্রিয় শিক্ষার্থী" : "Active Students"}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 backdrop-blur-sm text-secondary text-sm font-bold">
              🏆 {toBn(memberCount)}+ {lang === "bn" ? "সফল মেম্বর" : "Successful Members"}
            </span>
            {h.badges.slice(0, 2).map((badge, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white/80 text-xs font-bold">
                {badge.icon} {lang === "bn" ? badge.textBn : badge.textEn}
              </span>
            ))}
          </div>

          {/* Premium badge */}
          <div className="inline-flex gap-2 px-5 py-2.5 mx-auto mb-5 rounded-full bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/30 font-extrabold text-sm text-gradient animate-gradient">
            {lang === "bn" ? heroSectionBadgeBn : heroSectionBadgeEn}
          </div>

          {/* Main headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-5 max-w-5xl mx-auto">
            <span className="text-transparent bg-gradient-to-r from-white via-secondary-light to-white bg-clip-text">
              {lang === "bn" ? h.headlineBn : h.headlineEn}
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-base md:text-lg text-white/50 max-w-3xl mx-auto mb-8 leading-relaxed font-medium">
            {lang === "bn" ? h.subheadBn : h.subheadEn}
          </p>

          {/* Quick stats row */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
            {[
              { num: toBn(courseCount), label: lang === "bn" ? "কোর্স" : "Courses" },
              { num: toBn(trainerCount), label: lang === "bn" ? "ট্রেইনার" : "Trainers" },
              { num: toBn(memberCount), label: lang === "bn" ? "মেম্বর" : "Members" },
              { num: "৯৯", label: lang === "bn" ? "টাকা মাত্র" : "Only ৳99" },
            ].map((stat, i) => (
              <div key={i} className="text-center px-4 py-2">
                <div className="text-2xl md:text-3xl font-black text-white">{stat.num}</div>
                <div className="text-xs md:text-sm text-white/40 font-medium tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Problem/Solution cards */}
          <div className="max-w-4xl mx-auto mb-8 grid gap-4 md:grid-cols-2">
            <div className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center text-sm">⚡</span>
                <span className="text-warning font-bold text-sm">{lang === "bn" ? "সমস্যা" : "Problem"}</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{lang === "bn" ? h.problemBn : h.problemEn}</p>
            </div>
            <div className="group p-5 rounded-2xl bg-gradient-to-br from-accent/[0.08] to-success/[0.05] border border-accent/20 text-left backdrop-blur-sm hover:from-accent/[0.12] hover:to-success/[0.08] transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center text-sm">✅</span>
                <span className="text-success font-bold text-sm">{lang === "bn" ? "সমাধান" : "Solution"}</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{lang === "bn" ? h.solutionBn : h.solutionEn}</p>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl mx-auto mb-8">
            {heroFeatureGridItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all duration-200">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-bold text-white/70">{lang === "bn" ? item.textBn : item.textEn}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Link
              href={h.ctaHref}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent via-accent-light to-accent text-white font-bold text-lg shadow-xl shadow-accent/30 hover:shadow-accent/50 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]"
            >
              <span>{lang === "bn" ? h.ctaBn : h.ctaEn}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/courses"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white font-bold text-lg hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]"
            >
              <span>{lang === "bn" ? "কোর্স দেখুন" : "Browse Courses"}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Social proof */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary border-2 border-[#0A1628] flex items-center justify-center text-xs font-bold text-white">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-secondary/30 border-2 border-[#0A1628] flex items-center justify-center text-xs font-bold text-secondary">
                +
              </div>
            </div>
            <span className="text-white/50 text-sm font-medium">
              {lang === "bn"
                ? `${toBn(memberCount)}+ জন ইতিমধ্যেই যুক্ত হয়েছেন`
                : `${memberCount}+ people have already joined`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

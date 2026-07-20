"use client";

import { trustBadges, trustSectionData } from "@/data/landing-page-data";
import { useLanguageStore } from "@/lib/store";
import Link from "next/link";

export default function TrustSection() {
  const { lang } = useLanguageStore();
  const t = trustSectionData;

  return (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-accent/20 shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-secondary/5 blur-[60px] pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 mx-auto mb-4 rounded-full bg-accent/10 border border-accent/20 font-extrabold text-sm text-accent">
          🛡️ {lang === "bn" ? t.badgeBn.replace("🛡️ ", "") : t.badgeEn.replace("🛡️ ", "")}
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-primary mb-3 leading-tight">
          {lang === "bn" ? t.titleBn : t.titleEn}
        </h2>
        <p className="text-sm md:text-base font-semibold text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
          {lang === "bn" ? t.descBn : t.descEn}
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {trustBadges.map((badge) => (
            <span key={badge.textBn} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-border/80 font-bold text-sm shadow-sm text-text hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <span className="text-lg">{badge.icon}</span>
              <span>{lang === "bn" ? badge.textBn : badge.textEn}</span>
            </span>
          ))}
        </div>

        <Link
          href="/register"
          className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent via-accent-light to-accent text-white font-bold text-lg shadow-xl shadow-accent/30 hover:shadow-accent/50 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]"
        >
          <span>{lang === "bn" ? t.ctaBn : t.ctaEn}</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        <p className="text-xs text-text-secondary font-medium mt-5 flex items-center justify-center gap-1">
          <span>🔒</span> {lang === "bn" ? t.footerBn : t.footerEn}
        </p>
      </div>
    </div>
  );
}

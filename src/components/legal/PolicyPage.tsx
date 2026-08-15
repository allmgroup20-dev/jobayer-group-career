"use client";

import { useLanguageStore } from "@/lib/store";

interface PolicySection {
  enTitle: string;
  bnTitle: string;
  en: string[];
  bn: string[];
}

interface PolicyPageProps {
  badgeEn: string;
  badgeBn: string;
  titleEn: string;
  titleBn: string;
  updatedEn: string;
  updatedBn: string;
  sections: PolicySection[];
}

export default function PolicyPage({
  badgeEn,
  badgeBn,
  titleEn,
  titleBn,
  updatedEn,
  updatedBn,
  sections,
}: PolicyPageProps) {
  const { lang } = useLanguageStore();

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-6">
        <div className="text-center">
          <div className="badge mx-auto mb-3 bg-info/10 text-info border-info/20">
            {lang === "bn" ? badgeBn : badgeEn}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-text">
            {lang === "bn" ? titleBn : titleEn}
          </h1>
          <p className="text-xs text-text-secondary mt-2">
            {lang === "bn" ? updatedBn : updatedEn}
          </p>
        </div>

        {sections.map((s, i) => (
          <section key={i} className="rounded-2xl p-5 md:p-6 bg-white border border-border">
            <h2 className="text-lg font-black text-text mb-3">
              {lang === "bn" ? s.bnTitle : s.enTitle}
            </h2>
            <div className="space-y-2.5">
              {(lang === "bn" ? s.bn : s.en).map((p, j) => (
                <p key={j} className="text-sm text-text-secondary leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

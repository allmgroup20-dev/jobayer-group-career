"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { useSiteContent } from "@/lib/use-site-content";
import { faqs } from "@/data/home/faq";

const faqDefaults = { faqs };
type FaqContent = typeof faqDefaults;

export default function FAQSection() {
  const { lang } = useLanguageStore();
  const { content, enabled } = useSiteContent<FaqContent>("faq", faqDefaults);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!enabled) return null;
  const list = content.faqs;
  const previewFaqs = list.slice(0, 4);

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
      <div className="section-header">
        <div className="badge mx-auto mb-3">🤔 {lang === "bn" ? "আপনার মনে কি প্রশ্ন আছে?" : "Have Questions?"}</div>
        <h3 className="text-lg md:text-xl font-black text-text">{lang === "bn" ? "সচরাচর জিজ্ঞাসা" : "Frequently Asked Questions"}</h3>
      </div>

      <div className="grid gap-2.5 max-w-3xl mx-auto">
        {previewFaqs.map((faq, i) => (
          <div key={i} className="rounded-xl bg-bg border border-border overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              aria-expanded={openIdx === i}
              className="w-full flex items-center justify-between p-4 text-sm font-bold text-text bg-transparent border-none cursor-pointer text-left font-[inherit] hover:bg-primary/5 transition-colors"
            >
              <span>{lang === "bn" ? faq.qBn : faq.qEn}</span>
              <span className={`text-text-secondary text-xs transition-transform duration-200 ${openIdx === i ? "rotate-180" : ""}`}>▼</span>
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: openIdx === i ? "300px" : "0px", padding: openIdx === i ? "0 16px 16px" : "0 16px" }}
            >
              <p className="text-sm text-text-secondary leading-relaxed m-0">{lang === "bn" ? faq.aBn : faq.aEn}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <Link href="/reviews" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-bg border border-border text-info font-bold text-sm hover:bg-info/5 transition-all">
          📖 {lang === "bn" ? `সব প্রশ্ন ও উত্তর দেখুন (${list.length}টি)` : `View All ${list.length} FAQs`}
        </Link>
      </div>
    </div>
  );
}

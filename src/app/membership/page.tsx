"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import LivePurchaseTicker from "@/components/LivePurchaseTicker";

interface Tier {
  id: string;
  credits: number;
  offerPrice: number;
  popular: boolean;
}

const fallbackTiers: Tier[] = [
  { id: "one", credits: 1, offerPrice: 99, popular: false },
  { id: "trio", credits: 3, offerPrice: 220, popular: true },
  { id: "five", credits: 5, offerPrice: 350, popular: false },
  { id: "ten", credits: 10, offerPrice: 650, popular: false },
  { id: "hundred", credits: 100, offerPrice: 5200, popular: false },
];

function toBn(v: number) {
  return String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)]);
}

function tierQty(t: Tier) {
  if (t.credits === 100) return { bn: "সব", en: "All" };
  return { bn: toBn(t.credits), en: String(t.credits) };
}

function tierNote(t: Tier, lang: "bn" | "en") {
  if (t.credits === 100) return lang === "bn" ? "৯৭০+ সব রিসোর্স" : "970+ all resources";
  if (t.credits === 1) return lang === "bn" ? "একটি রিসোর্স আনলক" : "Unlock 1 resource";
  return lang === "bn" ? `${toBn(t.credits)}-প্যাক অফার` : `${t.credits}-pack offer`;
}

const trust = [
  { icon: "🛡️", bn: "এককালীন পেমেন্ট, আজীবন অ্যাক্সেস", en: "One-time payment, lifetime access" },
  { icon: "⚡", bn: "পেমেন্টের সাথে সাথে ডেলিভারি", en: "Instant delivery after payment" },
  { icon: "🤝", bn: "৳২০ থেকেই কমিশন উইথড্র", en: "Withdraw commissions from ৳20" },
];

export default function ResourcePackPage() {
  const { lang } = useLanguageStore();
  const [tiers, setTiers] = useState<Tier[]>(fallbackTiers);

  useEffect(() => {
    fetch("/api/pricing/tiers")
      .then(r => r.json().catch(() => null))
      .then(d => {
        const data = d as { tiers?: Tier[] } | null;
        if (data && Array.isArray(data.tiers) && data.tiers.length > 0) {
          setTiers(data.tiers.filter((t: Tier) => [1, 3, 5, 10, 100].includes(t.credits)));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-gradient-to-br from-primary via-primary/90 to-accent/80 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-bold mb-4 border border-white/10">
            🎯 {lang === "bn" ? "এককালীন রিসোর্স আনলক" : "One-time Resource Access"}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {lang === "bn" ? "৯৭০+ প্রিমিয়াম রিসোর্স, কোনো সাবস্ক্রিপশন নেই" : "970+ Premium Resources, No Subscription"}
          </h1>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">
            {lang === "bn"
              ? "যতগুলো রিসোর্স চান ততগুলো নিন, বাল্ক অফারে দাম কমে যায়। একবার কিনলে রিসোর্স আপনারই।"
              : "Buy as many resources as you want — the more you take, the less you pay per pack. Buy once, keep forever."}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tiers.map((t) => {
            const qty = tierQty(t);
            return (
              <div
                key={t.id}
                className={`relative bg-white rounded-2xl border shadow-sm p-5 flex flex-col items-center text-center ${
                  t.popular ? "border-action ring-2 ring-action/20" : "border-border"
                }`}
              >
                {t.popular && (
                  <span className="absolute -top-2.5 px-3 py-0.5 rounded-full bg-action text-white text-[10px] font-bold">
                    {lang === "bn" ? "সবচেয়ে জনপ্রিয়" : "Most Popular"}
                  </span>
                )}
                <span className="text-sm font-bold text-text-secondary">{lang === "bn" ? qty.bn : qty.en}</span>
                <span className="text-3xl font-black text-primary mt-2">৳{t.offerPrice}</span>
                <span className="text-xs text-text-secondary mt-1">{tierNote(t, lang)}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-border shadow p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/courses" className="w-full sm:w-auto btn-primary !px-8 !py-3.5">
              {lang === "bn" ? "🔓 রিসোর্স নির্বাচন করে আনলক করুন" : "🔓 Choose & Unlock Resources"}
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto btn-outline !px-8 !py-3.5">
              {lang === "bn" ? "📊 ড্যাশবোর্ডে যান" : "📊 Go to Dashboard"}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {trust.map((t) => (
            <div key={t.icon} className="bg-white/70 border border-border/60 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl shrink-0">{t.icon}</span>
              <span className="text-sm font-bold text-text-primary">{lang === "bn" ? t.bn : t.en}</span>
            </div>
          ))}
        </div>

        <LivePurchaseTicker />
      </div>
    </div>
  );
}
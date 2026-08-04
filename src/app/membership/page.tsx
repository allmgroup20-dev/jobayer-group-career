"use client";

import Link from "next/link";
import { useLanguageStore } from "@/lib/store";

const tiers = [
  { qty: "১টি", qtyEn: "1", price: 99, noteBn: "একটি রিসোর্স আনলক", noteEn: "Unlock 1 resource" },
  { qty: "৩টি", qtyEn: "3", price: 220, noteBn: "৩-প্যাক অফার", noteEn: "3-pack offer", popular: true },
  { qty: "৫টি", qtyEn: "5", price: 350, noteBn: "৫-প্যাক অফার", noteEn: "5-pack offer" },
  { qty: "১০টি", qtyEn: "10", price: 650, noteBn: "১০-প্যাক অফার", noteEn: "10-pack offer" },
  { qty: "সব", qtyEn: "All", price: 4999, noteBn: "৯৭০+ সব রিসোর্স", noteEn: "970+ all resources" },
];

export default function ResourcePackPage() {
  const { lang } = useLanguageStore();

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
          {tiers.map((t) => (
            <div
              key={t.qty}
              className={`relative bg-white rounded-2xl border shadow-sm p-5 flex flex-col items-center text-center ${
                t.popular ? "border-action ring-2 ring-action/20" : "border-border"
              }`}
            >
              {t.popular && (
                <span className="absolute -top-2.5 px-3 py-0.5 rounded-full bg-action text-white text-[10px] font-bold">
                  {lang === "bn" ? "সবচেয়ে জনপ্রিয়" : "Most Popular"}
                </span>
              )}
              <span className="text-sm font-bold text-text-secondary">{lang === "bn" ? t.qty : t.qtyEn}</span>
              <span className="text-3xl font-black text-primary mt-2">৳{t.price}</span>
              <span className="text-xs text-text-secondary mt-1">{lang === "bn" ? t.noteBn : t.noteEn}</span>
            </div>
          ))}
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
      </div>
    </div>
  );
}
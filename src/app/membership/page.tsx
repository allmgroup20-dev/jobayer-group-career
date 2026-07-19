"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";

const plans = [
  { id: "monthly", labelBn: "মাসিক", labelEn: "Monthly", price: 199, credits: "আনলিমিটেড", billingBn: "মাসে ১৯৯ টাকা", billingEn: "199 BDT/month" },
  { id: "yearly", labelBn: "বার্ষিক", labelEn: "Yearly", price: 1999, credits: "আনলিমিটেড", billingBn: "বছরে ১৯৯৯ টাকা", billingEn: "1999 BDT/year" },
  { id: "lifetime", labelBn: "আজীবন", labelEn: "Lifetime", price: 4999, credits: "আনলিমিটেড", billingBn: "এককালীন ৪৯৯৯ টাকা", billingEn: "One-time 4999 BDT" },
];

const perks = [
  { bn: "সব রিসোর্স আনলিমিটেড এক্সেস", en: "Unlimited access to all resources" },
  { bn: "কোনো আনলক লিমিট নেই", en: "No unlock limits" },
  { bn: "প্রিমিয়াম সার্টিফিকেট", en: "Premium certificates" },
  { bn: "প্রাথমিক উত্তোলন সুবিধা", en: "Priority withdrawal" },
  { bn: "নতুন কোর্স প্রথমে পাওয়ার সুযোগ", en: "Early access to new courses" },
  { bn: "ডাইরেক্ট সাপোর্ট", en: "Direct support" },
];

export default function MembershipPage() {
  const { lang } = useLanguageStore();
  const [selected, setSelected] = useState("yearly");
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const wid = typeof window !== "undefined" ? localStorage.getItem("worker_id") : null;
    setWorkerId(wid);
    if (wid) {
      fetch(`/api/workers/profile?workerId=${wid}`).then(r => r.json() as Promise<{ membershipStatus?: string }>).then(d => {
        if (d.membershipStatus === "premium") setIsPremium(true);
      }).catch(() => {});
    }
  }, []);

  const plan = plans.find(p => p.id === selected) || plans[1];
  const checkoutUrl = workerId ? `/api/resource-checkout?workerId=${workerId}&amount=${plan.price}&type=premium` : "/login";

  if (isPremium) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-2xl font-black text-text mb-2">{lang === "bn" ? "আপনি ইতিমধ্যে প্রিমিয়াম!" : "You are already Premium!"}</h1>
          <p className="text-text-secondary mb-6">{lang === "bn" ? "প্রিমিয়াম সদস্য হিসাবে সব রিসোর্স আনলিমিটেড এক্সেস করুন।" : "Enjoy unlimited access to all resources as a Premium member."}</p>
          <Link href="/dashboard" className="btn-primary inline-flex">{lang === "bn" ? "ড্যাশবোর্ডে যান" : "Go to Dashboard"}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-bold mb-4 border border-white/10">👑 {lang === "bn" ? "প্রিমিয়াম মেম্বারশিপ" : "Premium Membership"}</div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{lang === "bn" ? "আপনার ক্যারিয়ারের সেরা বিনিয়োগ" : "The Best Investment for Your Career"}</h1>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">{lang === "bn" ? "সব রিসোর্স আনলিমিটেড এক্সেস করুন, কোনো লিমিট ছাড়া" : "Get unlimited access to all resources, no limits"}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl border border-border shadow-xl p-6 md:p-8">
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
            {plans.map(p => (
              <button key={p.id} onClick={() => setSelected(p.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${selected === p.id ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text"}`}>
                {lang === "bn" ? p.labelBn : p.labelEn}
              </button>
            ))}
          </div>

          <div className="text-center mb-6">
            <span className="text-5xl font-black text-primary">৳{plan.price}</span>
            <p className="text-text-secondary text-sm mt-1">{lang === "bn" ? plan.billingBn : plan.billingEn}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {perks.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-success">✅</span>
                <span>{lang === "bn" ? p.bn : p.en}</span>
              </div>
            ))}
          </div>

          {workerId ? (
            <a href={checkoutUrl}
              className="block w-full py-3.5 bg-primary text-white text-center font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm">
              {lang === "bn" ? `এখনই ${plan.labelBn} প্রিমিয়াম হোন` : `Get ${plan.labelEn} Premium Now`}
            </a>
          ) : (
            <Link href="/login" className="block w-full py-3.5 bg-primary text-white text-center font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm">
              {lang === "bn" ? "লগইন করে প্রিমিয়াম হোন" : "Login to Get Premium"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

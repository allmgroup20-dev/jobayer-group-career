"use client";

import { useEffect, useState } from "react";
import { useLanguageStore } from "@/lib/store";

interface Kpi {
  targetRevenue: number;
  users: { total: number; referrers: number; referralRate: number };
  sales: { count: number; revenue: number; avgOrder: number };
  commissions: { paid: number; pending: number };
  viral: { k: number; referrals: number };
  funnel: { checkoutStarted: number; completed: number; conversionRate: number };
  pct: number;
}

const fmt = (n: number) => "৳" + Math.round(n).toLocaleString("en-IN");

export default function CompanyGoalPage() {
  const { lang } = useLanguageStore();
  const [data, setData] = useState<Kpi | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/company/kpi")
      .then((r) => r.json() as Promise<Kpi>)
      .then(setData)
      .catch(() => setErr(lang === "bn" ? "লোডিং এ সমস্যা" : "Failed to load"));
  }, []);

  const rows: { label: string; value: string; sub?: string }[] = data
    ? [
        { label: lang === "bn" ? "মোট ইউজার" : "Total Users", value: data.users.total.toLocaleString("en") },
        { label: lang === "bn" ? "কমপ্লিট সেল" : "Completed Sales", value: data.sales.count.toLocaleString("en") },
        { label: lang === "bn" ? "আয় (রেভিনিউ)" : "Revenue", value: fmt(data.sales.revenue) },
        { label: lang === "bn" ? "গড় অর্ডার" : "Avg Order", value: fmt(data.sales.avgOrder) },
        { label: lang === "bn" ? "কমিশন পেইড" : "Commission Paid", value: fmt(data.commissions.paid) },
        { label: lang === "bn" ? "পেন্ডিং কমিশন" : "Pending Commission", value: fmt(data.commissions.pending) },
        { label: lang === "bn" ? "রেফারার (K)" : "Referrers (K)", value: data.viral.k.toFixed(2) },
        { label: lang === "bn" ? "মোট রেফারেল" : "Total Referrals", value: data.viral.referrals.toLocaleString("en") },
        { label: lang === "bn" ? "ফানেল রূপান্তর" : "Funnel Conv.", value: (data.funnel.conversionRate * 100).toFixed(1) + "%" },
      ]
    : [];

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "🎯 ৳১০ কোটি গোল-ট্র্যাকার" : "🎯 ৳10 Crore Goal Tracker"}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn"
              ? "৯৯% অর্গানিক + ভাইরাল লুপ + কমিশন — মাসিক পর্যন্ত বাড়ানো যায়।"
              : "100% organic + viral loop + commission — months extendable to hit target."}
          </p>
        </div>

        {err && <p className="text-red-500 mb-4">{err}</p>}
        {!data && !err && <p className="text-text-secondary">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p>}

        {data && (
          <>
            <div className="bg-white rounded-2xl border border-border shadow p-6 mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-text-secondary">{lang === "bn" ? "টার্গেট অগ্রগতি" : "Target Progress"}</span>
                <span className="text-lg font-black text-primary">{data.pct.toFixed(3)}%</span>
              </div>
              <div className="w-full h-4 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-action rounded-full transition-all"
                  style={{ width: `${Math.min(100, data.pct)}%` }} />
              </div>
              <p className="text-xs text-text-secondary mt-2">
                {fmt(data.sales.revenue)} / {fmt(data.targetRevenue)}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {rows.map((r) => (
                <div key={r.label} className="bg-white rounded-2xl border border-border shadow p-4">
                  <p className="text-xs text-text-secondary">{r.label}</p>
                  <p className="text-xl font-black text-primary mt-1">{r.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
              <b>{lang === "bn" ? "⏳ রিয়েলিটি-চেক:" : "⏳ Reality Check:"}</b>{" "}
              {lang === "bn"
                ? `৳১০ কোটি পেতে প্রায় ${Math.max(1, Math.ceil((data.targetRevenue - data.sales.revenue) / 99))}টি সেল লাগবে (৳৯৯ রিসোর্স)। প্রতি কাস্টমার থেকে ৳৪৯ রাখলে কোম্পানি পায় — বাকি সেল+কমিশন লুপ।`
                : `≈${Math.max(1, Math.ceil((data.targetRevenue - data.sales.revenue) / 99))} sales remaining at ৳99. Company keeps ৳49 per sale after commission.`}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["api/company/kpi", "api/company/finance", "api/company/commissions", "api/live/sales"].map((p) => (
                <code key={p} className="px-2 py-1 rounded-lg bg-gray-100 text-xs text-text-secondary">{p}</code>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
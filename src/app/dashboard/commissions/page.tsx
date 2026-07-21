"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate, getStatusColor, getStatusBadge } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSWRFetch } from "@/lib/use-swr-fetch";

interface Commission {
  commission_id: string; from_name: string; level_number: number;
  percentage: number; total_amount: number; currency: string;
  status: string; created_at: string;
}

export default function CommissionsPage() {
  const { lang } = useLanguageStore();
  const workerId = typeof window !== "undefined" ? localStorage.getItem("worker_id") : null;
  const { data, loading } = useSWRFetch<{ commissions?: Commission[] }>(
    workerId ? `/api/affiliate/commissions?workerId=${workerId}` : null,
    { ttlMs: 300_000 }
  );
  const commissions = data?.commissions ?? [];
  const [showAll, setShowAll] = useState(false);

  const { data: profile } = useSWRFetch<{ resourceIncome?: number; resourceIncomeOriginal?: number }>(
    workerId ? `/api/workers/profile?workerId=${workerId}` : null,
    { ttlMs: 300_000 }
  );

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-2">
          {lang === "bn" ? "আয়ের ইতিহাস" : "Earnings History"}
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          {lang === "bn" ? "আপনার সব উপার্জনের বিস্তারিত" : "Details of all your earnings"}
        </p>

        {profile?.resourceIncome && profile.resourceIncome > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-800">
                  {lang === "bn" ? "রিসোর্স আয়" : "Resource Income"}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {lang === "bn"
                    ? "রিসোর্স আয় — প্রতি ৳৯৯ তে একটি প্রিমিয়াম রিসোর্স আনলক করুন। উত্তোলন করা যাবে না।"
                    : "Resource income — unlock premium resources at ৳99 each. Cannot be withdrawn."}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-800">৳{profile.resourceIncome.toLocaleString()}</p>
                {profile.resourceIncomeOriginal && profile.resourceIncomeOriginal > 0 && (
                  <p className="text-[10px] text-blue-500">
                    {lang === "bn" ? "মোট আয়" : "Total"}: ৳{profile.resourceIncomeOriginal.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        ) : commissions.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-text-secondary">{lang === "bn" ? "কোনো উপার্জন নেই" : "No earnings yet"}</p>
          </Card>
        ) : (
          <Card className="overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "থেকে" : "From"}</th>
                    <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "লেভেল" : "Level"}</th>
                    <th className="text-left p-4 text-sm font-semibold text-primary">%</th>
                    <th className="text-right p-4 text-sm font-semibold text-primary">{lang === "bn" ? "পরিমাণ" : "Amount"}</th>
                    <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                    <th className="text-right p-4 text-sm font-semibold text-primary">{lang === "bn" ? "তারিখ" : "Date"}</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.slice(0, showAll ? commissions.length : 30).map((c) => (
                    <tr key={c.commission_id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm font-medium text-primary">{c.from_name || "Unknown"}</td>
                      <td className="p-4 text-sm text-text-secondary">Level {c.level_number}</td>
                      <td className="p-4 text-sm text-text-secondary">{c.percentage || 0}%</td>
                      <td className="p-4 text-sm font-semibold text-right">{formatCurrency(c.total_amount, c.currency)}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                          {getStatusBadge(c.status, lang)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-text-secondary text-right">{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {commissions.length > 30 && !showAll && (
              <div className="p-4 text-center">
                <button onClick={() => setShowAll(true)} className="text-sm text-action hover:underline">
                  {lang === "bn" ? "আরও দেখুন" : "Show More"}
                </button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

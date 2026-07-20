"use client";

import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { useSWRFetch } from "@/lib/use-swr-fetch";
import { Skeleton } from "@/components/ui/Skeleton";

interface FinanceData {
  revenue: { total: number; completed: number; pending: number };
  orders: { total: number; completed: number; pending: number };
  commissions: { total: number; pending: number };
  workers: { active: number };
}

export default function OverviewTab() {
  const { lang } = useLanguageStore();
  const { data, loading } = useSWRFetch<FinanceData>("/api/company/finance", { ttlMs: 300_000 });

  if (loading) return (
    <div className="flex justify-center py-12"><Skeleton className="h-4 w-32" /></div>
  );

  if (!data) return (
    <div className="text-center text-text-secondary text-sm py-12">{lang === "bn" ? "ডেটা পাওয়া যায়নি" : "No data available"}</div>
  );

  const format = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Revenue */}
      <Card>
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">{lang === "bn" ? "রেভিনিউ" : "Revenue"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
            <p className="text-xs text-green-700 font-medium uppercase tracking-wider">{lang === "bn" ? "মোট রেভিনিউ" : "Total Revenue"}</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{format(data.revenue.total)} TK</p>
            <p className="text-xs text-green-600 mt-1">{data.revenue.completed} {lang === "bn" ? "টি সম্পন্ন অর্ডার" : "completed orders"}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100">
            <p className="text-xs text-yellow-700 font-medium uppercase tracking-wider">{lang === "bn" ? "পেন্ডিং" : "Pending"}</p>
            <p className="text-3xl font-bold text-yellow-700 mt-1">{format(data.revenue.pending)} TK</p>
            <p className="text-xs text-yellow-600 mt-1">{data.orders.pending} {lang === "bn" ? "টি পেন্ডিং অর্ডার" : "pending orders"}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">{lang === "bn" ? "সক্রিয় সদস্য" : "Active Members"}</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{format(data.workers.active)}</p>
            <p className="text-xs text-blue-600 mt-1">{lang === "bn" ? "মোট ওয়ার্কার" : "total workers"}</p>
          </div>
        </div>
      </Card>

      {/* Commissions */}
      <Card>
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">{lang === "bn" ? "আয়" : "Commissions"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
            <p className="text-xs text-purple-700 font-medium uppercase tracking-wider">{lang === "bn" ? "মোট প্রাপ্ত আয়" : "Total Paid Commission"}</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{format(data.commissions.total)} TK</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
            <p className="text-xs text-orange-700 font-medium uppercase tracking-wider">{lang === "bn" ? "পেন্ডিং আয়" : "Pending Commission"}</p>
            <p className="text-2xl font-bold text-orange-700 mt-1">{format(data.commissions.pending)} TK</p>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card>
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">{lang === "bn" ? "সারসংক্ষেপ" : "Summary"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { label: lang === "bn" ? "মোট অর্ডার" : "Total Orders", value: format(data.orders.total), color: "text-primary" },
            { label: lang === "bn" ? "সম্পন্ন" : "Completed", value: format(data.orders.completed), color: "text-green-600" },
            { label: lang === "bn" ? "পেন্ডিং অর্ডার" : "Pending Orders", value: format(data.orders.pending), color: "text-yellow-600" },
            { label: lang === "bn" ? "রেভিনিউ/সদস্য" : "Revenue/Member", value: `${format(data.workers.active > 0 ? Math.round(data.revenue.total / data.workers.active) : 0)} TK`, color: "text-blue-600" },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl bg-gray-50">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-text-secondary mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

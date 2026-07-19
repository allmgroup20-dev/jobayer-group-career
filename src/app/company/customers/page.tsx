"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useSWRFetch } from "@/lib/use-swr-fetch";
import { Skeleton } from "@/components/ui/Skeleton";

interface Customer {
  worker_id: string;
  name: string;
  phone: string;
  email: string | null;
  membership_status: string;
  preferred_language: string | null;
  age_group: string | null;
  occupation: string | null;
  education_level: string | null;
  segment: string | null;
  lead_score: number | null;
  lifetime_value: number | null;
  total_spent: number | null;
  total_earned: number | null;
  join_date: string | null;
  created_at: string | null;
}

export default function CompanyCustomersPage() {
  const { lang } = useLanguageStore();
  const { data, loading } = useSWRFetch<{ customers?: Customer[] }>(
    "/api/track/analytics?allCustomers=1",
    { ttlMs: 300_000 }
  );
  const customers = data?.customers ?? [];
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.worker_id?.toLowerCase().includes(search.toLowerCase())
  );

  const segmentBadge = (seg: string | null) => {
    const colors: Record<string, string> = { vip: "bg-purple-100 text-purple-700", active: "bg-green-100 text-green-700", new: "bg-blue-100 text-blue-700", at_risk: "bg-orange-100 text-orange-700", churned: "bg-red-100 text-red-700" };
    return seg && colors[seg] ? colors[seg] : "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {lang === "bn" ? "গ্রাহক তালিকা" : "Customer List"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {customers.length} {lang === "bn" ? "জন গ্রাহক" : "customer(s)"}
            </p>
          </div>
          <input
            type="text" placeholder={lang === "bn" ? "নাম/ফোন/আইডি অনুসন্ধান..." : "Search name/phone/ID..."}
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {loading ? (
          <Skeleton className="h-4 w-32 mx-auto" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            {lang === "bn" ? "কোন গ্রাহক পাওয়া যায়নি" : "No customers found"}
          </div>
        ) : (
          <Card className="overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="text-left p-3 text-sm font-semibold text-primary">{lang === "bn" ? "নাম" : "Name"}</th>
                    <th className="text-left p-3 text-sm font-semibold text-primary">{lang === "bn" ? "ফোন" : "Phone"}</th>
                    <th className="text-left p-3 text-sm font-semibold text-primary hidden md:table-cell">{lang === "bn" ? "সেগমেন্ট" : "Segment"}</th>
                    <th className="text-left p-3 text-sm font-semibold text-primary hidden lg:table-cell">{lang === "bn" ? "লিড স্কোর" : "Lead Score"}</th>
                    <th className="text-left p-3 text-sm font-semibold text-primary hidden lg:table-cell">{lang === "bn" ? "ব্যয়" : "Spent"}</th>
                    <th className="text-left p-3 text-sm font-semibold text-primary hidden md:table-cell">{lang === "bn" ? "জয়েন" : "Joined"}</th>
                    <th className="text-left p-3 text-sm font-semibold text-primary">{lang === "bn" ? "ভিউ" : "View"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, showAll ? filtered.length : 50).map((c) => (
                    <tr key={c.worker_id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                      <td className="p-3">
                        <div className="font-medium text-sm text-primary">{c.name}</div>
                        <div className="text-xs text-text-secondary">{c.worker_id}</div>
                      </td>
                      <td className="p-3 text-sm text-text-secondary">{c.phone}</td>
                      <td className="p-3 hidden md:table-cell">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${segmentBadge(c.segment)}`}>
                          {c.segment || (lang === "bn" ? "নতুন" : "new")}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-text-secondary hidden lg:table-cell">{c.lead_score ?? "—"}</td>
                      <td className="p-3 text-sm text-text-secondary hidden lg:table-cell">{c.total_spent ?? 0}</td>
                      <td className="p-3 text-sm text-text-secondary hidden md:table-cell">
                        {c.join_date ? new Date(c.join_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/company/customers/${c.worker_id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          {lang === "bn" ? "দেখুন" : "View"} →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!showAll && filtered.length > 50 && (
                <button onClick={() => setShowAll(true)} className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {lang === "bn" ? `আরও ${filtered.length - 50}টি দেখুন` : `Show ${filtered.length - 50} more`}
                </button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

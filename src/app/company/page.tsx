"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useLanguageStore } from "@/lib/store";
import { StatCard } from "@/components/ui/Card";
import { fetchWithCache } from "@/lib/use-swr-fetch";

const quickLinks = [
  { href: "/company/members", en: "Members", bn: "সদস্য", icon: "👥" },
  { href: "/company/products", en: "Products", bn: "পণ্য", icon: "📦" },
  { href: "/company/orders", en: "Orders", bn: "অর্ডার", icon: "📋" },
  { href: "/company/courses", en: "Resources", bn: "রিসোর্স", icon: "🎓" },
  { href: "/company/finance", en: "Finance", bn: "অর্থ", icon: "💰" },
  { href: "/company/settings", en: "Settings", bn: "সেটিংস", icon: "⚙️" },
];

export default function CompanyDashboard() {
  const { lang } = useLanguageStore();
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    Promise.all([
      fetchWithCache<Record<string, unknown> | null>("/api/track/analytics", 300000).catch(() => null),
      fetchWithCache<{ total?: number }>("/api/company/members?limit=1", 300000).catch(() => null),
    ]).then(([analytics, members]) => {
      if (analytics) {
        setTotalWorkers((analytics.totalWorkers as number) || 0);
        if (analytics.eventStats) {
          const stats = analytics.eventStats as { event_type: string; count: number }[];
          const orders = stats.find((s) => s.event_type === "order" || s.event_type === "purchase");
          if (orders) setTotalOrders(orders.count || 0);
        }
      }
      if (members?.total) setTotalWorkers(members.total);
      setLoaded(true);
    });
  }, []);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 animate-fade-up">
          <h1 className="text-xl font-bold text-primary">
            {lang === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            {lang === "bn" ? "দ্রুত ওভারভিউ" : "Quick overview"}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label={lang === "bn" ? "মোট সদস্য" : "Total Members"} value={totalWorkers.toLocaleString()} color="text-primary" />
          <StatCard label={lang === "bn" ? "মোট অর্ডার" : "Total Orders"} value={totalOrders.toLocaleString()} color="text-action" />
          <StatCard label={lang === "bn" ? "আয়" : "Revenue"} value={totalRevenue.toLocaleString()} color="text-secondary-dark" />
          <StatCard label={lang === "bn" ? "পেন্ডিং" : "Pending"} value={String(pendingCount)} color="text-accent" />
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            {lang === "bn" ? "দ্রুত প্রবেশ" : "Quick Access"}
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="card hover:shadow-lg hover:-translate-y-0.5 text-center group !p-3">
                <div className="text-xl mb-1 group-hover:scale-110 transition-transform">{link.icon}</div>
                <h4 className="font-semibold text-xs text-primary">{lang === "bn" ? link.bn : link.en}</h4>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

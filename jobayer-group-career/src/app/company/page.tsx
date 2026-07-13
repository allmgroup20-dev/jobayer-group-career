"use client";

import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { Card, StatCard } from "@/components/ui/Card";

const adminLinks = [
  { href: "/company/members", en: "All Members", bn: "সকল সদস্য", icon: "👥", color: "bg-blue-50 text-blue-600" },
  { href: "/company/products", en: "Manage Products", bn: "পণ্য ব্যবস্থাপনা", icon: "📦", color: "bg-green-50 text-green-600" },
  { href: "/company/levels", en: "Commission Levels", bn: "কমিশন লেভেল", icon: "📊", color: "bg-purple-50 text-purple-600" },
  { href: "/company/currencies", en: "Currencies", bn: "কারেন্সি", icon: "💰", color: "bg-yellow-50 text-yellow-600" },
  { href: "/company/settings", en: "Settings", bn: "সেটিংস", icon: "⚙️", color: "bg-gray-50 text-gray-600" },
  { href: "/company/translations", en: "Translations", bn: "অনুবাদ", icon: "🌐", color: "bg-indigo-50 text-indigo-600" },
  { href: "/company/test-mode", en: "Test Mode", bn: "টেস্ট মোড", icon: "🧪", color: "bg-orange-50 text-orange-600" },
  { href: "/company/updates", en: "Updates", bn: "আপডেট", icon: "🔄", color: "bg-teal-50 text-teal-600" },
];

export default function CompanyDashboard() {
  const { lang } = useLanguageStore();

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "কোম্পানি ড্যাশবোর্ড" : "Company Dashboard"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Jobayer Group Career — {lang === "bn" ? "স্বাগতম কোম্পানি প্যানেলে" : "Welcome to company panel"}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label={lang === "bn" ? "মোট সদস্য" : "Total Members"} value="12,847" color="text-primary" />
          <StatCard label={lang === "bn" ? "সক্রিয়" : "Active"} value="8,234" color="text-action" />
          <StatCard label={lang === "bn" ? "মোট অর্ডার" : "Total Orders"} value="45,291" color="text-secondary-dark" />
          <StatCard label={lang === "bn" ? "মোট রাজস্ব" : "Total Revenue"} value="৳2.4Cr" color="text-accent" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="card hover:shadow-xl hover:-translate-y-1 text-center group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform ${link.color}`}>
                {link.icon}
              </div>
              <h3 className="font-semibold text-sm text-primary">{lang === "bn" ? link.bn : link.en}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

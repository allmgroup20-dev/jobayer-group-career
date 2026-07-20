"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

interface UserInfo {
  name: string;
  username: string;
  role: string;
}

interface SidebarLink {
  href: string;
  en: string;
  bn: string;
  icon: string;
}

const sidebarLinks: SidebarLink[] = [
  // People
  { href: "/company/members", en: "Members", bn: "সদস্য", icon: "👥" },
  { href: "/company/customers", en: "Customers", bn: "গ্রাহক", icon: "👤" },
  { href: "/company/users", en: "Users", bn: "ব্যবহারকারী", icon: "🔐" },
  { href: "/company/notifications", en: "Notifications", bn: "বিজ্ঞপ্তি", icon: "🔔" },
  // Products & Sales
  { href: "/company/products", en: "Products", bn: "পণ্য", icon: "📦" },
  { href: "/company/courses", en: "Resources", bn: "রিসোর্স", icon: "🎓" },
  { href: "/company/courses/categories", en: "Res Categories", bn: "রিসোর্স ক্যাটাগরি", icon: "📂" },
  { href: "/company/course-stats", en: "Course Stats", bn: "রিসোর্স পরিসংখ্যান", icon: "📊" },
  { href: "/company/orders", en: "Orders", bn: "অর্ডার", icon: "📋" },
  { href: "/company/reviews", en: "Reviews", bn: "রিভিউ", icon: "⭐" },
  { href: "/company/levels", en: "Levels", bn: "লেভেল", icon: "📊" },
  { href: "/company/finance", en: "Finance", bn: "অর্থ", icon: "💰" },
  { href: "/company/withdrawals", en: "Withdrawals", bn: "উত্তোলন", icon: "💸" },
  { href: "/company/currencies", en: "Currencies", bn: "মুদ্রা", icon: "💵" },
  { href: "/company/payment-gateway", en: "Payment", bn: "পেমেন্ট", icon: "💳" },
  { href: "/company/unlocks", en: "Unlocks", bn: "আনলক", icon: "🔓" },
  { href: "/company/complaints", en: "Complaints", bn: "কমপ্লেইন", icon: "⚠️" },
  { href: "/company/trainers", en: "Trainers", bn: "প্রশিক্ষক", icon: "👨‍🏫" },
  { href: "/company/institutions", en: "Institutions", bn: "প্রতিষ্ঠান", icon: "🏛️" },
  // Overview / Analytics
  { href: "/company/analytics", en: "Analytics", bn: "অ্যানালিটিক্স", icon: "📊" },
  { href: "/company/psychology-reports", en: "Psych Reports", bn: "সাইকোলজি রিপোর্ট", icon: "📊" },
  { href: "/company/events", en: "Events", bn: "ইভেন্ট", icon: "📋" },
  { href: "/company/sessions", en: "Sessions", bn: "সেশন", icon: "🕒" },
  { href: "/company/funnel", en: "Funnel", bn: "ফানেল", icon: "🔄" },
  { href: "/company/funnel-psychology", en: "Funnel Psych", bn: "ফানেল সাইকোলজি", icon: "🔮" },
  { href: "/company/segments", en: "Segments", bn: "সেগমেন্ট", icon: "🎯" },
  // AI & Automation
  { href: "/company/ai", en: "AI Hub", bn: "এআই হাব", icon: "🤖" },
  { href: "/company/automation", en: "Automation", bn: "অটোমেশন", icon: "⚡" },
  { href: "/company/sentiment", en: "Sentiment", bn: "সেন্টিমেন্ট", icon: "📈" },
  { href: "/company/skills", en: "Skills", bn: "দক্ষতা", icon: "🧠" },
  { href: "/company/ai-distribution", en: "AI Distribution", bn: "এআই বিতরণ", icon: "📚" },
  { href: "/company/ai-conversations", en: "Conversations", bn: "কথোপকথন", icon: "💬" },
  { href: "/company/psychology-insights", en: "Psych Insights", bn: "সাইকোলজি ইনসাইটস", icon: "🧠" },
  { href: "/company/psychology-profiles", en: "Psych Profiles", bn: "সাইকোলজি প্রোফাইল", icon: "🔍" },
  { href: "/company/psychologist-dashboard", en: "Psychologist", bn: "সাইকোলজিস্ট", icon: "🩺" },
  { href: "/company/employee-persuasion", en: "Persuasion", bn: "পারসুয়েশন", icon: "📋" },
  { href: "/company/daily-habits", en: "Daily Habits", bn: "দৈনিক অভ্যাস", icon: "🌅" },
  { href: "/company/ai-training", en: "AI Training", bn: "এআই প্রশিক্ষণ", icon: "📚" },
  { href: "/company/courses/ai-pricing", en: "AI Pricing", bn: "এআই প্রাইসিং", icon: "💰" },
  // Communication
  { href: "/dashboard/platforms", en: "Platforms", bn: "প্ল্যাটফর্ম", icon: "🔄" },
  { href: "/company/translations", en: "Translations", bn: "অনুবাদ", icon: "🌐" },
  // System
  { href: "/company/settings", en: "Settings", bn: "সেটিংস", icon: "⚙️" },
  { href: "/company/maintenance", en: "Maintenance", bn: "রক্ষণাবেক্ষণ", icon: "🔧" },
  { href: "/company/fingerprint", en: "Fingerprint", bn: "ফিঙ্গারপ্রিন্ট", icon: "🔐" },
  { href: "/company/privacy", en: "Privacy", bn: "প্রাইভেসি", icon: "🔒" },
  { href: "/company/test-mode", en: "Test Mode", bn: "টেস্ট মোড", icon: "🧪" },
  { href: "/company/updates", en: "Updates", bn: "আপডেট", icon: "🔄" },
  { href: "/system", en: "System Monitor", bn: "সিস্টেম মনিটর", icon: "📡" },
];

function parseCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  return document.cookie.split("; ").find(r => r.startsWith(name + "="))?.split("=").slice(1).join("=") ?? null;
}

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguageStore();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const raw = parseCookie("company_user");
    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        if (parsed.name && parsed.username) {
          setUser(parsed);
          return;
        }
      } catch {}
    }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: any) => {
        if (data.username) setUser(data);
        else router.push("/company/login");
      })
      .catch(() => router.push("/company/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/company-logout", { method: "POST" });
    router.push("/company/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (pathname === "/company/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed top-3 left-3 z-30 p-2.5 bg-white rounded-xl shadow-lg border border-border text-text-secondary hover:text-primary hover:bg-primary/5 transition-all">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border/80 transform transition-transform duration-200 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border/80 shrink-0 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md shadow-primary/20">JGC</div>
          <div>
            <span className="font-bold text-sm text-primary">{user.name}</span>
            <span className="block text-[10px] text-text-secondary capitalize">{user.role}</span>
          </div>
        </div>

        <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">
          <Link
            href="/company"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all mb-2 ${
              pathname === "/company" ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-primary/5 hover:text-primary"
            }`}
          >
            <span className="text-sm">📊</span>
            <span>{lang === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}</span>
          </Link>
          <div className="h-px bg-border/60 mb-1.5" />
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (pathname !== "/company" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-accent/10 text-accent-dark"
                    : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <span className="text-sm">{link.icon}</span>
                <span className={`truncate ${isActive ? "font-semibold" : ""}`}>{lang === "bn" ? link.bn : link.en}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/5 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {lang === "bn" ? "লগআউট" : "Logout"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

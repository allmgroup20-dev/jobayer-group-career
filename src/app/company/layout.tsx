"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";

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
  desc: string;
}

interface SidebarGroup {
  en: string;
  bn: string;
  icon: string;
  links: SidebarLink[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    en: "Overview",
    bn: "ওভারভিউ",
    icon: "📊",
    links: [
      { href: "/company", en: "Dashboard", bn: "ড্যাশবোর্ড", icon: "📊", desc: "কম্পানি ড্যাশবোর্ড — সার্বিক পরিসংখ্যান ও প্রেডিকশন" },
      { href: "/company/analytics", en: "Analytics", bn: "অ্যানালিটিক্স", icon: "📊", desc: "বিস্তারিত বিশ্লেষণ — ইউজার, সেশন, ইভেন্ট ও সেগমেন্ট" },
      { href: "/company/funnel", en: "Funnel", bn: "ফানেল", icon: "🔄", desc: "গ্রাহক ফানেল — ভিজিট→সাইনআপ→অর্ডার→পুনরায় ক্রয়" },
      { href: "/company/events", en: "Events", bn: "ইভেন্ট", icon: "📋", desc: "সকল ইভেন্ট লগ — পেজ ভিজিট, ক্লিক, সার্চ ইত্যাদি" },
      { href: "/company/sessions", en: "Sessions", bn: "সেশন", icon: "🕒", desc: "সেশন টাইমলাইন — লগইন থেকে লগআউট পর্যন্ত কার্যকলাপ" },
    ],
  },
  {
    en: "People",
    bn: "সদস্য",
    icon: "👥",
    links: [
      { href: "/company/members", en: "Members", bn: "সদস্য", icon: "👥", desc: "সকল মেম্বার — MLM ট্রি, রেফারেল ও বিস্তারিত তথ্য" },
      { href: "/company/customers", en: "Customers", bn: "গ্রাহক", icon: "👤", desc: "গ্রাহক তালিকা — প্রোফাইল, অর্ডার ও ৩৬০° ভিউ" },
      { href: "/company/users", en: "Users", bn: "ব্যবহারকারী", icon: "🔐", desc: "কম্পানি ইউজার — অ্যাডমিন অ্যাকাউন্ট ও অনুমতি" },
      { href: "/company/notifications", en: "Notifications", bn: "বিজ্ঞপ্তি", icon: "🔔", desc: "সকল বিজ্ঞপ্তি — ইউজারদের পাঠানো নোটিফিকেশন দেখুন" },
    ],
  },
  {
    en: "Products & Sales",
    bn: "পণ্য ও বিক্রয়",
    icon: "📦",
    links: [
      { href: "/company/products", en: "Products", bn: "পণ্য", icon: "📦", desc: "পণ্য ব্যবস্থাপনা — কোর্স/প্রোডাক্ট যোগ, সম্পাদনা, সক্রিয়/নিষ্ক্রিয়" },
      { href: "/company/courses", en: "Resources", bn: "রিসোর্সসমূহ", icon: "🎓", desc: "রিসোর্স ব্যবস্থাপনা — রিসোর্স যোগ, সম্পাদনা, ডিলিট, ভিজিবিলিটি কন্ট্রোল" },
      { href: "/company/courses/categories", en: "Resource Categories", bn: "রিসোর্স ক্যাটাগরি", icon: "📂", desc: "রিসোর্স ক্যাটাগরি — নতুন/সাব-ক্যাটাগরি ও প্যারেন্ট পরিবর্তন" },
      { href: "/company/orders", en: "Orders", bn: "অর্ডার", icon: "📋", desc: "অর্ডার তালিকা — স্ট্যাটাস আপডেট, পেমেন্ট ভেরিফিকেশন" },
      { href: "/company/reviews", en: "Reviews", bn: "রিভিউ", icon: "⭐", desc: "গ্রাহক রিভিউ — মডারেট ও অনুমোদন" },
      { href: "/company/levels", en: "Commission Levels", bn: "কমিশন লেভেল", icon: "📊", desc: "কমিশন সেটিংস — লেভেলভিত্তিক কমিশন ও বোনাস কনফিগার" },
      { href: "/company/finance", en: "Finance", bn: "অর্থ", icon: "💰", desc: "আর্থিক প্রতিবেদন — আয়, ব্যয় ও কমিশন" },
      { href: "/company/withdrawals", en: "Withdrawals", bn: "উত্তোলন", icon: "💸", desc: "উত্তোলন ব্যবস্থাপনা — রিকোয়েস্ট, অনুমোদন, সেটিংস ও পরিসংখ্যান" },
      { href: "/company/currencies", en: "Currencies", bn: "মুদ্রা", icon: "💵", desc: "মুদ্রা ব্যবস্থাপনা — একাধিক কারেন্সি ও রেট কনফিগার" },
      { href: "/company/payment-gateway", en: "Payment Gateway", bn: "পেমেন্ট", icon: "💳", desc: "পেমেন্ট গেটওয়ে — SSLCommerz, COD ইত্যাদি সেটিংস" },
      { href: "/company/unlocks", en: "Unlock Management", bn: "আনলক ব্যবস্থাপনা", icon: "🔓", desc: "ইউজার আনলক লিমিট ও ম্যানুয়াল আনলক" },
      { href: "/company/complaints", en: "Complaints", bn: "কমপ্লেইন", icon: "⚠️", desc: "ইউজার কমপ্লেইন — দেখুন ও সমাধান করুন" },
    ],
  },
  {
    en: "AI & Automation",
    bn: "এআই ও অটোমেশন",
    icon: "🤖",
    links: [
      { href: "/company/ai", en: "AI Hub", bn: "এআই হাব", icon: "🤖", desc: "এআই কন্ট্রোল সেন্টার — এজেন্ট, ব্রেইন, স্কিলস আরও অনেক কিছু" },
      { href: "/company/automation", en: "Automation", bn: "অটোমেশন", icon: "⚡", desc: "ট্রিগার-ভিত্তিক অটোমেশন — নির্দিষ্ট ইভেন্টে অটো অ্যাকশন" },
      { href: "/company/apps", en: "Apps", bn: "অ্যাপ", icon: "📱", desc: "অটোমেটিক অ্যাপ ইন্সটল — এক ক্লিকেই ইনস্টল করুন" },
      { href: "/company/sentiment", en: "Sentiment", bn: "সেন্টিমেন্ট", icon: "📈", desc: "সেন্টিমেন্ট এনালাইসিস — ইউজার মেসেজের অনুভূতি বিশ্লেষণ" },
      { href: "/company/skills", en: "Skills", bn: "দক্ষতা", icon: "🧠", desc: "এআই স্কিলস — কীওয়ার্ড-ভিত্তিক স্বয়ংক্রিয় উত্তর" },
      { href: "/company/ai-conversations", en: "Conversations", bn: "কথোপকথন", icon: "💬", desc: "এআই কনভার্সেশন — ইউজারদের সাথে এআই-এর কথোপকথনের লগ" },
      { href: "/company/courses/ai-pricing", en: "AI Pricing", bn: "এআই প্রাইসিং", icon: "💰", desc: "এআই-ভিত্তিক রিসোর্স প্রাইসিং — অটোমেটিক প্রাইস ও প্রিমিয়াম সাজেশন" },
    ],
  },
  {
    en: "Communication",
    bn: "যোগাযোগ",
    icon: "💬",
    links: [
      { href: "/company/whatsapp", en: "WhatsApp", bn: "হোয়াটসঅ্যাপ", icon: "💬", desc: "হোয়াটসঅ্যাপ হাব — মেসেজ, ক্যাম্পেইন, টেমপ্লেট ও অ্যাকাউন্ট" },
      { href: "/dashboard/messenger", en: "Messenger", bn: "মেসেঞ্জার", icon: "💬", desc: "ফেসবুক মেসেঞ্জার — পেজ কানেক্ট ও অটো রিপ্লাই" },
      { href: "/dashboard/telegram", en: "Telegram", bn: "টেলিগ্রাম", icon: "✈️", desc: "টেলিগ্রাম বট — বট কানেক্ট ও মেসেজিং" },
      { href: "/dashboard/platforms", en: "Platforms", bn: "প্ল্যাটফর্ম", icon: "🔄", desc: "প্ল্যাটফর্ম প্রেফারেন্স — ইউজারের পছন্দের মাধ্যম নির্ধারণ" },
      { href: "/company/translations", en: "Translations", bn: "অনুবাদ", icon: "🌐", desc: "অনুবাদ ম্যানেজার — সাইটের বাংলা/ইংরেজি টেক্সট কাস্টমাইজ" },
    ],
  },
  {
    en: "System",
    bn: "সিস্টেম",
    icon: "⚙️",
    links: [
      { href: "/company/settings", en: "Settings", bn: "সেটিংস", icon: "⚙️", desc: "সাইট সেটিংস — কোম্পানির নাম, বিবরণ, কনফিগারেশন" },
      { href: "/company/fingerprint", en: "Fingerprint", bn: "ফিঙ্গারপ্রিন্ট", icon: "🔐", desc: "বায়োমেট্রিক — ফিঙ্গারপ্রিন্ট লগইন রেকর্ড ও ব্যবস্থাপনা" },
      { href: "/company/privacy", en: "Privacy", bn: "প্রাইভেসি", icon: "🔒", desc: "গোপনীয়তা — ইউজার কনসেন্ট ও ডেটা সুরক্ষা তথ্য" },
      { href: "/company/test-mode", en: "Test Mode", bn: "টেস্ট মোড", icon: "🧪", desc: "টেস্ট মোড — মক ডেটা দিয়ে ফিচার টেস্টিং" },
      { href: "/company/updates", en: "Updates", bn: "আপডেট", icon: "🔄", desc: "আপডেট লগ — প্ল্যাটফর্মের নতুন ফিচার ও চেঞ্জলগ" },
    ],
  },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguageStore();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["overview", "people", "products", "ai", "communication", "system"]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: any) => {
        if (data.username) setUser(data);
        else router.push("/company/login");
      })
      .catch(() => router.push("/company/login"));
  }, [router]);

  useEffect(() => {
    const path = pathname;
    if (path === "/company" || path.startsWith("/company/analytics") || path.startsWith("/company/funnel") || path.startsWith("/company/events") || path.startsWith("/company/sessions")) {
      setExpandedGroups(["overview"]);
    } else if (path.startsWith("/company/members") || path.startsWith("/company/customers") || path.startsWith("/company/users") || path.startsWith("/company/notifications")) {
      setExpandedGroups(["people"]);
    } else if (path.startsWith("/company/products") || path.startsWith("/company/courses") || path.startsWith("/company/orders") || path.startsWith("/company/reviews") || path.startsWith("/company/levels") || path.startsWith("/company/finance") || path.startsWith("/company/withdrawals") || path.startsWith("/company/currencies") || path.startsWith("/company/payment-gateway")) {
      setExpandedGroups(["products"]);
    } else if (path.startsWith("/company/ai") || path.startsWith("/company/automation") || path.startsWith("/company/sentiment") || path.startsWith("/company/skills") || path.startsWith("/company/ai-conversations")) {
      setExpandedGroups(["ai"]);
    } else if (path.startsWith("/company/whatsapp") || path.startsWith("/dashboard/messenger") || path.startsWith("/dashboard/telegram") || path.startsWith("/dashboard/platforms") || path.startsWith("/company/translations")) {
      setExpandedGroups(["communication"]);
    } else {
      setExpandedGroups(["system"]);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/company-logout", { method: "POST" });
    router.push("/company/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-text-secondary text-sm">Loading...</div>
      </div>
    );
  }

  if (pathname === "/company/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed top-3 left-3 z-30 p-2.5 bg-white rounded-xl shadow-lg border border-border text-text-secondary hover:text-primary hover:bg-primary/5 transition-all">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border shrink-0">
          <div className="w-8 h-8 gradient-premium rounded-lg flex items-center justify-center text-white font-bold text-xs shadow">JGC</div>
          <span className="font-bold text-sm text-primary">{user.name}</span>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarGroups.map((group, gi) => {
            const groupId = ["overview", "people", "products", "ai", "communication", "system"][gi] || "overview";
            const isExpanded = expandedGroups.includes(groupId);
            const hasActive = group.links.some(
              (l) => pathname === l.href || (l.href !== "/company" && pathname.startsWith(l.href))
            );
            return (
              <div key={groupId}>
                <button
                  onClick={() => toggleGroup(groupId)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    hasActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{group.icon}</span>
                    <span>{group.en}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-border pl-3">
                    {group.links.map((link) => {
                      const isActive = pathname === link.href || (link.href !== "/company" && pathname.startsWith(link.href));
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          title={link.desc}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                          }`}
                        >
                          <span className="text-base">{link.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="block truncate">{link.en}</span>
                            <span className="block text-[10px] text-gray-400 truncate group-hover:text-gray-500 transition-colors">{link.desc}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
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

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

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

interface SidebarGroup {
  en: string;
  bn: string;
  icon: string;
  links: SidebarLink[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    en: "AI & Automation",
    bn: "এআই ও অটোমেশন",
    icon: "🤖",
    links: [
      { href: "/company/whatsapp", en: "WhatsApp", bn: "হোয়াটসঅ্যাপ", icon: "💬" },
      { href: "/dashboard/messenger", en: "Messenger", bn: "মেসেঞ্জার", icon: "💬" },
      { href: "/dashboard/telegram", en: "Telegram", bn: "টেলিগ্রাম", icon: "✈️" },
      { href: "/dashboard/platforms", en: "Platform Prefs", bn: "প্ল্যাটফর্ম", icon: "🔄" },
      { href: "/company/ai", en: "AI", bn: "এআই", icon: "🤖" },
    ],
  },
  {
    en: "Business",
    bn: "ব্যবসা",
    icon: "📊",
    links: [
      { href: "/company", en: "Dashboard", bn: "ড্যাশবোর্ড", icon: "📊" },
      { href: "/company/members", en: "Members", bn: "সদস্য", icon: "👥" },
      { href: "/company/products", en: "Products", bn: "পণ্য", icon: "📦" },
      { href: "/company/levels", en: "Commission Levels", bn: "কমিশন লেভেল", icon: "📊" },
      { href: "/company/currencies", en: "Currencies", bn: "কারেন্সি", icon: "💰" },
      { href: "/company/payment-gateway", en: "Payment Gateway", bn: "পেমেন্ট গেটওয়ে", icon: "💳" },
      { href: "/company/settings", en: "Settings", bn: "সেটিংস", icon: "⚙️" },
      { href: "/company/users", en: "Users", bn: "ব্যবহারকারী", icon: "🔐" },
      { href: "/company/translations", en: "Translations", bn: "অনুবাদ", icon: "🌐" },
      { href: "/company/test-mode", en: "Test Mode", bn: "টেস্ট মোড", icon: "🧪" },
      { href: "/company/updates", en: "Updates", bn: "আপডেট", icon: "🔄" },
    ],
  },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["ai", "business"]);

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
    const aiPaths = ["/company/whatsapp", "/company/ai"];
    const isAi = aiPaths.some((p) => pathname === p || (p !== "/company" && pathname.startsWith(p)));
    setExpandedGroups(isAi ? ["ai"] : ["business"]);
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

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <div className="w-8 h-8 gradient-premium rounded-lg flex items-center justify-center text-white font-bold text-xs shadow">JG</div>
          <span className="font-bold text-sm text-primary">Company Panel</span>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto">
          {sidebarGroups.map((group, gi) => {
            const groupId = gi === 0 ? "ai" : "business";
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
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                          }`}
                        >
                          <span className="text-base">{link.icon}</span>
                          <span>{link.en}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-primary/5 text-text-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="text-xs text-text-secondary hover:text-primary transition-colors">
              ← {pathname.startsWith("/company") ? "Back to Site" : "Back"}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-text-secondary hover:text-primary transition-colors hidden sm:inline">
              ← Back to Main Site
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-text hidden sm:inline">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

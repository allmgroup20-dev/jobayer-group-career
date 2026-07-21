"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import CommandPalette from "@/components/CommandPalette";

interface UserInfo { name: string; username: string; role: string; }

const navTabs = [
  { href: "/company", en: "Home", bn: "হোম", icon: "🏠" },
  { href: "/company/courses", en: "Courses", bn: "রিসোর্স", icon: "🎓" },
  { href: "/company/finance", en: "Finance", bn: "অর্থ", icon: "💰" },
  { href: "/company/ai", en: "AI", bn: "এআই", icon: "🤖" },
  { href: "/company/analytics", en: "Analytics", bn: "বিশ্লেষণ", icon: "📊" },
  { href: "/company/psychology", en: "Psychology", bn: "সাইকোলজি", icon: "🧠" },
  { href: "/company/marketing", en: "Marketing", bn: "মার্কেটিং", icon: "📈" },
  { href: "/company/members", en: "People", bn: "সদস্য", icon: "👥" },
  { href: "/company/settings", en: "Settings", bn: "সেটিংস", icon: "⚙️" },
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

  const isTabActive = (href: string) => pathname === href || (href !== "/company" && pathname.startsWith(href));

  useEffect(() => {
    const raw = parseCookie("company_user");
    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        if (parsed.name && parsed.username) { setUser(parsed); return; }
      } catch {}
    }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: any) => {
        if (data.username) setUser(data);
        else router.push("/login");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/company-logout", { method: "POST" });
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <CommandPalette />

      {/* Top Bar */}
      <header className="h-14 shrink-0 bg-white border-b border-border/80 flex items-center justify-between px-4 z-30">
        <Link href="/company" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-[10px] shadow-sm shadow-primary/20">JGC</div>
          <span className="font-bold text-sm text-primary hidden sm:inline">{user.name}</span>
        </Link>

        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", { metaKey: true, key: "k" });
            window.dispatchEvent(event);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 text-xs text-text-secondary hover:border-primary/30 hover:text-primary transition-all bg-gray-50/50"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <span className="hidden sm:inline">{lang === "bn" ? "খুঁজুন..." : "Search..."}</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-medium bg-white rounded border border-border/50 ml-2">
            <span>⌘</span>K
          </kbd>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-[10px] text-text-secondary capitalize bg-gray-100 px-2 py-0.5 rounded-full">{user.role}</span>
          <button onClick={handleLogout} className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/5 transition-all" title={lang === "bn" ? "লগআউট" : "Logout"}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Desktop Secondary Nav */}
      <nav className="hidden lg:flex items-center gap-0.5 px-4 py-1.5 bg-white border-b border-border/40 overflow-x-auto scrollbar-none">
        <button
          onClick={() => { const e = new KeyboardEvent("keydown", { metaKey: true, key: "k" }); window.dispatchEvent(e); }}
          className="flex items-center gap-1.5 px-2.5 py-1 mr-2 rounded-lg text-[10px] font-medium text-text-secondary bg-gray-100 hover:bg-gray-200 transition-all shrink-0"
        >🔍 <kbd className="text-[8px] opacity-60">⌘K</kbd></button>
        {navTabs.map((tab) => (
          <Link key={tab.href} href={tab.href}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all shrink-0 ${
              isTabActive(tab.href) ? "bg-primary/10 text-primary font-semibold" : "text-text-secondary hover:bg-primary/5 hover:text-text"
            }`}>
            <span>{tab.icon}</span>
            <span>{lang === "bn" ? tab.bn : tab.en}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>

      {/* Bottom Tab Bar (mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border/80 flex items-center gap-0.5 h-14 px-1 overflow-x-auto scrollbar-none safe-area-bottom">
        {navTabs.map((tab) => (
          <Link key={tab.href} href={tab.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all min-w-[48px] shrink-0 ${
              isTabActive(tab.href) ? "text-primary" : "text-text-secondary/60 hover:text-text-secondary"
            }`}>
            <span className="text-lg">{tab.icon}</span>
            <span className={`text-[9px] font-medium ${isTabActive(tab.href) ? "font-bold" : ""}`}>
              {lang === "bn" ? tab.bn : tab.en}
            </span>
          </Link>
        ))}
        <button
          onClick={() => { const e = new KeyboardEvent("keydown", { metaKey: true, key: "k" }); window.dispatchEvent(e); }}
          className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all min-w-[48px] shrink-0 text-text-secondary/60 hover:text-text-secondary"
        >
          <span className="text-lg">🔍</span>
          <span className="text-[9px] font-medium">Search</span>
        </button>
      </nav>
    </div>
  );
}

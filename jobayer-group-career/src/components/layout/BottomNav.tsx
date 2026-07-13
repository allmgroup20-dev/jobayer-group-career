"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/lib/store";

const navItems = [
  {
    key: "home",
    en: "Home",
    bn: "হোম",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "products",
    en: "Products",
    bn: "পণ্য",
    href: "/products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    key: "dashboard",
    en: "Dashboard",
    bn: "ড্যাশবোর্ড",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
  {
    key: "app",
    en: "App",
    bn: "অ্যাপ",
    href: "/app-install",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguageStore();

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.key} href={item.href} className={`bottom-nav-item ${isActive ? "active" : ""}`}>
            {item.icon}
            <span>{lang === "bn" ? item.bn : item.en}</span>
          </Link>
        );
      })}
    </div>
  );
}

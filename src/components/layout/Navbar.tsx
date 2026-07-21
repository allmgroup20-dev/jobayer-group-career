"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/lib/store";
import LanguageSwitcher from "./LanguageSwitcher";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const menuItems = [
  { key: "nav_home", en: "Home", bn: "হোম", href: "/" },
  { key: "nav_courses", en: "Resources", bn: "রিসোর্স সমূহ", href: "/courses" },
  { key: "nav_live", en: "Live Updates", bn: "লাইভ", href: "/live-updates" },
  { key: "nav_reviews", en: "Reviews", bn: "মতামত", href: "/reviews" },
];

export default function Navbar() {
  const { lang } = useLanguageStore();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workerLoggedIn, setWorkerLoggedIn] = useState(false);
  const [companyLoggedIn, setCompanyLoggedIn] = useState(false);
  const [workerName, setWorkerName] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setWorkerLoggedIn(!!localStorage.getItem("worker_token"));
    setCompanyLoggedIn(document.cookie.includes("company_user"));
    setWorkerName(localStorage.getItem("worker_name") || "");
    fetch("/api/company/settings").then(r => r.json() as Promise<{ settings?: Record<string, string> }>).then(d => { if (d.settings?.company_name) setCompanyName(d.settings.company_name); }).catch(() => {});
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showSolid = !isHome || scrolled;

  const handleLogout = async () => {
    const isCompanyPage = pathname.startsWith("/company");
    if (isCompanyPage) {
      if (document.cookie.includes("company_user")) {
        await fetch("/api/auth/company-logout", { method: "POST" });
      }
      window.location.href = "/login";
    } else {
      localStorage.removeItem("worker_token");
      localStorage.removeItem("worker_id");
      localStorage.removeItem("worker_name");
      window.location.href = "/";
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showSolid
            ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-border/80"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md ring-2 ring-white/20 group-hover:ring-accent/30 transition-all duration-300">
                <Image
                  src="/favicon.svg"
                  alt={companyName || "JG Career"}
                  width={36}
                  height={36}
                  className="rounded-xl"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <span className={`font-bold text-lg tracking-tight transition-colors duration-300 ${
                  showSolid ? "text-primary" : "text-white"
                }`}>
                  {companyName || (lang === "bn" ? "জোবায়ের গ্রুপ ক্যারিয়ার" : "Jobayer Group Career")}
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    pathname === item.href
                      ? showSolid
                        ? "bg-primary/10 text-primary"
                        : "bg-white/15 text-white"
                      : showSolid
                        ? "text-text-secondary hover:text-primary hover:bg-primary/5"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {lang === "bn" ? item.bn : item.en}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {workerLoggedIn && <NotificationBell />}

              {!workerLoggedIn && !companyLoggedIn ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className={`text-sm !px-5 !py-2.5 rounded-xl font-bold transition-all ${
                      showSolid
                        ? "btn-ghost text-primary"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {lang === "bn" ? "লগইন" : "Login"}
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 text-sm !px-5 !py-2.5 rounded-xl font-bold transition-all bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    {lang === "bn" ? "রেজিস্টার" : "Register"}
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href={companyLoggedIn ? "/company" : "/dashboard"}
                    className={`text-sm !px-5 !py-2.5 rounded-xl font-bold transition-all ${
                      showSolid
                        ? "btn-ghost text-primary"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {companyLoggedIn
                      ? (lang === "bn" ? "কোম্পানি" : "Company")
                      : (lang === "bn" ? "ড্যাশবোর্ড" : "Dashboard")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`text-sm !px-4 !py-2.5 rounded-xl font-bold transition-all ${
                      showSolid
                        ? "text-danger hover:bg-danger/5"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {lang === "bn" ? "প্রস্থান" : "Logout"}
                  </button>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`md:hidden p-2 rounded-xl transition-all ${
                  showSolid ? "hover:bg-primary/5 text-text" : "hover:bg-white/10 text-white"
                }`}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className={`px-4 py-4 space-y-1 ${
            showSolid ? "bg-white border-t border-border" : "bg-primary-dark/95 backdrop-blur-lg"
          }`}>
            {menuItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  pathname === item.href
                    ? showSolid
                      ? "bg-primary/10 text-primary"
                      : "bg-white/15 text-white"
                    : showSolid
                      ? "text-text-secondary hover:text-primary hover:bg-primary/5"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {lang === "bn" ? item.bn : item.en}
              </Link>
            ))}
            <hr className={`my-2 ${showSolid ? "border-border" : "border-white/10"}`} />
            {!workerLoggedIn && !companyLoggedIn ? (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    showSolid ? "text-text-secondary hover:text-primary hover:bg-primary/5" : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}>
                  {lang === "bn" ? "লগইন" : "Login"}
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-bold text-center bg-gradient-to-r from-accent to-accent-light text-white mt-1">
                  {lang === "bn" ? "রেজিস্টার" : "Register"}
                </Link>
              </>
            ) : (
              <>
                <Link href={companyLoggedIn ? "/company" : "/dashboard"} onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    showSolid ? "text-text-secondary hover:text-primary hover:bg-primary/5" : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}>
                  {companyLoggedIn
                    ? (lang === "bn" ? "কোম্পানি" : "Company")
                    : (lang === "bn" ? "ড্যাশবোর্ড" : "Dashboard")}
                </Link>
                <button onClick={handleLogout}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    showSolid ? "text-danger hover:bg-danger/5" : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}>
                  {lang === "bn" ? "প্রস্থান" : "Logout"}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/lib/store";
import LanguageSwitcher from "./LanguageSwitcher";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const menuItems = [
  { key: "nav_home", en: "Home", bn: "হোম", href: "/" },
  { key: "nav_courses", en: "Courses", bn: "কোর্স সমূহ", href: "/courses" },
  { key: "nav_live", en: "Live Updates", bn: "লাইভ", href: "/live-updates" },
  { key: "nav_trainers", en: "Trainers", bn: "প্রশিক্ষক", href: "/trainers" },
  { key: "nav_reviews", en: "Reviews", bn: "মতামত", href: "/reviews" },
];

export default function Navbar() {
  const { lang } = useLanguageStore();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workerLoggedIn, setWorkerLoggedIn] = useState(false);
  const [companyLoggedIn, setCompanyLoggedIn] = useState(false);
  const [workerName, setWorkerName] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    setWorkerLoggedIn(!!localStorage.getItem("worker_token"));
    setCompanyLoggedIn(document.cookie.includes("company_user"));
    setWorkerName(localStorage.getItem("worker_name") || "");
    fetch("/api/company/settings").then(r => r.json() as Promise<{ settings?: Record<string, string> }>).then(d => { if (d.settings?.company_name) setCompanyName(d.settings.company_name); }).catch(() => {});
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showSolid = !isHome || scrolled;

  const handleLogout = async () => {
    const isCompanyPage = pathname.startsWith("/company");
    if (isCompanyPage) {
      if (document.cookie.includes("company_user")) {
        await fetch("/api/auth/company-logout", { method: "POST" });
      }
      window.location.href = "/company/login";
    } else {
      // User page or main site
      localStorage.removeItem("worker_token");
      localStorage.removeItem("worker_id");
      localStorage.removeItem("worker_name");
      window.location.href = "/";
    }
  };

  const btnBase = `text-sm !px-5 !py-2.5 rounded-xl font-bold transition-all`;
  const btnPrimary = showSolid ? "btn-primary" : "border border-white/30 text-white hover:bg-white/10";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showSolid
            ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 gradient-premium rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                JG
              </div>
              <div className="hidden sm:block">
                <span className={`font-bold text-lg ${showSolid ? "text-primary" : "text-white"}`}>Jobayer</span>
                <span className="text-secondary font-bold"> Group</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showSolid
                      ? "text-text-secondary hover:text-primary hover:bg-primary/5"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {lang === "bn" ? item.bn : item.en}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher showSolid={showSolid} />

              {/* Not logged in */}
              {!workerLoggedIn && !companyLoggedIn && (
                <Link href="/login" className={`hidden sm:inline-flex ${btnBase} ${btnPrimary}`}>
                  {lang === "bn" ? "লগইন" : "Login"}
                </Link>
              )}
              {/* Worker only */}
              {workerLoggedIn && !companyLoggedIn && (
                <>
                  <div className="hidden sm:block"><NotificationBell /></div>
                  <Link href="/dashboard" className={`hidden sm:inline-flex ${btnBase} ${btnPrimary}`}>
                    {workerName || (lang === "bn" ? "ইউজার ড্যাশবোর্ড" : "Dashboard")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`hidden sm:inline-flex ${btnBase} border border-red-300 text-red-600 hover:bg-red-50`}
                  >
                    {lang === "bn" ? "লগআউট" : "Logout"}
                  </button>
                </>
              )}
              {/* Company only */}
              {!workerLoggedIn && companyLoggedIn && (
                <>
                  <Link href="/login" className={`hidden sm:inline-flex ${btnBase} ${btnPrimary}`}>
                    {lang === "bn" ? "লগইন" : "Login"}
                  </Link>
                  <Link href="/company" className={`hidden sm:inline-flex ${btnBase} ${btnPrimary}`}>
                    {companyName || (lang === "bn" ? "কোম্পানি ড্যাশবোর্ড" : "Dashboard")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`hidden sm:inline-flex ${btnBase} border border-red-300 text-red-600 hover:bg-red-50`}
                  >
                    {lang === "bn" ? "লগআউট" : "Logout"}
                  </button>
                </>
              )}
              {/* Both logged in */}
              {workerLoggedIn && companyLoggedIn && (
                <>
                  <div className="hidden sm:block"><NotificationBell /></div>
                  <Link href="/dashboard" className={`hidden sm:inline-flex ${btnBase} ${btnPrimary}`}>
                    {workerName || (lang === "bn" ? "ইউজার ড্যাশবোর্ড" : "Dashboard")}
                  </Link>
                  <Link href="/company" className={`hidden sm:inline-flex ${btnBase} border border-accent/40 text-accent hover:bg-accent/5`}>
                    {companyName || (lang === "bn" ? "কোম্পানি ড্যাশবোর্ড" : "Dashboard")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`hidden sm:inline-flex ${btnBase} border border-red-300 text-red-600 hover:bg-red-50`}
                  >
                    {lang === "bn" ? "লগআউট" : "Logout"}
                  </button>
                </>
              )}

              <button
                className={`md:hidden p-2 rounded-lg ${showSolid ? "hover:bg-primary/5 text-primary" : "hover:bg-white/10 text-white"}`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={lang === "bn" ? "মেনু" : "Menu"}
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
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="absolute right-0 top-16 bottom-0 w-72 bg-white shadow-xl p-6 animate-fade-up">
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-medium text-text-secondary hover:text-primary hover:bg-primary/5 transition-all"
                >
                  {lang === "bn" ? item.bn : item.en}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />

              {!workerLoggedIn && !companyLoggedIn && (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-primary text-center text-sm">
                    {lang === "bn" ? "লগইন" : "Login"}
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-secondary text-center text-sm">
                    {lang === "bn" ? "নিবন্ধন" : "Register"}
                  </Link>
                </>
              )}
              {workerLoggedIn && !companyLoggedIn && (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn-primary text-center text-sm">
                    {workerName || (lang === "bn" ? "ইউজার ড্যাশবোর্ড" : "Dashboard")}
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="btn-secondary text-center text-sm border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {lang === "bn" ? "লগআউট" : "Logout"}
                  </button>
                </>
              )}
              {!workerLoggedIn && companyLoggedIn && (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-primary text-center text-sm">
                    {lang === "bn" ? "লগইন" : "Login"}
                  </Link>
                  <Link href="/company" onClick={() => setMobileOpen(false)} className="btn-primary text-center text-sm !bg-accent/10 !text-accent !border-accent/30">
                    {companyName || (lang === "bn" ? "কোম্পানি ড্যাশবোর্ড" : "Dashboard")}
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="btn-secondary text-center text-sm border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {lang === "bn" ? "লগআউট" : "Logout"}
                  </button>
                </>
              )}
              {workerLoggedIn && companyLoggedIn && (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn-primary text-center text-sm">
                    {workerName || (lang === "bn" ? "ইউজার ড্যাশবোর্ড" : "Dashboard")}
                  </Link>
                  <Link href="/company" onClick={() => setMobileOpen(false)} className="btn-primary text-center text-sm !bg-accent/10 !text-accent !border-accent/30">
                    {companyName || (lang === "bn" ? "কোম্পানি ড্যাশবোর্ড" : "Dashboard")}
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="btn-secondary text-center text-sm border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {lang === "bn" ? "লগআউট" : "Logout"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import LanguageSwitcher from "./LanguageSwitcher";

const menuItems = [
  { key: "nav_home", en: "Home", bn: "হোম", href: "/" },
  { key: "nav_products", en: "Products", bn: "পণ্য", href: "/products" },
  { key: "nav_dashboard", en: "Dashboard", bn: "ড্যাশবোর্ড", href: "/dashboard" },
  { key: "nav_app", en: "Get App", bn: "অ্যাপ", href: "/app-install" },
];

export default function Navbar() {
  const { lang } = useLanguageStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-lg shadow-sm border-b border-border"
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
                <span className={`font-bold text-lg ${scrolled ? "text-primary" : "text-white"}`}>Jobayer</span>
                <span className="text-secondary font-bold"> Group</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    scrolled
                      ? "text-text-secondary hover:text-primary hover:bg-primary/5"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {lang === "bn" ? item.bn : item.en}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link href="/login" className="hidden sm:inline-flex btn-primary text-sm !px-5 !py-2.5">
                {lang === "bn" ? "লগইন" : "Login"}
              </Link>
              <button
                className={`md:hidden p-2 rounded-lg ${scrolled ? "hover:bg-primary/5" : "hover:bg-white/10"}`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={lang === "bn" ? "মেনু" : "Menu"}
              >
                <svg className={`w-6 h-6 ${scrolled ? "text-primary" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="px-4 py-3 rounded-xl text-base font-medium text-text-secondary 
                           hover:text-primary hover:bg-primary/5 transition-all"
                >
                  {lang === "bn" ? item.bn : item.en}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-primary text-center text-sm"
              >
                {lang === "bn" ? "লগইন" : "Login"}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="btn-secondary text-center text-sm"
              >
                {lang === "bn" ? "নিবন্ধন" : "Register"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { useLanguageStore } from "@/lib/store";
import { useTracker } from "@/lib/tracking/tracker";
import { SystemErrorBoundary } from "@/components/system/SystemErrorBoundary";

const PerfMonitor = dynamic(() => import("@/components/system/PerfMonitor").then(m => ({ default: m.PerfMonitor })), { ssr: false });
const SmartInstall = dynamic(() => import("@/components/home/SmartInstall"), { ssr: false });
const CookieConsentBanner = dynamic(() => import("@/components/privacy/CookieConsentBanner").then(m => ({ default: m.CookieConsentBanner })), { ssr: false });
const PwaRegister = dynamic(() => import("@/components/PwaRegister"), { ssr: false });

function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let ticking = false;
    const update = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (bar) bar.style.width = `${Math.min(100, (scrollTop / Math.max(docHeight, 1)) * 100)}%`;
          ticking = false;
        });
        ticking = true;
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] h-[3px] bg-transparent pointer-events-none">
      <div ref={barRef} className="h-full bg-gradient-to-r from-accent via-secondary to-accent transition-all duration-100" style={{ width: "0%" }} />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isCompany = pathname.startsWith("/company");
  const { lang } = useLanguageStore();

  useTracker();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.cookie = `lang=${lang};path=/;max-age=31536000`;
  }, [lang]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) localStorage.setItem("referral_code", ref);
  }, []);

  return (
    <>
      {process.env.NODE_ENV === "production" && <PerfMonitor />}
      <ScrollProgressBar />
      <Navbar />
      <main className={isHome ? "" : "min-h-screen pt-16 md:pt-20"}>
        <SystemErrorBoundary>{children}</SystemErrorBoundary>
      </main>
      {!isCompany && <Footer />}
      {!isCompany && <BottomNav />}
      <SmartInstall />
      <CookieConsentBanner />
      <PwaRegister />
    </>
  );
}

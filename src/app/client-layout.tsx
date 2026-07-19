"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import SmartInstall from "@/components/home/SmartInstall";
import { CookieConsentBanner } from "@/components/privacy/CookieConsentBanner";
import { useLanguageStore } from "@/lib/store";
import { useTracker } from "@/lib/tracking/tracker";
import { SystemErrorBoundary } from "@/components/system/SystemErrorBoundary";
import { initGlobalErrorReporter } from "@/lib/system/reporter";
import { PerfMonitor } from "@/components/system/PerfMonitor";

function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${Math.min(100, (scrollTop / Math.max(docHeight, 1)) * 100)}%`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] h-[3px] bg-transparent pointer-events-none">
      <div ref={barRef} className="h-full bg-gradient-to-r from-info via-orange to-info transition-all duration-100" style={{ width: "0%" }} />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { lang } = useLanguageStore();

  // User tracking (page views, sessions, events)
  useTracker();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.cookie = `lang=${lang};path=/;max-age=31536000`;
  }, [lang]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("SW registered:", reg.scope);
          reg.addEventListener("updatefound", () => {
            const newSW = reg.installing;
            if (newSW) {
              newSW.addEventListener("statechange", () => {
                if (newSW.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("New SW version available");
                }
              });
            }
          });
        })
        .catch((err) => console.warn("SW registration failed:", err));
    }
  }, []);

  // Global error reporter — catches uncaught errors + promise rejections
  useEffect(() => {
    initGlobalErrorReporter();
  }, []);

  // Global referral code tracker — saves last ?ref= to localStorage (once)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("referral_code", ref);
    }
  }, []);

  return (
    <>
      <PerfMonitor />
      <ScrollProgressBar />
      <Navbar />
      <main className={isHome ? "" : "min-h-screen pt-16 md:pt-20"}>
        <SystemErrorBoundary>{children}</SystemErrorBoundary>
      </main>
      <Footer />
      <BottomNav />
      {!isHome && <SmartInstall />}
      <CookieConsentBanner />
    </>
  );
}

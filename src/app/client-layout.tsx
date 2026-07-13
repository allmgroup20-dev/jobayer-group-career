"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import SmartInstall from "@/components/home/SmartInstall";
import { useLanguageStore } from "@/lib/store";

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

  useEffect(() => {
    document.documentElement.lang = lang;
    document.cookie = `lang=${lang};path=/;max-age=31536000`;
  }, [lang]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return (
    <>
      {!isHome && <ScrollProgressBar />}
      {!isHome && <Navbar />}
      <main className={isHome ? "" : "min-h-screen pt-16 md:pt-20"}>{children}</main>
      {!isHome && <Footer />}
      {!isHome && <BottomNav />}
      {!isHome && <SmartInstall />}
    </>
  );
}

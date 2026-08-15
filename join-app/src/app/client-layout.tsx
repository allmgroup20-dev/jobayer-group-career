"use client";

import { useEffect } from "react";
import { LanguageProvider, useLang } from "@/lib/lang";

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "bn" ? "en" : "bn")}
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 backdrop-blur border border-line shadow-lg shadow-brand/5 text-sm font-black text-brand active:scale-95 transition-transform"
      aria-label="Toggle language"
    >
      <span className="text-base">🌐</span>
      {lang === "bn" ? "EN" : "বাং"}
    </button>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lang = document.cookie.match(/lang=([^;]+)/)?.[1];
    if (lang === "en" || lang === "bn") document.documentElement.lang = lang;
  }, []);

  return (
    <LanguageProvider>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center bg-white shadow-sm shadow-black/5 border-b border-black/5">
        <a href="/" aria-label="YouTube" className="ml-2 md:ml-4">
          <img src="/logo.png" alt="YouTube" className="h-5 w-auto" />
        </a>
      </header>
      <LangToggle />
      {children}
    </LanguageProvider>
  );
}

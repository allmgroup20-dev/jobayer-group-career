"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LanguageProvider, useLang } from "@/lib/lang";
import { useTracker } from "@/lib/tracking";

const EliteAdOverlay = dynamic(() => import("@/components/EliteAdOverlay"), { ssr: false });

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "bn" ? "en" : "bn")}
      className="flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-sm font-black text-white active:scale-95 transition-transform"
      aria-label="Toggle language"
    >
      <span className="text-base">🌐</span>
      {lang === "bn" ? "EN" : "বাং"}
    </button>
  );
}

interface Me {
  name?: string;
  avatarUrl?: string | null;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);

  useTracker();

  useEffect(() => {
    const lang = document.cookie.match(/lang=([^;]+)/)?.[1];
    if (lang === "en" || lang === "bn") document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { headers: { accept: "application/json" } });
        if (!res.ok) return;
        const data = (await res.json()) as Me;
        if (!cancelled) setMe(data);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const initial = (me?.name || "").trim().charAt(0).toUpperCase();

  return (
    <LanguageProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[90] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-[#0B1F33] focus:shadow-lg"
      >
        মূল কন্টেন্টে যান · Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center bg-[#0B1F33] shadow-md shadow-black/30 border-b border-white/10 pt-[env(safe-area-inset-top)]">
        <a href="/" aria-label="YouTube" className="ml-2 md:ml-4">
          <img src="/logo.png" alt="YouTube" className="h-5 w-auto" />
        </a>
        <div className="ml-auto flex items-center gap-2.5 pr-3 md:pr-4">
          <LangToggle />
          {me ? (
            me.avatarUrl ? (
              <img
                src={me.avatarUrl}
                alt={me.name || "Profile"}
                title={me.name || "Profile"}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-white/25"
              />
            ) : (
              <span
                title={me.name || "Profile"}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/15 text-sm font-bold text-white select-none"
              >
                {initial || "•"}
              </span>
            )
          ) : null}
        </div>
      </header>
      <div id="main-content">
        {children}
      </div>
      <EliteAdOverlay />
    </LanguageProvider>
  );
}

"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguageStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm font-medium"
      >
        <span className="text-base">{lang === "en" ? "🇬🇧" : "🇧🇩"}</span>
        <span>{lang === "en" ? "EN" : "বাংলা"}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-border py-2 z-50 min-w-[160px] animate-scale">
            <button
              onClick={() => { setLang("en"); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${lang === "en" ? "text-action font-semibold bg-green-50" : "text-text"}`}
            >
              <span className="text-lg">🇬🇧</span>
              <div className="text-left">
                <div>English</div>
                <div className="text-xs text-text-secondary">ইংরেজি</div>
              </div>
              {lang === "en" && <span className="ml-auto">✓</span>}
            </button>
            <div className="h-px bg-border mx-3" />
            <button
              onClick={() => { setLang("bn"); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${lang === "bn" ? "text-action font-semibold bg-green-50" : "text-text"}`}
            >
              <span className="text-lg">🇧🇩</span>
              <div className="text-left">
                <div>বাংলা</div>
                <div className="text-xs text-text-secondary">Bengali</div>
              </div>
              {lang === "bn" && <span className="ml-auto">✓</span>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

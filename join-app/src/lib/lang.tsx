"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Lang = "bn" | "en";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "bn",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    const stored = document.cookie.match(/lang=([^;]+)/)?.[1] as Lang | undefined;
    if (stored === "en" || stored === "bn") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    document.cookie = `lang=${l};path=/;max-age=31536000`;
    document.documentElement.lang = l;
    setLangState(l);
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

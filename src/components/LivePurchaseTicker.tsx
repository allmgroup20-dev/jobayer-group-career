"use client";

import { useEffect, useState } from "react";

type Sale = { name: string; product: string; amount: number; at: string | null };

const timeAgo = (at: string | null, lang: string) => {
  if (!at) return "";
  const diff = Date.now() - new Date(at).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === "bn" ? "এইমাত্র" : "just now";
  if (mins < 60) return lang === "bn" ? `${mins} মিনিট আগে` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return lang === "bn" ? `${hrs} ঘণ্টা আগে` : `${hrs}h ago`;
  return lang === "bn" ? `${Math.floor(hrs / 24)} দিন আগে` : `${Math.floor(hrs / 24)}d ago`;
};

export default function LivePurchaseTicker() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lang, setLang] = useState("bn");

  useEffect(() => {
    setLang(localStorage.getItem("lang") === "en" ? "en" : "bn");
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      fetch("/api/live/sales")
        .then((r) => r.json() as Promise<{ sales: Sale[] }>)
        .then((d) => setSales(d.sales || []))
        .catch(() => {});
    };
    tick();
    const timer = setInterval(tick, 40000);
    t = setTimeout(() => setVisible(true), 4000);
    return () => {
      clearInterval(timer);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!visible || dismissed || sales.length === 0) return;
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % sales.length);
    }, 8000);
    return () => clearTimeout(t);
  }, [visible, dismissed, sales, idx]);

  if (!visible || dismissed || sales.length === 0) return null;
  const s = sales[idx];
  if (!s) return null;

  return (
    <div
      onClick={() => setDismissed(true)}
      className="fixed bottom-4 left-4 z-[9999] max-w-xs cursor-pointer animate-pulse-once bg-white border border-border shadow-xl rounded-2xl p-3 pr-9"
    >
      <button
        onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs leading-5 text-center"
        aria-label="close"
      >✕</button>
      <div className="flex items-start gap-2">
        <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white flex items-center justify-center text-sm">🛒</div>
        <div className="min-w-0">
          <p className="text-xs text-text-secondary">
            <b className="text-text-primary">{s.name}</b> {lang === "bn" ? "কিনলেন" : "bought"}
          </p>
          <p className="text-sm font-bold text-primary truncate">{s.product}</p>
          <p className="text-[11px] text-text-secondary">
            ৳{s.amount} · {timeAgo(s.at, lang)}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const LAUNCH_END = new Date("2026-10-05T00:00:00+06:00").getTime();

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function LaunchOfferTimer() {
  const [now, setNow] = useState(Date.now());
  const [lang, setLang] = useState("bn");

  useEffect(() => {
    setLang(localStorage.getItem("lang") === "en" ? "en" : "bn");
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = LAUNCH_END - now;
  if (diff <= 0) {
    return (
      <div className="w-full py-2 px-4 bg-gradient-to-r from-rose-600 to-red-500 text-white text-center text-xs font-bold">
        {lang === "bn" ? "লঞ্চ অফার শেষ" : "Launch offer has ended"}
      </div>
    );
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const segs: { v: string; bn: string; en: string }[] = [
    { v: pad(d), bn: "দিন", en: "d" },
    { v: pad(h), bn: "ঘণ্টা", en: "h" },
    { v: pad(m), bn: "মিনিট", en: "m" },
    { v: pad(s), bn: "সেকেন্ড", en: "s" },
  ];

  return (
    <div className="w-full py-2 px-4 bg-gradient-to-r from-primary to-accent text-white text-center">
      <p className="text-xs font-bold">
        ⏳ {lang === "bn" ? "লঞ্চ অফার — ৳৯৯ থেকে! শেষ হওয়ার আগেই নিন" : "Launch offer — from ৳99! Get it before it ends"}
      </p>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {segs.map((s, i) => (
          <span key={s.bn} className="flex items-center gap-1.5">
            <span className="bg-white/15 rounded-md px-1.5 py-0.5 font-black tabular-nums min-w-[34px] text-center">{s.v}</span>
            <span className="text-[10px] text-white/70">{lang === "bn" ? s.bn : s.en}</span>
            {i < segs.length - 1 && <span className="text-white/40">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
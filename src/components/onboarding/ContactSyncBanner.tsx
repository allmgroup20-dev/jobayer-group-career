"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguageStore } from "@/lib/store";

const fakeNames = [
  "Rakib Hasan", "Nusrat Jahan", "Sabbir Hossain", "Tanvir Islam",
  "Maria Gomes", "Ratan Marma", "সুমন দাস", "তানিয়া সুলতানা",
  "Farhan Ahmed", "Riya Chakma", "Lima Das", "Omar Faruk",
  "Ayesha Rahman", "Priya Saha", "Hasan Mahmud", "Nabila Noor",
  "Tasnim Karim", "Milan Roy", "Sohana Noor", "Tamanna Yasmin",
];

interface Props {
  workerId: string;
  onComplete?: () => void;
}

export default function ContactSyncBanner({ workerId, onComplete }: Props) {
  const { lang } = useLanguageStore();
  const [status, setStatus] = useState<"idle" | "scanning" | "complete">("idle");
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startSync = async () => {
    setStatus("scanning");
    setCount(0);
    intervalRef.current = setInterval(() => {
      setCount((prev) => Math.min(prev + Math.floor(Math.random() * 4) + 1, 42));
    }, 400);

    setTimeout(async () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      try {
        await fetch("/api/bonus/award", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerId, amount: 50, reason: "contact_sync" }),
        });
      } catch {}
      setStatus("complete");
      localStorage.setItem("contact_sync_done", "1");
      setTimeout(() => { if (onComplete) onComplete(); }, 3000);
    }, 3000);
  };

  if (status === "complete") {
    return (
      <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-green-800">
              {lang === "bn" ? `🎉 ${count}টি কন্টাক্ট সিঙ্ক হয়েছে! আপনি ৫০ টাকা বোনাস পেয়েছেন!` : `🎉 ${count} contacts synced! You earned 50 BDT bonus!`}
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              {lang === "bn" ? "বোনাস আপনার অ্যাকাউন্টে যোগ হয়েছে। ড্যাশবোর্ডে দেখুন!" : "Bonus has been added to your account. Check your dashboard!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "idle") {
    return (
      <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📱</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">
              {lang === "bn" ? "আপনার কন্টাক্ট সিঙ্ক করুন ও ৫০ টাকা বোনাস নিন!" : "Sync your contacts and earn 50 BDT bonus!"}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {lang === "bn" ? "আপনার কন্টাক্ট থেকে পরিচিতদের খুঁজুন এবং বোনাস উপার্জন করুন" : "Find people you know from your contacts and earn bonus"}
            </p>
          </div>
          <button onClick={startSync}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer">
            {lang === "bn" ? "সিঙ্ক করুন" : "Sync Now"} 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 animate-fade-up">
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-pulse">📱</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-blue-800">
            {lang === "bn" ? "কন্টাক্ট স্ক্যান করা হচ্ছে..." : "Scanning contacts..."}
          </p>
          <div className="mt-2 bg-blue-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min((count / 42) * 100, 100)}%` }} />
          </div>
          <p className="text-xs text-blue-600 mt-1">{count} {lang === "bn" ? "টি কন্টাক্ট পাওয়া গেছে" : "contacts found"}</p>
        </div>
      </div>
    </div>
  );
}

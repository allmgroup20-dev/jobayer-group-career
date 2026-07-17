"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";

export function CookieConsentBanner() {
  const { lang } = useLanguageStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consented = localStorage.getItem("cookie_consent");
    if (!consented) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    const workerId = localStorage.getItem("worker_id");
    if (workerId) {
      fetch("/api/privacy/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, consentType: "cookies", isGranted: true }),
      }).catch(() => {});
    }
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">
            {lang === "bn" ? "🍪 আমরা কুকি ব্যবহার করি" : "🍪 We use cookies"}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {lang === "bn"
              ? "আমরা আপনার অভিজ্ঞতা উন্নত করতে এবং ট্রাফিক বিশ্লেষণ করতে কুকি ব্যবহার করি। আপনি গ্রহণ করে আমাদের ডেটা ব্যবহার নীতিতে সম্মতি দিচ্ছেন।"
              : "We use cookies to improve your experience and analyze traffic. By accepting, you consent to our data practices."}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-text-secondary hover:bg-gray-50 transition-all"
          >
            {lang === "bn" ? "প্রত্যাখ্যান" : "Decline"}
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all"
          >
            {lang === "bn" ? "গ্রহণ" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}

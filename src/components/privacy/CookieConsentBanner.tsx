"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const CONSENT_KEY = "cookie_consent_v2";

export function CookieConsentBanner() {
  const { lang } = useLanguageStore();
  const [show, setShow] = useState(false);
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [custom, setCustom] = useState<ConsentState>({
    necessary: true, analytics: true, marketing: false, functional: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (saved) {
        setConsent(JSON.parse(saved));
      } else {
        setShow(true);
      }
    } catch {
      setShow(true);
    }
  }, []);

  // Coordinate floating widgets: while the banner is open, the other
  // bottom-anchored widgets lift/hide via html[data-cookie].
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-cookie", show && !consent ? "1" : "0");
    return () => { el.setAttribute("data-cookie", "0"); };
  }, [show, consent]);

  const saveConsent = (state: ConsentState) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
    setConsent(state);
    setShow(false);
    setShowCustomize(false);
    const workerId = localStorage.getItem("worker_id");
    if (workerId) {
      fetch("/api/privacy/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, consentType: JSON.stringify(state), isGranted: state.analytics }),
      }).catch(() => {});
    }
    if (!state.analytics) {
      localStorage.removeItem("worker_id");
    }
  };

  const acceptAll = () => saveConsent({
    necessary: true, analytics: true, marketing: true, functional: true,
  });

  const rejectAll = () => saveConsent({
    necessary: true, analytics: false, marketing: false, functional: false,
  });

  const applyCustom = () => saveConsent(custom);

  if (!show || consent) return null;

  if (showCustomize) {
    const toggle = (key: keyof ConsentState) => {
      if (key === "necessary") return;
      setCustom(prev => ({ ...prev, [key]: !prev[key] }));
    };
    const items: { key: keyof ConsentState; labelEn: string; labelBn: string }[] = [
      { key: "necessary", labelEn: "Necessary (Required)", labelBn: "অত্যাবশ্যকীয় (আবশ্যক)" },
      { key: "analytics", labelEn: "Analytics / Tracking", labelBn: "বিশ্লেষণ / ট্র্যাকিং" },
      { key: "marketing", labelEn: "Marketing", labelBn: "মার্কেটিং" },
      { key: "functional", labelEn: "Functional / Personalization", labelBn: "কার্যকরী / ব্যক্তিগতকরণ" },
    ];
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-[60] p-6 animate-slide-up"
        style={{ bottom: "var(--bottom-nav-h)" }}>
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-primary mb-4">
            {lang === "bn" ? "কুকি সেটিংস কাস্টমাইজ করুন" : "Customize Cookie Settings"}
          </h3>
          <div className="space-y-3 mb-6">
            {items.map(item => (
              <label key={item.key} className={`flex items-center justify-between p-3 rounded-xl ${item.key === "necessary" ? "bg-gray-100" : "bg-gray-50 hover:bg-gray-100"} cursor-pointer transition-colors`}>
                <span className="text-sm font-medium text-primary">{lang === "bn" ? item.labelBn : item.labelEn}</span>
                <input
                  type="checkbox"
                  checked={custom[item.key]}
                  disabled={item.key === "necessary"}
                  onChange={() => toggle(item.key)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </label>
            ))}
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowCustomize(false)} className="px-5 py-2 text-sm font-medium text-text-secondary bg-gray-100 rounded-xl hover:bg-gray-200 transition-all cursor-pointer">
              {lang === "bn" ? "ফিরুন" : "Back"}
            </button>
            <button onClick={applyCustom} className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-all cursor-pointer">
              {lang === "bn" ? "সংরক্ষণ করুন" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-[60] animate-slide-up"
      style={{ bottom: "var(--bottom-nav-h)" }}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">
            {lang === "bn" ? "🍪 আমরা আপনার অভিজ্ঞতা উন্নত করতে কুকি ব্যবহার করি" : "🍪 We use cookies to improve your experience"}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {lang === "bn"
              ? "আপনার ব্রাউজিং কার্যকলাপ ট্র্যাক করে আমরা আপনার আগ্রহ অনুযায়ী কন্টেন্ট দেখাই"
              : "We track your browsing activity to show content tailored to your interests"}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={rejectAll} className="px-4 py-2 text-xs font-medium text-text-secondary bg-gray-100 rounded-xl hover:bg-gray-200 transition-all cursor-pointer">
            {lang === "bn" ? "শুধু প্রয়োজনীয়" : "Necessary Only"}
          </button>
          <button onClick={() => setShowCustomize(true)} className="px-4 py-2 text-xs font-medium text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-all cursor-pointer">
            {lang === "bn" ? "কাস্টমাইজ" : "Customize"}
          </button>
          <button onClick={acceptAll} className="px-4 py-2 text-xs font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-all cursor-pointer">
            {lang === "bn" ? "গ্রহণ করুন" : "Accept All"}
          </button>
        </div>
      </div>
    </div>
  );
}

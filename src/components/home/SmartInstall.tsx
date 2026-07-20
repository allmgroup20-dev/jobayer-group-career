"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguageStore } from "@/lib/store";

const DISMISS_RESET_MINUTES = 60;
const MAX_DISMISS_BEFORE_PAUSE = 10;
const REAPPEAR_DELAY_MS = 4500;

export default function SmartInstall() {
  const { lang } = useLanguageStore();
  const deferredPrompt = useRef<any>(null);
  const [visible, setVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [browser, setBrowser] = useState<"chrome" | "safari" | "firefox" | "other">("other");

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect browser
    const ua = navigator.userAgent;
    if (ua.includes("Chrome") || ua.includes("Edge") || ua.includes("Brave") || ua.includes("Opera") || ua.includes("Samsung")) {
      setBrowser(iOS ? "safari" : "chrome"); // iOS Chrome/Edge uses Safari WebKit
    } else if (ua.includes("Firefox")) {
      setBrowser(iOS ? "safari" : "firefox");
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
      setBrowser("safari");
    }

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setVisible(true);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    // Dismiss counter
    let dismissCount = 0;
    try {
      dismissCount = parseInt(localStorage.getItem("pwa_dismiss_count") || "0");
    } catch {}

    // Pause check
    try {
      const pauseUntil = localStorage.getItem("pwa_pause_until");
      if (pauseUntil) {
        const remaining = parseInt(pauseUntil) - Date.now();
        if (remaining > 0) return; // Still paused
        localStorage.removeItem("pwa_pause_until");
      }
    } catch {}

    // Show after short delay if not already shown by beforeinstallprompt
    const timer = setTimeout(() => {
      if (!deferredPrompt.current && !isInstalled) {
        if (iOS) {
          setVisible(true);
        } else {
          setVisible(true);
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!visible || isInstalled) return;
    // Reevaluate visible — if dismissed too many times, pause for an hour
    try {
      const count = parseInt(localStorage.getItem("pwa_dismiss_count") || "0");
      if (count >= MAX_DISMISS_BEFORE_PAUSE) {
        const pauseUntil = Date.now() + DISMISS_RESET_MINUTES * 60 * 1000;
        localStorage.setItem("pwa_pause_until", String(pauseUntil));
        localStorage.setItem("pwa_dismiss_count", "0");
        setVisible(false);
      }
    } catch {}
  }, [visible, isInstalled]);

  async function handleInstall() {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      const choice = await deferredPrompt.current.userChoice;
      deferredPrompt.current = null;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setVisible(false);
      }
      return;
    }

    if (isIOS) {
      try {
        await navigator.share({
          title: "Jobayer Group Career",
          text: "Jobayer Group Career - Build Your Career With Us",
          url: window.location.origin,
        });
      } catch {}
      return;
    }

    if (browser === "safari" && navigator.share) {
      try {
        await navigator.share({
          title: "Jobayer Group Career",
          text: "Jobayer Group Career - Build Your Career With Us",
          url: window.location.origin,
        });
      } catch {}
    }
  }

  function handleDismiss() {
    setVisible(false);
    deferredPrompt.current = null;
    try {
      let count = parseInt(localStorage.getItem("pwa_dismiss_count") || "0");
      count += 1;
      localStorage.setItem("pwa_dismiss_count", String(count));
    } catch {}

    // Reappear after 4-5 seconds
    setTimeout(() => {
      try {
        const pauseUntil = localStorage.getItem("pwa_pause_until");
        if (pauseUntil && parseInt(pauseUntil) > Date.now()) return;
        if (!isInstalled) setVisible(true);
      } catch {}
    }, REAPPEAR_DELAY_MS);
  }

  if (isInstalled || !visible) return null;

  const showOneClick = deferredPrompt.current;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-80 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
          aria-label="Close"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex items-center gap-3 mb-3">
          <img src="/favicon.svg" alt="JG Career" className="w-10 h-10 rounded-xl" />
          <div>
            <div className="text-sm font-bold text-primary">Jobayer Group Career</div>
            <div className="text-[10px] text-text-secondary">
              {lang === "bn" ? "অ্যাপ হিসেবে ব্যবহার করুন" : "Use as App"}
            </div>
          </div>
        </div>

        {isIOS ? (
          <button
            onClick={handleInstall}
            className="w-full py-2.5 bg-gradient-to-r from-accent to-accent-light text-white text-sm font-bold rounded-xl hover:from-accent-dark hover:to-accent transition-all shadow-lg shadow-accent/30 active:scale-[0.97]"
          >
            {lang === "bn" ? "📲 এখনই ইনস্টল করুন" : "📲 Install App"}
          </button>
        ) : showOneClick ? (
          <button
            onClick={handleInstall}
            className="w-full py-2.5 bg-gradient-to-r from-accent to-accent-light text-white text-sm font-bold rounded-xl hover:from-accent-dark hover:to-accent transition-all shadow-lg shadow-accent/30 active:scale-[0.97]"
          >
            {lang === "bn" ? "⚡ এখনই ইনস্টল করুন" : "⚡ Install Now"}
          </button>
        ) : browser === "firefox" ? (
          <div className="text-xs text-text-secondary leading-relaxed text-center">
            {lang === "bn"
              ? "ফায়ারফক্সে ইনস্টল করতে ব্রাউজারের মেনু থেকে Install সিলেক্ট করুন"
              : "To install on Firefox, select 'Install' from the browser menu"}
          </div>
        ) : (
          <button
            onClick={handleInstall}
            className="w-full py-2.5 bg-gradient-to-r from-accent to-accent-light text-white text-sm font-bold rounded-xl hover:from-accent-dark hover:to-accent transition-all shadow-lg shadow-accent/30 active:scale-[0.97]"
          >
            {lang === "bn" ? "📲 ইনস্টল করুন" : "📲 Install App"}
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useLanguageStore } from "@/lib/store";

export default function AppsPage() {
  const { lang } = useLanguageStore();
  const deferredPrompt = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "installing" | "done" | "ios" | "unsupported">("loading");

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setStatus("done");
      return;
    }

    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setStatus("ready");
    };

    const handleInstalled = () => {
      setStatus("done");
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    if (iOS) {
      setStatus("ios");
    } else {
      // If beforeinstallprompt doesn't fire within 3s, mark unsupported
      setTimeout(() => {
        if (!deferredPrompt.current && !iOS) setStatus("unsupported");
      }, 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    setStatus("installing");
    prompt.prompt();
    const choice = await prompt.userChoice;
    deferredPrompt.current = null;
    if (choice.outcome === "accepted") {
      setStatus("done");
    } else {
      setStatus("ready");
    }
  };

  const installedView = (
    <div>
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-primary mb-2">
        {lang === "bn" ? "✅ ইনস্টল করা হয়েছে" : "✅ Installed"}
      </h2>
      <p className="text-text-secondary text-sm">
        {lang === "bn" ? "অ্যাপটি আপনার ডিভাইসে ইনস্টল হয়েছে। হোম স্ক্রিন থেকে খুলুন।" : "The app is installed on your device. Open from your home screen."}
      </p>
    </div>
  );

  const iosView = (
    <div>
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-primary mb-4">
        {lang === "bn" ? "iOS এ ইনস্টল করুন" : "Install on iOS"}
      </h2>
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-text-secondary text-left space-y-2">
        <p>1. {lang === "bn" ? "Safari খুলুন" : "Open Safari"}</p>
        <p>2. {lang === "bn" ? "শেয়ার বাটনে ট্যাপ করুন" : "Tap the Share button"}</p>
        <p>3. {lang === "bn" ? "হোম স্ক্রিনে যোগ করুন সিলেক্ট করুন" : 'Select "Add to Home Screen"'}</p>
        <p>4. {lang === "bn" ? "Add বাটনে ট্যাপ করুন" : 'Tap "Add"'}</p>
      </div>
    </div>
  );

  const unsupportedView = (
    <div>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-primary mb-2">
        {lang === "bn" ? "ইনস্টল সমর্থিত নয়" : "Install Not Supported"}
      </h2>
      <p className="text-text-secondary text-sm">
        {lang === "bn" ? "আপনার ব্রাউজার অ্যাপ ইনস্টল সমর্থন করে না। Chrome বা Edge ব্যবহার করে দেখুন।" : "Your browser does not support app installation. Try Chrome or Edge."}
      </p>
    </div>
  );

  const readyView = (
    <div>
      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-primary mb-2">
        {lang === "bn" ? "ইনস্টল করার জন্য প্রস্তুত" : "Ready to Install"}
      </h2>
      <p className="text-text-secondary text-sm mb-6">
        {lang === "bn" ? "নিচের বাটনে ক্লিক করুন। আপনার ডিভাইসে অ্যাপটি ইনস্টল হয়ে যাবে।" : "Click the button below. The app will be installed on your device."}
      </p>
      <button onClick={handleInstall} className="px-8 py-3 gradient-premium text-white text-base font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-orange-200 active:scale-95">
        {lang === "bn" ? "⚡ এখনই ইনস্টল করুন" : "⚡ Install Now"}
      </button>
    </div>
  );

  const installingView = (
    <div>
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
        <svg className="w-8 h-8 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-primary mb-2">
        {lang === "bn" ? "ইনস্টল হচ্ছে..." : "Installing..."}
      </h2>
    </div>
  );

  const loadingView = (
    <div>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
        <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-primary mb-2">
        {lang === "bn" ? "চেক করা হচ্ছে..." : "Checking..."}
      </h2>
      <p className="text-text-secondary text-sm">
        {lang === "bn" ? "আপনার ডিভাইস চেক করা হচ্ছে..." : "Checking your device..."}
      </p>
    </div>
  );

  const statusMap: Record<string, ReactNode> = {
    loading: loadingView,
    ready: readyView,
    installing: installingView,
    done: installedView,
    ios: iosView,
    unsupported: unsupportedView,
  };

  return (
    <div className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-200">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-3">
            {lang === "bn" ? "অ্যাপ" : "App"}
          </h1>
          <p className="text-text-secondary">
            {lang === "bn" ? "ওয়েবসাইটটি অ্যাপ হিসেবে ব্যবহার করুন। এক ক্লিকেই ইনস্টল করুন।" : "Use this website as an app. Install with one click."}
          </p>
        </div>

        <div className="card p-8 text-center">
          {statusMap[status] || loadingView}
        </div>

        {(status === "ready" || status === "loading") && (
          <div className="mt-6 card p-4 bg-blue-50/50 border border-blue-100">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-lg shrink-0">&#x2139;&#xFE0F;</span>
              <p className="text-xs text-blue-700">
                {lang === "bn" ? "ইনস্টল করার পর আপনার হোম স্ক্রিনে অ্যাপ আইকন যুক্ত হবে। যেকোনো সময় এক ক্লিকে খুলতে পারবেন। কোনো ডাউনলোড বা আপডেটের প্রয়োজন নেই।" : "After installation, an app icon will be added to your home screen. Open anytime with one click. No downloads or updates needed."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

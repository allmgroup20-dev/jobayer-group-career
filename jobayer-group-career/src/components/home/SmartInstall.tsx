"use client";

import { useState, useEffect } from "react";

export default function SmartInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) { setShowIOS(true); return; }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setInstalled(true);
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowIOS(true);
    }
  };

  if (installed || (!showPrompt && !showIOS)) return null;

  return (
    <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-[380px]">
      {showPrompt && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary-dark/95 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="w-[42px] h-[42px] rounded-lg bg-gradient-to-br from-info to-accent flex items-center justify-center text-white font-black text-sm flex-shrink-0">JG</div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-extrabold truncate">Jobayer Group Career</div>
            <div className="text-text-secondary text-[10px] font-semibold">অ্যাপ হিসেবে ইনস্টল করুন</div>
          </div>
          <button onClick={handleInstall} className="px-4 py-2 rounded-lg bg-gradient-to-r from-info to-accent text-white text-xs font-extrabold border-none cursor-pointer shadow-md hover:brightness-110 transition-all">⚡ ইনস্টল</button>
          <button onClick={() => setShowPrompt(false)} className="text-text-secondary text-sm border-none bg-transparent cursor-pointer hover:text-white transition-colors">✕</button>
        </div>
      )}
      {showIOS && (
        <div className="p-4 rounded-xl bg-primary-dark/95 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="flex items-start justify-between mb-2.5">
            <h4 className="text-white font-extrabold text-sm">📱 ইনস্টল করার নিয়ম</h4>
            <button onClick={() => setShowIOS(false)} className="text-text-secondary text-sm border-none bg-transparent cursor-pointer hover:text-white">✕</button>
          </div>
          <p className="text-text-secondary text-xs font-semibold mb-3 leading-relaxed">
            আপনার ব্রাউজারে নিচের ধাপগুলো ফলো করুন:
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 text-xs text-text-secondary">
              <span className="w-[26px] h-[26px] rounded-full bg-info/20 flex items-center justify-center text-info font-black flex-shrink-0">১</span>
              <span>শেয়ার আইকন <span className="inline-block px-2 py-0.5 rounded bg-white/10 text-white font-bold">⎙</span> ট্যাপ করুন</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-text-secondary">
              <span className="w-[26px] h-[26px] rounded-full bg-info/20 flex items-center justify-center text-info font-black flex-shrink-0">২</span>
              <span>&ldquo;হোম স্ক্রিনে যোগ করুন&rdquo; নির্বাচন করুন</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-text-secondary">
              <span className="w-[26px] h-[26px] rounded-full bg-info/20 flex items-center justify-center text-info font-black flex-shrink-0">৩</span>
              <span>&ldquo;যোগ করুন&rdquo; বাটনে ক্লিক করুন ✅</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

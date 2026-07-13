"use client";

import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

export default function AppInstallPage() {
  const { lang } = useLanguageStore();

  const platforms = [
    {
      en: "iPhone / iPad",
      bn: "আইফোন / আইপ্যাড",
      icon: "📱",
      steps: [
        { en: "Open Safari browser", bn: "সাফারি ব্রাউজার খুলুন" },
        { en: "Go to our website", bn: "আমাদের ওয়েবসাইটে যান" },
        { en: 'Tap the Share button (square with arrow)', bn: 'শেয়ার বাটনে ট্যাপ করুন (স্কয়ার সহ তীর)' },
        { en: 'Scroll down and tap "Add to Home Screen"', bn: 'নিচে স্ক্রোল করে "হোম স্ক্রিনে যোগ করুন" ট্যাপ করুন' },
        { en: 'Tap "Add" in the top right', bn: 'উপরে ডানদিকে "যোগ করুন" ট্যাপ করুন' },
      ],
    },
    {
      en: "Android Phone",
      bn: "অ্যান্ড্রয়েড ফোন",
      icon: "🤖",
      steps: [
        { en: "Open Chrome browser", bn: "ক্রোম ব্রাউজার খুলুন" },
        { en: "Go to our website", bn: "আমাদের ওয়েবসাইটে যান" },
        { en: 'Tap the three-dot menu (⋮)', bn: 'তিন-ডট মেনু ট্যাপ করুন (⋮)' },
        { en: 'Tap "Add to Home Screen"', bn: '"হোম স্ক্রিনে যোগ করুন" ট্যাপ করুন' },
        { en: 'Tap "Add" to confirm', bn: 'নিশ্চিত করতে "যোগ করুন" ট্যাপ করুন' },
      ],
    },
    {
      en: "Desktop Computer",
      bn: "ডেস্কটপ কম্পিউটার",
      icon: "💻",
      steps: [
        { en: "Open Chrome or Edge browser", bn: "ক্রোম বা এজ ব্রাউজার খুলুন" },
        { en: "Go to our website", bn: "আমাদের ওয়েবসাইটে যান" },
        { en: 'Click the install icon (➕) in the address bar', bn: 'অ্যাড্রেস বারে ইনস্টল আইকনে ক্লিক করুন (➕)' },
        { en: 'Click "Install" button', bn: '"ইনস্টল" বাটনে ক্লিক করুন' },
        { en: "The app will open like native software", bn: "অ্যাপটি নেটিভ সফটওয়্যারের মতো খুলবে" },
      ],
    },
  ];

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 animate-fade-up">
          <div className="w-16 h-16 gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {lang === "bn" ? "অ্যাপ হিসেবে ব্যবহার করুন" : "Use as an App"}
          </h1>
          <p className="text-text-secondary text-base max-w-lg mx-auto">
            {lang === "bn"
              ? "কোনো ডাউনলোডের প্রয়োজন নেই। আপনার ফোন বা কম্পিউটারে আমাদের ওয়েবসাইটটি অ্যাপের মতো করে ব্যবহার করুন। নিচের ধাপগুলো অনুসরণ করুন:"
              : "No download required. Use our website like a native app on your phone or computer. Follow the steps below:"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {platforms.map((platform, i) => (
            <Card key={i} className="animate-fade-up" hover>
              <div className="text-5xl mb-4">{platform.icon}</div>
              <h2 className="font-bold text-lg text-primary mb-4">{lang === "bn" ? platform.bn : platform.en}</h2>
              <ol className="space-y-3">
                {platform.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {j + 1}
                    </span>
                    <span className="text-text-secondary">{lang === "bn" ? step.bn : step.en}</span>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 gradient-primary rounded-2xl text-white text-center">
          <p className="text-lg font-semibold mb-2">
            {lang === "bn"
              ? "🎉 প্রস্তুত! এখন আপনি অ্যাপের মতোই ব্যবহার করতে পারবেন"
              : "🎉 Ready! Now you can use it just like an app"}
          </p>
          <p className="text-sm text-white/70">
            {lang === "bn"
              ? "আপনার হোম স্ক্রিনে অ্যাপ আইকন যুক্ত হবে। যেকোনো সময় এক ক্লিকে খুলতে পারবেন।"
              : "An app icon will be added to your home screen. Open anytime with one click."}
          </p>
        </div>
      </div>
    </div>
  );
}

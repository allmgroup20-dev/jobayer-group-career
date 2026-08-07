"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import { liveSalaryText } from "@/data/home/salary";
import SalaryTable from "@/components/home/SalaryTable";
import PaymentGallery from "@/components/home/PaymentGallery";
import LiveNotificationBar from "@/components/home/LiveNotificationBar";

const bdDistricts = [
  "ঢাকা","চট্টগ্রাম","রাজশাহী","খুলনা","সিলেট","বরিশাল","রংপুর",
  "ময়মনসিংহ","কুমিল্লা","নরসিংদী","গাজীপুর","নারায়ণগঞ্জ","টাঙ্গাইল",
  "ফরিদপুর","বগুড়া","দিনাজপুর","পাবনা","কুষ্টিয়া","যশোর","কক্সবাজার",
];

const tabs = [
  { id: "salary", labelBn: "📊 সর্বশেষ বোনাস", labelEn: "📊 Latest Bonuses" },
  { id: "proof", labelBn: "💰 আয়ের প্রমাণপত্র", labelEn: "💰 Proof of Earnings" },
];

export default function LiveUpdatesPage() {
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState("salary");
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const latestNameRef = useRef<string | null>(null);

  const buildNotif = useCallback((name: string) => {
    const district = bdDistricts[Math.floor(Math.random() * bdDistricts.length)];
    const suffix = lang === "bn" ? liveSalaryText.liveNotifJoined : liveSalaryText.liveNotifJoinedEn;
    return `${name}, ${district} ${suffix}`;
  }, [lang]);

  const handleNewSuccess = useCallback((name: string) => {
    latestNameRef.current = name;
    setNotifMessage(buildNotif(name));
  }, [buildNotif]);

  useEffect(() => {
    const id = setInterval(() => {
      if (latestNameRef.current) {
        setNotifMessage(buildNotif(latestNameRef.current));
      }
    }, 30000);
    return () => clearInterval(id);
  }, [buildNotif]);

  return (
    <div className="min-h-screen bg-bg">
      <LiveNotificationBar message={notifMessage} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-6">
        <div className="text-center mb-2">
          <div className="badge mx-auto mb-3 border-success/20 bg-success/10 text-success">
            📊 {lang === "bn" ? "সর্বশেষ বোনাস" : "Latest Bonuses"}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-text">
            {lang === "bn" ? "বোনাস ও আয়ের নমুনা" : "Sample Bonuses & Earnings"}
          </h1>
          <p className="text-text-secondary font-semibold mt-2 max-w-2xl mx-auto">
            {lang === "bn"
              ? "এখানে দেখানো বোনাস, আয় ও পেমেন্ট প্রমাণ প্রদর্শনমূলক নমুনা — প্ল্যাটফর্মের কার্যক্রম বোঝানোর জন্য"
              : "The bonuses, earnings and payment proofs shown here are illustrative samples to explain how the platform works"}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-success text-white shadow-lg shadow-success/30"
                  : "bg-white border border-border text-text-secondary hover:border-success/30 hover:text-text"
              }`}
            >
              {lang === "bn" ? tab.labelBn : tab.labelEn}
            </button>
          ))}
        </div>

        {activeTab === "salary" && <SalaryTable onNewSuccess={handleNewSuccess} />}
        {activeTab === "proof" && <PaymentGallery />}
      </div>
    </div>
  );
}

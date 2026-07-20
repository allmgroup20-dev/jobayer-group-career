"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import OverviewTab from "@/components/finance/OverviewTab";
import WithdrawalsTab from "@/components/finance/WithdrawalsTab";
import PaymentGatewayTab from "@/components/finance/PaymentGatewayTab";
import CurrenciesTab from "@/components/finance/CurrenciesTab";

const TABS = [
  { id: "overview", en: "Overview", bn: "ওভারভিউ" },
  { id: "withdrawals", en: "Withdrawals", bn: "উইথড্রয়াল" },
  { id: "payment-gateway", en: "Payment Gateway", bn: "পেমেন্ট গেটওয়ে" },
  { id: "currencies", en: "Currencies", bn: "কারেন্সি" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function CompanyFinancePage() {
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "💰 ফাইন্যান্স" : "💰 Finance"}</h1>
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">{lang === "bn" ? "🤝 বিশ্বস্ত পজিশনিং" : "🤝 Trust Positioning"}</span>
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">{lang === "bn" ? "🔐 পারসেপশন ইজ রিয়ালিটি" : "🔐 Perception is Reality"}</span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn"
              ? "রেভিনিউ, উইথড্রয়াল, পেমেন্ট গেটওয়ে ও কারেন্সি কনফিগারেশন। পজিশনিং বই অনুসারে — পেমেন্ট গেটওয়ের নাম ও ডিজাইনই বিশ্বাস তৈরি করে।"
              : "Revenue, withdrawals, payment gateway & currency configuration. Per Positioning — the gateway's name & design build trust before a single transaction."}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 p-1 rounded-xl flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-text-secondary hover:text-primary"
              }`}
            >
              {lang === "bn" ? tab.bn : tab.en}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "withdrawals" && <WithdrawalsTab />}
        {activeTab === "payment-gateway" && <PaymentGatewayTab />}
        {activeTab === "currencies" && <CurrenciesTab />}
      </div>
    </div>
  );
}

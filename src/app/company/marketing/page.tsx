"use client";

import { useState } from "react";
import BrandTab from "@/components/marketing-tabs/BrandTab";
import CampaignsTab from "@/components/marketing-tabs/CampaignsTab";
import CSRTab from "@/components/marketing-tabs/CSRTab";
import GlobalMarketsTab from "@/components/marketing-tabs/GlobalMarketsTab";
import PLCTab from "@/components/marketing-tabs/PLCTab";
import PositioningTab from "@/components/marketing-tabs/PositioningTab";
import PricingStrategyTab from "@/components/marketing-tabs/PricingStrategyTab";

const TABS = [
  { key: "brand", label: "Brand", comp: BrandTab },
  { key: "campaigns", label: "Campaigns", comp: CampaignsTab },
  { key: "csr", label: "CSR", comp: CSRTab },
  { key: "global-markets", label: "Global Markets", comp: GlobalMarketsTab },
  { key: "plc", label: "PLC", comp: PLCTab },
  { key: "positioning", label: "Positioning", comp: PositioningTab },
  { key: "pricing", label: "Pricing Strategy", comp: PricingStrategyTab },
] as const;

export default function MarketingPage() {
  const [active, setActive] = useState<string>("brand");
  const ActiveComp = TABS.find((t) => t.key === active)!.comp;

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">📈 Marketing</h1>
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">🥇 Leader Positioning</span>
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">🎯 Creneau Strategy</span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">🔄 Reposition Competition</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Brand equity, campaigns, CSR, global markets &amp; strategy frameworks — powered by Ries &amp; Trout's Positioning
          </p>
        </div>

        <div className="bg-gray-100 p-1 rounded-xl flex flex-wrap gap-1 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                active === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ActiveComp />
      </div>
    </div>
  );
}

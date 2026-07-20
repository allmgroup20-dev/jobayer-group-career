"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import InsightsTab from "@/components/psychology/InsightsTab";
import ProfilesTab from "@/components/psychology/ProfilesTab";
import ReportsTab from "@/components/psychology/ReportsTab";
import FunnelPsychTab from "@/components/psychology/FunnelPsychTab";
import HabitsTab from "@/components/psychology/HabitsTab";
import PersuasionTab from "@/components/psychology/PersuasionTab";
import PsychologistTab from "@/components/psychology/PsychologistTab";

type TabId = "overview" | "insights" | "profiles" | "reports" | "funnel" | "habits" | "persuasion" | "psychologist";

const TABS: { id: TabId; icon: string; en: string; bn: string }[] = [
  { id: "overview", icon: "📊", en: "Overview", bn: "ওভারভিউ" },
  { id: "insights", icon: "🧠", en: "Insights", bn: "ইনসাইটস" },
  { id: "profiles", icon: "👤", en: "Profiles", bn: "প্রোফাইল" },
  { id: "reports", icon: "📈", en: "Reports", bn: "রিপোর্ট" },
  { id: "funnel", icon: "🔮", en: "Funnel", bn: "ফানেল" },
  { id: "habits", icon: "⏰", en: "Habits", bn: "অভ্যাস" },
  { id: "persuasion", icon: "🎯", en: "Persuasion", bn: "পারসুয়েশন" },
  { id: "psychologist", icon: "🛡️", en: "Psychologist", bn: "সাইকোলজিস্ট" },
];

const OVERVIEW_CARDS = [
  { tab: "insights", icon: "🧠", en: "Psychology Insights", bn: "সাইকোলজি ইনসাইটস", desc: "Trust distribution, fear profile & manipulation risk dashboard", descBn: "বিশ্বাস বিতরণ, ভয় প্রোফাইল ও ম্যানিপুলেশন ঝুঁকি ড্যাশবোর্ড" },
  { tab: "profiles", icon: "👤", en: "Profile Console", bn: "প্রোফাইল কনসোল", desc: "Search & analyze individual customer psychology profiles", descBn: "গ্রাহকের মনস্তাত্ত্বিক প্রোফাইল অনুসন্ধান ও বিশ্লেষণ" },
  { tab: "reports", icon: "📈", en: "Reports & Trends", bn: "রিপোর্ট ও ট্রেন্ড", desc: "Trend analysis, segment breakdown & churn risk reports", descBn: "ট্রেন্ড বিশ্লেষণ, সেগমেন্ট ও চার্ন ঝুঁকি রিপোর্ট" },
  { tab: "funnel", icon: "🔮", en: "Funnel Psychology", bn: "ফানেল সাইকোলজি", desc: "Psychological state at every funnel stage with at-risk profiles", descBn: "ফানেলের প্রতিটি ধাপে মনস্তাত্ত্বিক অবস্থা বিশ্লেষণ" },
  { tab: "habits", icon: "⏰", en: "Daily Habits", bn: "দৈনিক অভ্যাস", desc: "Morning value messages & evening trust currency snapshots", descBn: "সকালে মূল্য বার্তা ও রাতে বিশ্বাস কারেন্সি স্ন্যাপশট" },
  { tab: "persuasion", icon: "🎯", en: "Persuasion Skills", bn: "পারসুয়েশন স্কিল", desc: "Employee trust building, listening & resistance handling scores", descBn: "কর্মচারীর বিশ্বাস গঠন, শ্রবণ ও প্রতিরোধ স্কোর" },
  { tab: "psychologist", icon: "🛡️", en: "Psychologist Dashboard", bn: "সাইকোলজিস্ট ড্যাশবোর্ড", desc: "Core persuasion metrics, agent breakdown & 14-day trends", descBn: "মূল পারসুয়েশন মেট্রিক, এজেন্ট ব্রেকডাউন ও ট্রেন্ড" },
];

export default function PsychologyPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">{isBn ? "🧠 সাইকোলজি — পারসেপশন ইজ রিয়ালিটি" : "🧠 Psychology — Perception is Reality"}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">{isBn ? "🎭 বাস্তবতা নয়, ধারণাই মূল" : "🎭 Perception Over Reality"}</span>
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">{isBn ? "🔢 সর্বোচ্চ ৭টি ইউনিট" : "🔢 Max 7 Units"}</span>
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">{isBn ? "🔄 আউটসাইড-ইন থিঙ্কিং" : "🔄 Outside-In Thinking"}</span>
        </div>
        <p className="text-sm text-text-secondary mt-2">
          {isBn ? "মানুষ তার মনের পূর্ব অভিজ্ঞতার সাথে মেলে এমন তথ্যই গ্রহণ করে। পজিশনিং বই অনুসারে — সত্য অপ্রাসঙ্গিক, ধারণাই বাস্তবতা। আমরা গ্রাহকের ধারণাকে বাস্তবতা হিসেবে মেনে নিয়ে সেটাকে রিস্ট্রাকচার করি।" : "The mind accepts only what matches prior experience. Per Ries & Trout — truth is irrelevant, perception is reality. We accept perceptions as reality and restructure them."}
        </p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{isBn ? tab.bn : tab.en}</span>
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OVERVIEW_CARDS.map((card) => (
            <button
              key={card.tab}
              onClick={() => setActiveTab(card.tab as TabId)}
              className="bg-white rounded-2xl border border-border p-5 text-left hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="text-sm font-bold text-text mb-1">{isBn ? card.bn : card.en}</h3>
              <p className="text-xs text-text-secondary/70">{isBn ? card.descBn : card.desc}</p>
            </button>
          ))}
        </div>
      )}

      {activeTab === "insights" && <InsightsTab />}
      {activeTab === "profiles" && <ProfilesTab />}
      {activeTab === "reports" && <ReportsTab />}
      {activeTab === "funnel" && <FunnelPsychTab />}
      {activeTab === "habits" && <HabitsTab />}
      {activeTab === "persuasion" && <PersuasionTab />}
      {activeTab === "psychologist" && <PsychologistTab />}
    </div>
  );
}

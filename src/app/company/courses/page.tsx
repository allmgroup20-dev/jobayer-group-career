"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import CoursesTab from "@/components/courses/CoursesTab";
import CategoriesTab from "@/components/courses/CategoriesTab";
import AIPricingTab from "@/components/courses/AIPricingTab";
import StatsTab from "@/components/courses/StatsTab";
import TrainersTab from "@/components/courses/TrainersTab";
import InstitutionsTab from "@/components/courses/InstitutionsTab";

const tabs = [
  { key: "courses", labelEn: "Courses", labelBn: "রিসোর্সেস" },
  { key: "categories", labelEn: "Categories", labelBn: "ক্যাটাগরি" },
  { key: "ai-pricing", labelEn: "AI Pricing", labelBn: "এআই প্রাইসিং" },
  { key: "stats", labelEn: "Stats", labelBn: "পরিসংখ্যান" },
  { key: "trainers", labelEn: "Trainers", labelBn: "প্রশিক্ষক" },
  { key: "institutions", labelEn: "Institutions", labelBn: "প্রতিষ্ঠান" },
];

export default function CompanyCoursesPage() {
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState("courses");

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-primary">🎓 Courses</h1>
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">🥇 First-Mover Positioning</span>
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">💰 Price Creneau</span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">{lang === "bn" ? "🧠 প্রোডাক্ট ল্যাডার" : "🧠 Product Ladder"}</span>
          </div>
          <p className="text-sm text-text-secondary mt-1">{lang === "bn" ? "প্রতিটি কোর্স মাইন্ডে প্রোডাক্ট ল্যাডারের একটি রাং। ফার্স্ট-মুভার সুযোগ ও প্রাইস ক্রেনো স্ট্র্যাটেজি।" : "Each course is a rung on the mind's product ladder. First-mover advantage & price creneau strategy from Ries & Trout."}</p>
        </div>

        <div className="bg-gray-100 p-1 rounded-xl flex gap-1 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-primary shadow-sm"
                  : "text-text-secondary hover:text-primary"
              }`}
            >
              {lang === "bn" ? tab.labelBn : tab.labelEn}
            </button>
          ))}
        </div>

        {activeTab === "courses" && <CoursesTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "ai-pricing" && <AIPricingTab />}
        {activeTab === "stats" && <StatsTab />}
        {activeTab === "trainers" && <TrainersTab />}
        {activeTab === "institutions" && <InstitutionsTab />}
      </div>
    </div>
  );
}

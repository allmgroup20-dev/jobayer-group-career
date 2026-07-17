"use client";

import { useState, useMemo } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const defaultTranslations = [
  { key: "nav_home", en: "Home", bn: "হোম" },
  { key: "nav_products", en: "Products", bn: "পণ্য" },
  { key: "nav_dashboard", en: "Dashboard", bn: "ড্যাশবোর্ড" },
  { key: "home_hero_title", en: "Build Your Career With Jobayer Group", bn: "জোবায়ের গ্রুপের সাথে আপনার ক্যারিয়ার গড়ুন" },
];

export default function CompanyTranslationsPage() {
  const { lang } = useLanguageStore();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(() =>
    defaultTranslations.filter((t) => t.key.includes(debouncedSearch) || t.en.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [debouncedSearch]
  );

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "অনুবাদ" : "Translations"}</h1>
            <p className="text-sm text-text-secondary mt-1">{lang === "bn" ? "ভাষা অনুবাদ ম্যানেজ করুন" : "Manage language translations"}</p>
          </div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field max-w-xs" placeholder={lang === "bn" ? "খুঁজুন..." : "Search..."} />
        </div>

        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-primary">Key</th>
                  <th className="text-left p-4 text-sm font-semibold text-primary">English</th>
                  <th className="text-left p-4 text-sm font-semibold text-primary">বাংলা</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "একশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.key} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    <td className="p-4 text-sm font-mono text-text-secondary">{t.key}</td>
                    <td className="p-4 text-sm text-primary">{t.en}</td>
                    <td className="p-4 text-sm"><input type="text" defaultValue={t.bn} className="input-field !py-1 text-sm" /></td>
                    <td className="p-4 text-center"><Button size="sm" variant="ghost">{lang === "bn" ? "সেভ" : "Save"}</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

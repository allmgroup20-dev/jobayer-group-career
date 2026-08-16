"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface TranslationRow {
  translation_key: string;
  en_text: string;
  bn_text: string | null;
  category: string;
}

export default function CompanyTranslationsPage() {
  const { lang } = useLanguageStore();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<TranslationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newEn, setNewEn] = useState("");
  const [newBn, setNewBn] = useState("");
  const debouncedSearch = useDebounce(search);

  const load = () => {
    setLoading(true);
    fetch("/api/translations")
      .then(r => r.json().catch(() => null))
      .then(d => { if (d && Array.isArray((d as { translations?: TranslationRow[] }).translations)) setRows((d as { translations: TranslationRow[] }).translations); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(
    () => rows.filter((t) => t.translation_key.includes(debouncedSearch) || (t.en_text || "").toLowerCase().includes(debouncedSearch.toLowerCase())),
    [rows, debouncedSearch]
  );

  const updateRow = (key: string, field: "en_text" | "bn_text", value: string) => {
    setRows(prev => prev.map(r => (r.translation_key === key ? { ...r, [field]: value } : r)));
  };

  const saveRow = async (key: string) => {
    const row = rows.find(r => r.translation_key === key);
    if (!row) return;
    setSaving(key);
    try {
      await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ translationKey: row.translation_key, enText: row.en_text, bnText: row.bn_text, category: row.category }),
      });
    } finally {
      setSaving(null);
    }
  };

  const deleteRow = async (key: string) => {
    await fetch("/api/translations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ translationKey: key }),
    });
    setRows(prev => prev.filter(r => r.translation_key !== key));
  };

  const addRow = async () => {
    if (!newKey.trim() || !newEn.trim()) return;
    await fetch("/api/translations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ translationKey: newKey.trim(), enText: newEn, bnText: newBn, category: "general" }),
    });
    setNewKey(""); setNewEn(""); setNewBn("");
    load();
  };

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

        <Card className="mb-6 !p-4">
          <h3 className="font-bold text-primary mb-3">{lang === "bn" ? "নতুন অনুবাদ" : "New Translation"}</h3>
          <div className="flex flex-wrap gap-3">
            <input type="text" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder={lang === "bn" ? "কী (Key)" : "Key"} className="input-field w-44" />
            <input type="text" value={newEn} onChange={(e) => setNewEn(e.target.value)} placeholder="English" className="input-field flex-1" />
            <input type="text" value={newBn} onChange={(e) => setNewBn(e.target.value)} placeholder="বাংলা" className="input-field flex-1" />
            <Button onClick={addRow}>{lang === "bn" ? "যোগ করুন" : "Add"}</Button>
          </div>
        </Card>

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
                {loading ? (
                  <tr><td colSpan={4} className="p-4 text-center text-sm text-text-secondary">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-sm text-text-secondary">{lang === "bn" ? "কিছু পাওয়া যায়নি" : "Nothing found"}</td></tr>
                ) : filtered.map((t) => (
                  <tr key={t.translation_key} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    <td className="p-4 text-sm font-mono text-text-secondary">{t.translation_key}</td>
                    <td className="p-4">
                      <input type="text" value={t.en_text} onChange={(e) => updateRow(t.translation_key, "en_text", e.target.value)} className="input-field !py-1 text-sm" />
                    </td>
                    <td className="p-4">
                      <input type="text" value={t.bn_text ?? ""} onChange={(e) => updateRow(t.translation_key, "bn_text", e.target.value)} className="input-field !py-1 text-sm" />
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="ghost" disabled={saving === t.translation_key} onClick={() => saveRow(t.translation_key)}>
                          {saving === t.translation_key ? "..." : (lang === "bn" ? "সেভ" : "Save")}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteRow(t.translation_key)}>🗑</Button>
                      </div>
                    </td>
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
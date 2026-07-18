"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSWRFetch } from "@/lib/use-swr-fetch";

interface CourseCategory {
  id: number;
  name: string;
  nameBn: string | null;
  icon: string;
  isVisible: number;
  createdAt: string;
}

const emptyForm = () => ({ name: "", nameBn: "", icon: "📌", isVisible: 1 });

export default function CourseCategoriesPage() {
  const { lang } = useLanguageStore();
  const { data, loading, refresh } = useSWRFetch<{ categories?: CourseCategory[] }>(
    "/api/courses/categories",
    { ttlMs: 60_000 }
  );
  const categories = data?.categories ?? [];

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setForm(emptyForm()); setEditingId(null); setShowAdd(false); setError("");
  };

  const startEdit = (cat: CourseCategory) => {
    setForm({ name: cat.name, nameBn: cat.nameBn || "", icon: cat.icon || "📌", isVisible: cat.isVisible });
    setEditingId(cat.id); setShowAdd(true); setError("");
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const payload = {
        name: form.name, nameBn: form.nameBn || null, icon: form.icon || "📌", isVisible: form.isVisible,
      };

      const url = editingId ? `/api/courses/categories/${editingId}` : "/api/courses/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");

      refresh(); resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(lang === "bn" ? "নিশ্চিতভাবে ক্যাটাগরি ডিলিট করবেন? (এই ক্যাটাগরির সব কোর্স আনক্যাটেগরাইজড হবে)" : "Are you sure you want to delete this category? (All courses in this category will be uncategorized)")) return;
    try { const res = await fetch(`/api/courses/categories/${id}`, { method: "DELETE" }); if (res.ok) refresh(); } catch {}
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "কোর্স ক্যাটাগরি" : "Course Categories"}</h1>
            <p className="text-sm text-text-secondary mt-1">{categories.length} {lang === "bn" ? "টি ক্যাটাগরি" : "categories"}</p>
          </div>
          <Button onClick={() => { resetForm(); setShowAdd(!showAdd); }}>
            {lang === "bn" ? "নতুন ক্যাটাগরি" : "Add Category"}
          </Button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

        {showAdd && (
          <Card className="mb-6 animate-fade-up">
            <h3 className="font-bold text-primary mb-4">
              {editingId ? (lang === "bn" ? "ক্যাটাগরি সম্পাদনা করুন" : "Edit Category") : (lang === "bn" ? "নতুন ক্যাটাগরি যোগ করুন" : "Add New Category")}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder={lang === "bn" ? "নাম (ইংরেজি)" : "Name (EN)"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
              <input type="text" placeholder={lang === "bn" ? "নাম (বাংলা)" : "Name (BN)"} value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} className="input-field" />
              <input type="text" placeholder={lang === "bn" ? "আইকন (ইমোজি)" : "Icon (Emoji)"} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field" />
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.isVisible === 1} onChange={(e) => setForm({ ...form, isVisible: e.target.checked ? 1 : 0 })} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-text-secondary">{lang === "bn" ? "দৃশ্যমান" : "Visible"}</span>
              </label>
            </div>
            <div className="flex gap-2 justify-end border-t border-border pt-4">
              <Button variant="ghost" onClick={resetForm}>{lang === "bn" ? "বাতিল" : "Cancel"}</Button>
              <Button onClick={handleSave} disabled={saving || !form.name}>
                {saving ? (lang === "bn" ? "সংরক্ষণ..." : "Saving...") : (lang === "bn" ? "সেভ করুন" : "Save")}
              </Button>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "ক্যাটাগরি" : "Category"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "আইকন" : "Icon"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "দৃশ্যমান" : "Visible"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "কাজ" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    <td className="p-4 text-sm font-medium text-primary">
                      {lang === "bn" && cat.nameBn ? cat.nameBn : cat.name}
                    </td>
                    <td className="p-4 text-center text-lg">{cat.icon || "📌"}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          fetch(`/api/courses/categories/${cat.id}`, {
                            method: "PUT", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isVisible: cat.isVisible ? 0 : 1 }),
                          }).then(() => refresh()).catch(() => {});
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.isVisible ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400"}`}
                      >
                        {cat.isVisible ? (lang === "bn" ? "হ্যাঁ" : "Yes") : (lang === "bn" ? "না" : "No")}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => startEdit(cat)} className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded">✏️</button>
                        <button onClick={() => handleDelete(cat.id)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-secondary text-sm">
                      {lang === "bn" ? "কোনো ক্যাটাগরি নেই।" : "No categories found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

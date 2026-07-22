"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

interface KnowledgeEntry {
  id: number;
  category: string;
  subcategory: string | null;
  title: string;
  content: string;
  source_type: string | null;
  source_name: string | null;
  source_url: string | null;
  confidence: number;
  tags: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

interface KnowledgeStats {
  total: number;
  byCategory: Record<string, number>;
  avgConfidence: number;
}

const CATEGORIES = ["all", "psychology", "sales", "marketing", "communication", "trust", "strategy", "safety", "general"];

export default function KnowledgePage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";

  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"browse" | "add">("browse");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    inserted: number; skipped: number; total: number;
    books: { sourceName: string; total: number; inserted: number; skipped: number }[];
  } | null>(null);
  const [form, setForm] = useState({
    category: "psychology", subcategory: "", title: "", content: "",
    sourceType: "book", sourceName: "", sourceUrl: "", confidence: 0.85,
    tags: "",
  });

  const CATEGORY_COLORS: Record<string, string> = {
    psychology: "bg-purple-100 text-purple-700",
    sales: "bg-green-100 text-green-700",
    marketing: "bg-blue-100 text-blue-700",
    communication: "bg-cyan-100 text-cyan-700",
    trust: "bg-amber-100 text-amber-700",
    strategy: "bg-indigo-100 text-indigo-700",
    safety: "bg-red-100 text-red-700",
    general: "bg-gray-100 text-gray-700",
  };

  const fetchData = useCallback(async (category?: string, search?: string) => {
    setLoading(true);
    try {
      let url = "/api/knowledge/entries?limit=200";
      if (category && category !== "all") url += `&category=${category}`;
      if (search) url += `&q=${encodeURIComponent(search)}`;

      const [entriesRes, statsRes] = await Promise.all([
        fetch(url),
        fetch("/api/knowledge/summary"),
      ]);
      if (entriesRes.ok) {
        const data: any = await entriesRes.json();
        setEntries(data.entries || []);
      }
      if (statsRes.ok) {
        const data: any = await statsRes.json();
        setStats(data);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(filterCategory, searchQuery);
  };

  const handleCategoryChange = (cat: string) => {
    setFilterCategory(cat);
    setSearchQuery("");
    fetchData(cat);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = {
        category: form.category,
        subcategory: form.subcategory || undefined,
        title: form.title,
        content: form.content,
        sourceType: form.sourceType || undefined,
        sourceName: form.sourceName || undefined,
        sourceUrl: form.sourceUrl || undefined,
        confidence: form.confidence,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      };
      const res = await fetch("/api/knowledge/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        resetForm();
        fetchData(filterCategory);
        setTab("browse");
      } else {
        const dataRes: any = await res.json();
        alert(dataRes.error || "Failed to add");
      }
    } catch {
      alert("Failed to add knowledge entry");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      const body: any = {
        id: editId,
        category: form.category,
        subcategory: form.subcategory || undefined,
        title: form.title,
        content: form.content,
        source_type: form.sourceType || undefined,
        source_name: form.sourceName || undefined,
        source_url: form.sourceUrl || undefined,
        confidence: form.confidence,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      };
      const res = await fetch("/api/knowledge/entries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditId(null);
        resetForm();
        fetchData(filterCategory);
        setTab("browse");
      } else {
        const dataRes: any = await res.json();
        alert(dataRes.error || "Failed to update");
      }
    } catch {
      alert("Failed to update knowledge entry");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isBn ? "নিশ্চিতভাবে মুছবেন?" : "Delete this knowledge entry?")) return;
    try {
      const res = await fetch(`/api/knowledge/entries?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData(filterCategory);
    } catch {}
  };

  const startEdit = (entry: KnowledgeEntry) => {
    setEditId(entry.id);
    setForm({
      category: entry.category,
      subcategory: entry.subcategory || "",
      title: entry.title,
      content: entry.content,
      sourceType: entry.source_type || "book",
      sourceName: entry.source_name || "",
      sourceUrl: entry.source_url || "",
      confidence: entry.confidence,
      tags: entry.tags ? JSON.parse(entry.tags).join(", ") : "",
    });
    setTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSeed = async () => {
    if (!confirm(isBn ? "ডিফল্ট বইয়ের এন্ট্রি সিড করবেন? (ডুপ্লিকেট স্কিপ হবে)" : "Seed default book entries? (duplicates will be skipped)")) return;
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/knowledge/seed");
      const data: any = await res.json();
      if (data.books) {
        setSeedResult({ inserted: data.inserted, skipped: data.skipped, total: data.total, books: data.books });
      } else {
        alert(data.message || data.error || "Done");
      }
      fetchData(filterCategory);
    } catch {
      alert("Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ category: "psychology", subcategory: "", title: "", content: "", sourceType: "book", sourceName: "", sourceUrl: "", confidence: 0.85, tags: "" });
  };

  const renderSummary = () => {
    if (!stats) return null;
    const sortedCats = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-primary/5 to-info/5 rounded-2xl border border-border p-5 text-center">
          <p className="text-3xl font-black text-primary">{stats.total}</p>
          <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "মোট এন্ট্রি" : "Total Entries"}</p>
        </div>
        <div className="bg-gradient-to-br from-amber/5 to-orange/5 rounded-2xl border border-border p-5 text-center">
          <p className="text-3xl font-black text-amber-600">{(stats.avgConfidence * 100).toFixed(0)}%</p>
          <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "গড় আত্মবিশ্বাস" : "Avg Confidence"}</p>
        </div>
        <div className="md:col-span-2 bg-white rounded-2xl border border-border p-4">
          <h3 className="text-xs font-bold text-text mb-2">{isBn ? "বিভাগ অনুযায়ী" : "By Category"}</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {sortedCats.slice(0, 8).map(([cat, count]) => (
              <div key={cat} className="flex justify-between items-center py-0.5 border-b border-border/30 last:border-0">
                <span className="text-xs capitalize text-text-secondary">{cat}</span>
                <span className="text-xs font-bold text-primary">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBrowse = () => (
    <div>
      {renderSummary()}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={isBn ? "শিরোনাম, ট্যাগ বা বিষয়বস্তু খুঁজুন..." : "Search by title, tags or content..."} />
          <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors">
            🔍
          </button>
        </form>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterCategory === cat ? "bg-primary text-white" : "bg-primary/5 text-text-secondary hover:bg-primary/10"
            }`}>
            {isBn
              ? (cat === "all" ? "সব" : cat === "psychology" ? "মনস্তত্ত্ব" : cat === "sales" ? "বিক্রয়" : cat === "marketing" ? "মার্কেটিং" : cat === "communication" ? "যোগাযোগ" : cat === "trust" ? "আস্থা" : cat === "strategy" ? "কৌশল" : cat === "safety" ? "নিরাপত্তা" : "সাধারণ")
              : (cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1))}
          </button>
        ))}
      </div>

      {/* Entries */}
      {loading ? (
        <Skeleton className="h-60 w-full rounded-2xl" />
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-border">
          <p className="text-3xl mb-2">🧠</p>
          <p className="text-sm text-text-secondary">{isBn ? "কোনো নলেজ এন্ট্রি পাওয়া যায়নি" : "No knowledge entries found"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[entry.category] || "bg-gray-100 text-gray-700"}`}>
                      {entry.category}
                    </span>
                    <span className="text-xs text-text-secondary/50">{entry.created_at?.split("T")[0] || entry.created_at?.slice(0, 10)}</span>
                    {entry.source_name && <span className="text-[10px] text-text-secondary/40 truncate max-w-[200px]">{entry.source_name}</span>}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/5 text-primary">{(entry.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-sm font-bold text-text mt-1">{entry.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); startEdit(entry); }}
                    className="text-[10px] text-primary/60 hover:text-primary transition-colors px-2 py-1 rounded hover:bg-primary/5">
                    {isBn ? "সম্পাদনা" : "Edit"}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                    className="text-[10px] text-error/60 hover:text-error transition-colors px-2 py-1 rounded hover:bg-error/5">
                    {isBn ? "মুছুন" : "Delete"}
                  </button>
                  <span className="text-text-secondary/40 text-lg">{expandedId === entry.id ? "−" : "+"}</span>
                </div>
              </button>
              {expandedId === entry.id && (
                <div className="px-4 pb-4 pt-0 border-t border-border/40">
                  <div className="mt-3 bg-primary/5 rounded-xl p-4">
                    <p className="text-xs font-bold text-text mb-2">{isBn ? "বিষয়বস্তু" : "Content"}:</p>
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-[10px] text-text-secondary/60">
                    <div><span className="font-medium text-text">{isBn ? "উৎস" : "Source"}:</span> {entry.source_name || entry.source_type || "—"}</div>
                    <div><span className="font-medium text-text">{isBn ? "উপবিভাগ" : "Subcategory"}:</span> {entry.subcategory || "—"}</div>
                    <div><span className="font-medium text-text">{isBn ? "আত্মবিশ্বাস" : "Confidence"}:</span> {(entry.confidence * 100).toFixed(0)}%</div>
                    <div><span className="font-medium text-text">{isBn ? "ভার্সন" : "Version"}:</span> {entry.version}</div>
                  </div>
                  {entry.tags && (
                    <div className="flex gap-1.5 flex-wrap mt-3">
                      {JSON.parse(entry.tags).map((tag: string, i: number) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary/60">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <form onSubmit={editId ? handleUpdate : handleAdd} className="space-y-4 max-w-3xl bg-white rounded-2xl border border-border p-6">
      <h2 className="text-lg font-bold text-text">
        {editId
          ? (isBn ? "✏️ এন্ট্রি সম্পাদনা করুন" : "✏️ Edit Entry")
          : (isBn ? "➕ নতুন নলেজ এন্ট্রি" : "➕ New Knowledge Entry")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "বিভাগ" : "Category"} *</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            {CATEGORIES.filter(c => c !== "all").map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "উপবিভাগ" : "Subcategory"}</label>
          <input value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={isBn ? "যেমন: হুক মডেল" : "e.g. Hook Model"} />
        </div>
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "আত্মবিশ্বাস" : "Confidence"}</label>
          <input type="number" min="0" max="1" step="0.05" value={form.confidence}
            onChange={e => setForm(f => ({ ...f, confidence: parseFloat(e.target.value) || 0.5 }))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "উৎসের ধরন" : "Source Type"}</label>
          <select value={form.sourceType} onChange={e => setForm(f => ({ ...f, sourceType: e.target.value }))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            {["book", "training", "system", "research", "article", "course"].map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "উৎসের নাম" : "Source Name"}</label>
          <input value={form.sourceName} onChange={e => setForm(f => ({ ...f, sourceName: e.target.value }))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={isBn ? "যেমন: হুকড বাই নির ইয়াল" : "e.g. Hooked by Nir Eyal"} />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "শিরোনাম" : "Title"} *</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder={isBn ? "নলেজ এন্ট্রির শিরোনাম" : "Knowledge entry title"} />
      </div>

      <div>
        <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "বিষয়বস্তু" : "Content"} *</label>
        <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required rows={6}
          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y font-mono"
          placeholder={isBn ? "বিস্তারিত বিষয়বস্তু..." : "Detailed knowledge content..."} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "ট্যাগ" : "Tags"}</label>
          <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={isBn ? "কমা দিয়ে আলাদা করুন" : "Comma separated"} />
        </div>
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "সোর্স ইউআরএল" : "Source URL"}</label>
          <input value={form.sourceUrl} onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit"
          className="bg-primary text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
          {editId
            ? (isBn ? "💾 আপডেট করুন" : "💾 Update Entry")
            : (isBn ? "✅ যোগ করুন" : "✅ Add Entry")}
        </button>
        {editId && (
          <button type="button" onClick={() => { resetForm(); setTab("browse"); }}
            className="bg-gray-100 text-text-secondary text-sm font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors">
            {isBn ? "বাতিল" : "Cancel"}
          </button>
        )}
      </div>
    </form>
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-text">{isBn ? "🧠 নলেজ ব্রেইন" : "🧠 Knowledge Brain"}</h1>
          <p className="text-xs text-text-secondary/70 mt-1">
            {isBn ? "AI এজেন্টদের জন্য কেন্দ্রীয় জ্ঞান ভান্ডার — বই, প্রশিক্ষণ ও গবেষণা" : "Central knowledge repository for AI agents — books, training & research"}
          </p>
        </div>
        <button onClick={handleSeed} disabled={seeding}
          className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold rounded-xl hover:bg-amber-100 transition-colors shrink-0 disabled:opacity-50">
          {seeding ? (isBn ? "⏳ সিড হচ্ছে..." : "⏳ Seeding...") : (isBn ? "📚 বই সিড করুন" : "📚 Seed Books")}
        </button>
      </div>

      {/* Seed Result Panel */}
      {seedResult && (
        <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-green-800">{isBn ? "📚 সিড সম্পন্ন!" : "📚 Seeding Complete!"}</h3>
              <p className="text-xs text-green-600 mt-0.5">
                {isBn
                  ? `${seedResult.inserted}টি নতুন (${seedResult.skipped}টি স্কিপ) — মোট ${seedResult.total}টি`
                  : `${seedResult.inserted} new (${seedResult.skipped} skipped) — ${seedResult.total} total`}
              </p>
            </div>
            <button onClick={() => setSeedResult(null)} className="text-green-400 hover:text-green-600 text-lg leading-none">&times;</button>
          </div>
          <div className="space-y-1.5">
            {seedResult.books.map((book, i) => (
              <div key={i} className="flex items-center justify-between bg-white/60 rounded-xl px-3 py-2 text-xs">
                <span className="font-medium text-green-900 truncate mr-2 flex-1">{book.sourceName}</span>
                <span className="flex items-center gap-3 shrink-0">
                  {book.inserted > 0 && <span className="text-green-600 font-bold">+{book.inserted}</span>}
                  {book.skipped > 0 && <span className="text-amber-500 text-[10px]">{book.skipped} dup</span>}
                  <span className="text-green-400 font-mono">{book.total} ch.</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-border pb-3">
        {(["browse", "add"] as const).map(t => (
          <button key={t} onClick={() => { if (t === "browse") resetForm(); setTab(t); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === t ? "bg-primary text-white" : "bg-primary/5 text-text-secondary hover:bg-primary/10"}`}>
            {t === "browse" ? (isBn ? "ব্রাউজ" : "Browse") : (editId ? (isBn ? "সম্পাদনা" : "Edit") : (isBn ? "যোগ করুন" : "Add Entry"))}
          </button>
        ))}
      </div>

      {tab === "browse" ? renderBrowse() : renderForm()}
    </div>
  );
}

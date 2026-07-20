"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

interface TrainingEntry {
  id: number; sourceType: string; sourceId: string; sourceName: string | null;
  targetType: string; targetId: string; targetName: string | null;
  knowledgeTitle: string; knowledgeContent: string; knowledgeCategory: string;
  origin: string; confidence: number; createdAt: string;
}

interface Summary {
  total: number;
  byCategory: { knowledge_category: string; count: number }[];
  bySource: { source_name: string; count: number }[];
}

const CATEGORIES = ["all", "positioning", "psychology", "sales", "communication", "safety", "strategy", "general"];

export default function TrainingTab() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [entries, setEntries] = useState<TrainingEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"browse" | "add">("browse");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    sourceType: "training", sourceId: "", sourceName: "",
    targetType: "agent", targetId: "all", targetName: "",
    knowledgeTitle: "", knowledgeContent: "", knowledgeCategory: "psychology",
  });

  const fetchData = async (category?: string) => {
    setLoading(true);
    try {
      const catParam = category && category !== "all" ? `&category=${category}` : "";
      const [entriesRes, summaryRes] = await Promise.all([
        fetch(`/api/company/training-modules?view=list${catParam}`),
        fetch("/api/company/training-modules?view=summary"),
      ]);
      if (entriesRes.ok) { const d: any = await entriesRes.json(); setEntries(d.entries || []); }
      if (summaryRes.ok) { const d: any = await summaryRes.json(); setSummary(d.summary || null); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCategoryChange = (cat: string) => { setFilterCategory(cat); fetchData(cat); };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/company/training-modules", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ sourceType: "training", sourceId: "", sourceName: "", targetType: "agent", targetId: "all", targetName: "", knowledgeTitle: "", knowledgeContent: "", knowledgeCategory: "psychology" });
        fetchData(filterCategory); setTab("browse");
      } else { const d: any = await res.json(); alert(d.error || "Failed to add"); }
    } catch { alert("Failed to add training module"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isBn ? "নিশ্চিতভাবে মুছবেন?" : "Delete this training module?")) return;
    try { const res = await fetch(`/api/company/training-modules?id=${id}`, { method: "DELETE" }); if (res.ok) fetchData(filterCategory); } catch {}
  };

  const renderSummary = () => {
    if (!summary) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-primary/5 to-info/5 rounded-2xl border border-border p-5 text-center">
          <p className="text-3xl font-black text-primary">{summary.total}</p>
          <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "মোট মডিউল" : "Total Modules"}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="text-xs font-bold text-text mb-3">{isBn ? "বিভাগ অনুযায়ী" : "By Category"}</h3>
          {summary.byCategory.map(c => (
            <div key={c.knowledge_category} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
              <span className="text-sm capitalize text-text-secondary">{c.knowledge_category}</span>
              <span className="text-sm font-bold text-primary">{c.count}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="text-xs font-bold text-text mb-3">{isBn ? "উৎস অনুযায়ী" : "By Source"}</h3>
          {summary.bySource.map(s => (
            <div key={s.source_name} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
              <span className="text-sm text-text-secondary truncate max-w-[180px]">{s.source_name}</span>
              <span className="text-sm font-bold text-primary">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBrowse = () => (
    <div>
      {renderSummary()}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === cat ? "bg-primary text-white" : "bg-primary/5 text-text-secondary hover:bg-primary/10"}`}>
            {isBn ? (cat === "all" ? "সব" : cat === "positioning" ? "পজিশনিং" : cat === "psychology" ? "মনস্তত্ত্ব" : cat === "sales" ? "বিক্রয়" : cat === "communication" ? "যোগাযোগ" : cat === "safety" ? "নিরাপত্তা" : cat === "strategy" ? "কৌশল" : "সাধারণ") : (cat === "all" ? "All" : cat === "positioning" ? "Positioning" : cat.charAt(0).toUpperCase() + cat.slice(1))}
          </button>
        ))}
      </div>
      {loading ? <Skeleton className="h-60 w-full rounded-2xl" /> : entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-border">
          <p className="text-3xl mb-2">📚</p>
          <p className="text-sm text-text-secondary">{isBn ? "কোনো প্রশিক্ষণ মডিউল পাওয়া যায়নি" : "No training modules found"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white rounded-2xl border border-border overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${entry.knowledgeCategory === "positioning" ? "bg-amber-100 text-amber-700" : entry.knowledgeCategory === "psychology" ? "bg-purple-100 text-purple-700" : entry.knowledgeCategory === "sales" ? "bg-green-100 text-green-700" : entry.knowledgeCategory === "communication" ? "bg-blue-100 text-blue-700" : entry.knowledgeCategory === "safety" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{entry.knowledgeCategory}</span>
                    <span className="text-xs text-text-secondary/50">{entry.createdAt?.split("T")[0] || entry.createdAt?.slice(0, 10)}</span>
                    {entry.sourceName && <span className="text-[10px] text-text-secondary/40">{entry.sourceName}</span>}
                  </div>
                  <p className="text-sm font-bold text-text mt-1">{entry.knowledgeTitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                    className="text-[10px] text-error/60 hover:text-error transition-colors px-2 py-1 rounded hover:bg-error/5">{isBn ? "মুছুন" : "Delete"}</button>
                  <span className="text-text-secondary/40 text-lg">{expandedId === entry.id ? "−" : "+"}</span>
                </div>
              </button>
              {expandedId === entry.id && (
                <div className="px-4 pb-4 pt-0 border-t border-border/40">
                  <div className="mt-3 bg-primary/5 rounded-xl p-4">
                    <p className="text-xs font-bold text-text mb-2">{isBn ? "বিষয়বস্তু" : "Content"}:</p>
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{entry.knowledgeContent}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3 text-[10px] text-text-secondary/60">
                    <div><span className="font-medium text-text">{isBn ? "উৎস" : "Source"}:</span> {entry.sourceName || entry.sourceId}</div>
                    <div><span className="font-medium text-text">{isBn ? "লক্ষ্য" : "Target"}:</span> {entry.targetName || entry.targetId}</div>
                    <div><span className="font-medium text-text">{isBn ? "আত্মবিশ্বাস" : "Confidence"}:</span> {(entry.confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAddForm = () => (
    <form onSubmit={handleAdd} className="space-y-4 max-w-2xl bg-white rounded-2xl border border-border p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "বিভাগ" : "Category"} *</label>
          <select value={form.knowledgeCategory} onChange={e => setForm(f => ({ ...f, knowledgeCategory: e.target.value }))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            {CATEGORIES.filter(c => c !== "all").map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "উৎসের নাম" : "Source Name"}</label>
          <input value={form.sourceName} onChange={e => setForm(f => ({ ...f, sourceName: e.target.value }))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={isBn ? "যেমন: টকিং উইথ সাইকোপ্যাথস" : "e.g. Talking with Psychopaths"} />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "শিরোনাম" : "Title"} *</label>
        <input value={form.knowledgeTitle} onChange={e => setForm(f => ({ ...f, knowledgeTitle: e.target.value }))} required
          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder={isBn ? "প্রশিক্ষণ মডিউলের শিরোনাম" : "Training module title"} />
      </div>
      <div>
        <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "বিষয়বস্তু" : "Content"} *</label>
        <textarea value={form.knowledgeContent} onChange={e => setForm(f => ({ ...f, knowledgeContent: e.target.value }))} required rows={5}
          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
          placeholder={isBn ? "প্রশিক্ষণ মডিউলের বিস্তারিত বিষয়বস্তু..." : "Detailed training module content..."} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "লক্ষ্য আইডি" : "Target ID"}</label>
          <input value={form.targetId} onChange={e => setForm(f => ({ ...f, targetId: e.target.value }))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={isBn ? "যেমন: vulnerability_detector" : "e.g. vulnerability_detector"} />
        </div>
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">{isBn ? "উৎস আইডি" : "Source ID"}</label>
          <input value={form.sourceId} onChange={e => setForm(f => ({ ...f, sourceId: e.target.value }))}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={isBn ? "যেমন: training_module_1" : "e.g. training_module_1"} />
        </div>
      </div>
      <button type="submit" className="bg-primary text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors w-full md:w-auto">
        {isBn ? "✅ প্রশিক্ষণ মডিউল যোগ করুন" : "✅ Add Training Module"}
      </button>
    </form>
  );

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-border pb-3">
        {(["browse", "add"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === t ? "bg-primary text-white" : "bg-primary/5 text-text-secondary hover:bg-primary/10"}`}>
            {t === "browse" ? (isBn ? "ব্রাউজ" : "Browse") : (isBn ? "যোগ করুন" : "Add Module")}
          </button>
        ))}
      </div>
      {tab === "browse" ? renderBrowse() : renderAddForm()}
    </div>
  );
}

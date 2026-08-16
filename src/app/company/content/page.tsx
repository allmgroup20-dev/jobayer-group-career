"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-content-defaults";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero সেকশন",
  faq: "FAQ (সচরাচর জিজ্ঞাসা)",
  testimonials: "টেস্টিমোনিয়াল",
  course_preview: "কোর্স / ট্রেইনার / প্ল্যাটফর্ম প্রিভিউ",
  trust: "ট্রাস্ট সেকশন",
  how_it_works: "হাউ-ইট-ওয়ার্কস",
  gallery: "পেমেন্ট গ্যালারি",
  live_feed: "লাইভ ফিড (বোনাস/নোটিফিকেশন)",
  pricing: "প্রাইসিং টায়ার",
};

function prettyLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim().replace(/^./, c => c.toUpperCase());
}

function FieldEditor({ name, value, onChange }: { name: string; value: unknown; onChange: (v: unknown) => void }) {
  if (Array.isArray(value)) {
    const allPrimitive = value.every(v => v === null || typeof v !== "object");
    if (allPrimitive) {
      const text = value.map(String).join("\n");
      return (
        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1">{prettyLabel(name)}</label>
          <textarea
            value={text}
            rows={Math.max(2, Math.min(8, value.length))}
            onChange={(e) => {
              const lines = e.target.value.split("\n").map(s => s.trim()).filter(Boolean);
              const typed = (value.length > 0 && typeof value[0] === "number")
                ? lines.map(n => Number(n))
                : lines;
              onChange(typed);
            }}
            className="input-field font-mono text-xs"
            placeholder="প্রতি লাইনে একটি করে"
          />
        </div>
      );
    }
    return (
      <div className="space-y-2 border border-border rounded-xl p-3 bg-bg/40">
        <label className="block text-xs font-bold text-text-secondary">{prettyLabel(name)} ({value.length})</label>
        {value.map((item, i) => (
          <div key={i} className="space-y-2 border border-border/70 rounded-lg p-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary">#{i + 1}</span>
              <button
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="text-xs font-bold text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
              >
                ✕ সরান
              </button>
            </div>
            <FieldEditor name="" value={item} onChange={(nv) => onChange(value.map((x, j) => (j === i ? nv : x)))} />
          </div>
        ))}
        <button
          onClick={() => {
            const proto = value.length > 0 && typeof value[value.length - 1] === "object" && value[value.length - 1] !== null
              ? JSON.parse(JSON.stringify(value[value.length - 1]))
              : {};
            onChange([...value, proto]);
          }}
          className="text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 rounded-lg px-3 py-2 border-none cursor-pointer"
        >
          + আইটেম যোগ করুন
        </button>
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    return (
      <div className="space-y-3 border border-border rounded-xl p-3 bg-bg/40">
        {name && <label className="block text-xs font-bold text-text-secondary">{prettyLabel(name)}</label>}
        {Object.entries(value).map(([k, v]) => (
          <FieldEditor key={k} name={k} value={v} onChange={(nv) => onChange({ ...value, [k]: nv })} />
        ))}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm font-semibold text-text">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-action" />
        {prettyLabel(name)}
      </label>
    );
  }

  return (
    <div>
      <label className="block text-xs font-bold text-text-secondary mb-1">{prettyLabel(name)}</label>
      <input
        type={typeof value === "number" ? "number" : "text"}
        value={String(value)}
        onChange={(e) => onChange(typeof value === "number" ? Number(e.target.value) : e.target.value)}
        className="input-field text-sm"
      />
    </div>
  );
}

export default function CompanyContentPage() {
  const { lang } = useLanguageStore();
  const sections = useMemo(() => Object.keys(SITE_CONTENT_DEFAULTS), []);
  const [active, setActive] = useState(sections[0]);
  const [content, setContent] = useState<Record<string, unknown>>(() =>
    JSON.parse(JSON.stringify(SITE_CONTENT_DEFAULTS))
  );
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setSavedMsg(false);
    fetch(`/api/site-content?section=${active}`)
      .then(r => r.json().catch(() => null))
      .then(d => {
        const data = d as { content?: Record<string, unknown>; enabled?: boolean } | null;
        if (data && data.content && typeof data.content === "object") {
          const fetched = data.content;
          setContent(prev => {
            const merged = JSON.parse(JSON.stringify(SITE_CONTENT_DEFAULTS[active]));
            return { ...prev, [active]: deepAssign(merged, fetched) };
          });
        }
        if (data && typeof data.enabled === "boolean") setEnabled(data.enabled);
      })
      .catch(() => {});
  }, [active]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: active, content: content[active], enabled }),
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setContent(prev => ({ ...prev, [active]: JSON.parse(JSON.stringify(SITE_CONTENT_DEFAULTS[active])) }));
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "সাইট কন্টেন্ট" : "Site Content"}</h1>
            <p className="text-sm text-text-secondary mt-1">
              {lang === "bn" ? "সব পাবলিক কন্টেন্ট এখান থেকে এডিট করুন — হোমপেজ, প্রাইসিং, টেস্টিমোনিয়াল সহ" : "Edit all public content from here — homepage, pricing, testimonials & more"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="px-4 py-2 rounded-xl text-sm font-bold text-text-secondary bg-white border border-border hover:border-primary/30 transition-all cursor-pointer">
              {lang === "bn" ? "ডিফল্টে ফিরুন" : "Reset to Defaults"}
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all border-none cursor-pointer disabled:opacity-50"
            >
              {saving ? "..." : savedMsg ? "✓ Saved" : (lang === "bn" ? "সেভ করুন" : "Save")}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Section tabs */}
          <div className="md:w-60 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setActive(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border transition-all cursor-pointer ${
                  active === s ? "bg-primary text-white border-primary" : "bg-white text-text-secondary border-border hover:border-primary/30 hover:text-primary"
                }`}
              >
                {SECTION_LABELS[s] || s}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 bg-white rounded-2xl border border-border shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <h2 className="font-black text-primary text-lg">{SECTION_LABELS[active] || active}</h2>
              <label className="flex items-center gap-2 text-sm font-bold text-text cursor-pointer">
                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="w-4 h-4 accent-action" />
                {enabled ? (lang === "bn" ? "চালু" : "Enabled") : (lang === "bn" ? "বন্ধ" : "Disabled")}
              </label>
            </div>
            <FieldEditor name="" value={content[active]} onChange={(nv) => setContent(prev => ({ ...prev, [active]: nv }))} />
          </div>
        </div>
      </div>
    </div>
  );
}

function deepAssign(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const b = base[key];
    const o = override[key];
    if (typeof o === "object" && o !== null && !Array.isArray(o) && typeof b === "object" && b !== null && !Array.isArray(b)) {
      out[key] = deepAssign(b as Record<string, unknown>, o as Record<string, unknown>);
    } else if (o !== undefined) {
      out[key] = o;
    }
  }
  return out;
}
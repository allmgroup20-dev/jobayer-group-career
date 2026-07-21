"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"

interface Quadrant {
  key: string; label: string; labelBn: string; color: string; icon: string; desc: string; descBn: string; questions: string[]; platformExamples: string[]
}

export default function ERRCPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [quadrants, setQuadrants] = useState<Quadrant[]>([])
  const [loading, setLoading] = useState(true)
  const [inputs, setInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/strategy/errc-grid")
        if (res.ok) {
          const json = await res.json() as { framework: { quadrants: Quadrant[] } }
          setQuadrants(json.framework?.quadrants ?? [])
        }
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-80 rounded-2xl" /></div>

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "ERRC গ্রিড" : "ERRC Grid"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "এলিমিনেট-রিডিউস-রেইজ-ক্রিয়েট — ভ্যালু ইনোভেশনের ৪-কোয়াড্রেন্ট টুল" : "Eliminate-Reduce-Raise-Create — The 4-Quadrant Tool for Value Innovation"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {quadrants.map((q) => (
          <div key={q.key} className="bg-white rounded-xl border border-border p-4" style={{ borderLeftColor: q.color, borderLeftWidth: 3 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{q.icon}</span>
              <h3 className="text-sm font-bold" style={{ color: q.color }}>{isBn ? q.labelBn : q.label}</h3>
            </div>
            <p className="text-[11px] text-text-secondary/80 mb-3">{isBn ? q.descBn : q.desc}</p>
            <div className="space-y-1 mb-3">
              {q.questions.map((qs, i) => (
                <p key={i} className="text-[10px] text-text-secondary/70 pl-2 border-l-2" style={{ borderColor: q.color }}>{qs}</p>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {q.platformExamples.map((ex, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${q.color}15`, color: q.color }}>{ex}</span>
              ))}
            </div>
            <textarea className="w-full mt-3 text-[11px] border border-border rounded-lg p-2 outline-none focus:border-primary resize-none" rows={2}
              placeholder={isBn ? `আমাদের জন্য ${q.labelBn} কী?` : `What to ${q.label} for us?`}
              value={inputs[q.key] ?? ""} onChange={(e) => setInputs((p) => ({ ...p, [q.key]: e.target.value }))} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-text mb-2">{isBn ? "কীভাবে ERRC ব্যবহার করবেন?" : "How to Use ERRC"}</h2>
        <p className="text-xs text-text-secondary/80 leading-relaxed">
          {isBn
            ? "১) আপনার শিল্পের প্রতিযোগীরা কী করে তা লিখুন। ২) প্রতিটি কোয়াড্রেন্ট পূরণ করুন: কী বাদ দেবেন, কী কমানো যেতে পারে, কী বাড়ানো দরকার, কী নতুন তৈরি করবেন। ৩) সব ৪টি একসাথে করুন — শুধু একটি নয়। ৪) ফলাফল হবে আপনার নতুন ভ্যালু কার্ভ — প্রতিযোগীদের থেকে আলাদা।"
            : "1) Map what competitors in your industry do. 2) Fill each quadrant: what to eliminate, reduce, raise, create. 3) Apply all 4 simultaneously — not just one. 4) The result is your new value curve — different from competitors."}
        </p>
      </div>
    </div>
  )
}

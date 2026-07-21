"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"

interface Hurdle {
  id: number; key: string; nameEn: string; nameBn: string; icon: string; descEn: string; descBn: string; solution: string; solutionBn: string; example: string; exampleBn: string
}

export default function TippingPointPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [hurdles, setHurdles] = useState<Hurdle[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/strategy/tipping-point")
        if (res.ok) {
          const json = await res.json() as { hurdles: Hurdle[] }
          setHurdles(json.hurdles ?? [])
        }
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4"><Skeleton className="h-8 w-80" /><Skeleton className="h-64 rounded-2xl" /></div>

  const hurdleIcons = ["🧠", "💰", "🔥", "🏛️"]

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "টিপিং পয়েন্ট লিডারশিপ" : "Tipping Point Leadership"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "৪টি সাংগঠনিক বাধা অতিক্রম করুন — ২০% প্রচেষ্টায় ৮০% ফলাফল" : "Overcome 4 Organizational Hurdles — 20% Effort for 80% Results"}</p>
      </div>

      <div className="space-y-3">
        {hurdles.map((h, i) => {
          const open = expanded === h.id
          return (
            <div key={h.id} className="bg-white rounded-xl border border-border overflow-hidden">
              <button onClick={() => setExpanded(open ? null : h.id)} className="w-full flex items-center gap-3 p-4 text-left">
                <span className="text-xl">{hurdleIcons[i]}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-text">{isBn ? h.nameBn : h.nameEn}</h3>
                  <p className="text-[11px] text-text-secondary/70">{isBn ? h.descBn : h.descEn}</p>
                </div>
                <span className={`text-text-secondary/50 transition ${open ? "rotate-180" : ""}`}>▼</span>
              </button>
              {open && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="p-3 bg-primary/5 rounded-xl">
                    <p className="text-[10px] font-bold text-primary/70 uppercase mb-1">{isBn ? "সমাধান" : "Solution"}</p>
                    <p className="text-[11px] text-text-secondary/90">{isBn ? h.solutionBn : h.solution}</p>
                  </div>
                  <div className="p-3 bg-accent/5 rounded-xl">
                    <p className="text-[10px] font-bold text-accent/70 uppercase mb-1">{isBn ? "উদাহরণ" : "Example"}</p>
                    <p className="text-[11px] text-text-secondary/90 italic">{isBn ? h.exampleBn : h.example}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

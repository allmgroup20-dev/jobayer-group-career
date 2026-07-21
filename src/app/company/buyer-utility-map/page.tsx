"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"

interface Stage {
  id: number; key: string; nameEn: string; nameBn: string; icon: string; descEn: string; descBn: string; blockers: string[]; ourEdge: string
}

export default function BuyerUtilityMapPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/strategy/buyer-utility-map")
        if (res.ok) {
          const json = await res.json() as { stages: Stage[] }
          setStages(json.stages ?? [])
        }
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4"><Skeleton className="h-8 w-80" /><Skeleton className="h-96 rounded-2xl" /></div>

  const cycleEmojis = ["🛒", "📦", "💻", "🧩", "🔧", "♻️"]

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "বায়ার ইউটিলিটি ম্যাপ" : "Buyer Utility Map"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "ক্রেতার অভিজ্ঞতা চক্রের ৬টি পর্যায় — প্রতিটি পর্যায়ে ইউটিলিটি ব্লকার সরান" : "6 Stages of the Buyer Experience Cycle — Remove Utility Blockers at Every Stage"}</p>
      </div>

      <div className="flex items-center justify-between mb-6 px-2">
        {stages.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-1">
            <span className="text-lg">{s.icon}</span>
            <span className="text-[8px] text-text-secondary/70 text-center leading-tight max-w-[50px]">{isBn ? s.nameBn : s.nameEn}</span>
            {i < stages.length - 1 && <span className="text-text-secondary/30 text-[10px]">→</span>}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {stages.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{s.icon}</span>
              <h3 className="text-sm font-bold text-text">{isBn ? s.nameBn : s.nameEn}</h3>
            </div>
            <p className="text-[11px] text-text-secondary/80 mb-3">{isBn ? s.descBn : s.descEn}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <div className="p-2.5 bg-error/5 rounded-lg">
                <p className="text-[9px] font-bold text-error/70 uppercase mb-1">{isBn ? "ব্লকার" : "Blockers"}</p>
                <div className="flex flex-wrap gap-1">
                  {s.blockers.map((b) => <span key={b} className="text-[9px] px-1.5 py-0.5 bg-error/10 text-error/80 rounded-full">{b}</span>)}
                </div>
              </div>
              <div className="p-2.5 bg-success/5 rounded-lg">
                <p className="text-[9px] font-bold text-success/70 uppercase mb-1">{isBn ? "আমাদের এজ" : "Our Edge"}</p>
                <p className="text-[10px] text-text-secondary/80">{s.ourEdge}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

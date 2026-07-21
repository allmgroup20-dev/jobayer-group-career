"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"

interface Tier {
  id: number; key: string; nameEn: string; nameBn: string; descEn: string; descBn: string; questions: string[]
}

interface Insight {
  tierId: number; exampleEn: string; exampleBn: string
}

export default function ThreeTiersPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [tiers, setTiers] = useState<Tier[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/strategy/three-tiers")
        if (res.ok) {
          const json = await res.json() as { tiers: Tier[]; insights: Insight[] }
          setTiers(json.tiers ?? [])
          setInsights(json.insights ?? [])
        }
      } catch {} finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <Skeleton className="h-8 w-80" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )

  const tierColors = ["#f59e0b", "#ef4444", "#10b981"]

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "অ-গ্রাহকের তিন স্তর" : "Three Tiers of Noncustomers"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">
          {isBn ? "লুকানো চাহিদা আবিষ্কার করুন — যারা এখনও আপনার গ্রাহক নয় তাদের বোঝার ফ্রেমওয়ার্ক" : "Discover Hidden Demand — A Framework for Understanding Those Who Aren't Yet Your Customers"}
        </p>
      </div>

      <div className="bg-gradient-to-br from-warning/5 to-success/5 rounded-2xl border border-border p-5 mb-6">
        <h2 className="text-sm font-bold text-text mb-2">{isBn ? "কেন অ-গ্রাহকদের দেখা জরুরি?" : "Why Look at Noncustomers?"}</h2>
        <p className="text-xs text-text-secondary/70 leading-relaxed">
          {isBn
            ? "বেশিরভাগ কোম্পানি শুধু বিদ্যমান গ্রাহকদের নিয়ে লড়াই করে (রেড ওশান)। ব্লু ওশান মানে নতুন চাহিদা তৈরি করা — এবং তা সম্ভব শুধুমাত্র অ-গ্রাহকদের বোঝার মাধ্যমে। যারা আপনার পণ্য ব্যবহার করে না তাদের কেন ব্যবহার করে না তা বুঝলেই আপনি নতুন বাজার স্পেস খুঁজে পাবেন।"
            : "Most companies fight over existing customers (red ocean). Blue ocean means creating new demand — possible only by understanding noncustomers. Understanding WHY people don't use your product reveals new market space."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {tiers.map((t, i) => (
          <div key={t.id} className="bg-white rounded-xl border border-border p-4 hover:shadow-sm transition" style={{ borderLeftColor: tierColors[i], borderLeftWidth: 3 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tierColors[i] }} />
              <h3 className="text-sm font-bold text-text">{isBn ? t.nameBn : t.nameEn}</h3>
            </div>
            <p className="text-xs text-text-secondary/80 mb-3">{isBn ? t.descBn : t.descEn}</p>
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] font-bold text-text-secondary/70 uppercase tracking-wider">{isBn ? "প্রশ্ন:" : "Key Questions:"}</p>
              {t.questions.map((q, j) => (
                <p key={j} className="text-[11px] text-text-secondary/80 pl-3 border-l-2 border-border">{q}</p>
              ))}
            </div>
            {insights.filter(in2 => in2.tierId === t.id).map((ins, j) => (
              <div key={j} className="p-2.5 bg-primary/5 rounded-lg">
                <p className="text-[11px] text-text-secondary/90 italic">{isBn ? ins.exampleBn : ins.exampleEn}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

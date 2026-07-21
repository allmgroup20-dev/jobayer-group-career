"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"

interface Principle {
  id: number; key: string; nameEn: string; nameBn: string; icon: string; color: string; descEn: string; descBn: string; why: string; whyBn: string; applyToMembers: string; applyToTeam: string
}

export default function FairProcessPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [principles, setPrinciples] = useState<Principle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/strategy/fair-process")
        if (res.ok) {
          const json = await res.json() as { principles: Principle[] }
          setPrinciples(json.principles ?? [])
        }
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4"><Skeleton className="h-8 w-80" /><Skeleton className="h-64 rounded-2xl" /></div>

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "ফেয়ার প্রসেস" : "Fair Process"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "৩ই প্রিন্সিপল — এনগেজমেন্ট, এক্সপ্ল্যানেশন, এক্সপেক্টেশন ক্ল্যারিটি" : "The 3E Principle — Engagement, Explanation, Expectation Clarity"}</p>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-border p-5 mb-6">
        <p className="text-xs text-text-secondary/80 leading-relaxed">
          {isBn
            ? "ফেয়ার প্রসেস ব্লু ওশান স্ট্র্যাটেজির সবচেয়ে গুরুত্বপূর্ণ এক্সিকিউশন টুল। এটি বিশ্বাস ও স্বেচ্ছাসেবী সহযোগিতা তৈরি করে। যখন মানুষ শোনা বোধ করে, তারা কঠিন সিদ্ধান্তও সমর্থন করবে।"
            : "Fair Process is Blue Ocean Strategy's most important execution tool. It builds trust and voluntary cooperation. When people feel heard, they will support even difficult decisions."}
        </p>
      </div>

      <div className="space-y-4">
        {principles.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-border p-4" style={{ borderLeftColor: p.color, borderLeftWidth: 3 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{p.icon}</span>
              <h3 className="text-sm font-bold" style={{ color: p.color }}>{isBn ? p.nameBn : p.nameEn}</h3>
            </div>
            <p className="text-[11px] text-text-secondary/80 mb-2">{isBn ? p.descBn : p.descEn}</p>
            <div className="p-2.5 bg-primary/5 rounded-lg mb-2">
              <p className="text-[10px] font-bold text-text-secondary/70 uppercase mb-0.5">{isBn ? "কেন?" : "Why?"}</p>
              <p className="text-[11px] text-text-secondary/90">{isBn ? p.whyBn : p.why}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 bg-accent/5 rounded-lg">
                <p className="text-[9px] font-bold text-accent/70 uppercase mb-1">{isBn ? "সদস্যদের জন্য" : "For Members"}</p>
                <p className="text-[10px] text-text-secondary/80">{isBn ? p.applyToMembers : p.applyToMembers}</p>
              </div>
              <div className="p-2.5 bg-primary/5 rounded-lg">
                <p className="text-[9px] font-bold text-primary/70 uppercase mb-1">{isBn ? "টিমের জন্য" : "For Team"}</p>
                <p className="text-[10px] text-text-secondary/80">{isBn ? p.applyToTeam : p.applyToTeam}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

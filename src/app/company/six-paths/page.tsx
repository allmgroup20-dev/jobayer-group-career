"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"

interface Path {
  id: number; key: string; nameEn: string; nameBn: string; descEn: string; descBn: string
}

interface Example {
  pathId: number; exampleEn: string; exampleBn: string
}

export default function SixPathsPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [paths, setPaths] = useState<Path[]>([])
  const [examples, setExamples] = useState<Example[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/strategy/six-paths")
        if (res.ok) {
          const json = await res.json() as { paths: Path[]; examples: Example[] }
          setPaths(json.paths ?? [])
          setExamples(json.examples ?? [])
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

  const pathIcons = ["🏭", "📊", "👥", "🧩", "💖", "🔮"]

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "ছয় পথ ফ্রেমওয়ার্ক" : "Six Paths Framework"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">
          {isBn ? "নতুন বাজার স্পেস আবিষ্কারের জন্য কিম অ্যান্ড মাউবোর্গনের ছয় পথ" : "Kim & Mauborgne's Six Paths to Discover New Market Space"}
        </p>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-border p-5 mb-6">
        <h2 className="text-sm font-bold text-text mb-2">{isBn ? "ছয় পথের ওভারভিউ" : "The Six Paths Overview"}</h2>
        <p className="text-xs text-text-secondary/70 leading-relaxed">
          {isBn
            ? "Six Paths Framework ব্লু ওশান স্ট্র্যাটেজির মূল টুল। এটি ৬টি প্রচলিত সীমানা অতিক্রম করে নতুন বাজার স্পেস খুঁজতে সাহায্য করে। প্রতিটি পথ একটি ভিন্ন কোণ থেকে বাজার দেখার উপায়।"
            : "The Six Paths Framework is a core Blue Ocean Strategy tool that helps find new market space by looking across 6 conventional boundaries. Each path offers a different angle to view the market."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        {paths.map((p, i) => (
          <div key={p.id} className="bg-white rounded-xl border border-border p-4 hover:shadow-sm transition">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{pathIcons[i]}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-text">{isBn ? p.nameBn : p.nameEn}</h3>
                <p className="text-xs text-text-secondary/80 mt-1">{isBn ? p.descBn : p.descEn}</p>
                {examples.filter(e => e.pathId === p.id).map((ex, j) => (
                  <div key={j} className="mt-2 p-2.5 bg-primary/5 rounded-lg">
                    <p className="text-[11px] text-text-secondary/90 italic">{isBn ? ex.exampleBn : ex.exampleEn}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

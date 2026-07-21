"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"

interface Principle {
  key: string; name: string; nameBn: string; desc: string; descBn: string
}

export default function ValueInnovationPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [data, setData] = useState<{ concept: { title: string; subtitle: string; definition: string; principles: Principle[]; ericExample: string } } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/strategy/value-innovation")
        if (res.ok) setData(await res.json() as any)
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4"><Skeleton className="h-8 w-80" /><Skeleton className="h-48 rounded-2xl" /></div>
  if (!data) return <div className="p-6 text-text-secondary">{isBn ? "কোনো তথ্য নেই" : "No data"}</div>

  const { concept } = data

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{concept.title}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{concept.subtitle}</p>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-border p-5 mb-6">
        <p className="text-xs text-text-secondary/80 leading-relaxed">{concept.definition}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {concept.principles.map((p) => (
          <div key={p.key} className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-xs font-bold text-text mb-1">{isBn ? p.nameBn : p.name}</h3>
            <p className="text-[11px] text-text-secondary/80">{isBn ? p.descBn : p.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-text mb-2">{isBn ? "উদাহরণ: ERRC Grid in Action" : "Example: ERRC Grid in Action"}</h2>
        <p className="text-xs text-text-secondary/80 leading-relaxed">{concept.ericExample}</p>
      </div>
    </div>
  )
}

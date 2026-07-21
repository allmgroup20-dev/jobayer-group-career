"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"

interface Question {
  id: number; key: string; nameEn: string; nameBn: string; descEn: string; descBn: string; checklist: string[]
}

interface Strategy {
  strategy: string; price: string; target: string; corridorCheck: string
}

export default function BusinessModelPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [questions, setQuestions] = useState<Question[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [targetPrice, setTargetPrice] = useState("2000")
  const [targetCost, setTargetCost] = useState("800")
  const [result, setResult] = useState<{ analysis: { margin: number | null; marginPercent: string | null; isViable: boolean | null } } | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/strategy/business-model")
        if (res.ok) {
          const json = await res.json() as { questions: Question[]; strategies: Strategy[] }
          setQuestions(json.questions ?? [])
          setStrategies(json.strategies ?? [])
        }
      } catch {} finally {
        setLoading(false)
      }
    })()
  }, [])

  const toggleCheck = (key: string) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }))

  const analyze = async () => {
    const res = await fetch("/api/strategy/business-model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "Platform Membership", targetPrice: +targetPrice, targetCost: +targetCost }),
    })
    if (res.ok) setResult(await res.json() as { analysis: { margin: number | null; marginPercent: string | null; isViable: boolean | null } })
  }

  if (loading) return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <Skeleton className="h-8 w-80" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )

  const totalChecked = Object.values(checked).filter(Boolean).length
  const totalItems = questions.reduce((s, q) => s + q.checklist.length, 0)

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "বিজনেস মডেল গাইড" : "Business Model Guide"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">
          {isBn ? "৪টি প্রশ্ন যা আপনার ব্লু ওশান কৌশলের ব্যবসায়িক মডেল বৈধতা নিশ্চিত করে" : "4 Questions That Validate Your Blue Ocean Strategy's Business Model"}
        </p>
      </div>

      <div className="mb-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text">{isBn ? "চেকলিস্ট" : "Checklist"}</h2>
            <span className="text-[10px] text-text-secondary bg-primary/5 px-2 py-0.5 rounded-full">
              {totalChecked}/{totalItems}
            </span>
          </div>
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="border border-border rounded-xl p-3">
                <p className="text-xs font-bold text-text mb-2">{isBn ? q.nameBn : q.nameEn}</p>
                <p className="text-[11px] text-text-secondary/80 mb-2">{isBn ? q.descBn : q.descEn}</p>
                <div className="space-y-1.5">
                  {q.checklist.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!checked[c]} onChange={() => toggleCheck(c)}
                        className="w-3.5 h-3.5 rounded border-border text-primary" />
                      <span className="text-[11px] text-text-secondary/90">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-text mb-3">{isBn ? "প্রাইসিং কৌশল" : "Pricing Strategies"}</h2>
          <div className="space-y-2">
            {strategies.map((s) => (
              <div key={s.strategy} className="p-3 bg-primary/5 rounded-xl">
                <p className="text-xs font-bold text-text">{s.strategy}</p>
                <p className="text-[11px] text-text-secondary mt-0.5">{s.price} — {s.target}</p>
                <p className="text-[10px] text-text-secondary/70 mt-0.5 italic">{s.corridorCheck}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-text mb-3">{isBn ? "মুনাফা বিশ্লেষণ" : "Profitability Analysis"}</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[10px] text-text-secondary block mb-1">{isBn ? "লক্ষ্য মূল্য" : "Target Price (৳)"}</label>
              <input className="text-xs border border-border rounded-lg px-3 py-2 w-full" type="number" value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-text-secondary block mb-1">{isBn ? "লক্ষ্য খরচ" : "Target Cost (৳)"}</label>
              <input className="text-xs border border-border rounded-lg px-3 py-2 w-full" type="number" value={targetCost}
                onChange={(e) => setTargetCost(e.target.value)} />
            </div>
          </div>
          <button onClick={analyze}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-80 transition w-full">
            {isBn ? "বিশ্লেষণ করুন" : "Analyze"}
          </button>
          {result && (
            <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: result.analysis.isViable ? "#dcfce7" : "#fee2e2" }}>
              <p className="text-xs font-bold text-text text-center mb-1">
                {isBn ? "মুনাফা মার্জিন" : "Profit Margin"}: {result.analysis.marginPercent}
              </p>
              <p className="text-[11px] text-text-secondary/80 text-center">
                {result.analysis.isViable
                  ? (isBn ? "✅ মডেলটি টেকসই। ৩০%+ মার্জিন স্বাস্থ্যকর।" : "✅ Model is viable. 30%+ margin is healthy.")
                  : (isBn ? "❌ মডেলটি টেকসই নয়। মার্জিন ৩০%-এর কম। খরচ কমানোর উপায় খুঁজুন।" : "❌ Model may not be viable. Margin is below 30%. Find ways to reduce costs.")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

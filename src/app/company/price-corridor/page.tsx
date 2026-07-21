"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"

interface Step {
  id: number; key: string; nameEn: string; nameBn: string; descEn: string; descBn: string
}

interface RefPoint {
  key: string; nameEn: string; nameBn: string; exampleEn: string; exampleBn: string
}

export default function PriceCorridorPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [steps, setSteps] = useState<Step[]>([])
  const [refPoints, setRefPoints] = useState<RefPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [targetCost, setTargetCost] = useState("500")
  const [competitorPrice, setCompetitorPrice] = useState("2000")
  const [perceivedValue, setPerceivedValue] = useState("5000")
  const [result, setResult] = useState<{ corridor: { low: number | null; high: number | null } } | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/strategy/price-corridor")
        if (res.ok) {
          const json = await res.json() as { framework: { steps: Step[]; referencePoints: RefPoint[] } }
          setSteps(json.framework?.steps ?? [])
          setRefPoints(json.framework?.referencePoints ?? [])
        }
      } catch {} finally {
        setLoading(false)
      }
    })()
  }, [])

  const calculate = async () => {
    const res = await fetch("/api/strategy/price-corridor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "Platform Membership", targetCost: +targetCost, competitorPrice: +competitorPrice, perceivedValue: +perceivedValue }),
    })
    if (res.ok) setResult(await res.json() as { corridor: { low: number | null; high: number | null } })
  }

  if (loading) return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <Skeleton className="h-8 w-80" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "প্রাইস করিডোর অফ দ্য ম্যাস" : "Price Corridor of the Mass"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">
          {isBn ? "গণমানুষের কাছে পৌঁছানোর জন্য আদর্শ মূল্য নির্ধারণের ফ্রেমওয়ার্ক" : "Set the Optimal Price That Opens Your Offering to the Mass of Target Buyers"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-text mb-3">{isBn ? "৪টি ধাপ" : "4 Steps"}</h2>
          <div className="space-y-3">
            {steps.map((s) => (
              <div key={s.id} className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{s.id}</span>
                <div>
                  <p className="text-xs font-bold text-text">{isBn ? s.nameBn : s.nameEn}</p>
                  <p className="text-[11px] text-text-secondary/80 mt-0.5">{isBn ? s.descBn : s.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-text mb-3">{isBn ? "৩টি রেফারেন্স পয়েন্ট" : "3 Reference Points"}</h2>
          <div className="space-y-3">
            {refPoints.map((r) => (
              <div key={r.key} className="p-3 bg-primary/5 rounded-xl">
                <p className="text-xs font-bold text-text mb-1">{isBn ? r.nameBn : r.nameEn}</p>
                <p className="text-[11px] text-text-secondary/80 italic">{isBn ? r.exampleBn : r.exampleEn}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 mb-6">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "করিডোর ক্যালকুলেটর" : "Corridor Calculator"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[10px] text-text-secondary block mb-1">{isBn ? "আমাদের খরচ" : "Our Cost (৳)"}</label>
            <input className="text-xs border border-border rounded-lg px-3 py-2 w-full" type="number" value={targetCost}
              onChange={(e) => setTargetCost(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] text-text-secondary block mb-1">{isBn ? "প্রতিযোগীর দাম" : "Competitor Price (৳)"}</label>
            <input className="text-xs border border-border rounded-lg px-3 py-2 w-full" type="number" value={competitorPrice}
              onChange={(e) => setCompetitorPrice(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] text-text-secondary block mb-1">{isBn ? "গ্রাহকের ধারণাকৃত মূল্য" : "Perceived Value (৳)"}</label>
            <input className="text-xs border border-border rounded-lg px-3 py-2 w-full" type="number" value={perceivedValue}
              onChange={(e) => setPerceivedValue(e.target.value)} />
          </div>
        </div>
        <button onClick={calculate}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-80 transition">
          {isBn ? "করিডোর গণনা করুন" : "Calculate Corridor"}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[10px] text-text-secondary">{isBn ? "নিম্ন সীমা" : "Low End"}</p>
                <p className="text-lg font-black text-success">৳{result.corridor.low}</p>
              </div>
              <div className="flex-1 h-2 bg-border rounded-full relative">
                {result.corridor.low != null && result.corridor.high != null && (
                  <div className="absolute h-full bg-gradient-to-r from-success to-primary rounded-full"
                    style={{ left: `${(result.corridor.low / result.corridor.high) * 50}%`, right: `${50 - (result.corridor.high / (result.corridor.high * 2)) * 50}%` }} />
                )}
              </div>
              <div className="text-center">
                <p className="text-[10px] text-text-secondary">{isBn ? "উচ্চ সীমা" : "High End"}</p>
                <p className="text-lg font-black text-primary">৳{result.corridor.high}</p>
              </div>
            </div>
            <p className="text-[11px] text-text-secondary/80 mt-3 text-center">
              {isBn
                ? `সুপারিশকৃত প্রাইস করিডোর: ৳${result.corridor.low} — ৳${result.corridor.high}। গণমানুষের কাছে পৌঁছানোর জন্য এই রেঞ্জের মধ্যে দাম নির্ধারণ করুন।`
                : `Recommended Price Corridor: ৳${result.corridor.low} — ৳${result.corridor.high}. Set your price within this range to reach the mass of target buyers.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

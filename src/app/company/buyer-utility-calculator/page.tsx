"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"

interface Lever { key: string; nameEn: string; nameBn: string; desc: string }
interface Stage { key: string; nameEn: string; nameBn: string }

export default function BuyerUtilityCalculatorPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [levers, setLevers] = useState<Lever[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [matrix, setMatrix] = useState<Record<string, Record<string, number>>>({})
  const [result, setResult] = useState<{ totalScore: number; rating: string; topOpportunities: { stage: string; lever: string; score: number }[] } | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/buyer-utility-calculator")
        if (res.ok) {
          const json = await res.json() as { levers: Lever[]; stages: Stage[] }
          setLevers(json.levers ?? [])
          setStages(json.stages ?? [])
          const m: Record<string, Record<string, number>> = {}
          for (const s of json.stages ?? []) {
            m[s.key] = {}
            for (const l of json.levers ?? []) m[s.key][l.key] = 1
          }
          setMatrix(m)
        }
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  const setCell = (stage: string, lever: string, val: number) => {
    setMatrix((prev) => ({ ...prev, [stage]: { ...prev[stage], [lever]: val } }))
  }

  const calculate = async () => {
    const res = await fetch("/api/buyer-utility-calculator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matrix }),
    })
    if (res.ok) setResult(await res.json() as any)
  }

  const cellColor = (v: number) => {
    if (v === 3) return "bg-success/20 text-success border-success/30"
    if (v === 2) return "bg-warning/20 text-warning border-warning/30"
    return "bg-error/10 text-error/70 border-error/20"
  }

  const stageLabels: Record<string, string> = {
    purchase: isBn ? "ক্রয়" : "Purchase",
    delivery: isBn ? "ডেলিভারি" : "Delivery",
    use: isBn ? "ব্যবহার" : "Use",
    supplements: isBn ? "পরিপূরক" : "Supplements",
    maintenance: isBn ? "রক্ষণাবেক্ষণ" : "Maintenance",
    disposal: isBn ? "নিষ্পত্তি" : "Disposal",
  }

  if (loading) return <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4"><Skeleton className="h-8 w-80" /><Skeleton className="h-96 rounded-2xl" /></div>

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "বায়ার ইউটিলিটি ক্যালকুলেটর" : "Buyer Utility Calculator"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">
          {isBn ? "৬টি ক্রেতা পর্যায় × ৬টি ইউটিলিটি লিভার — আপনার ব্লু ওশানের ইউটিলিটি প্রোফাইল মাপুন" : "6 Buyer Stages × 6 Utility Levers — Measure Your Blue Ocean's Utility Profile"}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-3 mb-6 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 text-text-secondary font-medium sticky left-0 bg-white z-10">{isBn ? "পর্যায় → লিভার ↓" : "Stage → Lever ↓"}</th>
              {stages.map((s) => (
                <th key={s.key} className="text-center py-2 px-1 text-text-secondary font-medium min-w-[70px]">{isBn ? s.nameBn : s.nameEn}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {levers.map((l) => (
              <tr key={l.key}>
                <td className="py-1.5 px-2 text-text font-medium sticky left-0 bg-white border-r border-border min-w-[100px]">
                  <p className="text-[10px] leading-tight">{isBn ? l.nameBn : l.nameEn}</p>
                  <p className="text-[8px] text-text-secondary/60">{l.desc}</p>
                </td>
                {stages.map((s) => (
                  <td key={`${s.key}-${l.key}`} className="text-center py-1 px-1">
                    <button onClick={() => setCell(s.key, l.key, ((matrix[s.key]?.[l.key] ?? 1) % 3) + 1)}
                      className={`w-10 h-10 rounded-lg border font-bold text-[11px] transition ${cellColor(matrix[s.key]?.[l.key] ?? 1)}`}>
                      {matrix[s.key]?.[l.key] ?? 1}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-3 mt-2 px-2">
          <span className="text-[9px] text-text-secondary"><span className="inline-block w-3 h-3 rounded bg-error/20 border border-error/30 mr-1" />1 = {isBn ? "কোনো ইউটিলিটি নেই" : "No Utility"}</span>
          <span className="text-[9px] text-text-secondary"><span className="inline-block w-3 h-3 rounded bg-warning/20 border border-warning/30 mr-1" />2 = {isBn ? "কিছু ইউটিলিটি" : "Some Utility"}</span>
          <span className="text-[9px] text-text-secondary"><span className="inline-block w-3 h-3 rounded bg-success/20 border border-success/30 mr-1" />3 = {isBn ? "উচ্চ ইউটিলিটি" : "High Utility"}</span>
        </div>
      </div>

      <button onClick={calculate}
        className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-80 transition w-full mb-6">
        {isBn ? "ইউটিলিটি স্কোর গণনা করুন" : "Calculate Utility Score"}
      </button>

      {result && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text">{isBn ? "ইউটিলিটি প্রোফাইল" : "Utility Profile"}</h2>
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: result.totalScore >= 60 ? "#10b981" : result.totalScore >= 40 ? "#f59e0b" : "#ef4444" }}>{result.totalScore}%</p>
              <p className="text-[9px] text-text-secondary/70 uppercase tracking-wider">{result.rating}</p>
            </div>
          </div>
          {result.topOpportunities.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-text-secondary/70 uppercase mb-2">{isBn ? "শীর্ষ সুযোগ" : "Top Opportunities"}</p>
              <div className="space-y-1">
                {result.topOpportunities.map((o, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                    <span className="text-[11px] text-text-secondary/90">{stageLabels[o.stage] ?? o.stage} × {levers.find((l) => l.key === o.lever)?.nameEn ?? o.lever}</span>
                    <span className="text-[10px] font-bold" style={{ color: o.score >= 2 ? "#10b981" : "#f59e0b" }}>{o.score}/3</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

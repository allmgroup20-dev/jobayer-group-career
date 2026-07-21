"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"
import Link from "next/link"

interface Framework {
  name: string; path: string; icon: string; status: string; count: number
}

export default function StrategyDashboardPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [data, setData] = useState<{
    canvas: { total: number; avgOurScore: number; avgCompScore: number; pioneers: number; gaps: number; needsWork: number }
    knowledge: { total: number; agents: number }
    errc: { saved: number }
    frameworks: Framework[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/strategy-dashboard")
        if (res.ok) setData(await res.json() as any)
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
  if (!data) return <div className="p-6 text-text-secondary">{isBn ? "কোনো তথ্য নেই" : "No data"}</div>

  const { canvas, knowledge, frameworks } = data

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "কৌশল ড্যাশবোর্ড" : "Strategy Dashboard"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "ব্লু ওশান স্ট্র্যাটেজি ফ্রেমওয়ার্কের সার্বিক অবস্থা" : "Blue Ocean Strategy Framework Overview"}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-black text-primary">{canvas.total}</p>
          <p className="text-[10px] text-text-secondary/70">{isBn ? "ক্যানভাস ফ্যাক্টর" : "Canvas Factors"}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-black" style={{ color: canvas.avgOurScore > canvas.avgCompScore ? "#10b981" : "#ef4444" }}>{canvas.avgOurScore}</p>
          <p className="text-[10px] text-text-secondary/70">{isBn ? "আমাদের গড় স্কোর" : "Avg Our Score"}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-black" style={{ color: canvas.pioneers > 2 ? "#10b981" : "#f59e0b" }}>{canvas.pioneers}</p>
          <p className="text-[10px] text-text-secondary/70">{isBn ? "পাইওনিয়ার ফ্যাক্টর" : "Pioneer Factors"}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-black text-accent">{knowledge.total}</p>
          <p className="text-[10px] text-text-secondary/70">{isBn ? "নলেজ এন্ট্রি" : "Knowledge Entries"}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 mb-6">
        <h2 className="text-sm font-bold text-text mb-3">{isBn ? "ক্যানভাস ইনসাইট" : "Canvas Insight"}</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">{isBn ? "প্রতিযোগীর তুলনায় আমাদের এজ" : "Our Edge vs Competitor"}</span>
            <span className="font-bold" style={{ color: canvas.avgOurScore > canvas.avgCompScore ? "#10b981" : "#ef4444" }}>
              {canvas.avgOurScore > canvas.avgCompScore ? "+" : ""}{(canvas.avgOurScore - canvas.avgCompScore).toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">{isBn ? "বড় সুযোগ (বড় গ্যাপ)" : "Big Opportunity Gaps"}</span>
            <span className="font-bold text-success">{canvas.gaps}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">{isBn ? "উন্নতি প্রয়োজন (স্কোর < ৬)" : "Needs Improvement (Score < 6)"}</span>
            <span className="font-bold" style={{ color: canvas.needsWork > 0 ? "#ef4444" : "#10b981" }}>{canvas.needsWork}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">{isBn ? "AI এজেন্টে ব্লু ওশান নলেজ" : "Blue Ocean Knowledge in AI Agents"}</span>
            <span className="font-bold text-primary">{knowledge.agents}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {frameworks.map((fw) => (
          <Link key={fw.name} href={fw.path}
            className="bg-white rounded-xl border border-border p-3 flex items-center gap-3 hover:shadow-sm hover:border-primary/30 transition">
            <span className="text-lg">{fw.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-text truncate">{fw.name}</p>
              <p className="text-[10px] text-text-secondary/70">{fw.count} {isBn ? "আইটেম" : "items"}</p>
            </div>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fw.status === "active" ? "#10b981" : "#d1d5db" }} />
          </Link>
        ))}
      </div>
    </div>
  )
}

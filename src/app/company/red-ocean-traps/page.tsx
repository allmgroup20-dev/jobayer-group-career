"use client"

import { useState, useEffect } from "react"
import { useLanguageStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/Skeleton"

interface Trap {
  id: number; key: string; nameEn: string; nameBn: string; icon: string; trapDesc: string; trapDescBn: string; blueOceanShift: string; blueOceanShiftBn: string; example: string; exampleBn: string
}

export default function RedOceanTrapsPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const [traps, setTraps] = useState<Trap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/strategy/red-ocean-traps")
        if (res.ok) {
          const json = await res.json() as { traps: Trap[] }
          setTraps(json.traps ?? [])
        }
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4"><Skeleton className="h-8 w-80" /><Skeleton className="h-96 rounded-2xl" /></div>

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "রেড ওশান ফাঁদসমূহ" : "Red Ocean Traps"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "৬টি সাধারণ ফাঁদ যা কোম্পানিকে রেড ওশানে আটকে রাখে — এবং কীভাবে এড়াবেন" : "6 Common Traps That Keep Companies Stuck in Red Oceans — and How to Avoid Them"}</p>
      </div>

      <div className="space-y-3">
        {traps.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-lg mt-0.5">{t.icon}</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-text">{isBn ? t.nameBn : t.nameEn}</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <div className="p-2.5 bg-error/5 rounded-lg">
                <p className="text-[9px] font-bold text-error/70 uppercase mb-1">{isBn ? "ফাঁদ" : "The Trap"}</p>
                <p className="text-[11px] text-text-secondary/80">{isBn ? t.trapDescBn : t.trapDesc}</p>
              </div>
              <div className="p-2.5 bg-success/5 rounded-lg">
                <p className="text-[9px] font-bold text-success/70 uppercase mb-1">{isBn ? "ব্লু ওশান শিফট" : "Blue Ocean Shift"}</p>
                <p className="text-[11px] text-text-secondary/80">{isBn ? t.blueOceanShiftBn : t.blueOceanShift}</p>
              </div>
            </div>
            <div className="p-2.5 bg-primary/5 rounded-lg">
              <p className="text-[9px] font-bold text-primary/70 uppercase mb-1">{isBn ? "প্ল্যাটফর্ম উদাহরণ" : "Platform Example"}</p>
              <p className="text-[11px] text-text-secondary/90 italic">{isBn ? t.exampleBn : t.example}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

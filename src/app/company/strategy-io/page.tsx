"use client"

import { useState, useRef } from "react"
import { useLanguageStore } from "@/lib/store"

export default function StrategyIOPage() {
  const { lang } = useLanguageStore()
  const isBn = lang === "bn"
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ canvas: number; errc: number; scenarios: number } | null>(null)
  const [error, setError] = useState("")

  const handleExport = async () => {
    try {
      const res = await fetch("/api/strategy/io")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `strategy-export-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setImporting(true)
    setError("")
    setResult(null)
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const res = await fetch("/api/strategy/io", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      })
      if (res.ok) {
        const data = await res.json() as { success: boolean; imported: { canvas: number; errc: number; scenarios: number } }
        setResult(data.imported)
      } else {
        const err = await res.json() as { error: string }
        setError(err.error ?? "Import failed")
      }
    } catch (e) {
      setError(isBn ? "ফাইল পড়া যায়নি। JSON ফর্ম্যাট চেক করুন।" : "Could not read file. Check JSON format.")
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "কৌশল ডেটা ইম্পোর্ট/এক্সপোর্ট" : "Strategy Data Import/Export"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">
          {isBn ? "সমস্ত কৌশল ডেটা ব্যাকআপ ও পুনরুদ্ধার করুন" : "Backup and restore all strategy framework data"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-text mb-2">{isBn ? "এক্সপোর্ট (ডাউনলোড)" : "Export (Download)"}</h2>
          <p className="text-[11px] text-text-secondary/70 mb-4">
            {isBn ? "সব ক্যানভাস ফ্যাক্টর, ERRC কোয়াড্রেন্ট এবং দৃশ্যকল্প JSON ফাইল হিসেবে ডাউনলোড করুন।" : "Download all canvas factors, ERRC quadrants, and scenarios as a JSON file."}
          </p>
          <div className="text-[10px] text-text-secondary/60 mb-4 space-y-0.5">
            <p>✓ {isBn ? "স্ট্র্যাটেজি ক্যানভাস ফ্যাক্টর" : "Strategy Canvas Factors"}</p>
            <p>✓ {isBn ? "ERRC গ্রিড ডেটা" : "ERRC Grid Data"}</p>
            <p>✓ {isBn ? "দৃশ্যকল্প পরিকল্পনা" : "Scenario Plans"}</p>
          </div>
          <button onClick={handleExport}
            className="w-full px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-80 transition">
            ⬇ {isBn ? "JSON ডাউনলোড করুন" : "Download JSON"}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-text mb-2">{isBn ? "ইম্পোর্ট (আপলোড)" : "Import (Upload)"}</h2>
          <p className="text-[11px] text-text-secondary/70 mb-4">
            {isBn ? "পূর্বে এক্সপোর্ট করা JSON ফাইল আপলোড করুন। বিদ্যমান ডেটা প্রতিস্থাপিত হবে।" : "Upload a previously exported JSON file. Existing data will be replaced."}
          </p>
          <label className="block w-full border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/30 transition mb-3">
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={() => setResult(null)} />
            <span className="text-[11px] text-text-secondary/60">{isBn ? "JSON ফাইল নির্বাচন করুন" : "Select JSON file"}</span>
          </label>
          <button onClick={handleImport} disabled={importing}
            className="w-full px-4 py-2.5 bg-accent text-white text-xs font-bold rounded-xl hover:opacity-80 transition disabled:opacity-50">
            {importing ? "..." : "⬆ " + (isBn ? "ইম্পোর্ট করুন" : "Import")}
          </button>

          {result && (
            <div className="mt-4 p-3 bg-success/5 rounded-xl">
              <p className="text-xs font-bold text-success mb-1">{isBn ? "✅ ইম্পোর্ট সফল" : "✅ Import Successful"}</p>
              <div className="text-[10px] text-text-secondary/80 space-y-0.5">
                <p>{isBn ? "ক্যানভাস" : "Canvas"}: {result.canvas} {isBn ? "টি ফ্যাক্টর" : "factors"}</p>
                <p>ERRC: {result.errc} {isBn ? "টি কোয়াড্রেন্ট" : "quadrants"}</p>
                <p>{isBn ? "দৃশ্যকল্প" : "Scenarios"}: {result.scenarios} {isBn ? "টি" : ""}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-error/5 rounded-xl">
              <p className="text-xs font-bold text-error">{isBn ? "❌ ব্যর্থ" : "❌ Failed"}: {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

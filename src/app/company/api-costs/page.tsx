"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

interface Row {
  total: number;
  calls: number;
}
interface ProviderRow extends Row { provider: string; }
interface FeatureRow extends Row { feature: string; }
interface DayRow extends Row { day: string; }
interface LogRow {
  id: number; provider: string; feature: string; operation: string; model: string;
  input_tokens: number; output_tokens: number; quantity: number; est_cost_usd: number; created_at: string;
}

interface CostData {
  summary: { today: number; todayBdt: number; allTime: number; allTimeBdt: number; callsToday: number; callsAll: number };
  byProvider: ProviderRow[];
  byFeature: FeatureRow[];
  byDay: DayRow[];
  recent: LogRow[];
  unitCosts: { whatsappPerMsg: number; smsPerMsg: number; emailPer: number; bdtPerUsd: number };
}

// Flags that are safe to keep on while "killing" every paid/automated API.
const ESSENTIAL_KEEP_ON = [
  "payments", "registrations", "withdrawals", "referral", "resource_income",
  "demo_bonus", "contact_sync", "maintenance_auto", "api_costs_logging",
];

const NON_ESSENTIAL = [
  "ai_system", "ai_personalize", "ai_pricing", "ai_chat", "proactive_followup",
  "campaign_engine", "retention_engine", "ai_knowledge", "ai_profiler",
  "whatsapp", "whatsapp_otp_verify", "telegram", "messenger", "email_sendgrid",
  "sms_gateway", "keepwarm_cron",
];

function fmtUsd(n: number): string {
  return `$${(Number(n) || 0).toFixed(4)}`;
}

export default function ApiCostsPage() {
  const { lang } = useLanguageStore();
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/api-costs")
      .then(r => r.json().catch(() => null))
      .then(d => { if (d && (d as CostData).summary) setData(d as CostData); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3500); };

  const killAllNonEssential = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flags: NON_ESSENTIAL.map(k => ({ key: k, enabled: false })) }),
      });
      const ok = res.ok;
      await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flags: ESSENTIAL_KEEP_ON.map(k => ({ key: k, enabled: true })) }),
      });
      flash(ok
        ? (lang === "bn" ? "✓ সব নন-এসেনশিয়াল API বন্ধ করা হয়েছে" : "✓ All non-essential APIs disabled")
        : (lang === "bn" ? "✗ ব্যর্থ" : "✗ Failed"));
    } catch { flash(lang === "bn" ? "✗ ব্যর্থ" : "✗ Failed"); }
    setBusy(false);
  };

  const clearLogs = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/api-costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      flash(res.ok ? (lang === "bn" ? "✓ লগ মুছে ফেলা হয়েছে" : "✓ Logs cleared") : (lang === "bn" ? "✗ ব্যর্থ" : "✗ Failed"));
      load();
    } catch { flash(lang === "bn" ? "✗ ব্যর্থ" : "✗ Failed"); }
    setBusy(false);
  };

  const s = data?.summary;
  const uc = data?.unitCosts;

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "API খরচ সেন্টার" : "API Cost Center"}</h1>
            <p className="text-sm text-text-secondary mt-1">
              {lang === "bn" ? "প্রতিটি API কলের আনুমানিক খরচ ও দ্রুত কিল-সুইচ" : "Estimated spend per API call with quick kill-switches"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all border-none cursor-pointer disabled:opacity-50"
            >
              ↻
            </button>
          </div>
        </div>

        {msg && <div className="mb-4 p-3 rounded-xl bg-success/10 text-success text-sm font-bold border border-success/20">{msg}</div>}

        {loading && !data ? (
          <div className="p-8 text-center text-text-secondary">...</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card className="!p-5">
                <p className="text-xs text-text-secondary">{lang === "bn" ? "আজ (২৪ ঘণ্টা)" : "Today (24h)"}</p>
                <p className="text-2xl font-black text-primary mt-1">{fmtUsd(s?.today || 0)}</p>
                <p className="text-xs text-text-secondary mt-1">≈ ৳{s?.todayBdt || 0} · {s?.callsToday || 0} calls</p>
              </Card>
              <Card className="!p-5">
                <p className="text-xs text-text-secondary">{lang === "bn" ? "মোট আনুমানিক" : "All-time (est.)"}</p>
                <p className="text-2xl font-black text-primary mt-1">{fmtUsd(s?.allTime || 0)}</p>
                <p className="text-xs text-text-secondary mt-1">≈ ৳{s?.allTimeBdt || 0} · {s?.callsAll || 0} calls</p>
              </Card>
              <Card className="!p-5">
                <p className="text-xs text-text-secondary">{lang === "bn" ? "ইউনিট খরচ" : "Unit costs"}</p>
                <p className="text-sm font-bold text-text mt-1">WhatsApp ≈ {fmtUsd(uc?.whatsappPerMsg || 0)}/msg</p>
                <p className="text-xs text-text-secondary">SMS ≈ {fmtUsd(uc?.smsPerMsg || 0)} · Email ≈ {fmtUsd(uc?.emailPer || 0)}</p>
              </Card>
              <Card className="!p-5">
                <p className="text-xs text-text-secondary">{lang === "bn" ? "মডেল ফ্রি হলে" : "Free models"}</p>
                <p className="text-sm font-bold text-text mt-1">0 cost (OpenRouter free / OpenCode Zen)</p>
                <p className="text-xs text-text-secondary mt-1">{lang === "bn" ? "এখনো কোনো পেইড মডেল কল হয়নি" : "Paid-model calls are logged separately"}</p>
              </Card>
            </div>

            {/* Provider + Feature breakdown */}
            <div className="grid gap-4 lg:grid-cols-2 mb-6">
              <Card className="!p-5">
                <h2 className="font-black text-primary mb-3">{lang === "bn" ? "প্রোভাইডার অনুযায়ী" : "By Provider"}</h2>
                {(data?.byProvider || []).length === 0 && <p className="text-xs text-text-secondary">{lang === "bn" ? "কোনো কল নেই" : "No calls logged yet"}</p>}
                <div className="space-y-2">
                  {data?.byProvider.map(r => (
                    <div key={r.provider} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-text">{r.provider}</span>
                      <span className="text-text-secondary">{r.calls} calls · <b className="text-text">{fmtUsd(r.total)}</b></span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="!p-5">
                <h2 className="font-black text-primary mb-3">{lang === "bn" ? "ফিচার অনুযায়ী" : "By Feature"}</h2>
                {(data?.byFeature || []).length === 0 && <p className="text-xs text-text-secondary">{lang === "bn" ? "কোনো কল নেই" : "No calls logged yet"}</p>}
                <div className="space-y-2">
                  {data?.byFeature.map(r => (
                    <div key={r.feature} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-text">{r.feature}</span>
                      <span className="text-text-secondary">{r.calls} calls · <b className="text-text">{fmtUsd(r.total)}</b></span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Kill switches */}
            <Card className="mb-6 !p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <h2 className="font-black text-primary">{lang === "bn" ? "দ্রুত কিল-সুইচ" : "Quick Kill-Switches"}</h2>
                  <p className="text-xs text-text-secondary mt-1">{lang === "bn" ? "এক ক্লিকে সব পেইড/অটোমেটেড API বন্ধ করুন (বিজনেস ফিচার সচল থাকবে)" : "Disable every paid/automated API in one click (business features stay on)"}</p>
                </div>
                <button
                  onClick={killAllNonEssential}
                  disabled={busy}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-danger hover:bg-danger/90 transition-all border-none cursor-pointer disabled:opacity-50"
                >
                  {busy ? "..." : (lang === "bn" ? "🛑 সব নন-এসেনশিয়াল API বন্ধ" : "🛑 Kill All Non-Essential APIs")}
                </button>
              </div>
            </Card>

            {/* Recent logs */}
            <Card className="!p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-primary">{lang === "bn" ? "সাম্প্রতিক লগ" : "Recent Logs"}</h2>
                <button onClick={clearLogs} disabled={busy} className="px-3 py-1 rounded-lg text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 border-none cursor-pointer transition-all disabled:opacity-50">
                  {lang === "bn" ? "মুছুন" : "Clear"}
                </button>
              </div>
              {(data?.recent || []).length === 0 && <p className="text-xs text-text-secondary">{lang === "bn" ? "কোনো লগ নেই" : "No logs yet"}</p>}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-text-secondary border-b border-border">
                      <th className="py-2 pr-3">Time</th>
                      <th className="py-2 pr-3">Provider</th>
                      <th className="py-2 pr-3">Feature</th>
                      <th className="py-2 pr-3">Model/Op</th>
                      <th className="py-2 pr-3 text-right">In</th>
                      <th className="py-2 pr-3 text-right">Out</th>
                      <th className="py-2 text-right">Est. $</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recent.map(r => (
                      <tr key={r.id} className="border-b border-border/50">
                        <td className="py-2 pr-3 text-text-secondary font-mono">{r.created_at}</td>
                        <td className="py-2 pr-3 font-mono text-text">{r.provider}</td>
                        <td className="py-2 pr-3 font-mono text-text">{r.feature}</td>
                        <td className="py-2 pr-3 font-mono text-text-secondary truncate max-w-[160px]">{r.model || r.operation || "—"}</td>
                        <td className="py-2 pr-3 text-right text-text-secondary">{r.input_tokens}</td>
                        <td className="py-2 pr-3 text-right text-text-secondary">{r.output_tokens}</td>
                        <td className="py-2 text-right font-bold text-text">{fmtUsd(r.est_cost_usd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
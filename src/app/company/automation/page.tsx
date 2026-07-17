"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface TriggerItem {
  workerId: string; name: string; phone: string; trigger: string; detail: string; segment: string;
}

export default function CompanyAutomationPage() {
  const { lang } = useLanguageStore();
  const [triggers, setTriggers] = useState<TriggerItem[]>([]);
  const [byType, setByType] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok?: boolean; msg?: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/company/automation");
      const d = await res.json() as { triggers?: TriggerItem[]; byType?: Record<string, number>; total?: number };
      if (d.triggers) { setTriggers(d.triggers); setByType(d.byType || {}); setTotal(d.total || 0); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (triggerType: string, action: "notify" | "whatsapp") => {
    setSending(`${triggerType}-${action}`);
    setStatus(null);
    try {
      const res = await fetch("/api/company/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triggerType, action }),
      });
      const d = await res.json() as { success?: boolean; affected?: number; error?: string };
      if (d.success) {
        setStatus({ ok: true, msg: `${d.affected} ${lang === "bn" ? "জনকে বিজ্ঞপ্তি পাঠানো হয়েছে" : "notifications sent"}` });
        loadData();
      } else {
        setStatus({ ok: false, msg: d.error || "Failed" });
      }
    } catch {
      setStatus({ ok: false, msg: "Network error" });
    } finally { setSending(null); }
  };

  const triggerLabels: Record<string, string> = {
    browse_abandon: lang === "bn" ? "ব্রাউজ abandoned" : "Browse Abandon",
    inactive_14d: lang === "bn" ? "১৪ দিন নিষ্ক্রিয়" : "Inactive 14d",
    inactive_30d: lang === "bn" ? "৩০+ দিন নিষ্ক্রিয়" : "Inactive 30d+",
    churn_risk: lang === "bn" ? "চার্ন রিস্ক" : "Churn Risk",
  };

  const triggerColors: Record<string, string> = {
    browse_abandon: "bg-blue-100 text-blue-700",
    inactive_14d: "bg-yellow-100 text-yellow-700",
    inactive_30d: "bg-orange-100 text-orange-700",
    churn_risk: "bg-red-100 text-red-700",
  };

  const triggerIcons: Record<string, string> = {
    browse_abandon: "🛒", inactive_14d: "⏰", inactive_30d: "⚠️", churn_risk: "🔥",
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "অটোমেশন ট্রিগার" : "Automation Triggers"}</h1>
            <p className="text-sm text-text-secondary mt-1">{total} {lang === "bn" ? "টি সক্রিয় ট্রিগার" : "active triggers"}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} loading={loading}>
            {lang === "bn" ? "রিফ্রেশ" : "Refresh"}
          </Button>
        </div>

        {status && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${status.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {status.msg}
          </div>
        )}

        {/* Summary Cards with Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(triggerLabels).map(([key, label]) => (
            <Card key={key} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{triggerIcons[key]}</span>
                    <div>
                      <p className={`text-2xl font-bold ${key === "churn_risk" ? "text-red-600" : key === "inactive_30d" ? "text-orange-600" : key === "inactive_14d" ? "text-yellow-600" : "text-blue-600"}`}>
                        {byType[key] || 0}
                      </p>
                      <p className="text-xs text-text-secondary">{label}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(key, "notify")}
                    disabled={sending === `${key}-notify` || (byType[key] || 0) === 0}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {sending === `${key}-notify` ? "..." : lang === "bn" ? "নোটিফাই" : "Notify"}
                  </button>
                  <button
                    onClick={() => handleAction(key, "whatsapp")}
                    disabled={sending === `${key}-whatsapp` || (byType[key] || 0) === 0}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {sending === `${key}-whatsapp` ? "..." : "WhatsApp"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trigger List */}
        <Card>
          <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "ট্রিগার লিস্ট" : "Trigger List"}</h3>
          {loading ? (
            <div className="text-center py-8 text-text-secondary text-sm">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</div>
          ) : triggers.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">{lang === "bn" ? "কোন ট্রিগার নেই" : "No triggers"}</div>
          ) : (
            <div className="space-y-2">
              {triggers.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-primary">{t.name}</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${triggerColors[t.trigger] || "bg-gray-100"}`}>{triggerLabels[t.trigger] || t.trigger}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{t.detail} · {t.phone}</p>
                  </div>
                  <span className="text-xs text-text-secondary">{t.segment || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

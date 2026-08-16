"use client";

import { useEffect, useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

interface FlagDef {
  key: string;
  label: string;
  bn: string;
  group: string;
}

const CATALOG: FlagDef[] = [
  { key: "ai_system", label: "AI System (master)", bn: "এআই সিস্টেম (মাস্টার)", group: "AI" },
  { key: "ai_personalize", label: "AI Personalization (homepage)", bn: "এআই পার্সোনালাইজেশন", group: "AI" },
  { key: "ai_pricing", label: "AI Pricing", bn: "এআই প্রাইসিং", group: "AI" },
  { key: "ai_chat", label: "AI Chat (WhatsApp/web chatbot)", bn: "এআই চ্যাট", group: "AI" },
  { key: "proactive_followup", label: "Proactive WhatsApp follow-up", bn: "প্রোঅ্যাকটিভ ফলো-আপ", group: "AI" },
  { key: "campaign_engine", label: "Campaign engine", bn: "ক্যাম্পেইন ইঞ্জিন", group: "AI" },
  { key: "retention_engine", label: "Retention engine", bn: "রিটেনশন ইঞ্জিন", group: "AI" },
  { key: "ai_knowledge", label: "AI knowledge auto-seed", bn: "এআই নলেজ অটো-সিড", group: "AI" },
  { key: "ai_profiler", label: "AI profiler", bn: "এআই প্রোফাইলার", group: "AI" },

  { key: "whatsapp", label: "WhatsApp Cloud API", bn: "হোয়াটসঅ্যাপ", group: "Messaging" },
  { key: "whatsapp_otp_verify", label: "WhatsApp OTP verification", bn: "হোয়াটসঅ্যাপ OTP ভেরিফিকেশন", group: "Messaging" },
  { key: "telegram", label: "Telegram bot", bn: "টেলিগ্রাম", group: "Messaging" },
  { key: "messenger", label: "Messenger bot", bn: "মেসেঞ্জার", group: "Messaging" },
  { key: "email_sendgrid", label: "Email (SendGrid)", bn: "ইমেইল", group: "Messaging" },
  { key: "sms_gateway", label: "SMS gateway", bn: "এসএমএস গেটওয়ে", group: "Messaging" },

  { key: "payments", label: "Payments / checkout", bn: "পেমেন্ট", group: "Business" },
  { key: "resource_income", label: "Resource income", bn: "রিসোর্স ইনকাম", group: "Business" },
  { key: "referral", label: "Referral commissions", bn: "রেফারেল কমিশন", group: "Business" },
  { key: "demo_bonus", label: "Demo bonus", bn: "ডেমো বোনাস", group: "Business" },
  { key: "registrations", label: "New registrations", bn: "নতুন রেজিস্ট্রেশন", group: "Business" },
  { key: "withdrawals", label: "Withdrawals", bn: "উইথড্রয়াল", group: "Business" },

  { key: "testimonials_feed", label: "Testimonials feed (curated)", bn: "টেস্টিমোনিয়াল ফিড", group: "Content" },
  { key: "live_salary_feed", label: "Live salary/bonus feed", bn: "লাইভ বোনাস ফিড", group: "Content" },
  { key: "payment_gallery", label: "Payment proof gallery", bn: "পেমেন্ট প্রুফ গ্যালারি", group: "Content" },
  { key: "contact_sync", label: "Contact sync (phonebook)", bn: "কন্টাক্ট সিঙ্ক", group: "Content" },

  { key: "maintenance_auto", label: "Auto maintenance cleanup", bn: "অটো মেইনটেন্যান্স", group: "System" },
  { key: "keepwarm_cron", label: "Keepwarm cron (proactive WhatsApp)", bn: "কিপওয়ার্ম ক্রন", group: "System" },
  { key: "api_costs_logging", label: "API cost logging", bn: "API খরচ লগিং", group: "System" },
];

const GROUPS = ["AI", "Messaging", "Business", "Content", "System"];

export default function CompanyFeaturesPage() {
  const { lang } = useLanguageStore();
  const [states, setStates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/features")
      .then(r => r.json().catch(() => null))
      .then(d => { if (d && (d as { flags?: Record<string, boolean> }).flags) setStates((d as { flags: Record<string, boolean> }).flags); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const saveAll = async () => {
    setSaving(true);
    try {
      await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flags: CATALOG.map(f => ({ key: f.key, enabled: states[f.key] === true })) }),
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = (group: string, enable: boolean) => {
    setStates(prev => {
      const next = { ...prev };
      CATALOG.filter(f => f.group === group).forEach(f => { next[f.key] = enable; });
      return next;
    });
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "ফিচার নিয়ন্ত্রণ" : "Feature Controls"}</h1>
            <p className="text-sm text-text-secondary mt-1">
              {lang === "bn"
                ? "প্রতিটি ফিচার চালু/বন্ধ করুন — API খরচ ও ঝুঁকি নিয়ন্ত্রণে রাখতে"
                : "Toggle every feature on/off to control API costs and risk"}
            </p>
          </div>
          <button
            onClick={saveAll}
            disabled={saving || loading}
            className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all border-none cursor-pointer disabled:opacity-50"
          >
            {saving ? "..." : savedMsg ? "✓ Saved" : (lang === "bn" ? "সব সেভ করুন" : "Save All")}
          </button>
        </div>

        {GROUPS.map((group) => (
          <Card key={group} className="mb-6 !p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <h2 className="font-black text-primary">{lang === "bn" ? group : group}</h2>
              <div className="flex gap-2">
                <button onClick={() => toggleGroup(group, true)} className="px-3 py-1 rounded-lg text-xs font-bold text-success bg-success/10 hover:bg-success/20 border-none cursor-pointer transition-all">
                  {lang === "bn" ? "সব চালু" : "All On"}
                </button>
                <button onClick={() => toggleGroup(group, false)} className="px-3 py-1 rounded-lg text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 border-none cursor-pointer transition-all">
                  {lang === "bn" ? "সব বন্ধ" : "All Off"}
                </button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {CATALOG.filter(f => f.group === group).map((f) => (
                <label key={f.key} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-bg/60 border border-border/60 hover:border-primary/20 transition-all cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-text">{lang === "bn" ? f.bn : f.label}</p>
                    <p className="text-[10px] font-mono text-text-secondary">{f.key}</p>
                  </div>
                  <span className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${states[f.key] ? "bg-success" : "bg-gray-300"}`}>
                    <input
                      type="checkbox"
                      checked={states[f.key] === true}
                      onChange={(e) => setStates(prev => ({ ...prev, [f.key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${states[f.key] ? "translate-x-5" : ""}`} />
                  </span>
                </label>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
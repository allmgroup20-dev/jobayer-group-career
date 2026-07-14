"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";

export default function WhatsAppDashboardPage() {
  const { lang } = useLanguageStore();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [warmups, setWarmups] = useState<any[]>([]);
  const [queueStats, setQueueStats] = useState({ queued: 0, sent: 0, failed: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [accRes, queueRes] = await Promise.all([
        fetch("/api/whatsapp/accounts"),
        fetch("/api/whatsapp/queue"),
      ]);
      const accData = await accRes.json() as { accounts?: any[]; warmups?: any[] };
      const queueData = await queueRes.json() as { queued?: number; sent?: number; failed?: number };
      if (accData.accounts) setAccounts(accData.accounts);
      if (accData.warmups) setWarmups(accData.warmups);
      setQueueStats({ queued: queueData.queued ?? 0, sent: queueData.sent ?? 0, failed: queueData.failed ?? 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (action: string, accountId?: string) => {
    await fetch("/api/whatsapp/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, accountId }),
    });
    loadData();
  };

  const handleQueueAction = async (action: string) => {
    await fetch("/api/whatsapp/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    loadData();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-text-secondary text-sm">Loading...</div>
    </div>
  );

  return (
    <div className="py-24 px-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          {lang === "bn" ? "হোয়াটসঅ্যাপ ড্যাশবোর্ড" : "WhatsApp Dashboard"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lang === "bn" ? "হোয়াটসঅ্যাপ ম্যানেজমেন্ট সিস্টেম" : "WhatsApp management system"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="text-sm text-text-secondary">{lang === "bn" ? "কিউতে" : "Queued"}</div>
          <div className="text-2xl font-bold text-primary mt-1">{queueStats.queued}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-text-secondary">{lang === "bn" ? "পাঠানো" : "Sent"}</div>
          <div className="text-2xl font-bold text-action mt-1">{queueStats.sent}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-text-secondary">{lang === "bn" ? "ব্যর্থ" : "Failed"}</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{queueStats.failed}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-primary">{lang === "bn" ? "অ্যাকাউন্টসমূহ" : "Accounts"}</h2>
            <button onClick={() => handleAction("add")} className="px-4 py-1.5 text-xs font-medium gradient-premium text-white rounded-xl">
              + {lang === "bn" ? "নতুন" : "New"}
            </button>
          </div>
          {accounts.length === 0 ? (
            <div className="text-sm text-text-secondary py-8 text-center">
              {lang === "bn" ? "কোনো অ্যাকাউন্ট নেই" : "No accounts configured"}
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc: any) => {
                const warmup = warmups.find((w: any) => w.account_id === acc.account_id);
                return (
                  <div key={acc.id} className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-primary">{acc.account_id}</div>
                        <div className="text-xs text-text-secondary">{acc.phone || "No phone"} · {acc.provider}</div>
                        <div className="text-xs text-text-secondary mt-1">
                          {warmup ? `${lang === "bn" ? "দিন" : "Day"} ${warmup.day_count} · ${lang === "bn" ? "লিমিট" : "Limit"}: ${acc.daily_sent}/${acc.daily_limit}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${acc.status === 'connected' ? 'bg-action' : acc.status === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                        <span className="text-xs text-text-secondary">{acc.status}</span>
                        <button onClick={() => handleAction(acc.status === 'connected' ? 'disconnect' : 'connect', acc.account_id)} className="text-xs text-primary underline">
                          {acc.status === 'connected' ? (lang === "bn" ? "বন্ধ" : "Disconnect") : (lang === "bn" ? "চালু" : "Connect")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-primary">{lang === "bn" ? "মেসেজ কিউ" : "Message Queue"}</h2>
            <div className="flex gap-2">
              <button onClick={() => handleQueueAction("flush")} className="px-3 py-1.5 text-xs font-medium bg-action/10 text-action rounded-xl hover:bg-action/20">
                {lang === "bn" ? "পাঠাও" : "Flush"}
              </button>
              <button onClick={() => handleQueueAction("retry_failed")} className="px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100">
                {lang === "bn" ? "পুনরায়" : "Retry"}
              </button>
              <button onClick={() => handleQueueAction("clear_failed")} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                {lang === "bn" ? "মুছুন" : "Clear"}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50">
              <span className="text-sm text-primary">{lang === "bn" ? "কিউতে অপেক্ষমান" : "Waiting in queue"}</span>
              <span className="font-bold text-lg text-primary">{queueStats.queued}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50">
              <span className="text-sm text-primary">{lang === "bn" ? "পাঠানো হয়েছে" : "Successfully sent"}</span>
              <span className="font-bold text-lg text-action">{queueStats.sent}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50">
              <span className="text-sm text-primary">{lang === "bn" ? "ব্যর্থ হয়েছে" : "Failed"}</span>
              <span className="font-bold text-lg text-red-600">{queueStats.failed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-lg text-primary mb-4">
          {lang === "bn" ? "কুইক অ্যাকশন" : "Quick Actions"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/company/whatsapp-contacts" className="p-4 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium text-center hover:bg-blue-100 transition-colors">
            📇 {lang === "bn" ? "কন্ট্যাক্ট" : "Contacts"}
          </a>
          <a href="/company/whatsapp-campaigns" className="p-4 rounded-xl bg-green-50 text-green-700 text-sm font-medium text-center hover:bg-green-100 transition-colors">
            📢 {lang === "bn" ? "ক্যাম্পেইন" : "Campaigns"}
          </a>
          <a href="/company/whatsapp-numbers" className="p-4 rounded-xl bg-purple-50 text-purple-700 text-sm font-medium text-center hover:bg-purple-100 transition-colors">
            🔢 {lang === "bn" ? "নাম্বার জেনারেটর" : "Number Tools"}
          </a>
          <a href="/company/ai-settings" className="p-4 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-medium text-center hover:bg-indigo-100 transition-colors">
            🤖 {lang === "bn" ? "এআই সেটিংস" : "AI Settings"}
          </a>
        </div>
      </div>
    </div>
  );
}

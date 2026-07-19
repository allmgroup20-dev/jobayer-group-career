"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CampaignsPage() {
  const { lang } = useLanguageStore();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");

  const loadCampaigns = async () => {
    try {
      const res = await fetch("/api/whatsapp/campaigns");
      const data = await res.json() as { campaigns?: any[] };
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCampaigns(); }, []);

  const createCampaign = async () => {
    if (!name.trim() || !message.trim()) return;
    setCreating(true);
    setMsg("");
    try {
      const res = await fetch("/api/whatsapp/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      const data = await res.json() as { campaignId?: number };
      if (data.campaignId) {
        setMsg(lang === "bn" ? `ক্যাম্পেইন তৈরি হয়েছে (ID: ${data.campaignId})` : `Campaign created (ID: ${data.campaignId})`);
        setName("");
        setMessage("");
        loadCampaigns();
      }
    } catch {
      setMsg("Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const startCampaign = async (campaignId: number) => {
    setMsg("");
    try {
      const res = await fetch("/api/whatsapp/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", campaignId }),
      });
      const data = await res.json() as { targets?: number };
      setMsg(data.targets ? `Campaign started! ${data.targets} targets` : "Failed");
      loadCampaigns();
    } catch {
      setMsg("Error starting campaign");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  );

  return (
    <div className="py-24 px-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          {lang === "bn" ? "ক্যাম্পেইন" : "Campaigns"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lang === "bn" ? "ম্যাসেজ ক্যাম্পেইন ম্যানেজমেন্ট" : "Message campaign management"}
        </p>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-xl bg-action/10 text-sm text-action font-medium">{msg}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-base text-primary mb-4">
            {lang === "bn" ? "ক্যাম্পেইনসমূহ" : "Campaigns"}
          </h2>
          {campaigns.length === 0 ? (
            <div className="text-center text-sm text-text-secondary py-12">
              {lang === "bn" ? "কোনো ক্যাম্পেইন নেই" : "No campaigns yet"}
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c: any) => (
                <div key={c.id} className="p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm text-primary">{c.name}</div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      c.status === "running" ? "bg-green-50 text-green-700" :
                      c.status === "completed" ? "bg-blue-50 text-blue-700" :
                      "bg-gray-50 text-gray-600"
                    }`}>{c.status}</span>
                  </div>
                  <div className="text-xs text-text-secondary mb-2 line-clamp-2">{c.message}</div>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{lang === "bn" ? "টার্গেট" : "Targets"}: {c.total_targets} | {lang === "bn" ? "পাঠানো" : "Sent"}: {c.sent_count} | {lang === "bn" ? "রিপ্লাই" : "Replies"}: {c.replied_count}</span>
                    {c.status === "draft" && (
                      <button onClick={() => startCampaign(c.id)} className="px-3 py-1 text-xs font-medium bg-action/10 text-action rounded-xl hover:bg-action/20">
                        {lang === "bn" ? "স্টার্ট" : "Start"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-sm text-primary mb-3">
            {lang === "bn" ? "নতুন ক্যাম্পেইন" : "New Campaign"}
          </h3>
          <input
            type="text"
            placeholder={lang === "bn" ? "ক্যাম্পেইনের নাম" : "Campaign name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-white text-primary mb-3"
          />
          <textarea
            placeholder={lang === "bn" ? "মেসেজ লিখুন... {name} ব্যবহার করুন পার্সোনালাইজেশনের জন্য" : "Write message... Use {name} for personalization"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-white text-primary resize-none mb-3"
          />
          <button onClick={createCampaign} disabled={creating || !name || !message} className="w-full px-4 py-2 gradient-premium text-white text-sm font-medium rounded-xl disabled:opacity-50">
            {creating ? "..." : (lang === "bn" ? "ক্যাম্পেইন তৈরি" : "Create Campaign")}
          </button>
        </div>
      </div>
    </div>
  );
}

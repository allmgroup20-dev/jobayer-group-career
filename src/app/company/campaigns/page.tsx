"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import { AIDAFunnel } from "@/components/marketing/AIDAFunnel";
import { ChannelMix } from "@/components/marketing/ChannelMix";

interface CampaignRow {
  name: string; channel: string; budget: number; reach: number; roi: number;
}

interface PageData {
  funnel: { attention: number; interest: number; desire: number; action: number };
  channelMix: Array<{ channel: string; budget: number; percentage: number; effectiveness: number }>;
  campaigns: CampaignRow[];
}

export default function CampaignsPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/company/campaigns");
        if (res.ok) {
          const json: any = await res.json();
          setData(json.data || null);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );

  if (!data) return <div className="p-6 text-text-secondary">{isBn ? "কোনো তথ্য নেই" : "No data"}</div>;

  const { funnel, channelMix, campaigns } = data;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "ক্যাম্পেইন" : "Campaigns"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "IMC ক্যাম্পেইন ডিজাইন" : "IMC Campaign Design"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AIDAFunnel data={funnel} />
        <ChannelMix data={channelMix} />
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "ক্যাম্পেইন পারফরম্যান্স" : "Campaign Performance"}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-semibold text-text-secondary">{isBn ? "নাম" : "Name"}</th>
                <th className="text-left py-2 font-semibold text-text-secondary">{isBn ? "চ্যানেল" : "Channel"}</th>
                <th className="text-right py-2 font-semibold text-text-secondary">{isBn ? "বাজেট" : "Budget"}</th>
                <th className="text-right py-2 font-semibold text-text-secondary">{isBn ? "রিচ" : "Reach"}</th>
                <th className="text-right py-2 font-semibold text-text-secondary">ROI</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2.5 font-semibold text-text">{c.name}</td>
                  <td className="py-2.5 text-text-secondary">{c.channel}</td>
                  <td className="py-2.5 text-right text-text">${c.budget.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-text">{c.reach.toLocaleString()}</td>
                  <td className="py-2.5 text-right">
                    <span className={c.roi >= 0 ? "text-success" : "text-error"}>{c.roi >= 0 ? "+" : ""}{c.roi}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

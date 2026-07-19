"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface Preference {
  id: number;
  worker_id: string;
  channel: string;
  category: string;
  enabled: number;
}

const CHANNELS = ["whatsapp", "push", "email"];
const CATEGORIES = ["promotional", "transactional", "reminder"];

const CHANNEL_LABELS: Record<string, [string, string]> = {
  whatsapp: ["WhatsApp", "হোয়াটসঅ্যাপ"],
  push: ["In-App", "অ্যাপ"],
  email: ["Email", "ইমেইল"],
};

const CATEGORY_LABELS: Record<string, [string, string]> = {
  promotional: ["Promotional", "প্রচারণামূলক"],
  transactional: ["Transactional", "লেনদেন"],
  reminder: ["Reminder", "রিমাইন্ডার"],
};

export default function NotificationPrefsPage() {
  const { lang } = useLanguageStore();
  const [prefs, setPrefs] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const workerId = typeof window !== "undefined" ? localStorage.getItem("worker_id") || "" : "";

  const load = async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications/preferences?workerId=${workerId}`);
      const data = await res.json() as { preferences: Preference[] };
      setPrefs(data.preferences || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [workerId]);

  const toggle = async (channel: string, category: string, current: number) => {
    const enabled = current ? 0 : 1;
    setMessage("");
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, channel, category, enabled }),
      });
      if (res.ok) {
        setPrefs(prev => prev.map(p => p.channel === channel && p.category === category ? { ...p, enabled } : p));
        setMessage(lang === "bn" ? "আপডেট হয়েছে" : "Updated");
      }
    } catch { setMessage(lang === "bn" ? "ব্যর্থ" : "Failed"); }
  };

  const getPref = (ch: string, cat: string) => prefs.find(p => p.channel === ch && p.category === cat);

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "বিজ্ঞপ্তি পছন্দ" : "Notification Preferences"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "কোন ধরনের বিজ্ঞপ্তি কোন মাধ্যমে পেতে চান তা নির্বাচন করুন" : "Choose which notifications you want on each channel"}
          </p>
        </div>

        {message && <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700">{message}</div>}

        {loading ? (
          <div className="flex justify-center py-12"><Skeleton className="h-4 w-32" /></div>
        ) : (
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="p-4 text-left text-sm font-semibold text-primary">{lang === "bn" ? "বিভাগ" : "Category"}</th>
                    {CHANNELS.map(ch => (
                      <th key={ch} className="p-4 text-center text-sm font-semibold text-primary">
                        {CHANNEL_LABELS[ch]?.[lang === "bn" ? 1 : 0] || ch}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map(cat => (
                    <tr key={cat} className="border-b border-border last:border-0">
                      <td className="p-4 text-sm font-medium text-primary">
                        {CATEGORY_LABELS[cat]?.[lang === "bn" ? 1 : 0] || cat}
                      </td>
                      {CHANNELS.map(ch => {
                        const pref = getPref(ch, cat);
                        const enabled = pref?.enabled ?? 1;
                        return (
                          <td key={ch} className="p-4 text-center">
                            <button
                              onClick={() => toggle(ch, cat, enabled)}
                              className={`relative w-12 h-6 rounded-full transition-all ${enabled ? "bg-primary" : "bg-gray-200"}`}
                            >
                              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${enabled ? "left-6" : "left-0.5"}`} />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <div className="text-xs text-text-secondary space-y-1">
          <p>💬 <strong>WhatsApp</strong> — {lang === "bn" ? "হোয়াটসঅ্যাপে বার্তা" : "Messages via WhatsApp"}</p>
          <p>🔔 <strong>In-App</strong> — {lang === "bn" ? "সাইটের ভিতরে বিজ্ঞপ্তি" : "On-site notification bell"}</p>
          <p>📧 <strong>Email</strong> — {lang === "bn" ? "ইমেইলে নোটিফিকেশন" : "Email notifications"}</p>
        </div>
      </div>
    </div>
  );
}

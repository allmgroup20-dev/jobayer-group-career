"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { useSWRFetch } from "@/lib/use-swr-fetch";
import { Skeleton } from "@/components/ui/Skeleton";

interface PlatformUser {
  phone: string;
  preferred_platform: string;
  last_active_platform: string | null;
  platforms_tried: string;
  last_active_at: string | null;
}

const PLATFORM_LABELS: Record<string, [string, string]> = {
  whatsapp: ["WhatsApp", "হোয়াটসঅ্যাপ"],
  messenger: ["Messenger", "মেসেঞ্জার"],
  telegram: ["Telegram", "টেলিগ্রাম"],
};

export default function PlatformPreferencesPage() {
  const { lang } = useLanguageStore();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editPlatform, setEditPlatform] = useState("whatsapp");

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  const { data, loading, refresh } = useSWRFetch<{ users: PlatformUser[] }>(
    `/api/platform-prefs?${qs}`,
    { ttlMs: 180_000 }
  );

  const users = data?.users || [];

  const handleUpdate = async (phone: string) => {
    await fetch("/api/platform-prefs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, platform: editPlatform }),
    });
    setEditing(null);
    refresh();
  };

  const handleDelete = async (phone: string) => {
    if (!confirm(lang === "bn" ? "মুছে ফেলবেন?" : "Delete?")) return;
    await fetch(`/api/platform-prefs?phone=${phone}`, { method: "DELETE" });
    refresh();
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {lang === "bn" ? "প্ল্যাটফর্ম পছন্দ" : "Platform Preferences"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {users.length} {lang === "bn" ? "জন ব্যবহারকারী" : "user(s)"}
            </p>
          </div>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={lang === "bn" ? "ফোন নম্বর অনুসন্ধান..." : "Search phone..."}
            className="w-full sm:w-64 px-4 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Skeleton className="h-4 w-32" /></div>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.phone} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm text-primary">{u.phone}</span>
                    <span className={`ml-3 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.preferred_platform === "whatsapp" ? "bg-green-100 text-green-700" : u.preferred_platform === "messenger" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {PLATFORM_LABELS[u.preferred_platform]?.[lang === "bn" ? 1 : 0] || u.preferred_platform}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(u.phone); setEditPlatform(u.preferred_platform); }} className="text-xs text-primary hover:underline">
                      {lang === "bn" ? "সম্পাদনা" : "Edit"}
                    </button>
                    <button onClick={() => handleDelete(u.phone)} className="text-xs text-red-500 hover:underline">
                      {lang === "bn" ? "মুছুন" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditing(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "প্ল্যাটফর্ম পরিবর্তন" : "Change Platform"}</h3>
              <p className="text-sm text-text-secondary mb-3">{editing}</p>
              <select value={editPlatform} onChange={e => setEditPlatform(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-border bg-white text-sm mb-4">
                {Object.entries(PLATFORM_LABELS).map(([key, labels]) => (
                  <option key={key} value={key}>{labels[lang === "bn" ? 1 : 0]}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button onClick={() => handleUpdate(editing)} variant="primary" size="sm" className="flex-1">
                  {lang === "bn" ? "আপডেট" : "Update"}
                </Button>
                <Button onClick={() => setEditing(null)} variant="outline" size="sm" className="flex-1">
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

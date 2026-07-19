"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLanguageStore } from "@/lib/store";

export default function MyCoursesPage() {
  const { lang } = useLanguageStore();
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [tab, setTab] = useState("unlocked");
  const [unlocked, setUnlocked] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await fetch("/api/auth/me").catch(() => new Response("{}"));
        const profile: any = await profileRes.json().catch(() => ({}));
        let wid = profile.workerId || localStorage.getItem("worker_id");
        if (!wid) return;
        setWorkerId(wid);

        const [unlocksRes, downloadsRes, bookmarksRes] = await Promise.all([
          fetch(`/api/unlocks?workerId=${encodeURIComponent(wid)}`),
          fetch(`/api/downloads?workerId=${encodeURIComponent(wid)}`).catch(() => new Response("{}")),
          fetch(`/api/bookmarks?workerId=${encodeURIComponent(wid)}`),
        ]);

        const [unlocksData, downloadsData, bookmarksData] = await Promise.all([
          unlocksRes.json() as Promise<{ unlocks?: any[] }>,
          downloadsRes.json().catch(() => ({})),
          bookmarksRes.json() as Promise<{ bookmarks?: any[] }>,
        ]);

        setUnlocked(unlocksData.unlocks || []);
        setDownloads((downloadsData as any).downloads || []);
        setBookmarks(bookmarksData.bookmarks || []);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  const tabs = [
    { key: "unlocked", label: "🔓 আনলক", count: unlocked.length },
    { key: "bookmarks", label: "🔖 বুকমার্ক", count: bookmarks.length },
    { key: "downloads", label: "📥 ডাউনলোড", count: downloads.length },
  ];

  if (loading) return <div className="min-h-screen bg-bg py-24 px-4"><div className="max-w-4xl mx-auto text-center"><Skeleton className="h-4 w-32 mx-auto" /></div></div>;

  return (
    <div className="min-h-screen bg-bg py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">{lang === "bn" ? "আমার কোর্স" : "My Courses"}</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                tab === t.key ? "bg-primary text-white border-primary" : "bg-white border-border text-text-secondary"
              }`}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {tab === "unlocked" && (
          <div className="space-y-3">
            {unlocked.length === 0 ? (
              <Card><p className="text-text-secondary text-sm text-center py-4">{lang === "bn" ? "কোনো কোর্স আনলক করা হয়নি" : "No courses unlocked yet"}</p></Card>
            ) : unlocked.map((u: any) => (
              <a key={u.id} href={`/courses/${u.courseId}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-all">
                <span className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg">🔓</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text truncate">{u.courseTitle || `Course #${u.courseId}`}</p>
                  <p className="text-xs text-text-secondary/60">{new Date(u.unlockedAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs text-primary font-bold">দেখুন →</span>
              </a>
            ))}
          </div>
        )}

        {tab === "bookmarks" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookmarks.length === 0 ? (
              <Card className="sm:col-span-2"><p className="text-text-secondary text-sm text-center py-4">{lang === "bn" ? "কোনো বুকমার্ক নেই" : "No bookmarks yet"}</p></Card>
            ) : bookmarks.map((b: any) => (
              <a key={b.id} href={`/courses/${b.courseId}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-all">
                <span className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  {b.trainerImageUrl || b.institutionLogoUrl ? (
                    <img src={b.trainerImageUrl || b.institutionLogoUrl} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text truncate">{b.titleBn || b.title}</p>
                  <p className="text-xs text-text-secondary/60">{b.isPremium ? `👑 ${b.price}৳` : "🆓 ফ্রি"}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {tab === "downloads" && (
          <div className="space-y-3">
            {downloads.length === 0 ? (
              <Card><p className="text-text-secondary text-sm text-center py-4">{lang === "bn" ? "কোনো ডাউনলোড নেই" : "No downloads yet"}</p></Card>
            ) : downloads.map((d: any, i: number) => (
              <div key={d.id || i} className="flex items-center gap-4 bg-white rounded-2xl border border-border p-4">
                <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">📥</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text truncate">{d.courseTitle || `Course #${d.courseId}`}</p>
                  <p className="text-xs text-text-secondary/60">{d.downloadedAt ? new Date(d.downloadedAt).toLocaleDateString() : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

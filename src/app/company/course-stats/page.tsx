"use client";

import { useLanguageStore } from "@/lib/store";
import { Card, StatCard } from "@/components/ui/Card";
import { useSWRFetch } from "@/lib/use-swr-fetch";

interface TopCourse {
  id: number; title: string; titleBn: string | null;
  unlockCount?: number; downloadCount?: number;
  avgRating?: number; ratingCount?: number;
}

interface Stats {
  totalCourses: number; totalUnlocks: number;
  totalComplaints: number; pendingComplaints: number;
  totalDownloads: number; totalRatings: number; avgRating: number;
  topUnlocked: TopCourse[]; topDownloaded: TopCourse[]; topRated: TopCourse[];
  unlocksOverTime: { date: string; count: number }[];
}

export default function CourseStatsPage() {
  const { lang } = useLanguageStore();
  const { data, loading } = useSWRFetch<Stats>("/api/admin/course-stats", { ttlMs: 60_000 });
  const s = data;

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-8">
          {lang === "bn" ? "রিসোর্স পরিসংখ্যান" : "Resource Statistics"}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label={lang === "bn" ? "মোট রিসোর্স" : "Total Resources"} value={loading ? "..." : String(s?.totalCourses || 0)} icon={<span>📚</span>} />
          <StatCard label={lang === "bn" ? "আনলক" : "Unlocks"} value={loading ? "..." : String(s?.totalUnlocks || 0)} icon={<span>🔓</span>} />
          <StatCard label={lang === "bn" ? "ডাউনলোড" : "Downloads"} value={loading ? "..." : String(s?.totalDownloads || 0)} icon={<span>📥</span>} />
          <StatCard label={lang === "bn" ? "রেটিং" : "Avg Rating"} value={loading ? "..." : String(s?.avgRating || 0)} icon={<span>⭐</span>} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label={lang === "bn" ? "কমপ্লেইন" : "Complaints"} value={loading ? "..." : String(s?.totalComplaints || 0)} icon={<span>⚠️</span>} />
          <StatCard label={lang === "bn" ? "পেন্ডিং" : "Pending"} value={loading ? "..." : String(s?.pendingComplaints || 0)} icon={<span>⏳</span>} color="text-amber-600" />
          <StatCard label={lang === "bn" ? "মোট রিভিউ" : "Total Reviews"} value={loading ? "..." : String(s?.totalRatings || 0)} icon={<span>💬</span>} />
          <StatCard label={lang === "bn" ? "গড় রেটিং" : "Avg Rating"} value={loading ? "..." : String(s?.avgRating || 0)} icon={<span>⭐</span>} color="text-amber-500" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="font-bold text-primary mb-3">🔥 {lang === "bn" ? "সর্বাধিক আনলক" : "Top Unlocked"}</h3>
            {s?.topUnlocked?.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-sm text-text flex-1 truncate">{c.titleBn || c.title}</span>
                <span className="text-xs font-bold text-primary">{c.unlockCount}</span>
              </div>
            )) || <p className="text-sm text-text-secondary">—</p>}
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-3">📥 {lang === "bn" ? "সর্বাধিক ডাউনলোড" : "Top Downloaded"}</h3>
            {s?.topDownloaded?.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-sm text-text flex-1 truncate">{c.titleBn || c.title}</span>
                <span className="text-xs font-bold text-primary">{c.downloadCount}</span>
              </div>
            )) || <p className="text-sm text-text-secondary">—</p>}
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-3">⭐ {lang === "bn" ? "সর্বাধিক রেটেড" : "Top Rated"}</h3>
            {s?.topRated?.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-sm text-text flex-1 truncate">{c.titleBn || c.title}</span>
                <span className="text-xs font-bold text-amber-600">⭐{c.avgRating?.toFixed(1)}</span>
              </div>
            )) || <p className="text-sm text-text-secondary">—</p>}
          </Card>
        </div>

        {s?.unlocksOverTime && s.unlocksOverTime.length > 0 && (
          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "গত ৩০ দিনের আনলক" : "Unlocks (Last 30 Days)"}</h3>
            <div className="flex items-end gap-1 h-32 overflow-x-auto">
              {s.unlocksOverTime.map(d => {
                const max = Math.max(...s.unlocksOverTime.map(x => x.count), 1);
                const h = (d.count / max) * 100;
                return (
                  <div key={d.date} className="flex flex-col items-center gap-1 min-w-[32px]">
                    <span className="text-[9px] font-bold text-text-secondary">{d.count}</span>
                    <div className="w-6 rounded-md bg-primary/30" style={{ height: `${Math.max(h, 4)}px` }} title={`${d.date}: ${d.count}`} />
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

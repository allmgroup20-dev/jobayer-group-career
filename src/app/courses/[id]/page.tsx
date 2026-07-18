"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface CourseFile {
  id: number; courseId: number; label: string | null; labelBn: string | null;
  url: string; fileType: string; sortOrder: number;
}

interface Course {
  id: number; title: string; titleBn: string | null;
  description: string | null; descriptionBn: string | null;
  icon: string; price: number; isPremium: number; isNew: number; isVisible: number;
  categoryIds: number[]; categoryNames: string[]; categoryNamesBn: string[];
  avgRating: number; ratingCount: number;
}

interface RatingData {
  count: number; avgRating: number;
  distribution: Record<number, number>;
  reviews: { id: number; rating: number; review: string | null; createdAt: string; workerId: string }[];
}

function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onChange?.(s)} disabled={!onChange}
          className={`${size === "sm" ? "text-sm" : "text-xl"} transition-all ${onChange ? "cursor-pointer hover:scale-125" : "cursor-default"} ${s <= value ? "text-amber-400" : "text-gray-200"}`}>
          {s <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockCount, setUnlockCount] = useState(0);
  const [unlockLimit, setUnlockLimit] = useState<number | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintDesc, setComplaintDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState<RatingData | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [progress, setProgress] = useState<{ completedCount: number; totalFiles: number; percent: number } | null>(null);
  const [completedFiles, setCompletedFiles] = useState<Set<number>>(new Set());
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [courseRes, profileRes, ratingsRes] = await Promise.all([
          fetch(`/api/courses/${id}`),
          fetch("/api/auth/me").catch(() => new Response("{}")),
          fetch(`/api/courses/${id}/ratings`).catch(() => new Response("{}")),
        ]);
        if (!courseRes.ok) { setError("Course not found"); return; }
        const courseData = await courseRes.json() as { course: Course; files: CourseFile[] };
        setCourse(courseData.course);
        setFiles(courseData.files || []);
        try { setRatings(await ratingsRes.json() as RatingData); } catch {}

        const profile: any = await profileRes.json().catch(() => ({}));
        let wid: string | null = profile.workerId || null;
        if (profile.workerId || profile.username) {
          setIsLoggedIn(true);
          if (profile.membershipStatus === "premium" || profile.role === "premium") setIsPremium(true);
        }
        const localWid = localStorage.getItem("worker_id");
        if (localWid && !wid) { setIsLoggedIn(true); wid = localWid;
          try { const p = await (await fetch(`/api/workers/profile?workerId=${localWid}`)).json() as any; if (p.membershipStatus === "premium") setIsPremium(true); } catch {}
        }
        setWorkerId(wid);

        if (wid) {
          const [unlocksRes, limitsRes, bookmarkRes, progressRes] = await Promise.all([
            fetch(`/api/unlocks?workerId=${encodeURIComponent(wid)}`),
            fetch(`/api/unlocks/limits?workerId=${encodeURIComponent(wid)}`),
            fetch(`/api/courses/${id}/bookmarks?workerId=${encodeURIComponent(wid)}`),
            fetch(`/api/courses/${id}/progress?workerId=${encodeURIComponent(wid)}`),
          ]);
          const [unlocksData, limitsData, bookmarkData, progressData] = await Promise.all([
            unlocksRes.json() as Promise<{ unlocks?: { courseId: number }[] }>,
            limitsRes.json() as Promise<{ limits?: { maxUnlocks: number }[] }>,
            bookmarkRes.json() as Promise<{ bookmarked: boolean }>,
            progressRes.json().catch(() => ({})),
          ]);
          const ids = new Set((unlocksData.unlocks || []).map(u => u.courseId));
          setIsUnlocked(ids.has(parseInt(id)));
          setUnlockCount(ids.size);
          if (limitsData.limits?.[0]) setUnlockLimit(limitsData.limits[0].maxUnlocks);
          setBookmarked(bookmarkData.bookmarked);
          const p = progressData as any;
          if (p.percent !== undefined) {
            setProgress(p);
            setCompletedFiles(new Set((p.progress || []).filter((x: any) => x.completed).map((x: any) => x.fileId)));
          }
        }

        if (courseData.course?.categoryIds?.length > 0) {
          try {
            const rel = await fetch(`/api/courses?categoryId=${courseData.course.categoryIds[0]}`);
            const relData = await rel.json() as { courses?: Course[] };
            setRelatedCourses((relData.courses || []).filter((c: Course) => c.id !== parseInt(id)).slice(0, 4));
          } catch {}
        }
      } catch { setError("Failed to load course"); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  const canAccess = isPremium || (course && course.isPremium === 0) || isUnlocked;

  const handleUnlock = async () => {
    if (!workerId || !course) return;
    setUnlocking(true);
    try {
      const res = await fetch("/api/unlocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId, courseId: course.id, unlockedBy: "user" }) });
      const data = await res.json() as { error?: string };
      if (!res.ok) { alert(data.error || "Failed"); return; }
      setIsUnlocked(true); setUnlockCount(prev => prev + 1);
    } catch { alert("Failed to unlock"); } finally { setUnlocking(false); }
  };

  const handleBookmark = async () => {
    if (!workerId || !course) return;
    const action = bookmarked ? "remove" : "add";
    try {
      await fetch(`/api/courses/${id}/bookmarks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId, action }) });
      setBookmarked(!bookmarked);
    } catch {}
  };

  const handleTrackDownload = async (fileId?: number) => {
    if (!workerId) return;
    try { await fetch(`/api/courses/${id}/track-download`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId, fileId }) }); } catch {}
  };

  const handleToggleComplete = async (fileId: number, completed: boolean) => {
    if (!workerId) return;
    try {
      await fetch(`/api/courses/${id}/progress`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId, fileId, completed: !completed }) });
      setCompletedFiles(prev => { const n = new Set(prev); completed ? n.delete(fileId) : n.add(fileId); return n; });
      setProgress(prev => prev ? { ...prev, completedCount: prev.completedCount + (completed ? -1 : 1), percent: prev.totalFiles > 0 ? Math.round(((prev.completedCount + (completed ? -1 : 1)) / prev.totalFiles) * 100) : 0 } : prev);
    } catch {}
  };

  const handleComplaint = async () => {
    if (!workerId || !course || !complaintDesc.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId, courseIds: [course.id], description: complaintDesc }) });
      if (!res.ok) { const d = await res.json() as { error?: string }; throw new Error(d.error || "Failed"); }
      setComplaintOpen(false); setComplaintDesc(""); alert("কমপ্লেইন পাঠানো হয়েছে");
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); } finally { setSubmitting(false); }
  };

  const handleSubmitRating = async () => {
    if (!workerId || !course || userRating === 0) return;
    try {
      await fetch(`/api/courses/${id}/ratings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId, rating: userRating, review: userReview || undefined }) });
      setRatingSubmitted(true);
      const r = await fetch(`/api/courses/${id}/ratings`);
      setRatings(await r.json() as RatingData);
    } catch { alert("রেটিং দিতে ব্যর্থ"); }
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /><p className="mt-4 text-text-secondary font-semibold">লোড হচ্ছে...</p></div></div>;
  if (error || !course) return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="text-center"><p className="text-5xl mb-4">😕</p><p className="text-text-secondary font-bold text-lg">{error || "Course not found"}</p></div></div>;

  const emoji = course.icon || "📌";
  const catDisplay = course.categoryNamesBn?.filter(Boolean).join(", ") || course.categoryNames?.join(", ") || "";

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-10 md:py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shrink-0">{emoji}</div>
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-black text-white leading-tight">{course.titleBn || course.title}</h1>
              {catDisplay && <p className="text-white/70 text-sm font-semibold mt-1">{catDisplay}</p>}
            </div>
            {isLoggedIn && (
              <button onClick={handleBookmark}
                className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg hover:bg-white/30 transition-all cursor-pointer shrink-0"
                title={bookmarked ? "বুকমার্ক থেকে সরান" : "বুকমার্ক করুন"}>
                {bookmarked ? "🔖" : "📑"}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {course.isNew === 1 && <span className="px-3 py-1 rounded-full bg-green-400/20 text-green-100 text-xs font-bold">🆕 NEW</span>}
            {course.isPremium === 1 && <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 text-xs font-bold">👑 PREMIUM</span>}
            {isUnlocked && <span className="px-3 py-1 rounded-full bg-green-400/20 text-green-100 text-xs font-bold">✅ আনলক করা</span>}
            {isPremium && <span className="px-3 py-1 rounded-full bg-purple-400/20 text-purple-100 text-xs font-bold">👑 প্রিমিয়াম</span>}
            {ratings && ratings.count > 0 && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 text-xs font-bold">⭐ {ratings.avgRating} ({ratings.count})</span>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {progress && progress.totalFiles > 0 && (
          <div className="bg-white rounded-2xl border border-border p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-secondary">📊 অগ্রগতি</span>
              <span className="text-xs font-bold text-primary">{progress.completedCount}/{progress.totalFiles} ({progress.percent}%)</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        )}

        {course.description && (
          <div className="bg-white rounded-2xl border border-border p-5 mb-6">
            <h3 className="text-sm font-bold text-primary mb-2">বিবরণ</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{course.descriptionBn || course.description}</p>
          </div>
        )}

        {files.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-5 mb-6">
            <h3 className="text-sm font-bold text-primary mb-4">ফাইল সমূহ ({files.length})</h3>
            <div className="space-y-2">
              {files.map((f, i) => {
                const isCompleted = completedFiles.has(f.id);
                return (
                  <div key={f.id} className="flex items-center gap-2">
                    {isLoggedIn && (
                      <button onClick={() => handleToggleComplete(f.id, isCompleted)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs shrink-0 transition-all cursor-pointer ${
                          isCompleted ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-primary"
                        }`}>
                        {isCompleted ? "✓" : ""}
                      </button>
                    )}
                    <a href={canAccess ? f.url : "#"} target={canAccess ? "_blank" : undefined}
                      rel={canAccess ? "noopener noreferrer" : undefined}
                      onClick={() => canAccess && handleTrackDownload(f.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border flex-1 transition-all ${
                        canAccess ? "border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer" : "border-border/60 opacity-60"
                      }`}>
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 text-sm">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text truncate">{f.labelBn || f.label || `File ${i + 1}`}</p>
                        <p className="text-xs text-text-secondary/60 truncate">{f.url}</p>
                      </div>
                      {canAccess && <span className="text-xs text-primary font-bold shrink-0">📥 ডাউনলোড</span>}
                      {!canAccess && <span className="text-xs text-text-secondary/50 shrink-0">🔒</span>}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          {course.isPremium === 1 && isLoggedIn && !isPremium && !isUnlocked && (
            <Button onClick={handleUnlock} loading={unlocking}
              disabled={unlockLimit !== null && unlockCount >= unlockLimit}>
              {unlockLimit !== null && unlockCount >= unlockLimit ? "👑 প্রিমিয়াম হোন" : "🔓 আনলক করুন"}
            </Button>
          )}
          {course.isPremium === 1 && !isLoggedIn && (
            <a href="/login" className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all">👑 লগইন করে এক্সেস করুন</a>
          )}
          {isLoggedIn && <Button variant="outline" onClick={() => setComplaintOpen(true)}>⚠️ রিপোর্ট করুন</Button>}
        </div>

        {unlockLimit !== null && isLoggedIn && !isPremium && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">আপনার আনলক কোটা: {unlockCount}/{unlockLimit}</div>
        )}

        {ratings && ratings.count > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-bold text-primary mb-4">⭐ রেটিং ও রিভিউ</h3>
            <div className="flex items-start gap-6 mb-4">
              <div className="text-center">
                <p className="text-3xl font-black text-primary">{ratings.avgRating}</p>
                <StarRating value={Math.round(ratings.avgRating)} size="sm" />
                <p className="text-xs text-text-secondary mt-1">{ratings.count}টি রেটিং</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map(s => (
                  <div key={s} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-right font-bold text-text-secondary">{s}</span>
                    <span className="text-amber-400">★</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${ratings.count > 0 ? (ratings.distribution[s] || 0) / ratings.count * 100 : 0}%` }} />
                    </div>
                    <span className="w-6 text-right text-text-secondary/60">{ratings.distribution[s] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
            {ratings.reviews.length > 0 && (
              <div className="space-y-3 border-t border-border pt-4">
                {ratings.reviews.map(r => (
                  <div key={r.id} className="p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-text-secondary">{r.workerId.slice(0, 8)}...</span>
                      <StarRating value={r.rating} size="sm" />
                    </div>
                    {r.review && <p className="text-sm text-text-secondary">{r.review}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isLoggedIn && (
          <div className="mt-6 bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-bold text-primary mb-4">{ratingSubmitted ? "✅ আপনার রেটিং দেওয়া হয়েছে" : "আপনার রেটিং দিন"}</h3>
            {!ratingSubmitted && (
              <><StarRating value={userRating} onChange={setUserRating} />
                {userRating > 0 && (
                  <div className="mt-3 space-y-3">
                    <textarea value={userReview} onChange={e => setUserReview(e.target.value)} placeholder="আপনার মতামত জানান (ঐচ্ছিক)..." className="input-field min-h-[80px] resize-none" />
                    <Button onClick={handleSubmitRating}>⭐ রেটিং দিন</Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {relatedCourses.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-border p-5">
            <h3 className="text-sm font-bold text-primary mb-4">📂 সম্পর্কিত রিসোর্স</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedCourses.map(c => (
                <a key={c.id} href={`/courses/${c.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <span className="text-xl">{c.icon || "📌"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-text truncate">{c.titleBn || c.title}</p>
                    {c.avgRating > 0 && <p className="text-xs text-amber-600">⭐ {c.avgRating}</p>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {complaintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setComplaintOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-primary">⚠️ রিপোর্ট করুন</h3>
              <button onClick={() => setComplaintOpen(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm cursor-pointer">✕</button>
            </div>
            <textarea value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)} placeholder="আপনার সমস্যা জানান..." className="input-field min-h-[120px] resize-none mb-4" />
            <div className="flex gap-3">
              <Button onClick={handleComplaint} loading={submitting} disabled={!complaintDesc.trim()}>পাঠান</Button>
              <Button variant="ghost" onClick={() => setComplaintOpen(false)}>বাতিল</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

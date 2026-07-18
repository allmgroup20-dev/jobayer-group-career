"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

  useEffect(() => {
    async function load() {
      try {
        const [courseRes, profileRes] = await Promise.all([
          fetch(`/api/courses/${id}`),
          fetch("/api/auth/me").catch(() => new Response("{}")),
        ]);
        if (!courseRes.ok) { setError("Course not found"); return; }
        const courseData = await courseRes.json() as { course: Course; files: CourseFile[] };
        setCourse(courseData.course);
        setFiles(courseData.files || []);

        const profile: any = await profileRes.json().catch(() => ({}));
        let wid: string | null = profile.workerId || null;
        if (profile.workerId || profile.username) {
          setIsLoggedIn(true);
          if (profile.membershipStatus === "premium" || profile.role === "premium") setIsPremium(true);
        }
        const localWid = localStorage.getItem("worker_id");
        if (localWid && !wid) {
          setIsLoggedIn(true); wid = localWid;
          try {
            const pRes = await fetch(`/api/workers/profile?workerId=${localWid}`);
            const pData = await pRes.json() as Record<string, any>;
            if (pData.membershipStatus === "premium") setIsPremium(true);
          } catch {}
        }
        setWorkerId(wid);

        if (wid) {
          const [unlocksRes, limitsRes] = await Promise.all([
            fetch(`/api/unlocks?workerId=${encodeURIComponent(wid)}`),
            fetch(`/api/unlocks/limits?workerId=${encodeURIComponent(wid)}`),
          ]);
          const [unlocksData, limitsData] = await Promise.all([
            unlocksRes.json() as Promise<{ unlocks?: { courseId: number }[] }>,
            limitsRes.json() as Promise<{ limits?: { maxUnlocks: number }[] }>,
          ]);
          const ids = new Set((unlocksData.unlocks || []).map(u => u.courseId));
          setIsUnlocked(ids.has(parseInt(id)));
          setUnlockCount(ids.size);
          if (limitsData.limits?.[0]) setUnlockLimit(limitsData.limits[0].maxUnlocks);
        }
      } catch (e) {
        setError("Failed to load course");
      } finally { setLoading(false); }
    }
    load();
  }, [id]);

  const canAccess = isPremium || (course && course.isPremium === 0) || isUnlocked;

  const handleUnlock = async () => {
    if (!workerId || !course) return;
    setUnlocking(true);
    try {
      const res = await fetch("/api/unlocks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, courseId: course.id, unlockedBy: "user" }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { alert(data.error || "Failed"); return; }
      setIsUnlocked(true);
      setUnlockCount(prev => prev + 1);
    } catch { alert("Failed to unlock"); }
    finally { setUnlocking(false); }
  };

  const handleComplaint = async () => {
    if (!workerId || !course || !complaintDesc.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, courseIds: [course.id], description: complaintDesc }),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; throw new Error(d.error || "Failed"); }
      setComplaintOpen(false); setComplaintDesc("");
      alert("কমপ্লেইন পাঠানো হয়েছে");
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /><p className="mt-4 text-text-secondary font-semibold">লোড হচ্ছে...</p></div>
    </div>
  );

  if (error || !course) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center"><p className="text-5xl mb-4">😕</p><p className="text-text-secondary font-bold text-lg">{error || "Course not found"}</p></div>
    </div>
  );

  const emoji = course.icon || "📌";
  const catDisplay = course.categoryNamesBn?.filter(Boolean).join(", ") || course.categoryNames?.join(", ") || "";

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-10 md:py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shrink-0">{emoji}</div>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-white leading-tight">{course.titleBn || course.title}</h1>
              {catDisplay && <p className="text-white/70 text-sm font-semibold mt-1">{catDisplay}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {course.isNew === 1 && <span className="px-3 py-1 rounded-full bg-green-400/20 text-green-100 text-xs font-bold">🆕 NEW</span>}
            {course.isPremium === 1 && <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 text-xs font-bold">👑 PREMIUM</span>}
            {isUnlocked && <span className="px-3 py-1 rounded-full bg-green-400/20 text-green-100 text-xs font-bold">✅ আনলক করা</span>}
            {isPremium && <span className="px-3 py-1 rounded-full bg-purple-400/20 text-purple-100 text-xs font-bold">👑 প্রিমিয়াম</span>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
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
              {files.map((f, i) => (
                <a key={f.id} href={canAccess ? f.url : "#"} target={canAccess ? "_blank" : undefined}
                  rel={canAccess ? "noopener noreferrer" : undefined}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    canAccess ? "border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer" : "border-border/60 opacity-60"
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 text-sm">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text truncate">{f.labelBn || f.label || `File ${i + 1}`}</p>
                    <p className="text-xs text-text-secondary/60 truncate">{f.url}</p>
                  </div>
                  {canAccess && <span className="text-xs text-primary font-bold shrink-0">📥 ডাউনলোড</span>}
                  {!canAccess && <span className="text-xs text-text-secondary/50 shrink-0">🔒</span>}
                </a>
              ))}
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
            <a href="/login" className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all">
              👑 লগইন করে এক্সেস করুন
            </a>
          )}
          {isLoggedIn && (
            <Button variant="outline" onClick={() => setComplaintOpen(true)}>
              ⚠️ রিপোর্ট করুন
            </Button>
          )}
        </div>

        {unlockLimit !== null && isLoggedIn && !isPremium && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
            আপনার আনলক কোটা: {unlockCount}/{unlockLimit}
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
            <textarea value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)}
              placeholder="আপনার সমস্যা জানান..."
              className="input-field min-h-[120px] resize-none mb-4" />
            <div className="flex gap-3">
              <Button onClick={handleComplaint} loading={submitting} disabled={!complaintDesc.trim()}>
                পাঠান
              </Button>
              <Button variant="ghost" onClick={() => setComplaintOpen(false)}>বাতিল</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLanguageStore } from "@/lib/store";
import { CardSkeleton } from "@/components/ui/Skeleton";

const CheckoutModal = dynamic(() => import("@/components/courses/CheckoutModal"), { ssr: false });
import { useDebounce } from "@/lib/use-debounce";

interface Course {
  id: number; title: string; titleBn: string | null;
  description: string | null; descriptionBn: string | null;
  categoryIds: number[]; isNew: number; isVisible: number;
  price: number; isPremium: number;
  categoryNames: string[]; categoryNamesBn: string[];
  fileUrl: string | null; fileCount: number;
  avgRating: number; ratingCount: number;
  trainerId?: number | null; institutionId?: number | null;
  trainerName?: string | null; trainerNameBn?: string | null;
  trainerImageUrl?: string | null;
  institutionName?: string | null; institutionNameBn?: string | null;
  institutionLogoUrl?: string | null;
}

interface Trainer {
  id: number; name: string; name_bn: string | null;
  image_url: string | null; specialty_en: string | null; specialty_bn: string | null;
  institution_id: number | null; sort_order: number;
}

interface Institution {
  id: number; name: string; name_bn: string | null;
  logo_url: string | null; sort_order: number;
}

function getCourseImage(img: string | null | undefined, logo: string | null | undefined): { src: string; alt: string } | null {
  if (img) return { src: img, alt: "" };
  if (logo) return { src: logo, alt: "" };
  return null;
}

export default function CoursesPage() {
  const { lang } = useLanguageStore();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [viewMode, setViewMode] = useState<"all" | "institution">("all");
  const [expandedInstId, setExpandedInstId] = useState<number | null>(null);
  const [expandedTrainerId, setExpandedTrainerId] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [unlockedCourseIds, setUnlockedCourseIds] = useState<Set<number>>(new Set());
  const [unlockLimit, setUnlockLimit] = useState<number | null>(null);
  const [unlockCount, setUnlockCount] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [showCheckout, setShowCheckout] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, profileRes, trainersRes, instRes] = await Promise.all([
          fetch("/api/courses?visibleOnly=1"),
          fetch("/api/auth/me").catch(() => new Response("{}")),
          fetch("/api/trainers").catch(() => new Response("{}")),
          fetch("/api/institutions").catch(() => new Response("{}")),
        ]);
        const coursesData = await coursesRes.json() as { courses?: Course[] };
        const profile: any = await profileRes.json().catch(() => ({}));
        const trainersData = await trainersRes.json().catch(() => ({})) as { trainers?: Trainer[] };
        const instData = await instRes.json().catch(() => ({})) as { institutions?: Institution[] };

        setCourses(coursesData.courses ?? []);
        setTrainers(trainersData.trainers ?? []);
        setInstitutions(instData.institutions ?? []);

        let wid: string | null = null;
        if (profile.workerId || profile.username) {
          setIsLoggedIn(true);
          wid = profile.workerId || null;
          setProfileName(profile.name || profile.cus_name || "");
          setProfilePhone(profile.phone || profile.cus_phone || "");
          setProfileEmail(profile.email || profile.cus_email || "");
          if (profile.membershipStatus === "premium" || profile.role === "premium") {
            setIsPremium(true);
          }
        }

        const localWid = typeof window !== "undefined" ? localStorage.getItem("worker_id") : null;
        if (localWid && !profile.workerId) {
          setIsLoggedIn(true);
          wid = localWid;
          try {
            const pRes = await fetch(`/api/workers/profile?workerId=${localWid}`);
            const pData = await pRes.json() as Record<string, any>;
            if (pData.membershipStatus === "premium") setIsPremium(true);
          } catch {}
        }

        if (wid) {
          setWorkerId(wid);
          try {
            const [unlocksRes, limitsRes, bookmarksRes] = await Promise.all([
              fetch(`/api/unlocks?workerId=${encodeURIComponent(wid)}`),
              fetch(`/api/unlocks/limits?workerId=${encodeURIComponent(wid)}`),
              fetch(`/api/bookmarks?workerId=${encodeURIComponent(wid)}`),
            ]);
            const [unlocksData, limitsData, bookmarksData] = await Promise.all([
              unlocksRes.json() as Promise<{ unlocks?: { courseId: number }[] }>,
              limitsRes.json() as Promise<{ limits?: { maxUnlocks: number }[] }>,
              bookmarksRes.json() as Promise<{ bookmarks?: { courseId: number }[] }>,
            ]);
            const ids = new Set<number>((unlocksData.unlocks || []).map(u => u.courseId));
            setUnlockedCourseIds(ids);
            setUnlockCount(ids.size);
            if (limitsData.limits?.[0]) setUnlockLimit(limitsData.limits[0].maxUnlocks);
            setBookmarkedIds(new Set((bookmarksData.bookmarks || []).map(b => b.courseId)));
          } catch {}
        }
      } catch (e) {
        console.error("Failed to load courses", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    if (paymentStatus === "success") {
      setTimeout(() => alert("✅ পেমেন্ট সফল! আপনার রিসোর্স আনলক করা হয়েছে এবং প্রিমিয়াম মেম্বারশিপ অ্যাক্টিভেট করা হয়েছে।"), 500);
      window.history.replaceState({}, "", "/courses");
    } else if (paymentStatus === "failed") {
      setTimeout(() => alert("❌ পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"), 500);
      window.history.replaceState({}, "", "/courses");
    } else if (paymentStatus === "error") {
      setTimeout(() => alert("❌ পেমেন্ট প্রক্রিয়াকরণে ত্রুটি। সাপোর্ট টিমের সাথে যোগাযোগ করুন।"), 500);
      window.history.replaceState({}, "", "/courses");
    }
  }, []);

  const filtered = useMemo(() => {
    let result = [...courses];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.titleBn || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (c.categoryNames || []).some(n => n.toLowerCase().includes(q))
      );
    }
    return result;
  }, [debouncedSearch, courses]);

  const canAccess = (course: Course) => {
    if (!isLoggedIn) return false;
    if (isPremium) return true;
    if (unlockedCourseIds.has(course.id)) return true;
    return course.isPremium === 0;
  };

  const handleUnlock = async (courseId: number) => {
    if (!workerId) return;
    try {
      const res = await fetch("/api/unlocks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, courseId, unlockedBy: "user" }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        if (res.status === 403) {
          alert("আনলক লিমিট পূর্ণ হয়েছে। প্রিমিয়াম মেম্বারশিপ নিন।");
        } else {
          throw new Error(data.error || "Failed");
        }
        return;
      }
      setUnlockedCourseIds(prev => new Set(prev).add(courseId));
      setUnlockCount(prev => prev + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "আনলক করতে ব্যর্থ");
    }
  };

  const handleBookmark = async (courseId: number) => {
    if (!workerId) return;
    const isBookmarked = bookmarkedIds.has(courseId);
    try {
      await fetch(`/api/courses/${courseId}/bookmarks`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, action: isBookmarked ? "remove" : "add" }),
      });
      setBookmarkedIds(prev => { const n = new Set(prev); isBookmarked ? n.delete(courseId) : n.add(courseId); return n; });
    } catch {}
  };

  const count = courses.length;
  const statusText = !isLoggedIn ? `লগইন করে ${count}টি প্রিমিয়াম রিসোর্স আনলক করুন` : isPremium ? `প্রিমিয়াম সদস্য হিসাবে ${count}টি রিসোর্স এক্সেস করুন` : `${count}টি প্রিমিয়াম রিসোর্স — লিমিট অনুযায়ী আনলক করুন`;

  const courseCard = (item: Course, isRelated = false) => {
    const img = getCourseImage(item.trainerImageUrl, item.institutionLogoUrl);
    const access = canAccess(item);
    const firstCatId = (item.categoryIds || [])[0];
    const catDisplay = firstCatId ? (item.categoryNamesBn?.[0] || item.categoryNames?.[0] || "") : "";

    return (
      <div key={item.id} className="relative">
        <a href={`/courses/${item.id}`}
          className={`block bg-white rounded-2xl border p-4 transition-all duration-200 ${access ? "border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98] group cursor-pointer" : "border-border/60 opacity-75"}`}>
          <div className="flex items-start gap-3.5">
            {img && (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center shrink-0 transition-transform overflow-hidden group-hover:scale-110 group-hover:rotate-3">
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/60">{catDisplay}</span>
                {item.isNew === 1 && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[9px] font-bold">🆕 NEW</span>}
                {item.isPremium === 1 && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold">👑 PREMIUM</span>}
              </div>
              <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${access ? "text-text group-hover:text-primary transition-colors" : "text-text"}`}>{item.titleBn || item.title}</h3>
              {item.description && <p className="text-xs text-text-secondary/70 mt-1 line-clamp-2 leading-relaxed">{item.descriptionBn || item.description}</p>}
              {item.fileCount > 1 && <p className="text-xs text-text-secondary/50 mt-1">+{item.fileCount - 1} more files</p>}
              {item.ratingCount > 0 && <p className="text-xs text-amber-600/70 mt-1">⭐ {item.avgRating} ({item.ratingCount})</p>}
            </div>
          </div>
          {isLoggedIn && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleBookmark(item.id); }}
              className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-black/5 transition-all cursor-pointer"
              title={bookmarkedIds.has(item.id) ? "বুকমার্কেড" : "বুকমার্ক করুন"}>
              {bookmarkedIds.has(item.id) ? "🔖" : "📑"}
            </button>
          )}
        </a>
        {isLoggedIn && !isPremium && item.isPremium === 1 && (
          unlockedCourseIds.has(item.id) ? (
            <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg shadow-lg">✅ আনলক করা</div>
          ) : (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              {unlockLimit === null || unlockCount < unlockLimit ? (
                <button onClick={(e) => { e.preventDefault(); handleUnlock(item.id); }}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg hover:bg-primary/90 transition-all cursor-pointer">🔓 আনলক করুন</button>
              ) : (
                <a href="/dashboard/profile" className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-amber-600 transition-all">👑 প্রিমিয়াম হোন</a>
              )}
            </div>
          )
        )}
        {!isLoggedIn && item.isPremium === 1 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-gray-500/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg shadow-lg">🔒 প্রিমিয়াম</div>
        )}
      </div>
    );
  };

  const sortedInst = [...institutions].sort((a, b) => a.sort_order - b.sort_order);
  const sortedTrainers = [...trainers].sort((a, b) => a.sort_order - b.sort_order);

  const instCourses = (instId: number) => filtered.filter(c => c.institutionId === instId);
  const trainerCourses = (trainerId: number) => filtered.filter(c => c.trainerId === trainerId);

  return (
    <div className="min-h-screen bg-bg">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-bold mb-3 border border-white/10">👑 প্রিমিয়াম রিসোর্স</div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">{loading ? "..." : `মোট ${count}টি`}</h1>
            <p className="text-white/70 font-semibold mt-2 max-w-xl mx-auto text-sm">{statusText}</p>
            {isLoggedIn && !isPremium && (
              <button onClick={() => setShowCheckout(true)}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-white text-primary font-bold rounded-xl hover:shadow-lg hover:shadow-white/20 transition-all text-sm">💳 রিসোর্স আনলক কিনুন</button>
            )}
            <div className="mt-5 max-w-lg mx-auto relative">
              <div className="flex items-center bg-white rounded-2xl shadow-2xl shadow-primary/20 border border-white/20 overflow-hidden transition-all focus-within:shadow-primary/40">
                <span className="pl-5 text-primary/60 text-lg">🔍</span>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="সার্চ করুন রিসোর্স, ক্যাটাগরি..."
                  className="w-full px-4 py-3.5 text-sm font-semibold text-text bg-transparent border-none outline-none placeholder:text-text-secondary/50" />
                {search && <button onClick={() => setSearch("")} className="pr-5 text-text-secondary/50 hover:text-text transition-colors text-lg">✕</button>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── প্রতিষ্ঠান ও প্রশিক্ষক সেকশন (বাম→ডান স্ক্রল) ── */}
      {institutions.length > 0 && (
        <div className="pt-6 md:pt-8 pb-2 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🏛️</span>
              <h2 className="text-sm font-black text-text">{lang === "bn" ? "প্রতিষ্ঠানসমূহ" : "Institutions"}</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 px-4 sm:px-6"
            style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "max(1rem, calc(50vw - 36rem))", paddingRight: "max(1rem, calc(50vw - 36rem))" }}>
            {sortedInst.map(inst => (
              <div key={inst.id} className="flex flex-col items-center text-center shrink-0 w-24 sm:w-28 bg-white rounded-2xl border border-border p-3 sm:p-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
                onClick={() => { setViewMode("institution"); setExpandedInstId(inst.id); window.scrollTo({ top: document.getElementById("course-list")?.offsetTop, behavior: "smooth" }); }}>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-info/5 flex items-center justify-center mb-2 sm:mb-3 border border-border/50">
                  {inst.logo_url ? (
                    <img src={inst.logo_url} alt="" className="w-full h-full object-contain p-1 sm:p-1.5" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-primary">{(inst.name_bn || inst.name).charAt(0)}</span>
                  )}
                </div>
                <p className="text-[11px] sm:text-sm font-bold text-text leading-snug line-clamp-2">{lang === "bn" ? inst.name_bn || inst.name : inst.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {sortedTrainers.length > 0 && (
        <div className="pb-2 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">👨‍🏫</span>
              <h2 className="text-sm font-black text-text">{lang === "bn" ? "প্রশিক্ষকবৃন্দ" : "Trainers"}</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 px-4 sm:px-6"
            style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "max(1rem, calc(50vw - 36rem))", paddingRight: "max(1rem, calc(50vw - 36rem))" }}>
            {sortedTrainers.map(t => (
              <div key={t.id} className="flex flex-col items-center text-center shrink-0 w-24 sm:w-28 bg-white rounded-2xl border border-border p-3 sm:p-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
                onClick={() => { setViewMode("institution"); setExpandedTrainerId(t.id); window.scrollTo({ top: document.getElementById("course-list")?.offsetTop, behavior: "smooth" }); }}>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-info/5 to-orange/5 flex items-center justify-center mb-2 sm:mb-3 border border-border/50">
                  {t.image_url ? (
                    <img src={t.image_url} alt={t.name_bn || t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-info">{(t.name_bn || t.name).charAt(0)}</span>
                  )}
                </div>
                <p className="text-[11px] sm:text-sm font-bold text-text leading-snug line-clamp-2">{t.name_bn || t.name}</p>
                <p className="text-[10px] sm:text-[11px] text-text-secondary/60 mt-0.5 sm:mt-1 line-clamp-1">{t.specialty_bn || t.specialty_en || ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border shadow-sm" id="course-list">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button onClick={() => { setViewMode("all"); setExpandedInstId(null); setExpandedTrainerId(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 cursor-pointer ${viewMode === "all" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white border-border text-text-secondary hover:border-primary/30 hover:text-text"}`}>
              <span>🏠</span>
              <span>সব ({count})</span>
            </button>
            <button onClick={() => { setViewMode("institution"); setExpandedInstId(null); setExpandedTrainerId(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 cursor-pointer ${viewMode === "institution" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white border-border text-text-secondary hover:border-primary/30 hover:text-text"}`}>
              <span>🏛️</span>
              <span>প্রতিষ্ঠান ({institutions.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">

        {viewMode === "all" ? (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-secondary font-bold text-lg">কোনো রিসোর্স পাওয়া যায়নি</p>
                <p className="text-text-secondary/60 text-sm mt-2">অন্য কীওয়ার্ড দিয়ে সার্চ করুন</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {filtered.map(c => courseCard(c))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {sortedInst.map(inst => {
              const coursesForInst = instCourses(inst.id);
              const trainersForInst = sortedTrainers.filter(t => t.institution_id === inst.id);
              const directCourses = coursesForInst.filter(c => !c.trainerId || !trainersForInst.some(t => t.id === c.trainerId));
              const isExpanded = expandedInstId === inst.id;
              return (
                <div key={inst.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                  <button onClick={() => setExpandedInstId(isExpanded ? null : inst.id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer">
                    {inst.logo_url ? (
                      <img src={inst.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-lg font-bold text-primary">{(inst.name_bn || inst.name).charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text">{inst.name_bn || inst.name}</p>
                      <p className="text-xs text-text-secondary/60">{coursesForInst.length}টি রিসোর্স{trainersForInst.length > 0 ? ` · ${trainersForInst.length}জন প্রশিক্ষক` : ""}</p>
                    </div>
                    <span className={`text-text-secondary transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                      {trainersForInst.map(t => {
                        const tCourses = trainerCourses(t.id);
                        const isTExpanded = expandedTrainerId === t.id;
                        return (
                          <div key={t.id}>
                            <button onClick={() => setExpandedTrainerId(isTExpanded ? null : t.id)}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                              {t.image_url ? (
                                <img src={t.image_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-info/10 to-info/5 flex items-center justify-center text-sm font-bold text-info">{(t.name_bn || t.name).charAt(0)}</div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-text">{t.name_bn || t.name}</p>
                                <p className="text-xs text-text-secondary/60">{t.specialty_bn || t.specialty_en || ""} · {tCourses.length}টি কোর্স</p>
                              </div>
                              {tCourses.length > 0 && <span className={`text-xs text-text-secondary transition-transform ${isTExpanded ? "rotate-180" : ""}`}>▼</span>}
                            </button>
                            {isTExpanded && tCourses.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2 pl-12">
                                {tCourses.map(c => courseCard(c))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {directCourses.length > 0 && (
                        <div>
                          {trainersForInst.length > 0 && <p className="text-xs font-bold text-text-secondary mb-2">সরাসরি কোর্স</p>}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {directCourses.map(c => courseCard(c))}
                          </div>
                        </div>
                      )}
                      {trainersForInst.length === 0 && directCourses.length === 0 && (
                        <p className="text-sm text-text-secondary/60 text-center py-4">কোনো কোর্স পাওয়া যায়নি</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isLoggedIn && !isPremium && (
          <div className="text-center mt-8 mb-4 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
            <p className="text-lg font-bold text-primary mb-2">👑 প্রিমিয়াম মেম্বারশিপ নিন</p>
            <p className="text-sm text-text-secondary mb-4">প্রিমিয়াম মেম্বার হয়ে সব রিসোর্স আনলিমিটেড এক্সেস করুন</p>
            <a href="/dashboard/profile" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">👑 প্রিমিয়াম হোন এখনই</a>
          </div>
        )}
      </div>

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95 cursor-pointer">↑</button>
      )}

      {showCheckout && workerId && (
        <CheckoutModal workerId={workerId} cusName={profileName} cusPhone={profilePhone} cusEmail={profileEmail} onClose={() => setShowCheckout(false)} />
      )}
    </div>
  );
}

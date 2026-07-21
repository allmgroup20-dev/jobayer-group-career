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
  imageUrl?: string | null;
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

function getCourseImage(course: Course): { src: string; alt: string } | null {
  if (course.imageUrl) return { src: course.imageUrl, alt: "" };
  if (course.trainerImageUrl) return { src: course.trainerImageUrl, alt: "" };
  if (course.institutionLogoUrl) return { src: course.institutionLogoUrl, alt: "" };
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
    const img = getCourseImage(item);
    const access = canAccess(item);
    const firstCatId = (item.categoryIds || [])[0];
    const catDisplay = firstCatId ? (item.categoryNamesBn?.[0] || item.categoryNames?.[0] || "") : "";

    return (
      <div key={item.id} className="group relative">
        <div
          onClick={() => access && (window.location.href = `/courses/${item.id}`)}
          className={`block bg-white/90 backdrop-blur-sm rounded-2xl border p-4 transition-all duration-300 relative ${
            access
              ? "border-border/60 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 active:scale-[0.98] group cursor-pointer"
              : "border-border/40 opacity-70"
          }`}>
          {img ? (
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-[0.04] pointer-events-none">
              <img src={img.src} alt="" className="w-full h-full object-cover" />
            </div>
          ) : null}
          <div className="flex items-start gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-600/10 flex items-center justify-center shrink-0 transition-all duration-300 overflow-hidden group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-purple-500/20 ring-1 ring-purple-500/10">
              {img ? (
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.classList.add('fallback'); }} />
              ) : (
                <span className="text-lg font-black text-purple-500/40">{(item.titleBn || item.title || "?").charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                {catDisplay && <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50">{catDisplay}</span>}
                {item.isNew === 1 && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-100/80 border border-green-200 text-green-700 text-[9px] font-bold tracking-wide">NEW</span>}
                {item.isPremium === 1 && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold tracking-wide">PREMIUM</span>}
              </div>
              <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${access ? "text-text group-hover:text-primary transition-colors" : "text-text/70"}`}>{item.titleBn || item.title}</h3>
              {item.description && <p className="text-xs text-text-secondary/60 mt-1 line-clamp-2 leading-relaxed">{item.descriptionBn || item.description}</p>}
              {item.fileCount > 1 && <p className="text-xs text-text-secondary/40 mt-1">+{item.fileCount - 1} more files</p>}
              {item.ratingCount > 0 && (
                <p className="text-xs text-amber-600/60 mt-1 flex items-center gap-1">
                  <span className="text-[10px]">⭐</span><span>{item.avgRating}</span><span className="text-text-secondary/30">({item.ratingCount})</span>
                </p>
              )}
            </div>
          </div>
          {isLoggedIn && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleBookmark(item.id); }}
              className="absolute top-3 right-3 z-20 w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-black/5 transition-all cursor-pointer"
              title={bookmarkedIds.has(item.id) ? "বুকমার্কেড" : "বুকমার্ক করুন"}>
              {bookmarkedIds.has(item.id) ? "🔖" : "📑"}
            </button>
          )}
        </div>
        {isLoggedIn && !isPremium && item.isPremium === 1 && (
          unlockedCourseIds.has(item.id) ? (
            <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg shadow-lg">✅ আনলক করা</div>
          ) : (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
              {unlockLimit === null || unlockCount < unlockLimit ? (
                <button onClick={(e) => { e.preventDefault(); handleUnlock(item.id); }}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95">🔓 আনলক করুন</button>
              ) : (
                <a href="/dashboard/profile" className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-xl hover:from-amber-400 hover:to-amber-500 transition-all">👑 প্রিমিয়াম হোন</a>
              )}
            </div>
          )
        )}
        {!isLoggedIn && item.isPremium === 1 && (
          <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-gray-500/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg shadow-lg">🔒 প্রিমিয়াম</div>
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
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-500/8 blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/5 blur-[2px] animate-pulse" style={{
              width: `${4 + Math.random() * 8}px`, height: `${4 + Math.random() * 8}px`,
              top: `${10 + Math.random() * 80}%`, left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 1.5}s`, animationDuration: `${3 + Math.random() * 4}s`,
            }} />
          ))}
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-xs font-bold mb-4 border border-white/10 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              {lang === "bn" ? "প্রিমিয়াম রিসোর্স লাইব্রেরি" : "Premium Resource Library"}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
              {loading ? (
                <span className="inline-block bg-white/10 rounded-xl px-8 py-2 animate-pulse">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              ) : (
                <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                  {count === 0 ? (lang === "bn" ? "রিসোর্স লাইব্রেরি" : "Resource Library") : `${count}`}
                </span>
              )}
            </h1>
            {!loading && (
              <p className="text-white/50 font-medium mt-3 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                {statusText}
              </p>
            )}
            {isLoggedIn && !isPremium && (
              <button onClick={() => setShowCheckout(true)}
                className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 text-amber-900 font-bold rounded-xl hover:shadow-xl hover:shadow-amber-400/30 hover:-translate-y-0.5 transition-all text-sm shadow-lg shadow-amber-400/20">
                💳 {lang === "bn" ? "রিসোর্স আনলক কিনুন" : "Buy Resource Unlock"}
              </button>
            )}
            <div className="mt-6 max-w-lg mx-auto relative">
              <div className="flex items-center bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 border border-white/10 overflow-hidden transition-all duration-300 focus-within:bg-white/15 focus-within:border-white/20 focus-within:shadow-purple-500/10">
                <span className="pl-5 text-white/40 text-lg shrink-0">🔍</span>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder={lang === "bn" ? "সার্চ করুন রিসোর্স, ক্যাটাগরি..." : "Search resources, categories..."}
                  className="w-full px-4 py-3.5 text-sm font-semibold text-white bg-transparent border-none outline-none placeholder:text-white/30" />
                {search && <button onClick={() => setSearch("")} className="pr-5 text-white/30 hover:text-white/60 transition-colors text-lg">✕</button>}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </section>

      {/* ── Institution & Trainer Carousel ── */}
      {institutions.length > 0 && (
        <section className="pt-8 pb-2 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-purple-500" />
              <h2 className="text-sm font-black text-text tracking-wide">{lang === "bn" ? "প্রতিষ্ঠানসমূহ" : "Institutions"}</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-4 sm:px-6"
            style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "max(1rem, calc(50vw - 36rem))", paddingRight: "max(1rem, calc(50vw - 36rem))" }}>
            {sortedInst.map(inst => (
              <div key={inst.id}
                onClick={() => { setViewMode("institution"); setExpandedInstId(inst.id); window.scrollTo({ top: document.getElementById("course-list")?.offsetTop, behavior: "smooth" }); }}
                className="group flex flex-col items-center text-center shrink-0 w-24 sm:w-28 bg-white/80 backdrop-blur-sm rounded-2xl border border-border/50 p-3 sm:p-4 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-purple-500/5 flex items-center justify-center mb-2 sm:mb-3 border border-border/40 ring-1 ring-primary/5 group-hover:ring-primary/20 transition-all">
                  {inst.logo_url ? (
                    <img src={inst.logo_url} alt="" className="w-full h-full object-contain p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-primary/50">{(inst.name_bn || inst.name).charAt(0)}</span>
                  )}
                </div>
                <p className="text-[11px] sm:text-sm font-bold text-text leading-snug line-clamp-2 group-hover:text-primary transition-colors">{lang === "bn" ? inst.name_bn || inst.name : inst.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {sortedTrainers.length > 0 && (
        <section className="pb-2 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-orange-400 to-amber-500" />
              <h2 className="text-sm font-black text-text tracking-wide">{lang === "bn" ? "প্রশিক্ষকবৃন্দ" : "Trainers"}</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-4 sm:px-6"
            style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", paddingLeft: "max(1rem, calc(50vw - 36rem))", paddingRight: "max(1rem, calc(50vw - 36rem))" }}>
            {sortedTrainers.map(t => (
              <div key={t.id}
                onClick={() => { setViewMode("institution"); setExpandedTrainerId(t.id); window.scrollTo({ top: document.getElementById("course-list")?.offsetTop, behavior: "smooth" }); }}
                className="group flex flex-col items-center text-center shrink-0 w-24 sm:w-28 bg-white/80 backdrop-blur-sm rounded-2xl border border-border/50 p-3 sm:p-4 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1.5 hover:border-orange-200/30 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gradient-to-br from-orange-400/10 to-amber-400/10 flex items-center justify-center mb-2 sm:mb-3 border-2 border-border/30 ring-1 ring-orange-300/10 group-hover:ring-orange-300/30 group-hover:border-orange-200/40 transition-all">
                  {t.image_url ? (
                    <img src={t.image_url} alt={t.name_bn || t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-black text-orange-400/50">{(t.name_bn || t.name).charAt(0)}</span>
                  )}
                </div>
                <p className="text-[11px] sm:text-sm font-bold text-text leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">{t.name_bn || t.name}</p>
                <p className="text-[10px] sm:text-[11px] text-text-secondary/50 mt-0.5 sm:mt-1 line-clamp-1">{t.specialty_bn || t.specialty_en || ""}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Sticky Filter Bar ── */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-border/40 shadow-sm" id="course-list">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button onClick={() => { setViewMode("all"); setExpandedInstId(null); setExpandedTrainerId(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                viewMode === "all"
                  ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20 border-transparent"
                  : "bg-white/50 border border-border/60 text-text-secondary hover:border-primary/30 hover:text-text backdrop-blur-sm"
              }`}>
              <span className={viewMode === "all" ? "" : "opacity-50"}>📋</span>
              <span>{lang === "bn" ? "সব" : "All"} ({count})</span>
            </button>
            <button onClick={() => { setViewMode("institution"); setExpandedInstId(null); setExpandedTrainerId(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                viewMode === "institution"
                  ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20 border-transparent"
                  : "bg-white/50 border border-border/60 text-text-secondary hover:border-primary/30 hover:text-text backdrop-blur-sm"
              }`}>
              <span className={viewMode === "institution" ? "" : "opacity-50"}>🏛️</span>
              <span>{lang === "bn" ? "প্রতিষ্ঠান" : "Institution"} ({institutions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">

        {viewMode === "all" ? (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white/80 rounded-2xl border border-border/50 p-4 animate-pulse">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-200 to-purple-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                        <div className="h-2 bg-gray-50 rounded-full w-1/2" />
                        <div className="h-2 bg-gray-50 rounded-full w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-purple-100 to-indigo-50 flex items-center justify-center text-3xl shadow-inner">
                  {search ? "🔍" : "📚"}
                </div>
                <p className="text-text-secondary font-bold text-lg">
                  {search
                    ? (lang === "bn" ? `"${search}" এর জন্য কোনো রিসোর্স পাওয়া যায়নি` : `No resources found for "${search}"`)
                    : (lang === "bn" ? "কোনো রিসোর্স নেই" : "No resources available")}
                </p>
                <p className="text-text-secondary/50 text-sm mt-2 max-w-sm mx-auto">
                  {search
                    ? (lang === "bn" ? "অন্য কীওয়ার্ড দিয়ে সার্চ করুন অথবা সব রিসোর্স দেখুন" : "Try a different keyword or browse all resources")
                    : (lang === "bn" ? "শীঘ্রই নতুন রিসোর্স যুক্ত হবে" : "New resources will be added soon")}
                </p>
                {search && (
                  <button onClick={() => setSearch("")}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                    ✕ {lang === "bn" ? "সার্চ ক্লিয়ার করুন" : "Clear Search"}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(c => courseCard(c))}
              </div>
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
                <div key={inst.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <button onClick={() => setExpandedInstId(isExpanded ? null : inst.id)}
                    className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-transparent transition-all cursor-pointer">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/5 flex items-center justify-center shrink-0 border border-border/30">
                      {inst.logo_url ? (
                        <img src={inst.logo_url} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-lg font-bold text-primary/50">{(inst.name_bn || inst.name).charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text">{inst.name_bn || inst.name}</p>
                      <p className="text-xs text-text-secondary/50">{coursesForInst.length}টি রিসোর্স{trainersForInst.length > 0 ? ` · ${trainersForInst.length}জন প্রশিক্ষক` : ""}</p>
                    </div>
                    <span className={`w-6 h-6 rounded-lg bg-border/30 flex items-center justify-center text-xs text-text-secondary transition-transform duration-300 ${isExpanded ? "rotate-180 bg-primary/10 text-primary" : ""}`}>▼</span>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border/30 px-4 pb-4 pt-3 space-y-4">
                      {trainersForInst.map(t => {
                        const tCourses = trainerCourses(t.id);
                        const isTExpanded = expandedTrainerId === t.id;
                        return (
                          <div key={t.id}>
                            <button onClick={() => setExpandedTrainerId(isTExpanded ? null : t.id)}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-transparent transition-all cursor-pointer">
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-orange-400/10 to-amber-400/5 flex items-center justify-center shrink-0 border border-border/20">
                                {t.image_url ? (
                                  <img src={t.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-sm font-bold text-orange-400/50">{(t.name_bn || t.name).charAt(0)}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-text">{t.name_bn || t.name}</p>
                                <p className="text-xs text-text-secondary/50">{t.specialty_bn || t.specialty_en || ""} · {tCourses.length}টি রিসোর্স</p>
                              </div>
                              {tCourses.length > 0 && <span className={`w-5 h-5 rounded-md bg-border/20 flex items-center justify-center text-[10px] text-text-secondary transition-transform duration-300 ${isTExpanded ? "rotate-180 bg-primary/10 text-primary" : ""}`}>▼</span>}
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
                          {trainersForInst.length > 0 && <p className="text-xs font-bold text-text-secondary/60 mb-2 tracking-wide uppercase">{lang === "bn" ? "সরাসরি রিসোর্স" : "Direct Resources"}</p>}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {directCourses.map(c => courseCard(c))}
                          </div>
                        </div>
                      )}
                      {trainersForInst.length === 0 && directCourses.length === 0 && (
                        <p className="text-sm text-text-secondary/50 text-center py-4">{lang === "bn" ? "কোনো রিসোর্স পাওয়া যায়নি" : "No resources found"}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isLoggedIn && !isPremium && (
          <div className="relative mt-10 mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-secondary/5 border border-primary/10">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent" />
            <div className="relative p-6 md:p-8 text-center">
              <span className="text-4xl mb-2 block">👑</span>
              <p className="text-lg font-bold text-primary mb-1">{lang === "bn" ? "প্রিমিয়াম মেম্বারশিপ নিন" : "Get Premium Membership"}</p>
              <p className="text-sm text-text-secondary/70 mb-4 max-w-md mx-auto">{lang === "bn" ? "প্রিমিয়াম মেম্বার হয়ে সব রিসোর্স আনলিমিটেড এক্সেস করুন" : "Get unlimited access to all resources with premium membership"}</p>
              <a href="/dashboard/profile"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold text-sm hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20">
                👑 {lang === "bn" ? "প্রিমিয়াম হোন এখনই" : "Become Premium Now"}
              </a>
            </div>
          </div>
        )}
      </div>

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-xl shadow-primary/30 flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary/40 active:scale-95 cursor-pointer backdrop-blur-sm">
          ↑
        </button>
      )}

      {showCheckout && workerId && (
        <CheckoutModal workerId={workerId} cusName={profileName} cusPhone={profilePhone} cusEmail={profileEmail} onClose={() => setShowCheckout(false)} />
      )}
    </div>
  );
}

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useDebounce } from "@/lib/use-debounce";

interface CourseCategory {
  id: number; name: string; nameBn: string | null; icon: string; isVisible: number;
}

interface CourseFile {
  id: number; courseId: number; label: string | null; labelBn: string | null;
  url: string; fileType: string; sortOrder: number;
}

interface Course {
  id: number; title: string; titleBn: string | null;
  description: string | null; descriptionBn: string | null;
  categoryId: number | null; isNew: number; isVisible: number;
  icon: string; price: number; isPremium: number;
  categoryName: string | null; categoryNameBn: string | null;
}

type CourseWithFiles = Course & { files: CourseFile[] };

const catEmoji: Record<string, string> = {
  "Platform": "📱", "10MS": "🎓", "Ghoori": "🏫", "SkillUper": "📈",
  "E-Shikhon": "🎬", "eShikhon": "🎬", "MSB": "🏛️", "Creative IT": "💻",
  "Hacking": "🛡️", "File Collection": "📁", "ChatGPT": "🤖",
  "Graphics Design": "🎨", "Digital Marketing": "📊", "SEO": "🔍",
  "Facebook Marketing": "👍", "YouTube": "🎥", "Data Entry": "⌨️",
  "Video Editing": "✂️", "Software": "📦", "Logo Design": "✏️",
  "Motion Graphics": "✨", "WordPress": "🌐", "Android App": "📱",
  "Ethical Hacking": "🔒", "Facebook Hacking": "🔓", "WiFi Hacking": "📶",
  "Cyber Security": "🛡️", "Android Hacking": "📱", "Blackhat": "💀",
  "MS Office": "📋", "Quran": "🕋", "AutoCAD": "📐",
  "Content Writing": "✍️", "Job Preparation": "💼", "English": "🇬🇧",
  "Handwriting": "🖊️", "CPA Marketing": "💰", "Affiliate Marketing": "🔗",
  "Fiverr": "⭐", "Web Development": "🌐", "Facebook": "👍", "Python": "🐍",
};

function getCourseEmoji(item: { icon: string; cat?: string }): string {
  if (item.icon && item.icon !== "📌") return item.icon;
  if (item.cat && catEmoji[item.cat]) return catEmoji[item.cat];
  return "📌";
}

function getCourseEmojiBg(emoji: string): string {
  const m: Record<string, string> = {
    "👨‍💻": "from-blue-500/10 to-blue-600/5 text-blue-600",
    "🤖": "from-purple-500/10 to-purple-600/5 text-purple-600",
    "🎮": "from-green-500/10 to-green-600/5 text-green-600",
    "📱": "from-orange-500/10 to-orange-600/5 text-orange-600",
    "🔒": "from-red-500/10 to-red-600/5 text-red-600",
    "📶": "from-cyan-500/10 to-cyan-600/5 text-cyan-600",
    "💰": "from-amber-500/10 to-amber-600/5 text-amber-600",
    "🎨": "from-pink-500/10 to-pink-600/5 text-pink-600",
    "🎬": "from-rose-500/10 to-rose-600/5 text-rose-600",
    "🌐": "from-teal-500/10 to-teal-600/5 text-teal-600",
    "📊": "from-emerald-500/10 to-emerald-600/5 text-emerald-600",
    "🧠": "from-indigo-500/10 to-indigo-600/5 text-indigo-600",
    "👑": "from-amber-500/10 to-amber-600/5 text-amber-600",
    "⭐": "from-yellow-500/10 to-yellow-600/5 text-yellow-600",
    "🔥": "from-red-500/10 to-red-600/5 text-red-600",
    "📖": "from-amber-500/10 to-amber-600/5 text-amber-600",
    "💼": "from-blue-500/10 to-blue-600/5 text-blue-600",
    "🗣️": "from-green-500/10 to-green-600/5 text-green-600",
    "📐": "from-orange-500/10 to-orange-600/5 text-orange-600",
    "🛡️": "from-red-500/10 to-red-600/5 text-red-600",
    "📁": "from-slate-500/10 to-slate-600/5 text-slate-600",
  };
  return m[emoji] || "from-blue-500/10 to-blue-600/5 text-blue-600";
}

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [activeCat, setActiveCat] = useState("all");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseWithFiles[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, catsRes] = await Promise.all([
          fetch("/api/courses?visibleOnly=1"),
          fetch("/api/courses/categories"),
        ]);
        const coursesData = await coursesRes.json() as { courses?: Course[] };
        const catsData = await catsRes.json() as { categories?: CourseCategory[] };
        const allCats = catsData.categories ?? [];

        const courseList = coursesData.courses ?? [];
        const withFiles = await Promise.all(
          courseList.map(async (c) => {
            try {
              const fRes = await fetch(`/api/courses/${c.id}/files`);
              const fData = await fRes.json() as { files?: CourseFile[] };
              return { ...c, files: fData.files ?? [] };
            } catch { return { ...c, files: [] as CourseFile[] }; }
          })
        );

        setCourses(withFiles);
        setCategories(allCats.filter(c => c.isVisible));
      } catch (e) {
        console.error("Failed to load courses", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const wid = localStorage.getItem("worker_id");
    if (!wid) return;
    setIsLoggedIn(true);
    fetch(`/api/workers/profile?workerId=${wid}`)
      .then(r => r.json())
      .then((d: any) => {
        setIsPremium(d.membershipStatus === "premium");
      })
      .catch(() => {});
  }, []);

  const catNameMap = useMemo(() => {
    const map: Record<number, { name: string; nameBn: string | null }> = {};
    for (const cat of categories) {
      map[cat.id] = { name: cat.name, nameBn: cat.nameBn };
    }
    return map;
  }, [categories]);

  const categoryOrder = useMemo(() => {
    const seen = new Set<string>();
    const order: { id: number; name: string; nameBn: string | null; icon: string }[] = [];
    for (const c of courses) {
      if (c.categoryId && !seen.has(String(c.categoryId))) {
        seen.add(String(c.categoryId));
        const cat = catNameMap[c.categoryId];
        if (cat) {
          order.push({ id: c.categoryId, name: cat.name, nameBn: cat.nameBn, icon: getCourseEmoji({ icon: "", cat: cat.name }) });
        }
      }
    }
    return order;
  }, [courses, catNameMap]);

  const countsByCat = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of courses) {
      const key = String(c.categoryId || "uncategorized");
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [courses]);

  const filtered = useMemo(() => {
    let result = [...courses];
    if (activeCat !== "all") {
      result = result.filter((c) => String(c.categoryId) === activeCat);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.titleBn || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (catNameMap[c.categoryId || -1]?.name || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [debouncedSearch, activeCat, courses, catNameMap]);

  const isExternal = (url: string) =>
    url.includes("terabox") || url.includes("1024tera") || url.includes("4funbox") ||
    url.includes("drive.google") || url.includes("mega.nz") || url.includes("freecoursebd");

  const freeAccess = isPremium || !isLoggedIn;

  return (
    <div className="min-h-screen bg-bg">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-bold mb-4 border border-white/10">
              {loading ? (
                <span>⏳ লোড হচ্ছে...</span>
              ) : !isLoggedIn ? (
                <span>📚 মোট {courses.length}টি রিসোর্স — লগইন করে এক্সেস করুন</span>
              ) : isPremium ? (
                <span>👑 মোট {courses.length}টি রিসোর্স — প্রিমিয়াম এক্সেস</span>
              ) : (
                <span>🎁 মোট {courses.length}টি রিসোর্স — {courses.length}টি ফ্রি</span>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
              {isPremium ? "👑 সকল কোর্স, সফটওয়্যার &amp; রিসোর্স" : !isLoggedIn ? "📚 কোর্স, সফটওয়্যার &amp; রিসোর্স" : "🎁 কোর্স সমূহ"}
            </h1>
            <p className="text-white/80 font-semibold mt-3 max-w-xl mx-auto text-sm md:text-base">
              {loading ? "তথ্য লোড হচ্ছে..." : !isLoggedIn ? `লগইন করে ${courses.length}টি রিসোর্স এক্সেস করুন` : isPremium ? `প্রিমিয়াম সদস্য হিসাবে ${courses.length}টি রিসোর্স এক্সেস করুন` : `${courses.length}টি রিসোর্স এক্সেস করুন`}
            </p>

            <div className="mt-6 max-w-lg mx-auto relative">
              <div className="flex items-center bg-white rounded-2xl shadow-2xl shadow-primary/20 border border-white/20 overflow-hidden transition-all focus-within:shadow-primary/40">
                <span className="pl-5 text-primary/60 text-lg">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="সার্চ করুন কোর্স, ক্যাটাগরি..."
                  className="w-full px-4 py-3.5 text-sm font-semibold text-text bg-transparent border-none outline-none placeholder:text-text-secondary/50"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="pr-5 text-text-secondary/50 hover:text-text transition-colors text-lg">✕</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setActiveCat("all")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 cursor-pointer ${
                activeCat === "all"
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-white border-border text-text-secondary hover:border-primary/30 hover:text-text"
              }`}
            >
              <span>🏠</span>
              <span>সব ({courses.length})</span>
            </button>
            {categoryOrder.map((cat) => {
              const count = countsByCat[String(cat.id)] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(String(cat.id))}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 cursor-pointer ${
                    activeCat === String(cat.id)
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-white border-border text-text-secondary hover:border-primary/30 hover:text-text"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.nameBn || cat.name}</span>
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary font-bold text-xs">
            {activeCat === "all" ? `মোট ${filtered.length} টি রিসোর্স` : `${catNameMap[Number(activeCat)]?.nameBn || catNameMap[Number(activeCat)]?.name || ''} — ${filtered.length} টি`}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-30">🔍</div>
            <p className="text-text-secondary font-bold text-lg">কোনো রিসোর্স পাওয়া যায়নি</p>
            <p className="text-text-secondary/60 text-sm mt-2">অন্য কীওয়ার্ড দিয়ে সার্চ করুন</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((item) => {
              const emoji = getCourseEmoji(item);
              const bgColor = getCourseEmojiBg(emoji);
              const firstFile = item.files.find(f => f.fileType === "link") || item.files[0];
              const url = firstFile?.url || "#";

              const catInfo = item.categoryId ? catNameMap[item.categoryId] : null;
              const catDisplay = catInfo?.nameBn || catInfo?.name || "";

              return (
                <a
                  key={item.id}
                  href={freeAccess ? url : "#"}
                  target={freeAccess ? "_blank" : undefined}
                  rel={freeAccess ? "noopener noreferrer" : undefined}
                  className={`block bg-white rounded-2xl border p-4 transition-all duration-200 ${
                    freeAccess
                      ? "border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98] group cursor-pointer"
                      : "border-border/60 opacity-85"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bgColor} flex items-center justify-center text-lg shrink-0 transition-transform ${freeAccess ? "group-hover:scale-110 group-hover:rotate-3" : ""}`}>
                      <span>{emoji}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/60">
                          {catDisplay}
                        </span>
                        {item.isNew === 1 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[9px] font-bold">🆕 NEW</span>
                        )}
                        {item.isPremium === 1 && !freeAccess && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold">👑 PREMIUM</span>
                        )}
                      </div>
                      <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${freeAccess ? "text-text group-hover:text-primary transition-colors" : "text-text"}`}>
                        {item.titleBn || item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-text-secondary/70 mt-1 line-clamp-2 leading-relaxed">
                          {item.descriptionBn || item.description}
                        </p>
                      )}
                      {item.files.length > 1 && (
                        <p className="text-xs text-text-secondary/50 mt-1">+{item.files.length - 1} more files</p>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >↑</button>
      )}
    </div>
  );
}

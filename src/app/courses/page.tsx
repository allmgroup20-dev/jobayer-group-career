"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { courses, categoryOrder, categoryNames } from "@/data/courses-data";

const catEmoji: Record<string, string> = {
  "Platform": "📱", "10MS": "🎓", "Ghoori": "🏫", "SkillUper": "📈", "E-Shikhon": "🎬",
  "eShikhon": "🎬", "MSB": "🏛️", "Creative IT": "💻", "Hacking": "🛡️", "File Collection": "📁",
  "ChatGPT": "🤖", "10MS PDF": "📄", "Bongo Academy": "▶️", "Graphics Design": "🎨",
  "Digital Marketing": "📊", "SEO": "🔍", "Facebook Marketing": "👍", "YouTube": "🎥",
  "YouTube Marketing": "🎥", "Data Entry": "⌨️", "Video Editing": "✂️", "Software": "📦",
  "Logo Design": "✏️", "Motion Graphics": "✨", "WordPress": "🌐", "Android App": "📱",
  "Ethical Hacking": "🔒", "Facebook Hacking": "🔓", "WiFi Hacking": "📶", "Cyber Security": "🛡️",
  "Android Hacking": "📱", "Blackhat": "💀", "MS Office": "📋", "Quran": "🕋",
  "AutoCAD": "📐", "Content Writing": "✍️", "Job Preparation": "💼", "English": "🇬🇧",
  "Handwriting": "🖊️", "CPA Marketing": "💰", "Affiliate Marketing": "🔗", "Fiverr": "⭐",
  "IT Bari": "🏠", "Graphics School": "🎨", "Spoken English": "🗣️", "Outsourcing": "🌍",
  "Programming": "👨‍💻", "Game Development": "🎮", "Business": "📊", "LinkedIn": "💼",
  "Email Marketing": "📧", "Resources": "📂", "Other": "📌", "Web Development": "🌐",
  "Facebook": "👍", "Python": "🐍",
};

function getCourseEmoji(item: { cat: string; icon: string }): string {
  if (item.cat === "Programming" || item.icon === "fa-python" || item.icon === "fa-code") return "👨‍💻";
  if (item.icon === "fa-robot" || item.cat === "ChatGPT") return "🤖";
  if (item.icon === "fa-gamepad") return "🎮";
  if (item.icon === "fa-android") return "📱";
  if (item.icon === "fa-lock" || item.icon === "fa-shield-halved" || item.icon === "fa-user-secret") return "🔒";
  if (item.icon === "fa-wifi") return "📶";
  if (item.icon === "fa-money-bill-wave" || item.icon === "fa-dollar-sign") return "💰";
  if (item.icon === "fa-palette" || item.icon === "fa-pen-nib" || item.icon === "fa-pencil-ruler") return "🎨";
  if (item.icon === "fa-film" || item.icon === "fa-video" || item.icon === "fa-clapperboard") return "🎬";
  if (item.icon === "fa-music") return "🎵";
  if (item.icon === "fa-globe" || item.icon === "fa-wordpress") return "🌐";
  if (item.icon === "fa-database" || item.icon === "fa-server") return "🗄️";
  if (item.icon === "fa-calculator" || item.icon === "fa-file-excel") return "📊";
  if (item.icon === "fa-brain") return "🧠";
  if (item.icon === "fa-rocket") return "🚀";
  if (item.icon === "fa-key") return "🔑";
  if (item.icon === "fa-crown") return "👑";
  if (item.icon === "fa-star" || item.icon === "fa-ranking-star") return "⭐";
  if (item.icon === "fa-certificate") return "📜";
  if (item.icon === "fa-trophy") return "🏆";
  if (item.icon === "fa-fire") return "🔥";
  if (item.icon === "fa-heart") return "❤️";
  if (item.icon === "fa-book" || item.icon === "fa-book-quran") return "📖";
  if (item.icon === "fa-microphone") return "🎤";
  if (item.icon === "fa-camera") return "📷";
  if (item.icon === "fa-image") return "🖼️";
  if (item.icon === "fa-puzzle-piece") return "🧩";
  if (item.icon === "fa-lightbulb") return "💡";
  if (item.icon === "fa-comments" || item.icon === "fa-envelope") return "💬";
  if (item.icon === "fa-handshake") return "🤝";
  if (item.icon === "fa-briefcase") return "💼";
  if (item.icon === "fa-language" || item.icon === "fa-book-quran") return "🕋";
  if (item.cat === "Quran") return "🕋";
  if (item.cat === "English" || item.cat === "Spoken English") return "🗣️";
  if (item.cat === "AutoCAD") return "📐";
  return catEmoji[item.cat] || "📌";
}

function getCourseEmojiBg(item: { cat: string; icon: string }): string {
  const e = getCourseEmoji(item);
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
    "🎵": "from-violet-500/10 to-violet-600/5 text-violet-600",
    "🌐": "from-teal-500/10 to-teal-600/5 text-teal-600",
    "🗄️": "from-slate-500/10 to-slate-600/5 text-slate-600",
    "📊": "from-emerald-500/10 to-emerald-600/5 text-emerald-600",
    "🧠": "from-indigo-500/10 to-indigo-600/5 text-indigo-600",
    "🚀": "from-orange-500/10 to-orange-600/5 text-orange-600",
    "🔑": "from-yellow-500/10 to-yellow-600/5 text-yellow-600",
    "👑": "from-amber-500/10 to-amber-600/5 text-amber-600",
    "⭐": "from-yellow-500/10 to-yellow-600/5 text-yellow-600",
    "📜": "from-amber-500/10 to-amber-600/5 text-amber-600",
    "🏆": "from-yellow-500/10 to-yellow-600/5 text-yellow-600",
    "🔥": "from-red-500/10 to-red-600/5 text-red-600",
    "❤️": "from-rose-500/10 to-rose-600/5 text-rose-600",
    "📖": "from-amber-500/10 to-amber-600/5 text-amber-600",
    "🎤": "from-fuchsia-500/10 to-fuchsia-600/5 text-fuchsia-600",
    "📷": "from-sky-500/10 to-sky-600/5 text-sky-600",
    "🖼️": "from-violet-500/10 to-violet-600/5 text-violet-600",
    "🧩": "from-emerald-500/10 to-emerald-600/5 text-emerald-600",
    "💡": "from-yellow-500/10 to-yellow-600/5 text-yellow-600",
    "💬": "from-sky-500/10 to-sky-600/5 text-sky-600",
    "🤝": "from-teal-500/10 to-teal-600/5 text-teal-600",
    "💼": "from-blue-500/10 to-blue-600/5 text-blue-600",
    "🗣️": "from-green-500/10 to-green-600/5 text-green-600",
    "📐": "from-orange-500/10 to-orange-600/5 text-orange-600",
  };
  return m[e] || "from-blue-500/10 to-blue-600/5 text-blue-600";
}

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [activeCat, setActiveCat] = useState("all");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [freeCourseUrls, setFreeCourseUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const wid = localStorage.getItem("worker_id");
    if (!wid) { setLoading(false); return; }
    setIsLoggedIn(true);
    fetch(`/api/workers/profile?workerId=${wid}`)
      .then(r => r.json())
      .then((d: any) => {
        setIsPremium(d.membershipStatus === "premium");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    fetch("/api/track/analytics")
      .then(r => r.json())
      .then((d: any) => {
        if (d?.interests) {
          const cats = Object.entries(d.interests).sort(([,a], [,b]) => (b as number) - (a as number));
          setUserInterests(cats.slice(0, 5).map(([k]) => k));
        }
      })
      .catch(() => {});
  }, []);

  // Pick 8 LEAST relevant courses once per device and persist
  useEffect(() => {
    if (!isLoggedIn || isPremium) return;
    const wid = localStorage.getItem("worker_id") || "anon";
    const storageKey = "courses_free_" + wid;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { setFreeCourseUrls(JSON.parse(stored) as string[]); return; }
      catch {}
    }
    const interestedSet = new Set(userInterests.map(i => i.toLowerCase()));
    const scored = courses.map(c => ({
      url: c.url,
      score: userInterests.length === 0
        ? 1
        : (interestedSet.has(c.cat.toLowerCase()) || interestedSet.has(c.catBn.toLowerCase())) ? 0 : 1,
    }));
    scored.sort((a, b) => b.score - a.score);
    const selected = scored.slice(0, 8).map(c => c.url);
    localStorage.setItem(storageKey, JSON.stringify(selected));
    setFreeCourseUrls(selected);
  }, [isPremium, isLoggedIn, userInterests]);

  const isFree = (url: string) => isPremium || (isLoggedIn && freeCourseUrls.includes(url));

  const filtered = useMemo(() => {
    let result = [...courses];
    if (activeCat !== "all") {
      result = result.filter((c) => c.cat === activeCat);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q) ||
          c.cat.toLowerCase().includes(q) ||
          c.catBn.includes(q)
      );
    }
    return result;
  }, [debouncedSearch, activeCat]);

  const totalCount = courses.length;

  const countsByCat = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of courses) {
      map[c.cat] = (map[c.cat] || 0) + 1;
    }
    return map;
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-bold mb-4 border border-white/10">
              {loading ? (
                <span>⏳ লোড হচ্ছে...</span>
              ) : !isLoggedIn ? (
                <span>📚 মোট {totalCount}টি রিসোর্স — লগইন করে এক্সেস করুন</span>
              ) : isPremium ? (
                <span>👑 মোট {totalCount}টি রিসোর্স — প্রিমিয়াম এক্সেস</span>
              ) : (
                <span>🎁 মোট {totalCount}টি রিসোর্স — {freeCourseUrls.length}টি ফ্রি</span>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
              {isPremium ? "👑 সকল কোর্স, সফটওয়্যার &amp; রিসোর্স" : !isLoggedIn ? "📚 কোর্স, সফটওয়্যার &amp; রিসোর্স" : "🎁 ফ্রি কোর্স সমূহ"}
            </h1>
            <p className="text-white/80 font-semibold mt-3 max-w-xl mx-auto text-sm md:text-base">
              {loading ? "তথ্য লোড হচ্ছে..." : !isLoggedIn ? `লগইন করে ${totalCount}টি রিসোর্স এক্সেস করুন` : isPremium ? `প্রিমিয়াম সদস্য হিসাবে ${totalCount}টি রিসোর্স এক্সেস করুন` : `প্রিমিয়াম মেম্বারশিপ নিয়ে ${totalCount}টি রিসোর্স এক্সেস করুন — এখনই ${freeCourseUrls.length}টি ফ্রি কোর্স দেখুন`}
            </p>

            {/* Search */}
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
                  <button
                    onClick={() => setSearch("")}
                    className="pr-5 text-text-secondary/50 hover:text-text transition-colors text-lg"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
          >
            <button
              onClick={() => setActiveCat("all")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 cursor-pointer ${
                activeCat === "all"
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-white border-border text-text-secondary hover:border-primary/30 hover:text-text"
              }`}
            >
              <span>🏠</span>
              <span>সব ({totalCount})</span>
            </button>
            {categoryOrder.map((cat) => {
              const count = countsByCat[cat] || 0;
              const emoji = catEmoji[cat] || "📌";
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 cursor-pointer ${
                    activeCat === cat
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-white border-border text-text-secondary hover:border-primary/30 hover:text-text"
                  }`}
                >
                  <span className="text-xs">{emoji}</span>
                  <span>{categoryNames[cat] || cat}</span>
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Count badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary font-bold text-xs">
            {activeCat === "all" ? `মোট ${filtered.length} টি রিসোর্স` : `${categoryNames[activeCat] || activeCat} — ${filtered.length} টি`}
            {!isPremium && isLoggedIn && activeCat === "all" && (
              <span className="ml-1">🎁 {freeCourseUrls.length}টি ফ্রি</span>
            )}
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
            {filtered.map((item, i) => {
              const emoji = getCourseEmoji(item);
              const bgColor = getCourseEmojiBg(item);
              const isExternal =
                item.url.includes("terabox") ||
                item.url.includes("1024tera") ||
                item.url.includes("4funbox") ||
                item.url.includes("drive.google") ||
                item.url.includes("mega.nz") ||
                item.url.includes("freecoursebd");

              const free = isFree(item.url);
              const Tag = free ? "a" : "div";
              return (
                <Tag
                  key={i}
                  {...(free ? { href: item.url, target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`block bg-white rounded-2xl border p-4 transition-all duration-200 ${
                    free
                      ? "border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98] group cursor-pointer"
                      : "border-border/60 opacity-85"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bgColor} flex items-center justify-center text-lg shrink-0 transition-transform ${free ? "group-hover:scale-110 group-hover:rotate-3" : ""}`}
                    >
                      <span className="text-lg">{emoji}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/60">
                          {item.catBn || item.cat}
                        </span>
                        {!free && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold">
                            👑 PREMIUM
                          </span>
                        )}
                        {free && isExternal && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/5 text-primary/60 font-bold">
                            📥
                          </span>
                        )}
                      </div>
                      <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${free ? "text-text group-hover:text-primary transition-colors" : "text-text"}`}>
                        {item.title}
                      </h3>
                      {item.desc && (
                        <p className="text-xs text-text-secondary/70 mt-1 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      )}
                    </div>
                  </div>
                </Tag>
              );
            })}
          </div>
        )}

        {/* Upgrade prompt for non-premium */}
        {isLoggedIn && !isPremium && (
          <div className="text-center mt-8 mb-4 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
            <p className="text-lg font-bold text-primary mb-2">👑 প্রিমিয়াম মেম্বারশিপ নিন</p>
            <p className="text-sm text-text-secondary mb-4">প্রিমিয়াম মেম্বার হয়ে {totalCount}টি কোর্স, সফটওয়্যার ও রিসোর্স এক্সেস করুন</p>
            <a href="/dashboard/profile" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              👑 প্রিমিয়াম হোন এখনই
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-border">
          <p className="text-xs font-semibold text-text-secondary/60">
            {isPremium ? `👑 প্রিমিয়াম — ${totalCount} টি রিসোর্স` : isLoggedIn ? `🎁 ${freeCourseUrls.length} টি ফ্রি • প্রিমিয়ামে ${totalCount} টি` : `📚 মোট ${totalCount} টি রিসোর্স`}
          </p>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          ↑
        </button>
      )}
    </div>
  );
}

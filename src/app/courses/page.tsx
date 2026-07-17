"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { courses, categoryOrder, categoryNames } from "@/data/courses-data";

const iconMap: Record<string, string> = {
  "fa-school": "\uF549",
  "fa-graduation-cap": "\uF19D",
  "fa-university": "\uF19C",
  "fa-laptop-code": "\uF5FC",
  "fa-video": "\uF03D",
  "fa-chart-line": "\uF201",
  "fa-play-circle": "\uF144",
  "fa-pen-fancy": "\uF5AC",
  "fa-bullhorn": "\uF0A1",
  "fa-udemy": "\uF5D0",
  "fa-question-circle": "\uF059",
  "fa-code": "\uF121",
  "fa-sticky-note": "\uF249",
  "fa-crown": "\uF521",
  "fa-chart-simple": "\uF470",
  "fa-palette": "\uF53F",
  "fa-keyboard": "\uF11C",
  "fa-magnifying-glass-chart": "\uF522",
  "fa-dollar-sign": "\uF155",
  "fa-link": "\uF0C1",
  "fa-facebook": "\uF09A",
  "fa-star": "\uF005",
  "fa-film": "\uF008",
  "fa-pen-ruler": "\uF5AE",
  "fa-globe": "\uF0AC",
  "fa-android": "\uF17B",
  "fa-wordpress": "\uF19A",
  "fa-shield-halved": "\uF3ED",
  "fa-wifi": "\uF1EB",
  "fa-lock": "\uF023",
  "fa-money-bill-wave": "\uF53A",
  "fa-file-word": "\uF1C2",
  "fa-file-excel": "\uF1C3",
  "fa-file-powerpoint": "\uF1C4",
  "fa-ranking-star": "\uF561",
  "fa-book-quran": "\uF6A7",
  "fa-clapperboard": "\uE131",
  "fa-youtube": "\uF167",
  "fa-draw-polygon": "\uF5EE",
  "fa-pen-nib": "\uF5AD",
  "fa-briefcase": "\uF0B1",
  "fa-language": "\uF1AB",
  "fa-pen": "\uF304",
  "fa-cubes": "\uF1B3",
  "fa-robot": "\uF544",
  "fa-pencil-ruler": "\uF5AE",
  "fa-id-card": "\uF2C2",
  "fa-car": "\uF1B9",
  "fa-cart-shopping": "\uF07A",
  "fa-image": "\uF03E",
  "fa-camera": "\uF030",
  "fa-handshake": "\uF2B5",
  "fa-ship": "\uF21A",
  "fa-python": "\uF3E2",
  "fa-tshirt": "\uF553",
  "fa-hand-fist": "\uF6DE",
  "fa-calendar": "\uF133",
  "fa-store": "\uF54E",
  "fa-heart-pulse": "\uF21E",
  "fa-file-pen": "\uF31C",
  "fa-gamepad": "\uF11B",
  "fa-node-js": "\uF3D3",
  "fa-mobile-screen-button": "\uF3CD",
  "fa-mobile": "\uF3CE",
  "fa-cube": "\uF1B2",
  "fa-book": "\uF02D",
  "fa-microphone": "\uF130",
  "fa-tags": "\uF02C",
  "fa-google": "\uF1A0",
  "fa-trophy": "\uF091",
  "fa-funnel-dollar": "\uF662",
  "fa-server": "\uF233",
  "fa-terminal": "\uF120",
  "fa-user-secret": "\uF21B",
  "fa-credit-card": "\uF09D",
  "fa-skull": "\uF54C",
  "fa-certificate": "\uF0A3",
  "fa-sim-card": "\uF7C4",
  "fa-eye-slash": "\uF070",
  "fa-bluetooth": "\uF293",
  "fa-lock-open": "\uF3C1",
  "fa-key": "\uF084",
  "fa-desktop": "\uF108",
  "fa-screwdriver-wrench": "\uF7D9",
  "fa-file": "\uF15B",
  "fa-envelope": "\uF0E0",
  "fa-file-video": "\uF1C8",
  "fa-copyright": "\uF1F9",
  "fa-file-code": "\uF1C9",
  "fa-instagram": "\uF16D",
  "fa-blog": "\uF781",
  "fa-microsoft": "\uF3CA",
  "fa-music": "\uF001",
  "fa-chart-pie": "\uF200",
  "fa-puzzle-piece": "\uF12E",
  "fa-rocket": "\uF135",
  "fa-pray": "\uF683",
  "fa-flask": "\uF0C3",
  "fa-amazon": "\uF270",
  "fa-file-pdf": "\uF1C1",
  "fa-file-text": "\uF15C",
  "fa-file-lines": "\uF15C",
  "fa-brain": "\uF5DC",
  "fa-laptop-house": "\uF566",
  "fa-compass": "\uF14E",
  "fa-building-columns": "\uF19C",
  "fa-comments": "\uF086",
  "fa-dumbbell": "\uF44B",
  "fa-child": "\uF1AE",
  "fa-chalkboard-user": "\uF51C",
  "fa-laptop": "\uF109",
  "fa-database": "\uF1C0",
  "fa-lightbulb": "\uF0EB",
  "fa-icons": "\uF86D",
  "fa-clipboard-list": "\uF46D",
  "fa-dvd": "\uF004",
  "fa-fire": "\uF06D",
  "fa-paypal": "\uF1ED",
  "fa-calculator": "\uF1EC",
  "fa-telegram": "\uF2C6",
  "fa-heart": "\uF004",
  "fa-folder-open": "\uF07C",
};

function getIconHtml(icon: string): string {
  if (iconMap[icon]) return iconMap[icon];
  return "\uF15B";
}

const categoryIcons: Record<string, string> = {
  "Platform": "\uF19D",
  "10MS": "\uF549",
  "Ghoori": "\uF19D",
  "SkillUper": "\uF201",
  "E-Shikhon": "\uF03D",
  "eShikhon": "\uF03D",
  "MSB": "\uF19C",
  "Creative IT": "\uF5FC",
  "Hacking": "\uF3ED",
  "File Collection": "\uF1C0",
  "ChatGPT": "\uF544",
  "10MS PDF": "\uF1C1",
  "Bongo Academy": "\uF144",
  "Graphics Design": "\uF53F",
  "Digital Marketing": "\uF201",
  "SEO": "\uF522",
  "Facebook Marketing": "\uF09A",
  "YouTube": "\uF167",
  "YouTube Marketing": "\uF167",
  "Data Entry": "\uF11C",
  "Video Editing": "\uF03D",
  "Software": "\uF1B3",
  "Logo Design": "\uF5AE",
  "Motion Graphics": "\uF008",
  "WordPress": "\uF19A",
  "Android App": "\uF17B",
  "Ethical Hacking": "\uF3ED",
  "Facebook Hacking": "\uF09A",
  "WiFi Hacking": "\uF1EB",
  "Cyber Security": "\uF023",
  "Android Hacking": "\uF17B",
  "Blackhat": "\uF53A",
  "MS Office": "\uF1C2",
  "Quran": "\uF6A7",
  "AutoCAD": "\uF5EE",
  "Content Writing": "\uF5AD",
  "Job Preparation": "\uF0B1",
  "English": "\uF1AB",
  "Handwriting": "\uF304",
  "CPA Marketing": "\uF155",
  "Affiliate Marketing": "\uF0C1",
  "Fiverr": "\uF005",
  "IT Bari": "\uF109",
  "Graphics School": "\uF53F",
  "Spoken English": "\uF1AB",
  "Outsourcing": "\uF109",
  "Programming": "\uF121",
  "Game Development": "\uF11B",
  "Business": "\uF0F7",
  "LinkedIn": "\uF0E1",
  "Email Marketing": "\uF0E0",
  "Resources": "\uF1C0",
  "Other": "\uF15B",
};

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [activeCat, setActiveCat] = useState("all");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filtered = useMemo(() => {
    let result = courses;
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
              <span>📚</span>
              <span>মোট {totalCount}টি রিসোর্স — সম্পূর্ণ ফ্রি</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
              সকল কোর্স, সফটওয়্যার &amp; রিসোর্স
            </h1>
            <p className="text-white/80 font-semibold mt-3 max-w-xl mx-auto text-sm md:text-base">
              ফ্রিতে ডাউনলোড করুন ৫৪টি ক্যাটাগরির ৯৭৪+টি প্রিমিয়াম কোর্স, সফটওয়্যার ও ফাইল
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
              const icon = categoryIcons[cat] || "\uF15B";
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
                  <span
                    className="text-xs"
                    dangerouslySetInnerHTML={{ __html: `&#x${icon.charCodeAt(0).toString(16)};` }}
                  />
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
            {activeCat === "all"
              ? `মোট ${filtered.length} টি রিসোর্স`
              : `${categoryNames[activeCat] || activeCat} — ${filtered.length} টি রিসোর্স`}
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
              const iconCode = getIconHtml(item.icon);
              const bgColors = [
                "from-blue-500/10 to-blue-600/5 text-blue-600",
                "from-purple-500/10 to-purple-600/5 text-purple-600",
                "from-emerald-500/10 to-emerald-600/5 text-emerald-600",
                "from-orange-500/10 to-orange-600/5 text-orange-600",
                "from-pink-500/10 to-pink-600/5 text-pink-600",
                "from-teal-500/10 to-teal-600/5 text-teal-600",
                "from-red-500/10 to-red-600/5 text-red-600",
                "from-indigo-500/10 to-indigo-600/5 text-indigo-600",
                "from-cyan-500/10 to-cyan-600/5 text-cyan-600",
                "from-rose-500/10 to-rose-600/5 text-rose-600",
              ];
              const colorIdx =
                (item.cat.charCodeAt(0) + item.cat.length) % bgColors.length;
              const isExternal =
                item.url.includes("terabox") ||
                item.url.includes("1024tera") ||
                item.url.includes("4funbox") ||
                item.url.includes("drive.google") ||
                item.url.includes("mega.nz") ||
                item.url.includes("freecoursebd");

              return (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white rounded-2xl border border-border p-4 transition-all duration-200 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 active:scale-[0.98]"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bgColors[colorIdx]} flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: `&#x${iconCode.charCodeAt(0).toString(16)};`,
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/60">
                          {item.catBn || item.cat}
                        </span>
                        {isExternal && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/5 text-primary/60 font-bold">
                            📥
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-text leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      {item.desc && (
                        <p className="text-xs text-text-secondary/70 mt-1 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t border-border">
          <p className="text-xs font-semibold text-text-secondary/60">
            মোট {totalCount} টি রিসোর্স — সবগুলোই সম্পূর্ণ ফ্রি
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

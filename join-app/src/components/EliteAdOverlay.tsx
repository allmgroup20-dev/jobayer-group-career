"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/lang";

type Msg = { kind: "ok" | "warn" | "error"; text: string } | null;

const AD_INTERVAL_MIN = 180_000;
const AD_INTERVAL_RANDOM_MAX = 300_000;
const SKIP_COUNTDOWN_SEC = 5;

function randomInterval() {
  return AD_INTERVAL_MIN + Math.floor(Math.random() * (AD_INTERVAL_RANDOM_MAX - AD_INTERVAL_MIN));
}

export default function EliteAdOverlay() {
  const { lang } = useLang();
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const pathname = usePathname();

  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const [visible, setVisible] = useState(false);
  const [skipRemaining, setSkipRemaining] = useState(SKIP_COUNTDOWN_SEC);
  const [canSkip, setCanSkip] = useState(false);

  // Elite payment states (duplicated from complete page for self-contained ad)
  const [amountInput, setAmountInput] = useState("");
  const [interestFacility, setInterestFacility] = useState("");
  const [otherInterest, setOtherInterest] = useState("");
  const [is100Interested, setIs100Interested] = useState<boolean | null>(null);
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState<Msg>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState("30:00");
  const [expired, setExpired] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [officers, setOfficers] = useState<Array<{ id: number; name: string; status: "viewing" | "accepted" | "pending" | "rejected" }>>([]);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [bundleCount, setBundleCount] = useState<1|2|3>(1);
  const [deliveryDiscount, setDeliveryDiscount] = useState(0);
  const [deliveryMode, setDeliveryMode] = useState<"post"|"home">("post");

  const lastShownRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const skipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch membership + login status
  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/membership/status");
      if (r.ok) {
        const d = (await r.json()) as { isPremium?: boolean };
        setIsPremium(!!d.isPremium);
      } else setIsPremium(false);
    } catch { setIsPremium(false); }
    try {
      const r = await fetch("/api/me");
      setLoggedIn(r.ok);
    } catch { setLoggedIn(false); }
    try {
      const v = localStorage.getItem("elite_premium_attempt");
      if (v) setAttempt(Number(v) || 0);
    } catch {}
    try {
      const r = await fetch("/api/share");
      if (r.ok) {
        const d = (await r.json()) as { completed?: boolean; certificateId?: string | null };
        if (d.completed || d.certificateId) setHasCertificate(true);
      }
      const r2 = await fetch("/api/membership/status");
      if (r2.ok) {
        const dd = (await r2.json()) as { eliteCertificateId?: string | null };
        if (dd.eliteCertificateId) setHasCertificate(true);
      }
    } catch {}
    try {
      const v = localStorage.getItem("original_copy_offer_views");
      const views = v ? Number(v) : 0;
      const steps = [0,5,10,15,20,30,40];
      setDeliveryDiscount(steps[Math.min(views, steps.length-1)] || 0);
    } catch {}
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Countdown for 30-min reserved
  useEffect(() => {
    if (is100Interested !== true || isPremium || verifying) return;
    try {
      const saved = localStorage.getItem("elite_premium_deadline");
      if (saved) {
        const dl = Number(saved);
        if (dl > Date.now()) { setDeadline(dl); setExpired(false); return; }
      }
      const dl = Date.now() + 30 * 60 * 1000;
      localStorage.setItem("elite_premium_deadline", String(dl));
      setDeadline(dl); setExpired(false);
    } catch {
      const dl = Date.now() + 30 * 60 * 1000;
      setDeadline(dl); setExpired(false);
    }
  }, [is100Interested, isPremium, verifying]);

  useEffect(() => {
    if (isPremium || deadline === null || verifying) return;
    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) { setTimeLeft("00:00"); setExpired(true); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, isPremium, verifying]);

  const startOfficerVerification = () => {
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);
    try { localStorage.setItem("elite_premium_attempt", String(nextAttempt)); } catch {}
    const count = Math.min(2 + nextAttempt, 5);
    const officerNames = ["এক্সিকিউটিভ, যাচাই বিভাগ", "সিনিয়র এক্সিকিউটিভ, সদস্য যাচাই", "অ্যাসিস্ট্যান্ট ম্যানেজার, প্রিমিয়াম অনুমোদন", "ম্যানেজার, সদস্য অনুমোদন", "ডেপুটি ডিরেক্টর, প্রিমিয়াম সদস্যপদ"];
    const initial: Array<{ id: number; name: string; status: "viewing" | "accepted" | "pending" | "rejected" }> = Array.from({ length: count }, (_, i) => ({
      id: i, name: officerNames[i] || `কর্মকর্তা ${i + 1}`, status: "viewing" as const,
    }));
    setOfficers(initial); setVerifying(true); setExpired(false);
    const totalMs = Math.min(40000 + nextAttempt * 5000, 60000);
    const per = Math.floor(totalMs / count);
    initial.forEach((_, idx) => {
      setTimeout(() => {
        setOfficers((prev) => {
          const next = [...prev];
          if (idx === count - 1) next[idx].status = "accepted";
          else if (idx === 0) next[idx].status = "accepted";
          else next[idx].status = "pending";
          return next;
        });
        if (idx === count - 1) {
          setTimeout(() => {
            const dl = Date.now() + 30 * 60 * 1000;
            try { localStorage.setItem("elite_premium_deadline", String(dl)); } catch {}
            setDeadline(dl); setExpired(false); setVerifying(false);
            setPayMsg({ kind: "ok", text: t("✅ কর্মকর্তা অনুমতি দিয়েছেন — এখন ৩০ মিনিটের মধ্যে পেমেন্ট করুন", "Approved — you have 30 minutes to pay") });
          }, 800);
        }
      }, per * (idx + 1));
    });
  };

  const handlePremiumPay = async () => {
    if (paying || verifying || expired) return;
    const raw = amountInput.trim();
    let amt = Number(raw);
    if (!raw || !Number.isFinite(amt)) {
      setPayMsg({ kind: "warn", text: t("অ্যামাউন্ট লিখুন — যেমন ২০১", "Please enter an amount — e.g. 201") });
      return;
    }
    amt = Math.round(amt);
    if (amt < 99) {
      setPayMsg({ kind: "warn", text: t("সর্বনিম্ন ৯৯ টাকা হতে হবে", "Minimum is 99 Taka") });
      return;
    }
    if (amt > 10000) amt = 10000;
    if (is100Interested === false) {
      setPayMsg({ kind: "warn", text: t("শেখায় মনোযোগী না হলে পেমেন্ট প্রয়োজন নেই — আগ্রহ হলে আবার চেষ্টা করুন", "If not 100% interested, no need to pay — try again when interested") });
      return;
    }
    setPaying(true); setPayMsg(null);
    try {
      const interestNote = [
        interestFacility ? `Facility: ${interestFacility}` : "",
        otherInterest ? `Other interest: ${otherInterest}` : "",
        is100Interested ? "100% interested: yes" : "",
      ].filter(Boolean).join(" | ");
      const budgetNote = `Budget ${amt} BDT (flexible input ${amountInput})`;
      const res = await fetch("/api/membership/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "elite", amount: amt, budgetNote, interestNote }),
      });
      const json = await res.json().catch(() => ({})) as { GatewayPageURL?: string; error?: string; mock?: boolean };
      if (!res.ok) {
        setPayMsg({ kind: "error", text: json.error || t("পেমেন্ট শুরু করা যায়নি", "Could not start payment") });
        return;
      }
      if (json.GatewayPageURL) window.location.href = json.GatewayPageURL;
    } catch {
      setPayMsg({ kind: "error", text: t("পেমেন্ট শুরু করা যায়নি", "Could not start payment") });
    } finally { setPaying(false); }
  };

  const handleDeliveryOrder = async () => {
    try {
      const res = await fetch("/api/delivery/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "elite", deliveryMode, bundleCount, discount: bundleCount >= 2 ? deliveryDiscount : 0 }),
      });
      const j = await res.json().catch(() => ({})) as { GatewayPageURL?: string; error?: string };
      if (!res.ok) { setPayMsg({ kind: "error", text: j.error || t("অর্ডার শুরু করা যায়নি", "Could not start order") }); return; }
      if (j.GatewayPageURL) window.location.href = j.GatewayPageURL;
    } catch { setPayMsg({ kind: "error", text: t("অর্ডার শুরু করা যায়নি", "Could not start order") }); }
  };

  // Show ad with 5-sec skip countdown + progressive bundle discount
  const showAd = useCallback(() => {
    if (isPremium) return;
    if (!loggedIn) return;
    const now = Date.now();
    lastShownRef.current = now;
    try {
      const views = Number(localStorage.getItem("original_copy_offer_views") || "0") + 1;
      localStorage.setItem("original_copy_offer_views", String(views));
      const steps = [0,5,10,15,20,30,40];
      setDeliveryDiscount(steps[Math.min(views, steps.length-1)] || 0);
    } catch {}
    setVisible(true);
    setCanSkip(false);
    setSkipRemaining(SKIP_COUNTDOWN_SEC);
    if (skipTimerRef.current) clearInterval(skipTimerRef.current);
    skipTimerRef.current = setInterval(() => {
      setSkipRemaining((prev) => {
        if (prev <= 1) {
          if (skipTimerRef.current) clearInterval(skipTimerRef.current);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimeout(() => {
      if (skipTimerRef.current) clearInterval(skipTimerRef.current);
      setCanSkip(true);
      setSkipRemaining(0);
    }, SKIP_COUNTDOWN_SEC * 1000);
  }, [isPremium, loggedIn]);

  const dismissAd = useCallback(() => {
    if (!canSkip) return;
    setVisible(false);
    if (skipTimerRef.current) clearInterval(skipTimerRef.current);
  }, [canSkip]);

  // Initial show: after registration/login, wait 1.5s then show
  useEffect(() => {
    if (isPremium !== false || !loggedIn) return;
    const timer = setTimeout(() => showAd(), 1500);
    return () => clearTimeout(timer);
  }, [isPremium, loggedIn, showAd]);

  // Periodic show every 1-3 min
  useEffect(() => {
    if (isPremium || !loggedIn) return;
    const schedule = () => {
      intervalRef.current = setTimeout(() => {
        showAd();
        schedule();
      }, randomInterval());
    };
    schedule();
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, [isPremium, loggedIn, showAd]);

  // Show on route change (one page to another) — throttled 60s
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;
    if (isPremium || !loggedIn || visible) return;
    if (Date.now() - lastShownRef.current < 90_000) return;
    // small delay after navigation so page renders first
    const t = setTimeout(() => showAd(), 800);
    return () => clearTimeout(t);
  }, [pathname, isPremium, loggedIn, visible, showAd]);

  // Refresh premium status after success redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("membership") === "success") fetchStatus();
  }, [pathname, fetchStatus]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (skipTimerRef.current) clearInterval(skipTimerRef.current);
    };
  }, []);

  if (!visible) return null;
  if (isPremium) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => canSkip && dismissAd()} aria-hidden />
      {/* Ad card — bottom sheet on mobile, centered modal on desktop */}
      <div className="relative w-full md:max-w-lg max-h-[92vh] md:max-h-[88vh] overflow-y-auto bg-white rounded-t-[1.5rem] md:rounded-[1.25rem] shadow-2xl border border-slate-200 flex flex-col">
        {/* Skip / countdown bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white rounded-t-[1.5rem] md:rounded-t-[1.25rem]">
          <span className="text-[11px] font-black tracking-widest uppercase opacity-80">
            {canSkip ? "" : `${skipRemaining}`}
          </span>
          <button
            onClick={dismissAd}
            disabled={!canSkip}
            aria-label={t("বন্ধ করুন", "Close")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all ${canSkip ? "bg-white text-slate-900 hover:bg-slate-100 active:scale-95" : "bg-white/20 text-white/60 cursor-not-allowed"}`}
          >
            {canSkip ? (
              <>{t("✕ বন্ধ করুন", "✕ Close")}</>
            ) : (
              <>{skipRemaining}s</>
            )}
          </button>
        </div>

        <div className="p-4 md:p-5 text-left overflow-y-auto">
          {/* Header — mirrors complete page Elite card */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">
              <span className="w-9 h-9 shrink-0 rounded-xl bg-violet/20 border border-violet/40 flex items-center justify-center text-base">🏆</span>
              <span>
                {t("এলিট ফাইনাল সার্টিফিকেট", "Elite Final Certificate")}
                <span className="block text-[10px] font-bold text-slate-600">{t("Elite • শেষ ধাপ", "Elite • Final step")}</span>
              </span>
            </h2>
            <span className="badge-glow bg-gold/20 text-gold border border-gold/40 text-[10px]">
              {t("🔒 কমিটমেন্ট লক", "Commitment Locked")}
            </span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet/10 border border-violet/30 text-[10px] font-black text-violet/80">
            <span>💰</span> {t("৳৬০,০০০–৳১,২০,০০০+ • Elite • সর্বোচ্চ পুরস্কার", "৳60,000–৳120,000+ • Elite • Highest reward")}
          </div>

          {/* 9 Benefits — compact */}
          <div className="mt-3 rounded-xl bg-white border border-[#E2E8F0] p-3 shadow-sm">
            <p className="text-[11px] font-black text-slate-900 text-center">💎 {t("কমিটমেন্টে নয়টি সুবিধা", "Nine Benefits with Commitment")}</p>
            <p className="mt-1 text-[10px] text-slate-600 text-center leading-relaxed">{t("এলিট অ্যাক্সেস ফি — আগামী ছয় মাস থেকে সর্বোচ্চ তিন বছর পর্যন্ত আমাদের সাথে থাকার আগ্রহ কনফার্ম করতে আপনার পছন্দের বাজেট দিন", "Commitment fee — to confirm your interest to stay from six months up to three years, give your preferred budget")}</p>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2 items-start">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-teal/15 border border-teal/30 flex items-center justify-center text-[11px]">🎓</span>
                <div><p className="text-[11px] font-black text-slate-900">{t("১. কমিটেড লার্নার", "1. Committed Learner")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("শেখায় ১০০% মনোযোগী শিক্ষার্থীদের জন্য — আপনিও কমিটেড লার্নার হবেন।", "For learners 100% focused on learning — you become a committed learner.")}</p></div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-[11px]">⭐</span>
                <div><p className="text-[11px] font-black text-slate-900">{t("২. যেকোনো চাকরিতে অগ্রাধিকার", "2. Priority in Any Job")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("কোম্পানির যেকোনো পদে আপনাকে আগে বিবেচনা করা হবে।", "You will be considered first for any position in the company.")}</p></div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-violet/15 border border-violet/30 flex items-center justify-center text-[11px]">🌍</span>
                <div><p className="text-[11px] font-black text-slate-900">{t("৩. জাতীয় + আন্তর্জাতিক সুযোগ", "3. National + International Opportunities")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("দেশ ও বিদেশে কোম্পানির সকল প্রতিষ্ঠানে আবেদনের সুযোগ।", "Opportunities in all company institutions, nationally and internationally.")}</p></div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-pink/15 border border-pink/30 flex items-center justify-center text-[11px]">📚</span>
                <div><p className="text-[11px] font-black text-slate-900">{t("৪. গাইডলাইন + প্রশিক্ষণ", "4. Guideline + Training")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("অভিজ্ঞতা না থাকলে নিজস্ব ট্রেইনার দিয়ে তৈরি — অভিজ্ঞতা থাকলে তা প্লাস পয়েন্ট হিসেবে আরও শানিয়ে তোলা হবে।", "No experience? Our trainers will build you. Experienced? We sharpen it as a plus point.")}</p></div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-teal/15 border border-teal/30 flex items-center justify-center text-[11px]">🎓</span>
                <div><p className="text-[11px] font-black text-slate-900">{t("৫. কোর্স সুবিধা", "5. Course Benefit")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("প্রাথমিক পর্যায়ে অভিজ্ঞতা না থাকলে কয়েক লক্ষ টাকার জাতীয়/আন্তর্জাতিক কোর্স — বাংলা/ইংরেজি, পছন্দের ভাষায়; কোর্স শেষে চাকরির যোগ্য।", "If no experience, courses worth several lakhs — national/international, Bangla/English in your preferred language; after completion, eligible for jobs.")}</p></div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-[11px]">🚀</span>
                <div><p className="text-[11px] font-black text-slate-900">{t("৬. ১০০০ নিয়োগ + মনিটাইজেশন চ্যানেল", "6. 1000 Hires + Monetization Channel")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("২০২৬ নভেম্বর–২০২৭ ফেব্রুয়ারি বাংলাদেশে ১০০০ নিয়োগে অগ্রাধিকার। পূর্ণাঙ্গ মনিটাইজেশন চ্যানেল — আমরা গাইড করব কীভাবে কনটেন্ট বানাবে/ছাড়বে; যে কেউ নিজের গতিতে শিখতে পারবে — প্রতিটি ধাপে নতুন দক্ষতা নিশ্চিত।", "1000 hires in Bangladesh Nov 2026–Feb 2027 with priority. Full monetization channel with guidance — anyone can learn at their own pace — each step ensures new skills.")}</p></div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-violet/15 border border-violet/30 flex items-center justify-center text-[11px]">🏆</span>
                <div><p className="text-[11px] font-black text-slate-900">{t("৭. সর্বোচ্চ Elite সার্টিফিকেট", "7. Highest Elite Certificate")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("দেশ/বিদেশ যেকোনো প্রতিষ্ঠানে উচ্চ বেতনের চাকরিতে সহায়ক — কোম্পানিতে অত্যাধিক ফ্যাসিলিটি।", "Helps secure high-salary jobs anywhere — maximum facilities in our company.")}</p></div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-teal/15 border border-teal/30 flex items-center justify-center text-[11px]">✈️</span>
                <div><p className="text-[11px] font-black text-slate-900">{t("৮. ইন্ডিয়া ভ্রমণ — কোম্পানির খরচে", "8. India Tour — Company Expense")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("যেকোনো সময় ইন্ডিয়া ভ্রমণ + YouTube অফিস পরিদর্শন — টুরিস্ট ভিসা সহ সকল খরচ কোম্পানি বহন করবে, আপনাকে কিছু বহন করতে হবে না।", "Anytime India tour + YouTube office visit — company bears all costs including tourist visa, you bear nothing.")}</p></div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-[11px]">🎉</span>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-slate-900">{t("৯. বার্ষিক পুরস্কার — ৭০% কমিটেড মেম্বার পায়", "9. Annual Prize — 70% of Committed Members Win")}</p>
                  <p className="text-[10px] text-slate-600 leading-relaxed">{t("প্রতি বছর ১ বার, সকল প্রিমিয়াম মেম্বারের নাম অটো যুক্ত — গত ৭ বছর ধরে। ১ম পুরস্কার ১০ কোটি — ১ জনকে দেওয়া হবে।", "Once a year, all premium members auto-entered — for 7 years. 1st prize 10 crore — will be given to 1 person.")}</p>
                  <details className="mt-1.5">
                    <summary className="text-[10px] font-black text-gold cursor-pointer">{t("বাকিগুলো দেখুন", "See the rest")}</summary>
                    <div className="mt-1.5 rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-[10px] leading-relaxed">
                      <p className="font-black text-slate-700">{t("ধাপে ধাপে পুরস্কার সিঁড়ি", "Step-by-step prize ladder")}</p>
                      <div className="mt-1 grid grid-cols-2 gap-1 text-[10px]">
                        <span className="text-slate-600">৫ কোটি — ১ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">১ কোটি — ১ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৯০ লাখ — ১ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৭০ লাখ — ১ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৫০ লাখ — ১ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৩০ লাখ — ১ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">১০ লাখ — ১ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৯ লাখ — ১ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৭ লাখ — ১ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৫ লাখ — ১০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৩ লাখ — ২০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">১ লাখ — ৩০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৯০ হাজার — ৪০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৭০ হাজার — ৫০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৫০ হাজার — ৬০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৩০ হাজার — ৭০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">১০ হাজার — ৯০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৯ হাজার — ১০০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৭ হাজার — ১৫০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৫ হাজার — ২০০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">৩ হাজার — ৫০০ জনকে দেওয়া হবে</span>
                        <span className="text-slate-600">১ হাজার — ১০০০ জনকে দেওয়া হবে</span>
                      </div>
                      <p className="mt-1.5 text-[9px] text-slate-600 leading-relaxed">{t("মোট ~২,২০৪ জন বিজয়ী — প্রায় ৭০% কমিটেড মেম্বার প্রতি বছর কিছু না কিছু পায় — শুধু কমিটেডদের জন্য।", "Total ~2,204 winners — about 70% of committed members get something each year — committed only.")}</p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>

          {/* Original copy upsell — only if they have a certificate */}
          {hasCertificate && (
            <div className="mt-3 rounded-xl bg-teal/5 border border-teal/20 p-3">
              <p className="text-[11px] font-black text-slate-900 text-center">📮 {t("আপনার সার্টিফিকেটের অরিজিনাল কপি অর্ডার দিন", "Order original copy of your certificate")}</p>
              <p className="mt-1 text-[10px] text-slate-600 text-center leading-relaxed">{t("হাতে পাওয়া অরিজিনাল কপি — পোস্ট অফিস বা হোম ডেলিভারি", "Original copy in hand — post office or home delivery")}</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {[1,2,3].map((n)=>(
                  // @ts-ignore
                  <button key={n} onClick={()=>setBundleCount(n as 1|2|3)} className={`py-2 rounded-xl border text-xs font-black ${bundleCount===n ? "bg-teal/15 border-teal/30 text-teal" : "bg-white border-slate-200 text-slate-600"}`}>{n} {t("টি"," pcs")}</button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <button onClick={()=>setDeliveryMode("post")} className={`py-2 rounded-xl border text-xs font-black ${deliveryMode==="post" ? "bg-teal/15 border-teal/30 text-teal" : "bg-white border-slate-200 text-slate-600"}`}>📍 {t("পোস্ট অফিস","Post")} 0.5$</button>
                <button onClick={()=>setDeliveryMode("home")} className={`py-2 rounded-xl border text-xs font-black ${deliveryMode==="home" ? "bg-gold/15 border-gold/30 text-gold" : "bg-white border-slate-200 text-slate-600"}`}>🏠 {t("হোম","Home")} 1$</button>
              </div>
              {bundleCount>=2 ? (
                deliveryDiscount>0 ? (
                  <p className="mt-2 text-[11px] font-black text-teal text-center">🎉 {t(`আপনি ${deliveryDiscount}% ছাড় পেয়েছেন` , `You got ${deliveryDiscount}% off`)} {deliveryDiscount>=40 ? t("— আপনাকে সর্বোচ্চ ছাড় দেওয়া হয়েছে"," — maximum discount") : ""}</p>
                ) : (
                  <p className="mt-2 text-[10px] text-slate-600 text-center">{t("একসাথে ২/৩টি অর্ডারে ডেলিভারি ফি-তে ছাড় পাবেন","Get delivery fee discount on 2/3 bundle")}</p>
                )
              ) : (
                <p className="mt-2 text-[10px] text-slate-600 text-center">{t("১টি-তে ছাড় নেই, ২/৩টি একসাথে নিলে ছাড়","No discount for 1, discount for 2/3 bundle")}</p>
              )}
              {deliveryDiscount>=40 && <p className="mt-1 text-[10px] font-bold text-gold text-center">{t("🎉 আপনাকে সর্বোচ্চ ৪০% ছাড় দেওয়া হয়েছে — এর চেয়ে বেশি কোনোভাবেই সম্ভব নয়","You have received the maximum 40% discount — no more possible")}</p>}
              <button onClick={handleDeliveryOrder} className="mt-2 w-full py-2.5 rounded-xl bg-teal text-white text-xs font-black">📮 {t("অরিজিনাল কপি অর্ডার করুন","Order original copy")}</button>
            </div>
          )}

          {/* Interest + Survey */}
          <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-[11px] font-black text-slate-900">{t("আপনার আগ্রহ জানান", "Tell us your interest")}</p>
            <p className="mt-1 text-[10px] text-slate-600 leading-relaxed">{t("এই ৯টি সুবিধা পাওয়ার ক্ষেত্রে আপনার কাছে কি মনে হয় — বাংলাদেশে এইরকম সুবিধা যারা দিচ্ছে তারা কত টাকা নিতে পারে?", "For these 9 benefits — how much do you think others in Bangladesh who offer similar benefits would charge?")}</p>
            <p className="mt-2 text-[10px] text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-xl px-3 py-2">{t("জাস্ট জানার জন্য — এই মুহূর্তে এই ৯টি সুবিধার জন্য আপনি নিজের জায়গা থেকে কত টাকা দিয়ে আমাদের আগ্রহী মেম্বার হতে চান? সেই অ্যামাউন্টটি নিচে লিখুন।", "Just to know — how much do YOU want to pay from your side to become our interested member for these 9 benefits? Write that amount below.")}</p>
            <div className="mt-3 space-y-2">
              <select value={interestFacility} onChange={(e) => setInterestFacility(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none">
                <option value="" className="text-black">{t("৯টির মধ্যে কোন সুবিধাটি সবচেয়ে পছন্দ?", "Which of the 9 benefits do you like most?")}</option>
                <option value="earning" className="text-black">{t("আর্নিং মেম্বার", "Earning Member")}</option>
                <option value="priority" className="text-black">{t("যেকোনো চাকরিতে অগ্রাধিকার", "Priority in Any Job")}</option>
                <option value="national-international" className="text-black">{t("জাতীয় + আন্তর্জাতিক সুযোগ", "National + International")}</option>
                <option value="training" className="text-black">{t("গাইডলাইন + প্রশিক্ষণ", "Guideline + Training")}</option>
                <option value="courses" className="text-black">{t("কোর্স সুবিধা", "Course Benefit")}</option>
                <option value="hiring-channel" className="text-black">{t("১০০০ নিয়োগ + মনিটাইজেশন চ্যানেল", "1000 Hires + Channel")}</option>
                <option value="certificate" className="text-black">{t("Elite সার্টিফিকেট", "Elite Certificate")}</option>
                <option value="tour" className="text-black">{t("ইন্ডিয়া ভ্রমণ — কোম্পানির খরচে", "India Tour — Company Expense")}</option>
                <option value="lottery" className="text-black">{t("বার্ষিক পুরস্কার ড্র", "Annual Prize Draw")}</option>
              </select>
              <input value={otherInterest} onChange={(e) => setOtherInterest(e.target.value)} placeholder={t("এর বাইরে আর কোন বিষয়ে আগ্রহ আছে? (ঐচ্ছিক)", "Any other subject you are interested in? (optional)")} className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold placeholder-slate-400 focus:outline-none" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIs100Interested(true)} className={`flex-1 py-2.5 rounded-xl border text-xs font-black ${is100Interested === true ? "bg-teal/20 border-teal/40 text-teal" : "bg-white border-slate-200 text-slate-600"}`}>{t("✅ হ্যাঁ, শেখায় মনোযোগী", "Yes, focused on learning")}</button>
                <button type="button" onClick={() => { if (canSkip) setIs100Interested(false); }} className={`flex-1 py-2.5 rounded-xl border text-xs font-black ${is100Interested === false ? "bg-white border-slate-200 text-slate-900" : "bg-white border-slate-200 text-slate-600"} ${!canSkip ? "opacity-50 cursor-not-allowed" : ""}`}>{t("পরে ভাবব", "Maybe later")}</button>
              </div>
            </div>

            {is100Interested === true && (
              <div className="mt-3 rounded-xl bg-gold/10 border border-gold/30 p-3">
                <p className="text-[11px] font-black text-gold text-center">{t("আপনার পছন্দের বাজেট দিন", "Enter your preferred budget")}</p>
                <p className="mt-1 text-[10px] text-slate-600 text-center leading-relaxed">{t("এই ৯টি সুবিধার জন্য আপনি কত টাকা দিয়ে আগ্রহী মেম্বার হতে চান? সেই অ্যামাউন্টটি লিখুন — টাকাটা আপনাকে এখনই পাঠাতে হবে।", "How much do you want to pay to become an interested member for these 9 benefits? Write that amount — you need to send it now.")}</p>
                {!expired && !verifying ? (
                  <div className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[11px] font-black text-gold">⏳ {timeLeft}</span>
                    <span className="text-[10px] font-bold text-slate-600">{t("আপনার জন্য ৩০ মিনিট সংরক্ষিত — ধীরে, নিজের গতিতে সিদ্ধান্ত নিন", "Reserved for you for 30 minutes — take your time, decide at your own pace")}</span>
                  </div>
                ) : null}
                {verifying ? (
                  <div className="mt-2 rounded-xl bg-white border border-[#E2E8F0] p-3 shadow-sm">
                    <p className="text-[10px] font-bold text-gold/80 text-center">⏳ {t("যাচাই চলছে — সাধারণত ১ মিনিটের মধ্যেই রিপোর্ট পাবেন", "Verifying — you'll usually get the report within 1 minute")}</p>
                    <p className="mt-1 text-[11px] font-black text-slate-900 text-center">{t("কর্মকর্তাদের কাছে পাঠানো হচ্ছে…", "Sending to officers for verification…")}</p>
                    <div className="mt-2 space-y-1.5">
                      {officers.map((o) => (
                        <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[11px] font-bold text-slate-700">{o.name}</span>
                          <span className={`text-[10px] font-black flex items-center gap-1 ${o.status === "accepted" ? "text-teal" : o.status === "rejected" ? "text-red" : o.status === "pending" ? "text-slate-600" : "text-gold"}`}>
                            {o.status === "viewing" ? (
                              <span className="inline-flex items-center gap-0.5 animate-pulse">{t("আপনার তথ্য পর্যালোচনা করছেন", "Reviewing your information")}<span className="verify-dots inline-flex"><span>.</span><span>.</span><span>.</span></span></span>
                            ) : o.status === "accepted" ? t("✅ অনুকূল রিপোর্ট দিয়েছেন", "Favorable report submitted") : o.status === "rejected" ? t("বাতিল করেছেন", "Rejected") : t("রিপোর্ট প্রস্তুত হচ্ছে", "Report being prepared")}
                          </span>
                        </div>
                      ))}
                    </div>
                    <style>{`.verify-dots span{animation:verifyDot 1s infinite;}.verify-dots span:nth-child(2){animation-delay:0.2s}.verify-dots span:nth-child(3){animation-delay:0.4s}@keyframes verifyDot{0%,80%,100%{opacity:0}40%{opacity:1}}`}</style>
                  </div>
                ) : expired ? (
                  <div className="mt-2 rounded-xl bg-white border border-slate-200 p-3 text-center">
                    <p className="text-[11px] font-black text-slate-900">{t("সময় শেষ — আবার শুরু করতে পারেন", "Time's up — you can start again")}</p>
                    <p className="mt-1 text-[10px] text-slate-600 leading-relaxed">{t("আপনার জন্য আবার সংরক্ষণ করা যাবে — নিচে চাপ দিন।", "We can reserve again for you — tap below.")}</p>
                    <button type="button" onClick={startOfficerVerification} disabled={verifying} className="mt-2 w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-black disabled:opacity-50">
                      {t("আমি আগ্রহী — আগেরবার সময় শেষ হওয়ার আগে নিতে পারিনি, দ্বিতীয়বার অনুমতি দিন", "I am interested — couldn't take it before time ended, please allow me again")}
                    </button>
                  </div>
                ) : (
                  <>
                    {payMsg && payMsg.text.includes("সর্বনিম্ন ৯৯") && !verifying && !expired && (
                      <p className="mb-1.5 text-[10px] font-bold text-center text-gold">{payMsg.text}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <input value={amountInput} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 5); setAmountInput(v); }} inputMode="numeric" placeholder={t("অ্যামাউন্ট লিখুন", "Enter amount")} className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold placeholder-slate-400 focus:outline-none" />
                      <span className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-600">BDT</span>
                    </div>
                    {amountInput && Number(amountInput) >= 99 && !expired && (
                      <div className="mt-2 rounded-xl bg-white border border-slate-200 p-3 text-left text-[10px] leading-relaxed font-bold text-slate-700">
                        <p>🔒 {t("এখনই SSLCommerz নিরাপদ পেজে যাবেন — bKash / Nagad / Card", "You'll go to the secure SSLCommerz page now — bKash / Nagad / Card")}</p>
                        <p className="mt-1">🎓 {t("পেমেন্ট শেষে এই পেজেই ফিরে আসবেন — Elite সার্টিফিকেট সাথে সাথে আনলক", "After payment you return right here — Elite unlocks instantly")}</p>
                      </div>
                    )}
                    <button
                      onClick={handlePremiumPay}
                      disabled={paying || verifying || expired}
                      className="mt-2 w-full py-2.5 rounded-xl bg-[#C2410C] text-white text-xs font-black active:bg-[#7C2D12] active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {paying ? t("প্রক্রিয়াধীন…", "Processing…") : amountInput ? t(`💳 ${Number(amountInput).toLocaleString("en-US")} টাকা পাঠান — এখনই কমিটেড হোন`, `Send ${Number(amountInput).toLocaleString("en-US")} Taka — Become Premium Now`) : t("💳 আপনার পছন্দের বাজেট দিয়ে কমিটেড হোন — SSLCommerz", "Become Premium with your preferred budget — SSLCommerz")}
                    </button>
                    <p className="mt-1.5 text-[9px] text-slate-600 text-center">SSLCommerz • bKash / Nagad / Card • {t("সুরক্ষিত পেমেন্ট • এখনই পাঠাতে হবে", "Secure payment • Must send now")}</p>
                  </>
                )}
                {payMsg && !payMsg.text.includes("সর্বনিম্ন ৯৯") && !verifying && !expired && (
                  <p className={`mt-2 text-[11px] font-bold text-center ${payMsg.kind === "ok" ? "text-teal" : payMsg.kind === "warn" ? "text-gold" : "text-red"}`}>{payMsg.text}</p>
                )}
              </div>
            )}
            {is100Interested === false && (
              <p className="mt-2 text-[11px] font-bold text-center text-slate-600">{t("১০০% আগ্রহ না থাকলে এখন পেমেন্ট প্রয়োজন নেই — আগ্রহ হলে ফিরে আসুন।", "If not 100% interested, no need to pay now — come back when interested.")}</p>
            )}
            {is100Interested === null && payMsg && (
              <p className={`mt-2 text-[11px] font-bold text-center ${payMsg.kind === "ok" ? "text-teal" : payMsg.kind === "warn" ? "text-gold" : "text-red"}`}>{payMsg.text}</p>
            )}
          </div>
        </div>

        {/* Bottom close when not focused on interest */}
        {is100Interested === null && (
          <div className="p-4 pt-0">
            <button
              onClick={dismissAd}
              disabled={!canSkip}
              className={`w-full py-2.5 rounded-xl border text-xs font-black ${canSkip ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white" : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"}`}
            >
              {canSkip ? t("পরে ভাবব — এখন বন্ধ করুন", "Maybe later — close for now") : t(`বন্ধ করুন ${skipRemaining}`, `Close ${skipRemaining}`)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

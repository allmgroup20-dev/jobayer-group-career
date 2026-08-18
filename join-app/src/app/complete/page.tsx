"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { useLang } from "@/lib/lang";
import { trackEvent } from "@/lib/tracking";

declare global {
  interface Navigator {
    contacts?: {
      select(props: string[], opts: { multiple: boolean }): Promise<Array<{ name?: string[]; tel?: string[] }>>;
    };
  }
}

type Me = { workerId?: string; name?: string; totalTeamMembers?: number; resourceIncome?: number };

type ShareSummary = {
  target: number;
  selected: number;
  sent: number;
  percent: number;
  completed: boolean;
  certificateId?: string | null;
  contacts?: { phone: string; name: string; status: string; link?: string; shareText?: string; waExists?: boolean; sentAt?: string | null }[];
  added?: number;
  skipped?: number;
  noWhatsApp?: string[];
};

type Msg = { kind: "ok" | "warn" | "error"; text: string } | null;

const VERIFY_MS = 60_000; // verification window (max 1 minute)

export default function CompletePage() {
  const { lang } = useLang();
  const router = useRouter();
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);

  const [me, setMe] = useState<Me | null>(null);
  const [link, setLink] = useState("");
  const [shareText, setShareText] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  const [share, setShare] = useState<ShareSummary | null>(null);
  const [contactsSupported, setContactsSupported] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [pendingList, setPendingList] = useState<string[]>([]);
  const pendingDataRef = useRef<Record<string, { timer: ReturnType<typeof setTimeout> | null; away: boolean }>>({});
  const hiddenAtRef = useRef<number | null>(null);
  const [failedPhones, setFailedPhones] = useState<Set<string>>(new Set());
  const percentRef = useRef(0);
  const [listSearch, setListSearch] = useState("");
  const [showCertValue, setShowCertValue] = useState(false);
  const [expandedList, setExpandedList] = useState(false);

  useEffect(() => {
    percentRef.current = share?.percent ?? 0;
  }, [share]);

  useEffect(() => {
    if (typeof window !== "undefined" && "contacts" in navigator && !!navigator.contacts) {
      setContactsSupported(true);
    }
  }, []);

  const loadShare = useCallback(async () => {
    try {
      const r = await fetch("/api/share");
      if (r.ok) setShare(await r.json());
    } catch { /* ignore */ }
  }, []);

  // Each GET of the referral link issues a brand-new single-use token, so the
  // "Your Referral Link" card shows a DIFFERENT link every time it is shared.
  const refreshReferral = useCallback(async () => {
    try {
      const resp = await fetch("/api/referral/config");
      if (!resp.ok) return null;
      const cfg = await resp.json() as { referralLink?: string; shareText?: string };
      const next = { link: cfg.referralLink || "", text: cfg.shareText || "" };
      if (next.link) setLink(next.link);
      if (next.text) setShareText(next.text);
      return next;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() as Promise<Me> : Promise.resolve(null)))
      .then((m) => {
        if (!m?.workerId) { window.location.href = "/"; return; }
        setMe(m);
      })
      .catch(() => {})
      .finally(() => setLoadingInit(false));
    refreshReferral();
    loadShare();
  }, [loadShare, refreshReferral]);

  // Parallel verification: each sent phone verifies on its own 1-minute timer.
  // Returning from a real WhatsApp visit (≥3s away) verifies instantly. A phone
  // never left for WhatsApp is cancelled at its deadline (not counted).
  const stopVerify = (phone: string) => {
    const d = pendingDataRef.current[phone];
    if (d?.timer) clearTimeout(d.timer);
    delete pendingDataRef.current[phone];
    setPendingList((prev) => prev.filter((p) => p !== phone));
  };

  const verifyPhone = (phone: string) => {
    stopVerify(phone);
    confirmSent(phone);
  };

  const startVerify = (phone: string) => {
    const existing = pendingDataRef.current[phone];
    if (existing?.timer) clearTimeout(existing.timer);
    pendingDataRef.current[phone] = { timer: null, away: false };
    pendingDataRef.current[phone].timer = setTimeout(() => {
      const d = pendingDataRef.current[phone];
      if (!d) return;
      if (d.away) {
        verifyPhone(phone);
      } else {
        delete pendingDataRef.current[phone];
        setPendingList((prev) => prev.filter((p) => p !== phone));
        setFailedPhones((prev) => { const n = new Set(prev); n.add(phone); return n; });
        setMsg({ kind: "warn", text: t("⚠️ সঠিকভাবে পাঠানো যায়নি — এটি বাতিল হয়ে গেছে। সার্টিফিকেটের অগ্রগতি এগোয়নি — পুনরায় পাঠাতে বাটনে চাপ দিন।", "⚠️ The send couldn't be verified — it's been cancelled. Your certificate progress hasn't moved — tap the button to send again.") });
      }
    }, VERIFY_MS);
  };

  // Return-detection: whenever the page comes back from WhatsApp after ≥3s
  // away, every pending send that actually left for WhatsApp verifies at once —
  // no waiting, and more sends keep running in parallel meanwhile.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        for (const phone of Object.keys(pendingDataRef.current)) {
          if (pendingDataRef.current[phone]) pendingDataRef.current[phone].away = true;
        }
        return;
      }
      const hid = hiddenAtRef.current;
      hiddenAtRef.current = null;
      if (hid && Date.now() - hid >= 3000) {
        for (const phone of Object.keys(pendingDataRef.current)) {
          if (pendingDataRef.current[phone]?.away) verifyPhone(phone);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      for (const phone of Object.keys(pendingDataRef.current)) {
        const d = pendingDataRef.current[phone];
        if (d?.timer) clearTimeout(d.timer);
      }
    };
  }, []);

  const confirmSent = useCallback(async (phone: string) => {
    try {
      const resp = await fetch("/api/share/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!resp.ok) return;
      const data: ShareSummary = await resp.json();
      setShare(data);
      trackEvent("share_sent", { pageCategory: "complete", metadata: { method: "whatsapp" } });
      if (data.completed) {
        setMsg({ kind: "ok", text: t("🎉 অভিনন্দন! আপনি ১০০% পূরণ করেছেন — সার্টিফিকেট অর্জন করেছেন!", "🎉 Congratulations! You reached 100% and earned your certificate!") });
      } else {
        const prevPercent = percentRef.current;
        if (data.percent >= 80 && prevPercent < 80) {
          setMsg({ kind: "ok", text: t(`🚀 একদম শেষে! এখন ${data.percent}% — বাকিটুকু পার করুন!`, `🚀 Almost there! You're at ${data.percent}% — finish it!`) });
        } else if (data.percent >= 50 && prevPercent < 50) {
          setMsg({ kind: "ok", text: t(`🎯 অর্ধেক পথ শেষ! এখন ${data.percent}% — চালিয়ে যান!`, `🎯 Halfway there! You're at ${data.percent}% — keep going!`) });
        } else if (data.sent > 0 && data.sent % 5 === 0) {
          setMsg({ kind: "ok", text: t(`👏 দারুণ গতি! এখন ${data.percent}% — নতুন ভিন্ন মানুষদের কাছে শেয়ার করুন 💪`, `👏 Great pace! You're at ${data.percent}% — now share with new different people 💪`) });
        }
      }
    } catch { /* ignore */ }
  }, [t]);

  const sendTo = async (phone: string, text?: string) => {
    if (!text && !shareText) return;
    // Rotate first: every send (including "আবার পাঠান") gets a brand-new
    // single-use referral link. On failure we keep the previous text.
    let msg = text || shareText;
    try {
      const resp = await fetch("/api/share/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (resp.ok) {
        const data = await resp.json() as { shareText?: string };
        if (data.shareText) msg = data.shareText;
      }
    } catch { /* fall back to the existing text */ }
    trackEvent("share_click", { pageCategory: "complete", metadata: { method: "whatsapp_send" } });
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    setFailedPhones((prev) => { const n = new Set(prev); n.delete(phone); return n; });
    hiddenAtRef.current = Date.now();
    if (!pendingDataRef.current[phone]) {
      setPendingList((prev) => [...prev, phone]);
    }
    startVerify(phone);
  };

  const submitContacts = async (valid: { name: string; tel: string; groupId?: string }[]) => {
    if (busy || valid.length === 0) return;
    setBusy(true);
    setMsg(null);
    try {
      const resp = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: valid }),
      });
      const data = await resp.json() as ShareSummary;
      if (!resp.ok) {
        setMsg({ kind: "error", text: t("কিছু ভুল হয়েছে — আবার চেষ্টা করুন।", "Something went wrong — try again.") });
        return;
      }
      setShare(data);
      const noWa = data.noWhatsApp || [];
      if (noWa.length > 0) {
        setMsg({ kind: "warn", text: t(`এই নাম্বারগুলোতে WhatsApp নেই — সেগুলো গোনা হবে না: ${noWa.map((p) => "+" + p).join(", ")}`, `These numbers have no WhatsApp — they won't count: ${noWa.map((p) => "+" + p).join(", ")}`) });
      } else if ((data.skipped ?? 0) > 0 && (data.added ?? 0) > 0) {
        setMsg({ kind: "ok", text: t("✅ যুক্ত হয়েছে! কয়েকজন আগেই ছিল — বাকি প্রত্যেকে নিজস্ব ইউনিক লিংক পেয়েছে।", "Added! A few were already in — the rest got their own unique link.") });
      } else if ((data.skipped ?? 0) > 0) {
        setMsg({ kind: "warn", text: t("নির্বাচিত সবাই আগেই যুক্ত ছিলেন — ভিন্ন মানুষ বেছে নিন।", "All selected were already added — choose different people.") });
      } else if ((data.added ?? 0) > 0) {
        setMsg({ kind: "ok", text: t("✅ যুক্ত হয়েছে! প্রত্যেকে তার নিজস্ব লিংক পেয়েছে — এখন প্রত্যেককে আলাদা করে WhatsApp-এ পাঠান।", "Added! Each person got their own unique link — send each one separately on WhatsApp below.") });
      }
    } catch {
      setMsg({ kind: "error", text: t("কিছু ভুল হয়েছে — আবার চেষ্টা করুন।", "Something went wrong — try again.") });
    } finally {
      setBusy(false);
    }
  };

  const pickContacts = async () => {
    if (busy) return;
    if (!contactsSupported || !navigator.contacts) return;
    setBusy(true);
    setMsg(null);
    try {
      const picked = await navigator.contacts.select(["name", "tel"], { multiple: true });
      // Keep EVERY number under a person (one card may have 2–15 numbers). All
      // rows share a groupId so sending to any one number auto-marks the rest
      // sent and counts as a single person toward the certificate target.
      const valid: { name: string; tel: string; groupId: string }[] = [];
      let cardIdx = 0;
      const base = Date.now();
      for (const c of picked || []) {
        const name = (c.name && c.name[0]) || "";
        const tels = (c.tel || [])
          .map((raw) => raw || "")
          .filter((raw) => raw.replace(/\D/g, "").length >= 10);
        const uniqTels = [...new Set(tels)];
        if (uniqTels.length === 0) continue;
        const groupId = `card-${base}-${cardIdx++}`;
        for (const tel of uniqTels) {
          valid.push({ name, tel, groupId });
        }
      }
      if (valid.length === 0) {
        setMsg({ kind: "warn", text: t("কাউকে বেছে নেননি।", "No one selected.") });
        return;
      }
      await submitContacts(valid);
    } catch {
      setMsg({ kind: "error", text: t("মানুষ বেছে নেওয়া সম্ভব হয়নি।", "Could not open the contact picker.") });
    } finally {
      setBusy(false);
    }
  };

  const addManualPhone = async (phone: string): Promise<boolean> => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setMsg({ kind: "warn", text: t("সঠিক ১১ ডিজিটের নম্বর দিন।", "Enter a valid 11-digit number.") });
      return false;
    }
    await submitContacts([{ name: "", tel: digits }]);
    return true;
  };

  const motivation = (percent: number, sent: number, target: number): string => {
    if (sent >= target) return t("আপনি টার্গেট পূরণ করেছেন! সার্টিফিকেট নিতে নিচের বাটনে চাপ দিন।", "You completed the target! Tap the button below to claim your certificate.");
    if (percent >= 96) return t("আর একটু! শেষ ধাপ — চালিয়ে যান! 🔥", "Almost there — final push! 🔥");
    if (percent >= 80) return t("চমৎকার! ৮০%+ এগিয়ে আছেন — শেষের দিকে!", "Excellent! 80%+ done — in the final stretch!");
    if (percent >= 60) return t("দারুণ! ৬০%+ — অর্ধেকের বেশি পার করেছেন!", "Great! Past 60% — over halfway there!");
    if (percent >= 40) return t("ভালো করছেন! ৪০%+ — এগিয়ে যান!", "Good going! 40%+ — keep it up!");
    if (percent >= 20) return t("চমৎকার শুরু! ২০%+ — চালিয়ে যান!", "Great start! 20%+ — keep going!");
    return t("শুধু একজনকে পাঠালেই শুরু — দেখুন আপনার পার্সেন্টেজ বাড়ছে! ১০০%-এ পৌঁছালেই সার্টিফিকেট।", "Start with just one person — watch your percentage grow! Reach 100% and earn your certificate.");
  };

  const confetti = useMemo(() => {
    const colors = ["#F97316", "#EC4899", "#8B5CF6", "#FFC107", "#10B981", "#EF4444"];
    return Array.from({ length: 40 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      backgroundColor: colors[i % colors.length],
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2.8 + Math.random() * 2}s`,
    }));
  }, []);

  const copy = async () => {
    const fresh = await refreshReferral();
    const value = fresh?.link || link;
    try { await navigator.clipboard.writeText(value); } catch { /* ignore */ }
    setCopied(true);
    trackEvent("share_click", { pageCategory: "complete", metadata: { method: "copy" } });
    setTimeout(() => setCopied(false), 1800);
  };

  const shareWhatsApp = async () => {
    const fresh = await refreshReferral();
    const text = fresh?.text || shareText;
    if (!text) return;
    trackEvent("share_click", { pageCategory: "complete", metadata: { method: "whatsapp" } });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loadingInit) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-pink/20 border-t-pink rounded-full animate-spin" />
      </main>
    );
  }

  const percent = share?.percent ?? 0;
  const allContacts = (share?.contacts || []);
  const sentContacts = allContacts.filter((c) => c.status === "sent");
  const selectedContacts = allContacts.filter((c) => c.status === "selected");
  const q = listSearch.trim().toLowerCase();
  const searchFilter = (c: { phone: string; name: string }) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
  const LIST_PREVIEW = 5;
  const searching = q.length > 0;
  const shownSelectedAll = selectedContacts.filter(searchFilter);
  const shownSentAll = sentContacts.filter(searchFilter);
  const expanded = expandedList || searching;
  const shownSelected = expanded ? shownSelectedAll : shownSelectedAll.slice(0, LIST_PREVIEW);
  const shownSent = expanded ? shownSentAll : shownSentAll.slice(0, LIST_PREVIEW);
  const hiddenCount = (shownSelectedAll.length - shownSelected.length) + (shownSentAll.length - shownSent.length);
  const sentCount = share?.sent ?? 0;
  const completed = share?.completed ?? false;
  const target = share?.target ?? 30;

  return (
    <main className="min-h-screen overflow-x-hidden relative pt-20">
      {completed && confetti.map((c, i) => (
        <span key={i} className="confetti-piece" style={c} />
      ))}

      <div className="max-w-lg mx-auto px-4 py-10 text-center safe-bottom">
        <div className="mx-auto w-24 h-24 rounded-[2rem] bg-gradient-to-br from-gold via-pink to-violet flex items-center justify-center text-5xl shadow-2xl shadow-pink/40 animate-pulse-glow">
          🏆
        </div>
        <h1 className="mt-5 text-3xl md:text-4xl font-black leading-tight">
          <span className="gradient-text animate-shimmer">{t("অভিনন্দন!", "Congratulations!")}</span>
        </h1>
        <p className="mt-2 text-base text-ink-soft">
          {t("আপনার প্রোফাইল কমপ্লিট হয়েছে", "Your profile is complete")} 🎊
        </p>
        {me?.name && <p className="mt-1 font-black text-brand">{me.name}</p>}
        {me?.workerId && <p className="text-xs font-bold text-ink-soft mt-0.5">{me.workerId}</p>}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="card-pop !p-4">
            <div className="text-2xl">👥</div>
            <p className="mt-1 text-xl font-black text-brand">{me?.totalTeamMembers ?? 0}</p>
            <p className="text-[11px] font-bold text-ink-soft">{t("টিম সদস্য", "Team Members")}</p>
          </div>
          <div className="card-pop !p-4">
            <div className="text-2xl">💰</div>
            <p className="mt-1 text-xl font-black text-teal">{me?.resourceIncome ?? 0}</p>
            <p className="text-[11px] font-bold text-ink-soft">{t("বোনাস রিসোর্স", "Bonus Resources")}</p>
          </div>
        </div>

        {/* Certificate path (share-to-30) */}
        <div className="mt-6 card-splash !rounded-[2rem] text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">🎓 {t("সার্টিফিকেটের পথে", "Certificate Path")}</h2>
            <span className="badge-glow bg-teal/20 text-teal border border-teal/40">{t("শেয়ার • সার্টিফিকেট", "Share • Certify")}</span>
          </div>
          <p className="mt-2 text-xs text-white/70">{motivation(percent, sentCount, target)}</p>

          {/* Certificate value toggle — click to reveal what this certificate means */}
          <button
            onClick={() => setShowCertValue((v) => !v)}
            className="mt-3 w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-gold/15 via-pink/15 to-violet/15 border border-gold/30 active:scale-[0.99] transition-all"
          >
            <span className="text-xs font-black text-gold">🎓 {t("এই সার্টিফিকেটের মূল্য জানুন", "Learn what this certificate means")}</span>
            <span className={`text-gold text-sm transition-transform ${showCertValue ? "rotate-180" : ""}`}>▾</span>
          </button>

          {showCertValue && (
            <div className="mt-3 rounded-2xl bg-white/[0.04] border border-white/15 p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-lg">📜</div>
                <div>
                  <p className="text-sm font-black text-white">{t("কী সার্টিফিকেট পাবেন", "What you earn")}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">
                    {t("রেফারেল অ্যাম্বাসেডর — কমিউনিটি বিল্ডিং ও ডিজিটাল মার্কেটিং অভিজ্ঞতার যাচাইযোগ্য সনদ। QR কোড, ইউনিক সার্টিফিকেট ID ও অনলাইন ভেরিফিকেশন — নিয়োগকর্তা যেকোনো সময় সত্যতা নিশ্চিত করতে পারেন।", "Referral Ambassador — a verifiable certificate of community-building & digital marketing experience. QR code, unique ID and online verification — any employer can confirm its authenticity anytime.")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-teal/15 border border-teal/30 flex items-center justify-center text-lg">💼</div>
                <div>
                  <p className="text-sm font-black text-white">{t("আপনার জীবনে যেভাবে কাজে লাগবে", "How it helps your career")}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">
                    {t("এই সার্টিফিকেট CV/রিজিউমেতে যুক্ত করলেই ডিজিটাল মার্কেটিং, কমিউনিটি ম্যানেজার, সেলস/প্রমোশন ও অ্যাফিলিয়েট ভূমিকায় চাকরির দরজা খুলবে — অভিজ্ঞ প্রার্থী হিসেবে আলাদাভাবে দাঁড় করাবে।", "Adding this certificate to your CV opens doors in digital marketing, community management, sales/promotion and affiliate roles — making you stand out as an experienced candidate.")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-pink/15 border border-pink/30 flex items-center justify-center text-lg">💰</div>
                <div>
                  <p className="text-sm font-black text-white">{t("আয়ের সম্ভাবনা", "Income potential")}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">
                    {t("এই অভিজ্ঞতা দিয়ে এন্ট্রি-লেভেল ডিজিটাল মার্কেটিং, কমিউনিটি ম্যানেজমেন্ট ও সেলস ভূমিকায় সাধারণত মাসে ৳১৫,০০০–৳৪০,০০০ আয় সম্ভব — অভিজ্ঞতা ও সক্রিয়তার ওপর নির্ভরশীল।", "With this experience, entry-level digital marketing, community management and sales roles typically pay ৳15,000–৳40,000 per month — depends on experience and activity.")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-violet/15 border border-violet/30 flex items-center justify-center text-lg">📈</div>
                <div>
                  <p className="text-sm font-black text-white">{t("কেন বিশ্বাসযোগ্য", "Why it's trusted")}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">
                    {t("গ্লোবাল সার্ভেতে ৭৬% সার্টিফিকেটধারী আয় বৃদ্ধি বা প্রমোশন পেয়েছেন — আপনারটাও হতে পারে! আর QR স্ক্যান বা অনলাইন লিংকে যেকোনো সময় সত্যতা যাচাই করা যায়।", "In a global survey, 76% of certificate holders received a salary increase or promotion — yours could be next! Plus the QR scan or online link verifies its authenticity anytime.")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Certificate preview — exactly how the certificate will look. View
              only (no download); uses the user's real name when available. */}
          <p className="mt-4 text-xs font-black text-gold">
            👀 {t("এভাবেই দেখাবে আপনার সার্টিফিকেট", "Here's how your certificate will look")}
          </p>
          <div className="mt-2 relative bg-white text-gray-900 rounded-2xl p-5 shadow-2xl">
            <div className="absolute inset-2 border-2 border-gold rounded-xl pointer-events-none" />
            <div className="absolute inset-3 border border-gold/50 rounded-lg pointer-events-none" />
            <div className="relative text-center">
              <p className="text-[9px] font-black tracking-[0.25em] text-gold">ইউটিউব আর্নার · YOUTUBE EARNER</p>
              <h3 className="mt-2 text-lg font-black text-gray-900">CERTIFICATE OF ACHIEVEMENT</h3>
              <div className="mt-1.5 mx-auto h-0.5 w-28 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <p className="mt-2 text-[11px] font-bold text-gray-600">This certifies that</p>
              <p className="mt-2 text-2xl font-black text-brand">{me?.name || t("রহিম উদ্দিন", "Rahim Uddin")}</p>
              <p className="mt-3 text-[11px] leading-relaxed text-gray-700">
                has successfully completed their full profile on <b>YouTube Earner</b> and referred
                <b> {target} people</b> through the referral program, demonstrating outstanding
                community-building and digital marketing skills.
              </p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="text-left text-[10px] text-gray-600">
                  <p className="font-black text-gray-900">Certificate ID</p>
                  <p className="mt-0.5 font-mono font-bold">YA-REF-2026-XXXXXX</p>
                  <p className="mt-2 font-black text-gray-900">Date</p>
                  <p className="mt-0.5 font-bold">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-1.5 rounded-lg border border-gray-200">
                    <QRCode value="https://youtube.earner.workers.dev/certificate?id=YA-REF-2026-XXXXXX" size={72} />
                  </div>
                  <p className="mt-1 text-[8px] text-gray-500">Scan to verify</p>
                </div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-gray-200 text-[10px] text-gray-500">
                <p className="font-bold">Authorized Signatory — YouTube Earner</p>
                <p className="mt-0.5">Verify online: youtube.earner.workers.dev/certificate?id=YA-REF-2026-XXXXXX</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-[10px] font-bold text-white/40">
            ⓘ {t("নমুনা · SAMPLE — এটি আপনার আসল সার্টিফিকেট নয়, শুধু দেখার জন্য। ডাউনলোড করা যাবে না।", "Sample · preview only — not your real certificate, and it cannot be downloaded.")}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-amber transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm font-black text-brand">{percent}%</span>
          </div>

          {/* Small-Area framing: early emphasize earned %, late emphasize small remaining */}
          <p className="mt-2 text-xs font-bold text-teal">
            {percent < 50
              ? t(`আপনি ${percent}% পূরণ করেছেন — চালিয়ে যান!`, `You're at ${percent}% — keep going!`)
              : percent < 90
                ? t(`আর মাত্র ${100 - percent}% বাকি — এগিয়ে যান!`, `Only ${100 - percent}% left — keep it up!`)
                : t(`একদম শেষ! আর মাত্র ${100 - percent}% বাকি 🔥`, `Almost done! Just ${100 - percent}% left 🔥`)}
          </p>

          <div className="mt-3 px-3 py-2 rounded-xl bg-emerald/10 border border-emerald/30 text-[11px] font-bold text-emerald leading-relaxed">
            {t(
              `✅ আপনি যখন একজনকে শেয়ার করবেন, দেখবেন আপনার পার্সেন্টেজ বাড়ছে — এভাবে ১০০%-এ পৌঁছালেই সার্টিফিকেট। সবাইকে একসাথে বেছে নিতে পারেন, সীমা নেই।`,
              `✅ When you share with someone, watch your percentage grow — hit 100% and earn your certificate. You can pick ALL your contacts at once — no limit.`
            )}
          </div>

          {msg && (
            <div className={`mt-3 px-3 py-2 rounded-xl text-xs font-bold ${
              msg.kind === "ok" ? "bg-teal/15 text-teal border border-teal/30"
              : msg.kind === "warn" ? "bg-gold/15 text-gold border border-gold/30"
              : "bg-red/15 text-red border border-red/30"
            }`}>
              {msg.text}
            </div>
          )}

          {!completed ? (
            <>
              {(selectedContacts.length > 0 || sentContacts.length > 0) && (
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-bold text-white/50 uppercase tracking-wide">
                    {t(`তালিকা (যুক্ত ${selectedContacts.length} • পাঠানো ${sentContacts.length})`, `List (added ${selectedContacts.length} • sent ${sentContacts.length})`)}
                  </p>
                  <AddPeopleBlock
                    t={t}
                    busy={busy}
                    contactsSupported={contactsSupported}
                    onGoogle={() => setMsg({ kind: "warn", text: t("⚠️ এই অপশনটি সাময়িকভাবে বন্ধ আছে — নিচের অপশন থেকে চেক করুন।", "⚠️ This option is temporarily closed — check the option below.") })}
                    onNativePick={pickContacts}
                    onManualAdd={addManualPhone}
                  />
                  <input
                    value={listSearch}
                    onChange={(e) => setListSearch(e.target.value)}
                    placeholder={t("🔍 নাম বা নম্বর দিয়ে খুঁজুন…", "🔍 Search by name or number…")}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-bold placeholder-white/40 focus:outline-none focus:border-pink/60"
                  />
                  {shownSelected.length === 0 && shownSent.length === 0 && (
                    <p className="text-[11px] text-white/40 py-1">{t("কিছু পাওয়া যায়নি।", "Nothing found.")}</p>
                  )}
                  {shownSelected.map((c, i) => (
                    <div
                      key={`${c.phone}-${i}`}
                      className={`bg-white/5 border rounded-xl px-3 py-2 ${failedPhones.has(c.phone) ? "border-red/40 bg-red/[0.07]" : "border-white/10"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{c.name || t("নাম নেই", "No name")}</p>
                          <p className="text-[10px] text-white/40 font-mono">{`+${c.phone}`}</p>
                          {pendingList.includes(c.phone) && (
                            <p className="text-[10px] font-bold text-gold mt-0.5">
                              🔍 {t("যাচাই করা হচ্ছে", "Verifying")}
                              <span className="verify-dots"><span /><span /><span /></span>
                            </p>
                          )}
                          {failedPhones.has(c.phone) && (
                            <p className="text-[10px] font-bold text-red mt-0.5">{t("✗ বাতিল হয়েছে — আবার পাঠান", "✗ Cancelled — send again")}</p>
                          )}
                        </div>
                        {c.waExists === false ? (
                          <span className="flex-shrink-0 px-3 py-2 rounded-xl bg-white/5 text-white/40 border border-white/10 text-[10px] font-black">
                            {t("WhatsApp নেই", "No WhatsApp")}
                          </span>
                        ) : pendingList.includes(c.phone) ? (
                          <button
                            onClick={() => sendTo(c.phone, c.shareText)}
                            className="flex-shrink-0 px-3 py-2 rounded-xl bg-gold/15 border border-gold/30 text-gold text-[10px] font-black active:scale-95 transition-all"
                          >
                            🔄 {t("পুনরায় পাঠান", "Send again")}
                          </button>
                        ) : failedPhones.has(c.phone) ? (
                          <button
                            onClick={() => sendTo(c.phone, c.shareText)}
                            className="flex-shrink-0 px-3 py-2 rounded-xl bg-red/15 border border-red/40 text-red text-[10px] font-black active:scale-95 transition-all"
                          >
                            📤 {t("পুনরায় পাঠান", "Send again")}
                          </button>
                        ) : (
                          <button
                            onClick={() => sendTo(c.phone, c.shareText)}
                            className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-[#25D366] to-teal text-white text-xs font-black active:scale-95 transition-all"
                          >
                            📤 {t("WhatsApp-এ পাঠান", "Send")}
                          </button>
                        )}
                      </div>
                      {pendingList.includes(c.phone) && (
                        <div className="mt-2 px-3 py-2 rounded-xl bg-gold/10 border border-gold/30 text-[10px] font-bold text-gold leading-relaxed">
                          ⚠️ {t(
                            "কঠোরভাবে যাচাই করা হচ্ছে — আপনি সঠিকভাবে WhatsApp-এ পাঠিয়েছেন কিনা নিশ্চিত করা হচ্ছে। সঠিকভাবে পাঠানো না হলে এটি বাতিল হয়ে যাবে। এতে আপনার সার্টিফিকেট পাওয়া আরও কঠিন হয়ে যেতে পারে — অগ্রগতিতে পিছিয়ে পড়তে পারেন।",
                            "Strictly verifying — making sure you actually sent it on WhatsApp. If not sent properly, it will be cancelled. This can make earning your certificate harder — you may fall behind on your progress."
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {shownSent.map((c, i) => (
                    <div key={`sent-${c.phone}-${i}`} className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 opacity-75">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{c.name || t("নাম নেই", "No name")}</p>
                        <p className="text-[10px] text-white/40 font-mono">{`+${c.phone}`}</p>
                        <p className="text-[10px] font-bold text-teal mt-0.5">
                          {c.sentAt
                            ? t(`✅ একবার পাঠানো হয়েছে (${new Date(c.sentAt.replace(" ", "T")).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}) — আবার পাঠাতে পারেন`, `✅ Sent once (${new Date(c.sentAt.replace(" ", "T")).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}) — you can send again`)
                            : t("✅ একবার পাঠানো হয়েছে — আবার পাঠাতে পারেন", "✅ Already sent — you can send again")}
                        </p>
                      </div>
                      {c.waExists === false ? (
                        <span className="flex-shrink-0 px-3 py-2 rounded-xl bg-white/5 text-white/40 border border-white/10 text-[10px] font-black">
                          {t("WhatsApp নেই", "No WhatsApp")}
                        </span>
                      ) : (
                        <button
                          onClick={() => sendTo(c.phone, c.shareText)}
                          className="flex-shrink-0 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-black active:scale-95 transition-all"
                        >
                          🔁 {t("আবার পাঠান", "Send again")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!expanded && hiddenCount > 0 && (
                <button
                  onClick={() => setExpandedList(true)}
                  className="mt-3 w-full py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs font-black text-teal active:scale-[0.99] transition-all"
                >
                  {t(`আরও দেখুন (${hiddenCount})`, `Show more (${hiddenCount})`)}
                </button>
              )}

              <div className="mt-4 space-y-2">
                <AddPeopleBlock
                  t={t}
                  busy={busy}
                  contactsSupported={contactsSupported}
                  onGoogle={() => setMsg({ kind: "warn", text: t("⚠️ এই অপশনটি সাময়িকভাবে বন্ধ আছে — নিচের অপশন থেকে চেক করুন।", "⚠️ This option is temporarily closed — check the option below.") })}
                  onNativePick={pickContacts}
                  onManualAdd={addManualPhone}
                />
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-gold/20 via-pink/20 to-violet/20 border border-gold/30 p-5 text-center">
              <div className="text-5xl animate-pulse-glow">🎉</div>
              <h3 className="mt-2 text-xl font-black gradient-text">{t("সার্টিফিকেট অর্জন করেছেন!", "Certificate Earned!")}</h3>
              <p className="mt-1 text-xs text-white/70">
                {t(`আপনি ${target} জনকে রেফারেল পাঠিয়ে এটি অর্জন করেছেন। এটি ডাউনলোড করুন বা অনলাইনে যাচাই করুন।`, `Earned by referring ${target} people. Download it or verify it online.`)}
              </p>
              {share?.certificateId && (
                <button
                  onClick={() => router.push(`/certificate?id=${share.certificateId}`)}
                  className="mt-4 btn-gold w-full text-sm !py-3.5"
                >
                  🎓 {t("সার্টিফিকেট দেখুন", "View Certificate")}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Referral */}
        <div className="mt-6 card-splash !rounded-[2rem] text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">🔗 {t("আপনার রেফারেল লিংক", "Your Referral Link")}</h2>
            <span className="badge-glow bg-gold/20 text-gold border border-gold/40">{t("শেয়ার করুন • সার্টিফিকেট অর্জন করুন", "Share • Earn Certificates")}</span>
          </div>
          <p className="mt-2 text-xs text-white/70">
            {t("এই লিংক দিয়ে যত বেশি বন্ধু জয়েন করবে, ততই সার্টিফিকেটের কাছাকাছি যাবেন।", "The more friends join through this link, the closer you get to your certificate.")}
          </p>
          <div className="mt-3 flex gap-2">
            <input
              readOnly
              value={link}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-3 rounded-2xl bg-white/15 backdrop-blur border border-white/25 text-white text-sm font-bold truncate focus:outline-none"
            />
            <button onClick={copy} className={`flex-shrink-0 px-4 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 ${copied ? "bg-teal text-white" : "bg-white text-brand"}`}>
              {copied ? "✅" : t("কপি", "Copy")}
            </button>
          </div>

          {/* QR */}
          <div className="mt-4 flex justify-center">
            <div className="bg-white rounded-3xl p-4 shadow-xl">
              {link ? <QRCode value={link} size={160} /> : null}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={shareWhatsApp} className="btn-gold w-full text-sm !py-3.5">
              📲 {t("WhatsApp-এ শেয়ার", "Share on WhatsApp")}
            </button>
            <button onClick={copy} className="btn-white w-full text-sm !py-3.5">
              🔗 {copied ? t("কপি হয়েছে!", "Copied!") : t("লিংক কপি করুন", "Copy Link")}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 card-pop text-left !p-5">
          <h3 className="font-black text-brand mb-3">💡 {t("কীভাবে এগিয়ে যাবেন", "How to Grow")}</h3>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>1️⃣ {t("লিংকটি ফেসবুক, ইউটিউব ও হোয়াটসঅ্যাপে শেয়ার করুন", "Share your link on Facebook, YouTube & WhatsApp")}</li>
            <li>2️⃣ {t("প্রতি রেফারেলে সার্টিফিকেটের অগ্রগতি ও বোনাস রিসোর্স পাবেন", "Earn certificate progress & bonus resources on every referral")}</li>
            <li>3️⃣ {t("বন্ধু বাড়লে সার্টিফিকেট ও স্বীকৃতি বাড়বে", "More friends = more certificates & recognition")}</li>
          </ul>
        </div>

        <button onClick={() => router.push("/")} className="mt-6 btn-outline w-full">
          {t("হোমে ফিরে যান", "Back to Home")}
        </button>
      </div>
    </main>
  );
}

// "Add people" block shown BOTH above the search (top of the list) and below
// the list, so customers can pick contacts from either place. Each instance
// keeps its own manual-input state (extracted so re-renders never reset it).
function AddPeopleBlock({
  t,
  busy,
  contactsSupported,
  onGoogle,
  onNativePick,
  onManualAdd,
}: {
  t: (bn: string, en: string) => string;
  busy: boolean;
  contactsSupported: boolean;
  onGoogle: () => void;
  onNativePick: () => void;
  onManualAdd: (phone: string) => Promise<boolean>;
}) {
  const [showManual, setShowManual] = useState(false);
  const [manualPhone, setManualPhone] = useState("");

  return (
    <div className="space-y-2">
      <button onClick={onGoogle} className="btn-gold w-full text-sm !py-3.5 opacity-70">
        📇 {t("আপনার পছন্দের মানুষদের বেছে নিন", "📇 Choose your favorite people")}
      </button>
      <p className="text-center text-[11px] font-black text-gold -mt-1">
        ⏸ {t("সাময়িকভাবে বন্ধ আছে — নিচের অপশন থেকে চেক করুন", "Temporarily closed — check the option below")}
      </p>
      <p className="text-center text-[11px] text-white/50 -mt-1">
        {t("যাদের কাছে আমাদের তথ্যটি শেয়ার করতে চান", "The ones you want to share our info with")}
      </p>

      {contactsSupported ? (
        <button onClick={onNativePick} disabled={busy} className="btn-white w-full text-sm !py-3.5 disabled:opacity-60">
          {busy ? t("প্রক্রিয়াধীন…", "Working…") : t("🔍 পছন্দের কাউকে না পেলে এখান থেকে খুঁজে নিন", "🔍 Didn't find them? Search here")}
        </button>
      ) : (
        <div className="mt-3 rounded-2xl bg-white/[0.04] border border-white/10 p-3">
          <p className="text-[11px] font-bold text-white/60 leading-relaxed">
            {t("এই ডিভাইসে ফোনবুক পিকার নেই — নিচের বাটনে চাপ দিয়ে নম্বর যোগ করুন।", "No phonebook picker on this device — add numbers with the button below.")}
          </p>
          <button onClick={() => setShowManual((v) => !v)} disabled={busy} className="mt-2 btn-white w-full text-sm !py-3 disabled:opacity-60">
            {t("📲 পছন্দের মানুষদের নাম্বার লিখে যোগ করুন", "📲 Add your people's numbers")}
          </button>
          {showManual && (
            <div className="mt-2 flex gap-2">
              <input
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                inputMode="tel"
                placeholder={t("বন্ধুর নম্বর (01XXXXXXXXX)", "Friend's number (01XXXXXXXXX)")}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white/15 backdrop-blur border border-white/25 text-white text-sm font-bold placeholder-white/40 focus:outline-none"
              />
              <button
                onClick={async () => {
                  const ok = await onManualAdd(manualPhone);
                  if (ok) setManualPhone("");
                }}
                disabled={busy}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-white text-brand text-sm font-black active:scale-95 transition-all disabled:opacity-60"
              >
                {t("যোগ করুন", "Add")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
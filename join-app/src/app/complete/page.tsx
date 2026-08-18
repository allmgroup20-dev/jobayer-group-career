"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { useLang } from "@/lib/lang";
import { trackEvent } from "@/lib/tracking";
import { A4_LANDSCAPE_H, A4_LANDSCAPE_W, useCertScale } from "@/lib/useCertScale";

declare global {
  interface Navigator {
    contacts?: {
      select(props: string[], opts: { multiple: boolean }): Promise<Array<{ name?: string[]; tel?: string[] }>>;
    };
  }
}

type Me = { workerId?: string; name?: string; totalTeamMembers?: number; resourceIncome?: number; referralJoins?: number };

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
  const [showCertPreview, setShowCertPreview] = useState(false);
  const [showShotHelp, setShowShotHelp] = useState(false);
  const [expandedList, setExpandedList] = useState(false);
  const [certName, setCertName] = useState("");
  const [certLocked, setCertLocked] = useState(false);
  const [certLockedUntil, setCertLockedUntil] = useState<string | null>(null);
  const [editNameMode, setEditNameMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<Msg>(null);
  const { ref: certPreviewRef, scale: certPreviewScale } = useCertScale();

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

  // Load the name shown on the earned certificate + its 30-day lock state.
  useEffect(() => {
    if (!share?.completed || !share?.certificateId) return;
    let cancelled = false;
    fetch(`/api/share/certificate?id=${encodeURIComponent(share.certificateId)}`)
      .then((r) => (r.ok ? r.json() : Promise.resolve(null)))
      .then((json) => {
        const d = json as { certName?: string; nameLocked?: boolean; nameLockedUntil?: string | null } | null;
        if (!cancelled && d) {
          setCertName(d.certName || "");
          setCertLocked(!!d.nameLocked);
          setCertLockedUntil(d.nameLockedUntil || null);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [share?.completed, share?.certificateId]);

  const saveName = async () => {
    const value = nameInput.trim();
    if (value.length < 2) {
      setNameMsg({ kind: "error", text: t("কমপক্ষে ২ অক্ষরের নাম দিন", "Type at least 2 characters") });
      return;
    }
    setSavingName(true);
    setNameMsg(null);
    try {
      const res = await fetch(`/api/share/certificate?id=${encodeURIComponent(share?.certificateId || "")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      const json = await res.json() as { error?: string; nameLockedUntil?: string | null; certName?: string };
      if (!res.ok) {
        const until = json.nameLockedUntil
          ? new Date(json.nameLockedUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
          : "";
        setNameMsg({ kind: "error", text: until ? `${json.error} — ${until} পর্যন্ত` : (json.error || t("ত্রুটি হয়েছে", "Something went wrong")) });
        return;
      }
      setCertName(json.certName ?? value);
      setCertLocked(true);
      setCertLockedUntil(json.nameLockedUntil || null);
      setEditNameMode(false);
      setNameMsg({ kind: "ok", text: t("✅ নাম সংরক্ষণ হয়েছে — এখন ৩০ দিনের জন্য লক হয়ে গেছে।", "✅ Name saved — it is now locked for 30 days.") });
    } catch {
      setNameMsg({ kind: "error", text: t("সংরক্ষণ ব্যর্থ হয়েছে, আবার চেষ্টা করুন।", "Could not save. Please try again.") });
    } finally {
      setSavingName(false);
    }
  };

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

  const copyMessage = async () => {
    const fresh = await refreshReferral();
    const text = fresh?.text || shareText;
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true);
    trackEvent("share_click", { pageCategory: "complete", metadata: { method: "copy_message" } });
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
  const referralJoins = me?.referralJoins ?? 0;

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
            <p className="text-[11px] font-bold text-ink-soft">{t("সহযোগী", "Associates")}</p>
          </div>
          <div className="card-pop !p-4">
            <div className="text-2xl">💰</div>
            <p className="mt-1 text-xl font-black text-teal">{me?.resourceIncome ?? 0}</p>
            <p className="text-[11px] font-bold text-ink-soft">{t("বোনাস রিসোর্স", "Bonus Resources")}</p>
          </div>
        </div>

        {/* Certificate journey — 3 steps */}
        <div className="mt-8">
          <p className="text-xs font-black text-white/50 uppercase tracking-widest text-center">
            {t("আপনার সার্টিফিকেট যাত্রা", "Your Certificate Journey")}
          </p>
          <div className="mt-3 flex items-center justify-center gap-1">
            {[1, 2, 3].map((n) => {
              const stepDone = n === 1 && completed;
              const stepUnlocked = n >= 2 && completed;
              return (
                <div key={n} className="flex items-center gap-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black border transition-all ${
                    stepDone ? "bg-teal/25 border-teal/60 text-teal"
                    : stepUnlocked ? "bg-gold/20 border-gold/50 text-gold"
                    : "bg-white/5 border-white/15 text-white/40"
                  }`}>
                    {stepDone ? "✓" : n}
                  </div>
                  {n < 3 && (
                    <div className={`h-0.5 w-5 rounded-full ${n <= (completed ? 1 : 0) ? "bg-gold/60" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate 1 — Foundation (share task) */}
        <div className="mt-6 card-splash !rounded-[2rem] text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">
              <span className="w-9 h-9 shrink-0 rounded-xl bg-teal/20 border border-teal/40 flex items-center justify-center text-base">🎓</span>
              <span>
                {t("ফাউন্ডেশন সার্টিফিকেট", "Foundation Certificate")}
                <span className="block text-[10px] font-bold text-white/40">{t("স্তর ১ • প্রথম ধাপ", "Level 1 • First step")}</span>
              </span>
            </h2>
            <span className={`badge-glow ${completed ? "bg-teal/20 text-teal border border-teal/40" : "bg-gold/20 text-gold border border-gold/40"}`}>
              {completed ? t("✅ সম্পন্ন", "Done") : t("🚀 চলছে", "In progress")}
            </span>
          </div>
          <p className="mt-2 text-xs text-white/70">
            {t("৩০ জন সহযোগীকে আমন্ত্রণ জানিয়ে ১০০% পূরণ করুন", "Invite 30 associates to reach 100%")}
          </p>

          {/* Preview — hidden behind a button so the card stays calm */}
          <button
            onClick={() => setShowCertPreview((v) => !v)}
            className="mt-3 w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 active:scale-[0.99] transition-all"
          >
            <span className="text-xs font-black text-teal">👁 {t("সার্টিফিকেট কেমন দেখাবে", "Preview the certificate")}</span>
            <span className={`text-white/60 text-sm transition-transform ${showCertPreview ? "rotate-180" : ""}`}>▾</span>
          </button>

          {showCertPreview && (
          <>

          {/* Certificate preview — a clearly-fake sample that CANNOT be used:
              sample name, fake ID/date, no scannable QR, diagonal watermark.
              Fixed A4-landscape canvas (same as the real certificate). */}
          <p className="mt-4 text-xs font-black text-gold">
            👀 {t("এভাবেই দেখাবে আপনার সার্টিফিকেট", "Here's how your certificate will look")}
          </p>
          <div ref={certPreviewRef} className="mt-2 w-full overflow-hidden" style={{ height: A4_LANDSCAPE_H * certPreviewScale }}>
            <div
              className="relative bg-white text-gray-900 rounded-2xl shadow-2xl select-none overflow-hidden"
              style={{
                width: A4_LANDSCAPE_W,
                height: A4_LANDSCAPE_H,
                transform: `scale(${certPreviewScale})`,
                transformOrigin: "top left",
              }}
            >
              <div className="absolute inset-4 border-2 border-gold rounded-xl pointer-events-none" />
              <div className="absolute inset-5 border border-gold/50 rounded-lg pointer-events-none" />
              <span className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-full bg-gold px-3 py-1 text-[13px] font-black uppercase tracking-wider text-white">
                ◈ PREVIEW · নমুনা
              </span>
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
                <span className="whitespace-nowrap rotate-[-24deg] text-[90px] font-black uppercase tracking-[0.25em] text-gray-900/10">
                  নমুনা · SAMPLE
                </span>
              </div>

              <div className="relative flex h-full flex-col items-center justify-center px-14 text-center">
                <img src="/logo-light.png" alt="YouTube Earner" className="mx-auto h-12 w-auto" />
                <h3 className="mt-3 text-4xl font-black text-gray-900">CERTIFICATE OF ACHIEVEMENT</h3>
                <div className="mt-2 mx-auto h-0.5 w-64 bg-gradient-to-r from-transparent via-gold to-transparent" />
                <p className="mt-3 text-base font-bold text-gray-600">This certifies that</p>
                <p className="mt-3 text-5xl font-black text-brand">{t("রহিম উদ্দিন", "Rahim Uddin")}</p>
                <p className="mt-4 text-base leading-relaxed text-gray-700 max-w-3xl mx-auto">
                  has successfully completed their full profile on <b>YouTube Earner</b> and proven
                  outstanding community-building and digital marketing skills by uniting a growing
                  community of learners and friends.
                </p>
                <div className="mt-6 flex w-full items-end justify-between">
                  <div className="text-left text-sm text-gray-600">
                    <p className="font-black text-gray-900">Certificate ID</p>
                    <p className="mt-1 font-mono font-bold">YA-REF-2026-XXXXXX</p>
                    <p className="mt-3 font-black text-gray-900">Date</p>
                    <p className="mt-1 font-bold">01 January 2026</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex h-[96px] w-[96px] items-center justify-center rounded-lg border border-gray-300 bg-gray-100">
                      <span className="text-center text-sm font-black leading-tight text-gray-400">🔒<br />নমুনা QR</span>
                    </div>
                    <p className="mt-1 text-[10px] font-bold text-gray-400">
                      {t("সত্যতা যাচাই করা যাবে না", "Not verifiable")}
                    </p>
                  </div>
                </div>
                <div className="mt-6 w-full pt-4 border-t border-gray-200 text-sm text-gray-500">
                  <p className="font-bold">Authorized Signatory — YouTube Earner</p>
                  <p className="mt-1">Verify online: youtube.earner.workers.dev/certificate?id=YA-REF-2026-XXXXXX</p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2 rounded-xl bg-red/10 border border-red/30 px-3 py-2 text-[10px] font-bold text-red leading-relaxed">
            ⚠️ {t("এটি নমুনা মাত্র — স্ক্রিনশট নিয়ে কোথাও ব্যবহার করা যাবে না। আসল সার্টিফিকেটে আপনার নিজের নাম, ইউনিক আইডি ও যাচাইযোগ্য QR থাকবে — যা ১০০% পূরণ করলেই পাওয়া যাবে।", "This is only a sample — it cannot be used anywhere, even via screenshot. Your real certificate will have your own name, a unique ID and a verifiable QR — available only after you reach 100%.")}
          </p>
          </>
          )}

          {/* Single progress — one bar, one encouraging line */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-amber transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm font-black text-brand">{percent}%</span>
          </div>
          <p className="mt-2 text-xs font-bold text-teal">{motivation(percent, sentCount, target)}</p>

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
                          🔍 {t(
                            "যাচাই করা হচ্ছে — নিশ্চিত করছি আপনি সত্যিই WhatsApp-এ পাঠিয়েছেন। সঠিকভাবে না পাঠালে এটি গোনা হবে না; চাইলে আবার পাঠাতে পারেন।",
                            "Verifying — making sure you really sent it on WhatsApp. If not sent properly, it won't count; you can always send again."
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
                {t("অসাধারণ কমিউনিটি-বিল্ডিং ও ডিজিটাল মার্কেটিং দক্ষতা প্রমাণ করে এটি অর্জন করেছেন — এখন ডাউনলোড করুন বা অনলাইনে যাচাই করুন।", "Earned by proving outstanding community-building and digital marketing skills — download it or verify it online.")}
              </p>

              {/* Name on the certificate — shown in hold state; Edit reveals the
                  save form so a mis-tap can never save anything by accident. */}
              <div className="mt-4 rounded-2xl bg-white/[0.06] border border-white/15 p-3.5 text-left">
                {!editNameMode ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 text-left">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                        {t("সার্টিফিকেটের নাম", "Name on certificate")}
                      </p>
                      <p className="mt-0.5 text-sm font-black text-white truncate">
                        {certName || me?.name || t("নাম নেই", "No name")}
                      </p>
                      {certLocked && certLockedUntil && (
                        <p className="mt-1 text-[10px] font-bold text-amber">
                          🔒 {t(`৩০ দিন লক — ${new Date(certLockedUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} পর্যন্ত`, `Locked 30 days — until ${new Date(certLockedUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => { setNameInput(certName || ""); setNameMsg(null); setEditNameMode(true); }}
                      disabled={certLocked}
                      className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-black active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
                    >
                      ✏️ {t("এডিট", "Edit")}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                      {t("নাম পরিবর্তন করুন", "Change name")}
                    </p>
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      maxLength={60}
                      autoFocus
                      className="mt-2 w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/25 text-white text-sm font-bold focus:outline-none focus:border-pink/60"
                      placeholder={t("আপনার নাম লিখুন", "Type your name")}
                    />
                    <p className="mt-2 rounded-lg bg-amber/10 border border-amber/30 px-2.5 py-1.5 text-[10px] font-bold text-amber leading-relaxed">
                      ⚠️ {t("একবার সংরক্ষণ করলে নামটি ৩০ দিনের জন্য লক হয়ে যাবে — ৩০ দিন পূর্ণ না হলে আর পরিবর্তন করা যাবে না।", "Once saved, the name locks for 30 days and cannot be changed until then.")}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={saveName}
                        disabled={savingName}
                        className="flex-1 px-3 py-2.5 rounded-xl btn-gold text-xs font-black disabled:opacity-40"
                      >
                        {savingName ? "…" : `💾 ${t("সংরক্ষণ করুন", "Save")}`}
                      </button>
                      <button
                        onClick={() => { setEditNameMode(false); setNameMsg(null); }}
                        className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-black active:scale-95 transition-all"
                      >
                        {t("বাতিল", "Cancel")}
                      </button>
                    </div>
                  </div>
                )}
                {nameMsg && (
                  <p className={`mt-2 text-[10px] font-bold ${nameMsg.kind === "ok" ? "text-teal" : "text-red"}`}>{nameMsg.text}</p>
                )}
              </div>

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

        {/* Certificate 2 — Referral Ambassador */}
        <div className="mt-6 card-splash !rounded-[2rem] text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">
              <span className="w-9 h-9 shrink-0 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-base">🔗</span>
              <span>
                {t("রেফারেল অ্যাম্বাসেডর সার্টিফিকেট", "Referral Ambassador Certificate")}
                <span className="block text-[10px] font-bold text-white/40">{t("স্তর ২ • দ্বিতীয় ধাপ", "Level 2 • Second step")}</span>
              </span>
            </h2>
            <span className={`badge-glow ${!completed ? "bg-white/10 text-white/40 border border-white/15" : "bg-gold/20 text-gold border border-gold/40"}`}>
              {!completed ? t("🔒 লক", "Locked") : t("🚀 চলছে", "In progress")}
            </span>
          </div>

          {!completed ? (
            <p className="mt-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/60 leading-relaxed">
              🔒 {t("প্রথমে ফাউন্ডেশন সার্টিফিকেট ১০০% সম্পন্ন করুন — এরপর এই সার্টিফিকেট ও ফাইনাল সার্টিফিকেট একসাথে আনলক হবে।", "Finish the Foundation Certificate to 100% first — then this certificate and the Final one unlock together.")}
            </p>
          ) : (
            <>
              <p className="mt-2 text-xs text-white/70">
                {t("৩টি কাজ সম্পন্ন করলেই সার্টিফিকেট পাবেন", "Complete these 3 steps to earn it")}
              </p>

              <div className="mt-3 space-y-2">
                {/* Step 1 — 11 joins */}
                <div className="flex gap-3 items-start px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-teal/20 text-teal text-xs font-black flex items-center justify-center mt-0.5">১</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white">{t("১১ জন সহযোগী জয়েন করান", "Get 11 associates to join")}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-teal transition-all duration-700" style={{ width: `${Math.min((referralJoins / 11) * 100, 100)}%` }} />
                      </div>
                      <span className="text-[11px] font-black text-teal">{referralJoins}/11</span>
                    </div>
                    <p className="mt-1 text-[10px] text-white/50">{t("আপনার লিংকে যারা আসলে জয়েন করেছে", "People who actually joined through your link")}</p>
                  </div>
                </div>

                {/* Step 2 — share written message */}
                <div className="flex gap-3 items-start px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-gold/20 text-gold text-xs font-black flex items-center justify-center mt-0.5">২</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white">{t("লিখিত মেসেজ শেয়ার করুন", "Share the written message")}</p>
                    <p className="mt-0.5 text-[10px] text-white/50 leading-relaxed">
                      {t("অ্যাপ থেকে মেসেজ কপি করে ৩টি ফেসবুক গ্রুপ + ১টি WhatsApp গ্রুপ + নিজের প্রোফাইলে পোস্ট করুন", "Copy the message from the app and post it in 3 Facebook groups + 1 WhatsApp group + your own profile")}
                    </p>
                  </div>
                </div>

                {/* Step 3 — screenshots */}
                <div className="flex gap-3 items-start px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-pink/20 text-pink text-xs font-black flex items-center justify-center mt-0.5">৩</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white">{t("৪টি স্ক্রিনশট জমা দিন", "Submit 4 screenshots")}</p>
                    <p className="mt-0.5 text-[10px] text-white/50 leading-relaxed">
                      {t("শেয়ারের স্ক্রিনশট আমাদের পাঠান — ২৪ ঘণ্টার মধ্যে ভেরিফাই করে সার্টিফিকেট দেব", "Send us the screenshots — we verify within 24 hours and issue the certificate")}
                    </p>
                    <button onClick={() => setShowShotHelp((v) => !v)} className="mt-1.5 text-[10px] font-black text-pink underline">
                      📤 {t("কীভাবে জমা দেবেন", "How to submit")} <span className={`inline-block transition-transform ${showShotHelp ? "rotate-180" : ""}`}>▾</span>
                    </button>
                    {showShotHelp && (
                      <div className="mt-2 rounded-lg bg-white/[0.04] border border-white/10 p-2.5 text-[10px] text-white/60 leading-relaxed">
                        <p>১. নিচের "📝 মেসেজ কপি করুন" বাটনে চাপ দিয়ে লেখাটি কপি করুন</p>
                        <p className="mt-1">২. ৩টি ফেসবুক গ্রুপে + ১টি WhatsApp গ্রুপে + নিজের প্রোফাইলে পোস্ট করুন</p>
                        <p className="mt-1">৩. প্রতিটি পোস্টের স্ক্রিনশট নিন (মোট ৪টি)</p>
                        <p className="mt-1">৪. স্ক্রিনশট জমা দেওয়ার সিস্টেম শীঘ্রই চালু হবে — ভেরিফাইয়ে ২৪ ঘণ্টা সময় লাগে</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sharing tools */}
              <div className="mt-4">
                <p className="text-[11px] font-black text-white/50 uppercase tracking-wide">{t("আপনার শেয়ার সরঞ্জাম", "Your sharing tools")}</p>
                <div className="mt-2 flex gap-2">
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

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={refreshReferral} className="py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs font-black text-teal active:scale-[0.99] transition-all">
                    🔄 {t("নতুন লিংক", "New link")}
                  </button>
                  <button onClick={copyMessage} className="py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs font-black text-gold active:scale-[0.99] transition-all">
                    📝 {t("মেসেজ কপি করুন", "Copy message")}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-white/40 text-center">
                  {t("প্রতিবার শেয়ারে নতুন আলাদা লিংক তৈরি হয় — সবাই একই লিংক পাবে না", "Every share creates a fresh unique link — no one gets the same link twice")}
                </p>

                <div className="mt-3 flex justify-center">
                  <div className="bg-white rounded-3xl p-4 shadow-xl">
                    {link ? <QRCode value={link} size={150} /> : null}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button onClick={shareWhatsApp} className="btn-gold w-full text-sm !py-3.5">
                    📲 {t("WhatsApp-এ শেয়ার", "Share on WhatsApp")}
                  </button>
                  <button onClick={copy} className="btn-white w-full text-sm !py-3.5">
                    🔗 {copied ? t("কপি হয়েছে!", "Copied!") : t("লিংক কপি করুন", "Copy Link")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Certificate 3 — Elite Final */}
        <div className="mt-6 card-splash !rounded-[2rem] text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">
              <span className="w-9 h-9 shrink-0 rounded-xl bg-violet/20 border border-violet/40 flex items-center justify-center text-base">🏆</span>
              <span>
                {t("এলিট ফাইনাল সার্টিফিকেট", "Elite Final Certificate")}
                <span className="block text-[10px] font-bold text-white/40">{t("স্তর ৩ • শেষ ধাপ", "Level 3 • Final step")}</span>
              </span>
            </h2>
            <span className={`badge-glow ${!completed ? "bg-white/10 text-white/40 border border-white/15" : "bg-violet/20 text-violet border border-violet/40"}`}>
              {!completed ? t("🔒 লক", "Locked") : t("✨ আনলক", "Unlocked")}
            </span>
          </div>
          {!completed ? (
            <p className="mt-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/60 leading-relaxed">
              🔒 {t("প্রথম সার্টিফিকেট ১০০% করলেই এই সার্টিফিকেট আনলক হবে।", "This certificate unlocks as soon as you finish the first one.")}
            </p>
          ) : (
            <p className="mt-3 px-3 py-2.5 rounded-xl bg-violet/10 border border-violet/30 text-xs text-violet leading-relaxed">
              ✨ {t("অভিনন্দন — ফাইনাল সার্টিফিকেট আনলক হয়েছে! কাজের বিশদ বিবরণ শীঘ্রই এখানে যুক্ত হবে।", "Congratulations — the Final certificate is unlocked! The full task details are coming soon.")}
            </p>
          )}
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
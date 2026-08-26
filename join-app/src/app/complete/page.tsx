"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import QRCode from "react-qr-code";
import { useLang } from "@/lib/lang";
import { trackEvent } from "@/lib/tracking";

// Sample previews are heavy (A4 canvas + fonts) and always hidden behind a
// toggle � load them on demand so the hub's first paint stays light.
const CertificateSample = dynamic(() => import("@/components/CertificateSample"), { ssr: false });

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

type HubTab = "foundation" | "ambassador" | "elite";

const HUB_TABS: { key: HubTab; icon: string; bn: string; en: string }[] = [
  { key: "foundation", icon: "??", bn: "?????????", en: "Foundation" },
  { key: "ambassador", icon: "??", bn: "????????????", en: "Ambassador" },
  { key: "elite", icon: "??", bn: "????", en: "Elite" },
];

const VERIFY_MS = 60_000; // verification window (max 1 minute)

// Google contacts picker is temporarily disabled in the UI. Flip to true to
// bring both instances back (top + bottom of the contact list) � no other
// change needed; handlers and ContactsModal wiring remain intact.
const SHOW_GOOGLE_CONTACTS = false;

export default function CompletePage() {
  const { lang } = useLang();
  const router = useRouter();
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);

  const [me, setMe] = useState<Me | null>(null);
  const [link, setLink] = useState("");
  const [shareText, setShareText] = useState("");
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
  const [showCert2Preview, setShowCert2Preview] = useState(false);
  const [showCert3Preview, setShowCert3Preview] = useState(false);
  const [showWaPicker, setShowWaPicker] = useState(false);
  const [showShotHelp, setShowShotHelp] = useState(false);
  const [expandedList, setExpandedList] = useState(false);
  const [certName, setCertName] = useState("");
  const [certLocked, setCertLocked] = useState(false);
  const [certLockedUntil, setCertLockedUntil] = useState<string | null>(null);
  const [editNameMode, setEditNameMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<Msg>(null);
  const [msgCopied, setMsgCopied] = useState(false);
  const [shotStatus, setShotStatus] = useState<"none" | "pending" | "verified" | "rejected">("none");
  const [shotCount, setShotCount] = useState(0);
  const [shotFiles, setShotFiles] = useState<File[]>([]);
  const [shotThumbs, setShotThumbs] = useState<string[]>([]);
  const [shotUploading, setShotUploading] = useState(false);
  const [shotMsg, setShotMsg] = useState<Msg>(null);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [activeStep, setActiveStep] = useState<HubTab>("foundation");
  const [eliteCertificateId, setEliteCertificateId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState<Msg>(null);
  const [amountInput, setAmountInput] = useState<string>("");
  const [interestFacility, setInterestFacility] = useState<string>("");
  const [otherInterest, setOtherInterest] = useState<string>("");
  const [is100Interested, setIs100Interested] = useState<boolean | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("30:00");
  const [expired, setExpired] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [officers, setOfficers] = useState<Array<{ id: number; name: string; status: "viewing" | "accepted" | "pending" | "rejected" }>>([]);

  useEffect(() => {
    percentRef.current = share?.percent ?? 0;
  }, [share]);

  useEffect(() => {
    if (typeof window !== "undefined" && "contacts" in navigator && !!navigator.contacts) {
      setContactsSupported(true);
    }
  }, []);

  // Deep-link support: /complete?step=ambassador opens that tab directly.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("step");
    if (s === "ambassador" || s === "elite" || s === "foundation") setActiveStep(s);
  }, []);

  // Tab switching keeps a shareable deep-link (?step=�) without changing routes.
  // MUST live above every effect that calls it (e.g. the ?membership=success
  // toast below) AND above the loadingInit early-return � otherwise effects can
  // fire while the binding is still in its temporal dead zone and crash.
  const switchStep = useCallback((k: HubTab) => {
    setActiveStep(k);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("step", k);
      window.history.replaceState({}, "", url.toString());
    } catch {}
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
      setNameMsg({ kind: "error", text: t("??????? ? ??????? ??? ???", "Type at least 2 characters") });
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
        setNameMsg({ kind: "error", text: until ? `${json.error} � ${until} ???????` : (json.error || t("?????? ??????", "Something went wrong")) });
        return;
      }
      setCertName(json.certName ?? value);
      setCertLocked(true);
      setCertLockedUntil(json.nameLockedUntil || null);
      setEditNameMode(false);
      setNameMsg({ kind: "ok", text: t("? ??? ??????? ?????? � ??? ?? ????? ???? ?? ???? ?????", "? Name saved � it is now locked for 30 days.") });
    } catch {
      setNameMsg({ kind: "error", text: t("??????? ?????? ??????, ???? ?????? ?????", "Could not save. Please try again.") });
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
  // Returning from a real WhatsApp visit (=3s away) verifies instantly. A phone
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
        setMsg({ kind: "warn", text: t("?? ???????? ?????? ?????? � ??? ????? ???? ????? ????????????? ??????? ??????? � ??????? ?????? ????? ??? ????", "?? The send couldn't be verified � it's been cancelled. Your certificate progress hasn't moved � tap the button to send again.") });
      }
    }, VERIFY_MS);
  };

  // Return-detection: whenever the page comes back from WhatsApp after =3s
  // away, every pending send that actually left for WhatsApp verifies at once �
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
        setMsg({ kind: "ok", text: t("?? ????????! ???? ???????? ?????? � ??????????? ????? ??????!", "?? Congratulations! You reached 100% and earned your certificate!") });
      } else {
        const prevPercent = percentRef.current;
        if (data.percent >= 80 && prevPercent < 80) {
          setMsg({ kind: "ok", text: t(`?? ???? ????! ??? ${data.percent}% � ???????? ??? ????!`, `?? Almost there! You're at ${data.percent}% � finish it!`) });
        } else if (data.percent >= 50 && prevPercent < 50) {
          setMsg({ kind: "ok", text: t(`?? ?????? ?? ???! ??? ${data.percent}% � ??????? ???!`, `?? Halfway there! You're at ${data.percent}% � keep going!`) });
        } else if (data.sent > 0 && data.sent % 5 === 0) {
          setMsg({ kind: "ok", text: t(`?? ????? ???! ??? ${data.percent}% � ???? ????? ???????? ???? ?????? ???? ??`, `?? Great pace! You're at ${data.percent}% � now share with new different people ??`) });
        }
      }
    } catch { /* ignore */ }
  }, [t]);

  const sendTo = async (phone: string, text?: string) => {
    if (!text && !shareText) return;
    // Rotate first: every send (including "???? ?????") gets a brand-new
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
        setMsg({ kind: "error", text: t("???? ??? ?????? � ???? ?????? ?????", "Something went wrong � try again.") });
        return;
      }
      setShare(data);
      const noWa = data.noWhatsApp || [];
      if (noWa.length > 0) {
        setMsg({ kind: "warn", text: t(`?? ????????????? WhatsApp ??? � ?????? ???? ??? ??: ${noWa.map((p) => "+" + p).join(", ")}`, `These numbers have no WhatsApp � they won't count: ${noWa.map((p) => "+" + p).join(", ")}`) });
      } else if ((data.skipped ?? 0) > 0 && (data.added ?? 0) > 0) {
        setMsg({ kind: "ok", text: t("? ????? ??????! ??????? ???? ??? � ???? ????????? ?????? ????? ???? ????????", "Added! A few were already in � the rest got their own unique link.") });
      } else if ((data.skipped ?? 0) > 0) {
        setMsg({ kind: "warn", text: t("????????? ???? ???? ????? ????? � ????? ????? ???? ????", "All selected were already added � choose different people.") });
      } else if ((data.added ?? 0) > 0) {
        setMsg({ kind: "ok", text: t("? ????? ??????! ????????? ??? ?????? ???? ??????? � ??? ?????????? ????? ??? WhatsApp-? ??????", "Added! Each person got their own unique link � send each one separately on WhatsApp below.") });
      }
    } catch {
      setMsg({ kind: "error", text: t("???? ??? ?????? � ???? ?????? ?????", "Something went wrong � try again.") });
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
      // Keep EVERY number under a person (one card may have 2�15 numbers). All
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
        setMsg({ kind: "warn", text: t("????? ???? ??????", "No one selected.") });
        return;
      }
      await submitContacts(valid);
    } catch {
      setMsg({ kind: "error", text: t("????? ???? ?????? ????? ??????", "Could not open the contact picker.") });
    } finally {
      setBusy(false);
    }
  };

  const addManualPhone = async (phone: string): Promise<boolean> => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setMsg({ kind: "warn", text: t("???? ?? ??????? ????? ????", "Enter a valid 11-digit number.") });
      return false;
    }
    await submitContacts([{ name: "", tel: digits }]);
    return true;
  };

  const motivation = (percent: number, sent: number, target: number): string => {
    if (sent >= target) return t("???? ??????? ???? ??????! ??????????? ???? ????? ????? ??? ????", "You completed the target! Tap the button below to claim your certificate.");
    if (percent >= 96) return t("?? ????! ??? ??? � ??????? ???! ??", "Almost there � final push! ??");
    if (percent >= 80) return t("??????! ??%+ ?????? ???? � ????? ????!", "Excellent! 80%+ done � in the final stretch!");
    if (percent >= 60) return t("?????! ??%+ � ???????? ???? ??? ??????!", "Great! Past 60% � over halfway there!");
    if (percent >= 40) return t("???? ?????! ??%+ � ?????? ???!", "Good going! 40%+ � keep it up!");
    if (percent >= 20) return t("?????? ????! ??%+ � ??????? ???!", "Great start! 20%+ � keep going!");
    return t("???? ?????? ??????? ???? � ????? ????? ??????????? ??????! ???%-? ???????? ????????????", "Start with just one person � watch your percentage grow! Reach 100% and earn your certificate.");
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

  const copyMessage = async () => {
    const fresh = await refreshReferral();
    const text = fresh?.text || shareText;
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setMsgCopied(true);
    trackEvent("share_click", { pageCategory: "complete", metadata: { method: "copy_message" } });
    setTimeout(() => setMsgCopied(false), 1800);
  };

  const completed = share?.completed ?? false;

  // Premium membership status (99 BDT via SSLCommerz OR admin sets premium) � premium => Elite immediately
  useEffect(() => {
    fetch("/api/membership/status")
      .then((r) => (r.ok ? r.json() : Promise.resolve(null)))
      .then((d) => {
        const dd = d as { isPremium?: boolean; eliteCertificateId?: string | null } | null;
        if (dd && typeof dd.isPremium === "boolean") {
          setIsPremium(dd.isPremium);
          if (dd.eliteCertificateId) setEliteCertificateId(dd.eliteCertificateId);
        } else setIsPremium(false);
      })
      .catch(() => setIsPremium(false));
    // Show toast from redirect ?membership=success / failed etc.
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const m = p.get("membership");
      if (m === "success") {
        setPayMsg({ kind: "ok", text: t("? ????????! ???? ??? ???% ?????????? ??????? � Elite ???? ??????!", "? Congratulations! You are now 100% premium � Elite unlocked!") });
        switchStep("elite");
      }
      else if (m === "failed") setPayMsg({ kind: "error", text: t("? ??????? ?????? ?????? � ???? ?????? ????", "Payment failed � please try again") });
      else if (m === "cancelled") setPayMsg({ kind: "warn", text: t("??????? ????? ??????", "Payment cancelled") });
      if (m) {
        const url = new URL(window.location.href);
        url.searchParams.delete("membership");
        window.history.replaceState({}, "", url.toString());
        // refresh premium status after redirect
        setTimeout(() => {
          fetch("/api/membership/status").then(r=>r.ok?r.json():null).then(dd=>{ const d = dd as { isPremium?: boolean; eliteCertificateId?: string | null } | null; if(d&&typeof d.isPremium==="boolean") { setIsPremium(d.isPremium); if(d.eliteCertificateId) setEliteCertificateId(d.eliteCertificateId); } }).catch(()=>{});
        }, 500);
      }
    }
    // Load attempt count from localStorage
    try {
      const savedAttempt = localStorage.getItem("elite_premium_attempt");
      if (savedAttempt) setAttempt(Number(savedAttempt) || 0);
    } catch {}
  }, [t]);

  // 30-min countdown starts immediately when 100% interest is shown
  useEffect(() => {
    if (is100Interested !== true || isPremium || verifying) return;
    try {
      const savedDeadline = localStorage.getItem("elite_premium_deadline");
      if (savedDeadline) {
        const dl = Number(savedDeadline);
        if (dl > Date.now()) {
          setDeadline(dl);
          setExpired(false);
          return;
        }
      }
      const dl = Date.now() + 30 * 60 * 1000;
      localStorage.setItem("elite_premium_deadline", String(dl));
      setDeadline(dl);
      setExpired(false);
    } catch {
      const dl = Date.now() + 30 * 60 * 1000;
      setDeadline(dl);
      setExpired(false);
    }
  }, [is100Interested, isPremium, verifying]);

  // 30-minute countdown
  useEffect(() => {
    if (isPremium || deadline === null || verifying) return;
    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00");
        setExpired(true);
        return;
      }
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
    const count = Math.min(2 + nextAttempt, 5); // 3,4,5 officers
    const officerNames = ["???????????, ????? ?????", "??????? ???????????, ????? ?????", "??????????????? ?????????, ?????????? ???????", "?????????, ????? ???????", "?????? ????????, ?????????? ???????"];
    const initial: Array<{ id: number; name: string; status: "viewing" | "accepted" | "pending" | "rejected" }> = Array.from({ length: count }, (_, i) => ({
      id: i, name: officerNames[i] || `????????? ${i + 1}`, status: "viewing" as const,
    }));
    setOfficers(initial);
    setVerifying(true);
    setExpired(false);
    // Total =60s, split per officer � long waits feel like stalling.
    const totalMs = Math.min(40000 + nextAttempt * 5000, 60000); // 45s, 50s, 55s� capped 60s
    const per = Math.floor(totalMs / count);
    initial.forEach((_, idx) => {
      setTimeout(() => {
        setOfficers((prev) => {
          const next = [...prev];
          // Last officer always accepted (ultimately permitted)
          if (idx === count - 1) next[idx].status = "accepted";
          else {
            // Mix: 1 accepted, 1 pending, rest rejected with increasing rejection on higher attempts
            const r = Math.random();
            if (idx === 0) next[idx].status = "accepted";
            else if (r < 0.35 + nextAttempt * 0.05) next[idx].status = "rejected";
            else next[idx].status = "pending";
          }
          return next;
        });
        if (idx === count - 1) {
          // Final officer accepted � grant 30 min again
          setTimeout(() => {
            const dl = Date.now() + 30 * 60 * 1000;
            try { localStorage.setItem("elite_premium_deadline", String(dl)); } catch {}
            setDeadline(dl);
            setExpired(false);
            setVerifying(false);
            setPayMsg({ kind: "ok", text: t("? ????????? ?????? ???????? � ??? ?? ??????? ????? ??????? ????", "Approved � you have 30 minutes to pay") });
          }, 800);
        }
      }, per * (idx + 1));
    });
  };

  const handlePremiumPay = async () => {
    if (paying || verifying || expired) return;
    // 100% flexible � single input, validate only at pay time
    const raw = amountInput.trim();
    let amt = Number(raw);
    if (!raw || !Number.isFinite(amt)) {
      setPayMsg({ kind: "warn", text: t("?????????? ????? � ???? ???", "Please enter an amount � e.g. 201") });
      return;
    }
    amt = Math.round(amt);
    if (amt < 99) {
      setPayMsg({ kind: "warn", text: t("????????? ?? ???? ??? ???", "Minimum is 99 Taka") });
      return;
    }
    if (amt > 10000) amt = 10000;
    if (is100Interested === false) {
      setPayMsg({ kind: "warn", text: t("?????? ??????? ?? ??? ??????? ???????? ??? � ????? ??? ???? ?????? ????", "If not 100% interested, no need to pay � try again when interested") });
      return;
    }
    setPaying(true);
    setPayMsg(null);
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
        setPayMsg({ kind: "error", text: json.error || t("??????? ???? ??? ??????", "Could not start payment") });
        return;
      }
      if (json.GatewayPageURL) {
        window.location.href = json.GatewayPageURL;
      }
    } catch {
      setPayMsg({ kind: "error", text: t("??????? ???? ??? ??????", "Could not start payment") });
    } finally {
      setPaying(false);
    }
  };

  // Referral-certificate screenshot proof: current status + upload.
  useEffect(() => {
    if (!completed) return;
    fetch("/api/share/screenshots")
      .then((r) => (r.ok ? r.json() : Promise.resolve(null)))
      .then((d) => {
        const s = d as { status?: string; count?: number } | null;
        if (s?.status && s.status !== "none") {
          setShotStatus(s.status as "pending" | "verified" | "rejected");
          setShotCount(s.count || 0);
        }
      })
      .catch(() => {});
  }, [completed]);

  const onShotPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setShotFiles(files);
    setShotThumbs(files.map((f) => URL.createObjectURL(f)));
    setShotMsg(null);
  };

  const submitScreenshots = async () => {
    if (shotUploading || shotFiles.length === 0) return;
    setShotUploading(true);
    setShotMsg(null);
    try {
      const fd = new FormData();
      for (const f of shotFiles) fd.append("files", f);
      const res = await fetch("/api/share/screenshots", { method: "POST", body: fd });
      const json = await res.json() as { error?: string };
      if (!res.ok) {
        setShotMsg({ kind: "error", text: json.error || t("??? ?????? ?????? � ???? ?????? ????", "Could not submit � try again") });
        return;
      }
      setShotStatus("pending");
      setShotCount(shotFiles.length);
      setShotFiles([]);
      setShotThumbs([]);
      setShotMsg({ kind: "ok", text: t("? ??? ??????! ?? ?????? ????? ??????? ????", "? Submitted! We'll verify within 24 hours.") });
    } catch {
      setShotMsg({ kind: "error", text: t("??? ?????? ?????? � ???? ?????? ????", "Could not submit � try again") });
    } finally {
      setShotUploading(false);
    }
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
  const target = share?.target ?? 30;
  const referralJoins = me?.referralJoins ?? 0;

  // Next Best Action � the ONE thing to do right now, based on real progress.
  type Nba = { title: string; sub: string; cta: string; run: () => void };
  const nba: Nba | null = (() => {
    if (!completed) {
      return {
        title: t("Foundation ??????????? ??????? ???", "Continue your Foundation certificate"),
        sub: t(
          `${percent}% ??????? � ??????? ?????? ?????? ???%-?? ???? ????? ????`,
          `${percent}% done � every share moves you closer to 100%`
        ),
        cta: t("?????? ??????? ???", "Continue sharing"),
        run: () => switchStep("foundation"),
      };
    }
    if (!isPremium) {
      if (referralJoins < 11) {
        return {
          title: t("Ambassador: ??? ????? ????? ????", "Ambassador: invite more people"),
          sub: t(
            `????? ????? ${referralJoins}/?? ?? ????? ?????? � Foundation ? ???????`,
            `${referralJoins} of 11 joined via your link � Foundation ? complete`
          ),
          cta: t("Ambassador ??? ?????", "Open Ambassador step"),
          run: () => switchStep("ambassador"),
        };
      }
      return {
        title: t("Elite ???? ???? ????", "Unlock Elite now"),
        sub: t(
          "Foundation ? � ????????? ?? ????? Elite ??????????? ???? ????",
          "Foundation ? � commit once and get the Elite certificate instantly"
        ),
        cta: t("Elite ??? ?????", "Open Elite step"),
        run: () => switchStep("elite"),
      };
    }
    if (!eliteCertificateId) {
      return {
        title: t("Elite ??????????? ??? ????", "Load your Elite certificate"),
        sub: t("????????? ??????? � ????? ??????? ????? ????????", "Commitment confirmed � one refresh and it's ready"),
        cta: t("?? ??????????? ??????? ????", "?? Refresh certificate"),
        run: () => switchStep("elite"),
      };
    }
    return {
      title: t("????? Elite ??????????? ???????? ??", "Your Elite certificate is ready ??"),
      sub: t("??????? ????, ????? ???? ?? ???????? ??? ?????? ????", "Download it, verify it, or order an original copy"),
      cta: t("?? Elite ??????????? ?????", "?? View Elite Certificate"),
      run: () => router.push(`/certificate?id=${eliteCertificateId}`),
    };
  })();

  // The contact-picker + send list is shared by BOTH the Foundation card and
  // the Referral Ambassador card (its WhatsApp option opens on click). Rendered
  // from a single JSX fragment so the two stay identical.
  const contactSendSection = (
    <>
      {(selectedContacts.length > 0 || sentContacts.length > 0) && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
            {t(`?????? (????? ${selectedContacts.length} � ?????? ${sentContacts.length})`, `List (added ${selectedContacts.length} � sent ${sentContacts.length})`)}
          </p>
          <AddPeopleBlock
            t={t}
            busy={busy}
            contactsSupported={contactsSupported}
            onGoogle={() => setMsg({ kind: "warn", text: t("?? ?? ?????? ??????????? ???? ??? � ????? ???? ???? ??? ?????", "?? This option is temporarily closed � check the option below.") })}
            onNativePick={pickContacts}
            onManualAdd={addManualPhone}
          />
          <input
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            placeholder={t("?? ??? ?? ????? ????? ??????�", "?? Search by name or number�")}
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none focus:border-[#2563EB]"
          />
          {shownSelected.length === 0 && shownSent.length === 0 && (
            <p className="text-[11px] text-slate-600 py-1">{t("???? ?????? ???????", "Nothing found.")}</p>
          )}
          {shownSelected.map((c, i) => (
            <div
              key={`${c.phone}-${i}`}
              className={`bg-slate-50 border rounded-xl px-3 py-2 ${failedPhones.has(c.phone) ? "border-red/40 bg-red/[0.07]" : "border-slate-200"}`}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{c.name || t("??? ???", "No name")}</p>
                  <p className="text-[10px] text-slate-600 font-mono">{`+${c.phone}`}</p>
                  {pendingList.includes(c.phone) && (
                    <p className="text-[10px] font-bold text-gold mt-0.5">
                      ?? {t("????? ??? ?????", "Verifying")}
                      <span className="verify-dots"><span /><span /><span /></span>
                    </p>
                  )}
                  {failedPhones.has(c.phone) && (
                    <p className="text-[10px] font-bold text-red mt-0.5">{t("? ????? ?????? � ???? ?????", "? Cancelled � send again")}</p>
                  )}
                </div>
                {c.waExists === false ? (
                  <span className="flex-shrink-0 px-3 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black">
                    {t("WhatsApp ???", "No WhatsApp")}
                  </span>
                ) : pendingList.includes(c.phone) ? (
                  <button
                    onClick={() => sendTo(c.phone, c.shareText)}
                    className="flex-shrink-0 px-3 py-2 rounded-xl bg-gold/15 border border-gold/30 text-gold text-[10px] font-black active:scale-95 transition-all"
                  >
                    ?? {t("??????? ?????", "Send again")}
                  </button>
                ) : failedPhones.has(c.phone) ? (
                  <button
                    onClick={() => sendTo(c.phone, c.shareText)}
                    className="flex-shrink-0 px-3 py-2 rounded-xl bg-red/15 border border-red/40 text-red text-[10px] font-black active:scale-95 transition-all"
                  >
                    ?? {t("??????? ?????", "Send again")}
                  </button>
                ) : (
                  <button
                    onClick={() => sendTo(c.phone, c.shareText)}
                    className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-[#25D366] to-teal text-white text-xs font-black active:scale-95 transition-all"
                  >
                    ?? {t("WhatsApp-? ?????", "Send")}
                  </button>
                )}
              </div>
              {pendingList.includes(c.phone) && (
                <div className="mt-2 px-3 py-2 rounded-xl bg-gold/10 border border-gold/30 text-[10px] font-bold text-gold leading-relaxed">
                  ?? {t(
                    "????? ??? ????? � ??????? ???? ???? ?????? WhatsApp-? ??????????? ???????? ?? ?????? ??? ???? ??? ??; ????? ???? ?????? ??????",
                    "Verifying � making sure you really sent it on WhatsApp. If not sent properly, it won't count; you can always send again."
                  )}
                </div>
              )}
            </div>
          ))}
          {shownSent.map((c, i) => (
            <div key={`sent-${c.phone}-${i}`} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 opacity-75">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{c.name || t("??? ???", "No name")}</p>
                <p className="text-[10px] text-slate-600 font-mono">{`+${c.phone}`}</p>
                <p className="text-[10px] font-bold text-teal mt-0.5">
                  {c.sentAt
                    ? t(`? ????? ?????? ?????? (${new Date(c.sentAt.replace(" ", "T")).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}) � ???? ?????? ?????`, `? Sent once (${new Date(c.sentAt.replace(" ", "T")).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}) � you can send again`)
                    : t("? ????? ?????? ?????? � ???? ?????? ?????", "? Already sent � you can send again")}
                </p>
              </div>
              {c.waExists === false ? (
                <span className="flex-shrink-0 px-3 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black">
                  {t("WhatsApp ???", "No WhatsApp")}
                </span>
              ) : (
                <button
                  onClick={() => sendTo(c.phone, c.shareText)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-black active:scale-95 transition-all"
                >
                  ?? {t("???? ?????", "Send again")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!expanded && hiddenCount > 0 && (
        <button
          onClick={() => setExpandedList(true)}
          className="mt-3 w-full py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-teal active:scale-[0.99] transition-all"
        >
          {t(`??? ????? (${hiddenCount})`, `Show more (${hiddenCount})`)}
        </button>
      )}

      <div className="mt-4 space-y-2">
        <AddPeopleBlock
          t={t}
          busy={busy}
          contactsSupported={contactsSupported}
          onGoogle={() => setMsg({ kind: "warn", text: t("?? ?? ?????? ??????????? ???? ??? � ????? ???? ???? ??? ?????", "?? This option is temporarily closed � check the option below.") })}
          onNativePick={pickContacts}
          onManualAdd={addManualPhone}
        />
      </div>
    </>
  );

  return (
    <main className="min-h-screen overflow-x-hidden relative page-under-header bg-[#F8FAFC]">
      {completed && confetti.map((c, i) => (
        <span key={i} className="confetti-piece" style={c} />
      ))}

      <div className="max-w-lg mx-auto px-4 pt-10 pb-32 md:pb-16 text-center">
        <div className="mx-auto w-24 h-24 rounded-[2rem] bg-[#0B1D3A] border-2 border-teal/20 flex items-center justify-center text-5xl shadow-lg animate-pulse-glow">
          ??
        </div>
        <h1 className="mt-5 text-[clamp(28px,5vw,36px)] font-black leading-tight">
          <span className="text-[#0B1D3A] drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)]">{t("????????!", "Congratulations!")}</span>
        </h1>
        <p className="mt-2 text-base text-ink-soft">
          {t("????? ???????? ??????? ??????", "Your profile is complete")} ??
        </p>
        {me?.name && <p className="mt-1 font-black text-brand">{me.name}</p>}
        {me?.workerId && <p className="text-xs font-bold text-ink-soft mt-0.5">{me.workerId}</p>}

        {/* Value ladder � swipeable chips so nothing is cramped at 320px */}
        <div className="mt-6 flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4 text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="snap-start shrink-0 w-36 rounded-xl bg-white border border-slate-200 shadow-sm p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-teal">Foundation</p>
            <p className="text-sm font-black text-slate-900">???�??k</p>
            <p className="text-[10px] font-bold text-slate-600">Entry</p>
          </div>
          <div className="snap-start shrink-0 w-36 rounded-xl bg-white border border-slate-200 shadow-sm p-3 opacity-90">
            <p className="text-[10px] font-black uppercase tracking-wide text-warning">Ambassador</p>
            <p className="text-sm font-black text-slate-900">???�??k</p>
            <p className="text-[10px] font-bold text-slate-600">Professional ??</p>
          </div>
          <div className="snap-start shrink-0 w-36 rounded-xl bg-white border border-slate-200 shadow-sm p-3 opacity-90">
            <p className="text-[10px] font-black uppercase tracking-wide text-violet">Elite</p>
            <p className="text-sm font-black text-slate-900">???�???k+</p>
            <p className="text-[10px] font-bold text-slate-600">Highest Honor ??</p>
          </div>
        </div>
        <p className="mt-1.5 text-center text-[10px] font-bold text-slate-600">{t("? ??? � ??????? ???? ???? ??????", "1 < 2 < 3 � higher level, higher benefit")}</p>

        {/* Next Best Action � the ONE thing to do now */}
        {nba && (
          <div className="mt-6 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 via-transparent to-transparent p-4 text-left shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gold">{t("??? ?? ?????", "What to do now")}</p>
            <p className="mt-1 text-base font-black leading-snug text-brand">{nba.title}</p>
            <p className="mt-0.5 text-xs font-bold text-slate-600">{nba.sub}</p>
            <button onClick={nba.run} className="mt-3 w-full btn-excite text-sm !py-3.5">{nba.cta}</button>
          </div>
        )}

        {/* Hub tabs � one focused step at a time */}
        <div role="tablist" aria-label={t("??????????? ???", "Certificate steps")} className="mt-6 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 border border-line p-1">
          {HUB_TABS.map((tb) => {
            const active = activeStep === tb.key;
            return (
              <button
                key={tb.key}
                id={`hub-tab-${tb.key}`}
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onKeyDown={(e) => {
                  const idx = HUB_TABS.findIndex((x) => x.key === tb.key);
                  let next = -1;
                  if (e.key === "ArrowRight") next = (idx + 1) % HUB_TABS.length;
                  else if (e.key === "ArrowLeft") next = (idx - 1 + HUB_TABS.length) % HUB_TABS.length;
                  else if (e.key === "Home") next = 0;
                  else if (e.key === "End") next = HUB_TABS.length - 1;
                  if (next >= 0) {
                    e.preventDefault();
                    switchStep(HUB_TABS[next].key);
                    document.getElementById(`hub-tab-${HUB_TABS[next].key}`)?.focus();
                  }
                }}
                onClick={() => switchStep(tb.key)}
                className={`min-h-[48px] rounded-xl px-2 py-1.5 flex flex-col items-center justify-center gap-0.5 text-[11px] font-black transition-all ${active ? "bg-white shadow-sm text-brand" : "text-slate-600 active:bg-slate-200/60"}`}
              >
                <span className="text-base leading-none">{tb.icon}</span>
                <span className="leading-tight">{t(tb.bn, tb.en)}</span>
              </button>
            );
          })}
        </div>

        {/* Certificate 1 � Foundation (share task) */}
        {activeStep === "foundation" && (
        <div className="mt-6 bg-white border border-slate-200 shadow-sm !rounded-[1.25rem] p-4 md:p-5 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">
              <span className="w-9 h-9 shrink-0 rounded-xl bg-teal/20 border border-teal/40 flex items-center justify-center text-base">??</span>
              <span>
                {t("????????? ???????????", "Foundation Certificate")}
                <span className="block text-[10px] font-bold text-slate-600">{t("Foundation � ????? ???", "Foundation � First step")}</span>
              </span>
            </h2>
            <span className={`badge-glow ${completed ? "bg-teal/20 text-teal border border-teal/40" : "bg-gold/20 text-gold border border-gold/40"}`}>
              {completed ? t("? ???????", "Done") : t("?? ????", "In progress")}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {t("?? ?? ???????????? ?????? ?????? ???????? ????", "Invite 30 learners to reach 100%")}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-600">
            <span>??</span> {t("???,???�???,??? � Foundation � ??????? ????????", "?15,000�?30,000 � Foundation � Entry reward")}
          </div>

          {/* Preview � hidden behind a button so the card stays calm */}
          <button
            onClick={() => setShowCertPreview((v) => !v)}
            className="mt-3 w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 active:scale-[0.99] transition-all"
          >
            <span className="text-xs font-black text-teal">?? {t("??????????? ???? ??????", "Preview the certificate")}</span>
            <span className={`text-slate-600 text-sm transition-transform ${showCertPreview ? "rotate-180" : ""}`}>?</span>
          </button>

          {showCertPreview && <CertificateSample variant="foundation" />}

          {/* Single progress � one bar, one encouraging line */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal to-success transition-all duration-700"
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
              {contactSendSection}
            </>
          ) : (
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-gold/20 via-pink/20 to-violet/20 border border-gold/30 p-5 text-center">
              <div className="text-5xl animate-pulse-glow">??</div>
              <h3 className="mt-2 text-xl font-black gradient-text">{t("??????????? ????? ??????!", "Certificate Earned!")}</h3>
              <p className="mt-1 text-xs text-slate-600">
                {t("??????? ????????-??????? ? ??????? ????????? ?????? ?????? ??? ??? ????? ?????? � ??? ??????? ???? ?? ??????? ????? ?????", "Earned by proving outstanding community-building and digital marketing skills � download it or verify it online.")}
              </p>

              {/* Name on the certificate � shown in hold state; Edit reveals the
                  save form so a mis-tap can never save anything by accident. */}
              <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-left">
                {!editNameMode ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 text-left">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                        {t("????????????? ???", "Name on certificate")}
                      </p>
                      <p className="mt-0.5 text-sm font-black text-slate-900 truncate">
                        {certName || me?.name || t("??? ???", "No name")}
                      </p>
                      {certLocked && certLockedUntil && (
                        <p className="mt-1 text-[10px] font-bold text-amber">
                          ?? {t(`?? ??? ?? � ${new Date(certLockedUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} ???????`, `Locked 30 days � until ${new Date(certLockedUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => { setNameInput(certName || ""); setNameMsg(null); setEditNameMode(true); }}
                      disabled={certLocked}
                      className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-black active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
                    >
                      ?? {t("????", "Edit")}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      {t("??? ???????? ????", "Change name")}
                    </p>
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      maxLength={60}
                      autoFocus
                      className="mt-2 w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:border-[#2563EB]"
                      placeholder={t("????? ??? ?????", "Type your name")}
                    />
                    <p className="mt-2 rounded-lg bg-amber/10 border border-amber/30 px-2.5 py-1.5 text-[10px] font-bold text-amber leading-relaxed">
                      ?? {t("????? ??????? ???? ????? ?? ????? ???? ?? ???? ???? � ?? ??? ????? ?? ??? ?? ???????? ??? ???? ???", "Once saved, the name locks for 30 days and cannot be changed until then.")}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={saveName}
                        disabled={savingName}
                        className="flex-1 px-3 py-2.5 rounded-xl btn-excite text-xs font-black disabled:opacity-40"
                      >
                        {savingName ? "�" : `?? ${t("??????? ????", "Save")}`}
                      </button>
                      <button
                        onClick={() => { setEditNameMode(false); setNameMsg(null); }}
                        className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-black active:scale-95 transition-all"
                      >
                        {t("?????", "Cancel")}
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
                  ?? {t("??????????? ?????", "View Certificate")}
                </button>
              )}
            </div>
          )}
        </div>
        )}

        {/* Certificate 2 � Referral Ambassador */}
        {activeStep === "ambassador" && (
        <div className="mt-6 bg-white border border-slate-200 shadow-sm !rounded-[1.25rem] p-4 md:p-5 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">
              <span className="w-9 h-9 shrink-0 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-base">??</span>
              <span>
                {t("??????? ???????????? ???????????", "Referral Ambassador Certificate")}
                <span className="block text-[10px] font-bold text-slate-600">{t("Ambassador � ???????? ???", "Ambassador � Second step")}</span>
              </span>
            </h2>
            <span className={`badge-glow ${!completed ? "bg-white text-slate-600 border border-slate-200" : "bg-gold/20 text-gold border border-gold/40"}`}>
              {!completed ? t("?? ??", "Locked") : t("?? ????", "In progress")}
            </span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-600">
            <span>??</span> {t("???,???�???,??? � Ambassador � ????????? ????????", "?30,000�?60,000 � Ambassador � Professional reward")}
          </div>

          {!completed ? (
            <p className="mt-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              ?? {t("?????? ????????? ??????????? ???% ??????? ???? � ???? ?? ??????????? ? ?????? ??????????? ?????? ???? ????", "Finish the Foundation Certificate to 100% first � then this certificate and the Final one unlock together.")}
            </p>
          ) : (
            <>
              <p className="mt-2 text-xs text-slate-600">
                {t("??? ??? ??????? ????? ??????????? ?????", "Complete these 3 steps to earn it")}
              </p>

              <div className="mt-3 space-y-2">
                {/* Step 1 � 11 joins */}
                <div className="flex gap-3 items-start px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-teal/20 text-teal text-xs font-black flex items-center justify-center mt-0.5">?</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900">{t("?? ?? ?????????? ????? ????", "Get 11 learners to join")}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-teal transition-all duration-700" style={{ width: `${Math.min((referralJoins / 11) * 100, 100)}%` }} />
                      </div>
                      <span className="text-[11px] font-black text-teal">{referralJoins}/11</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-600">{t("????? ????? ???? ???? ????? ?????", "People who actually joined through your link")}</p>
                  </div>
                </div>

                {/* Step 2 � share written message */}
                <div className="flex gap-3 items-start px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-gold/20 text-gold text-xs font-black flex items-center justify-center mt-0.5">?</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900">{t("????? ????? ?????? ????", "Share the written message")}</p>
                    <p className="mt-0.5 text-[10px] text-slate-600 leading-relaxed">
                      {t("????? ???? ????? ??? ??? ??? ?????? ????? + ??? WhatsApp ????? + ????? ????????? ????? ????", "Copy the message from the app and post it in 3 Facebook groups + 1 WhatsApp group + your own profile")}
                    </p>
                  </div>
                </div>

                {/* Step 3 � screenshots */}
                <div className="flex gap-3 items-start px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-pink/20 text-pink text-xs font-black flex items-center justify-center mt-0.5">?</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900">{t("??? ????????? ??? ???", "Submit 4 screenshots")}</p>
                    <p className="mt-0.5 text-[10px] text-slate-600 leading-relaxed">
                      {t("???????? ????????? ?????? ????? � ?? ?????? ????? ??????? ??? ??????????? ???", "Send us the screenshots � we verify within 24 hours and issue the certificate")}
                    </p>
                    <button onClick={() => setShowShotHelp((v) => !v)} className="mt-1.5 text-[10px] font-black text-pink underline">
                      ?? {t("?????? ??? ?????", "How to submit")} <span className={`inline-block transition-transform ${showShotHelp ? "rotate-180" : ""}`}>?</span>
                    </button>
                    {showShotHelp && (
                      <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[10px] text-slate-600 leading-relaxed">
                        <p>?. ????? "?? ????? ??? ????" ????? ??? ????? ?????? ??? ????</p>
                        <p className="mt-1">?. ??? ?????? ?????? + ??? WhatsApp ?????? + ????? ????????? ????? ????</p>
                        <p className="mt-1">?. ??????? ??????? ????????? ??? (??? ???)</p>
                        <p className="mt-1">?. ????? ????????? ????? ??? ??? ????? ??? "????????? ??? ???" ????? ??? ??? � ?????????? ?? ????? ???? ????</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Screenshot submission (step 3) */}
              <div className="mt-3 rounded-xl bg-white border border-[#E2E8F0] p-3 shadow-sm">
                {shotStatus === "verified" ? (
                  <div className="rounded-xl bg-teal/15 border border-teal/30 px-3 py-2 text-[11px] font-black text-teal leading-relaxed">
                    ? {t("??????? ?????? � ????? ????????????? ????? ??????", "Verified � your screenshots were accepted")}
                  </div>
                ) : shotStatus === "pending" ? (
                  <div className="rounded-xl bg-gold/15 border border-gold/30 px-3 py-2 text-[11px] font-black text-gold leading-relaxed">
                    ?? {t("??????????? ????????? � ?? ?????? ????? ??????? ???", "Waiting for verification � done within 24 hours")}
                  </div>
                ) : shotStatus === "rejected" ? (
                  <div className="rounded-xl bg-red/15 border border-red/30 px-3 py-2 text-[11px] font-black text-red leading-relaxed">
                    ? {t("????? ?????? � ???? ??? ??? ???", "Rejected � please resubmit")}
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] font-black text-slate-600">{t("????? ??? ????????? ????? ????? ????", "Add your 4 screenshots here")}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {shotThumbs.map((src, i) => (
                        <div key={i} className="relative">
                          <img src={src} className="w-16 h-16 object-cover rounded-lg border border-slate-200" alt="" />
                          <button
                            type="button"
                            onClick={() => {
                              const f = shotFiles.filter((_, j) => j !== i);
                              setShotFiles(f);
                              setShotThumbs(f.map((x) => URL.createObjectURL(x)));
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red text-white text-[10px] font-black leading-none"
                          >�</button>
                        </div>
                      ))}
                      {shotThumbs.length < 4 && (
                        <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-2xl text-slate-600 cursor-pointer">
                          +
                          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onShotPick} />
                        </label>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={submitScreenshots}
                      disabled={shotUploading || shotFiles.length === 0}
                      className="mt-2 w-full py-2.5 rounded-xl btn-excite text-xs font-black disabled:opacity-50"
                    >
                      {shotUploading ? t("??? ?????�", "Uploading�") : t("?? ????????? ??? ???", "Submit screenshots")}
                    </button>
                    {shotMsg && (
                      <p className={`mt-1 text-[10px] font-bold ${shotMsg.kind === "ok" ? "text-teal" : "text-red"}`}>{shotMsg.text}</p>
                    )}
                  </>
                )}
              </div>

              {/* Sharing tools */}
              <div className="mt-4">
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">{t("????? ?????? ???????", "Your sharing tools")}</p>
                <input
                  readOnly
                  value={link}
                  onFocus={(e) => e.target.select()}
                  className="mt-2 w-full px-3 py-3 rounded-2xl bg-white backdrop-blur border border-slate-200 text-slate-900 text-sm font-bold truncate focus:outline-none"
                />

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button onClick={refreshReferral} className="py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-teal active:scale-[0.99] transition-all">
                    ?? {t("???? ????", "New link")}
                  </button>
                  <button onClick={copyMessage} className={`py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black active:scale-[0.99] transition-all ${msgCopied ? "text-teal" : "text-gold"}`}>
                    {msgCopied ? t("? ??? ??????!", "Copied!") : `?? ${t("????? ??? ????", "Copy message")}`}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-600 text-center">
                  {t("???????? ??????? ???? ????? ???? ???? ??? � ???? ??? ???? ???? ??", "Every share creates a fresh unique link � no one gets the same link twice")}
                </p>

                <div className="mt-3 flex justify-center">
                  <div className="bg-white rounded-3xl p-4 shadow-xl">
                    {link ? <QRCode value={link} size={150} /> : null}
                  </div>
                </div>

                <button
                  onClick={() => setShowWaPicker((v) => !v)}
                  className="mt-3 w-full btn-excite text-sm !py-3.5"
                >
                  ?? {showWaPicker ? t("WhatsApp-? ?????? ???? ????", "Close WhatsApp sending") : t("WhatsApp-? ?????", "Send on WhatsApp")} <span className={`inline-block transition-transform ${showWaPicker ? "rotate-180" : ""}`}>?</span>
                </button>

                {showWaPicker && contactSendSection}
              </div>

              <button
                onClick={() => setShowCert2Preview((v) => !v)}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-gold active:scale-[0.99] transition-all"
              >
                ?? {showCert2Preview ? t("????? ??????? ???? ????", "Close sample preview") : t("?????? ?????? ????? ???????????", "See how your certificate will look")} <span className={`inline-block transition-transform ${showCert2Preview ? "rotate-180" : ""}`}>?</span>
              </button>
              {showCert2Preview && <CertificateSample variant="ambassador" />}
            </>
          )}
        </div>
        )}

        {/* Certificate 3 � Elite Final */}
        {activeStep === "elite" && (
        <div className="mt-6 bg-white border border-slate-200 shadow-sm !rounded-[1.25rem] p-4 md:p-5 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">
              <span className="w-9 h-9 shrink-0 rounded-xl bg-violet/20 border border-violet/40 flex items-center justify-center text-base">??</span>
              <span>
                {t("???? ?????? ???????????", "Elite Final Certificate")}
                <span className="block text-[10px] font-bold text-slate-600">{t("Elite � ??? ???", "Elite � Final step")}</span>
              </span>
            </h2>
            <span className={`badge-glow ${isPremium ? "bg-teal/20 text-teal border border-teal/40" : !completed ? "bg-white text-slate-600 border border-slate-200" : "bg-gold/20 text-gold border border-gold/40"}`}>
              {isPremium ? t("? ?????? (?�? ???)", "Committed (2�3 years)") : !completed ? t("?? ??", "Locked") : t("?? ????????? ??", "Commitment Locked")}
            </span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet/10 border border-violet/30 text-[10px] font-black text-violet/80">
            <span>??</span> {t("???,???�??,??,???+ � Elite � ???????? ????????", "?60,000�?120,000+ � Elite � Highest reward")}
          </div>
          {isPremium ? (
            <>
              <p className="mt-3 px-3 py-2.5 rounded-xl bg-violet/10 border border-violet/30 text-xs text-violet leading-relaxed">
                ? {t("???????? � ???? ???% ??????! Elite ??????????? ???? ???? ??????? � ???? ??????", "Congratulations � you are 100% committed! Elite certificate is immediately yours � view now.")}
              </p>
              {eliteCertificateId ? (
                <a href={`/certificate?id=${eliteCertificateId}`} className="mt-3 btn-gold w-full text-sm !py-3.5 block text-center">
                  ?? {t("Elite ??????????? ?????", "View Elite Certificate")}
                </a>
              ) : (
                <button onClick={() => fetch("/api/membership/status").then(r=>r.ok?r.json():null).then(dd=>{ const d=dd as { eliteCertificateId?: string | null } | null; if(d?.eliteCertificateId) setEliteCertificateId(d.eliteCertificateId); }).catch(()=>{})} className="mt-3 w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-black">
                  {t("?? ??????????? ??????? ????", "Refresh certificate")}
                </button>
              )}
            </>
          ) : (
            <>
              {!completed && (
                <p className="mt-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  ?? {t("????? ??????????? ???% ???? Elite ??? ????? ???? ??? � ??? ???? ????????? ?? ????? ?????? ??? ??????", "Finish the first certificate to 100% for fastest Elite unlock � but you can also become committed now with commitment fee.")}
                </p>
              )}
              {/* 9 Premium Facilities � 100% positive, MLM-free */}
              <div className="mt-3 rounded-xl bg-white border border-[#E2E8F0] p-3 shadow-sm">
                <p className="text-[11px] font-black text-slate-900 text-center">?? {t("?????????? ????? ??????", "Nine Benefits with Commitment")}</p>
                <p className="mt-1 text-[10px] text-slate-600 text-center leading-relaxed">{t("????????? ?? � ????? ?�? ??? ?????? ???? ????? ????? ??????? ???? ????? ??????? ????? ???", "Commitment fee � to confirm your interest to stay 2�3 years, give your preferred budget")}</p>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2 items-start">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-teal/15 border border-teal/30 flex items-center justify-center text-[11px]">??</span>
                    <div><p className="text-[11px] font-black text-slate-900">{t("?. ?????? ???????", "1. Committed Learner")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("?????? ???% ??????? ????????????? ???? � ????? ?????? ??????? ?????", "For learners 100% focused on learning � you become a committed learner.")}</p></div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-[11px]">?</span>
                    <div><p className="text-[11px] font-black text-slate-900">{t("?. ?????? ??????? ??????????", "2. Priority in Any Job")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("????????? ?????? ??? ?????? ??? ??????? ??? ????", "You will be considered first for any position in the company.")}</p></div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-violet/15 border border-violet/30 flex items-center justify-center text-[11px]">??</span>
                    <div><p className="text-[11px] font-black text-slate-900">{t("?. ?????? + ??????????? ?????", "3. National + International Opportunities")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("??? ? ?????? ????????? ??? ??????????? ??????? ??????", "Opportunities in all company institutions, nationally and internationally.")}</p></div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-pink/15 border border-pink/30 flex items-center justify-center text-[11px]">??</span>
                    <div><p className="text-[11px] font-black text-slate-900">{t("?. ???????? + ?????????", "4. Guideline + Training")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("???????? ?? ????? ?????? ???????? ????? ???? � ???????? ????? ?? ????? ??????? ?????? ??? ??????? ???? ????", "No experience? Our trainers will build you. Experienced? We sharpen it as a plus point.")}</p></div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-teal/15 border border-teal/30 flex items-center justify-center text-[11px]">??</span>
                    <div><p className="text-[11px] font-black text-slate-900">{t("?. ????? ??????", "5. Course Benefit")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("???????? ???????? ???????? ?? ????? ????? ???? ????? ??????/??????????? ????? � ?????/??????, ??????? ??????; ????? ???? ?????? ??????", "If no experience, courses worth several lakhs � national/international, Bangla/English in your preferred language; after completion, eligible for jobs.")}</p></div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-[11px]">??</span>
                    <div><p className="text-[11px] font-black text-slate-900">{t("?. ???? ?????? + ?????????? ???????", "6. 1000 Hires + Monetization Channel")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("???? ???????�???? ??????????? ????????? ???? ??????? ??????????? ????????? ?????????? ??????? � ???? ???? ??? ?????? ??????? ??????/??????; ?? ??? ????? ????? ????? ????? � ??????? ???? ???? ?????? ????????", "1000 hires in Bangladesh Nov 2026�Feb 2027 with priority. Full monetization channel with guidance � anyone can learn at their own pace � each step ensures new skills.")}</p></div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-violet/15 border border-violet/30 flex items-center justify-center text-[11px]">??</span>
                    <div><p className="text-[11px] font-black text-slate-900">{t("?. ???????? Elite ???????????", "7. Highest Elite Certificate")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("???/????? ?????? ??????????? ???? ?????? ??????? ?????? � ?????????? ???????? ???????????", "Helps secure high-salary jobs anywhere � maximum facilities in our company.")}</p></div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-teal/15 border border-teal/30 flex items-center justify-center text-[11px]">??</span>
                    <div><p className="text-[11px] font-black text-slate-900">{t("?. ???????? ????? � ????????? ????", "8. India Tour � Company Expense")}</p><p className="text-[10px] text-slate-600 leading-relaxed">{t("?????? ???? ???????? ????? + YouTube ???? ???????? � ??????? ???? ?? ??? ??? ???????? ??? ????, ?????? ???? ??? ???? ??? ???", "Anytime India tour + YouTube office visit � company bears all costs including tourist visa, you bear nothing.")}</p></div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-[11px]">??</span>
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-slate-900">{t("?. ??????? ???????? � ??% ?????? ??????? ????", "9. Annual Prize � 70% of Committed Members Win")}</p>
                      <p className="text-[10px] text-slate-600 leading-relaxed">{t("????? ??? ? ???, ??? ?????????? ????????? ??? ??? ????? � ?? ? ??? ???? ?? ???????? ?? ???? � ? ???? ?????? ????", "Once a year, all premium members auto-entered � for 7 years. 1st prize 10 crore � will be given to 1 person.")}</p>
                      <details className="mt-1.5">
                        <summary className="text-[10px] font-black text-gold cursor-pointer">{t("???????? ?????", "See the rest")}</summary>
                        <div className="mt-1.5 rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-[10px] leading-relaxed">
                          <p className="font-black text-slate-700">{t("???? ???? ???????? ??????", "Step-by-step prize ladder")}</p>
                          <div className="mt-1 grid grid-cols-2 gap-1 text-[10px]">
                            <span className="text-slate-600">? ???? � ? ???? ?????? ???</span>
                            <span className="text-slate-600">? ???? � ? ???? ?????? ???</span>
                            <span className="text-slate-600">?? ??? � ? ???? ?????? ???</span>
                            <span className="text-slate-600">?? ??? � ? ???? ?????? ???</span>
                            <span className="text-slate-600">?? ??? � ? ???? ?????? ???</span>
                            <span className="text-slate-600">?? ??? � ? ???? ?????? ???</span>
                            <span className="text-slate-600">?? ??? � ? ???? ?????? ???</span>
                            <span className="text-slate-600">? ??? � ? ???? ?????? ???</span>
                            <span className="text-slate-600">? ??? � ? ???? ?????? ???</span>
                            <span className="text-slate-600">? ??? � ?? ???? ?????? ???</span>
                            <span className="text-slate-600">? ??? � ?? ???? ?????? ???</span>
                            <span className="text-slate-600">? ??? � ?? ???? ?????? ???</span>
                            <span className="text-slate-600">?? ????? � ?? ???? ?????? ???</span>
                            <span className="text-slate-600">?? ????? � ?? ???? ?????? ???</span>
                            <span className="text-slate-600">?? ????? � ?? ???? ?????? ???</span>
                            <span className="text-slate-600">?? ????? � ?? ???? ?????? ???</span>
                            <span className="text-slate-600">?? ????? � ?? ???? ?????? ???</span>
                            <span className="text-slate-600">? ????? � ??? ???? ?????? ???</span>
                            <span className="text-slate-600">? ????? � ??? ???? ?????? ???</span>
                            <span className="text-slate-600">? ????? � ??? ???? ?????? ???</span>
                            <span className="text-slate-600">? ????? � ??? ???? ?????? ???</span>
                            <span className="text-slate-600">? ????? � ???? ???? ?????? ???</span>
                          </div>
                          <p className="mt-1.5 text-[9px] text-slate-600 leading-relaxed">{t("??? ~?,??? ?? ?????? � ?????? ??% ?????? ??????? ????? ??? ???? ?? ???? ???? � ???? ????????? ?????", "Total ~2,204 winners � about 70% of committed members get something each year � committed only.")}</p>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
              {/* Interest + Budget � 100% flexible, psychological */}
              <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-[11px] font-black text-slate-900">{t("????? ????? ?????", "Tell us your interest")}</p>
                <p className="mt-1 text-[10px] text-slate-600 leading-relaxed">{t("?? ??? ?????? ??????? ???????? ????? ???? ?? ??? ??? � ????????? ????? ?????? ???? ?????? ???? ?? ???? ???? ?????", "For these 9 benefits � how much do you think others in Bangladesh who offer similar benefits would charge?")}</p>
                <p className="mt-2 text-[10px] text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">{t("????? ????? ???? � ?? ???????? ?? ??? ??????? ???? ???? ????? ?????? ???? ?? ???? ????? ?????? ?????? ??????? ??? ???? ??? ???????????? ???? ??????", "Just to know � how much do YOU want to pay from your side to become our interested member for these 9 benefits? Write that amount below.")}</p>
                <div className="mt-3 space-y-2">
                  <select value={interestFacility} onChange={(e) => setInterestFacility(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none">
                    <option value="" className="text-black">{t("???? ????? ??? ???????? ??????? ??????", "Which of the 9 benefits do you like most?")}</option>
                    <option value="earning" className="text-black">{t("?????? ???????", "Earning Member")}</option>
                    <option value="priority" className="text-black">{t("?????? ??????? ??????????", "Priority in Any Job")}</option>
                    <option value="national-international" className="text-black">{t("?????? + ??????????? ?????", "National + International")}</option>
                    <option value="training" className="text-black">{t("???????? + ?????????", "Guideline + Training")}</option>
                    <option value="courses" className="text-black">{t("????? ??????", "Course Benefit")}</option>
                    <option value="hiring-channel" className="text-black">{t("???? ?????? + ?????????? ???????", "1000 Hires + Channel")}</option>
                    <option value="certificate" className="text-black">{t("Elite ???????????", "Elite Certificate")}</option>
                    <option value="tour" className="text-black">{t("???????? ????? � ????????? ????", "India Tour � Company Expense")}</option>
                    <option value="lottery" className="text-black">{t("??????? ???????? ???", "Annual Prize Draw")}</option>
                  </select>
                  <input value={otherInterest} onChange={(e) => setOtherInterest(e.target.value)} placeholder={t("?? ????? ?? ??? ?????? ????? ???? (??????)", "Any other subject you are interested in? (optional)")} className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold placeholder-slate-400 focus:outline-none" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIs100Interested(true)} className={`flex-1 py-2.5 rounded-xl border text-xs font-black ${is100Interested === true ? "bg-teal/20 border-teal/40 text-teal" : "bg-slate-50 border-slate-200 text-slate-600"}`}>{t("? ?????, ?????? ???????", "Yes, focused on learning")}</button>
                    <button type="button" onClick={() => setIs100Interested(false)} className={`flex-1 py-2.5 rounded-xl border text-xs font-black ${is100Interested === false ? "bg-white border-slate-200 text-slate-900" : "bg-slate-50 border-slate-200 text-slate-600"}`}>{t("??? ????", "Maybe later")}</button>
                  </div>
                </div>
                {is100Interested === true && (
                  <div className="mt-3 rounded-xl bg-gold/10 border border-gold/30 p-3">
                    <p className="text-[11px] font-black text-gold text-center">{t("????? ??????? ????? ???", "Enter your preferred budget")}</p>
                    <p className="mt-1 text-[10px] text-slate-600 text-center leading-relaxed">{t("?? ??? ??????? ???? ???? ?? ???? ????? ?????? ??????? ??? ???? ??? ???????????? ????? � ?????? ?????? ???? ?????? ????", "How much do you want to pay to become an interested member for these 9 benefits? Write that amount � you need to send it now.")}</p>
                    {/* 30-minute countdown */}
                    {!expired && !verifying ? (
                      <div className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-black text-gold">? {timeLeft}</span>
                        <span className="text-[10px] font-bold text-slate-600">{t("????? ???? ?? ????? ???????? � ????, ????? ????? ????????? ???", "Reserved for you for 30 minutes � take your time, decide at your own pace")}</span>
                      </div>
                    ) : null}
                    {verifying ? (
                      <div className="mt-2 rounded-xl bg-white border border-[#E2E8F0] p-3 shadow-sm">
                        <p className="text-[10px] font-bold text-gold/80 text-center">? {t("????? ???? � ??????? ? ??????? ?????? ??????? ?????", "Verifying � you'll usually get the report within 1 minute")}</p>
                        <p className="mt-1 text-[11px] font-black text-slate-900 text-center">{t("???????????? ???? ?????? ?????�", "Sending to officers for verification�")}</p>
                        <div className="mt-2 space-y-1.5">
                          {officers.map((o) => (
                            <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="text-[11px] font-bold text-slate-700">{o.name}</span>
                              <span className={`text-[10px] font-black flex items-center gap-1 ${o.status === "accepted" ? "text-teal" : o.status === "rejected" ? "text-red" : o.status === "pending" ? "text-slate-600" : "text-gold"}`}>
                                {o.status === "viewing" ? (
                                  <span className="inline-flex items-center gap-0.5 animate-pulse">{t("????? ???? ?????????? ?????", "Reviewing your information")}<span className="verify-dots inline-flex"><span>.</span><span>.</span><span>.</span></span></span>
                                ) : o.status === "accepted" ? t("? ?????? ??????? ????????", "? Favorable report submitted") : o.status === "rejected" ? t("????? ??????", "Rejected") : t("??????? ???????? ?????", "Report being prepared")}
                              </span>
                            </div>
                          ))}
                        </div>
                        <style>{`.verify-dots span{animation:verifyDot 1s infinite;}.verify-dots span:nth-child(2){animation-delay:0.2s}.verify-dots span:nth-child(3){animation-delay:0.4s}@keyframes verifyDot{0%,80%,100%{opacity:0}40%{opacity:1}}`}</style>
                      </div>
                    ) : expired ? (
                      <div className="mt-2 rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                        <p className="text-[11px] font-black text-slate-900">{t("???? ??? � ???? ???? ???? ?????", "Time's up � you can start again")}</p>
                        <p className="mt-1 text-[10px] text-slate-600 leading-relaxed">{t("????? ???? ???? ??????? ??? ???? � ???? ??? ????", "We can reserve again for you � tap below.")}</p>
                        <button type="button" onClick={startOfficerVerification} disabled={verifying} className="mt-2 w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-black disabled:opacity-50">
                          {t("??? ?????? � ??????? ???? ??? ?????? ??? ???? ??????, ??????????? ?????? ???", "I am interested � couldn't take it before time ended, please allow me again")}
                        </button>
                      </div>
                    ) : (
                      <>
                        {payMsg && payMsg.text.includes("????????? ??") && !verifying && !expired && (
                          <p className="mb-1.5 text-[10px] font-bold text-center text-gold">{payMsg.text}</p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <input value={amountInput} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 5); setAmountInput(v); }} inputMode="numeric" placeholder={t("?????????? ?????", "Enter amount")} className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold placeholder-slate-400 focus:outline-none" />
                          <span className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-600">BDT</span>
                        </div>
                        {amountInput && Number(amountInput) >= 99 && !expired && (
                          <div className="mt-2 rounded-xl bg-white border border-line p-3 text-left text-[10px] leading-relaxed font-bold text-slate-700">
                            <p>?? {t("???? SSLCommerz ?????? ???? ????? � bKash / Nagad / Card", "You'll go to the secure SSLCommerz page now � bKash / Nagad / Card")}</p>
                            <p className="mt-1">?? {t("??????? ???? ?? ????? ???? ????? � Elite ??????????? ???? ???? ????", "After payment you return right here � Elite unlocks instantly")}</p>
                          </div>
                        )}
                        <button
                          onClick={handlePremiumPay}
                          disabled={paying || verifying || expired}
                          className="mt-2 w-full py-2.5 rounded-xl bg-excite text-white text-xs font-black active:bg-[#7C2D12] active:scale-[0.99] transition-all disabled:opacity-50"
                        >
                          {paying ? t("?????????????�", "Processing�") : amountInput ? t(`?? ${Number(amountInput).toLocaleString("en-US")} ???? ????? � ???? ?????? ???`, `?? Send ${Number(amountInput).toLocaleString("en-US")} Taka � Become Premium Now`) : t("?? ????? ??????? ????? ????? ?????? ??? � SSLCommerz", "?? Become Premium with your preferred budget � SSLCommerz")}
                        </button>
                        <p className="mt-1.5 text-[9px] text-slate-600 text-center">SSLCommerz � bKash / Nagad / Card � {t("???????? ??????? � ???? ?????? ???", "Secure payment � Must send now")}</p>
                      </>
                    )}
                    {payMsg && !payMsg.text.includes("????????? ??") && !verifying && !expired && (
                      <p className={`mt-2 text-[11px] font-bold text-center ${payMsg.kind === "ok" ? "text-teal" : payMsg.kind === "warn" ? "text-gold" : "text-red"}`}>{payMsg.text}</p>
                    )}
                  </div>
                )}
                {is100Interested === false && (
                  <p className="mt-2 text-[11px] font-bold text-center text-slate-600">{t("???% ????? ?? ????? ??? ??????? ???????? ??? � ????? ??? ???? ?????", "If not 100% interested, no need to pay now � come back when interested.")}</p>
                )}
                {is100Interested === null && payMsg && (
                  <p className={`mt-2 text-[11px] font-bold text-center ${payMsg.kind === "ok" ? "text-teal" : payMsg.kind === "warn" ? "text-gold" : "text-red"}`}>{payMsg.text}</p>
                )}
              </div>
            </>
          )}

          <button
            onClick={() => setShowCert3Preview((v) => !v)}
            className="mt-3 w-full py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-violet active:scale-[0.99] transition-all"
          >
            ?? {showCert3Preview ? t("????? ??????? ???? ????", "Close sample preview") : t("?????? ?????? ????? ?????? ???????????", "See how your Final certificate will look")} <span className={`inline-block transition-transform ${showCert3Preview ? "rotate-180" : ""}`}>?</span>
          </button>
          {showCert3Preview && <CertificateSample variant="elite" />}
        </div>
        )}

        <button onClick={() => router.push("/")} className="mt-6 btn-outline w-full">
          {t("???? ???? ???", "Back to Home")}
        </button>
      </div>

      {/* Mobile sticky next-step � always one thumb-reachable primary action */}
      {nba && (
        <div className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-line bg-white/95 backdrop-blur px-4 pt-3 safe-bottom">
          <button onClick={nba.run} className="w-full btn-excite text-sm !py-3">{nba.cta}</button>
        </div>
      )}
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
      {SHOW_GOOGLE_CONTACTS && (
        <>
          <button onClick={onGoogle} className="btn-white w-full text-sm !py-3.5 opacity-70">
            ?? {t("????? ??????? ???????? ???? ???", "?? Choose your favorite people")}
          </button>
          <p className="text-center text-[11px] font-black text-gold -mt-1">
            ? {t("??????????? ???? ??? � ????? ???? ???? ??? ????", "Temporarily closed � check the option below")}
          </p>
        </>
      )}
      <p className="text-center text-[11px] text-slate-600 -mt-1">
        {t("????? ???? ?????? ?????? ?????? ???? ???", "The ones you want to share our info with")}
      </p>

      {contactsSupported ? (
        <button onClick={onNativePick} disabled={busy} className="btn-white w-full text-sm !py-3.5 disabled:opacity-60">
          {busy ? t("?????????????�", "Working�") : t("?? ??????? ????? ?? ???? ???? ???? ????? ???", "?? Didn't find them? Search here")}
        </button>
      ) : (
        <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200 p-3">
          <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
            {t("?? ??????? ?????? ????? ??? � ????? ????? ??? ????? ????? ??? ?????", "No phonebook picker on this device � add numbers with the button below.")}
          </p>
          <button onClick={() => setShowManual((v) => !v)} disabled={busy} className="mt-2 btn-white w-full text-sm !py-3 disabled:opacity-60">
            {t("?? ??????? ???????? ??????? ???? ??? ????", "?? Add your people's numbers")}
          </button>
          {showManual && (
            <div className="mt-2 flex gap-2">
              <input
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                inputMode="tel"
                placeholder={t("?????? ????? (01XXXXXXXXX)", "Friend's number (01XXXXXXXXX)")}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white backdrop-blur border border-slate-200 text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={async () => {
                  const ok = await onManualAdd(manualPhone);
                  if (ok) setManualPhone("");
                }}
                disabled={busy}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-white text-brand text-sm font-black active:scale-95 transition-all disabled:opacity-60"
              >
                {t("??? ????", "Add")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
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
  contacts?: { phone: string; name: string; status: string; link?: string; shareText?: string; waExists?: boolean }[];
  added?: number;
  skipped?: number;
  noWhatsApp?: string[];
};

type Msg = { kind: "ok" | "warn" | "error"; text: string } | null;

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
  const [showManual, setShowManual] = useState(false);
  const [manualPhone, setManualPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const pendingPhoneRef = useRef<string | null>(null);
  const hiddenAtRef = useRef<number | null>(null);
  const openedAtRef = useRef<number | null>(null);
  const [confirmReady, setConfirmReady] = useState(false);

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

  useEffect(() => {
    Promise.all([
      fetch("/api/me").then((r) => (r.ok ? r.json() as Promise<Me> : Promise.resolve(null))),
      fetch("/api/referral/config").then((r) => (r.ok ? r.json() as Promise<{ referralLink?: string; shareText?: string }> : Promise.resolve(null))),
    ])
      .then(([m, cfg]) => {
        if (!m?.workerId) { window.location.href = "/"; return; }
        setMe(m);
        setLink(cfg?.referralLink || "");
        setShareText(cfg?.shareText || "");
      })
      .catch(() => {})
      .finally(() => setLoadingInit(false));
    loadShare();
  }, [loadShare]);

  // Return-detection: when the user comes back from WhatsApp after ≥12s away,
  // auto-mark the pending contact as sent.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) { hiddenAtRef.current = Date.now(); return; }
      const hid = hiddenAtRef.current;
      hiddenAtRef.current = null;
      const phone = pendingPhoneRef.current;
      if (hid && phone && Date.now() - hid >= 12000) {
        pendingPhoneRef.current = null;
        setPendingPhone(null);
        confirmSent(phone);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
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
      } else if (data.sent > 0 && data.sent % 5 === 0) {
        setMsg({ kind: "ok", text: t("👏 এ দফা শেষ! আগের ৫ জন ভিন্ন — এখন নতুন ভিন্ন ৫ জনকে শেয়ার করুন 💪", "👏 Round done! Now share with 5 NEW different people 💪") });
      }
    } catch { /* ignore */ }
  }, [t]);

  const sendTo = (phone: string, text?: string) => {
    const msg = text || shareText;
    if (!msg) return;
    trackEvent("share_click", { pageCategory: "complete", metadata: { method: "whatsapp_send" } });
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    pendingPhoneRef.current = phone;
    setPendingPhone(phone);
    setConfirmReady(false);
    openedAtRef.current = Date.now();
    hiddenAtRef.current = Date.now();
    // The "পাঠিয়েছি" fallback only unlocks after 15s so users can't tap it
    // without actually opening/sending in WhatsApp (anti-cheat).
    setTimeout(() => setConfirmReady(true), 15000);
  };

  const pickContacts = async () => {
    if (busy) return;
    if (!contactsSupported || !navigator.contacts) { setShowManual(true); return; }
    setBusy(true);
    setMsg(null);
    try {
      const picked = await navigator.contacts.select(["name", "tel"], { multiple: true });
      const valid = (picked || [])
        .filter((c) => c.tel && c.tel.length > 0)
        .map((c) => ({ name: (c.name && c.name[0]) || "", tel: c.tel![0] || "" }));
      if (valid.length === 0) {
        setMsg({ kind: "warn", text: t("কোনো কন্টাক্ট বেছে নেননি।", "No contacts selected.") });
        return;
      }
      if (valid.length > 5) {
        setMsg({ kind: "warn", text: t("একবারে সর্বোচ্চ ৫ জন বেছে নিতে পারবেন — আবার ৫ জন বেছে নিন।", "Max 5 people per round — please pick again.") });
        return;
      }
      const resp = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: valid }),
      });
      if (resp.status === 400) {
        setMsg({ kind: "warn", text: t("একবারে সর্বোচ্চ ৫ জন — আবার বেছে নিন।", "Max 5 per round — pick again.") });
        return;
      }
      const data = await resp.json() as ShareSummary;
      if (!resp.ok) {
        setMsg({ kind: "error", text: t("কিছু ভুল হয়েছে — আবার চেষ্টা করুন।", "Something went wrong — try again.") });
        return;
      }
      setShare(data);
      const noWa = data.noWhatsApp || [];
      if (noWa.length > 0) {
        setMsg({ kind: "warn", text: t(`এই নাম্বারগুলোতে WhatsApp নেই — সেগুলো গোনা হবে না: ${noWa.map((p) => "+" + p).join(", ")}`, `These numbers have no WhatsApp — they won't count: ${noWa.map((p) => "+" + p).join(", ")}`) });
      } else if ((data.skipped ?? 0) > 0) {
        setMsg({ kind: "warn", text: t("কিছুজনকে আগেই বেছে নিয়েছেন — ভিন্ন মানুষ বেছে নিন।", "Some were already added — choose different people.") });
      } else if ((data.added ?? 0) > 0) {
        setMsg({ kind: "ok", text: t("✅ যুক্ত হয়েছে! প্রত্যেকে তার নিজস্ব লিংক পেয়েছে — এখন প্রত্যেককে আলাদা করে WhatsApp-এ পাঠান।", "Added! Each person got their own unique link — send each one separately on WhatsApp below.") });
      }
    } catch {
      setMsg({ kind: "error", text: t("কন্টাক্ট বেছে নেওয়া সম্ভব হয়নি।", "Could not open the contact picker.") });
    } finally {
      setBusy(false);
    }
  };

  const addManual = async () => {
    const digits = manualPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      setMsg({ kind: "warn", text: t("সঠিক ১১ ডিজিটের নম্বর দিন।", "Enter a valid 11-digit number.") });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const resp = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: [{ name: "", tel: digits }] }),
      });
      const data = await resp.json() as ShareSummary;
      if (!resp.ok) {
        setMsg({ kind: "error", text: t("নম্বর যোগ করা যায়নি।", "Could not add the number.") });
        return;
      }
      setShare(data);
      setManualPhone("");
      setMsg((data.skipped ?? 0) > 0
        ? { kind: "warn", text: t("এই নম্বরটি আগেই যোগ করা হয়েছে — ভিন্ন নম্বর দিন।", "This number was already added — use a different one.") }
        : { kind: "ok", text: t("নম্বর যোগ হয়েছে — এখন WhatsApp-এ পাঠান।", "Added — now send it on WhatsApp.") });
    } catch {
      setMsg({ kind: "error", text: t("কিছু ভুল হয়েছে।", "Something went wrong.") });
    } finally {
      setBusy(false);
    }
  };

  const motivation = (percent: number, sent: number): string => {
    if (sent >= 25) return t("আপনি টার্গেট পূরণ করেছেন! সার্টিফিকেট নিতে নিচের বাটনে চাপ দিন।", "You completed the target! Tap the button below to claim your certificate.");
    if (percent >= 96) return t("আর একটু! শেষ ধাপ — চালিয়ে যান! 🔥", "Almost there — final push! 🔥");
    if (percent >= 80) return t("চমৎকার! ৮০%+ এগিয়ে আছেন — শেষের দিকে!", "Excellent! 80%+ done — in the final stretch!");
    if (percent >= 60) return t("দারুণ! ৬০%+ — অর্ধেকের বেশি পার করেছেন!", "Great! Past 60% — over halfway there!");
    if (percent >= 40) return t("ভালো করছেন! ৪০%+ — এগিয়ে যান!", "Good going! 40%+ — keep it up!");
    if (percent >= 20) return t("চমৎকার শুরু! ২০%+ — চালিয়ে যান!", "Great start! 20%+ — keep going!");
    return t("৫ জন করে ভিন্ন ভিন্ন মানুষকে WhatsApp-এ রেফারেল পাঠান — শুরু করুন!", "Share your referral with 5 new people on WhatsApp to begin!");
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
    try { await navigator.clipboard.writeText(link); } catch { /* ignore */ }
    setCopied(true);
    trackEvent("share_click", { pageCategory: "complete", metadata: { method: "copy" } });
    setTimeout(() => setCopied(false), 1800);
  };

  const shareWhatsApp = () => {
    if (!shareText) return;
    trackEvent("share_click", { pageCategory: "complete", metadata: { method: "whatsapp" } });
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  if (loadingInit) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-pink/20 border-t-pink rounded-full animate-spin" />
      </main>
    );
  }

  const percent = share?.percent ?? 0;
  const selectedContacts = (share?.contacts || []).filter((c) => c.status === "selected");
  const sentCount = share?.sent ?? 0;
  const completed = share?.completed ?? false;

  return (
    <main className="min-h-screen overflow-x-hidden relative pt-20">
      {confetti.map((c, i) => (
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

        {/* Certificate path (share-to-25) */}
        <div className="mt-6 card-splash !rounded-[2rem] text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">🎓 {t("সার্টিফিকেটের পথে", "Certificate Path")}</h2>
            <span className="badge-glow bg-teal/20 text-teal border border-teal/40">{t("প্রতি দফায় ৫ জন", "5 at a time")}</span>
          </div>
          <p className="mt-2 text-xs text-white/70">{motivation(percent, sentCount)}</p>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold via-pink to-violet transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm font-black text-brand">{percent}%</span>
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
              {selectedContacts.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-bold text-white/50 uppercase tracking-wide">{t("পাঠানোর তালিকা", "To send")}</p>
                  {selectedContacts.map((c, i) => (
                    <div key={`${c.phone}-${i}`} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{c.name || t("কন্টাক্ট", "Contact")}</p>
                        <p className="text-[10px] text-white/40 font-mono">{`+${c.phone}`}</p>
                      </div>
                      {c.waExists === false ? (
                        <span className="flex-shrink-0 px-3 py-2 rounded-xl bg-red/15 text-red border border-red/30 text-[10px] font-black">
                          {t("WhatsApp নেই", "No WhatsApp")}
                        </span>
                      ) : pendingPhone === c.phone ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gold font-bold">{t("পাঠিয়ে ফিরে আসুন…", "Send & come back…")}</span>
                          <button
                            onClick={() => confirmSent(c.phone)}
                            disabled={!confirmReady}
                            className={`flex-shrink-0 px-3 py-2 rounded-xl text-white text-xs font-black active:scale-95 transition-all ${confirmReady ? "bg-teal" : "bg-white/20 opacity-60"}`}
                          >
                            {confirmReady ? t("✅ পাঠিয়েছি", "Sent") : t("⏳ ১৫ সেকেন্ড পরে…", "⏳ wait 15s…")}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => sendTo(c.phone, c.shareText)}
                          className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-[#25D366] to-teal text-white text-xs font-black active:scale-95 transition-all"
                        >
                          📤 {t("WhatsApp-এ পাঠান", "Send")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-2">
                {contactsSupported ? (
                  <button onClick={pickContacts} disabled={busy} className="btn-gold w-full text-sm !py-3.5 disabled:opacity-60">
                    {busy ? t("প্রক্রিয়াধীন…", "Working…") : t("📲 ৫ জন বেছে নিন (ফোনবুক থেকে)", "📲 Pick 5 people (from phonebook)")}
                  </button>
                ) : (
                  <button onClick={() => setShowManual(true)} className="btn-gold w-full text-sm !py-3.5">
                    {t("📲 ৫ জনকে শেয়ার করুন", "📲 Share with 5 people")}
                  </button>
                )}

                {!contactsSupported && !showManual && (
                  <p className="text-[11px] text-white/50">
                    {t("এই ডিভাইসে ফোনবুক পিকার নেই — নিচের বাটনে চাপ দিয়ে নম্বর যোগ করুন।", "No phonebook picker on this device — add numbers manually below.")}
                  </p>
                )}

                {(showManual || !contactsSupported) && (
                  <div className="flex gap-2">
                    <input
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      inputMode="tel"
                      placeholder={t("বন্ধুর নম্বর (01XXXXXXXXX)", "Friend's number (01XXXXXXXXX)")}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white/15 backdrop-blur border border-white/25 text-white text-sm font-bold placeholder-white/40 focus:outline-none"
                    />
                    <button onClick={addManual} disabled={busy} className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-white text-brand text-sm font-black active:scale-95 transition-all disabled:opacity-60">
                      {t("যোগ করুন", "Add")}
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-3 text-[11px] text-white/40 leading-relaxed">
                {t("টিপ: প্রতিটি \"পাঠান\" চাপলে সেই ব্যক্তির জন্য আলাদা ইউনিক লিংকসহ WhatsApp খুলবে — সেন্ড করে ফিরে আসলেই গোনা হবে। প্রতিটি লিংক একবারই ব্যবহৃত হয়, তাই একই মানুষ দুইবার গোনা হয় না; প্রতিবার নতুন মানুষ বেছে নিন।", "Tip: each Send opens WhatsApp with a unique link for that person — it counts when you send and come back. Every link is single-use, so the same person is never counted twice; pick new people each round.")}
              </p>
            </>
          ) : (
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-gold/20 via-pink/20 to-violet/20 border border-gold/30 p-5 text-center">
              <div className="text-5xl animate-pulse-glow">🎉</div>
              <h3 className="mt-2 text-xl font-black gradient-text">{t("সার্টিফিকেট অর্জন করেছেন!", "Certificate Earned!")}</h3>
              <p className="mt-1 text-xs text-white/70">
                {t("আপনি ২৫ জনকে রেফারেল পাঠিয়ে এটি অর্জন করেছেন। এটি ডাউনলোড করুন বা অনলাইনে যাচাই করুন।", "Earned by referring 25 people. Download it or verify it online.")}
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
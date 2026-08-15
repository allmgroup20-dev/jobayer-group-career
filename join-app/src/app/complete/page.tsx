"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { useLang } from "@/lib/lang";

type Me = { workerId?: string; name?: string; totalTeamMembers?: number; resourceIncome?: number };

export default function CompletePage() {
  const { lang } = useLang();
  const router = useRouter();
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);

  const [me, setMe] = useState<Me | null>(null);
  const [link, setLink] = useState("");
  const [shareText, setShareText] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

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
  }, []);

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
    setTimeout(() => setCopied(false), 1800);
  };

  const shareWhatsApp = () => {
    if (!shareText) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  if (loadingInit) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-pink/20 border-t-pink rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden relative">
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
            <p className="text-[11px] font-bold text-ink-soft">{t("রিসোর্স ইনকাম", "Resource Income")}</p>
          </div>
        </div>

        {/* Referral */}
        <div className="mt-6 card-splash !rounded-[2rem] text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">🔗 {t("আপনার রেফারেল লিংক", "Your Referral Link")}</h2>
            <span className="badge-glow bg-gold/20 text-gold border border-gold/40">{t("শেয়ার করুন • আয় করুন", "Share • Earn")}</span>
          </div>
          <p className="mt-2 text-xs text-white/70">
            {t("এই লিংক দিয়ে যতজন জয়েন করবে, প্রত্যেকে আপনার টিমে যোগ হবে।", "Everyone who joins through this link becomes part of your team.")}
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
          <h3 className="font-black text-brand mb-3">💡 {t("কীভাবে বেশি আয় করবেন", "How to Earn More")}</h3>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>1️⃣ {t("লিংকটি ফেসবুক, ইউটিউব ও হোয়াটসঅ্যাপে শেয়ার করুন", "Share your link on Facebook, YouTube & WhatsApp")}</li>
            <li>2️⃣ {t("প্রতি রেফারেলে বোনাস ও কমিশন পাবেন", "Earn bonus & commission on every referral")}</li>
            <li>3️⃣ {t("টিম বড় হলে ইনকাম বাড়বে", "Bigger team = bigger income")}</li>
          </ul>
        </div>

        <button onClick={() => router.push("/")} className="mt-6 btn-outline w-full">
          {t("হোমে ফিরে যান", "Back to Home")}
        </button>
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

const INTEREST_OPTIONS = [
  { en: "Web Development", bn: "ওয়েব ডেভেলপমেন্ট", icon: "🌐" },
  { en: "Programming", bn: "প্রোগ্রামিং", icon: "💻" },
  { en: "Graphics Design", bn: "গ্রাফিক্স ডিজাইন", icon: "🎨" },
  { en: "Digital Marketing", bn: "ডিজিটাল মার্কেটিং", icon: "📱" },
  { en: "Video Editing", bn: "ভিডিও এডিটিং", icon: "🎬" },
  { en: "Freelancing", bn: "ফ্রিল্যান্সিং", icon: "💼" },
  { en: "English Learning", bn: "ইংলিশ লার্নিং", icon: "📖" },
  { en: "AI & ChatGPT", bn: "এআই ও চ্যাটজিপিটি", icon: "🤖" },
  { en: "Business", bn: "ব্যবসা", icon: "📊" },
];

type Step = "consent" | "otp" | "contacts" | "interests";

export default function OnboardingPage() {
  const { lang } = useLanguageStore();
  const router = useRouter();
  const [workerId, setWorkerId] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("consent");
  const [loading, setLoading] = useState(true);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpDevCode, setOtpDevCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);

  const [contacts, setContacts] = useState<{ name: string; phone: string }[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [syncResult, setSyncResult] = useState<{ total?: number; matched?: number; bonus?: number } | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    const wid = localStorage.getItem("worker_id");
    if (!wid) { window.location.href = "/login"; return; }
    setWorkerId(wid);
    fetch(`/api/workers/profile?workerId=${encodeURIComponent(wid)}`)
      .then(r => r.json() as Promise<{ phone?: string }>)
      .then(d => { if (d.phone) setPhone(d.phone); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);

  const handleConsent = async () => {
    setLoading(true);
    try {
      await fetch("/api/privacy/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, consentType: "onboarding", isGranted: 1 }),
      }).catch(() => {});
      setStep("otp");
    } catch {} finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    setOtpBusy(true); setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json() as { error?: string; devCode?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.devCode) setOtpDevCode(data.devCode);
      setOtpSent(true);
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Failed");
    } finally { setOtpBusy(false); }
  };

  const handleVerifyOtp = async () => {
    setOtpBusy(true); setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      setOtpVerified(true);
      setStep("contacts");
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Failed");
    } finally { setOtpBusy(false); }
  };

  const pickContacts = async () => {
    const anyNav = navigator as unknown as {
      contacts?: { select: (fields: string[], opts: { multiple: boolean }) => Promise<{ name?: string; tel?: string[] }[]> };
    };
    if (anyNav.contacts?.select) {
      try {
        const picked = await anyNav.contacts.select(["name", "tel"], { multiple: true });
        const mapped = picked
          .map(c => ({ name: c.name || "", phone: (c.tel?.[0] || "").replace(/[^0-9]/g, "") }))
          .filter(c => c.phone.length >= 10);
        setContacts(prev => mergeContacts(prev, mapped));
        return;
      } catch { /* user cancelled or unsupported */ }
    }
    // Fallback: prompt user to paste contacts
    const pasted = window.prompt(t("ফোনবুক না খুললে কন্টাক্টগুলো পেস্ট করুন (প্রতি লাইনে: নাম, ০১XXXXXXXXX)", "Paste contacts (one per line: Name, 01XXXXXXXXX)"));
    if (pasted) { setPasteText(pasted); parsePasted(pasted); }
  };

  const mergeContacts = (prev: { name: string; phone: string }[], next: { name: string; phone: string }[]) => {
    const map = new Map<string, string>();
    for (const c of [...prev, ...next]) map.set(c.phone, c.name || c.phone);
    return Array.from(map.entries()).map(([phone, name]) => ({ name, phone }));
  };

  const parsePasted = (text: string) => {
    const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
    const parsed = rows.map(r => {
      const parts = r.split(/[,;\t]/).map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return null;
      const phone = (parts.find(p => /^\d{10,13}$/.test(p.replace(/[^0-9]/g, ""))) || parts[parts.length - 1]).replace(/[^0-9]/g, "");
      const name = parts[0].replace(/[^0-9]/g, "").length > 8 ? "" : parts[0];
      return { name, phone };
    }).filter((c): c is { name: string; phone: string } => !!c && c.phone.length >= 10);
    setContacts(mergeContacts(contacts, parsed));
  };

  const handleSync = async () => {
    if (contacts.length === 0) return;
    setSyncBusy(true);
    try {
      const res = await fetch("/api/track/phonebook/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, contacts }),
      });
      const data = await res.json() as { error?: string; total?: number; matched?: number; bonus?: number };
      if (!res.ok) throw new Error(data.error || "Failed");
      setSyncResult(data);
    } catch { setSyncResult({ total: contacts.length, matched: 0, bonus: 0 }); }
    finally { setSyncBusy(false); }
  };

  const inviteAll = () => {
    const msg = encodeURIComponent(
      t(
        `🎯 আসুন! Jobayer Group Career-এ ৯৭০+ প্রিমিয়াম রিসোর্স মাত্র ৳৯৯ থেকে।\nআমার রেফারেল: https://career.jobayergroup.com/register?ref=${workerId}`,
        `🎯 Join Jobayer Group Career — 970+ premium resources from just ৳99!\nMy referral: https://career.jobayergroup.com/register?ref=${workerId}`
      )
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const handleFinish = async () => {
    try {
      for (const interest of interests) {
        await fetch("/api/track/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerId, eventType: "search", searchKeyword: interest, pageCategory: "onboarding" }),
        }).catch(() => {});
      }
      await fetch(`/api/track/score?workerId=${workerId}`, { method: "POST" }).catch(() => {});
    } catch {}
    localStorage.setItem("onboarding_done", "1");
    window.location.href = "/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    );
  }

  const header = (emoji: string, title: string, sub: string) => (
    <div className="text-center mb-6">
      <div className="w-16 h-16 gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
        <span className="text-2xl">{emoji}</span>
      </div>
      <h1 className="text-xl font-bold text-primary">{title}</h1>
      <p className="text-sm text-text-secondary mt-1">{sub}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-gray-50">
      <div className="w-full max-w-lg animate-fade-up">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-border">

          {step === "consent" && (
            <div className="space-y-4 text-center">
              {header("🔒", t("সবকিছু এক বাটনে সম্মতি দিন", "Grant Everything in One Tap"), t("এক ক্লিকে উন্নত অভিজ্ঞতা", "One tap for the best experience"))}
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-text-secondary leading-relaxed text-left space-y-2">
                <p>✅ {t("কুকিজ ও ট্র্যাকিং — আপনার আগ্রহ বুঝে ব্যক্তিগতকৃত কন্টেন্ট", "Cookies & tracking for personalized content")}</p>
                <p>✅ {t("ডিভাইসের ইন্টারেস্ট ও আচরণ বিশ্লেষণ", "Device interest & behaviour analysis")}</p>
                <p>✅ {t("কন্টাক্ট লিস্ট সিঙ্ক — আয়ের সুযোগ তৈরি", "Contact list sync to unlock earning opportunities")}</p>
                <p>✅ {t("WhatsApp নোটিফিকেশন", "WhatsApp notifications")}</p>
                <p className="text-[10px] text-text-secondary/50">{t("আপনার ডেটা কখনো তৃতীয় পক্ষের কাছে বিক্রি হয় না।", "Your data is never sold to third parties.")}</p>
              </div>
              <button onClick={handleConsent} disabled={loading} className="btn-primary w-full">
                {t("✅ সব গ্রহণ করুন ও এগিয়ে যান", "✅ Accept All & Continue")}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4 text-center">
              {header("💬", t("WhatsApp নম্বর ভেরিফাই করুন", "Verify Your WhatsApp Number"), t("এই নম্বরে একটি ভেরিফিকেশন কোড যাবে", "We will send a verification code here"))}
              <div className="bg-gray-50 rounded-xl p-3 text-sm font-bold text-primary">{phone}</div>
              {!otpSent ? (
                <button onClick={handleSendOtp} disabled={otpBusy} className="btn-primary w-full">
                  {otpBusy ? "..." : t("কোড পাঠান", "Send Code")}
                </button>
              ) : (
                <div className="space-y-3">
                  {otpDevCode && (
                    <p className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-700">
                      {t("টেস্ট কোড", "Test code")}: <b>{otpDevCode}</b>
                    </p>
                  )}
                  <input
                    type="text" inputMode="numeric" maxLength={6} value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-অঙ্কের কোড" className="input-field w-full text-center text-lg tracking-[0.5em]" />
                  {otpError && <p className="text-xs text-red-500">{otpError}</p>}
                  <button onClick={handleVerifyOtp} disabled={otpBusy || otpCode.length < 6} className="btn-primary w-full">
                    {otpBusy ? "..." : t("✅ ভেরিফাই করুন", "✅ Verify")}
                  </button>
                  <button onClick={handleSendOtp} disabled={otpBusy} className="text-xs text-action hover:underline">
                    {t("আবার কোড পাঠান", "Resend code")}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "contacts" && (
            <div className="space-y-4 text-center">
              {header("📒", t("কন্টাক্ট সিঙ্ক করুন", "Sync Your Contacts"), t("বন্ধুদের আমন্ত্রণ জানালে আপনি বোনাস ও কমিশন পান", "Invite friends and earn bonus & commission"))}
              <div className="bg-gray-50 rounded-xl p-3 text-left space-y-2">
                <button onClick={pickContacts} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-sm">
                  📒 {t("কন্টাক্ট থেকে নির্বাচন করুন", "Pick from Contacts")}
                </button>
                <textarea
                  value={pasteText} onChange={e => { setPasteText(e.target.value); parsePasted(e.target.value); }}
                  placeholder={t("অথবা এখানে পেস্ট করুন (প্রতি লাইনে: নাম, ০১XXXXXXXXX)", "Or paste here (one per line: Name, 01XXXXXXXXX)")}
                  className="input-field w-full text-xs h-24" />
              </div>
              {contacts.length > 0 && (
                <p className="text-xs text-text-secondary">📇 {contacts.length} {t("টি কন্টাক্ট যোগ হয়েছে", "contacts added")}</p>
              )}
              {syncResult && (
                <div className="text-xs bg-green-50 border border-green-200 rounded-lg p-3 text-green-700">
                  ✅ {t("সিঙ্ক সম্পন্ন", "Sync complete")} — {syncResult.matched ?? 0} {t("জন ম্যাচ", "matched")} · +৳{syncResult.bonus ?? 0} {t("বোনাস", "bonus")}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button onClick={handleSync} disabled={syncBusy || contacts.length === 0} className="btn-primary w-full">
                  {syncBusy ? "..." : t("✅ কন্টাক্ট সিঙ্ক করুন", "✅ Sync Contacts")}
                </button>
                {syncResult && (
                  <button onClick={inviteAll} className="btn-outline w-full">
                    📲 {t("সবাইকে WhatsApp-এ আমন্ত্রণ পাঠান", "Invite everyone on WhatsApp")}
                  </button>
                )}
                <button onClick={() => setStep("interests")} className="text-xs text-action hover:underline">
                  {t("এড়িয়ে যান →", "Skip →")}
                </button>
              </div>
            </div>
          )}

          {step === "interests" && (
            <div className="space-y-4 text-center">
              {header("🎯", t("আপনার আগ্রহ কী?", "What are you interested in?"), t("আপনার জন্য সেরা রিসোর্স দেখাব", "We will show the best resources for you"))}
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_OPTIONS.map((opt) => {
                  const selected = interests.includes(opt.en);
                  return (
                    <button key={opt.en}
                      onClick={() => setInterests(prev => prev.includes(opt.en) ? prev.filter(i => i !== opt.en) : [...prev, opt.en])}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${selected ? "border-action bg-action/10" : "border-border hover:border-action/50"}`}>
                      <span className="text-2xl">{opt.icon}</span>
                      <p className="text-sm font-semibold text-primary mt-1">{lang === "bn" ? opt.bn : opt.en}</p>
                    </button>
                  );
                })}
              </div>
              <button onClick={handleFinish} className="btn-primary w-full">
                {t("🚀 শুরু করুন", "🚀 Get Started")}
              </button>
            </div>
          )}

        </div>

        <div className="flex justify-center gap-2 mt-6">
          {(["consent", "otp", "contacts", "interests"] as Step[]).map((s) => (
            <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all ${step === s ? "bg-action scale-125" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
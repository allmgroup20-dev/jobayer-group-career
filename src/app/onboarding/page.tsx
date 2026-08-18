"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import ContactFileSync from "@/components/contacts/ContactFileSync";
import { parseContactsFile, dedupeContacts } from "@/lib/contacts/parser";

const INTEREST_OPTIONS = [
  { en: "YouTube Content Creation", bn: "ইউটিউব কনটেন্ট ক্রিয়েশন", icon: "🎬" },
  { en: "Facebook Content Creation & Page Monetization", bn: "ফেসবুক কনটেন্ট ও পেজ মনিটাইজেশন", icon: "📱" },
  { en: "Instagram & Reels", bn: "ইনস্টাগ্রাম ও রিলস", icon: "🎥" },
  { en: "Video Editing", bn: "ভিডিও এডিটিং", icon: "🎬" },
  { en: "Photo Editing & Photography", bn: "ফটো এডিটিং ও ফটোগ্রাফি", icon: "📷" },
  { en: "Social Media Management", bn: "সোশ্যাল মিডিয়া ম্যানেজমেন্ট", icon: "📲" },
  { en: "Podcasting", bn: "পডকাস্টিং", icon: "🎙️" },
  { en: "Graphics Design", bn: "গ্রাফিক্স ডিজাইন", icon: "🎨" },
  { en: "UI/UX Design", bn: "ইউআই/ইউএক্স ডিজাইন", icon: "🧩" },
  { en: "Logo & Branding Design", bn: "লোগো ও ব্র্যান্ডিং ডিজাইন", icon: "✏️" },
  { en: "Motion Graphics & Animation", bn: "মোশন গ্রাফিক্স ও অ্যানিমেশন", icon: "🧊" },
  { en: "Web Development", bn: "ওয়েব ডেভেলপমেন্ট", icon: "🌐" },
  { en: "Programming / Coding", bn: "প্রোগ্রামিং / কোডিং", icon: "💻" },
  { en: "App Development", bn: "অ্যাপ ডেভেলপমেন্ট", icon: "📱" },
  { en: "WordPress & Website", bn: "ওয়ার্ডপ্রেস ও ওয়েবসাইট", icon: "🖥️" },
  { en: "Game Development", bn: "গেম ডেভেলপমেন্ট", icon: "🎮" },
  { en: "AI & ChatGPT", bn: "এআই ও চ্যাটজিপিটি", icon: "🤖" },
  { en: "Ethical Hacking / Cyber Security", bn: "এথিক্যাল হ্যাকিং / সাইবার সিকিউরিটি", icon: "🔐" },
  { en: "Freelancing", bn: "ফ্রিল্যান্সিং", icon: "💼" },
  { en: "Digital Marketing", bn: "ডিজিটাল মার্কেটিং", icon: "📢" },
  { en: "Facebook / Instagram Ads", bn: "ফেসবুক / ইনস্টাগ্রাম অ্যাডস", icon: "📈" },
  { en: "SEO", bn: "এসইও", icon: "🔍" },
  { en: "Affiliate Marketing", bn: "অ্যাফিলিয়েট মার্কেটিং", icon: "🔗" },
  { en: "E-commerce & Dropshipping", bn: "ই-কমার্স ও ড্রপশিপিং", icon: "🛒" },
  { en: "Amazon & Online Business", bn: "অ্যামাজন ও অনলাইন ব্যবসা", icon: "🛍️" },
  { en: "Content Writing & Blogging", bn: "কনটেন্ট রাইটিং ও ব্লগিং", icon: "✍️" },
  { en: "Online Course & Digital Product Selling", bn: "অনলাইন কোর্স ও ডিজিটাল প্রোডাক্ট সেলিং", icon: "📚" },
  { en: "English Learning / Spoken English", bn: "ইংলিশ লার্নিং / স্পোকেন ইংলিশ", icon: "🗣️" },
  { en: "IELTS & Study Abroad", bn: "আইইএলটিএস ও বিদেশে পড়াশোনা", icon: "🎓" },
  { en: "Job Preparation (BCS / Bank)", bn: "চাকরির প্রস্তুতি (বিসিএস / ব্যাংক)", icon: "🏛️" },
  { en: "MS Office & Computer Basics", bn: "এমএস অফিস ও কম্পিউটার বেসিক", icon: "🖥️" },
  { en: "Personal Development & Leadership", bn: "পার্সোনাল ডেভেলপমেন্ট ও লিডারশিপ", icon: "🌟" },
];

type Step = "consent" | "otp" | "contacts" | "interests";

export default function OnboardingPage() {
  const { lang } = useLanguageStore();
  const router = useRouter();
  const [workerId, setWorkerId] = useState("");
  const [verifyEnabled, setVerifyEnabled] = useState<boolean | null>(null);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("consent");
  const [loading, setLoading] = useState(true);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpDevCode, setOtpDevCode] = useState("");
  const [otpAutoFilled, setOtpAutoFilled] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  const [contacts, setContacts] = useState<{ name: string; phone: string }[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [syncResult, setSyncResult] = useState<{ total?: number; matched?: number; bonus?: number } | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const [interests, setInterests] = useState<string[]>([]);
  const [showAllInterests, setShowAllInterests] = useState(false);

  // A phone that is really an email or a google_/fb_ placeholder is not a
  // WhatsApp number — the user must type their real number on this screen.
  const looksLikePhone = (value?: string) => {
    if (!value) return false;
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13;
  };

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("01") && digits.length === 11) return "880" + digits.slice(1);
    if (digits.startsWith("880") && digits.length === 13) return digits;
    return digits;
  };

  useEffect(() => {
    fetch("/api/auth/otp/status").then((r) => r.json() as Promise<{ enabled?: boolean }>)
      .then((d) => setVerifyEnabled(d.enabled === true))
      .catch(() => setVerifyEnabled(false));
  }, []);

  useEffect(() => {
    const wid = localStorage.getItem("worker_id");
    if (!wid) { window.location.href = "/login"; return; }
    setWorkerId(wid);
    fetch(`/api/workers/profile?workerId=${encodeURIComponent(wid)}`)
      .then(r => r.json() as Promise<{ phone?: string }>)
      .then(d => {
        if (looksLikePhone(d.phone)) {
          setPhone(d.phone!);
        } else {
          setPhone("");
        }
      })
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
      // Verification disabled → skip the OTP step, go straight to contacts.
      setStep(verifyEnabled === true ? "otp" : "contacts");
    } catch {} finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setOtpError(t("সঠিক হোয়াটসঅ্যাপ নম্বর দিন", "Enter a valid WhatsApp number"));
      return;
    }
    setOtpBusy(true); setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json() as { error?: string; devCode?: string; configured?: boolean; autoFilled?: boolean };
      if (data.configured === false) {
        setOtpError(t("ওটিপি সার্ভিস এখনো চালু হয়নি। পরে আবার চেষ্টা করুন।", "OTP service is not configured yet. Please try again later."));
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.devCode) { setOtpDevCode(data.devCode); setOtpCode(data.devCode); }
      setOtpAutoFilled(data.autoFilled === true);
      setOtpSent(true);
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Failed");
    } finally { setOtpBusy(false); }
  };

  const handleVerifyOtp = async () => {
    const cleanPhone = normalizePhone(phone);
    setOtpBusy(true); setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, code: otpCode }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      // Persist the verified phone to the worker profile (only allowed because
      // the OTP proof was cached by the verify endpoint above).
      const save = await fetch("/api/workers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, phone: cleanPhone }),
      });
      if (!save.ok) {
        const sData = await save.json().catch(() => ({ error: "Failed to save phone" })) as { error?: string };
        throw new Error(sData.error || "Failed to save phone");
      }
      setPhoneSaved(true);
      setStep("contacts");
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Failed");
    } finally { setOtpBusy(false); }
  };

  const mergeContacts = (prev: { name: string; phone: string }[], next: { name: string; phone: string }[]) => {
    const map = new Map<string, string>();
    for (const c of [...prev, ...next]) map.set(c.phone, c.name || c.phone);
    return Array.from(map.entries()).map(([phone, name]) => ({ name, phone }));
  };

  const parsePasted = (text: string) => {
    const parsed = dedupeContacts(parseContactsFile(text, "pasted.txt"));
    setContacts(mergeContacts(contacts, parsed));
  };

  const handleFileSync = (count: number, matched: number, bonus: number) => {
    setSyncResult({ total: count, matched, bonus });
    localStorage.setItem("contact_sync_done", "1");
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

  const inviteAll = async () => {
    // Fresh single-use referral link on every invite so no link is ever reused.
    let link = `https://career.jobayergroup.com/register?ref=${workerId}`;
    try {
      const res = await fetch(`/api/referral/link?workerId=${encodeURIComponent(workerId)}&redirectPath=${encodeURIComponent("/register")}&lang=${lang}`);
      if (res.ok) {
        const data = await res.json() as { link?: string };
        if (data.link) link = data.link;
      }
    } catch { /* keep fallback link */ }
    const msg = encodeURIComponent(
      t(
        `🎯 আসুন! Jobayer Group Career-এ ৯৭০+ প্রিমিয়াম রিসোর্স মাত্র ৳৯৯ থেকে।\nআমার রেফারেল: ${link}`,
        `🎯 Join Jobayer Group Career — 970+ premium resources from just ৳99!\nMy referral: ${link}`
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
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                  📞 {t("হোয়াটসঅ্যাপ নম্বর", "WhatsApp Number")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setOtpError(""); setOtpSent(false); setOtpCode(""); setOtpDevCode(""); setOtpAutoFilled(false); }}
                  placeholder={t("০১XXX-XXXXXX", "01XXX-XXXXXX")}
                  className="input-field w-full"
                />
                {phoneSaved && (
                  <p className="text-[11px] text-success font-semibold">
                    ✅ {t("ফোন নম্বর আপডেট হয়েছে", "Phone number updated")}
                  </p>
                )}
              </div>
              {!otpSent ? (
                <button onClick={handleSendOtp} disabled={otpBusy} className="btn-primary w-full">
                  {otpBusy ? "..." : t("কোড পাঠান", "Send Code")}
                </button>
              ) : (
                <div className="space-y-3">
                  {otpAutoFilled ? (
                    <p className="text-xs bg-green-50 border border-green-200 rounded-lg p-2 text-green-700">
                      ✅ {t("আপনার ভেরিফিকেশন কোডটি নিচের বক্সে স্বয়ংক্রিয়ভাবে বসানো হয়েছে। শুধু \"ভেরিফাই করুন\" বাটনে ক্লিক করুন।", "Your verification code has been entered automatically in the box below. Just click \"Verify\".")}
                    </p>
                  ) : otpDevCode ? (
                    <p className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-700">
                      {t("টেস্ট কোড", "Test code")}: <b>{otpDevCode}</b>
                    </p>
                  ) : null}
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
              {otpError && !otpSent && <p className="text-xs text-red-500">{otpError}</p>}
            </div>
          )}

          {step === "contacts" && (
            <div className="space-y-4 text-center">
              {header("📒", t("সব কন্টাক্ট অ্যাক্সেস দিন", "Grant Contact Access"), t("এক ক্লিকে আপনার ফোনবুক সিঙ্ক হয়ে যাবে — বোনাস ও কমিশন পান", "Sync your phonebook in one click — earn bonus & commission"))}
              <div className="text-left">
                <ContactFileSync workerId={workerId} onComplete={handleFileSync} />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-left space-y-2">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  {t("অথবা ম্যানুয়ালি পেস্ট করুন", "Or paste manually")}
                </p>
                <textarea
                  value={pasteText} onChange={e => { setPasteText(e.target.value); parsePasted(e.target.value); }}
                  placeholder={t("প্রতি লাইনে: নাম, ০১XXXXXXXXX", "One per line: Name, 01XXXXXXXXX")}
                  className="input-field w-full text-xs h-24" />
              </div>
              {contacts.length > 0 && (
                <p className="text-xs text-text-secondary">📇 {contacts.length} {t("টি কন্টাক্ট যোগ হয়েছে", "contacts added")}</p>
              )}
              <div className="flex flex-col gap-2">
                {contacts.length > 0 && (
                  <button onClick={handleSync} disabled={syncBusy} className="btn-primary w-full">
                    {syncBusy ? "..." : t("✅ কন্টাক্ট সিঙ্ক করুন", "✅ Sync Contacts")}
                  </button>
                )}
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
                {(showAllInterests ? INTEREST_OPTIONS : INTEREST_OPTIONS.slice(0, 12)).map((opt) => {
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
              <div className="text-center">
                {showAllInterests ? (
                  <button onClick={() => setShowAllInterests(false)} className="text-xs text-action hover:underline">
                    {t("− কম দেখান", "− Show less")}
                  </button>
                ) : (
                  <button onClick={() => setShowAllInterests(true)} className="text-xs text-action hover:underline">
                    {t(`+ আরও ${INTEREST_OPTIONS.length - 12}টি আগ্রহ দেখুন`, `+ Show ${INTEREST_OPTIONS.length - 12} more interests`)}
                  </button>
                )}
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
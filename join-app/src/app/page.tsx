"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang";
import GoogleLogin from "@/components/GoogleLogin";

type Me = {
  workerId?: string;
  name?: string;
  profileCompleted?: boolean;
};

const BENEFITS = [
  { emoji: "🎁", en: "Instant bonus resources", bn: "বোনাস রিসোর্স" },
  { emoji: "💰", en: "Certificates & recognition", bn: "সার্টিফিকেট ও স্বীকৃতি" },
  { emoji: "📚", en: "970+ premium resources", bn: "৯৭০+ প্রিমিয়াম রিসোর্স" },
  { emoji: "🤝", en: "Learn together & earn certificates together", bn: "বন্ধুর সাথে শিখুন, একসাথে সার্টিফিকেট অর্জন করুন" },
];

const STEPS = [
  { n: "১", en: "Log in with Google", bn: "Google দিয়ে লগইন করুন" },
  { n: "২", en: "Complete your profile", bn: "প্রোফাইল সম্পূর্ণ করুন" },
  { n: "৩", en: "Learn, unlock resources & earn certificates", bn: "শিখুন, রিসোর্স আনলক করুন ও সার্টিফিকেট অর্জন করুন" },
];

export default function HomePage() {
  const { lang } = useLang();
  const router = useRouter();
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) window.localStorage.setItem("referral_code", ref);

    fetch("/api/me")
      .then((r) => (r.ok ? r.json() as Promise<Me> : Promise.resolve(null)))
      .then((data) => setMe(data))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleSuccess = (_wid: string, _name: string, isNew: boolean) => {
    router.push(isNew ? "/onboarding" : "/onboarding");
  };

  return (
    <main className="min-h-screen overflow-x-hidden page-under-header">
      {/* Hero — Final 75: Background #F8FAFC, Heading #0B1F33, Accent #C2410C, CTA #C2410C */}
      <section className="relative px-4 pb-10 text-center bg-[#F8FAFC] -mx-4">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[#F8FAFC]" />
        <div className="pointer-events-none absolute -top-10 -left-10 -z-10 w-40 h-40 rounded-full bg-[#C2410C]/5 blur-3xl animate-floaty" />
        <div className="pointer-events-none absolute -top-6 -right-10 -z-10 w-44 h-44 rounded-full bg-[#2563EB]/5 blur-3xl animate-floaty" style={{ animationDelay: "1s" }} />

        <span className="badge-glow bg-[#C2410C]/10 text-[#C2410C] border border-[#C2410C]/20 animate-wiggle mt-4">
          🎉 {t("এখনই জয়েন করুন", "Join Now")}
        </span>

        <h1 className="mt-4 text-[clamp(28px,5vw,42px)] font-black leading-tight">
          <span className="text-[#0B1F33]">
            {t("ইউটিউব আর্নার — আসল নিয়ম শিখুন, বাস্তব সার্টিফিকেট পান", "YouTube Earner — learn real rules, earn real certificates")}
          </span>
          <br />
          <span className="text-[#C2410C]">{t("৯৭০+ রিসোর্স · ৩-টিয়ার সার্টিফিকেট · প্রমাণিত দক্ষতা", "970+ resources · 3-tier certificates · proven skills")}</span>
        </h1>

        <p className="mt-3 text-base md:text-lg text-[#475569] font-medium max-w-md mx-auto">
          {t(
            "ইউটিউব-এ বড় হওয়ার সঠিক পথ — আমরা গাইড করব ধাপে ধাপে। ফ্রি ডেমো ক্লাস দিয়ে আজই শুরু করুন।",
            "The right path to grow on YouTube — we guide you step by step. Start today with a free demo class."
          )}
        </p>

        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm font-black">
          <span className="badge-glow bg-white border border-[#E2E8F0] text-[#0B1F33]">✅ {t("ফ্রি আজীবন", "Free forever")}</span>
          <span className="badge-glow bg-white border border-[#E2E8F0] text-[#0B1F33]">✅ {t("কোনো হিডেন চার্জ নেই", "No hidden fees")}</span>
          <span className="badge-glow bg-white border border-[#E2E8F0] text-[#0B1F33]">✅ {t("গুগল সুরক্ষিত", "Google secured")}</span>
        </div>
      </section>

      {/* Auth card */}
      <section id="auth-card" className="px-4 pb-10 scroll-mt-20">
        <div className="max-w-md mx-auto card-splash animate-pop-in">
          <div className="text-center mb-5">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-pink/10 flex items-center justify-center text-4xl animate-floaty">
              🎁
            </div>
            <h2 className="mt-3 text-2xl font-black">
              {checking ? t("লোড হচ্ছে...", "Loading...") : me ? t("আবার স্বাগতম!", "Welcome Back!") : t("Google দিয়ে রেজিস্ট্রেশন / লগইন করুন", "Register / Log in with Google")}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {me
                ? t("আপনার প্রোফাইল সম্পূর্ণ করুন ও বোনাস রিসোর্স পেতে শুরু করুন", "Complete your profile & start earning bonus resources")
                : t("নতুন কিছু লিখতে হবে না — Google অ্যাকাউন্টেই এক ক্লিকে শুরু", "Nothing to type — one click with your Google account")}
            </p>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-sm font-bold text-red-800">
              ⚠️ {error}
            </div>
          )}

          {checking ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-12 rounded-2xl bg-slate-200" />
              <div className="h-3 rounded-full bg-slate-100 w-3/4 mx-auto" />
            </div>
          ) : me ? (
            <div className="space-y-3">
              <button
                onClick={() => router.push(me.profileCompleted ? "/complete" : "/onboarding")}
                className="btn-excite w-full"
              >
                {me.profileCompleted
                  ? "🎉 " + t("আপনার জার্নি চালিয়ে যান", "Continue Your Journey")
                  : "🚀 " + t("প্রোফাইল সম্পূর্ণ করুন", "Complete Profile")}
              </button>
              <p className="text-center text-[11px] text-slate-500">
                {t("আপনার অগ্রগতি সংরক্ষিত — যেখানে ছেড়েছিলেন সেখান থেকেই চালিয়ে যান।", "Your progress is saved — pick up right where you left off.")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="[&>div]:w-full [&>div>div]:w-full">
                <GoogleLogin onSuccess={handleSuccess} onError={setError} />
              </div>
              <p className="text-center text-xs text-slate-500">
                {t(
                  "Google দিয়ে লগইন করলেই আপনার অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে তৈরি হবে।",
                  "Signing in with Google automatically creates your account."
                )}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 pb-10">
        <div className="max-w-md mx-auto">
          <h2 className="text-center text-xl font-black text-brand mb-4">
            {t("আমরা যা করি — আপনি যা পাবেন", "What we do — what you get")} 👇
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {BENEFITS.map((b) => (
              <div key={b.en} className="card-pop !p-4 text-center animate-pop-in">
                <div className="text-3xl animate-floaty" style={{ animationDelay: "0.4s" }}>{b.emoji}</div>
                <p className="mt-2 text-sm font-bold text-brand">{t(b.bn, b.en)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 970+ Resources explained */}
      <section className="px-4 pb-10">
        <div className="max-w-md mx-auto">
          <h2 className="text-center text-lg font-black text-brand">
            {t("৯৭০+ রিসোর্স — কী পাবেন?", "970+ Resources — what is inside?")}
          </h2>
          <p className="text-center text-xs text-ink-soft mt-1">
            {t("ক্যাটাগরি অনুযায়ী সাজানো — কোনটা ফ্রি, কোনটা প্রিমিয়াম পরিষ্কার লেবেল", "Organized by category — clearly labeled Free / Premium")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold">
            <div className="card-pop !p-3 flex items-center gap-2"><span className="text-base">🎬</span> {t("ইউটিউব গ্রোথ", "YouTube Growth")} <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-teal/15 text-teal">Free</span></div>
            <div className="card-pop !p-3 flex items-center gap-2"><span className="text-base">💼</span> {t("ফ্রিল্যান্সিং", "Freelancing")} <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-gold/15 text-gold">Premium</span></div>
            <div className="card-pop !p-3 flex items-center gap-2"><span className="text-base">📢</span> {t("ডিজিটাল মার্কেটিং", "Digital Marketing")} <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-teal/15 text-teal">Free</span></div>
            <div className="card-pop !p-3 flex items-center gap-2"><span className="text-base">🎨</span> {t("ভিডিও এডিটিং", "Video Editing")} <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-violet/15 text-violet">Premium</span></div>
          </div>
          <p className="mt-2 text-center text-[11px] text-ink-soft">
            {t("লগইন করলেই ৫০+ ফ্রি রিসোর্স সাথে সাথে — বাকি ধাপে ধাপে আনলক", "50+ free resources instantly after login — rest unlock step by step")}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-16">
        <div className="max-w-md mx-auto">
          <h2 className="text-center text-xl font-black text-brand mb-4">
            {t("কীভাবে কাজ করে", "How It Works")} ⚡
          </h2>
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="card-pop flex items-center gap-4 animate-pop-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-excite text-white font-black text-lg flex items-center justify-center shadow-lg shadow-excite/25 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  {s.n}
                </div>
                <p className="font-bold text-brand">{t(s.bn, s.en)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar — real verifiable trust, no fake numbers */}
      <section className="px-4 pb-10">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-center">
          <div className="card-pop !p-3 !rounded-xl">
            <p className="text-lg">🔒</p>
            <p className="text-xs font-black text-brand">{t("গুগল সুরক্ষিত", "Google Secured")}</p>
            <p className="text-[10px] text-ink-soft">{t("তথ্য এনক্রিপ্টেড", "Encrypted")}</p>
          </div>
          <div className="card-pop !p-3 !rounded-xl">
            <p className="text-lg">✅</p>
            <p className="text-xs font-black text-brand">{t("কিউআর যাচাই", "QR Verified")}</p>
            <p className="text-[10px] text-ink-soft">{t("নিয়োগকর্তা যাচাই", "Employer verify")}</p>
          </div>
          <div className="card-pop !p-3 !rounded-xl">
            <p className="text-lg">✍️</p>
            <p className="text-xs font-black text-brand">{t("এক্সিকিউটিভ সই", "Executive Signed")}</p>
            <p className="text-[10px] text-ink-soft">{t("সিইও, সিবিও, এপিএস", "CEO, CBO, APAC")}</p>
          </div>
          <div className="card-pop !p-3 !rounded-xl">
            <p className="text-lg">🎁</p>
            <p className="text-xs font-black text-brand">{t("ফ্রি আজীবন", "Free Forever")}</p>
            <p className="text-[10px] text-ink-soft">{t("কোনো সাবস্ক্রিপশন নেই", "No subscription")}</p>
          </div>
        </div>
      </section>

      {/* FAQ — objection handling, no fake claims */}
      <section className="px-4 pb-10">
        <div className="max-w-md mx-auto">
          <h2 className="text-center text-xl font-black text-brand mb-4">
            {t("প্রায়শই জিজ্ঞাসিত প্রশ্ন", "Frequently Asked Questions")} ❓
          </h2>
          <div className="space-y-3">
            <details className="card-pop !p-4 group">
              <summary className="font-black text-brand cursor-pointer list-none flex items-center justify-between">
                {t("পরে টাকা দিতে হবে?", "Will I have to pay later?")}
                <span className="text-ink-soft group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {t("না। রেজিস্ট্রেশন, ডেমো ক্লাস, ৫০+ রিসোর্স ও ফাউন্ডেশন সার্টিফিকেট — সব ফ্রি আজীবন। শুধু অরিজিনাল প্রিন্ট কপি নিতে চাইলে ডেলিভারি খরচ (প্রিন্ট+শিপিং) দিতে হয় — তাও ঐচ্ছিক।", "No. Registration, demo class, 50+ resources and Foundation certificate are free forever. Only if you order a printed original copy you pay delivery (print+shipping) — and that is optional.")}
              </p>
            </details>
            <details className="card-pop !p-4 group">
              <summary className="font-black text-brand cursor-pointer list-none flex items-center justify-between">
                {t("কতদিনে সার্টিফিকেট পাব?", "How long to get certificate?")}
                <span className="text-ink-soft group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {t("ফাউন্ডেশন: আপনার শেয়ার গতির ওপর — গড়ে ১-২ সপ্তাহে ৩০ শেয়ার পূর্ণ হলে। অ্যাম্বাসেডর: ১১ রেফারেল + ৩ টাস্ক। এলিট: এলিট অ্যাক্সেস ফি দিয়ে সাথে সাথে।", "Foundation: depends on your sharing pace — avg 1-2 weeks to complete 30 shares. Ambassador: 11 referrals + 3 tasks. Elite: instantly with Elite access fee.")}
              </p>
            </details>
            <details className="card-pop !p-4 group">
              <summary className="font-black text-brand cursor-pointer list-none flex items-center justify-between">
                {t("কী শিখব?", "What will I learn?")}
                <span className="text-ink-soft group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {t("ইউটিউব চ্যানেল গ্রোথ, এসইও, থাম্বনেল, মনিটাইজেশন, কমিউনিটি বিল্ডিং, ফ্রিল্যান্সিং ও ডিজিটাল মার্কেটিং — ৯৭০+ রিসোর্স ধাপে ধাপে।", "YouTube channel growth, SEO, thumbnails, monetization, community building, freelancing and digital marketing — 970+ resources step by step.")}
              </p>
            </details>
            <details className="card-pop !p-4 group">
              <summary className="font-black text-brand cursor-pointer list-none flex items-center justify-between">
                {t("তথ্য কি নিরাপদ?", "Is my data safe?")}
                <span className="text-ink-soft group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {t("গুগল OAuth 2.0, এনক্রিপ্টেড ডাটাবেস, তৃতীয় পক্ষের কাছে বিক্রি করা হয় না। যেকোনো সময় ডাটা ডিলিটের অনুরোধ করতে পারেন।", "Google OAuth 2.0, encrypted database, never sold to third parties. You can request data deletion anytime.")}
              </p>
            </details>
            <details className="card-pop !p-4 group">
              <summary className="font-black text-brand cursor-pointer list-none flex items-center justify-between">
                {t("মোবাইলেই কি হবে?", "Will it work on mobile?")}
                <span className="text-ink-soft group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {t("১০০% মোবাইল ফ্রেন্ডলি — কোনো অ্যাপ ডাউনলোড দরকার নেই, ব্রাউজারেই সব কাজ হয়।", "100% mobile friendly — no app download needed, everything works in the browser.")}
              </p>
            </details>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "পরে টাকা দিতে হবে?",
                acceptedAnswer: { "@type": "Answer", text: "না। রেজিস্ট্রেশন, ডেমো ক্লাস, ৫০+ রিসোর্স ও ফাউন্ডেশন সার্টিফিকেট — সব ফ্রি আজীবন। শুধু অরিজিনাল প্রিন্ট কপি নিতে চাইলে ডেলিভারি খরচ দিতে হয় — তাও ঐচ্ছিক।" },
              },
              {
                "@type": "Question",
                name: "কতদিনে সার্টিফিকেট পাব?",
                acceptedAnswer: { "@type": "Answer", text: "ফাউন্ডেশন: গড়ে ১-২ সপ্তাহে ৩০ শেয়ার পূর্ণ হলে। অ্যাম্বাসেডর: ১১ রেফারেল + ৩ টাস্ক। এলিট: এলিট অ্যাক্সেস ফি দিয়ে সাথে সাথে।" },
              },
              {
                "@type": "Question",
                name: "কী শিখব?",
                acceptedAnswer: { "@type": "Answer", text: "ইউটিউব চ্যানেল গ্রোথ, এসইও, থাম্বনেল, মনিটাইজেশন, কমিউনিটি বিল্ডিং, ফ্রিল্যান্সিং ও ডিজিটাল মার্কেটিং — ৯৭০+ রিসোর্স ধাপে ধাপে।" },
              },
              {
                "@type": "Question",
                name: "তথ্য কি নিরাপদ?",
                acceptedAnswer: { "@type": "Answer", text: "গুগল OAuth 2.0, এনক্রিপ্টেড ডাটাবেস, তৃতীয় পক্ষের কাছে বিক্রি করা হয় না। যেকোনো সময় ডাটা ডিলিটের অনুরোধ করতে পারেন।" },
              },
              {
                "@type": "Question",
                name: "মোবাইলেই কি হবে?",
                acceptedAnswer: { "@type": "Answer", text: "১০০% মোবাইল ফ্রেন্ডলি — কোনো অ্যাপ ডাউনলোড দরকার নেই, ব্রাউজারেই সব কাজ হয়।" },
              },
            ],
          }),
        }}
      />



      {/* Sticky Mobile CTA — only on home, hidden on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-30 md:hidden border-t border-line bg-white/95 backdrop-blur px-4 pt-3 pb-3 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button onClick={() => document.getElementById('auth-card')?.scrollIntoView({behavior:'smooth', block:'center'})} className="w-full btn-excite text-sm !py-3">
          🚀 {t("গুগলে লগইন করে ফ্রি শুরু করুন", "Start free with Google")}
        </button>
      </div>
    </main>
  );
}

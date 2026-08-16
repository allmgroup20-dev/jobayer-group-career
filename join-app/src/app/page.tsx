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
  { emoji: "💰", en: "Creator ranks & certificate", bn: "ক্রিয়েটর র্যাংক ও সার্টিফিকেট" },
  { emoji: "📚", en: "970+ premium resources", bn: "৯৭০+ প্রিমিয়াম রিসোর্স" },
  { emoji: "🤝", en: "Refer & earn ranks", bn: "রেফার করুন, র্যাংক অর্জন করুন" },
];

const STEPS = [
  { n: "১", en: "Login with Google", bn: "Google দিয়ে লগইন" },
  { n: "২", en: "Complete your profile", bn: "প্রোফাইল কমপ্লিট করুন" },
  { n: "৩", en: "Learn & unlock resources", bn: "শিখুন ও রিসোর্স আনলক করুন" },
  { n: "৪", en: "Share & earn ranks", bn: "শেয়ার করুন, র্যাংক অর্জন করুন" },
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

  const continuePath = me?.profileCompleted ? "/complete" : "/onboarding";

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-10 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-gold/20 via-pink/10 to-transparent" />
        <div className="pointer-events-none absolute -top-10 -left-10 -z-10 w-40 h-40 rounded-full bg-excite/20 blur-3xl animate-floaty" />
        <div className="pointer-events-none absolute -top-6 -right-10 -z-10 w-44 h-44 rounded-full bg-violet/20 blur-3xl animate-floaty" style={{ animationDelay: "1s" }} />

        <span className="badge-glow bg-gold/20 text-brand border border-gold/40 animate-wiggle">
          🎉 {t("এখনই জয়েন করুন", "Join Now")}
        </span>

        <h1 className="mt-4 text-4xl md:text-5xl font-black leading-tight">
          <span className="gradient-text animate-shimmer">
            {t("দক্ষতা শিখুন, রেওয়ার্ড আনলক করুন", "Learn Skills, Unlock Rewards")}
          </span>
          <br />
          {t("কোনো ভুয়া প্রমিজ নেই!", "No Fake Promises!")}
        </h1>

        <p className="mt-3 text-base md:text-lg text-ink-soft max-w-md mx-auto">
          {t(
            "Google দিয়ে এক ক্লিকে জয়েন করুন — ফ্রি ডেমো ক্লাস, প্রিমিয়াম রিসোর্স ও ক্রিয়েটর র্যাংক পেতে এখনই শুরু করুন।",
            "Join with Google in one click — start with a free demo class, premium resources and creator ranks today."
          )}
        </p>

        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm font-black">
          <span className="badge-glow bg-teal/15 text-teal border border-teal/30">⚡ {t("ফ্রি রেজিস্ট্রেশন", "Free Registration")}</span>
          <span className="badge-glow bg-violet/15 text-violet border border-violet/30">✅ {t("ফ্রি ডেমো ক্লাস", "Free Demo Class")}</span>
        </div>
      </section>

      {/* Auth card */}
      <section className="px-4 pb-10">
        <div className="max-w-md mx-auto card-splash animate-pop-in">
          <div className="text-center mb-5">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center text-4xl animate-floaty">
              🎁
            </div>
            <h2 className="mt-3 text-2xl font-black">
              {checking ? t("লোড হচ্ছে...", "Loading...") : me ? t("আবার স্বাগতম!", "Welcome Back!") : t("চলুন শুরু করি!", "Let's Get Started!")}
            </h2>
            <p className="mt-1 text-sm text-white/70">
              {me
                ? t("আপনার প্রোফাইল সম্পূর্ণ করুন ও বোনাস রিসোর্স পেতে শুরু করুন", "Complete your profile & start earning bonus resources")
                : t("লগইন/রেজিস্ট্রেশন সম্পূর্ণ Google দিয়ে", "Login/Register is 100% Google")}
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-red-500/20 border border-red-300/40 text-sm font-bold text-white">
              ⚠️ {error}
            </div>
          )}

          {checking ? (
            <div className="flex justify-center py-6">
              <div className="w-9 h-9 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : me ? (
            <div className="space-y-3">
              <button onClick={() => router.push(continuePath)} className="btn-gold w-full">
                {me.profileCompleted ? "🎉 " + t("রেফারাল সেন্টারে যান", "Go to Referral Center") : "🚀 " + t("প্রোফাইল সম্পূর্ণ করুন", "Complete Profile")}
              </button>
              <button onClick={() => router.push("/complete")} className="btn-white w-full">
                {t("রেফারেল লিংক দেখুন", "View Referral Link")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="[&>div]:w-full [&>div>div]:w-full">
                <GoogleLogin onSuccess={handleSuccess} onError={setError} />
              </div>
              <p className="text-center text-xs text-white/60">
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
          <h3 className="text-center text-xl font-black text-brand mb-4">
            {t("যা যা পাবেন", "What You Get")} 👇
          </h3>
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

      {/* How it works */}
      <section className="px-4 pb-16">
        <div className="max-w-md mx-auto">
          <h3 className="text-center text-xl font-black text-brand mb-4">
            {t("কীভাবে কাজ করে", "How It Works")} ⚡
          </h3>
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="card-pop flex items-center gap-4 animate-pop-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-excite to-pink text-white font-black text-lg flex items-center justify-center shadow-lg shadow-pink/25">
                  {s.n}
                </div>
                <p className="font-bold text-brand">{t(s.bn, s.en)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 pb-12 text-center text-xs text-ink-soft safe-bottom">
        <p className="font-bold">
          {t("একটি Google অ্যাকাউন্ট — দুই প্ল্যাটফর্মে একই প্রোফাইল ও ডাটা।", "One Google account — same profile & data across both platforms.")}
        </p>
      </footer>
    </main>
  );
}

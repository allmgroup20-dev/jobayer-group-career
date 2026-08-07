"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/lib/store";
import { LoadingDots } from "@/components/ui/LoadingDots";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export default function RegisterPage() {
  const { lang } = useLanguageStore();
  const router = useRouter();

  const [form, setForm] = useState({ phone: "", password: "", confirmPassword: "", referralCode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMsg, setOtpMsg] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [redirectAfter, setRedirectAfter] = useState("/onboarding");
  const [utmParams, setUtmParams] = useState({ utmSource: "", utmMedium: "", utmCampaign: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || localStorage.getItem("referral_code") || "";
    if (ref) {
      localStorage.setItem("referral_code", ref);
      setForm((prev) => ({ ...prev, referralCode: ref }));
    }
    const redirect = params.get("redirect") || "";
    if (redirect) setRedirectAfter(redirect);
    const us = params.get("utm_source") || "";
    const um = params.get("utm_medium") || "";
    const uc = params.get("utm_campaign") || "";
    if (us || um || uc) {
      setUtmParams({ utmSource: us, utmMedium: um, utmCampaign: uc });
    }
  }, []);

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("880") && digits.length > 10) return digits.slice(3);
    if (digits.startsWith("0")) return digits.slice(1);
    return digits;
  };

  const handleSendOtp = async () => {
    setOtpBusy(true); setOtpMsg(""); setError("");
    const cleanPhone = normalizePhone(form.phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(lang === "bn" ? "সঠিক হোয়াটসঅ্যাপ নম্বর দিন (যেমন: ০১XXX-XXXXXX)" : "Enter a valid WhatsApp number (e.g. 01XXX-XXXXXX)");
      setOtpBusy(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json() as { error?: string; devCode?: string };
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
      if (data.devCode) setOtpCode(data.devCode);
      setOtpMsg(lang === "bn" ? "ওটিপি পাঠানো হয়েছে! আপনার হোয়াটসঅ্যাপে কোডটি দেখুন।" : "OTP sent! Check your WhatsApp for the code.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setOtpBusy(false); }
  };

  const handleVerifyOtp = async () => {
    setOtpBusy(true); setOtpMsg(""); setError("");
    const cleanPhone = normalizePhone(form.phone);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, code: otpCode }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setPhoneVerified(true);
      setOtpMsg(lang === "bn" ? "ফোন নম্বর যাচাই হয়েছে ✓" : "Phone verified ✓");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally { setOtpBusy(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!phoneVerified) {
      setError(lang === "bn" ? "আগে ফোন নম্বর যাচাই করুন" : "Verify your phone number first");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(lang === "bn" ? "পাসওয়ার্ড মিলছে না" : "Passwords do not match");
      setLoading(false);
      return;
    }

    const cleanPhone = normalizePhone(form.phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(lang === "bn" ? "সঠিক হোয়াটসঅ্যাপ নম্বর দিন (যেমন: ০১XXX-XXXXXX)" : "Enter a valid WhatsApp number (e.g. 01XXX-XXXXXX)");
      setLoading(false);
      return;
    }

    const payload: Record<string, unknown> = {
      phone: cleanPhone,
      password: form.password,
      referralCode: form.referralCode || undefined,
      ...utmParams,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { error?: string; token?: string; workerId?: string; name?: string };
      if (!res.ok) throw new Error(data.error || "Registration failed");
      if (data.workerId) {
        localStorage.setItem("worker_id", data.workerId || "");
        localStorage.setItem("worker_name", data.name || "");
      }
      setSuccess(true);
      setTimeout(() => router.push(redirectAfter), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const update = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg via-success/5 to-accent/5 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 animate-scale">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-black text-primary mb-2">
            {lang === "bn" ? "নিবন্ধন সফল হয়েছে!" : "Registration Successful!"}
          </h1>
          <p className="text-text-secondary">{lang === "bn" ? "রিডাইরেক্ট করা হচ্ছে..." : "Redirecting..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-accent/5 to-primary/5 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-green-500/20">
            💬
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-primary">
            {lang === "bn" ? "নিবন্ধন" : "Create Account"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "আপনার হোয়াটসঅ্যাপ নম্বর দিয়ে শুরু করুন" : "Start with your WhatsApp number"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/5 border border-danger/20 text-sm text-danger font-medium flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-border/80 space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
              💬 {lang === "bn" ? "হোয়াটসঅ্যাপ নম্বর" : "WhatsApp Number"} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary/50">📞</span>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                placeholder={lang === "bn" ? "০১XXX-XXXXXX" : "01XXX-XXXXXX"} className="input-field pl-10" required />
            </div>
            <p className="text-[10px] text-text-secondary/40 mt-1">{lang === "bn" ? "উদাহরণ: ০১৭১২৩৪৫৬৭৮" : "Example: 01712345678"}</p>
          </div>

          {!phoneVerified && (
            <div className="p-3 rounded-xl bg-[#25D366]/5 border border-[#25D366]/20">
              <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                🔐 {lang === "bn" ? "ফোন নম্বর যাচাই" : "Verify Phone"}
              </label>
              {!otpSent ? (
                <button type="button" onClick={handleSendOtp} disabled={otpBusy}
                  className="w-full py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm disabled:opacity-60">
                  {otpBusy ? <LoadingDots /> : lang === "bn" ? "ওটিপি পাঠান" : "Send OTP"}
                </button>
              ) : (
                <div className="space-y-2">
                  <input type="text" inputMode="numeric" maxLength={6} value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder={lang === "bn" ? "৬-ডিজিট কোড" : "6-digit code"} className="input-field text-center tracking-[0.3em]" />
                  <button type="button" onClick={handleVerifyOtp} disabled={otpBusy || otpCode.length < 6}
                    className="w-full py-3 rounded-xl bg-[#128C7E] text-white font-bold text-sm disabled:opacity-60">
                    {otpBusy ? <LoadingDots /> : lang === "bn" ? "যাচাই করুন" : "Verify"}
                  </button>
                  <button type="button" onClick={handleSendOtp} disabled={otpBusy}
                    className="w-full text-xs font-bold text-[#128C7E] hover:underline">
                    {lang === "bn" ? "আবার কোড পাঠান" : "Resend code"}
                  </button>
                </div>
              )}
              {otpMsg && <p className="text-[11px] text-[#128C7E] font-medium mt-2">✅ {otpMsg}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
              🔒 {lang === "bn" ? "পাসওয়ার্ড" : "Password"} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••" className="input-field pr-10" required minLength={4} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary text-sm">
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
              🔒 {lang === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"} <span className="text-red-400">*</span>
            </label>
            <input type="password" value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              placeholder="••••••" className="input-field" required minLength={4} />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
              🔗 {lang === "bn" ? "রেফারেল কোড" : "Referral Code"}
            </label>
            <input type="text" value={form.referralCode} onChange={(e) => update("referralCode", e.target.value)}
              placeholder={lang === "bn" ? "ঐচ্ছিক — কারো কোড থাকলে দিন" : "Optional — enter referral code"} className="input-field" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-base shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]">
            {loading ? (
              <span className="flex items-center gap-2">
                <LoadingDots />
                <span className="text-sm font-medium">{lang === "bn" ? "নিবন্ধন হচ্ছে..." : "Registering..."}</span>
              </span>
            ) : (lang === "bn" ? "নিবন্ধন করুন" : "Register")}
          </button>

          <p className="text-center text-xs text-text-secondary/50">
            {lang === "bn"
              ? "নিবন্ধন করে আপনি আমাদের শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত হচ্ছেন"
              : "By registering you agree to our Terms & Privacy Policy"}
          </p>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs font-bold text-text-secondary bg-white">
              {lang === "bn" ? "অথবা" : "OR"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/80 space-y-3">
          <p className="text-center text-[11px] text-text-secondary/70 font-medium">
            {lang === "bn" ? "অথবা সামাজিক অ্যাকাউন্ট দিয়ে শুরু করুন" : "Or continue with a social account"}
          </p>
          <SocialLoginButtons lang={lang} redirectTo="/onboarding" onError={setError} />
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          {lang === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
          <Link href="/login" className="font-bold text-[#25D366] hover:text-[#128C7E] transition-colors">
            {lang === "bn" ? "লগইন করুন" : "Login"}
          </Link>
        </p>
      </div>
    </div>
  );
}

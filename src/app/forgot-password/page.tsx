"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { LoadingDots } from "@/components/ui/LoadingDots";

export default function ForgotPasswordPage() {
  const { lang } = useLanguageStore();
  const [step, setStep] = useState<"phone" | "otp" | "password" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [otpMsg, setOtpMsg] = useState("");

  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("880") && digits.length > 10) return digits;
    if (digits.startsWith("01") && digits.length === 11) return "880" + digits.slice(1);
    return digits;
  };

  const handleSendOtp = async () => {
    setBusy(true); setError(""); setOtpMsg("");
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(t("সঠিক হোয়াটসঅ্যাপ নম্বর দিন", "Enter a valid WhatsApp number"));
      setBusy(false);
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
      if (data.devCode) setOtpCode(data.devCode);
      setOtpMsg(t("ওটিপি পাঠানো হয়েছে! হোয়াটসঅ্যাপে কোডটি দেখুন।", "OTP sent! Check your WhatsApp."));
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  };

  const handleVerifyOtp = async () => {
    setBusy(true); setError("");
    const cleanPhone = normalizePhone(phone);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, code: otpCode }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally { setBusy(false); }
  };

  const handleReset = async () => {
    setBusy(true); setError("");
    if (password.length < 6) {
      setError(t("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে", "Password must be at least 6 characters"));
      setBusy(false);
      return;
    }
    if (password !== confirmPassword) {
      setError(t("পাসওয়ার্ড মিলছে না", "Passwords do not match"));
      setBusy(false);
      return;
    }
    const cleanPhone = normalizePhone(phone);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, password }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-accent/5 to-primary/5 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-green-500/20">
            🔑
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-primary">
            {t("পাসওয়ার্ড রিসেট", "Reset Password")}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("হোয়াটসঅ্যাপ নম্বর দিয়ে যাচাই করুন", "Verify with your WhatsApp number")}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/5 border border-danger/20 text-sm text-danger font-medium flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/80 space-y-4">
          {step === "phone" && (
            <>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  📞 {t("হোয়াটসঅ্যাপ নম্বর", "WhatsApp Number")}
                </label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXX-XXXXXX" className="input-field" required />
              </div>
              <button onClick={handleSendOtp} disabled={busy}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-base disabled:opacity-60">
                {busy ? <LoadingDots /> : t("ওটিপি পাঠান", "Send OTP")}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              {otpMsg && <p className="text-xs text-[#128C7E] font-medium">✅ {otpMsg}</p>}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  🔐 {t("৬-ডিজিট কোড", "6-digit code")}
                </label>
                <input type="text" inputMode="numeric" maxLength={6} value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="input-field text-center tracking-[0.3em]" />
              </div>
              <button onClick={handleVerifyOtp} disabled={busy || otpCode.length < 6}
                className="w-full py-3.5 rounded-2xl bg-[#128C7E] text-white font-bold disabled:opacity-60">
                {busy ? <LoadingDots /> : t("যাচাই করুন", "Verify")}
              </button>
              <button onClick={handleSendOtp} disabled={busy} className="text-xs text-action hover:underline w-full">
                {t("আবার কোড পাঠান", "Resend code")}
              </button>
            </>
          )}

          {step === "password" && (
            <>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  🔒 {t("নতুন পাসওয়ার্ড", "New Password")}
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field" minLength={6} autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  🔒 {t("পাসওয়ার্ড নিশ্চিত করুন", "Confirm Password")}
                </label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field" autoComplete="new-password" />
              </div>
              <button onClick={handleReset} disabled={busy}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold disabled:opacity-60">
                {busy ? <LoadingDots /> : t("পাসওয়ার্ড রিসেট করুন", "Reset Password")}
              </button>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-xl font-black text-primary mb-2">{t("সফল হয়েছে!", "Success!")}</h2>
              <p className="text-sm text-text-secondary mb-4">{t("নতুন পাসওয়ার্ড দিয়ে লগইন করুন।", "Login with your new password.")}</p>
              <Link href="/login" className="inline-block w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-center">
                {t("লগইন করুন", "Login")}
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          <Link href="/login" className="font-bold text-[#25D366] hover:text-[#128C7E] transition-colors">
            ← {t("লগইন পেজে ফিরুন", "Back to login")}
          </Link>
        </p>
      </div>
    </div>
  );
}

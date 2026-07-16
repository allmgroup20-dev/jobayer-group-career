"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/lib/store";

export default function RegisterPage() {
  const { lang } = useLanguageStore();
  const router = useRouter();

  const [form, setForm] = useState({ phone: "", password: "", confirmPassword: "", referralCode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Priority: URL param > localStorage > nothing
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || localStorage.getItem("referral_code") || "";
    if (ref) {
      localStorage.setItem("referral_code", ref);
      setForm((prev) => ({ ...prev, referralCode: ref }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError(lang === "bn" ? "পাসওয়ার্ড মিলছে না" : "Passwords do not match");
      setLoading(false);
      return;
    }

    // Only send phone, password, referralCode — name is generated server-side
    const payload = {
      phone: form.phone,
      password: form.password,
      referralCode: form.referralCode || undefined,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { error?: string; token?: string; workerId?: string; name?: string };
      if (!res.ok) throw new Error(data.error || "Registration failed");
      if (data.token) {
        localStorage.setItem("worker_token", data.token);
        localStorage.setItem("worker_id", data.workerId || "");
      }
      localStorage.removeItem("referral_code");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-2xl text-white font-bold">JGC</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "নিবন্ধন করুন" : "Create Account"}
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            {lang === "bn" ? "আপনার যাত্রা শুরু করুন" : "Start your journey today"}
          </p>
        </div>

        <div className="card shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            {form.referralCode && (
              <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl text-sm text-accent">
                {lang === "bn"
                  ? `রেফারেল কোড: ${form.referralCode}`
                  : `Referral Code: ${form.referralCode}`}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {lang === "bn"
                  ? "আপনার হোয়াটসঅ্যাপ নাম্বার দিন"
                  : "Your WhatsApp Number"}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="01XXXXXXXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {lang === "bn" ? "পাসওয়ার্ড" : "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field w-full pr-11"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 border-none bg-transparent cursor-pointer text-[#94A3B8] hover:text-[#64748B] transition-colors">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {lang === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-field w-full pr-11"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 border-none bg-transparent cursor-pointer text-[#94A3B8] hover:text-[#64748B] transition-colors">
                  {showConfirm ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {lang === "bn" ? "রেফারেল কোড (ঐচ্ছিক)" : "Referral Code (Optional)"}
              </label>
              <input
                type="text"
                value={form.referralCode}
                onChange={(e) => {
                  setForm({ ...form, referralCode: e.target.value });
                  if (e.target.value) localStorage.setItem("referral_code", e.target.value);
                }}
                className="input-field"
                placeholder={lang === "bn" ? "রেফারেল কোড দিন" : "Enter referral code"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base !py-3.5"
            >
              {loading
                ? (lang === "bn" ? "নিবন্ধন হচ্ছে..." : "Creating account...")
                : (lang === "bn" ? "নিবন্ধন করুন" : "Register")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-text-secondary">
              {lang === "bn" ? "ইতিমধ্যে একাউন্ট আছে?" : "Already have an account?"}
            </span>
            <Link href="/login" className="text-action font-medium hover:underline ml-1">
              {lang === "bn" ? "লগইন করুন" : "Login"}
            </Link>
          </div>

          <p className="mt-4 text-xs text-text-secondary text-center">
            {lang === "bn"
              ? "নিবন্ধন করে আপনি আমাদের শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত হচ্ছেন"
              : "By registering, you agree to our terms and privacy policy"}
          </p>
        </div>
      </div>
    </div>
  );
}
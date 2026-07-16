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
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {lang === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"}
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
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
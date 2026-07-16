"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";

export default function LoginPage() {
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<"worker" | "company">("worker");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = activeTab === "worker" ? "/api/auth/worker-login" : "/api/auth/company-login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeTab === "worker" ? { phone, password } : { username: phone, password }),
      });
      const data = await res.json() as { error?: string; token?: string; workerId?: string; name?: string };
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (activeTab === "worker" && data.token) {
        localStorage.setItem("worker_token", data.token);
        localStorage.setItem("worker_id", data.workerId || "");
        localStorage.setItem("worker_name", data.name || "");
      }
      window.location.href = activeTab === "worker" ? "/dashboard" : "/company";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleFingerprint = async () => {
    if (!phone) return alert(lang === "bn" ? "প্রথমে মোবাইল নাম্বার দিন" : "Enter phone number first");
    setLoading(true);
    setError("");
    try {
      const bioRes = await fetch("/api/auth/biometric/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "begin", phone }),
      });
      const bioData = await bioRes.json() as { error?: string; challenge?: string; credentials?: { id: string; deviceName: string }[] };
      if (!bioRes.ok) throw new Error(bioData.error || "No biometric setup found");
      if (!window.PublicKeyCredential) {
        throw new Error(lang === "bn" ? "এই ব্রাউজার ফিঙ্গারপ্রিন্ট সাপোর্ট করে না" : "Browser does not support fingerprint");
      }
      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(bioData.challenge!), (c) => c.charCodeAt(0)),
          allowCredentials: bioData.credentials!.map((c) => ({
            id: Uint8Array.from(atob(c.id!), (ch) => ch.charCodeAt(0)),
            type: "public-key" as PublicKeyCredentialType,
          })),
          userVerification: "required" as UserVerificationRequirement,
        },
      })) as PublicKeyCredential;
      const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      const finishRes = await fetch("/api/auth/biometric/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", credentialId: credId }),
      });
      const finishData = await finishRes.json() as { error?: string; token?: string; workerId?: string };
      if (!finishRes.ok) throw new Error(finishData.error || "Biometric auth failed");
      if (finishData.token) localStorage.setItem("worker_token", finishData.token);
      if (finishData.workerId) localStorage.setItem("worker_id", finishData.workerId);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Biometric login failed");
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
            {lang === "bn" ? "স্বাগতম" : "Welcome Back"}
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            {lang === "bn" ? "আপনার অ্যাকাউন্টে লগইন করুন" : "Login to your account"}
          </p>
        </div>

        <div className="card shadow-xl border-0">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setActiveTab("worker"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "worker" ? "bg-white shadow-sm text-primary" : "text-text-secondary"
              }`}
            >
              {lang === "bn" ? "সদস্য লগইন" : "Member Login"}
            </button>
            <button
              onClick={() => { setActiveTab("company"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "company" ? "bg-white shadow-sm text-primary" : "text-text-secondary"
              }`}
            >
              {lang === "bn" ? "কোম্পানি লগইন" : "Company Login"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {activeTab === "worker"
                  ? (lang === "bn" ? "মোবাইল নম্বর" : "Phone Number")
                  : (lang === "bn" ? "ইউজারনেম" : "Username")}
              </label>
              <input
                type={activeTab === "worker" ? "tel" : "text"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder={activeTab === "worker" ? "01XXXXXXXXX" : "Enter username"}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-action focus:ring-action/20" />
                <span className="text-text-secondary">{lang === "bn" ? "মনে রাখুন" : "Remember Me"}</span>
              </label>
              <button type="button" className="text-action hover:underline">
                {lang === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot Password?"}
              </button>
            </div>

            {activeTab === "worker" && (
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 text-base !py-3.5"
                >
                  {loading
                    ? (lang === "bn" ? "লগইন হচ্ছে..." : "Logging in...")
                    : (lang === "bn" ? "লগইন করুন" : "Login")}
                </button>
                <button
                  type="button"
                  onClick={handleFingerprint}
                  disabled={loading}
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-action/10 to-accent/10 border border-action/20 flex items-center justify-center hover:bg-action/20 transition-all shrink-0 disabled:opacity-50"
                  title={lang === "bn" ? "ফিঙ্গারপ্রিন্ট দিয়ে লগইন" : "Login with fingerprint"}
                >
                  <svg className="w-6 h-6 text-action" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16.5V9.5C7 6.46 9.24 4 12 4c2.76 0 5 2.46 5 5.5v2M12 13v4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 14.5v-2A7 7 0 0119 12" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0118 0v2M8 12a4 4 0 018 0M12 20v-1" />
                  </svg>
                </button>
              </div>
            )}

            {activeTab === "company" && (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-base !py-3.5"
              >
                {loading
                  ? (lang === "bn" ? "লগইন হচ্ছে..." : "Logging in...")
                  : (lang === "bn" ? "লগইন করুন" : "Login")}
              </button>
            )}
          </form>

          {activeTab === "worker" && (
            <div className="mt-6 text-center text-sm">
              <span className="text-text-secondary">
                {lang === "bn" ? "একাউন্ট নেই?" : "Don't have an account?"}
              </span>
              <Link href="/register" className="text-action font-medium hover:underline ml-1">
                {lang === "bn" ? "এখন নিবন্ধন করুন" : "Register Now"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
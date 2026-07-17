"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { FingerprintIcon } from "@/components/ui/FingerprintIcon";

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
    setLoading(true);
    setError("");
    try {
      if (!window.PublicKeyCredential) {
        throw new Error(lang === "bn" ? "এই ব্রাউজার ফিঙ্গারপ্রিন্ট সাপোর্ট করে না" : "Browser does not support fingerprint");
      }
      // Get server challenge first (discoverable credential — no phone needed)
      const chalRes = await fetch("/api/auth/biometric/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "challenge" }),
      });
      const chalData = await chalRes.json() as { challenge?: string; error?: string };
      if (!chalRes.ok) throw new Error(chalData.error || "Failed to get challenge");

      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(chalData.challenge!), (c) => c.charCodeAt(0)),
          userVerification: "required" as UserVerificationRequirement,
        },
      })) as PublicKeyCredential;
      const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      const finishRes = await fetch("/api/auth/biometric/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", credentialId: credId }),
      });
      const finishData = await finishRes.json() as { error?: string; token?: string; workerId?: string; userType?: string };
      if (!finishRes.ok) throw new Error(finishData.error || "Biometric auth failed");
      if (finishData.userType === "company") {
        window.location.href = "/company";
      } else {
        if (finishData.token) localStorage.setItem("worker_token", finishData.token);
        if (finishData.workerId) localStorage.setItem("worker_id", finishData.workerId);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Biometric login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // Use Google Identity Services
      const googleWindow = window.open(
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        "client_id=&" + // Will use GIS (Google Identity Services) for production
        "redirect_uri=" + encodeURIComponent(window.location.origin + "/login") +
        "&response_type=id_token" +
        "&scope=openid%20profile%20email",
        "google-login",
        "width=500,height=600"
      );
      // For now, simulate with mock
      const name = prompt(lang === "bn" ? "গুগল একাউন্টের নাম দিন:" : "Enter your Google name:") || "Google User";
      const email = prompt(lang === "bn" ? "গুগল ইমেইল দিন:" : "Enter your Google email:") || "";
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: "mock." + btoa(JSON.stringify({ sub: "google_" + Date.now() })) + ".sig", name, email }),
      });
      const data = await res.json() as { error?: string; token?: string; workerId?: string; name?: string };
      if (!res.ok) throw new Error(data.error || "Google login failed");
      if (data.token) localStorage.setItem("worker_token", data.token);
      if (data.workerId) localStorage.setItem("worker_id", data.workerId);
      if (data.name) localStorage.setItem("worker_name", data.name);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const name = prompt(lang === "bn" ? "ফেসবুক একাউন্টের নাম দিন:" : "Enter your Facebook name:") || "FB User";
      const email = prompt(lang === "bn" ? "ফেসবুক ইমেইল দিন:" : "Enter your Facebook email:") || "";
      const res = await fetch("/api/auth/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: "mock_fb_token_" + Date.now(), name, email }),
      });
      const data = await res.json() as { error?: string; token?: string; workerId?: string; name?: string };
      if (!res.ok) throw new Error(data.error || "Facebook login failed");
      if (data.token) localStorage.setItem("worker_token", data.token);
      if (data.workerId) localStorage.setItem("worker_id", data.workerId);
      if (data.name) localStorage.setItem("worker_name", data.name);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Facebook login failed");
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

          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Fingerprint Button — prominent, no phone input needed */}
            {activeTab === "worker" && (
              <button
                type="button"
                onClick={handleFingerprint}
                disabled={loading}
                className="w-full py-6 rounded-2xl bg-gradient-to-br from-primary/5 to-action/5 border-2 border-dashed border-action/30 hover:border-action/60 hover:bg-action/5 transition-all flex flex-col items-center gap-3 disabled:opacity-50"
              >
                <FingerprintIcon className="text-action" size={56} />
                <span className="text-sm font-medium text-action">
                  {lang === "bn" ? "ফিঙ্গারপ্রিন্ট দিয়ে লগইন করুন" : "Login with Fingerprint"}
                </span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-secondary font-medium">
                {lang === "bn" ? "অথবা" : "OR"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <button type="submit" disabled={loading} className={`w-full text-base !py-3.5 rounded-xl font-medium transition-all ${
                loading ? "bg-gray-300 text-gray-500" : "btn-primary"
              }`}>
                {loading
                  ? (lang === "bn" ? "লগইন হচ্ছে..." : "Logging in...")
                  : (lang === "bn" ? "লগইন করুন" : "Login")}
              </button>
            </form>

            {activeTab === "worker" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-text-secondary font-medium">
                    {lang === "bn" ? "সোশ্যাল লগইন" : "Social Login"}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-gray-50 transition-all text-sm font-medium text-text-secondary disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-gray-50 transition-all text-sm font-medium text-text-secondary disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                </div>
              </>
            )}

            {activeTab === "worker" && (
              <div className="text-center text-sm mt-4">
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
    </div>
  );
}

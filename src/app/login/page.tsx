"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { FingerprintIcon } from "@/components/ui/FingerprintIcon";
import { LoadingDots } from "@/components/ui/LoadingDots";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export default function LoginPage() {
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<"member" | "company">("member");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slowWarning, setSlowWarning] = useState(false);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Company login fields
  const [companyUsername, setCompanyUsername] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [showCompanyPassword, setShowCompanyPassword] = useState(false);

  useEffect(() => {
    if (loading) {
      slowTimerRef.current = setTimeout(() => setSlowWarning(true), 5000);
    } else {
      setSlowWarning(false);
      clearTimeout(slowTimerRef.current);
    }
    return () => clearTimeout(slowTimerRef.current);
  }, [loading]);

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("880") && digits.length > 10) return digits;
    if (digits.startsWith("0") && digits.length === 11) return digits;
    if (digits.startsWith("0")) return digits;
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(lang === "bn" ? "সঠিক হোয়াটসঅ্যাপ নম্বর দিন (যেমন: ০১XXX-XXXXXX)" : "Enter a valid WhatsApp number (e.g. 01XXX-XXXXXX)");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/worker-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, password, remember }),
      });
      const data = await res.json() as { error?: string; token?: string; workerId?: string; name?: string };
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.workerId) {
        localStorage.setItem("worker_id", data.workerId);
        localStorage.setItem("worker_name", data.name || "");
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/company-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: companyUsername, password: companyPassword }),
      });
      const data = await res.json() as { error?: string; token?: string; name?: string };
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.token) {
        localStorage.setItem("company_token", data.token);
        localStorage.setItem("company_name", data.name || "");
      }
      window.location.href = "/company";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  function base64url(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  const handleBiometric = async () => {
    setLoading(true);
    setError("");
    try {
      if (!window.PublicKeyCredential) {
        throw new Error(lang === "bn" ? "এই ব্রাউজার বায়োমেট্রিক সাপোর্ট করে না" : "Browser does not support biometric");
      }
      const cleanPhone = normalizePhone(phone);
      if (!cleanPhone || cleanPhone.length < 10) {
        throw new Error(lang === "bn"
          ? "ফিঙ্গারপ্রিন্ট লগইনের জন্য প্রথমে ফোন নম্বর দিন"
          : "Enter your phone number first to login with fingerprint");
      }

      // Get challenge + registered credentials for this phone
      const chalRes = await fetch("/api/auth/biometric/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "begin", phone: cleanPhone }),
      });
      if (!chalRes.ok) throw new Error(lang === "bn" ? "বায়োমেট্রিক চ্যালেঞ্জ ব্যর্থ" : "Biometric challenge failed");
      const chalData = await chalRes.json() as {
        challengeId?: string; challenge?: string; allowCredentials?: { id: string; type: string }[];
      };
      if (!chalData.challenge || !chalData.challengeId) {
        throw new Error(lang === "bn" ? "কোনো বায়োমেট্রিক ডাটা পাওয়া যায়নি" : "No biometric data found");
      }
      const b64urlToBytes = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      const challenge = b64urlToBytes(chalData.challenge);
      const allowCredentials = (chalData.allowCredentials || []).map((cred) => ({
        id: b64urlToBytes(cred.id),
        type: cred.type as PublicKeyCredentialType,
      }));
      const cred = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
          userVerification: "required",
          timeout: 60000,
        },
      }) as PublicKeyCredential;
      const authData = cred.response as AuthenticatorAssertionResponse;
      // credentialId must be the registered credential id (rawId), NOT the userHandle
      const credentialId = base64url(cred.rawId);
      const verifyRes = await fetch("/api/auth/biometric/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          challengeId: chalData.challengeId,
          credentialId,
          authenticatorData: base64url(authData.authenticatorData),
          clientDataJSON: base64url(authData.clientDataJSON),
          signature: base64url(authData.signature),
        }),
      });
      if (!verifyRes.ok) throw new Error(lang === "bn" ? "বায়োমেট্রিক যাচাই ব্যর্থ" : "Biometric verification failed");
      const verifyData = await verifyRes.json() as { token?: string; workerId?: string; name?: string };
      if (verifyData.workerId) {
        localStorage.setItem("worker_id", verifyData.workerId || "");
        localStorage.setItem("worker_name", verifyData.name || "");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Biometric login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-primary/5 to-accent/5 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl mx-auto mb-4 shadow-xl shadow-primary/20">
            {activeTab === "member" ? "\uD83D\uDE80" : "\uD83C\uDFE2"}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-primary">
            {activeTab === "member"
              ? (lang === "bn" ? "স্বাগতম" : "Welcome Back")
              : (lang === "bn" ? "কোম্পানি লগইন" : "Company Login")}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {activeTab === "member"
              ? (lang === "bn" ? "আপনার অ্যাকাউন্টে লগইন করুন" : "Login to your account")
              : (lang === "bn" ? "আপনার কোম্পানি অ্যাকাউন্টে লগইন করুন" : "Login to your company account")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-border/80 mb-4">
          <button
            onClick={() => { setActiveTab("member"); setError(""); }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "member"
                ? "bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/25"
                : "text-text-secondary hover:text-primary"
            }`}
          >
            {lang === "bn" ? "সদস্য লগইন" : "Member Login"}
          </button>
          <button
            onClick={() => { setActiveTab("company"); setError(""); }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "company"
                ? "bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/25"
                : "text-text-secondary hover:text-primary"
            }`}
          >
            {lang === "bn" ? "কোম্পানি লগইন" : "Company Login"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/5 border border-danger/20 text-sm text-danger font-medium flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Member Login Form */}
        {activeTab === "member" && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-border/80 space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                {lang === "bn" ? "ফোন নম্বর" : "Phone Number"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="০১XXX-XXXXXX"
                className="input-field"
                required
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                {lang === "bn" ? "পাসওয়ার্ড" : "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="relative">
              {loading && (
                <div className="absolute inset-0 rounded-2xl bg-white/40 backdrop-blur-[1px] z-10" />
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent to-accent-light text-white font-bold text-base shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px] relative z-20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <LoadingDots />
                    <span className="text-sm font-medium animate-loading-pulse">
                      {lang === "bn" ? "লগইন হচ্ছে..." : "Logging in..."}
                    </span>
                  </span>
                ) : (lang === "bn" ? "লগইন করুন" : "Login")}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-[#25D366]"
                />
                {lang === "bn" ? "মনে রাখুন (৩০ দিন)" : "Remember me (30 days)"}
              </label>
              <Link href="/forgot-password" className="text-xs font-bold text-accent hover:text-accent-light transition-colors">
                {lang === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
              </Link>
            </div>

            {slowWarning && (
              <div className="text-center text-xs text-text-secondary animate-loading-pulse py-1">
                {lang === "bn"
                  ? "একটু ধীর গতি হচ্ছে, দয়া করে অপেক্ষা করুন..."
                  : "Slower than usual, please wait..."}
              </div>
            )}

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs font-bold text-text-secondary bg-white">
                  {lang === "bn" ? "অথবা" : "OR"}
                </span>
              </div>
            </div>

            {/* Social & Biometric */}
            <SocialLoginButtons lang={lang} onError={setError} />

            <button
              type="button"
              onClick={handleBiometric}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-accent/30 text-sm font-bold text-accent hover:bg-accent/5 transition-all disabled:opacity-50"
            >
              <FingerprintIcon className="w-5 h-5" />
              {lang === "bn" ? "ফিঙ্গারপ্রিন্ট / ফেস আইডি" : "Fingerprint / Face ID"}
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-text-secondary pt-2">
              {lang === "bn" ? "কোনো অ্যাকাউন্ট নেই?" : "Don't have an account?"}{" "}
              <Link href="/register" className="font-bold text-accent hover:text-accent-light transition-colors">
                {lang === "bn" ? "রেজিস্টার করুন" : "Register"}
              </Link>
            </p>
          </form>
        )}

        {/* Company Login Form */}
        {activeTab === "company" && (
          <form onSubmit={handleCompanySubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-border/80 space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                {lang === "bn" ? "ইউজারনেম" : "Username"}
              </label>
              <input
                type="text"
                value={companyUsername}
                onChange={(e) => setCompanyUsername(e.target.value)}
                placeholder={lang === "bn" ? "আপনার ইউজারনেম লিখুন" : "Enter your username"}
                className="input-field"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                {lang === "bn" ? "পাসওয়ার্ড" : "Password"}
              </label>
              <div className="relative">
                <input
                  type={showCompanyPassword ? "text" : "password"}
                  value={companyPassword}
                  onChange={(e) => setCompanyPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCompanyPassword(!showCompanyPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                >
                  {showCompanyPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="relative">
              {loading && (
                <div className="absolute inset-0 rounded-2xl bg-white/40 backdrop-blur-[1px] z-10" />
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent to-accent-light text-white font-bold text-base shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px] relative z-20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <LoadingDots />
                    <span className="text-sm font-medium animate-loading-pulse">
                      {lang === "bn" ? "লগইন হচ্ছে..." : "Logging in..."}
                    </span>
                  </span>
                ) : (lang === "bn" ? "লগইন করুন" : "Login")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

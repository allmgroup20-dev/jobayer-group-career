"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { LoadingDots } from "@/components/ui/LoadingDots";

export default function CompanyLoginPage() {
  const { lang } = useLanguageStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/company-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Login failed");
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

  const handleFingerprint = async () => {
    if (!username) return alert(lang === "bn" ? "প্রথমে ইউজারনেম দিন" : "Enter username first");
    setLoading(true);
    setError("");
    try {
      const bioRes = await fetch("/api/auth/biometric/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "begin", workerId: username, userType: "company" }),
      });
      const bioData = await bioRes.json() as { error?: string; challengeId?: string; challenge?: string };
      if (!bioRes.ok) throw new Error(
        bioData.error === "No biometric credentials found"
          ? (lang === "bn" ? "ফিঙ্গারপ্রিন্ট সেটআপ করা নেই। কোম্পানি > ফিঙ্গারপ্রিন্ট থেকে সেটআপ করুন" : "No fingerprint setup. Go to Company > Fingerprint to set up")
          : (bioData.error || "Biometric auth failed")
      );
      if (!window.PublicKeyCredential) {
        throw new Error(lang === "bn" ? "এই ব্রাউজার ফিঙ্গারপ্রিন্ট সাপোর্ট করে না" : "Browser does not support fingerprint");
      }
      const { challengeId, challenge } = bioData;

      const challengeBytes = Uint8Array.from(atob(challenge!.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: challengeBytes,
          rpId: window.location.hostname,
          userVerification: "required" as UserVerificationRequirement,
        },
      })) as PublicKeyCredential;

      const resp = credential.response as any;
      const credId = base64url(credential.rawId);
      const cdJSON = btoa(String.fromCharCode(...new Uint8Array(resp.clientDataJSON)));
      const authData = btoa(String.fromCharCode(...new Uint8Array(resp.authenticatorData)));
      const sig = btoa(String.fromCharCode(...new Uint8Array(resp.signature)));

      const finishRes = await fetch("/api/auth/biometric/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          challengeId,
          credentialId: credId,
          clientDataJSON: cdJSON,
          authenticatorData: authData,
          signature: sig,
        }),
      });
      const finishData = await finishRes.json() as { error?: string; token?: string; userType?: string };
      if (!finishRes.ok) throw new Error(finishData.error || "Biometric auth failed");
      window.location.href = "/company";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Biometric login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-gray-50">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <img src="/favicon.svg" alt="Jobayer Group Career" className="w-14 h-14 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "কোম্পানি লগইন" : "Company Login"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">Jobayer Group Career</p>
        </div>

        <form onSubmit={handleSubmit} className="card shadow-xl border-0 space-y-4">
          {error && <div className="p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {lang === "bn" ? "ইউজারনেম" : "Username"}
            </label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {lang === "bn" ? "পাসওয়ার্ড" : "Password"}
            </label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field w-full pr-11" required />
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
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1 text-base !py-3.5 flex items-center justify-center gap-2 min-h-[48px]">
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingDots />
                  <span className="animate-loading-pulse">{lang === "bn" ? "লগইন হচ্ছে..." : "Logging in..."}</span>
                </span>
              ) : (lang === "bn" ? "লগইন" : "Login")}
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
          <p className="text-xs text-text-secondary text-center">
            {lang === "bn" ? "শুধুমাত্র কোম্পানি অনুমোদিত ব্যক্তির জন্য" : "For authorized company personnel only"}
          </p>
        </form>
      </div>
    </div>
  );
}

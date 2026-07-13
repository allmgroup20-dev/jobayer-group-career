"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";

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

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-gray-50">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
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
          <button type="submit" disabled={loading} className="btn-primary w-full text-base !py-3.5">
            {loading ? (lang === "bn" ? "লগইন হচ্ছে..." : "Logging in...") : (lang === "bn" ? "লগইন" : "Login")}
          </button>
          <p className="text-xs text-text-secondary text-center">
            {lang === "bn" ? "শুধুমাত্র কোম্পানি অনুমোদিত ব্যক্তির জন্য" : "For authorized company personnel only"}
          </p>
        </form>
      </div>
    </div>
  );
}

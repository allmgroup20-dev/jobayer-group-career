"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";

export default function NumberToolsPage() {
  const { lang } = useLanguageStore();
  const [numbers, setNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genCount, setGenCount] = useState(10);
  const [validatePhone, setValidatePhone] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [msg, setMsg] = useState("");

  const loadNumbers = async () => {
    try {
      const res = await fetch("/api/whatsapp/numbers?limit=100");
      const data = await res.json() as any;
      if (data.numbers) setNumbers(data.numbers);
    } catch {
      console.error("Failed to load numbers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNumbers(); }, []);

  const generate = async () => {
    setMsg("");
    try {
      const res = await fetch("/api/whatsapp/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", count: genCount }),
      });
      const data = await res.json() as any;
      setMsg(data.generated ? `Generated ${data.generated} numbers` : "Generation failed");
      loadNumbers();
    } catch {
      setMsg("Error generating numbers");
    }
  };

  const validate = async () => {
    if (!validatePhone.trim()) return;
    setValidationResult(null);
    setMsg("");
    try {
      const res = await fetch("/api/whatsapp/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate", phone: validatePhone }),
      });
      const data = await res.json() as any;
      setValidationResult(data);
    } catch {
      setValidationResult({ valid: false, message: "Error validating" });
    }
  };

  return (
    <div className="py-24 px-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          {lang === "bn" ? "নাম্বার টুলস" : "Number Tools"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lang === "bn" ? "বাংলাদেশী ফোন নাম্বার জেনারেটর ও ভ্যালিডেটর" : "BD phone number generator & validator"}
        </p>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-xl bg-action/10 text-sm text-action font-medium">{msg}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="font-bold text-base text-primary mb-4">
            {lang === "bn" ? "নাম্বার জেনারেটর" : "Number Generator"}
          </h2>
          <p className="text-xs text-text-secondary mb-3">
            {lang === "bn" ? "বাংলাদেশী প্রিফিক্স (013-019) সহ র্যান্ডম ১১ ডিজিটের নাম্বার জেনারেট করে" : "Generates random 11-digit BD numbers with prefixes 013-019"}
          </p>
          <div className="flex gap-3">
            <input
              type="number"
              min={1}
              max={100}
              value={genCount}
              onChange={(e) => setGenCount(parseInt(e.target.value) || 10)}
              className="w-24 px-3 py-2 text-sm rounded-xl border border-border bg-white text-primary"
            />
            <button onClick={generate} className="px-6 py-2 gradient-premium text-white text-sm font-medium rounded-xl">
              {lang === "bn" ? "জেনারেট" : "Generate"}
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-base text-primary mb-4">
            {lang === "bn" ? "নাম্বার ভ্যালিডেটর" : "Number Validator"}
          </h2>
          <p className="text-xs text-text-secondary mb-3">
            {lang === "bn" ? "বাংলাদেশী মোবাইল নাম্বার ভ্যালিডেট করুন (যেমন: 01712345678)" : "Validate a BD mobile number (e.g., 01712345678)"}
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="01712345678"
              value={validatePhone}
              onChange={(e) => setValidatePhone(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-white text-primary"
            />
            <button onClick={validate} className="px-6 py-2 gradient-premium text-white text-sm font-medium rounded-xl">
              {lang === "bn" ? "ভ্যালিডেট" : "Validate"}
            </button>
          </div>
          {validationResult && (
            <div className={`mt-3 p-3 rounded-xl text-sm ${validationResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {validationResult.valid ? `✅ Valid · ${validationResult.operator}` : `❌ ${validationResult.message}`}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-base text-primary mb-4">
          {lang === "bn" ? "স্ক্যান করা নাম্বারসমূহ" : "Scanned Numbers"} ({numbers.length})
        </h2>
        {loading ? (
          <div className="text-center text-sm text-text-secondary py-8">Loading...</div>
        ) : numbers.length === 0 ? (
          <div className="text-center text-sm text-text-secondary py-8">
            {lang === "bn" ? "এখনো কোনো নাম্বার জেনারেট করা হয়নি" : "No numbers generated yet"}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[500px] overflow-y-auto">
            {numbers.map((n: any) => (
              <div key={n.id || n.phone} className="px-3 py-2 rounded-lg bg-gray-50 text-xs text-primary font-mono text-center">
                {n.phone}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



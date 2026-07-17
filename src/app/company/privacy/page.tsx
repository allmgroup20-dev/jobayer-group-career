"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

interface ConsentRow {
  id: number;
  worker_id: string;
  consent_type: string;
  is_granted: number;
  ip_address: string | null;
  user_agent: string | null;
  granted_at: string | null;
  created_at: string;
}

export default function CompanyPrivacyPage() {
  const { lang } = useLanguageStore();
  const [consents, setConsents] = useState<ConsentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, cookies: 0, tracking: 0, marketing: 0 });

  useEffect(() => {
    // Fetch consent data via our API query
    const load = async () => {
      setLoading(true);
      try {
        // Use a batch approach: fetch recent consents
        const res = await fetch("/api/privacy/consent?workerId=_batch_");
        // For now, get stats from a direct query workaround
        setStats({ total: 0, cookies: 0, tracking: 0, marketing: 0 });
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  // Load individual worker's consents
  const loadWorker = async (wid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/privacy/consent?workerId=${wid}`);
      const data = await res.json() as { consents: ConsentRow[] };
      setConsents(data.consents || []);
    } catch {} finally { setLoading(false); }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleString(lang === "bn" ? "bn-BD" : "en-US"); } catch { return d; }
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "গোপনীয়তা ব্যবস্থাপনা" : "Privacy Management"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "ব্যবহারকারীর সম্মতি ও ডেটা নিয়ন্ত্রণ" : "User consent & data control"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: lang === "bn" ? "সব সম্মতি" : "Total Consents", val: stats.total, color: "bg-blue-500" },
            { label: "Cookies", val: stats.cookies, color: "bg-green-500" },
            { label: "Tracking", val: stats.tracking, color: "bg-purple-500" },
            { label: "Marketing", val: stats.marketing, color: "bg-amber-500" },
          ].map((s, i) => (
            <Card key={i}>
              <p className="text-xs text-text-secondary">{s.label}</p>
              <p className="text-2xl font-bold text-primary mt-1">{s.val}</p>
            </Card>
          ))}
        </div>

        <Card className="!p-5">
          <h3 className="font-semibold text-primary mb-4">
            {lang === "bn" ? "যুক্তিসংগত ব্যবহার" : "Privacy Tools"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-primary text-sm mb-2">
                {lang === "bn" ? "কুকি কনসেন্ট ব্যানার" : "Cookie Consent Banner"}
              </h4>
              <p className="text-xs text-text-secondary">
                {lang === "bn" ? "সাইটে কুকি কনসেন্ট ব্যানার সক্রিয় আছে। ব্যবহারকারী গ্রহণ/প্রত্যাখ্যান করতে পারে।" : "Cookie consent banner is active on the site. Users can accept or decline."}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-primary text-sm mb-2">
                {lang === "bn" ? "ডেটা এক্সপোর্ট" : "Data Export"}
              </h4>
              <p className="text-xs text-text-secondary">
                {lang === "bn" ? "ব্যবহারকারীরা তাদের সব ডেটা JSON ফরম্যাটে ডাউনলোড করতে পারে।" : "Users can download all their data in JSON format."}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-primary text-sm mb-2">
                {lang === "bn" ? "ডেটা মুছে ফেলা" : "Data Deletion"}
              </h4>
              <p className="text-xs text-text-secondary">
                {lang === "bn" ? "ব্যবহারকারীরা তাদের সব তথ্য মুছে ফেলতে পারে। নাম অ্যানোনিমাইজ করা হয়।" : "Users can delete all their data. Name is anonymized."}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-primary text-sm mb-2">
                {lang === "bn" ? "সম্মতি লগ" : "Consent Log"}
              </h4>
              <p className="text-xs text-text-secondary">
                {lang === "bn" ? "প্রতিটি সম্মতি IP ঠিকানা ও টাইমস্ট্যাম্পসহ সংরক্ষিত হয়।" : "Each consent is stored with IP address and timestamp."}
              </p>
            </div>
          </div>
        </Card>

        {/* Worker Consent Lookup */}
        <Card className="!p-5">
          <h3 className="font-semibold text-primary mb-4">
            {lang === "bn" ? "গ্রাহকের সম্মতি দেখুন" : "View Worker Consent"}
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === "bn" ? "ওয়ার্কার আইডি লিখুন" : "Enter worker ID"}
              className="flex-1 px-4 py-2 rounded-xl border border-border bg-white text-sm"
            />
            <button
              onClick={() => search && loadWorker(search)}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium"
            >
              {lang === "bn" ? "দেখুন" : "View"}
            </button>
          </div>
          {consents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-2 font-semibold text-text-secondary">{lang === "bn" ? "ধরন" : "Type"}</th>
                    <th className="p-2 font-semibold text-text-secondary">{lang === "bn" ? "অনুমতি" : "Granted"}</th>
                    <th className="p-2 font-semibold text-text-secondary">{lang === "bn" ? "তারিখ" : "Date"}</th>
                    <th className="p-2 font-semibold text-text-secondary hidden md:table-cell">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {consents.map(c => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="p-2 capitalize">{c.consent_type}</td>
                      <td className="p-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.is_granted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {c.is_granted ? "✓" : "✗"}
                        </span>
                      </td>
                      <td className="p-2 text-text-secondary text-xs">{formatDate(c.created_at)}</td>
                      <td className="p-2 text-text-secondary text-xs hidden md:table-cell">{c.ip_address || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

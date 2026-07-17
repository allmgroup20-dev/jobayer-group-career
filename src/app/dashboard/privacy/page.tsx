"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

interface Consent {
  id: number;
  consent_type: string;
  is_granted: number;
  granted_at: string | null;
  created_at: string;
}

export default function PrivacySettingsPage() {
  const { lang } = useLanguageStore();
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [message, setMessage] = useState("");

  const workerId = typeof window !== "undefined" ? localStorage.getItem("worker_id") || "" : "";

  const loadConsents = async () => {
    if (!workerId) return;
    try {
      const res = await fetch(`/api/privacy/consent?workerId=${workerId}`);
      const data = await res.json() as { consents: Consent[] };
      setConsents(data.consents || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadConsents(); }, [workerId]);

  const giveConsent = async (type: string) => {
    await fetch("/api/privacy/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId, consentType: type, isGranted: true }),
    });
    loadConsents();
    setMessage(lang === "bn" ? `${type} অনুমতি দেওয়া হয়েছে` : `${type} consent granted`);
  };

  const exportData = async () => {
    setExporting(true);
    setMessage("");
    try {
      const res = await fetch(`/api/privacy/export-data?workerId=${workerId}`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data-${workerId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage(lang === "bn" ? "ডেটা ডাউনলোড শুরু হয়েছে" : "Data download started");
    } catch {
      setMessage(lang === "bn" ? "ডেটা এক্সপোর্ট ব্যর্থ" : "Export failed");
    } finally { setExporting(false); }
  };

  const deleteData = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    setMessage("");
    try {
      const res = await fetch("/api/privacy/delete-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, confirm: true }),
      });
      if (res.ok) {
        setMessage(lang === "bn" ? "আপনার ডেটা মুছে ফেলা হয়েছে" : "Your data has been deleted");
        localStorage.removeItem("worker_token");
        localStorage.removeItem("worker_id");
        setTimeout(() => window.location.href = "/", 2000);
      }
    } catch {
      setMessage(lang === "bn" ? "মুছতে ব্যর্থ" : "Delete failed");
    } finally { setDeleting(false); }
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "গোপনীয়তা সেটিংস" : "Privacy Settings"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "আপনার ডেটা ও গোপনীয়তা নিয়ন্ত্রণ করুন" : "Control your data and privacy"}
          </p>
        </div>

        {message && (
          <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700">{message}</div>
        )}

        {/* Cookie & Tracking Consent */}
        <Card className="!p-5">
          <h3 className="font-semibold text-primary mb-4">
            {lang === "bn" ? "কুকি ও ট্র্যাকিং সম্মতি" : "Cookie & Tracking Consent"}
          </h3>
          <div className="space-y-3">
            {[["cookies", lang === "bn" ? "কুকি (ব্রাউজিং ডেটা)" : "Cookies (browsing data)"],
              ["tracking", lang === "bn" ? "ব্যবহার ট্র্যাকিং" : "Usage tracking"],
              ["marketing", lang === "bn" ? "মার্কেটিং ইমেইল" : "Marketing emails"],
            ].map(([type, label]) => {
              const consented = consents.find(c => c.consent_type === type);
              return (
                <div key={type} className="flex items-center justify-between py-2">
                  <span className="text-sm text-primary">{label}</span>
                  {consented ? (
                    <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {lang === "bn" ? "সম্মতি দেওয়া হয়েছে" : "Consented"}
                    </span>
                  ) : (
                    <button
                      onClick={() => giveConsent(type)}
                      className="text-xs px-3 py-1 rounded-full bg-primary text-white hover:bg-primary/90"
                    >
                      {lang === "bn" ? "সম্মতি দিন" : "Give Consent"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Data Export */}
        <Card className="!p-5">
          <h3 className="font-semibold text-primary mb-2">
            {lang === "bn" ? "আমার ডেটা ডাউনলোড" : "Download My Data"}
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            {lang === "bn" ? "আপনার সব তথ্য JSON ফরম্যাটে ডাউনলোড করুন (ইভেন্ট, সেশন, সার্চ, অর্ডার, রিভিউ, ডিভাইস, যোগাযোগ)" : "Download all your data as JSON (events, sessions, searches, orders, reviews, devices, communications)"}
          </p>
          <button
            onClick={exportData}
            disabled={exporting}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {exporting ? (lang === "bn" ? "ডাউনলোড হচ্ছে..." : "Downloading...") : lang === "bn" ? "📥 আমার ডেটা ডাউনলোড" : "📥 Download My Data"}
          </button>
        </Card>

        {/* Data Deletion */}
        <Card className="!p-5 border-red-200">
          <h3 className="font-semibold text-red-600 mb-2">
            {lang === "bn" ? "আমার ডেটা মুছে ফেলুন" : "Delete My Data"}
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            {lang === "bn"
              ? "এটি আপনার সব ব্যক্তিগত তথ্য মুছে ফেলবে এবং আপনাকে লগআউট করবে। এই কাজ অপরিবর্তনীয়।"
              : "This will delete all your personal data and log you out. This action is irreversible."}
          </p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={lang === "bn" ? 'নিশ্চিত করতে "DELETE" লিখুন' : 'Type "DELETE" to confirm'}
              className="flex-1 px-4 py-2 rounded-xl border border-red-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <button
              onClick={deleteData}
              disabled={deleteConfirm !== "DELETE" || deleting}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? (lang === "bn" ? "মুছছে..." : "Deleting...") : lang === "bn" ? "মুছুন" : "Delete"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

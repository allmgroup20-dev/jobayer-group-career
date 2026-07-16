"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { lang } = useLanguageStore();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", workerId: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const workerId = localStorage.getItem("worker_id");
    if (!workerId) { setLoading(false); return; }
    fetch(`/api/workers/profile?workerId=${workerId}`)
      .then((r) => r.json() as Promise<{ workerId?: string; name?: string; phone?: string; email?: string }>)
      .then((data) => {
        if (data.workerId) {
          setForm({ name: data.name || "", phone: data.phone || "", email: data.email || "", password: "", workerId: data.workerId });
        }
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const body: Record<string, string> = { workerId: form.workerId };
    if (form.name) body.name = form.name;
    if (form.email !== undefined) body.email = form.email;
    if (form.password) body.password = form.password;
    try {
      const res = await fetch("/api/workers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setForm((p) => ({ ...p, password: "" }));
    } catch {
      setError(lang === "bn" ? "আপডেট ব্যর্থ" : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 px-4 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-action border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-8">{lang === "bn" ? "প্রোফাইল" : "Profile"}</h1>

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
            {form.name ? form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
          </div>
          <h2 className="font-bold text-xl text-primary">{form.name}</h2>
          <p className="text-sm text-text-secondary">{form.workerId}</p>
        </div>

        <Card>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "নাম" : "Name"}</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ফোন" : "Phone"}</label>
              <input type="tel" value={form.phone} className="input-field bg-gray-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
              <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder={lang === "bn" ? "ফাঁকা রাখলে অপরিবর্তিত" : "Leave blank to keep current"} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (lang === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving...") : saved ? (lang === "bn" ? "✓ সংরক্ষিত" : "✓ Saved") : (lang === "bn" ? "আপডেট করুন" : "Update Profile")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
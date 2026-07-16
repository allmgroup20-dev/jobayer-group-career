"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Channel {
  id: string;
  label: string;
  labelBn: string;
  enabled: boolean;
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: "bkash", label: "bKash", labelBn: "বিকাশ", enabled: true },
  { id: "nagad", label: "Nagad", labelBn: "নগদ", enabled: true },
  { id: "rocket", label: "Rocket", labelBn: "রকেট", enabled: true },
  { id: "bank", label: "Bank", labelBn: "ব্যাংক", enabled: false },
];

export default function CompanySettingsPage() {
  const { lang } = useLanguageStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    minWithdrawal: "500",
    registrationBonus: "0",
    primaryColor: "#1E3A5A",
    secondaryColor: "#FFD700",
    actionColor: "#28A745",
  });
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);

  useEffect(() => {
    fetch("/api/company/settings")
      .then((r) => r.json() as Promise<{ settings?: Record<string, string> }>)
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setForm((prev) => ({
            ...prev,
            companyName: s.company_name || prev.companyName,
            companyEmail: s.company_email || prev.companyEmail,
            companyPhone: s.company_phone || prev.companyPhone,
            companyAddress: s.company_address || prev.companyAddress,
            minWithdrawal: s.min_withdrawal || prev.minWithdrawal,
            registrationBonus: s.registration_bonus || prev.registrationBonus,
            primaryColor: s.primary_color || prev.primaryColor,
            secondaryColor: s.secondary_color || prev.secondaryColor,
            actionColor: s.action_color || prev.actionColor,
          }));
          try {
            const bc = (s as any).banking_channels ? JSON.parse((s as any).banking_channels) : null;
            if (bc && Array.isArray(bc)) setChannels(bc);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const settings = [
      { key: "company_name", value: form.companyName },
      { key: "company_email", value: form.companyEmail },
      { key: "company_phone", value: form.companyPhone },
      { key: "company_address", value: form.companyAddress },
      { key: "min_withdrawal", value: form.minWithdrawal },
      { key: "registration_bonus", value: form.registrationBonus },
      { key: "primary_color", value: form.primaryColor },
      { key: "secondary_color", value: form.secondaryColor },
      { key: "action_color", value: form.actionColor },
      { key: "banking_channels", value: JSON.stringify(channels) },
    ];
    try {
      await fetch("/api/company/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert(lang === "bn" ? "সেভ ব্যর্থ" : "Save failed");
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
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "সেটিংস" : "Settings"}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "কোম্পানি সেটিংস কনফিগার করুন" : "Configure company settings"}
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "কোম্পানি তথ্য" : "Company Info"}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "কোম্পানির নাম" : "Company Name"}</label>
                <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ইমেইল" : "Email"}</label>
                <input type="email" value={form.companyEmail} onChange={(e) => setForm({ ...form, companyEmail: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ফোন" : "Phone"}</label>
                <input type="text" value={form.companyPhone} onChange={(e) => setForm({ ...form, companyPhone: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ঠিকানা" : "Address"}</label>
                <input type="text" value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} className="input-field" />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "ফাইন্যান্স" : "Finance"}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ন্যূনতম উইথড্র" : "Min Withdrawal"} (৳)</label>
                <input type="number" value={form.minWithdrawal} onChange={(e) => setForm({ ...form, minWithdrawal: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "রেজিস্ট্রেশন বোনাস" : "Registration Bonus"} (৳)</label>
                <input type="number" value={form.registrationBonus} onChange={(e) => setForm({ ...form, registrationBonus: e.target.value })} className="input-field" />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-4">
              {lang === "bn" ? "ব্যাংকিং চ্যানেল" : "Banking Channels"}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {lang === "bn"
                ? "কোন চ্যানেল সক্রিয় রাখলে তা ইউজার ড্যাশবোর্ডে উইথড্র অপশন হিসেবে দেখাবে"
                : "Active channels will appear as withdrawal options in user dashboard"}
            </p>
            <div className="space-y-3">
              {channels.map((ch) => (
                <div key={ch.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-primary">
                    {lang === "bn" ? ch.labelBn : ch.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleChannel(ch.id)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      ch.enabled ? "bg-action" : "bg-gray-300"
                    }`}
                  >
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all shadow-sm ${
                      ch.enabled ? "left-6" : "left-0.5"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "থিম কালার" : "Theme Colors"}</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "প্রাইমারি" : "Primary"}</label>
                <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "সেকেন্ডারি" : "Secondary"}</label>
                <input type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "একশন" : "Action"}</label>
                <input type="color" value={form.actionColor} onChange={(e) => setForm({ ...form, actionColor: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer" />
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full !py-4">
            {saving ? (lang === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving...") : saved ? (lang === "bn" ? "✓ সংরক্ষিত হয়েছে" : "✓ Saved") : (lang === "bn" ? "সব সেভ করুন" : "Save All Settings")}
          </Button>
        </div>
      </div>
    </div>
  );
}
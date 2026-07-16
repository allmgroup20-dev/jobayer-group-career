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
  status?: "active" | "paused";
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: "bkash", label: "bKash", labelBn: "বিকাশ", enabled: true, status: "active" },
  { id: "nagad", label: "Nagad", labelBn: "নগদ", enabled: true, status: "active" },
  { id: "rocket", label: "Rocket", labelBn: "রকেট", enabled: true, status: "active" },
  { id: "bank", label: "Bank", labelBn: "ব্যাংক", enabled: false, status: "active" },
];

const WEEKDAYS = [
  { id: 0, en: "Sunday", bn: "রবিবার" },
  { id: 1, en: "Monday", bn: "সোমবার" },
  { id: 2, en: "Tuesday", bn: "মঙ্গলবার" },
  { id: 3, en: "Wednesday", bn: "বুধবার" },
  { id: 4, en: "Thursday", bn: "বৃহস্পতিবার" },
  { id: 5, en: "Friday", bn: "শুক্রবার" },
  { id: 6, en: "Saturday", bn: "শনিবার" },
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

  // Payment schedule state
  const [intervalDays, setIntervalDays] = useState(7);
  const [dayOfWeek, setDayOfWeek] = useState(5);
  const [systemActive, setSystemActive] = useState(true);
  const [nextPaymentDate, setNextPaymentDate] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/company/settings").then((r) => r.json() as Promise<{ settings?: Record<string, string> }>),
      fetch("/api/company/payment-schedule").then((r) => r.json()).catch(() => ({})),
    ]).then(([data, schedule]: [any, any]) => {
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
      if (schedule && typeof schedule.intervalDays === "number") {
        setIntervalDays(schedule.intervalDays as number);
        setDayOfWeek(schedule.dayOfWeek as number);
        setSystemActive(schedule.systemActive as boolean);
        setNextPaymentDate((schedule.nextPaymentDate as string) || "");
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch))
    );
  };

  const toggleChannelStatus = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === id
          ? { ...ch, status: ch.status === "paused" ? "active" : "paused" as "active" | "paused" }
          : ch
      )
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
      await Promise.all([
        fetch("/api/company/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings }),
        }),
        fetch("/api/company/payment-schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intervalDays, dayOfWeek, systemActive }),
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Refresh next payment date
      fetch("/api/company/payment-schedule").then((r) => r.json()).then((d: any) => {
        if (d.nextPaymentDate) setNextPaymentDate(d.nextPaymentDate);
      }).catch(() => {});
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
              {lang === "bn" ? "পেমেন্ট শিডিউল" : "Payment Schedule"}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-primary">
                  {lang === "bn" ? "পেমেন্ট সিস্টেম" : "Payment System"}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSystemActive(true)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      systemActive ? "bg-action text-white" : "bg-gray-200 text-text-secondary"
                    }`}
                  >
                    {lang === "bn" ? "সক্রিয়" : "Active"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSystemActive(false)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      !systemActive ? "bg-red-500 text-white" : "bg-gray-200 text-text-secondary"
                    }`}
                  >
                    {lang === "bn" ? "নিষ্ক্রিয়" : "Disabled"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {lang === "bn" ? "পেমেন্ট Interval (দিন)" : "Payment Interval (Days)"}
                </label>
                <select
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(parseInt(e.target.value))}
                  className="input-field"
                >
                  {[1, 3, 7, 14, 15, 30].map((d) => (
                    <option key={d} value={d}>{d} {lang === "bn" ? "দিন" : "days"}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {lang === "bn" ? "পেমেন্টের দিন" : "Payment Day of Week"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((wd) => (
                    <button
                      key={wd.id}
                      type="button"
                      onClick={() => setDayOfWeek(wd.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        dayOfWeek === wd.id
                          ? "border-action bg-action/10 text-action"
                          : "border-border text-text-secondary hover:border-action/50"
                      }`}
                    >
                      {lang === "bn" ? wd.bn : wd.en}
                    </button>
                  ))}
                </div>
              </div>

              {nextPaymentDate && (
                <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  {lang === "bn"
                    ? `পরবর্তী পেমেন্ট: ${new Date(nextPaymentDate).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}`
                    : `Next Payment: ${new Date(nextPaymentDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-4">
              {lang === "bn" ? "ব্যাংকিং চ্যানেল" : "Banking Channels"}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {lang === "bn"
                ? "সক্রিয় চ্যানেল ইউজার ড্যাশবোর্ডে দেখাবে, সাময়িক বন্ধ চ্যানেল গ্রে আউট থাকবে"
                : "Active channels appear in dashboard, paused channels are grayed out"}
            </p>
            <div className="space-y-3">
              {channels.map((ch) => (
                <div key={ch.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
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
                    <span className="text-sm font-medium text-primary">
                      {lang === "bn" ? ch.labelBn : ch.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => toggleChannelStatus(ch.id)}
                      disabled={!ch.enabled}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        !ch.enabled
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : ch.status === "paused"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {ch.status === "paused"
                        ? (lang === "bn" ? "সাময়িক বন্ধ" : "Paused")
                        : (lang === "bn" ? "চালু" : "Active")}
                    </button>
                  </div>
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

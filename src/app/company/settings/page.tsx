"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

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
    registrationBonus: "0",
    resourceIncomeEnabled: "1",
    resourceIncomeDefaultAmount: "50",
    resourceUnlockPrice: "99",
    referralRedirectPath: "/register",
    generalMemberWithdrawalTax: "5",
    primaryColor: "#0F1E36",
    secondaryColor: "#FFC107",
    actionColor: "#10B981",
    timezone: "Asia/Dhaka",
  });

  useEffect(() => {
    fetch("/api/company/settings").then((r) => r.json() as Promise<{ settings?: Record<string, string> }>)
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setForm((prev) => ({
            ...prev,
            companyName: s.company_name || prev.companyName,
            companyEmail: s.company_email || prev.companyEmail,
            companyPhone: s.company_phone || prev.companyPhone,
            companyAddress: s.company_address || prev.companyAddress,
            registrationBonus: s.registration_bonus || prev.registrationBonus,
            resourceIncomeEnabled: s.resource_income_enabled || prev.resourceIncomeEnabled,
            resourceIncomeDefaultAmount: s.resource_income_default_amount || prev.resourceIncomeDefaultAmount,
            resourceUnlockPrice: s.resource_unlock_price || prev.resourceUnlockPrice,
            referralRedirectPath: s.referral_redirect_path || prev.referralRedirectPath,
            generalMemberWithdrawalTax: s.general_member_withdrawal_tax_percent || prev.generalMemberWithdrawalTax,
            primaryColor: s.primary_color || prev.primaryColor,
            secondaryColor: s.secondary_color || prev.secondaryColor,
            actionColor: s.action_color || prev.actionColor,
          }));
        }
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const settings = [
      { key: "company_name", value: form.companyName },
      { key: "company_email", value: form.companyEmail },
      { key: "company_phone", value: form.companyPhone },
      { key: "company_address", value: form.companyAddress },
      { key: "registration_bonus", value: form.registrationBonus },
      { key: "resource_income_enabled", value: form.resourceIncomeEnabled },
      { key: "resource_income_default_amount", value: form.resourceIncomeDefaultAmount },
      { key: "resource_unlock_price", value: form.resourceUnlockPrice },
      { key: "referral_redirect_path", value: form.referralRedirectPath },
      { key: "general_member_withdrawal_tax_percent", value: form.generalMemberWithdrawalTax },
      { key: "primary_color", value: form.primaryColor },
      { key: "secondary_color", value: form.secondaryColor },
      { key: "action_color", value: form.actionColor },
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
        <Skeleton className="w-8 h-8 rounded-full" />
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
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "রেজিস্ট্রেশন রিসোর্স আয়" : "Registration Resource Income"}</h3>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "পরিমাণ" : "Amount"} (৳)</label>
              <input type="number" value={form.registrationBonus} onChange={(e) => setForm({ ...form, registrationBonus: e.target.value })} className="input-field" />
              <p className="text-xs text-text-secondary/60 mt-1">{lang === "bn" ? "নতুন রেজিস্ট্রেশনে এই পরিমাণ রিসোর্স আয় হিসেবে যোগ হবে" : "This amount is added as resource income on new registration"}</p>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-4">🔗 {lang === "bn" ? "রেফারেল সেটিংস" : "Referral Settings"}</h3>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "রিডাইরেক্ট পাথ" : "Redirect Path"}</label>
              <input type="text" value={form.referralRedirectPath} onChange={(e) => setForm({ ...form, referralRedirectPath: e.target.value })} className="input-field" placeholder="/register" />
              <p className="text-xs text-text-secondary/60 mt-1">{lang === "bn" ? "রেফারেল লিংকে ইউজারকে কোথায় রিডাইরেক্ট করা হবে। যেমন: /register, /courses, /promo" : "Where users are redirected via referral link. E.g.: /register, /courses, /promo"}</p>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-4">💳 {lang === "bn" ? "উইথড্র ট্যাক্স" : "Withdrawal Tax"}</h3>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "সাধারণ মেম্বারের জন্য ট্যাক্স (%)" : "General Member Tax (%)"}</label>
              <input type="number" min="0" max="100" step="0.5" value={form.generalMemberWithdrawalTax} onChange={(e) => setForm({ ...form, generalMemberWithdrawalTax: e.target.value })} className="input-field" />
              <p className="text-xs text-text-secondary/60 mt-1">{lang === "bn" ? "সাধারণ মেম্বার উত্তোলনে এই পরিমাণ ট্যাক্স কাটা হবে। প্রিমিয়াম মেম্বারদের জন্য কোনো ট্যাক্স নেই।" : "This tax % is deducted from general member withdrawals. Premium members pay no tax."}</p>
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

          <Card>
            <h3 className="font-bold text-primary mb-4">💰 {lang === "bn" ? "রিসোর্স আয়" : "Resource Income"}</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "সক্রিয়" : "Enabled"}</label>
                <select value={form.resourceIncomeEnabled} onChange={(e) => setForm({ ...form, resourceIncomeEnabled: e.target.value })} className="input-field">
                  <option value="1">{lang === "bn" ? "সক্রিয়" : "Enabled"}</option>
                  <option value="0">{lang === "bn" ? "নিষ্ক্রিয়" : "Disabled"}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ডিফল্ট অ্যামাউন্ট" : "Default Amount"}</label>
                <input type="number" min="0" value={form.resourceIncomeDefaultAmount} onChange={(e) => setForm({ ...form, resourceIncomeDefaultAmount: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "আনলক প্রাইস" : "Unlock Price"}</label>
                <input type="number" min="1" value={form.resourceUnlockPrice} onChange={(e) => setForm({ ...form, resourceUnlockPrice: e.target.value })} className="input-field" />
              </div>
            </div>
            <p className="text-xs text-text-secondary/60 mt-2">{lang === "bn" ? "রেজিস্ট্রেশন ও অন্যান্য বোনাস এখন 'রিসোর্স আয়' হিসেবে যোগ হবে। প্রতি সেট করা মূল্যে ইউজার একটি প্রিমিয়াম রিসোর্স আনলক করতে পারবে। এই আয় উত্তোলন করা যাবে না।" : "Registration and other bonuses are now awarded as 'Resource Income'. Users can unlock one premium resource at the set price. This income cannot be withdrawn."}</p>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full !py-4">
            {saving ? (lang === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving...") : saved ? (lang === "bn" ? "✓ সংরক্ষিত হয়েছে" : "✓ Saved") : (lang === "bn" ? "সব সেভ করুন" : "Save All Settings")}
          </Button>
        </div>
      </div>
    </div>
  );
}

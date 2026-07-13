"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CompanySettingsPage() {
  const { lang } = useLanguageStore();
  const [form, setForm] = useState({
    companyName: "Jobayer Group Career",
    companyEmail: "info@jobayergroup.com",
    companyPhone: "+880 1XXX-XXXXXX",
    companyAddress: "Dhaka, Bangladesh",
    minWithdrawal: "500",
    registrationBonus: "0",
    primaryColor: "#1E3A5A",
    secondaryColor: "#FFD700",
    actionColor: "#28A745",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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

          <Button onClick={handleSave} className="w-full !py-4">
            {saved ? (lang === "bn" ? "✓ সংরক্ষিত হয়েছে" : "✓ Saved") : (lang === "bn" ? "সব সেভ করুন" : "Save All Settings")}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { lang } = useLanguageStore();
  const [form, setForm] = useState({ name: "Rahim Molla", phone: "01712345678", email: "rahim@example.com", password: "" });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-8">{lang === "bn" ? "প্রোফাইল" : "Profile"}</h1>

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">RM</div>
          <h2 className="font-bold text-xl text-primary">{form.name}</h2>
          <p className="text-sm text-text-secondary">JGRH1234</p>
        </div>

        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "নাম" : "Name"}</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ফোন" : "Phone"}</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="••••••••" />
            </div>
            <Button onClick={handleSave} className="w-full">
              {saved ? (lang === "bn" ? "✓ সংরক্ষিত" : "✓ Saved") : (lang === "bn" ? "আপডেট করুন" : "Update Profile")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

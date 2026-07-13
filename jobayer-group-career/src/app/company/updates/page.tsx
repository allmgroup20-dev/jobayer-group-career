"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function CompanyUpdatesPage() {
  const { lang } = useLanguageStore();
  const [version, setVersion] = useState("1.0.0");
  const [desc, setDesc] = useState("");

  const updates = [
    { version: "1.0.0", desc: "Initial release with MLM, e-commerce, and WhatsApp automation", date: "2026-07-01", status: "active" },
    { version: "0.9.0", desc: "Beta testing phase", date: "2026-06-15", status: "superseded" },
  ];

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "আপডেট" : "Updates"}</h1>
          <p className="text-sm text-text-secondary mt-1">{lang === "bn" ? "সিস্টেম আপডেট ম্যানেজ করুন" : "Manage system updates"}</p>
        </div>

        <Card className="mb-6">
          <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "নতুন আপডেট" : "New Update"}</h3>
          <div className="flex gap-3 mb-3">
            <input type="text" placeholder={lang === "bn" ? "ভার্সন" : "Version"} value={version} onChange={(e) => setVersion(e.target.value)} className="input-field w-32" />
            <input type="text" placeholder={lang === "bn" ? "বিবরণ" : "Description"} value={desc} onChange={(e) => setDesc(e.target.value)} className="input-field flex-1" />
          </div>
          <Button>{lang === "bn" ? "আপডেট প্রকাশ করুন" : "Publish Update"}</Button>
        </Card>

        <div className="space-y-3">
          {updates.map((u) => (
            <Card key={u.version} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">{u.version}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-primary">{u.desc}</p>
                <p className="text-xs text-text-secondary">{formatDate(u.date)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-action/10 text-action' : 'bg-gray-100 text-text-secondary'}`}>
                {u.status === 'active' ? (lang === "bn" ? 'সক্রিয়' : 'Active') : (lang === "bn" ? 'পুরনো' : 'Old')}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

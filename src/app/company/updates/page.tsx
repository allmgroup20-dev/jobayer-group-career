"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface UpdateRow {
  id: number;
  version: string;
  description: string | null;
  released_at: string | null;
  status: string;
}

export default function CompanyUpdatesPage() {
  const { lang } = useLanguageStore();
  const [version, setVersion] = useState("1.0.0");
  const [desc, setDesc] = useState("");
  const [updates, setUpdates] = useState<UpdateRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/updates")
      .then(r => r.json().catch(() => null))
      .then(d => { if (d && Array.isArray((d as { updates?: UpdateRow[] }).updates)) setUpdates((d as { updates: UpdateRow[] }).updates); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const publish = async () => {
    if (!version.trim()) return;
    await fetch("/api/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: version.trim(), description: desc }),
    });
    setVersion("1.0.0");
    setDesc("");
    load();
  };

  const remove = async (id: number) => {
    await fetch("/api/updates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

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
          <Button onClick={publish}>{lang === "bn" ? "আপডেট প্রকাশ করুন" : "Publish Update"}</Button>
        </Card>

        {loading ? (
          <Card><p className="text-center text-sm text-text-secondary py-6">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p></Card>
        ) : updates.length === 0 ? (
          <Card><p className="text-center text-sm text-text-secondary py-6">{lang === "bn" ? "কোনো আপডেট নেই" : "No updates yet"}</p></Card>
        ) : (
          <div className="space-y-3">
            {updates.map((u) => (
              <Card key={u.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">{u.version}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-primary">{u.description}</p>
                  <p className="text-xs text-text-secondary">{u.released_at ? formatDate(u.released_at) : ""}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-action/10 text-action' : 'bg-gray-100 text-text-secondary'}`}>
                  {u.status === 'active' ? (lang === "bn" ? 'সক্রিয়' : 'Active') : (lang === "bn" ? 'পুরনো' : 'Old')}
                </span>
                <Button size="sm" variant="ghost" onClick={() => remove(u.id)}>🗑</Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
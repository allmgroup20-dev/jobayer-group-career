"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";

export default function WhatsAppContactsPage() {
  const { lang } = useLanguageStore();
  const [contacts, setContacts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [importText, setImportText] = useState("");
  const [msg, setMsg] = useState("");

  const loadContacts = async (status = "", q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q) params.set("search", q);
      params.set("limit", "100");
      const res = await fetch(`/api/whatsapp/contacts?${params}`);
      const data = await res.json() as { contacts?: any[]; total?: number };
      if (data.contacts) setContacts(data.contacts);
      if (data.total !== undefined) setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContacts(); }, []);

  const handleImport = async () => {
    const lines = importText.trim().split("\n").filter(Boolean);
    const list = lines.map((l) => {
      const parts = l.split(",");
      return { phone: parts[0].trim(), name: parts[1]?.trim() || undefined };
    });
    const res = await fetch("/api/whatsapp/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ import: list, source: "import" }),
    });
    const data = await res.json() as { imported?: number };
    setMsg(data.imported ? `${data.imported} contacts imported` : "Import failed");
    setImportText("");
    loadContacts();
  };

  const statuses = ["", "pending", "contacted", "replied", "converted", "blocked"];

  return (
    <div className="py-24 px-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          {lang === "bn" ? "কন্ট্যাক্ট" : "Contacts"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">{total} {lang === "bn" ? "টি কন্ট্যাক্ট" : "contacts"}</p>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-xl bg-action/10 text-sm text-action font-medium">{msg}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-2">
          <div className="flex gap-2 mb-4 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => { setFilter(s); loadContacts(s, search); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors ${filter === s ? "gradient-premium text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"}`}
              >
                {s || (lang === "bn" ? "সব" : "All")}
              </button>
            ))}
            <input
              type="text"
              placeholder={lang === "bn" ? "খুঁজুন..." : "Search..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadContacts(filter, search)}
              className="ml-auto px-3 py-1.5 text-xs rounded-xl border border-border bg-white text-primary"
            />
          </div>

          {loading ? (
            <div className="text-center text-sm text-text-secondary py-12">Loading...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center text-sm text-text-secondary py-12">
              {lang === "bn" ? "কোনো কন্ট্যাক্ট নেই" : "No contacts yet"}
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {contacts.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                  <div>
                    <div className="text-sm font-medium text-primary">{c.phone}</div>
                    <div className="text-xs text-text-secondary">{c.name || "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      c.status === "replied" ? "bg-green-50 text-green-700" :
                      c.status === "contacted" ? "bg-blue-50 text-blue-700" :
                      c.status === "converted" ? "bg-purple-50 text-purple-700" :
                      c.status === "blocked" ? "bg-red-50 text-red-600" :
                      "bg-gray-50 text-gray-600"
                    }`}>{c.status}</span>
                    <span className="text-xs text-text-secondary">Score: {c.priority_score}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-sm text-primary mb-3">
            {lang === "bn" ? "ইম্পোর্ট কন্ট্যাক্ট" : "Import Contacts"}
          </h3>
          <p className="text-xs text-text-secondary mb-3">
            {lang === "bn" ? "প্রতি লাইনে একটি ফোন নাম্বার দিন। নাম যোগ করতে কমা ব্যবহার করুন:" : "One phone per line. Use comma for name:"}<br />
            <code className="text-primary">01712345678, Rajib</code>
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-white text-primary resize-none"
            placeholder="01712345678&#10;01898765432, Sajib"
          />
          <button onClick={handleImport} disabled={!importText.trim()} className="mt-3 w-full px-4 py-2 gradient-premium text-white text-sm font-medium rounded-xl disabled:opacity-50">
            {lang === "bn" ? "ইম্পোর্ট" : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}


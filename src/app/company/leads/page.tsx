"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { useSWRFetch } from "@/lib/use-swr-fetch";
import { Skeleton } from "@/components/ui/Skeleton";

interface Lead {
  id: number;
  phone: string;
  name: string | null;
  status: string;
  priorityScore: number;
  source: string | null;
  genderGuess: string | null;
  ageGroupGuess: string | null;
  sector: string | null;
  language: string;
  painPoints: string | null;
  interests: string | null;
  totalChats: number;
  lastChatAt: string | null;
  notes: string | null;
  createdAt: string;
}

interface LeadStats {
  total: number; new: number; contacted: number;
  replied: number; converted: number; blocked: number;
  highPriority: number;
}

const STATUSES = ["new", "contacted", "replied", "converted", "blocked"];

export default function LeadsPage() {
  const { lang } = useLanguageStore();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<{ phone: string; status: string; notes: string } | null>(null);
  const perPage = 20;

  const leadsUrl = `/api/leads?limit=${perPage}&offset=${page * perPage}${filter ? `&status=${filter}` : ""}`;
  const { data: leadsData, loading, refresh: refreshLeads } = useSWRFetch<{ leads?: Lead[] }>(
    leadsUrl,
    { ttlMs: 180_000 }
  );
  const leads = leadsData?.leads ?? [];

  const { data: statsData, refresh: refreshStats } = useSWRFetch<LeadStats>(
    "/api/leads?stats=true",
    { ttlMs: 300_000 }
  );
  const stats = statsData ?? null;

  async function updateLead(phone: string, status: string, notes: string) {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, status, notes }),
    });
    setEditing(null);
    refreshLeads();
    refreshStats();
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "লিড ম্যানেজমেন্ট" : "Lead Management"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "WhatsApp লিড ট্র্যাকিং ও ম্যানেজমেন্ট" : "WhatsApp lead tracking & management"}
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {[
              { label: "Total", value: stats.total, color: "text-primary" },
              { label: "New", value: stats.new, color: "text-blue-600" },
              { label: "Contacted", value: stats.contacted, color: "text-amber-600" },
              { label: "Replied", value: stats.replied, color: "text-purple-600" },
              { label: "Converted", value: stats.converted, color: "text-green-600" },
              { label: "Blocked", value: stats.blocked, color: "text-red-600" },
              { label: "High Priority", value: stats.highPriority, color: "text-orange-600" },
            ].map((s) => (
              <div key={s.label} className="card p-3 text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-text-secondary">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => { setFilter(""); setPage(0); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filter ? "bg-primary text-white" : "bg-white text-text-secondary hover:bg-primary/10"}`}>
            {lang === "bn" ? "সব" : "All"}
          </button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => { setFilter(s); setPage(0); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? "bg-primary text-white" : "bg-white text-text-secondary hover:bg-primary/10"}`}>
              {s}
            </button>
          ))}
          <button onClick={() => { refreshLeads(); refreshStats(); }} className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-text-secondary hover:bg-primary/10">
            {lang === "bn" ? "রিফ্রেশ" : "Refresh"} ↻
          </button>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-secondary text-xs uppercase tracking-wider">
                <th className="p-3 font-medium">{lang === "bn" ? "ফোন" : "Phone"}</th>
                <th className="p-3 font-medium">{lang === "bn" ? "নাম" : "Name"}</th>
                <th className="p-3 font-medium">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                <th className="p-3 font-medium">{lang === "bn" ? "প্রায়োরিটি" : "Priority"}</th>
                <th className="p-3 font-medium">{lang === "bn" ? "সোর্স" : "Source"}</th>
                <th className="p-3 font-medium">{lang === "bn" ? "চ্যাট" : "Chats"}</th>
                <th className="p-3 font-medium">{lang === "bn" ? "সেক্টর" : "Sector"}</th>
                <th className="p-3 font-medium">{lang === "bn" ? "পেইন পয়েন্ট" : "Pain Points"}</th>
                <th className="p-3 font-medium">{lang === "bn" ? "লাস্ট চ্যাট" : "Last Chat"}</th>
                <th className="p-3 font-medium">{lang === "bn" ? "অ্যাকশন" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && !loading && (
                <tr><td colSpan={10} className="p-6 text-center text-text-secondary">{lang === "bn" ? "কোনো লিড নেই" : "No leads found"}</td></tr>
              )}
              {loading && (
                <tr><td colSpan={10} className="p-6 text-center"><Skeleton className="h-4 w-32 mx-auto" /></td></tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-primary/5">
                  <td className="p-3 font-mono text-xs">{lead.phone}</td>
                  <td className="p-3 font-medium">{lead.name || "—"}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      lead.status === "new" ? "bg-blue-100 text-blue-700" :
                      lead.status === "contacted" ? "bg-amber-100 text-amber-700" :
                      lead.status === "replied" ? "bg-purple-100 text-purple-700" :
                      lead.status === "converted" ? "bg-green-100 text-green-700" :
                      lead.status === "blocked" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                    }`}>{lead.status}</span>
                  </td>
                  <td className="p-3">
                    <span className={`font-bold ${lead.priorityScore >= 5 ? "text-red-600" : lead.priorityScore >= 3 ? "text-amber-600" : "text-text-secondary"}`}>
                      {lead.priorityScore}
                    </span>
                  </td>
                  <td className="p-3 text-xs">{lead.source || "—"}</td>
                  <td className="p-3">{lead.totalChats}</td>
                  <td className="p-3 text-xs">{lead.sector || "—"}</td>
                  <td className="p-3 text-xs max-w-[150px] truncate">{lead.painPoints || "—"}</td>
                  <td className="p-3 text-xs text-text-secondary">{lead.lastChatAt ? new Date(lead.lastChatAt).toLocaleDateString() : "—"}</td>
                  <td className="p-3">
                    <button onClick={() => setEditing({ phone: lead.phone, status: lead.status, notes: lead.notes || "" })} className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20">
                      {lang === "bn" ? "এডিট" : "Edit"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-medium bg-white border border-border rounded-lg disabled:opacity-30 hover:bg-primary/5">
            ← {lang === "bn" ? "পূর্ববর্তী" : "Previous"}
          </button>
          <span className="text-xs text-text-secondary">{lang === "bn" ? "পাতা" : "Page"} {page + 1}</span>
          <button disabled={leads.length < perPage} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-medium bg-white border border-border rounded-lg disabled:opacity-30 hover:bg-primary/5">
            {lang === "bn" ? "পরবর্তী" : "Next"} →
          </button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary mb-4">
              {lang === "bn" ? "লিড আপডেট" : "Update Lead"}
            </h3>
            <p className="text-xs text-text-secondary mb-4 font-mono">{editing.phone}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white">
                  {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">{lang === "bn" ? "নোটস" : "Notes"}</label>
                <textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="flex-1 px-4 py-2 text-sm font-medium bg-gray-100 text-text-secondary rounded-xl hover:bg-gray-200">
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button onClick={() => updateLead(editing.phone, editing.status, editing.notes)} className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90">
                  {lang === "bn" ? "সেভ" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

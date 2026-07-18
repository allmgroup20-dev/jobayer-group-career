"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSWRFetch } from "@/lib/use-swr-fetch";

interface Complaint {
  id: number;
  workerId: string;
  courseIds: string;
  description: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export default function ComplaintsPage() {
  const { lang } = useLanguageStore();
  const [statusFilter, setStatusFilter] = useState("");
  const { data, loading, refresh } = useSWRFetch<{ complaints?: Complaint[] }>(
    `/api/complaints${statusFilter ? `?status=${statusFilter}` : ""}`,
    { ttlMs: 30_000 }
  );
  const complaints = data?.complaints ?? [];
  const [showAll, setShowAll] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleResolve = async (id: number, status: string) => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: adminNote || null }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      setEditingId(null); setAdminNote(""); refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setSaving(false); }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "pending": return "bg-amber-50 text-amber-600";
      case "resolved": return "bg-green-50 text-green-600";
      case "dismissed": return "bg-gray-50 text-gray-500";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "কমপ্লেইন ব্যবস্থাপনা" : "Complaints"}</h1>
            <p className="text-sm text-text-secondary mt-1">{complaints.length} {lang === "bn" ? "টি কমপ্লেইন" : "complaints"}</p>
          </div>
          <div className="flex gap-2">
            {["", "pending", "resolved", "dismissed"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  statusFilter === s ? "bg-primary text-white border-primary" : "bg-white border-border text-text-secondary"
                }`}>
                {s ? (lang === "bn" ? s : s) : (lang === "bn" ? "সব" : "All")}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-primary">ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "ইউজার" : "User"}</th>
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "রিসোর্স আইডি" : "Course IDs"}</th>
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "বিবরণ" : "Description"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "তারিখ" : "Date"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "কাজ" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, showAll ? complaints.length : 50).map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    <td className="p-4 text-sm font-mono text-text-secondary">#{c.id}</td>
                    <td className="p-4 text-sm font-medium text-primary">{c.workerId}</td>
                    <td className="p-4 text-sm text-text-secondary">
                      {JSON.parse(c.courseIds).map((id: number) => `#${id}`).join(", ")}
                    </td>
                    <td className="p-4 text-sm text-text-secondary max-w-xs truncate">{c.description}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-center text-xs text-text-secondary">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      {c.status === "pending" ? (
                        <div className="flex items-center gap-1">
                          {editingId === c.id ? (
                            <>
                              <input type="text" value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                                placeholder={lang === "bn" ? "নোট..." : "Note..."} className="input-field !py-1 text-xs w-28" />
                              <button onClick={() => handleResolve(c.id, "resolved")} disabled={saving}
                                className="px-2 py-1 text-xs bg-green-500 text-white rounded">✓</button>
                              <button onClick={() => handleResolve(c.id, "dismissed")} disabled={saving}
                                className="px-2 py-1 text-xs bg-gray-400 text-white rounded">✕</button>
                            </>
                          ) : (
                            <button onClick={() => { setEditingId(c.id); setAdminNote(c.adminNote || ""); }}
                              className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded">✏️</button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-text-secondary">{c.adminNote || "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-text-secondary text-sm">
                    {lang === "bn" ? "কোনো কমপ্লেইন নেই।" : "No complaints found."}
                  </td></tr>
                )}
              </tbody>
              {!showAll && complaints.length > 50 && (
                <tfoot>
                  <tr>
                    <td colSpan={7}>
                      <button onClick={() => setShowAll(true)} className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                        {lang === "bn" ? `আরও ${complaints.length - 50}টি দেখুন` : `Show ${complaints.length - 50} more`}
                      </button>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

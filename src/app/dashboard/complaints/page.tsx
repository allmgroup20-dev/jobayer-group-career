"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

interface Complaint {
  id: number; workerId: string; courseIds: string; description: string;
  category: string; priority: string; status: string; adminNote: string | null;
  createdAt: string; resolvedAt: string | null;
}

const CATEGORY_LABELS: Record<string, [string, string]> = {
  payment: ["💳 Payment", "💳 পেমেন্ট"],
  content: ["📄 Content", "📄 কন্টেন্ট"],
  technical: ["⚙️ Technical", "⚙️ টেকনিক্যাল"],
  access: ["🔒 Access", "🔒 এক্সেস"],
  quality: ["⭐ Quality", "⭐ কোয়ালিটি"],
  other: ["📝 Other", "📝 অন্যান্য"],
};

const STATUS_LABELS: Record<string, [string, string]> = {
  pending: ["⏳ Pending", "⏳ অপেক্ষমাণ"],
  resolved: ["✅ Resolved", "✅ সমাধান হয়েছে"],
  dismissed: ["❌ Dismissed", "❌ বাতিল"],
};

export default function MyComplaintsPage() {
  const { lang } = useLanguageStore();
  const workerId = typeof window !== "undefined" ? localStorage.getItem("worker_id") : null;
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerId) return;
    fetch(`/api/complaints?workerId=${encodeURIComponent(workerId)}`)
      .then(r => r.json() as Promise<{ complaints: Complaint[] }>)
      .then(d => setComplaints(d.complaints || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workerId]);

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "📋 আমার রিপোর্ট" : "📋 My Complaints"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {complaints.length} {lang === "bn" ? "টি রিপোর্ট" : "complaint(s)"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Skeleton className="h-4 w-32" /></div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border">
            <p className="text-text-secondary">{lang === "bn" ? "কোন রিপোর্ট নেই" : "No complaints yet"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-secondary">#{c.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      c.status === "resolved" ? "bg-green-100 text-green-700" :
                      c.status === "dismissed" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {STATUS_LABELS[c.status]?.[lang === "bn" ? 1 : 0] || c.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      c.priority === "critical" ? "bg-red-100 text-red-700" :
                      c.priority === "high" ? "bg-orange-100 text-orange-700" :
                      c.priority === "low" ? "bg-gray-100 text-gray-600" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {c.priority?.toUpperCase() || "MEDIUM"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                      {CATEGORY_LABELS[c.category]?.[lang === "bn" ? 1 : 0] || c.category}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>

                <p className="text-sm text-text mb-3">{c.description}</p>

                {c.adminNote && (
                  <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                    <p className="text-xs font-bold text-primary mb-1">{lang === "bn" ? "এডমিন নোট:" : "Admin note:"}</p>
                    <p className="text-sm text-text-secondary">{c.adminNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

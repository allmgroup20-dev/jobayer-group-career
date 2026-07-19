"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Stats {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  perfCount: number;
  latestErrors: { id: number; log_type: string; source: string; message: string; created_at: string }[];
}

export default function SystemDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, countRes] = await Promise.all([
        fetch("/api/system/logs?limit=10&page=1"),
        fetch("/api/system/logs?limit=1&page=1"),
      ]);
      const logsData = await logsRes.json() as { logs: any[]; total: number };
      const errors = (logsData.logs || []).filter((l: any) => l.log_type === "error" || l.log_type === "warning");
      setStats({
        totalLogs: logsData.total || 0,
        errorCount: errors.filter((l: any) => l.log_type === "error").length,
        warningCount: errors.filter((l: any) => l.log_type === "warning").length,
        perfCount: (logsData.logs || []).filter((l: any) => l.log_type === "perf").length,
        latestErrors: errors.slice(0, 5),
      });
    } catch { setStats(null); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const triggerAnalysis = async () => {
    setActionMsg("Analyzing...");
    try {
      const res = await fetch("/api/system/analyze", { method: "POST" });
      const data = await res.json() as { reportId?: number; ok?: boolean; error?: string };
      setActionMsg(data.reportId ? `Analysis complete (report #${data.reportId})` : "No errors to analyze");
    } catch { setActionMsg("Analysis failed"); }
    setTimeout(() => setActionMsg(""), 4000);
  };

  const triggerPerfSnapshot = async () => {
    setActionMsg("Generating perf snapshot...");
    try {
      const res = await fetch("/api/system/perf", { method: "POST" });
      const data = await res.json() as { ok?: boolean; rows?: number; error?: string };
      setActionMsg(data.ok ? `Snapshot saved (${data.rows} routes)` : "Snapshot failed");
    } catch { setActionMsg("Snapshot failed"); }
    setTimeout(() => setActionMsg(""), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">System Dashboard</h1>
          <button onClick={fetchStats} className="text-sm text-primary hover:underline px-3 py-1 bg-primary/5 rounded-lg">Refresh</button>
        </div>

        {actionMsg && (
          <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm">{actionMsg}</div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
            <div className="text-2xl font-bold text-primary">{loading ? "..." : stats?.totalLogs ?? 0}</div>
            <div className="text-xs text-text-secondary mt-1">Total Events</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
            <div className="text-2xl font-bold text-red-500">{loading ? "..." : stats?.errorCount ?? 0}</div>
            <div className="text-xs text-text-secondary mt-1">Errors</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
            <div className="text-2xl font-bold text-amber-500">{loading ? "..." : stats?.warningCount ?? 0}</div>
            <div className="text-xs text-text-secondary mt-1">Warnings</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
            <div className="text-2xl font-bold text-blue-500">{loading ? "..." : stats?.perfCount ?? 0}</div>
            <div className="text-xs text-text-secondary mt-1">Perf Events</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
            <h2 className="font-semibold text-primary mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button onClick={triggerAnalysis} className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                Run AI Analysis
              </button>
              <button onClick={triggerPerfSnapshot} className="w-full px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors">
                Generate Perf Snapshot
              </button>
              <Link href="/system/logs" className="block w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors text-center">
                View All Logs
              </Link>
              <Link href="/system/reports" className="block w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors text-center">
                View AI Reports
              </Link>
            </div>
          </div>

          {/* Latest Errors */}
          <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-border">
            <h2 className="font-semibold text-primary mb-3">Recent Errors & Warnings</h2>
            {loading ? (
              <div className="text-sm text-text-secondary">Loading...</div>
            ) : !stats?.latestErrors?.length ? (
              <div className="text-sm text-text-secondary">No recent errors</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.latestErrors.map((e) => (
                  <div key={e.id} className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-gray-50">
                    <span className={`shrink-0 mt-0.5 ${e.log_type === "error" ? "text-red-500" : "text-amber-500"}`}>
                      {e.log_type === "error" ? "✕" : "⚠"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{e.source}</div>
                      <div className="text-text-secondary truncate">{e.message}</div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{e.created_at?.split("T")[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

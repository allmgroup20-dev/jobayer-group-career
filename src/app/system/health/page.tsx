"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HealthPage() {
  const [checks, setChecks] = useState<any[]>([]);
  const [latest, setLatest] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const limit = 30;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/system/health?page=${page}&limit=${limit}`);
      const data = await res.json() as { checks: any[]; latest: any; total: number };
      setChecks(data.checks || []);
      setLatest(data.latest);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const runCheck = async () => {
    setMsg("Running health check...");
    try {
      await fetch("/api/system/health?action=check");
      setMsg("Health check recorded");
      fetchData();
    } catch { setMsg("Check failed"); }
    setTimeout(() => setMsg(""), 3000);
  };

  const runCleanup = async () => {
    setMsg("Cleaning up old logs...");
    try {
      const res = await fetch("/api/system/health?action=cleanup&days=7");
      const data = await res.json() as { deleted: number };
      setMsg(`Deleted ${data.deleted} old log entries`);
      fetchData();
    } catch { setMsg("Cleanup failed"); }
    setTimeout(() => setMsg(""), 3000);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/system" className="text-sm text-primary hover:underline">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-primary">Health History</h1>
        </div>

        {msg && (
          <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm">{msg}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Current Status */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
            <h2 className="font-semibold text-sm text-primary mb-2">Current Status</h2>
            {latest ? (
              <div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  latest.status === "ok" ? "bg-green-50 text-green-600" :
                  latest.status === "degraded" ? "bg-amber-50 text-amber-600" :
                  "bg-red-50 text-red-600"
                }`}>
                  {latest.status}
                </div>
                <div className="mt-2 text-xs text-text-secondary space-y-1">
                  <div>DB: {latest.db_ok ? "✓" : "✗"}</div>
                  <div>Cache: {latest.cache_ok ? "✓" : "✗"}</div>
                  {latest.memory_mb && <div>Memory: {latest.memory_mb} MB</div>}
                  {latest.uptime_seconds && <div>Uptime: {Math.floor(latest.uptime_seconds / 60)} min</div>}
                </div>
              </div>
            ) : (
              <div className="text-sm text-text-secondary">No data</div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-border">
            <h2 className="font-semibold text-sm text-primary mb-3">Actions</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={runCheck}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors">
                Run Health Check
              </button>
              <button onClick={runCleanup}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">
                Cleanup Old Logs (7d+)
              </button>
              <button onClick={fetchData}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Health history table */}
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {loading ? (
            <Skeleton className="h-4 w-32 mx-auto" />
          ) : checks.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">No health checks recorded</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-text-secondary">Status</th>
                    <th className="text-center px-4 py-2 font-medium text-text-secondary">DB</th>
                    <th className="text-center px-4 py-2 font-medium text-text-secondary">Cache</th>
                    <th className="text-right px-4 py-2 font-medium text-text-secondary">Memory</th>
                    <th className="text-right px-4 py-2 font-medium text-text-secondary">Uptime</th>
                    <th className="text-right px-4 py-2 font-medium text-text-secondary">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {checks.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          c.status === "ok" ? "bg-green-50 text-green-600" :
                          c.status === "degraded" ? "bg-amber-50 text-amber-600" :
                          "bg-red-50 text-red-600"
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-2 text-center">{c.db_ok ? "✓" : "✗"}</td>
                      <td className="px-4 py-2 text-center">{c.cache_ok ? "✓" : "✗"}</td>
                      <td className="px-4 py-2 text-right text-text-secondary">{c.memory_mb ? `${c.memory_mb} MB` : "-"}</td>
                      <td className="px-4 py-2 text-right text-text-secondary">{c.uptime_seconds ? `${Math.floor(c.uptime_seconds / 60)}m` : "-"}</td>
                      <td className="px-4 py-2 text-right text-text-secondary text-xs whitespace-nowrap">{c.created_at?.split(".")[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-text-secondary">{total} total checks</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg border border-border text-sm disabled:opacity-40 bg-white">Prev</button>
              <span className="px-3 py-1 text-sm text-text-secondary">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg border border-border text-sm disabled:opacity-40 bg-white">Next</button>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-800 text-sm mb-2">About Auto Cleanup</h3>
          <p className="text-xs text-blue-700 leading-relaxed">
            System logs older than <strong>7 days</strong> are automatically cleaned up.
            Health history is kept for <strong>90 days</strong>.
            Use the "Cleanup Old Logs" button above to manually trigger cleanup.
          </p>
        </div>
      </div>
    </div>
  );
}

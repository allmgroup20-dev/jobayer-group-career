"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";

const LOG_TYPES = ["", "error", "warning", "perf", "info"];
const TYPE_COLORS: Record<string, string> = {
  error: "text-red-600 bg-red-50 border-red-200",
  warning: "text-amber-600 bg-amber-50 border-amber-200",
  perf: "text-blue-600 bg-blue-50 border-blue-200",
  info: "text-gray-600 bg-gray-50 border-gray-200",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [logType, setLogType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (logType) params.set("logType", logType);
      if (search) params.set("search", search);
      const res = await fetch(`/api/system/logs?${params}`);
      const data = await res.json() as { logs: any[]; total: number };
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch { setLogs([]); }
    setLoading(false);
  }, [page, logType, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/system" className="text-sm text-primary hover:underline">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-primary">System Logs</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <select value={logType} onChange={(e) => { setLogType(e.target.value); setPage(1); }}
            className="px-3 py-1.5 border border-border rounded-lg text-sm bg-white">
            <option value="">All Types</option>
            {LOG_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="px-3 py-1.5 border border-border rounded-lg text-sm bg-white flex-1 min-w-[200px]" />
          <button onClick={() => { setPage(1); fetchLogs(); }}
            className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm">Filter</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {loading ? (
            <Skeleton className="h-4 w-32 mx-auto" />
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">No logs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-text-secondary">Type</th>
                    <th className="text-left px-4 py-2 font-medium text-text-secondary">Source</th>
                    <th className="text-left px-4 py-2 font-medium text-text-secondary">Message</th>
                    <th className="text-left px-4 py-2 font-medium text-text-secondary">Route</th>
                    <th className="text-right px-4 py-2 font-medium text-text-secondary">Duration</th>
                    <th className="text-right px-4 py-2 font-medium text-text-secondary">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${TYPE_COLORS[log.log_type] || TYPE_COLORS.info}`}>
                          {log.log_type}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-medium">{log.source}</td>
                      <td className="px-4 py-2 max-w-xs truncate text-text-secondary">{log.message}</td>
                      <td className="px-4 py-2 text-text-secondary text-xs">{log.route || "-"}</td>
                      <td className="px-4 py-2 text-right text-text-secondary">{log.duration_ms ? `${Math.round(log.duration_ms)}ms` : "-"}</td>
                      <td className="px-4 py-2 text-right text-text-secondary text-xs whitespace-nowrap">{log.created_at?.split(".")[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-text-secondary">{total} total logs</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg border border-border text-sm disabled:opacity-40 bg-white">Prev</button>
              <span className="px-3 py-1 text-sm text-text-secondary">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg border border-border text-sm disabled:opacity-40 bg-white">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

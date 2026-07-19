"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/system/reports?page=${page}&limit=${limit}`);
      const data = await res.json() as { reports: any[]; total: number };
      setReports(data.reports || []);
      setTotal(data.total || 0);
    } catch { setReports([]); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const deleteReport = async (id: number) => {
    try {
      await fetch(`/api/system/reports?id=${id}`, { method: "DELETE" });
      fetchReports();
    } catch {}
  };

  const loadDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/system/reports?limit=1&page=1`);
      const data = await res.json() as { reports: any[] };
      const report = data.reports?.find((r: any) => r.id === id);
      if (report) setDetail(report);
    } catch {}
  };

  const severityColors: Record<string, string> = {
    critical: "text-red-600 bg-red-50 border-red-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    low: "text-green-600 bg-green-50 border-green-200",
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/system" className="text-sm text-primary hover:underline">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-primary">AI Analysis Reports</h1>
          <span className="text-sm text-text-secondary">({total} total)</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-secondary">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-border">
            <div className="text-3xl mb-3">📊</div>
            <p className="text-text-secondary">No reports yet.</p>
            <p className="text-sm text-text-secondary mt-1">Run AI Analysis from the dashboard to generate reports.</p>
            <Link href="/system" className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                <button
                  onClick={() => {
                    if (expanded === r.id) { setExpanded(null); setDetail(null); }
                    else { setExpanded(r.id); loadDetail(r.id); }
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${severityColors[r.severity] || severityColors.medium}`}>
                        {r.severity}
                      </span>
                      <span className="text-xs text-text-secondary bg-gray-100 px-2 py-0.5 rounded">{r.report_type}</span>
                    </div>
                    <div className="font-medium text-sm truncate">{r.title}</div>
                    <div className="text-xs text-text-secondary mt-1 line-clamp-2">{r.summary}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-gray-400">{r.created_at?.split("T")[0]}</span>
                    <span className="text-gray-400">{expanded === r.id ? "▲" : "▼"}</span>
                  </div>
                </button>

                {expanded === r.id && detail && (
                  <div className="px-4 pb-4 border-t border-border">
                    <div className="mt-3 space-y-3">
                      {detail.affected_routes && Array.isArray(detail.affected_routes) && detail.affected_routes.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-text-secondary mb-1">Affected Routes</h4>
                          <div className="flex flex-wrap gap-1">
                            {detail.affected_routes.map((route: string) => (
                              <span key={route} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">{route}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {detail.details && (() => {
                        let parsed: any;
                        try { parsed = typeof detail.details === "string" ? JSON.parse(detail.details) : detail.details; } catch { parsed = null; }
                        return parsed ? (
                          <>
                            {parsed.rawAnalysis && (
                              <div>
                                <h4 className="text-xs font-medium text-text-secondary mb-1">Raw Analysis</h4>
                                <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">{parsed.rawAnalysis}</pre>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              {parsed.errorCount !== undefined && (
                                <div className="text-xs bg-red-50 rounded-lg p-2">
                                  <span className="font-medium text-red-600">Errors:</span> {parsed.errorCount}
                                </div>
                              )}
                              {parsed.warningCount !== undefined && (
                                <div className="text-xs bg-amber-50 rounded-lg p-2">
                                  <span className="font-medium text-amber-600">Warnings:</span> {parsed.warningCount}
                                </div>
                              )}
                            </div>
                          </>
                        ) : null;
                      })()}

                      <div className="flex gap-2 pt-2">
                        <button onClick={() => deleteReport(r.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors">
                          Delete Report
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-text-secondary">{total} total reports</span>
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
        )}
      </div>
    </div>
  );
}

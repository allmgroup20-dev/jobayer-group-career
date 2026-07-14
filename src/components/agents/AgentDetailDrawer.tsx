"use client";

import type { Agent, AgentReport, AgentSubmission, AgentLog } from "@/lib/ai/agents";

const ACTION_ICONS: Record<string, string> = {
  started: "▶️", completed: "✅", error: "❌", synthesized: "🔄", reported: "📋",
};

export default function AgentDetailDrawer({
  open, agent, report, submissions, logs, onClose, onRun, lang,
}: {
  open: boolean;
  agent: Agent | null;
  report: AgentReport | null;
  submissions: AgentSubmission[];
  logs: AgentLog[];
  onClose: () => void;
  onRun: (id: string) => void;
  lang: "bn" | "en";
}) {
  if (!open) return null;

  let findings: { challenges?: string[]; whats_working?: string[] } | null = null;
  let recs: string[] = [];
  let metrics: Record<string, number> = {};

  if (report) {
    try { findings = JSON.parse(report.findings || "{}"); } catch {}
    try { recs = JSON.parse(report.recommendations || "[]"); } catch {}
    try { metrics = JSON.parse(report.metrics || "{}"); } catch {}
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-xl">{agent?.level === 3 ? "👑" : agent?.level === 2 ? "📊" : "🔍"}</span>
              <div>
                <h2 className="text-base font-bold text-text">
                  {lang === "bn" ? agent?.name_bn : agent?.name_en}
                </h2>
                <span className="text-xs text-text-secondary">{agent?.agent_id}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-text-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Status & Info */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                agent?.status === "active" ? "bg-green-50 text-green-700" :
                agent?.status === "error" ? "bg-red-50 text-red-700" :
                agent?.status === "disabled" ? "bg-gray-50 text-gray-500" :
                "bg-yellow-50 text-yellow-700"
              }`}>
                {agent?.status}
              </span>
              <span className="text-xs text-text-secondary">
                {lang === "bn" ? "ক্রন:" : "Cron:"} {agent ? `${agent.cron_interval / 60}h` : ""}
              </span>
              {agent?.model_id && (
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{agent.model_id}</span>
              )}
              <button
                onClick={() => agent && onRun(agent.agent_id)}
                className="ml-auto px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                {lang === "bn" ? "⚡ চালান" : "⚡ Run"}
              </button>
            </div>

            {/* Report Section */}
            {report && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-text mb-2">
                    {lang === "bn" ? "📄 সারসংক্ষেপ" : "📄 Summary"}
                  </h3>
                  <p className="text-sm text-text-secondary bg-gray-50 rounded-xl p-3 leading-relaxed">
                    {report.summary_bn}
                  </p>
                </div>

                {findings?.challenges && findings.challenges.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text mb-2">
                      {lang === "bn" ? "⚠️ চ্যালেঞ্জ" : "⚠️ Challenges"}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {findings.challenges.map((c, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-red-50 text-red-700 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {findings?.whats_working && findings.whats_working.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text mb-2">
                      {lang === "bn" ? "✅ কী কাজ করছে" : "✅ What's Working"}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {findings.whats_working.map((w, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full">{w}</span>
                      ))}
                    </div>
                  </div>
                )}

                {recs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text mb-2">
                      {lang === "bn" ? "💡 সুপারিশ" : "💡 Recommendations"}
                    </h3>
                    <div className="space-y-1.5">
                      {recs.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-text-secondary bg-gray-50 rounded-lg p-2.5">
                          <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(metrics).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text mb-2">
                      {lang === "bn" ? "📊 মেট্রিক্স" : "📊 Metrics"}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(metrics).map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <div className="text-sm font-bold text-primary">{v}</div>
                          <div className="text-xs text-text-secondary">{k}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submissions */}
            {submissions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text mb-2">
                  {lang === "bn" ? "📤 সাবমিশন" : "📤 Submissions"} ({submissions.length})
                </h3>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {submissions.slice(0, 10).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2.5">
                      <span className="text-text-secondary truncate">{s.title_bn || s.submission_type}</span>
                      <span className="text-text-secondary/60 shrink-0 ml-2">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Logs */}
            {logs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text mb-2">
                  {lang === "bn" ? "📋 কার্যকলাপ" : "📋 Activity"} ({logs.length})
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 text-xs text-text-secondary bg-gray-50 rounded-lg p-2.5">
                      <span className="text-base shrink-0">{ACTION_ICONS[log.action] || "📌"}</span>
                      <div>
                        <span className="text-text-secondary/60">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : ""}
                        </span>
                        <p>{log.detail_bn || log.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!report && submissions.length === 0 && logs.length === 0 && (
              <div className="text-center py-12 text-text-secondary text-sm">
                {lang === "bn" ? "এখনো কোনো ডাটা নেই। এজেন্ট রান করুন।" : "No data yet. Run the agent."}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

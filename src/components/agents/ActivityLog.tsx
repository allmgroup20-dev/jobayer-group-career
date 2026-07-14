"use client";

import { useState, useMemo } from "react";
import { useLanguageStore } from "@/lib/store";
import type { AgentLog } from "@/lib/ai/agents";

const ACTION_ICONS: Record<string, string> = {
  started: "▶️", completed: "✅", error: "❌", synthesized: "🔄", reported: "📋",
};

type ActionFilter = "all" | "started" | "completed" | "error";

export default function ActivityLog({ logs, showFilters }: { logs: AgentLog[]; showFilters?: boolean }) {
  const { lang } = useLanguageStore();
  const [filter, setFilter] = useState<ActionFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter((log) => log.action === filter);
  }, [logs, filter]);

  const grouped = useMemo(() => {
    const groups: { label: string; logs: AgentLog[] }[] = [];
    const today = new Date();
    const todayStr = today.toDateString();
    const yesterdayStr = new Date(today.getTime() - 86400000).toDateString();

    const todayLogs: AgentLog[] = [];
    const yesterdayLogs: AgentLog[] = [];
    const weekLogs: AgentLog[] = [];
    const olderLogs: AgentLog[] = [];

    for (const log of filtered) {
      if (!log.created_at) { olderLogs.push(log); continue; }
      const d = new Date(log.created_at).toDateString();
      if (d === todayStr) todayLogs.push(log);
      else if (d === yesterdayStr) yesterdayLogs.push(log);
      else if (new Date(log.created_at).getTime() > today.getTime() - 604800000) weekLogs.push(log);
      else olderLogs.push(log);
    }

    if (todayLogs.length) groups.push({ label: lang === "bn" ? "আজ" : "Today", logs: todayLogs });
    if (yesterdayLogs.length) groups.push({ label: lang === "bn" ? "গতকাল" : "Yesterday", logs: yesterdayLogs });
    if (weekLogs.length) groups.push({ label: lang === "bn" ? "এই সপ্তাহ" : "This Week", logs: weekLogs });
    if (olderLogs.length) groups.push({ label: lang === "bn" ? "পুরোনো" : "Older", logs: olderLogs });

    return groups;
  }, [filtered, lang]);

  if (!logs.length) {
    return (
      <div className="text-center py-8 text-text-secondary text-sm">
        {lang === "bn" ? "কোনো কার্যকলাপ নেই" : "No activity yet"}
      </div>
    );
  }

  const filterTabs: { id: ActionFilter; en: string; bn: string }[] = [
    { id: "all", en: "All", bn: "সব" },
    { id: "started", en: "Started", bn: "শুরু" },
    { id: "completed", en: "Completed", bn: "সম্পন্ন" },
    { id: "error", en: "Errors", bn: "ত্রুটি" },
  ];

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      {showFilters && (
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filter === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {lang === "bn" ? tab.bn : tab.en}
            </button>
          ))}
        </div>
      )}

      {/* Grouped logs */}
      {grouped.map((group) => (
        <div key={group.label}>
          <h3 className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 px-1">
            {group.label}
          </h3>
          <div className="space-y-1">
            {group.logs.map((log) => {
              const icon = ACTION_ICONS[log.action] || "📌";
              const time = log.created_at
                ? new Date(log.created_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-US", {
                    hour: "2-digit", minute: "2-digit",
                  })
                : "";
              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors ${
                    log.action === "error"
                      ? "bg-red-50 border-red-100"
                      : "bg-white border-border hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm shrink-0 mt-0.5">{icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-text">{log.agent_id}</span>
                      <span className="text-[10px] text-text-secondary/60">{time}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {log.detail_bn || log.action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useLanguageStore } from "@/lib/store";
import type { Agent } from "@/lib/ai/agents";

const LEVEL_LABELS: Record<number, { bn: string; en: string }> = {
  1: { bn: "সেক্টর এজেন্ট", en: "Sector Agent" },
  2: { bn: "ডোমেইন এজেন্ট", en: "Domain Agent" },
  3: { bn: "প্রধান এজেন্ট", en: "Senior Agent" },
};

const LEVEL_COLORS: Record<number, string> = {
  1: "border-l-blue-500",
  2: "border-l-purple-500",
  3: "border-l-amber-500",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  idle: "bg-yellow-50 text-yellow-700 border-yellow-200",
  error: "bg-red-50 text-red-700 border-red-200",
  disabled: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function AgentCard({
  agent, onRun, onViewDetail, onConfig,
}: {
  agent: Agent;
  onRun?: () => void;
  onViewDetail?: () => void;
  onConfig?: () => void;
}) {
  const { lang } = useLanguageStore();
  const levelLabel = LEVEL_LABELS[agent.level] || { bn: "এজেন্ট", en: "Agent" };
  const borderColor = LEVEL_COLORS[agent.level] || "border-l-gray-400";
  const statusStyle = STATUS_STYLES[agent.status] || STATUS_STYLES.idle;
  const lastRun = agent.last_run_at
    ? new Date(agent.last_run_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-US")
    : (lang === "bn" ? "কখনো নয়" : "Never");

  return (
    <div
      className={`bg-white rounded-2xl border border-border border-l-4 ${borderColor} p-5 space-y-4 hover:shadow-lg transition-all cursor-pointer`}
      onClick={onViewDetail}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{agent.level === 3 ? "👑" : agent.level === 2 ? "📊" : "🔍"}</span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-text truncate">
              {lang === "bn" ? agent.name_bn : agent.name_en}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-text-secondary">{agent.agent_id}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary">
                {levelLabel[lang]}
              </span>
              {agent.sector && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {agent.sector.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle} shrink-0`}>
          {agent.status}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <div className="text-[10px] text-text-secondary">{lang === "bn" ? "শেষ রান" : "Last Run"}</div>
          <div className="text-xs font-semibold text-text mt-0.5 truncate" title={lastRun}>{lastRun}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <div className="text-[10px] text-text-secondary">{lang === "bn" ? "ক্রন" : "Cron"}</div>
          <div className="text-xs font-semibold text-text mt-0.5">
            {lang === "bn" ? `প্রতি ${agent.cron_interval / 60}ঘ` : `Every ${agent.cron_interval / 60}h`}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <div className="text-[10px] text-text-secondary">Model</div>
          <div className="text-xs font-semibold text-text mt-0.5 truncate" title={agent.model_id || "Auto"}>
            {agent.model_id ? agent.model_id.split("/").pop() : (lang === "bn" ? "অটো" : "Auto")}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onRun}
          className="flex-1 px-3 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-all active:scale-95"
        >
          {lang === "bn" ? "⚡ চালান" : "⚡ Run"}
        </button>
        <button
          onClick={onConfig}
          className="px-3 py-2 text-xs font-medium bg-gray-100 text-text-secondary rounded-lg hover:bg-gray-200 transition-all"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}

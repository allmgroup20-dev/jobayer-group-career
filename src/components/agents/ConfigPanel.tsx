"use client";

import { useState } from "react";
import type { Agent } from "@/lib/ai/agents";

const LEVEL_ICONS: Record<number, string> = {
  3: "👑", 2: "📊", 1: "🔍",
};

const LEVEL_LABELS: Record<number, { bn: string; en: string }> = {
  3: { bn: "প্রধান এজেন্ট", en: "Senior Agent" },
  2: { bn: "ডোমেইন এজেন্ট", en: "Domain Agent" },
  1: { bn: "সেক্টর এজেন্ট", en: "Sector Agents" },
};

const MODEL_OPTIONS = [
  { value: "", label: { bn: "ডিফল্ট (গ্লোবাল)", en: "Default (Global)" } },
  { value: "google/gemini-2.0-flash-001:free", label: { bn: "Gemini 2.0 Flash", en: "Gemini 2.0 Flash" } },
  { value: "deepseek/deepseek-chat-v3-0324", label: { bn: "DeepSeek V3", en: "DeepSeek V3" } },
  { value: "meta-llama/llama-4-scout-17b-16e-instruct", label: { bn: "Llama 4 Scout", en: "Llama 4 Scout" } },
  { value: "mistralai/mistral-small-24b-instruct-2501", label: { bn: "Mistral Small 24B", en: "Mistral Small 24B" } },
  { value: "qwen/qwen2.5-32b-instruct", label: { bn: "Qwen 2.5 32B", en: "Qwen 2.5 32B" } },
  { value: "openrouter/free", label: { bn: "ফ্রি রাউটার", en: "Free Router" } },
];

const CRON_OPTIONS = [
  { value: 60, label: { bn: "প্রতি ১ ঘণ্টা", en: "Every 1 hour" } },
  { value: 360, label: { bn: "প্রতি ৬ ঘণ্টা", en: "Every 6 hours" } },
  { value: 720, label: { bn: "প্রতি ১২ ঘণ্টা", en: "Every 12 hours" } },
  { value: 1440, label: { bn: "প্রতিদিন", en: "Daily" } },
  { value: 10080, label: { bn: "সাপ্তাহিক", en: "Weekly" } },
];

export default function ConfigPanel({
  agents, onUpdate, lang,
}: {
  agents: Agent[];
  onUpdate: (id: string, config: any) => Promise<void>;
  lang: "bn" | "en";
}) {
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdate = async (agentId: string, field: string, value: string | number) => {
    setSaving(agentId);
    try {
      await onUpdate(agentId, { [field]: value });
      setSuccess(agentId);
      setTimeout(() => setSuccess(null), 2000);
    } finally {
      setSaving(null);
    }
  };

  const handleBulkStatus = async (level: number, status: string) => {
    const levelAgents = agents.filter((a) => a.level === level);
    for (const a of levelAgents) {
      await onUpdate(a.agent_id, { status });
    }
  };

  const levels = [3, 2, 1];

  return (
    <div className="space-y-6">
      {levels.map((level) => {
        const levelAgents = agents.filter((a) => a.level === level);
        if (levelAgents.length === 0) return null;

        return (
          <div key={level}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-text flex items-center gap-2">
                <span>{LEVEL_ICONS[level]}</span>
                <span>{LEVEL_LABELS[level][lang]}</span>
                <span className="text-xs text-text-secondary font-normal">({levelAgents.length})</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkStatus(level, "idle")}
                  className="px-2.5 py-1 text-[10px] font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  {lang === "bn" ? "সব সক্রিয়" : "Enable All"}
                </button>
                <button
                  onClick={() => handleBulkStatus(level, "disabled")}
                  className="px-2.5 py-1 text-[10px] font-medium bg-gray-100 text-text-secondary rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {lang === "bn" ? "সব বন্ধ" : "Disable All"}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {levelAgents.map((agent) => (
                <div key={agent.agent_id} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg">{LEVEL_ICONS[agent.level]}</span>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm font-semibold text-text truncate">
                        {lang === "bn" ? agent.name_bn : agent.name_en}
                      </span>
                      <span className="text-[10px] text-text-secondary">({agent.agent_id})</span>
                    </div>
                    {saving === agent.agent_id && (
                      <span className="text-[10px] text-blue-600 animate-pulse">
                        {lang === "bn" ? "সংরক্ষণ..." : "Saving..."}
                      </span>
                    )}
                    {success === agent.agent_id && (
                      <span className="text-[10px] text-green-600">✓</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[10px] font-medium text-text-secondary block mb-1">
                        {lang === "bn" ? "মডেল" : "Model"}
                      </label>
                      <select
                        value={agent.model_id || ""}
                        onChange={(e) => handleUpdate(agent.agent_id, "model_id", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      >
                        {MODEL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label[lang]}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-text-secondary block mb-1">
                        {lang === "bn" ? "প্রোভাইডার" : "Provider"}
                      </label>
                      <select
                        value={agent.provider}
                        onChange={(e) => handleUpdate(agent.agent_id, "provider", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      >
                        <option value="openrouter">OpenRouter</option>
                        <option value="opencode">OpenCode</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-text-secondary block mb-1">
                        {lang === "bn" ? "ক্রন" : "Cron"}
                      </label>
                      <select
                        value={agent.cron_interval}
                        onChange={(e) => handleUpdate(agent.agent_id, "cron_interval", parseInt(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      >
                        {CRON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label[lang]}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-text-secondary block mb-1">
                        {lang === "bn" ? "স্ট্যাটাস" : "Status"}
                      </label>
                      <div className="flex items-center h-full pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agent.status !== "disabled"}
                            onChange={(e) => handleUpdate(agent.agent_id, "status", e.target.checked ? "idle" : "disabled")}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-xs text-text-secondary">
                            {lang === "bn" ? "সক্রিয়" : "Enabled"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

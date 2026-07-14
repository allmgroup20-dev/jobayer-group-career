"use client";

import { useState, useEffect } from "react";
import type { GlobalAgentConfig } from "@/lib/ai/agents";

interface AIModel {
  model_id: string;
  name: string;
  provider: string;
}

export default function GlobalModelSelector({
  config,
  onUpdate,
  lang,
}: {
  config: GlobalAgentConfig;
  onUpdate: (c: { mode?: string; provider?: string; model_id?: string }) => void;
  lang: "bn" | "en";
}) {
  const [mode, setMode] = useState(config.mode);
  const [provider, setProvider] = useState(config.provider || "openrouter");
  const [modelId, setModelId] = useState(config.modelId || "");
  const [models, setModels] = useState<AIModel[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/ai/models")
      .then((r) => r.json())
      .then((data) => setModels((data as { models?: AIModel[] }).models || []))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload: any = { mode };
    if (mode === "provider") payload.provider = provider;
    if (mode === "model") {
      payload.model_id = modelId;
      payload.provider = models.find((m) => m.model_id === modelId)?.provider || "openrouter";
    }
    await onUpdate(payload);
    setSaving(false);
  };

  const filteredModels = models.filter((m) => m.provider === provider);

  return (
    <div className="bg-white rounded-2xl border border-border p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-lg">🌐</span>
          <span className="text-sm font-semibold text-text">
            {lang === "bn" ? "গ্লোবাল এআই কনফিগ" : "Global AI Config"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "auto" | "provider" | "model")}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="auto">{lang === "bn" ? "🔄 অটো (যেকোনো সক্রিয়)" : "🔄 Auto (any active)"}</option>
            <option value="provider">{lang === "bn" ? "🏢 নির্দিষ্ট কোম্পানি" : "🏢 Specific Provider"}</option>
            <option value="model">{lang === "bn" ? "🤖 নির্দিষ্ট মডেল" : "🤖 Specific Model"}</option>
          </select>

          {mode === "provider" && (
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="openrouter">OpenRouter</option>
              <option value="opencode">OpenCode</option>
            </select>
          )}

          {mode === "model" && (
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-w-[200px]"
            >
              <option value="">{lang === "bn" ? "মডেল নির্বাচন করুন" : "Select a model"}</option>
              {filteredModels.map((m) => (
                <option key={m.model_id} value={m.model_id}>
                  {m.name} ({m.model_id})
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              config.mode === "auto" ? "bg-green-50 text-green-700" :
              config.mode === "provider" ? "bg-blue-50 text-blue-700" :
              "bg-purple-50 text-purple-700"
            }`}>
              {config.mode === "auto" ? (lang === "bn" ? "অটো" : "Auto") :
               config.mode === "provider" ? (config.provider || "") :
               config.modelId || ""}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
            >
              {saving ? (lang === "bn" ? "সংরক্ষণ..." : "Saving...") : (lang === "bn" ? "সংরক্ষণ" : "Save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

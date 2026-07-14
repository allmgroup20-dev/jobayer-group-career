"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import type { AgentTreeNode } from "@/lib/ai/agents";

const LEVEL_ICONS: Record<number, string> = {
  3: "👑", 2: "📊", 1: "🔍",
};

const STATUS_DOTS: Record<string, string> = {
  active: "bg-green-500", idle: "bg-yellow-400", error: "bg-red-500", disabled: "bg-gray-400",
};

const STATUS_TEXT: Record<string, { bn: string; en: string }> = {
  active: { bn: "সক্রিয়", en: "Active" },
  idle: { bn: "নিষ্ক্রিয়", en: "Idle" },
  error: { bn: "ত্রুটি", en: "Error" },
  disabled: { bn: "বন্ধ", en: "Disabled" },
};

const BADGE_COLORS: Record<string, string> = {
  active: "bg-green-500", idle: "bg-yellow-500", error: "bg-red-500", disabled: "bg-gray-400",
};

export default function AgentTree({ tree, onAgentClick }: { tree: AgentTreeNode[]; onAgentClick?: (id: string) => void }) {
  const { lang } = useLanguageStore();

  if (!tree.length) {
    return (
      <div className="text-center py-8 text-text-secondary text-sm">
        {lang === "bn" ? "কোনো এজেন্ট পাওয়া যায়নি" : "No agents found"}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tree.map((node) => (
        <TreeNode key={node.agent.agent_id} node={node} depth={0} lang={lang} onAgentClick={onAgentClick} />
      ))}
    </div>
  );
}

function TreeNode({
  node, depth, lang, onAgentClick,
}: {
  node: AgentTreeNode; depth: number; lang: "bn" | "en"; onAgentClick?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const dotColor = STATUS_DOTS[node.agent.status] || STATUS_DOTS.idle;
  const statusText = STATUS_TEXT[node.agent.status] || STATUS_TEXT.idle;
  const icon = LEVEL_ICONS[node.agent.level] || "🤖";
  const lastRun = node.agent.last_run_at
    ? new Date(node.agent.last_run_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-US")
    : (lang === "bn" ? "কখনো নয়" : "Never");

  const levelLabel = node.agent.level === 3 ? "Senior" : node.agent.level === 2 ? "Domain" : "Sector";
  const hasChildren = node.children && node.children.length > 0;
  const reportCount = node.latestReport ? 1 : 0;
  const submissionCount = node.pendingSubmissions || 0;

  return (
    <div className="relative">
      {/* Connector line */}
      {depth > 0 && (
        <div className="absolute left-3 top-0 bottom-1/2 w-px bg-border" />
      )}
      {depth > 0 && hasChildren && (
        <svg className="absolute left-3 top-1/2 w-3 h-3 -translate-y-1/2" viewBox="0 0 12 12">
          <line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" className="text-border" strokeWidth="1" />
          {depth > 0 && <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" className="text-border" strokeWidth="1" />}
        </svg>
      )}

      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={`flex items-center gap-2.5 p-3 rounded-xl transition-all cursor-pointer group ${
          depth === 0 ? "bg-primary/5 border border-primary/20" :
          depth === 1 ? "bg-blue-50/50 border border-blue-100" :
          "bg-white border border-border hover:bg-gray-50"
        }`}
      >
        {/* Expand/collapse for parents */}
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 text-text-secondary text-xs shrink-0 hover:bg-gray-300 transition-colors"
          >
            {expanded ? "−" : "+"}
          </button>
        ) : (
          <div className="w-5 shrink-0" />
        )}

        <span className="text-base shrink-0">{icon}</span>

        <div className="flex items-center gap-2 min-w-0 flex-1" onClick={() => onAgentClick?.(node.agent.agent_id)}>
          <span className="text-sm font-semibold text-text truncate group-hover:text-primary transition-colors">
            {lang === "bn" ? node.agent.name_bn : node.agent.name_en}
          </span>
          <span className="text-[10px] text-text-secondary/60 hidden sm:inline">({node.agent.agent_id})</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-text-secondary hidden md:inline">
            {levelLabel}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {reportCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">
              📄 {reportCount}
            </span>
          )}
          {submissionCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
              📤 {submissionCount}
            </span>
          )}
          <div className={`w-2 h-2 rounded-full ${dotColor}`} title={statusText[lang]} />
          <span className="text-[10px] font-medium text-text-secondary hidden sm:inline">{statusText[lang]}</span>
          <span className="text-[10px] text-text-secondary/60 hidden lg:inline">
            {lang === "bn" ? "শেষ:" : ""} {lastRun}
          </span>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="ml-8 pl-3 space-y-1 mt-1">
          {node.children.map((child) => (
            <TreeNode key={child.agent.agent_id} node={child} depth={depth + 1} lang={lang} onAgentClick={onAgentClick} />
          ))}
        </div>
      )}
    </div>
  );
}

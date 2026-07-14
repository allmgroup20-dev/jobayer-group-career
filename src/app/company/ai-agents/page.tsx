"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import AgentTree from "@/components/agents/AgentTree";
import AgentCard from "@/components/agents/AgentCard";
import ActivityLog from "@/components/agents/ActivityLog";
import ConfigPanel from "@/components/agents/ConfigPanel";
import AgentDetailDrawer from "@/components/agents/AgentDetailDrawer";
import GlobalModelSelector from "@/components/agents/GlobalModelSelector";
import type {
  Agent, AgentTreeNode, AgentReport,
  AgentSubmission, AgentLog, AgentStats, GlobalAgentConfig,
} from "@/lib/ai/agents";

type TabId = "dashboard" | "agents" | "activity" | "config";

const TABS: { id: TabId; icon: string; en: string; bn: string }[] = [
  { id: "dashboard", icon: "🏠", en: "Dashboard", bn: "ড্যাশবোর্ড" },
  { id: "agents", icon: "👥", en: "Agents", bn: "এজেন্ট" },
  { id: "activity", icon: "📋", en: "Activity", bn: "কার্যকলাপ" },
  { id: "config", icon: "⚙️", en: "Config", bn: "কনফিগারেশন" },
];

export default function AIAgentsPage() {
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [tree, setTree] = useState<AgentTreeNode[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalAgentConfig | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedReport, setSelectedReport] = useState<AgentReport | null>(null);
  const [agentSubmissions, setAgentSubmissions] = useState<AgentSubmission[]>(null as unknown as AgentSubmission[]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [agentsRes, logsRes, reportsRes, configRes] = await Promise.all([
        fetch("/api/ai/agents"),
        fetch("/api/ai/agents/logs"),
        fetch("/api/ai/agents/reports"),
        fetch("/api/ai/agents/global-config"),
      ]);
      const agentsData = await agentsRes.json() as { tree?: AgentTreeNode[]; agents?: Agent[]; stats?: AgentStats };
      const logsData = await logsRes.json() as { logs?: AgentLog[] };
      const reportsData = await reportsRes.json() as { reports?: AgentReport[] };
      const configData = await configRes.json() as { config?: GlobalAgentConfig };

      setTree(agentsData.tree || []);
      setAgents(agentsData.agents || []);
      setStats(agentsData.stats || null);
      setLogs(logsData.logs || []);
      setReports(reportsData.reports || []);
      setGlobalConfig(configData.config || null);
    } catch (e) {
      console.error("Failed to fetch agent data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const runAgent = async (agentId: string) => {
    setRunning(agentId);
    try {
      const res = await fetch(`/api/ai/agents/${agentId}/run`, { method: "POST" });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        showMsg(lang === "bn" ? `${agentId} চালানো হয়েছে` : `${agentId} executed`);
        await fetchData();
        await loadAgentDetail(agentId);
      } else {
        showMsg(data.error || "Failed", "error");
      }
    } catch {
      showMsg(lang === "bn" ? "কানেকশন ব্যর্থ" : "Connection failed", "error");
    } finally {
      setRunning(null);
    }
  };

  const runAll = async () => {
    setRunning("all");
    try {
      const res = await fetch("/api/ai/agents/run-all", { method: "POST" });
      const data = await res.json() as { results?: unknown[] };
      showMsg(lang === "bn" ? `${data.results?.length || 0}টি এজেন্ট চালানো হয়েছে` : `${data.results?.length || 0} agents executed`);
      await fetchData();
    } catch {
      showMsg(lang === "bn" ? "কানেকশন ব্যর্থ" : "Connection failed", "error");
    } finally {
      setRunning(null);
    }
  };

  const loadAgentDetail = async (agentId: string) => {
    try {
      const res = await fetch(`/api/ai/agents/${agentId}`);
      const data = await res.json() as { agent?: Agent; latestReport?: AgentReport | null; submissions?: AgentSubmission[]; logs?: AgentLog[] };
      if (data.agent) {
        setSelectedAgent(data.agent);
        setSelectedReport(data.latestReport || null);
        setAgentSubmissions(data.submissions || []);
        setAgentLogs(data.logs || []);
      }
    } catch {}
  };

  const openDrawer = async (agentId: string) => {
    await loadAgentDetail(agentId);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedAgent(null);
      setSelectedReport(null);
      setAgentSubmissions(null as unknown as AgentSubmission[]);
      setAgentLogs([]);
    }, 300);
  };

  const updateAgentConfig = async (agentId: string, config: any) => {
    try {
      await fetch(`/api/ai/agents/${agentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      await fetchData();
    } catch {}
  };

  const updateGlobal = async (config: { mode?: string; provider?: string; model_id?: string }) => {
    try {
      const res = await fetch("/api/ai/agents/global-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json() as { config?: GlobalAgentConfig };
      if (data.config) setGlobalConfig(data.config);
      showMsg(lang === "bn" ? "গ্লোবাল কনফিগ আপডেট হয়েছে" : "Global config updated");
    } catch {
      showMsg(lang === "bn" ? "আপডেট ব্যর্থ" : "Update failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            🤖 {lang === "bn" ? "এআই এজেন্ট সিস্টেম" : "AI Agent System"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn"
              ? "মাল্টি-এজেন্ট রিসার্চ সিস্টেম — প্রতিটি সেক্টরের জন্য আলাদা এআই এজেন্ট"
              : "Multi-agent research system — dedicated AI agents for each sector"}
          </p>
        </div>
        <button
          onClick={runAll}
          disabled={running === "all"}
          className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
        >
          {running === "all"
            ? (lang === "bn" ? "⏳ চলছে..." : "⏳ Running...")
            : (lang === "bn" ? "🔄 সব চালান" : "🔄 Run All")}
        </button>
      </div>

      {/* Toast Notification */}
      {msg && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-slide-up ${
          msg.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatBox
            label={lang === "bn" ? "মোট এজেন্ট" : "Total Agents"}
            value={stats.total}
            color="text-primary"
          />
          <StatBox
            label={lang === "bn" ? "সক্রিয়" : "Active"}
            value={stats.active}
            color="text-green-600"
          />
          <StatBox
            label={lang === "bn" ? "নিষ্ক্রিয়" : "Idle"}
            value={stats.idle}
            color="text-yellow-600"
          />
          <StatBox
            label={lang === "bn" ? "ত্রুটি" : "Error"}
            value={stats.error}
            color="text-red-600"
          />
          <StatBox
            label={lang === "bn" ? "রিপোর্ট" : "Reports"}
            value={stats.totalReports}
            color="text-purple-600"
          />
        </div>
      )}

      {/* Global Model Selector */}
      {globalConfig && (
        <GlobalModelSelector
          config={globalConfig}
          onUpdate={updateGlobal}
          lang={lang}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-primary shadow-sm"
                : "text-text-secondary hover:text-text"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{lang === "bn" ? tab.bn : tab.en}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-base font-semibold text-text mb-3">
              {lang === "bn" ? "🏗️ এজেন্ট ট্রি" : "🏗️ Agent Tree"}
            </h2>
            <AgentTree tree={tree} onAgentClick={openDrawer} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text mb-3">
              {lang === "bn" ? "📋 সর্বশেষ কার্যকলাপ" : "📋 Latest Activity"}
            </h2>
            <ActivityLog logs={logs.slice(0, 10)} />
          </div>
        </div>
      )}

      {activeTab === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <AgentCard
              key={agent.agent_id}
              agent={agent}
              onRun={() => runAgent(agent.agent_id)}
              onViewDetail={() => openDrawer(agent.agent_id)}
              onConfig={() => {
                setSelectedAgent(agent);
                setActiveTab("config");
              }}
            />
          ))}
        </div>
      )}

      {activeTab === "activity" && (
        <div>
          <ActivityLog logs={logs} showFilters />
        </div>
      )}

      {activeTab === "config" && (
        <div>
          <ConfigPanel
            agents={agents}
            onUpdate={updateAgentConfig}
            lang={lang}
          />
        </div>
      )}

      {/* Detail Drawer */}
      <AgentDetailDrawer
        open={drawerOpen}
        agent={selectedAgent}
        report={selectedReport}
        submissions={agentSubmissions}
        logs={agentLogs}
        onClose={closeDrawer}
        onRun={runAgent}
        lang={lang}
      />
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 text-center hover:shadow-sm transition-shadow">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-text-secondary mt-1">{label}</div>
    </div>
  );
}

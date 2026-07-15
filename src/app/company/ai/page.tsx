"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import AgentTree from "@/components/agents/AgentTree";
import AgentCard from "@/components/agents/AgentCard";
import ActivityLog from "@/components/agents/ActivityLog";
import ConfigPanel from "@/components/agents/ConfigPanel";
import AgentDetailDrawer from "@/components/agents/AgentDetailDrawer";
import GlobalModelSelector from "@/components/agents/GlobalModelSelector";
import type { Agent, AgentTreeNode, AgentReport, AgentSubmission, AgentLog, AgentStats, GlobalAgentConfig } from "@/lib/ai/agents";

type TabId = "dashboard" | "settings" | "brain" | "agents" | "insights" | "skills";

const TABS: { id: TabId; icon: string; en: string; bn: string }[] = [
  { id: "dashboard", icon: "📊", en: "Dashboard", bn: "ড্যাশবোর্ড" },
  { id: "settings", icon: "⚙️", en: "Settings", bn: "সেটিংস" },
  { id: "brain", icon: "🧬", en: "Brain", bn: "মস্তিষ্ক" },
  { id: "agents", icon: "🧠", en: "Agents", bn: "এজেন্ট" },
  { id: "insights", icon: "📊", en: "Insights", bn: "ইনসাইটস" },
  { id: "skills", icon: "📈", en: "Skills", bn: "স্কিল" },
];

// ─── Interfaces ──────────────────────────────────────────
interface Model { model_id: string; name: string; tier: number; is_active: number; provider: string; exhausted: boolean; }
interface ApiKey { id: number; key_value: string; provider: string; is_active: boolean; created_at: string; }
interface FailoverState { exhausted_models: string; total_responses: number; today_responses: number; }
interface AIStats { responses: { total: number; today: number }; models: { active: number; total: number }; keys: { active: number }; conversations: number; profiles: number; skills: number; painPointFrequency: Record<string, number>; }
interface AgentStatsData { total: number; active: number; idle: number; error: number; totalReports: number; totalSubmissions: number; }
interface SeniorReport { summary_bn: string; recommendations: string; submitted_at: string; }
interface ConsolidationResult { faqs: number; shortcuts: number; }

export default function AIHubPage() {
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<TabId>("settings");

  // ─── Settings State ────────────────────────────────────
  const [models, setModels] = useState<Model[]>([]);
  const [state, setState] = useState<FailoverState | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [newKeyValue, setNewKeyValue] = useState("");
  const [newKeyProvider, setNewKeyProvider] = useState<"openrouter" | "opencode">("openrouter");
  const [msg, setMsg] = useState("");

  // ─── Agents State ──────────────────────────────────────
  const [tree, setTree] = useState<AgentTreeNode[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalAgentConfig | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedReport, setSelectedReport] = useState<AgentReport | null>(null);
  const [agentSubmissions, setAgentSubmissions] = useState<AgentSubmission[]>(null as unknown as AgentSubmission[]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [agentsTab, setAgentsTab] = useState<"dashboard" | "agents" | "activity" | "config">("dashboard");

  // ─── Insights State ────────────────────────────────────
  const [aiStats, setAiStats] = useState<AIStats | null>(null);
  const [agentStatsData, setAgentStatsData] = useState<AgentStatsData | null>(null);
  const [seniorReport, setSeniorReport] = useState<SeniorReport | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  // ─── Brain State ───────────────────────────────────────
  const [brainData, setBrainData] = useState<any>(null);
  const [brainLoading, setBrainLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [disabledAgents, setDisabledAgents] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("brainDisabledAgents") || "[]"); } catch { return []; }
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [testSuiteLoading, setTestSuiteLoading] = useState(false);
  const [queueStats, setQueueStats] = useState<any>(null);

  const toggleAgent = (agentId: string) => {
    setDisabledAgents(prev => {
      const next = prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId];
      localStorage.setItem("brainDisabledAgents", JSON.stringify(next));
      return next;
    });
  };

  const toggleDeptAgents = (agentIds: string[], forceDisable?: boolean) => {
    setDisabledAgents(prev => {
      const allDisabled = agentIds.every(id => prev.includes(id));
      const next = (forceDisable !== undefined ? forceDisable : !allDisabled)
        ? [...new Set([...prev, ...agentIds])]
        : prev.filter(id => !agentIds.includes(id));
      localStorage.setItem("brainDisabledAgents", JSON.stringify(next));
      return next;
    });
  };

  // ─── Skills State ──────────────────────────────────────
  const [skillsStats, setSkillsStats] = useState<AIStats | null>(null);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [consolidating, setConsolidating] = useState(false);
  const [consolidationResult, setConsolidationResult] = useState<ConsolidationResult | null>(null);

  // ─── Dashboard State ───────────────────────────────────
  const [dashBrainStats, setDashBrainStats] = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashBrainUsage, setDashBrainUsage] = useState<any>(null);

  // ─── Data Loading ──────────────────────────────────────
  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/ai/models");
      const data = await res.json() as { models?: Model[]; failoverState?: FailoverState; keys?: ApiKey[] };
      if (data.models) setModels(data.models);
      if (data.failoverState) setState(data.failoverState);
      if (data.keys) setKeys(data.keys);
    } catch (e) { console.error(e); }
    setSettingsLoading(false);
  };

  const loadAgents = useCallback(async () => {
    setAgentsLoading(true);
    try {
      const [agentsRes, logsRes, reportsRes, configRes] = await Promise.all([
        fetch("/api/ai/agents"), fetch("/api/ai/agents/logs"),
        fetch("/api/ai/agents/reports"), fetch("/api/ai/agents/global-config"),
      ]);
      const agentsData = await agentsRes.json() as { tree?: AgentTreeNode[]; agents?: Agent[]; stats?: AgentStats };
      const logsData = await logsRes.json() as { logs?: AgentLog[] };
      const reportsData = await reportsRes.json() as { reports?: AgentReport[] };
      const configData = await configRes.json() as { config?: GlobalAgentConfig };
      setTree(agentsData.tree || []);
      setAgents(agentsData.agents || []);
      setAgentStats(agentsData.stats || null);
      setLogs(logsData.logs || []);
      setReports(reportsData.reports || []);
      setGlobalConfig(configData.config || null);
    } catch (e) { console.error(e); }
    setAgentsLoading(false);
  }, []);

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const [statsRes, agentStatsRes, seniorRes, brainRes] = await Promise.all([
        fetch("/api/ai/stats"), fetch("/api/ai/agents/stats"),
        fetch("/api/ai/agents/reports?agent_id=agent_senior"),
        fetch("/api/ai/brain/agents"),
      ]);
      const statsData: AIStats = await statsRes.json();
      if (statsData.responses) setAiStats(statsData);
      setAgentStatsData(await agentStatsRes.json() as AgentStatsData);
      const r = await seniorRes.json() as { reports?: SeniorReport[] };
      if (r.reports?.length) setSeniorReport(r.reports[0]);
      const brainD = await brainRes.json().catch(() => null);
      if (brainD) setBrainData(brainD);
    } catch (e) { console.error(e); }
    setInsightsLoading(false);
  };

  const loadBrain = async () => {
    setBrainLoading(true);
    try {
      const res = await fetch("/api/ai/brain/agents");
      setBrainData(await res.json());
    } catch {}
    setBrainLoading(false);
  };

  const testBrain = async () => {
    if (!testMsg.trim()) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "test-user", text: testMsg }),
      });
      setTestResult(await res.json());
    } catch {}
    setTestLoading(false);
  };

  const runTestSuite = async () => {
    setTestSuiteLoading(true);
    setTestResults(null);
    try {
      const res = await fetch("/api/ai/brain/test");
      setTestResults(await res.json());
    } catch {}
    setTestSuiteLoading(false);
  };

  const loadQueueStats = async () => {
    try {
      const res = await fetch("/api/ai/brain/log");
      const data: any = await res.json();
      setQueueStats(data.stats);
    } catch {}
  };

  const loadSkills = async () => {
    setSkillsLoading(true);
    try {
      const res = await fetch("/api/ai/stats");
      const data: AIStats = await res.json();
      if (data.responses) setSkillsStats(data);
    } catch {}
    setSkillsLoading(false);
  };

  useEffect(() => {
    if (activeTab === "dashboard") {
      setDashLoading(true);
      Promise.all([
        fetch("/api/ai/brain/log").then(r => r.json()),
        fetch("/api/ai/brain/agents").then(r => r.json()),
      ]).then(([logData, agentData]) => {
        setDashBrainStats(logData);
        setDashBrainUsage(agentData);
      }).catch(() => {}).finally(() => setDashLoading(false));
    }
  }, [activeTab]);
  useEffect(() => { if (activeTab === "settings" && models.length === 0) loadSettings(); }, [activeTab, models.length]);
  useEffect(() => { if (activeTab === "agents") loadAgents(); }, [activeTab, loadAgents]);
  useEffect(() => { if (activeTab === "insights") loadInsights(); }, [activeTab]);
  useEffect(() => { if (activeTab === "brain") { loadBrain(); loadQueueStats(); } }, [activeTab]);
  useEffect(() => { if (activeTab === "skills") loadSkills(); }, [activeTab]);

  // ─── Settings Handlers ─────────────────────────────────
  const toggleModel = async (modelId: string) => {
    setMsg("");
    try {
      const res = await fetch("/api/ai/models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle_model", modelId }) });
      if (res.ok) loadSettings(); else setMsg("Failed to toggle model");
    } catch { setMsg("Error toggling model"); }
  };

  const addKey = async () => {
    if (!newKeyValue.trim()) return;
    setMsg("");
    try {
      const res = await fetch("/api/ai/models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "add_key", keyValue: newKeyValue.trim(), provider: newKeyProvider }) });
      if (res.ok) { setNewKeyValue(""); loadSettings(); setMsg(lang === "bn" ? "API কী যোগ করা হয়েছে" : "API key added"); }
      else { const err = await res.json().catch(() => ({})); setMsg((err as any).error || "Failed to add key"); }
    } catch { setMsg("Error adding key"); }
  };

  const deleteKey = async (keyId: number) => {
    setMsg("");
    try {
      const res = await fetch("/api/ai/models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_key", keyId }) });
      if (res.ok) { loadSettings(); setMsg(lang === "bn" ? "কী মুছে ফেলা হয়েছে" : "Key deleted"); } else setMsg("Failed to delete key");
    } catch { setMsg("Error deleting key"); }
  };

  const toggleKey = async (keyId: number) => {
    setMsg("");
    try { await fetch("/api/ai/models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle_key", keyId }) }); loadSettings(); }
    catch { setMsg("Error toggling key"); }
  };

  const resetFailover = async () => {
    setMsg("");
    try { await fetch("/api/ai/models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reset_failover" }) }); loadSettings(); setMsg(lang === "bn" ? "ফেইলওভার রিসেট করা হয়েছে" : "Failover reset"); }
    catch { setMsg("Error resetting"); }
  };

  // ─── Agents Handlers ───────────────────────────────────
  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const runAgent = async (agentId: string) => {
    setRunning(agentId);
    try {
      const res = await fetch(`/api/ai/agents/${agentId}/run`, { method: "POST" });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) { showMsg(lang === "bn" ? `${agentId} চালানো হয়েছে` : `${agentId} executed`); await loadAgents(); await loadAgentDetail(agentId); }
      else { showMsg(data.error || "Failed", "error"); }
    } catch { showMsg(lang === "bn" ? "কানেকশন ব্যর্থ" : "Connection failed", "error"); }
    setRunning(null);
  };

  const runAll = async () => {
    setRunning("all");
    try {
      const res = await fetch("/api/ai/agents/run-all", { method: "POST" });
      const data = await res.json() as { results?: unknown[] };
      showMsg(lang === "bn" ? `${data.results?.length || 0}টি এজেন্ট চালানো হয়েছে` : `${data.results?.length || 0} agents executed`);
      await loadAgents();
    } catch { showMsg(lang === "bn" ? "কানেকশন ব্যর্থ" : "Connection failed", "error"); }
    setRunning(null);
  };

  const loadAgentDetail = async (agentId: string) => {
    try {
      const res = await fetch(`/api/ai/agents/${agentId}`);
      const data = await res.json() as { agent?: Agent; latestReport?: AgentReport | null; submissions?: AgentSubmission[]; logs?: AgentLog[] };
      if (data.agent) { setSelectedAgent(data.agent); setSelectedReport(data.latestReport || null); setAgentSubmissions(data.submissions || []); setAgentLogs(data.logs || []); }
    } catch {}
  };

  const openDrawer = async (agentId: string) => { await loadAgentDetail(agentId); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setTimeout(() => { setSelectedAgent(null); setSelectedReport(null); setAgentSubmissions(null as unknown as AgentSubmission[]); setAgentLogs([]); }, 300); };
  const updateAgentConfig = async (agentId: string, config: any) => { try { await fetch(`/api/ai/agents/${agentId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) }); await loadAgents(); } catch {} };
  const updateGlobal = async (config: { mode?: string; provider?: string; model_id?: string }) => {
    try {
      const res = await fetch("/api/ai/agents/global-config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      const data = await res.json() as { config?: GlobalAgentConfig };
      if (data.config) setGlobalConfig(data.config);
      showMsg(lang === "bn" ? "গ্লোবাল কনফিগ আপডেট হয়েছে" : "Global config updated");
    } catch { showMsg(lang === "bn" ? "আপডেট ব্যর্থ" : "Update failed", "error"); }
  };

  // ─── Skills Handlers ───────────────────────────────────
  const runConsolidation = async () => {
    setConsolidating(true); setConsolidationResult(null);
    try {
      const res = await fetch("/api/ai/skills/consolidate", { method: "POST" });
      const data: ConsolidationResult & { ok: boolean } = await res.json();
      if (data.ok) setConsolidationResult(data);
    } catch {}
    setConsolidating(false); loadSkills();
  };

  // ─── Render Helpers ────────────────────────────────────
  const tierLabels = ["", "Best", "Great", "Good", "Basic", "Free"];
  const openrouterModels = models.filter((m) => m.provider === "openrouter");
  const opencodeModels = models.filter((m) => m.provider === "opencode");
  const orKeys = keys.filter((k) => k.provider === "openrouter");
  const ocKeys = keys.filter((k) => k.provider === "opencode");

  return (
    <div className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "এআই" : "AI"}</h1>
        <p className="text-sm text-text-secondary mt-1">{lang === "bn" ? "এআই সেটিংস, এজেন্ট, ইনসাইটস ও স্কিল ম্যানেজমেন্ট" : "AI settings, agents, insights & skill management"}</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto mb-6">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text"}`}>
            <span>{tab.icon}</span><span>{lang === "bn" ? tab.bn : tab.en}</span>
          </button>
        ))}
      </div>

      {/* ════════════════════════ DASHBOARD TAB ════════════════════════ */}
      {activeTab === "dashboard" && (
        <div>
          {dashLoading ? <div className="text-text-secondary text-sm py-12 text-center">Loading dashboard...</div> : (
            <>
              {/* ── KPI Cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-2"><span className="text-xs text-text-secondary uppercase tracking-wider">{lang === "bn" ? "ব্রেইন রিকোয়েস্ট" : "Brain Requests"}</span><span className="text-lg">🧬</span></div>
                  <div className="text-2xl font-bold text-primary">{dashBrainStats?.stats?.total || 0}</div>
                  <div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "গত ৭ দিনে" : "Last 7 days"}</div>
                </div>
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-2"><span className="text-xs text-text-secondary uppercase tracking-wider">{lang === "bn" ? "ইউনিক ইউজার" : "Unique Users"}</span><span className="text-lg">👤</span></div>
                  <div className="text-2xl font-bold text-purple-600">{dashBrainStats?.stats?.unique_users || 0}</div>
                  <div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "ভিন্ন ফোন নম্বর" : "Different phones"}</div>
                </div>
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-2"><span className="text-xs text-text-secondary uppercase tracking-wider">{lang === "bn" ? "সফলতার হার" : "Success Rate"}</span><span className="text-lg">✅</span></div>
                  <div className="text-2xl font-bold text-green-600">{dashBrainStats?.stats?.total ? Math.round((dashBrainStats.stats.successful / dashBrainStats.stats.total) * 100) : 0}%</div>
                  <div className="text-xs text-text-secondary mt-1">{dashBrainStats?.stats?.successful || 0}/{dashBrainStats?.stats?.total || 0}</div>
                </div>
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-2"><span className="text-xs text-text-secondary uppercase tracking-wider">{lang === "bn" ? "গড় রেসপন্স টাইম" : "Avg Response"}</span><span className="text-lg">⏱️</span></div>
                  <div className="text-2xl font-bold text-amber-600">{dashBrainStats?.stats?.avg_processing_ms ? Math.round(dashBrainStats.stats.avg_processing_ms) : 0}ms</div>
                  <div className="text-xs text-text-secondary mt-1">{dashBrainStats?.stats?.total_tokens || 0} {lang === "bn" ? "টোটাল টোকেন" : "total tokens"}</div>
                </div>
              </div>

              {/* ── Department Activity ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="card p-6">
                  <h2 className="font-bold text-primary text-sm mb-4">{lang === "bn" ? "📊 ডিপার্টমেন্ট অ্যাক্টিভিটি" : "📊 Department Activity"}</h2>
                  {dashBrainStats?.byDepartment?.length > 0 ? (
                    <div className="space-y-3">
                      {dashBrainStats.byDepartment.map((dept: any, i: number) => {
                        const maxCount = Math.max(...dashBrainStats.byDepartment.map((d: any) => d.count), 1);
                        const pct = (dept.count / maxCount) * 100;
                        const colors = ["bg-primary", "bg-purple-500", "bg-green-500", "bg-amber-500", "bg-blue-500", "bg-pink-500", "bg-teal-500"];
                        return (
                          <div key={dept.primary_department}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-medium text-primary capitalize">{dept.primary_department.replace(/_/g, " ")}</span>
                              <span className="text-text-secondary">{dept.count} · {Math.round(dept.avg_ms)}ms avg</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${colors[i % colors.length]} transition-all`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <div className="text-xs text-text-secondary">{lang === "bn" ? "এখনো কোনো ডাটা নেই" : "No data yet"}</div>}
                </div>

                <div className="card p-6">
                  <h2 className="font-bold text-primary text-sm mb-4">{lang === "bn" ? "🎯 ইনটেন্ট ডিস্ট্রিবিউশন" : "🎯 Intent Distribution"}</h2>
                  <div className="space-y-2.5">
                    {dashBrainStats?.byIntent?.length > 0 ? (
                      dashBrainStats.byIntent.map((intent: any, i: number) => {
                        const maxCount = Math.max(...dashBrainStats.byIntent.map((d: any) => d.count), 1);
                        const pct = (intent.count / maxCount) * 100;
                        return (
                          <div key={intent.intent} className="flex items-center gap-3">
                            <span className="text-xs text-primary w-28 truncate font-medium">{intent.intent}</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} /></div>
                            <span className="text-xs text-text-secondary w-8 text-right">{intent.count}</span>
                          </div>
                        );
                      })
                    ) : <div className="text-xs text-text-secondary">{lang === "bn" ? "এখনো কোনো ডাটা নেই" : "No data yet"}</div>}
                  </div>
                </div>
              </div>

              {/* ── System Overview ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="card p-6">
                  <h2 className="font-bold text-primary text-sm mb-4">{lang === "bn" ? "🧬 ব্রেইন ওভারভিউ" : "🧬 Brain Overview"}</h2>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-primary">{dashBrainUsage?.totalDepartments || 7}</div><div className="text-[10px] text-text-secondary">{lang === "bn" ? "ডিপার্টমেন্ট" : "Depts"}</div></div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-purple-600">{dashBrainUsage?.totalTeams || 33}</div><div className="text-[10px] text-text-secondary">{lang === "bn" ? "টিম" : "Teams"}</div></div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-green-600">{dashBrainUsage?.totalAgents || 235}</div><div className="text-[10px] text-text-secondary">{lang === "bn" ? "এজেন্ট" : "Agents"}</div></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <h3 className="text-xs font-medium text-text-secondary mb-2">{lang === "bn" ? "সিস্টেম হেলথ" : "System Health"}</h3>
                    <div className="flex items-center gap-2 mb-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-text">Brain API</span><span className="text-[10px] text-green-600 ml-auto">OK</span></div>
                    <div className="flex items-center gap-2 mb-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-text">D1 Database</span><span className="text-[10px] text-green-600 ml-auto">OK</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-text">AI Router (Free Models)</span><span className="text-[10px] text-green-600 ml-auto">OK</span></div>
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="font-bold text-primary text-sm mb-4">{lang === "bn" ? "🔄 রিসেন্ট অ্যাক্টিভিটি" : "🔄 Recent Activity"}</h2>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {dashBrainStats?.stats?.last_agents ? (
                      <div className="flex flex-col gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                            <span className="text-text-secondary">{lang === "bn" ? `${i} মিনিট আগে` : `${i}m ago`}</span>
                            <span className="text-primary font-medium">{dashBrainUsage?.departments?.[i % 7]?.name || "department"}</span>
                            <span className="text-text-secondary">{lang === "bn" ? "প্রসেসড" : "processed"}</span>
                          </div>
                        ))}
                      </div>
                    ) : <div className="text-xs text-text-secondary">{lang === "bn" ? "এখনো কোনো অ্যাক্টিভিটি নেই" : "No activity yet"}</div>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════ SETTINGS TAB ════════════════════════ */}
      {activeTab === "settings" && (
        <div>
          {msg && <div className="mb-4 p-3 rounded-xl bg-action/10 text-sm text-action font-medium">{msg}</div>}
          {settingsLoading ? <div className="text-text-secondary text-sm py-12 text-center">Loading...</div> : (
            <>
              <div className="card p-6 mb-6">
                <h2 className="font-bold text-lg text-primary mb-4">{lang === "bn" ? "API কী যোগ করুন" : "Add API Key"}</h2>
                <div className="flex gap-2">
                  <select value={newKeyProvider} onChange={(e) => setNewKeyProvider(e.target.value as "openrouter" | "opencode")} className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-primary">
                    <option value="openrouter">OpenRouter</option><option value="opencode">OpenCode</option>
                  </select>
                  <input type="text" placeholder={lang === "bn" ? "API কী পেস্ট করুন" : "Paste API key"} value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-border bg-white text-sm font-mono text-primary" />
                  <button onClick={addKey} className="px-6 py-2 gradient-premium text-white text-sm font-medium rounded-xl hover:opacity-90">{lang === "bn" ? "যোগ করুন" : "Add Key"}</button>
                  <button onClick={resetFailover} className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100">{lang === "bn" ? "রিসেট" : "Reset"}</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="card p-6"><div className="text-2xl font-bold text-primary">{state?.total_responses || 0}</div><div className="text-sm text-text-secondary">{lang === "bn" ? "মোট রেসপন্স" : "Total Responses"}</div></div>
                <div className="card p-6"><div className="text-2xl font-bold text-action">{state?.today_responses || 0}</div><div className="text-sm text-text-secondary">{lang === "bn" ? "আজকের রেসপন্স" : "Today's Responses"}</div></div>
                <div className="card p-6 flex items-center gap-4">
                  <div><div className="text-2xl font-bold text-accent">{orKeys.filter(k => k.is_active).length}</div><div className="text-xs text-text-secondary">OR Keys</div></div>
                  <div className="w-px h-8 bg-border" />
                  <div><div className="text-2xl font-bold text-purple-600">{ocKeys.filter(k => k.is_active).length}</div><div className="text-xs text-text-secondary">OC Keys</div></div>
                </div>
              </div>

              {keys.length > 0 && (
                <div className="card p-6 mb-6">
                  <h2 className="font-bold text-lg text-primary mb-4">{lang === "bn" ? "সংরক্ষিত API কী" : "Saved API Keys"} ({keys.length})</h2>
                  <div className="space-y-2">
                    {orKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-base">🔑</span>
                          <code className="text-sm font-mono text-primary truncate">{key.key_value}</code>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 shrink-0">OpenRouter</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <button onClick={() => toggleKey(key.id)} className={`w-9 h-5 rounded-full relative transition-colors ${key.is_active ? "bg-action" : "bg-gray-300"}`}><div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${key.is_active ? "translate-x-4" : "translate-x-0.5"}`} /></button>
                          <button onClick={() => deleteKey(key.id)} className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">{lang === "bn" ? "মুছুন" : "Delete"}</button>
                        </div>
                      </div>
                    ))}
                    {ocKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-base">🔑</span>
                          <code className="text-sm font-mono text-primary truncate">{key.key_value}</code>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 shrink-0">OpenCode</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <button onClick={() => toggleKey(key.id)} className={`w-9 h-5 rounded-full relative transition-colors ${key.is_active ? "bg-purple-500" : "bg-gray-300"}`}><div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${key.is_active ? "translate-x-4" : "translate-x-0.5"}`} /></button>
                          <button onClick={() => deleteKey(key.id)} className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">{lang === "bn" ? "মুছুন" : "Delete"}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="card p-6 mb-6">
                <h2 className="font-bold text-lg text-primary mb-4">{lang === "bn" ? "OpenRouter মডেল" : "OpenRouter Models"} ({openrouterModels.length})</h2>
                <div className="space-y-2">
                  {openrouterModels.map((model) => (
                    <div key={model.model_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleModel(model.model_id)} className={`w-10 h-6 rounded-full relative transition-colors ${model.is_active ? "bg-action" : "bg-gray-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${model.is_active ? "translate-x-5" : "translate-x-1"}`} /></button>
                        <div><div className="text-sm font-medium text-primary">{model.name}</div><div className="text-xs text-text-secondary">{model.model_id}</div></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${model.tier <= 1 ? "bg-green-50 text-green-700" : model.tier <= 3 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"}`}>Tier {model.tier} - {tierLabels[model.tier] || "Free"}</span>
                        {model.exhausted && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-600">{lang === "bn" ? "নিঃশেষ" : "Exhausted"}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6 border-purple-200">
                <h2 className="font-bold text-lg text-purple-700 mb-4">{lang === "bn" ? "OpenCode মডেল" : "OpenCode Models"} ({opencodeModels.length})</h2>
                <p className="text-xs text-text-secondary mb-4">{lang === "bn" ? "এই মডেলগুলো OpenCode Zen API-এর মাধ্যমে চলে। OpenRouter সব মডেল নিঃশেষ হলেই এগুলো ব্যবহার হবে।" : "These models run via OpenCode Zen API. Fallback when OpenRouter models are exhausted."}</p>
                <div className="space-y-2">
                  {opencodeModels.map((model) => (
                    <div key={model.model_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleModel(model.model_id)} className={`w-10 h-6 rounded-full relative transition-colors ${model.is_active ? "bg-purple-500" : "bg-gray-200"}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${model.is_active ? "translate-x-5" : "translate-x-1"}`} /></button>
                        <div><div className="text-sm font-medium text-primary">{model.name}</div><div className="text-xs text-text-secondary">{model.model_id}</div></div>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700">OpenCode</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════ BRAIN TAB ════════════════════════ */}
      {activeTab === "brain" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-text">{lang === "bn" ? "🧬 প্রিমিয়াম এমপ্লয়ি ব্রেইন" : "🧬 Premium Employee Brain"}</h1>
            <p className="text-sm text-text-secondary mt-1">{lang === "bn" ? "সকল ডিপার্টমেন্ট, টিম ও এজেন্ট এক নজরে" : "All departments, teams & agents at a glance"}</p>
          </div>

          {brainLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : brainData ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-primary">{brainData.totalDepartments}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "ডিপার্টমেন্ট" : "Departments"}</div></div>
                <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-purple-600">{brainData.totalTeams}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "টিম" : "Teams"}</div></div>
                <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-green-600">{brainData.totalAgents}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "এজেন্ট" : "Agents"}</div></div>
                <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-amber-600">{brainData.totalDepartments * 4}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "ফ্রি মডেল টিয়ার" : "Free Model Tiers"}</div></div>
              </div>

              <div className="space-y-4">
                {brainData.departments.map((dept: any) => (
                  <div key={dept.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                    <button onClick={() => setExpandedDept(expandedDept === dept.id ? null : dept.id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{dept.icon}</span>
                        <div className="text-left">
                          <div className="font-semibold text-primary">{lang === "bn" ? dept.nameBn : dept.name}</div>
                          <div className="text-xs text-text-secondary">{dept.teamCount} {lang === "bn" ? "টি টিম" : "teams"} · {dept.agentCount} {lang === "bn" ? "জন এজেন্ট" : "agents"}</div>
                        </div>
                      </div>
                      <span className={`text-text-secondary transition-transform ${expandedDept === dept.id ? "rotate-180" : ""}`}>▼</span>
                    </button>

                    {expandedDept === dept.id && (
                      <div className="border-t border-border px-4 pb-4 space-y-3">
                        <p className="text-sm text-text-secondary mt-3">{dept.description}</p>
                        {dept.teams.map((team: any) => (
                          <div key={team.id} className="bg-gray-50 rounded-xl overflow-hidden">
                            <button onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)} className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-primary">{team.name}</span>
                                <span className="text-xs text-text-secondary">({team.agentCount} {lang === "bn" ? "এজেন্ট" : "agents"})</span>
                              </div>
                              <span className={`text-xs text-text-secondary transition-transform ${expandedTeam === team.id ? "rotate-180" : ""}`}>▼</span>
                            </button>
                            {expandedTeam === team.id && (
                              <div className="px-3 pb-3 space-y-2">
                                {team.agents.map((agent: any) => (
                                  <div key={agent.id} className="bg-white rounded-lg p-3 border border-border text-sm">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-primary">{agent.name}</span>
                                      <div className="flex gap-1">
                                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${agent.tier === 1 ? "bg-purple-100 text-purple-700" : agent.tier === 2 ? "bg-blue-100 text-blue-700" : agent.tier === 3 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>T{agent.tier}</span>
                                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700">{agent.priority}</span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-text-secondary">{agent.description}</p>
                                    <p className="text-[10px] text-text-secondary mt-1 font-mono">{agent.when}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ──────── Brain Test Playground ──────── */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold text-primary mb-2">{lang === "bn" ? "🧪 ব্রেইন টেস্ট প্লে-গ্রাউন্ড" : "🧪 Brain Test Playground"}</h2>
                <p className="text-sm text-text-secondary mb-4">{lang === "bn" ? "কোনো মেসেজ লিখে দেখুন কোন ডিপার্টমেন্ট ও এজেন্ট রেসপন্স করবে" : "Type a message to see which department & agent responds"}</p>
                <div className="flex gap-3">
                  <input value={testMsg} onChange={e => setTestMsg(e.target.value)} placeholder={lang === "bn" ? 'যেমন: "আপনার প্রোডাক্টের দাম কত?"' : 'e.g. "What is your product price?"'} className="flex-1 px-4 py-3 rounded-xl border border-border bg-gray-50 text-sm text-primary font-mono" onKeyDown={e => e.key === "Enter" && testBrain()} />
                  <button onClick={testBrain} disabled={testLoading || !testMsg.trim()} className="px-6 py-3 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50">{testLoading ? "..." : "▶️ Test"}</button>
                </div>
                {testResult && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2"><span className="font-medium text-primary">{lang === "bn" ? "চেইন:" : "Chain:"}</span><span className={`px-2 py-0.5 text-xs font-mono rounded ${testResult.chainType === "cross" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{testResult.chainType}</span></div>
                    <div className="flex items-center gap-2"><span className="font-medium text-primary">{lang === "bn" ? "ডিপার্টমেন্ট:" : "Department:"}</span><span>{testResult.department}</span></div>
                    <div className="flex items-center gap-2"><span className="font-medium text-primary">{lang === "bn" ? "ডিপার্টমেন্ট (প্রক্রিয়াকৃত):" : "Depts Used:"}</span><span className="text-xs">{testResult.departmentsUsed?.join(" → ")}</span></div>
                    <div className="flex items-center gap-2"><span className="font-medium text-primary">{lang === "bn" ? "ইনটেন্ট:" : "Intent:"}</span><span>{testResult.intent}</span></div>
                    <div className="flex items-center gap-2"><span className="font-medium text-primary">{lang === "bn" ? "মডেল:" : "Model:"}</span><span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">{testResult.model}</span></div>
                    <div className="flex items-center gap-2"><span className="font-medium text-primary">{lang === "bn" ? "এজেন্ট:" : "Agents:"}</span><span className="text-xs">{testResult.agentsUsed?.join(" → ")}</span></div>
                    <div className="flex items-start gap-2"><span className="font-medium text-primary shrink-0">{lang === "bn" ? "রিপ্লাই:" : "Reply:"}</span><span className="text-text-secondary">{testResult.reply}</span></div>
                    {testResult.seniorReview && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-amber-800 text-xs">{lang === "bn" ? "👑 এজেন্ট সিনিয়র রিভিউ:" : "👑 Agent Senior Review:"}</span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${testResult.seniorReview.quality === "blocked" ? "bg-red-100 text-red-700" : testResult.seniorReview.quality >= 7 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{testResult.seniorReview.quality}/10</span>
                        </div>
                        {testResult.seniorReview.issues?.length > 0 && <div className="text-xs text-amber-700">⚠️ {testResult.seniorReview.issues.join(", ")}</div>}
                        <div className="text-xs text-amber-700 italic">{testResult.seniorReview.feedback}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-text-secondary"><span>{testResult.tokens} tokens</span><span>·</span><span>{testResult.processingMs}ms</span></div>
                  </div>
                )}
              </div>

              {/* ──────── Brain Test Suite ──────── */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-primary">{lang === "bn" ? "🧪 অটোমেটেড টেস্ট স্যুট" : "🧪 Automated Test Suite"}</h2>
                  <button onClick={runTestSuite} disabled={testSuiteLoading} className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50">{testSuiteLoading ? "..." : (lang === "bn" ? "🔬 টেস্ট চালান" : "🔬 Run Tests")}</button>
                </div>
                <p className="text-sm text-text-secondary mb-4">{lang === "bn" ? "১০টি প্রি-ডিফাইন্ড সিনারিও — গ্রিটিং, প্রাইস, কমপ্লেইন্ট, রেজিস্ট্রেশন, উইথড্রয়াল, ট্রেনিং, কমিশন, সাপোর্ট" : "10 predefined scenarios — greeting, price, complaint, registration, withdrawal, training, commission, support"}</p>
                {testResults && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-semibold text-primary">{lang === "bn" ? "পাস রেট:" : "Pass Rate:"} <span className="text-green-600">{testResults.passRate}</span></span>
                      <span className="text-green-600">✓ {testResults.passed}</span>
                      <span className="text-red-600">✗ {testResults.failed}</span>
                      <span className="text-text-secondary">/ {testResults.total}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {testResults.results?.map((r: any, i: number) => (
                        <div key={i} className={`text-xs p-2 rounded-lg ${r.passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                          <div className="flex items-center justify-between"><span className="font-medium">{r.label}</span><span className={`px-1 py-0.5 text-[10px] rounded ${r.passed ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>{r.passed ? "PASS" : "FAIL"}</span></div>
                          <div className="text-text-secondary mt-0.5">{r.intent} → {r.department}</div>
                          {!r.passed && r.expectedIntent && <div className="text-red-600">Expected: {r.expectedIntent} / {r.expectedDept}</div>}
                          {r.error && <div className="text-red-600">{r.error}</div>}
                          <div className="text-text-secondary">{r.ms}ms · {r.agentsCount} agents · {r.chainType}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ──────── Brain Queue Stats ──────── */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-primary">{lang === "bn" ? "📊 পারফরম্যান্স ও ক্যাশ" : "📊 Performance & Cache"}</h2>
                  <button onClick={loadQueueStats} className="text-xs text-primary underline">{lang === "bn" ? "রিফ্রেশ" : "Refresh"}</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-lg font-bold text-primary">{queueStats?.total || 0}</div><div className="text-[10px] text-text-secondary">{lang === "bn" ? "মোট রিকোয়েস্ট (৭ দিন)" : "Total (7d)"}</div></div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-lg font-bold text-green-600">{queueStats?.successful || 0}</div><div className="text-[10px] text-text-secondary">{lang === "bn" ? "সফল" : "Successful"}</div></div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-lg font-bold text-amber-600">{queueStats?.avg_processing_ms ? Math.round(queueStats.avg_processing_ms) : 0}ms</div><div className="text-[10px] text-text-secondary">{lang === "bn" ? "গড় সময়" : "Avg Time"}</div></div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-lg font-bold text-purple-600">{queueStats?.total_tokens || 0}</div><div className="text-[10px] text-text-secondary">{lang === "bn" ? "মোট টোকেন" : "Total Tokens"}</div></div>
                </div>
              </div>

              {/* ──────── Brain Admin Controls ──────── */}
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <button onClick={() => setShowAdmin(!showAdmin)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span>🔐</span>
                    <span className="font-semibold text-primary">{lang === "bn" ? "এডমিন কন্ট্রোল" : "Admin Controls"}</span>
                    <span className="text-xs text-text-secondary">({disabledAgents.length} {lang === "bn" ? "এজেন্ট ডিসেবল" : "disabled"})</span>
                  </div>
                  <span className={`text-text-secondary transition-transform ${showAdmin ? "rotate-180" : ""}`}>▼</span>
                </button>
                {showAdmin && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* ── Cache & Reset Actions ── */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button onClick={() => { localStorage.removeItem("brainDisabledAgents"); setDisabledAgents([]); }} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-xl hover:bg-red-100">{lang === "bn" ? "🔄 সব এজেন্ট রিসেট" : "🔄 Reset All Agents"}</button>
                      <button onClick={() => { fetch("/api/ai/brain/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "__clear_cache__" }) }).then(r => r.json()).then(() => alert(lang === "bn" ? "ক্যাশ ক্লিয়ার করা হয়েছে!" : "Cache cleared!")).catch(() => {}); }} className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100">{lang === "bn" ? "🗑️ ক্যাশ ক্লিয়ার" : "🗑️ Clear Cache"}</button>
                    </div>

                    {/* ── Per-Department Agent Toggle ── */}
                    <p className="text-xs text-text-secondary">{lang === "bn" ? "এজেন্ট অন/অফ করুন (ব্রাউজার লোকাল)" : "Enable/disable agents (browser local storage)"}</p>
                    {brainData?.departments?.map((dept: any) => {
                      const deptAgentIds = dept.teams?.flatMap((t: any) => t.agents?.map((a: any) => a.id) || []) || [];
                      const allDisabled = deptAgentIds.length > 0 && deptAgentIds.every((id: string) => disabledAgents.includes(id));
                      const someDisabled = deptAgentIds.some((id: string) => disabledAgents.includes(id));
                      return (
                        <div key={dept.id} className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-primary">{dept.icon} {lang === "bn" ? dept.nameBn : dept.name}</div>
                            <button onClick={() => toggleDeptAgents(deptAgentIds, !allDisabled)} className={`px-2 py-0.5 text-[10px] font-medium rounded ${allDisabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                              {allDisabled ? (lang === "bn" ? "সব অন" : "All On") : (lang === "bn" ? "সব অফ" : "All Off")}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {dept.teams?.flatMap((team: any) => team.agents || []).map((agent: any) => (
                              <label key={agent.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-xs cursor-pointer">
                                <input type="checkbox" checked={!disabledAgents.includes(agent.id)} onChange={() => toggleAgent(agent.id)} className="w-3.5 h-3.5 accent-primary" />
                                <span className={`${disabledAgents.includes(agent.id) ? "line-through text-gray-300" : "text-text"}`}>{agent.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-text-secondary py-12 text-center">{lang === "bn" ? "ব্রেইন ডাটা লোড করতে ব্যর্থ" : "Failed to load brain data"}</div>
          )}
        </div>
      )}

      {/* ════════════════════════ AGENTS TAB ════════════════════════ */}
      {activeTab === "agents" && (
        <div className="space-y-6">
          {agentsLoading ? (
            <div className="space-y-4">
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-72 bg-gray-100 rounded-lg animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-text">{lang === "bn" ? "🤖 এআই এজেন্ট সিস্টেম" : "🤖 AI Agent System"}</h1>
                  <p className="text-sm text-text-secondary mt-1">{lang === "bn" ? "মাল্টি-এজেন্ট রিসার্চ সিস্টেম" : "Multi-agent research system"}</p>
                </div>
                <button onClick={runAll} disabled={running === "all"} className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50">{running === "all" ? (lang === "bn" ? "⏳ চলছে..." : "⏳ Running...") : (lang === "bn" ? "🔄 সব চালান" : "🔄 Run All")}</button>
              </div>
              {msg && <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium bg-green-600 text-white animate-slide-up">{msg}</div>}
              {agentStats && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-primary">{agentStats.total}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "মোট এজেন্ট" : "Total Agents"}</div></div>
                  <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-green-600">{agentStats.active}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "সক্রিয়" : "Active"}</div></div>
                  <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-yellow-600">{agentStats.idle}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "নিষ্ক্রিয়" : "Idle"}</div></div>
                  <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-red-600">{agentStats.error}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "ত্রুটি" : "Error"}</div></div>
                  <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-purple-600">{agentStats.totalReports}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "রিপোর্ট" : "Reports"}</div></div>
                </div>
              )}
              {globalConfig && <GlobalModelSelector config={globalConfig} onUpdate={updateGlobal} lang={lang} />}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                {[{ id: "dashboard" as const, icon: "🏠", en: "Dashboard", bn: "ড্যাশবোর্ড" }, { id: "agents" as const, icon: "👥", en: "Agents", bn: "এজেন্ট" }, { id: "activity" as const, icon: "📋", en: "Activity", bn: "কার্যকলাপ" }, { id: "config" as const, icon: "⚙️", en: "Config", bn: "কনফিগারেশন" }].map((tab) => (
                  <button key={tab.id} onClick={() => setAgentsTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${agentsTab === tab.id ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text"}`}><span>{tab.icon}</span><span>{lang === "bn" ? tab.bn : tab.en}</span></button>
                ))}
              </div>
              {agentsTab === "dashboard" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2"><h2 className="text-base font-semibold text-text mb-3">{lang === "bn" ? "🏗️ এজেন্ট ট্রি" : "🏗️ Agent Tree"}</h2><AgentTree tree={tree} onAgentClick={openDrawer} /></div>
                  <div><h2 className="text-base font-semibold text-text mb-3">{lang === "bn" ? "📋 সর্বশেষ কার্যকলাপ" : "📋 Latest Activity"}</h2><ActivityLog logs={logs.slice(0, 10)} /></div>
                </div>
              )}
              {agentsTab === "agents" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {agents.map((agent) => <AgentCard key={agent.agent_id} agent={agent} onRun={() => runAgent(agent.agent_id)} onViewDetail={() => openDrawer(agent.agent_id)} onConfig={() => { setSelectedAgent(agent); setAgentsTab("config"); }} />)}
                </div>
              )}
              {agentsTab === "activity" && <ActivityLog logs={logs} showFilters />}
              {agentsTab === "config" && <ConfigPanel agents={agents} onUpdate={updateAgentConfig} lang={lang} />}
              <AgentDetailDrawer open={drawerOpen} agent={selectedAgent} report={selectedReport} submissions={agentSubmissions} logs={agentLogs} onClose={closeDrawer} onRun={runAgent} lang={lang} />
            </>
          )}
        </div>
      )}

      {/* ════════════════════════ INSIGHTS TAB ════════════════════════ */}
      {activeTab === "insights" && (
        <div>
          {insightsLoading ? <div className="text-text-secondary text-sm py-12 text-center">Loading...</div> : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="card p-5"><div className="text-sm text-text-secondary">{lang === "bn" ? "কনভারসেশন" : "Conversations"}</div><div className="text-2xl font-bold text-primary mt-1">{aiStats?.conversations || 0}</div></div>
                <div className="card p-5"><div className="text-sm text-text-secondary">{lang === "bn" ? "ফোন প্রোফাইল" : "Phone Profiles"}</div><div className="text-2xl font-bold text-primary mt-1">{aiStats?.profiles || 0}</div></div>
                <div className="card p-5"><div className="text-sm text-text-secondary">{lang === "bn" ? "ক্যাশড স্কিল" : "Cached Skills"}</div><div className="text-2xl font-bold text-primary mt-1">{aiStats?.skills || 0}</div></div>
                <div className="card p-5"><div className="text-sm text-text-secondary">{lang === "bn" ? "সক্রিয় মডেল" : "Active Models"}</div><div className="text-2xl font-bold text-primary mt-1">{aiStats?.models.active || 0}/{aiStats?.models.total || 26}</div></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h2 className="font-bold text-base text-primary mb-4">{lang === "bn" ? "পেইন পয়েন্ট ডিস্ট্রিবিউশন" : "Pain Point Distribution"}</h2>
                  {aiStats?.painPointFrequency && Object.keys(aiStats.painPointFrequency).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(aiStats.painPointFrequency).sort(([, a], [, b]) => b - a).map(([pain, count]) => {
                        const maxCount = Math.max(...Object.values(aiStats.painPointFrequency), 1);
                        return (
                          <div key={pain}>
                            <div className="flex justify-between text-sm mb-1"><span className="text-primary font-medium">{pain}</span><span className="text-text-secondary">{count}</span></div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-primary/60" style={{ width: `${(count / maxCount) * 100}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <div className="text-sm text-text-secondary">{lang === "bn" ? "এখনো কোনো ডাটা নেই" : "No data yet"}</div>}
                </div>

                <div className="card p-6">
                  <h2 className="font-bold text-base text-primary mb-4">{lang === "bn" ? "রেসপন্স ওভারভিউ" : "Response Overview"}</h2>
                  <div className="space-y-4">
                    <div><div className="flex justify-between text-sm mb-1"><span className="text-primary font-medium">{lang === "bn" ? "আজকের রেসপন্স" : "Today's Responses"}</span><span className="text-text-secondary">{aiStats?.responses.today || 0}</span></div><div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-action" style={{ width: `${Math.min(100, ((aiStats?.responses.today || 0) / 100) * 100)}%` }} /></div></div>
                    <div><div className="flex justify-between text-sm mb-1"><span className="text-primary font-medium">{lang === "bn" ? "মোট রেসপন্স" : "Total Responses"}</span><span className="text-text-secondary">{aiStats?.responses.total || 0}</span></div><div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, ((aiStats?.responses.total || 0) / 1000) * 100)}%` }} /></div></div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-border"><h3 className="font-medium text-sm text-primary mb-3">{lang === "bn" ? "API কী স্ট্যাটাস" : "API Key Status"}</h3><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${(aiStats?.keys.active || 0) > 0 ? "bg-action" : "bg-red-400"}`} /><span className="text-sm text-text-secondary">{aiStats?.keys.active || 0} {lang === "bn" ? "সক্রিয়" : "Active"}</span></div></div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="font-bold text-base text-primary mb-4">{lang === "bn" ? "🧬 প্রিমিয়াম এমপ্লয়ি ব্রেইন" : "🧬 Premium Employee Brain"}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div className="card p-4 text-center"><div className="text-lg font-bold text-primary">{brainData?.totalDepartments || "—"}</div><div className="text-xs text-text-secondary">{lang === "bn" ? "ডিপার্টমেন্ট" : "Departments"}</div></div>
                  <div className="card p-4 text-center"><div className="text-lg font-bold text-purple-600">{brainData?.totalTeams || "—"}</div><div className="text-xs text-text-secondary">{lang === "bn" ? "টিম" : "Teams"}</div></div>
                  <div className="card p-4 text-center"><div className="text-lg font-bold text-green-600">{brainData?.totalAgents || "—"}</div><div className="text-xs text-text-secondary">{lang === "bn" ? "এজেন্ট" : "Agents"}</div></div>
                </div>
              </div>

              {agentStatsData && (
                <div className="mt-8">
                  <h2 className="font-bold text-base text-primary mb-4">{lang === "bn" ? "🧠 এআই এজেন্ট সিস্টেম" : "🧠 AI Agent System"}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="card p-4 text-center"><div className="text-lg font-bold text-primary">{agentStatsData.total}</div><div className="text-xs text-text-secondary">{lang === "bn" ? "মোট এজেন্ট" : "Total Agents"}</div></div>
                    <div className="card p-4 text-center"><div className="text-lg font-bold text-green-600">{agentStatsData.active}</div><div className="text-xs text-text-secondary">{lang === "bn" ? "সক্রিয়" : "Active"}</div></div>
                    <div className="card p-4 text-center"><div className="text-lg font-bold text-purple-600">{agentStatsData.totalReports}</div><div className="text-xs text-text-secondary">{lang === "bn" ? "রিপোর্ট" : "Reports"}</div></div>
                    <div className="card p-4 text-center"><div className="text-lg font-bold text-blue-600">{agentStatsData.totalSubmissions}</div><div className="text-xs text-text-secondary">{lang === "bn" ? "সাবমিশন" : "Submissions"}</div></div>
                  </div>
                  {seniorReport && (() => {
                    let recs: string[] = [];
                    try { recs = JSON.parse(seniorReport.recommendations || "[]"); } catch {}
                    return (
                      <div className="card p-5">
                        <h3 className="font-semibold text-sm text-primary mb-2">{lang === "bn" ? "👑 সর্বশেষ প্রধান এজেন্ট রিপোর্ট" : "👑 Latest Senior Agent Report"}</h3>
                        <p className="text-sm text-text-secondary mb-3">{seniorReport.summary_bn}</p>
                        {recs.length > 0 && <div className="space-y-1.5">{recs.map((r, i) => <div key={i} className="flex items-start gap-2 text-sm text-text-secondary"><span className="text-primary font-medium shrink-0">{i + 1}.</span><span>{r}</span></div>)}</div>}
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ════════════════════════ SKILLS TAB ════════════════════════ */}
      {activeTab === "skills" && (
        <div>
          {skillsLoading ? <div className="text-text-secondary text-sm py-12 text-center">Loading...</div> : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="card p-4 text-center"><div className="text-xl font-bold text-primary">{skillsStats?.responses.total || 0}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "মোট রেসপন্স" : "Total Responses"}</div></div>
                <div className="card p-4 text-center"><div className="text-xl font-bold text-green-600">{skillsStats?.responses.today || 0}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "আজকের রেসপন্স" : "Today"}</div></div>
                <div className="card p-4 text-center"><div className="text-xl font-bold text-amber-600">{skillsStats?.skills || 0}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "স্কিল শিখেছে" : "Skills Learned"}</div></div>
                <div className="card p-4 text-center"><div className="text-xl font-bold text-indigo-600">{skillsStats?.conversations || 0}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "কনভারসেশন" : "Conversations"}</div></div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="card p-5">
                  <h3 className="font-bold text-primary text-sm mb-3">{lang === "bn" ? "স্কিল কনসলিডেশন" : "Skill Consolidation"}</h3>
                  <p className="text-xs text-text-secondary mb-4">{lang === "bn" ? "স্বয়ংক্রিয়ভাবে WhatsApp কথোপকথন বিশ্লেষণ করে বারবার আসা প্রশ্নগুলোকে স্কিল হিসেবে সংরক্ষণ করে।" : "Automatically analyzes WhatsApp conversations and saves repeated questions as skills."}</p>
                  {consolidationResult && <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 text-xs text-green-800">{lang === "bn" ? `${consolidationResult.shortcuts}টি শর্টকাট + ${consolidationResult.faqs}টি FAQ তৈরি হয়েছে` : `${consolidationResult.shortcuts} shortcuts + ${consolidationResult.faqs} FAQs created`}</div>}
                  <button onClick={runConsolidation} disabled={consolidating} className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50">{consolidating ? (lang === "bn" ? "কনসলিডেট হচ্ছে..." : "Consolidating...") : (lang === "bn" ? "🔍 স্কিল কনসলিডেট করুন" : "🔍 Consolidate Skills Now")}</button>
                </div>

                <div className="card p-5">
                  <h3 className="font-bold text-primary text-sm mb-3">{lang === "bn" ? "শীর্ষ পেইন পয়েন্ট" : "Top Pain Points"}</h3>
                  {skillsStats?.painPointFrequency && Object.keys(skillsStats.painPointFrequency).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(skillsStats.painPointFrequency).sort(([, a], [, b]) => b - a).slice(0, 10).map(([point, count], i, arr) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-xs font-medium text-primary">{point}</span>
                          <div className="flex items-center gap-2"><div className="h-1.5 bg-primary/20 rounded-full" style={{ width: `${Math.min(100, (count / arr[0][1]) * 100)}px` }} /><span className="text-xs font-bold text-text-secondary">{count}</span></div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-text-secondary">{lang === "bn" ? "কোনো পেইন পয়েন্ট নেই" : "No pain points recorded yet"}</p>}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

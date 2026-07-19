"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import type { Agent, AgentTreeNode, AgentReport, AgentSubmission, AgentLog, AgentStats, GlobalAgentConfig } from "@/lib/ai/agents";
import { Skeleton } from "@/components/ui/Skeleton";

type TabId = "dashboard" | "settings" | "brain" | "employees" | "insights" | "skills";

const TABS: { id: TabId; icon: string; en: string; bn: string }[] = [
  { id: "dashboard", icon: "📊", en: "Dashboard", bn: "ড্যাশবোর্ড" },
  { id: "settings", icon: "⚙️", en: "Settings", bn: "সেটিংস" },
  { id: "brain", icon: "🧬", en: "Brain", bn: "মস্তিষ্ক" },
  { id: "employees", icon: "👥", en: "Employees", bn: "কর্মচারী" },
  { id: "insights", icon: "📊", en: "Insights", bn: "ইনসাইটস" },
  { id: "skills", icon: "📈", en: "Skills", bn: "দক্ষতা" },
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
  const [brainSubTab, setBrainSubTab] = useState<"explorer" | "playground" | "memory" | "schedule" | "flows" | "tuning">("explorer");
  const [testMsg, setTestMsg] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [memoryData, setMemoryData] = useState<any[]>([]);
  const [memoryPhone, setMemoryPhone] = useState("");
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [flows, setFlows] = useState<any[]>([]);
  const [flowsLoading, setFlowsLoading] = useState(false);
  const [flowBuilder, setFlowBuilder] = useState<any[]>([]);
  const [flowName, setFlowName] = useState("");
  const [flowDesc, setFlowDesc] = useState("");
  const [flowPhone, setFlowPhone] = useState("");
  const [flowText, setFlowText] = useState("");
  const [flowRunning, setFlowRunning] = useState(false);
  const [flowResult, setFlowResult] = useState<any>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackStats, setFeedbackStats] = useState<any>(null);
  const [tokenStats, setTokenStats] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [disabledAgents, setDisabledAgents] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("brainDisabledAgents") || "[]"); } catch { return []; }
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [testSuiteLoading, setTestSuiteLoading] = useState(false);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [employeesData, setEmployeesData] = useState<any>(null);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [showEmployeeChain, setShowEmployeeChain] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [tuningData, setTuningData] = useState<any>(null);
  const [tuningLoading, setTuningLoading] = useState(false);
  const [tuningAgentId, setTuningAgentId] = useState("");
  const [tuningAnalysis, setTuningAnalysis] = useState<any>(null);
  const [tuningSuggestion, setTuningSuggestion] = useState<any>(null);
  const [tuningApplyMsg, setTuningApplyMsg] = useState("");

  const loadTuningDashboard = async () => {
    setTuningLoading(true);
    try {
      const res = await fetch("/api/ai/brain/tune");
      const d = await res.json();
      setTuningData(d);
    } catch {}
    setTuningLoading(false);
  };

  const loadEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const res = await fetch("/api/ai/brain/employees");
      const d = await res.json();
      setEmployeesData(d);
    } catch {}
    setEmployeesLoading(false);
  };

  useEffect(() => { if (activeTab === "employees") loadEmployees(); }, [activeTab]);

  const analyzeAgentForTuning = async () => {
    if (!tuningAgentId) return;
    setTuningAnalysis(null);
    setTuningSuggestion(null);
    try {
      const res = await fetch("/api/ai/brain/tune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", agentId: tuningAgentId }),
      });
      setTuningAnalysis(await res.json());
    } catch {}
  };

  const suggestPromptImprovement = async () => {
    if (!tuningAgentId) return;
    setTuningSuggestion(null);
    try {
      const res = await fetch("/api/ai/brain/tune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest", agentId: tuningAgentId }),
      });
      setTuningSuggestion(await res.json());
    } catch {}
  };

  const applyPromptImprovement = async () => {
    if (!tuningSuggestion?.suggestedPrompt || !tuningAgentId) return;
    setTuningApplyMsg("");
    try {
      const res = await fetch("/api/ai/brain/tune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply", agentId: tuningAgentId, prompt: tuningSuggestion.suggestedPrompt, source: "ai_suggested", feedbackTriggered: true }),
      });
      const d: any = await res.json();
      setTuningApplyMsg(d.success ? (lang === "bn" ? "✓ প্রম্পট আপডেট করা হয়েছে" : "✓ Prompt updated") : (lang === "bn" ? "✗ ব্যর্থ" : "✗ Failed"));
      loadTuningDashboard();
    } catch {}
  };

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

  const loadMemory = async (phone: string) => {
    if (!phone.trim()) return;
    setMemoryLoading(true);
    try {
      const res = await fetch(`/api/ai/brain/memory?phone=${encodeURIComponent(phone)}`);
      const d: any = await res.json();
      setMemoryData(d.memories || []);
    } catch {}
    setMemoryLoading(false);
  };

  const loadSchedules = async (phone?: string) => {
    setSchedulesLoading(true);
    try {
      const q = phone ? `?phone=${encodeURIComponent(phone)}` : "";
      const res = await fetch(`/api/ai/brain/schedule${q}`);
      const d: any = await res.json();
      setSchedules(d.schedules || []);
    } catch {}
    setSchedulesLoading(false);
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
      const d: any = await res.json();
      setQueueStats(d.stats);
    } catch {}
  };

  const loadFlows = async () => {
    setFlowsLoading(true);
    try {
      const res = await fetch("/api/ai/brain/flows");
      const d: any = await res.json();
      setFlows(d.flows || []);
    } catch {}
    setFlowsLoading(false);
  };

  const saveFlow = async () => {
    if (!flowName.trim() || flowBuilder.length === 0) return;
    try {
      await fetch("/api/ai/brain/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name: flowName, description: flowDesc, steps: flowBuilder }),
      });
      setFlowName(""); setFlowDesc(""); setFlowBuilder([]);
      loadFlows();
    } catch {}
  };

  const runFlow = async (flowId: number) => {
    if (!flowPhone.trim() || !flowText.trim()) return;
    setFlowRunning(true);
    setFlowResult(null);
    setSelectedFlowId(flowId);
    try {
      const res = await fetch("/api/ai/brain/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run", flow_id: flowId, phone: flowPhone, text: flowText }),
      });
      setFlowResult(await res.json());
    } catch {}
    setFlowRunning(false);
  };

  const addFlowStep = (agentId: string, department: string) => {
    setFlowBuilder(prev => [...prev, { agentId, department, condition: "" }]);
  };

  const removeFlowStep = (index: number) => {
    setFlowBuilder(prev => prev.filter((_, i) => i !== index));
  };

  const moveFlowStep = (from: number, to: number) => {
    if (to < 0 || to >= flowBuilder.length) return;
    const copy = [...flowBuilder];
    const [removed] = copy.splice(from, 1);
    copy.splice(to, 0, removed);
    setFlowBuilder(copy);
  };

  const submitFeedback = async () => {
    if (feedbackRating === 0 || !testResult) return;
    try {
      await fetch("/api/ai/brain/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "test-user",
          rating: feedbackRating,
          intent: testResult.intent,
          department: testResult.department,
          model_used: testResult.model,
          processing_ms: testResult.processingMs,
        }),
      });
    } catch {}
    setFeedbackRating(0);
  };

  const loadFeedbackStats = async () => {
    try {
      const res = await fetch("/api/ai/brain/feedback");
      const d: any = await res.json();
      setFeedbackStats(d);
    } catch {}
  };

  const exportBrainData = async () => {
    setExportLoading(true);
    try {
      const res = await fetch("/api/ai/brain/export");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brain-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setExportLoading(false);
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
        fetch("/api/ai/brain/feedback").then(r => r.json()),
      ]).then(([logData, agentData, fbData]) => {
        setDashBrainStats(logData);
        setDashBrainUsage(agentData);
        setFeedbackStats(fbData);
      }).catch(() => {}).finally(() => setDashLoading(false));
    }
  }, [activeTab]);
  useEffect(() => { if (activeTab === "settings" && models.length === 0) loadSettings(); }, [activeTab, models.length]);
  useEffect(() => { if (activeTab === "insights") loadInsights(); }, [activeTab]);
  useEffect(() => { if (activeTab === "brain") { loadBrain(); loadQueueStats(); loadFlows(); } }, [activeTab]);
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
        <p className="text-sm text-text-secondary mt-1">{lang === "bn" ? "এআই সেটিংস, কর্মচারী, ইনসাইটস ও স্কিল ম্যানেজমেন্ট" : "AI settings, employees, insights & skill management"}</p>
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
          {dashLoading ? <Skeleton className="h-4 w-32 mx-auto" /> : (
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
                    <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-xl font-bold text-green-600">{dashBrainUsage?.totalAgents || 235}</div><div className="text-[10px] text-text-secondary">{lang === "bn" ? "কর্মচারী" : "Employees"}</div></div>
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

              {/* ── Feedback Stats + Export ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-primary text-sm">{lang === "bn" ? "⭐ ফিডব্যাক সারাংশ" : "⭐ Feedback Summary"}</h2>
                    <button onClick={loadFeedbackStats} className="text-xs text-primary underline">{lang === "bn" ? "রিফ্রেশ" : "Refresh"}</button>
                  </div>
                  {feedbackStats ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-primary">{feedbackStats.stats.total}</div><div className="text-text-secondary">{lang === "bn" ? "মোট" : "Total"}</div></div>
                        <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-green-600">{feedbackStats.stats.positive}</div><div className="text-text-secondary">{lang === "bn" ? "পজিটিভ" : "Positive"}</div></div>
                        <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-amber-600">{feedbackStats.stats.neutral}</div><div className="text-text-secondary">{lang === "bn" ? "নিউট্রাল" : "Neutral"}</div></div>
                        <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-red-600">{feedbackStats.stats.negative}</div><div className="text-text-secondary">{lang === "bn" ? "নেগেটিভ" : "Negative"}</div></div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-text-secondary">{lang === "bn" ? "গড় রেটিং:" : "Avg Rating:"}</span>
                        <span className="text-lg font-bold text-amber-500">{Number(feedbackStats.stats.avg_rating).toFixed(1)}</span>
                        <span className="text-text-secondary">/ 5</span>
                      </div>
                      {feedbackStats.byDepartment?.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-medium text-text-secondary">{lang === "bn" ? "ডিপার্টমেন্ট অনুযায়ী:" : "By Department:"}</p>
                          {feedbackStats.byDepartment.map((d: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className="text-primary w-28 truncate">{d.department || "unknown"}</span>
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${(d.count / Math.max(...feedbackStats.byDepartment.map((x: any) => x.count))) * 100}%` }} />
                              </div>
                              <span className="text-text-secondary w-8 text-right">{d.count}</span>
                              <span className="text-amber-500 w-6 text-right">{Number(d.avg_rating).toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={loadFeedbackStats} className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-xl">{lang === "bn" ? "📊 ফিডব্যাক লোড" : "📊 Load Feedback"}</button>
                  )}
                </div>

                <div className="card p-6">
                  <h2 className="font-bold text-primary text-sm mb-4">{lang === "bn" ? "📦 ডাটা এক্সপোর্ট" : "📦 Data Export"}</h2>
                  <p className="text-xs text-text-secondary mb-4">{lang === "bn" ? "সমস্ত ব্রেইন ডাটা (ব্যবহার, ফিডব্যাক, ফ্লো, মেমোরি, শিডিউল) JSON ফরম্যাটে ডাউনলোড করুন" : "Download all brain data (usage, feedback, flows, memory, schedules) as JSON"}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4 text-center text-xs">
                    <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-primary">{dashBrainStats?.stats?.total || 0}</div><div className="text-text-secondary">{lang === "bn" ? "রিকোয়েস্ট" : "Requests"}</div></div>
                    <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-green-600">{feedbackStats?.stats?.total || 0}</div><div className="text-text-secondary">{lang === "bn" ? "ফিডব্যাক" : "Feedback"}</div></div>
                    <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-purple-600">{dashBrainUsage?.totalDepartments || 7}</div><div className="text-text-secondary">{lang === "bn" ? "ডিপার্টমেন্ট" : "Depts"}</div></div>
                    <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-amber-600">{dashBrainUsage?.totalAgents || 235}</div><div className="text-text-secondary">{lang === "bn" ? "কর্মচারী" : "Employees"}</div></div>
                    <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-blue-600">{dashBrainStats?.stats?.total_tokens || 0}</div><div className="text-text-secondary">{lang === "bn" ? "টোকেন" : "Tokens"}</div></div>
                  </div>
                  <button onClick={exportBrainData} disabled={exportLoading} className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50">{exportLoading ? "..." : (lang === "bn" ? "💾 JSON এক্সপোর্ট" : "💾 Export JSON")}</button>
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
          {settingsLoading ? <Skeleton className="h-4 w-32 mx-auto" /> : (
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
            <p className="text-sm text-text-secondary mt-1">{lang === "bn" ? "সকল ডিপার্টমেন্ট, টিম ও কর্মচারী এক নজরে" : "All departments, teams & employees at a glance"}</p>
          </div>

          {/* ── Brain Sub-tabs ── */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {([
              { id: "explorer" as const, icon: "🔍", en: "Explorer", bn: "এক্সপ্লোরার" },
              { id: "playground" as const, icon: "🧪", en: "Test", bn: "টেস্ট" },
              { id: "memory" as const, icon: "🧠", en: "Memory", bn: "মেমোরি" },
              { id: "schedule" as const, icon: "⏰", en: "Schedule", bn: "শিডিউল" },
              { id: "flows" as const, icon: "🔀", en: "Flows", bn: "ফ্লো" },
              { id: "tuning" as const, icon: "🎯", en: "Tuning", bn: "টিউনিং" },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setBrainSubTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${brainSubTab === tab.id ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text"}`}>
                <span>{tab.icon}</span><span>{lang === "bn" ? tab.bn : tab.en}</span>
              </button>
            ))}
          </div>

          {brainSubTab === "explorer" && (<>
          {brainLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : brainData ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-primary">{brainData.totalDepartments}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "ডিপার্টমেন্ট" : "Departments"}</div></div>
                <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-purple-600">{brainData.totalTeams}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "টিম" : "Teams"}</div></div>
                <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-green-600">{brainData.totalAgents}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "কর্মচারী" : "Employees"}</div></div>
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
                          <div className="text-xs text-text-secondary">{dept.teamCount} {lang === "bn" ? "টি টিম" : "teams"} · {dept.agentCount} {lang === "bn" ? "জন কর্মচারী" : "employees"}</div>
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
                                <span className="text-xs text-text-secondary">({team.agentCount} {lang === "bn" ? "কর্মচারী" : "employees"})</span>
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
                <p className="text-sm text-text-secondary mb-4">{lang === "bn" ? "কোনো মেসেজ লিখে দেখুন কোন ডিপার্টমেন্ট ও কর্মচারী রেসপন্স করবে" : "Type a message to see which department & employee responds"}</p>
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
                    <div className="flex items-center gap-2"><span className="font-medium text-primary">{lang === "bn" ? "কর্মচারী:" : "Employees:"}</span><span className="text-xs">{testResult.agentsUsed?.join(" → ")}</span></div>
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
                    {/* Feedback widget */}
                    <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
                      <span className="text-[10px] text-text-secondary">{lang === "bn" ? "এই রেসপন্সটি রেট দিন:" : "Rate this response:"}</span>
                      {[1, 2, 3, 4, 5].map(r => (
                        <button key={r} onClick={() => { setFeedbackRating(r); setTimeout(submitFeedback, 100); }} className={`w-5 h-5 text-xs rounded-full ${feedbackRating >= r ? "bg-amber-400 text-white" : "bg-gray-100 text-text-secondary"} transition-colors`}>{r}</button>
                      ))}
                    </div>
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
                    <span className="text-xs text-text-secondary">({disabledAgents.length} {lang === "bn" ? "কর্মচারী ডিসেবল" : "disabled"})</span>
                  </div>
                  <span className={`text-text-secondary transition-transform ${showAdmin ? "rotate-180" : ""}`}>▼</span>
                </button>
                {showAdmin && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* ── Cache & Reset Actions ── */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button onClick={() => { localStorage.removeItem("brainDisabledAgents"); setDisabledAgents([]); }} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-xl hover:bg-red-100">{lang === "bn" ? "🔄 সব কর্মচারী রিসেট" : "🔄 Reset All Employees"}</button>
                      <button onClick={() => { fetch("/api/ai/brain/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "__clear_cache__" }) }).then(r => r.json()).then(() => alert(lang === "bn" ? "ক্যাশ ক্লিয়ার করা হয়েছে!" : "Cache cleared!")).catch(() => {}); }} className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100">{lang === "bn" ? "🗑️ ক্যাশ ক্লিয়ার" : "🗑️ Clear Cache"}</button>
                    </div>

                    {/* ── Per-Department Agent Toggle ── */}
                    <p className="text-xs text-text-secondary">{lang === "bn" ? "কর্মচারী অন/অফ করুন (ব্রাউজার লোকাল)" : "Enable/disable employees (browser local storage)"}</p>
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
          ) : null}

          {/* ── Memory Section ── */}
          {(brainSubTab as string) === "memory" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold text-primary mb-2">{lang === "bn" ? "🧠 কর্মচারী মেমোরি" : "🧠 Employee Memory"}</h2>
                <p className="text-sm text-text-secondary mb-4">{lang === "bn" ? "প্রতি ফোন নম্বরের জন্য কর্মচারীদের মেমোরি — পছন্দ, ইতিহাস, প্রোফাইল" : "Persistent memory per phone — preferences, history, profile"}</p>
                <div className="flex gap-3 mb-4">
                  <input value={memoryPhone} onChange={e => setMemoryPhone(e.target.value)} placeholder={lang === "bn" ? "ফোন নম্বর দিন" : "Enter phone number"} className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm text-primary font-mono" />
                  <button onClick={() => loadMemory(memoryPhone)} disabled={memoryLoading || !memoryPhone.trim()} className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50">{memoryLoading ? "..." : "🔍 Load"}</button>
                </div>
                {memoryData.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {memoryData.map((mem: any, i: number) => (
                      <div key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[10px]">{mem.category}</span>
                            <span className="font-medium text-primary truncate">{mem.key}</span>
                            <span className="text-text-secondary">· {mem.agent_id || "_meta"}</span>
                          </div>
                          <div className="text-text-secondary break-words">{mem.value}</div>
                        </div>
                        <button onClick={async () => { await fetch(`/api/ai/brain/memory?phone=${encodeURIComponent(memoryPhone)}&agent_id=${mem.agent_id}&key=${mem.key}`, { method: "DELETE" }); loadMemory(memoryPhone); }} className="ml-2 px-2 py-1 text-[10px] text-red-500 hover:bg-red-50 rounded-lg shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                ) : memoryPhone ? (
                  <div className="text-xs text-text-secondary py-6 text-center">{lang === "bn" ? "কোনো মেমোরি পাওয়া যায়নি" : "No memory found"}</div>
                ) : null}
              </div>
            </div>
          )}

          {/* ── Schedule Section ── */}
          {(brainSubTab as string) === "schedule" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold text-primary mb-2">{lang === "bn" ? "⏰ কর্মচারী শিডিউল" : "⏰ Employee Schedule"}</h2>
                <p className="text-sm text-text-secondary mb-4">{lang === "bn" ? "অটোমেটিক কর্মচারী টাস্ক — ডেইলি রিপোর্ট, ফলো-আপ, রিমাইন্ডার" : "Automated employee tasks — daily reports, follow-ups, reminders"}</p>
                <div className="flex gap-3 mb-4">
                  <input value={memoryPhone} onChange={e => { setMemoryPhone(e.target.value); }} placeholder={lang === "bn" ? "ফোন নম্বর" : "Phone"} className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm text-primary font-mono" />
                  <button onClick={() => loadSchedules(memoryPhone)} disabled={schedulesLoading} className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50">{schedulesLoading ? "..." : "📋 List"}</button>
                </div>
                {schedules.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {schedules.map((s: any) => (
                      <div key={s.id} className="p-3 bg-gray-50 rounded-xl text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-primary">{s.agent_id} · {s.task_type}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${s.enabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{s.enabled ? "Active" : "Paused"}</span>
                        </div>
                        <div className="text-text-secondary">Cron: <code className="font-mono bg-gray-200 px-1 rounded">{s.cron_expression}</code></div>
                        <div className="text-text-secondary">Next: {s.next_run_at || "—"}</div>
                        <div className="text-text-secondary">Last: {s.last_run_at || "—"}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-text-secondary py-6 text-center">
                    {lang === "bn" ? "কোনো শিডিউল নেই। আপনার প্রথম শিডিউল তৈরি করুন।" : "No schedules yet. Create your first schedule."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Flows Section ── */}
          {(brainSubTab as string) === "flows" && (
            <div className="space-y-4">
              {/* ── Flow Builder ── */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold text-primary mb-2">{lang === "bn" ? "🔀 ফ্লো বিল্ডার" : "🔀 Flow Builder"}</h2>
                <p className="text-sm text-text-secondary mb-4">{lang === "bn" ? "কাস্টম কর্মচারী চেইন তৈরি করুন — ডিপার্টমেন্ট ও কর্মচারী সিলেক্ট করুন" : "Create custom employee chains — select departments & employees"}</p>

                <div className="flex gap-3 mb-4">
                  <input value={flowName} onChange={e => setFlowName(e.target.value)} placeholder={lang === "bn" ? "ফ্লোর নাম" : "Flow name"} className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm text-primary font-mono" />
                  <input value={flowDesc} onChange={e => setFlowDesc(e.target.value)} placeholder={lang === "bn" ? "বিবরণ" : "Description"} className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm text-primary font-mono" />
                </div>

                {/* Agent selector */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-text-secondary mb-2">{lang === "bn" ? "কর্মচারী যোগ করুন:" : "Add employees (click to add to chain):"}</p>
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-border rounded-xl p-2">
                    {brainData?.departments?.map((dept: any) =>
                      dept.teams?.flatMap((t: any) => t.agents || []).map((agent: any) => (
                        <button key={agent.id} onClick={() => addFlowStep(agent.id, dept.id)} className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-primary/5 text-text hover:text-primary transition-colors">
                          {dept.icon} {agent.name} <span className="text-text-secondary">({agent.id})</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Chain builder */}
                {flowBuilder.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs font-medium text-text-secondary mb-2">{lang === "bn" ? `চেইন (${flowBuilder.length}টি স্টেপ):` : `Chain (${flowBuilder.length} steps):`}</p>
                    <div className="space-y-1.5">
                      {flowBuilder.map((step: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-xs border border-border">
                          <span className="text-text-secondary w-5">{i + 1}.</span>
                          <span className="font-medium text-primary flex-1">{step.agentId}</span>
                          <span className="text-text-secondary text-[10px]">{step.department}</span>
                          <button onClick={() => moveFlowStep(i, i - 1)} disabled={i === 0} className="px-1.5 py-0.5 text-text-secondary hover:bg-gray-100 rounded disabled:opacity-30">↑</button>
                          <button onClick={() => moveFlowStep(i, i + 1)} disabled={i === flowBuilder.length - 1} className="px-1.5 py-0.5 text-text-secondary hover:bg-gray-100 rounded disabled:opacity-30">↓</button>
                          <button onClick={() => removeFlowStep(i)} className="px-1.5 py-0.5 text-red-400 hover:bg-red-50 rounded">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button onClick={saveFlow} disabled={!flowName.trim() || flowBuilder.length === 0} className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50">{lang === "bn" ? "💾 ফ্লো সেভ করুন" : "💾 Save Flow"}</button>
                  <button onClick={() => { setFlowBuilder([]); setFlowName(""); setFlowDesc(""); }} className="px-4 py-2.5 text-sm font-medium text-text-secondary bg-gray-100 rounded-xl hover:bg-gray-200">{lang === "bn" ? "ক্লিয়ার" : "Clear"}</button>
                </div>
              </div>

              {/* ── Saved Flows ── */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold text-primary mb-4">{lang === "bn" ? "📋 সেভ করা ফ্লো" : "📋 Saved Flows"}</h2>
                {flowsLoading ? <Skeleton className="h-3 w-20" /> : flows.length === 0 ? (
                  <div className="text-xs text-text-secondary py-6 text-center">{lang === "bn" ? "কোনো ফ্লো নেই। উপরে একটি ফ্লো তৈরি করুন।" : "No flows yet. Create one above."}</div>
                ) : (
                  <div className="space-y-3">
                    {flows.map((flow: any) => {
                      const steps = flow.steps || [];
                      return (
                        <div key={flow.id} className={`rounded-xl border p-4 ${selectedFlowId === flow.id ? "border-primary bg-primary/5" : "border-border"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div><div className="font-semibold text-primary text-sm">{flow.name}</div><div className="text-xs text-text-secondary">{flow.description} · {steps.length} steps · {flow.run_count} runs</div></div>
                            <button onClick={() => { selectedFlowId === flow.id ? setSelectedFlowId(null) : setSelectedFlowId(flow.id); }} className="text-xs text-primary underline">{selectedFlowId === flow.id ? "Close" : "Run"}</button>
                          </div>
                          {/* Chain visualizer */}
                          <div className="flex items-center gap-1 overflow-x-auto py-1">
                            {steps.map((s: any, i: number) => (
                              <div key={i} className="flex items-center gap-1 shrink-0">
                                <span className="px-2 py-1 text-[10px] font-mono bg-gray-100 rounded-lg whitespace-nowrap">{s.agentId}</span>
                                {i < steps.length - 1 && <span className="text-text-secondary text-[10px]">→</span>}
                              </div>
                            ))}
                          </div>
                          {/* Run form */}
                          {selectedFlowId === flow.id && (
                            <div className="mt-3 pt-3 border-t border-border space-y-2">
                              <input value={flowPhone} onChange={e => setFlowPhone(e.target.value)} placeholder={lang === "bn" ? "ফোন নম্বর" : "Phone"} className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-gray-50 font-mono" />
                              <input value={flowText} onChange={e => setFlowText(e.target.value)} placeholder={lang === "bn" ? 'টেস্ট মেসেজ: "আমি কিনতে চাই"' : 'Test message: "I want to buy"'} className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-gray-50 font-mono" />
                              <button onClick={() => runFlow(flow.id)} disabled={flowRunning || !flowPhone.trim() || !flowText.trim()} className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50">{flowRunning ? "Running..." : "▶ Run Flow"}</button>
                            </div>
                          )}
                          {/* Flow result */}
                          {flowResult && selectedFlowId === flow.id && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className={`text-xs p-3 rounded-xl ${flowResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                                <div className="flex items-center gap-2 mb-1"><span className="font-medium">{flowResult.success ? "✅ Completed" : "❌ Failed"}</span><span className="text-text-secondary">{flowResult.agentsUsed?.length || 0} agents</span></div>
                                <div className="text-text-secondary mb-1">{flowResult.departmentsUsed?.join(" → ")}</div>
                                <div className="text-text-secondary max-h-32 overflow-y-auto">{flowResult.chainContext}</div>
                                {/* Step visualizer */}
                                {flowResult.steps?.map((s: any, i: number) => (
                                  <div key={i} className="flex items-center gap-2 mt-1 text-[10px]">
                                    <span className={`w-2 h-2 rounded-full ${s.status === "completed" ? "bg-green-500" : s.status === "failed" ? "bg-red-500" : s.status === "running" ? "bg-yellow-500" : "bg-gray-300"}`} />
                                    <span className="font-mono">{s.agentId}</span>
                                    <span className="text-text-secondary">{s.status}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tuning Section ── */}
          {(brainSubTab as string) === "tuning" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-primary">{lang === "bn" ? "🎯 কর্মচারী টিউনিং" : "🎯 Employee Tuning"}</h2>
                  <button onClick={loadTuningDashboard} disabled={tuningLoading} className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-xl disabled:opacity-50">{tuningLoading ? "..." : (lang === "bn" ? "📊 রিফ্রেশ" : "📊 Refresh")}</button>
                </div>
                <p className="text-sm text-text-secondary mb-4">{lang === "bn" ? "ফিডব্যাক ডাটা ব্যবহার করে কর্মচারী প্রম্পট অটো-ইমপ্রুভ করুন। নিচে কর্মচারী সিলেক্ট করে অ্যানালাইসিস ও ইমপ্রুভমেন্ট সাজেশন দেখুন।" : "Use feedback data to auto-improve employee prompts. Select an employee below to see analysis & improvement suggestions."}</p>

                {/* Agent selector */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-text-secondary mb-2">{lang === "bn" ? "কর্মচারী সিলেক্ট করুন:" : "Select Employee:"}</p>
                  <div className="flex gap-2">
                    <input value={tuningAgentId} onChange={e => setTuningAgentId(e.target.value)} placeholder={lang === "bn" ? "কর্মচারী আইডি (যেমন: lead_scanner)" : "Employee ID (e.g. lead_scanner)"} className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm text-primary font-mono" />
                    <button onClick={analyzeAgentForTuning} disabled={!tuningAgentId || tuningLoading} className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50">{lang === "bn" ? "🔍 অ্যানালাইজ" : "🔍 Analyze"}</button>
                    <button onClick={suggestPromptImprovement} disabled={!tuningAgentId || !tuningAnalysis} className="px-4 py-2 text-sm font-medium bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50">{lang === "bn" ? "🤖 সাজেশন" : "🤖 Suggest"}</button>
                  </div>
                </div>

                {/* Feedback Analysis */}
                {tuningAnalysis && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                    <h3 className="text-sm font-bold text-blue-700 mb-2">{lang === "bn" ? "📋 ফিডব্যাক অ্যানালাইসিস" : "📋 Feedback Analysis"}</h3>
                    <div className="space-y-2 text-xs">
                      {tuningAnalysis.issues?.length > 0 && (
                        <div>
                          <p className="font-medium text-red-600">{lang === "bn" ? "সমস্যা:" : "Issues:"}</p>
                          {tuningAnalysis.issues.map((i: string, idx: number) => <p key={idx} className="text-text-secondary pl-3">• {i}</p>)}
                        </div>
                      )}
                      {tuningAnalysis.praise?.length > 0 && (
                        <div>
                          <p className="font-medium text-green-600">{lang === "bn" ? "প্রশংসা:" : "Praise:"}</p>
                          {tuningAnalysis.praise.map((p: string, idx: number) => <p key={idx} className="text-text-secondary pl-3">• {p}</p>)}
                        </div>
                      )}
                      {tuningAnalysis.suggestion && (
                        <div className="mt-2 p-2 bg-white rounded-lg">
                          <p className="font-medium text-purple-600 mb-1">{lang === "bn" ? "AI সাজেশন:" : "AI Suggestion:"}</p>
                          <p className="text-text-secondary whitespace-pre-wrap">{tuningAnalysis.suggestion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Suggested Prompt */}
                {tuningSuggestion && (
                  <div className="mb-4">
                    <div className="p-4 bg-purple-50 rounded-xl mb-3">
                      <h3 className="text-sm font-bold text-purple-700 mb-2">{lang === "bn" ? "🤖 সাজেস্টেড প্রম্পট" : "🤖 Suggested Prompt"}</h3>
                      <pre className="text-xs text-text-secondary whitespace-pre-wrap bg-white p-3 rounded-lg border border-purple-100 max-h-60 overflow-y-auto">{tuningSuggestion.suggestedPrompt}</pre>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl mb-3">
                      <h3 className="text-sm font-bold text-text-secondary mb-2">{lang === "bn" ? "📄 বর্তমান প্রম্পট" : "📄 Current Prompt"}</h3>
                      <pre className="text-xs text-text-secondary whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-100 max-h-60 overflow-y-auto">{tuningSuggestion.originalPrompt}</pre>
                    </div>
                    <button onClick={applyPromptImprovement} className="px-5 py-2.5 text-sm font-medium bg-green-500 text-white rounded-xl hover:bg-green-600">{lang === "bn" ? "✅ প্রম্পট আপডেট করুন" : "✅ Apply Improvement"}</button>
                    {tuningApplyMsg && <p className="text-sm mt-2 font-medium text-green-600">{tuningApplyMsg}</p>}
                  </div>
                )}
              </div>

              {/* Agents Needing Improvement */}
              {tuningData?.agentsNeedingImprovement?.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="text-sm font-bold text-primary mb-3">{lang === "bn" ? "⚠️ ইমপ্রুভমেন্ট প্রয়োজন" : "⚠️ Needs Improvement"}</h3>
                  <div className="space-y-2">
                    {tuningData.agentsNeedingImprovement.map((a: any, i: number) => (
                      <div key={i} onClick={() => setTuningAgentId(a.agentId)} className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 cursor-pointer transition-colors border border-border">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-primary">{a.agentName}</span>
                          <span className="text-xs text-text-secondary">({a.agentId})</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">{a.avgRating.toFixed(1)} ★</span>
                          <span className="text-text-secondary">{a.totalFeedback} {lang === "bn" ? "টি ফিডব্যাক" : "feedbacks"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Version History */}
              {tuningData?.versionHistory?.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="text-sm font-bold text-primary mb-3">{lang === "bn" ? "📜 প্রম্পট ভার্সন হিস্ট্রি" : "📜 Prompt Version History"}</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tuningData.versionHistory.map((v: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs">
                        <div>
                          <span className="font-medium text-primary">{v.agentId}</span>
                          <span className="text-text-secondary mx-2">v{v.version}</span>
                          {v.active === 1 && <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-600 text-[10px] font-medium">{lang === "bn" ? "সক্রিয়" : "Active"}</span>}
                          <span className="text-text-secondary ml-2">{v.source}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-text-secondary">{v.avgRatingBefore.toFixed(1)} → {v.avgRatingAfter.toFixed(1)}</span>
                          <span className="text-text-secondary">{v.createdAt?.split("T")[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AB Tests */}
              {tuningData?.abTests?.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="text-sm font-bold text-primary mb-3">{lang === "bn" ? "🔬 A/B টেস্ট" : "🔬 A/B Tests"}</h3>
                  <div className="space-y-2">
                    {tuningData.abTests.map((t: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs">
                        <div>
                          <span className="font-medium text-primary">{t.agentId}</span>
                          <span className="text-text-secondary mx-2">v{t.versionA} vs v{t.versionB}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-text-secondary">A: {t.aAvgRating.toFixed(1)} ({t.aCount})</span>
                          <span className="text-text-secondary">B: {t.bAvgRating.toFixed(1)} ({t.bCount})</span>
                          {t.winner && <span className={`px-1.5 py-0.5 rounded font-medium ${t.winner === "b" ? "bg-green-100 text-green-600" : t.winner === "a" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"}`}>{t.winner === "b" ? "B wins" : t.winner === "a" ? "A wins" : t.winner}</span>}
                          <span className={`px-1.5 py-0.5 rounded ${t.status === "running" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"}`}>{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tuning Log */}
              {tuningData?.improvementLog?.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="text-sm font-bold text-primary mb-3">{lang === "bn" ? "📝 টিউনিং লগ" : "📝 Tuning Log"}</h3>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {tuningData.improvementLog.map((l: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs">
                        <div>
                          <span className="font-medium text-primary">{l.agentId}</span>
                          <span className="text-text-secondary ml-2">{l.action}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          {l.ratingBefore > 0 && <span>{l.ratingBefore.toFixed(1)} → {l.ratingAfter.toFixed(1)}</span>}
                          <span>{l.createdAt?.split("T")[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!brainData && (brainSubTab as string) !== "memory" && (brainSubTab as string) !== "schedule" && (brainSubTab as string) !== "flows" && (brainSubTab as string) !== "tuning" && (
            <div className="text-sm text-text-secondary py-12 text-center">{lang === "bn" ? "ব্রেইন ডাটা লোড করতে ব্যর্থ" : "Failed to load brain data"}</div>
          )}
          </>)}
        </div>
      )}

      {/* ════════════════════════ EMPLOYEES TAB ════════════════════════ */}
      {activeTab === "employees" && (
        <div className="space-y-6">
          {employeesLoading ? (
            <div className="space-y-4">
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-72 bg-gray-100 rounded-lg animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-text">{lang === "bn" ? "👥 প্রিমিয়াম এমপ্লয়ী" : "👥 Premium Employees"}</h1>
                  <p className="text-sm text-text-secondary mt-1">{lang === "bn" ? "২৩৫ জন এমপ্লয়ী — ৮টি ডিপার্টমেন্ট, ৩৩টি টিম, ২৮টি চেইন" : "235 employees — 8 departments, 33 teams, 28 chains"}</p>
                </div>
                <button onClick={loadEmployees} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl">{lang === "bn" ? "🔄 রিফ্রেশ" : "🔄 Refresh"}</button>
              </div>

              {employeesData?.stats && (
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-primary">{employeesData.stats.totalDepartments}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "ডিপার্টমেন্ট" : "Departments"}</div></div>
                  <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-purple-600">{employeesData.stats.totalAgents}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "এমপ্লয়ী" : "Employees"}</div></div>
                  <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-green-600">{employeesData.stats.totalChains}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "চেইন" : "Chains"}</div></div>
                  <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-amber-600">{employeesData.stats.totalCrossDeptChains}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "ক্রস-চেইন" : "Cross Chains"}</div></div>
                  <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-blue-600">{employeesData.stats.totalDynamicEmployees}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "ডাইনামিক" : "Dynamic"}</div></div>
                  <div className="bg-white rounded-xl border border-border p-4 text-center"><div className="text-2xl font-bold text-red-600">{employeesData.departments?.find((d: any) => d.id === "negativity_detection") ? "⚠️" : "✅"}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "নেগেটিভিটি" : "Negativity"}</div></div>
                </div>
              )}

              {/* ── Department Tree ── */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="text-base font-bold text-primary mb-4">{lang === "bn" ? "🏢 ডিপার্টমেন্ট ও টিম" : "🏢 Departments & Teams"}</h2>
                <div className="space-y-3">
                  {employeesData?.departments?.map((dept: any) => (
                    <details key={dept.id} className="group">
                      <summary className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                        <span className="text-lg">{dept.icon}</span>
                        <span className="font-semibold text-primary text-sm">{lang === "bn" ? dept.nameBn : dept.name}</span>
                        <span className="text-xs text-text-secondary">({dept.teams?.length || 0} {lang === "bn" ? "টি টিম" : "teams"})</span>
                      </summary>
                      <div className="ml-8 mt-2 space-y-2">
                        {dept.teams?.map((team: any) => (
                          <details key={team.id} className="group">
                            <summary className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm transition-colors">
                              <span className="font-medium text-text-secondary">{lang === "bn" ? team.nameBn : team.name}</span>
                              <span className="text-xs text-text-secondary">({team.agents?.length || 0})</span>
                            </summary>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 ml-4">
                              {team.agents?.map((agent: any) => (
                                <div key={agent.id} onClick={() => setSelectedEmployee(selectedEmployee?.id === agent.id ? null : agent)} className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${selectedEmployee?.id === agent.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-primary">{lang === "bn" ? agent.nameBn : agent.name}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${agent.tier === 1 ? "bg-purple-100 text-purple-700" : agent.tier === 2 ? "bg-blue-100 text-blue-700" : agent.tier === 3 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>T{agent.tier}</span>
                                  </div>
                                  <p className="text-text-secondary truncate">{lang === "bn" ? agent.descriptionBn || agent.description : agent.description}</p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-text-secondary">#{agent.id}</span>
                                    <span className="text-text-secondary">·</span>
                                    <span className="text-text-secondary">{lang === "bn" ? "প্রাইরিটি" : "Priority"}: {agent.priority}</span>
                                  </div>
                                  {selectedEmployee?.id === agent.id && (
                                    <div className="mt-2 pt-2 border-t border-border space-y-1">
                                      <p className="text-text-secondary">{lang === "bn" ? "মডেল" : "Model"}: {agent.primaryModel}</p>
                                      <p className="text-text-secondary">{lang === "bn" ? "শর্ত" : "When"}: <code className="text-[10px] bg-gray-100 px-1 rounded">{agent.when}</code></p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* ── Chains View ── */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-primary">{lang === "bn" ? "🔗 চেইন কমান্ড" : "🔗 Chain Commands"}</h2>
                  <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                    <button onClick={() => setShowEmployeeChain("chains")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${showEmployeeChain !== "cross" ? "bg-white text-primary shadow-sm" : "text-text-secondary"}`}>{lang === "bn" ? "সিঙ্গেল" : "Single"}</button>
                    <button onClick={() => setShowEmployeeChain("cross")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${showEmployeeChain === "cross" ? "bg-white text-primary shadow-sm" : "text-text-secondary"}`}>{lang === "bn" ? "ক্রস" : "Cross"}</button>
                  </div>
                </div>
                {showEmployeeChain !== "cross" ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {employeesData?.chains?.map((chain: any) => (
                      <details key={chain.key} className="group">
                        <summary className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer text-sm transition-colors">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <span className="font-medium text-primary">{chain.key}</span>
                          <span className="text-xs text-text-secondary">({chain.stepCount} {lang === "bn" ? "টি স্টেপ" : "steps"})</span>
                        </summary>
                        <div className="ml-6 mt-2 space-y-1">
                          {chain.agents.map((agentId: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-xs">
                              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                              <span className="font-medium text-primary">{agentId}</span>
                              {employeesData?.departments?.flatMap((d: any) => d.teams).flatMap((t: any) => t.agents).find((a: any) => a.id === agentId) && (
                                <span className="text-text-secondary">
                                  — {lang === "bn" ? employeesData.departments.flatMap((d: any) => d.teams).flatMap((t: any) => t.agents).find((a: any) => a.id === agentId).name : employeesData.departments.flatMap((d: any) => d.teams).flatMap((t: any) => t.agents).find((a: any) => a.id === agentId).name}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {employeesData?.crossDeptChains?.map((chain: any) => (
                      <details key={chain.key} className="group">
                        <summary className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer text-sm transition-colors">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="font-medium text-purple-700">{chain.key}</span>
                          <span className="text-xs text-text-secondary">({chain.stepCount} {lang === "bn" ? "টি স্টেপ" : "steps"})</span>
                        </summary>
                        <div className="ml-6 mt-2 space-y-1">
                          {chain.steps.map((step: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 text-xs">
                              <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                              <span className="font-medium text-purple-700">{step.agentId}</span>
                              <span className="text-text-secondary">({step.department})</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Dynamic Employees ── */}
              {employeesData?.dynamicEmployees?.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="text-base font-bold text-primary mb-4">{lang === "bn" ? "🧬 ডাইনামিক এমপ্লয়ী" : "🧬 Dynamic Employees"}</h2>
                  <div className="space-y-2">
                    {employeesData.dynamicEmployees.map((emp: any) => (
                      <div key={emp.employeeId} className="flex items-center justify-between p-3 rounded-xl bg-green-50 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-primary">{emp.name}</span>
                          <span className="text-xs text-text-secondary">({emp.employeeId})</span>
                          <span className="text-xs text-text-secondary">{lang === "bn" ? "প্যারেন্ট" : "Parent"}: {emp.parentEmployeeId}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{emp.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Negativity Detection Summary ── */}
              {employeesData?.departments?.find((d: any) => d.id === "negativity_detection") && (
                <div className="bg-white rounded-2xl border border-amber-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">⚠️</span>
                    <h2 className="text-base font-bold text-amber-700">{lang === "bn" ? "নেতিবাচকতা সনাক্তকরণ ও সংবেদনশীলতা" : "Negativity Detection & Sensitivity"}</h2>
                  </div>
                  <p className="text-sm text-amber-600 mb-3">{lang === "bn" ? "বাংলাদেশী প্রেক্ষাপটে নেতিবাচক ট্রিগার শব্দ ও সংবেদনশীল বিষয় সনাক্ত করে এবং অন্যান্য ডিপার্টমেন্টকে নিরাপদ শব্দচয়নের পরামর্শ দেয়" : "Detects negative trigger words in Bangladeshi context and advises other departments on safe wording"}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-amber-50 text-center"><div className="font-bold text-amber-700">৪</div><div className="text-amber-600">{lang === "bn" ? "টি টিম" : "Teams"}</div></div>
                    <div className="p-2 rounded-lg bg-amber-50 text-center"><div className="font-bold text-amber-700">৮</div><div className="text-amber-600">{lang === "bn" ? "জন এমপ্লয়ী" : "Employees"}</div></div>
                    <div className="p-2 rounded-lg bg-amber-50 text-center"><div className="font-bold text-amber-700">{lang === "bn" ? "টাকা, সদস্য, রিক্রুটমেন্ট" : "Money, Recruitment, Growth"}</div><div className="text-amber-600">{lang === "bn" ? "ট্রিগার ক্যাটাগরি" : "Trigger Categories"}</div></div>
                    <div className="p-2 rounded-lg bg-amber-50 text-center"><div className="font-bold text-amber-700">{lang === "bn" ? "প্রতি কনভারসেশনে" : "Every Conversation"}</div><div className="text-amber-600">{lang === "bn" ? "অটো-স্ক্যান" : "Auto-scan"}</div></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ════════════════════════ INSIGHTS TAB ════════════════════════ */}
      {activeTab === "insights" && (
        <div>
          {insightsLoading ? <Skeleton className="h-4 w-32 mx-auto" /> : (
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
                  <div className="card p-4 text-center"><div className="text-lg font-bold text-green-600">{brainData?.totalAgents || "—"}</div><div className="text-xs text-text-secondary">{lang === "bn" ? "কর্মচারী" : "Employees"}</div></div>
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
          {skillsLoading ? <Skeleton className="h-4 w-32 mx-auto" /> : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="card p-4 text-center"><div className="text-xl font-bold text-primary">{skillsStats?.responses.total || 0}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "মোট রেসপন্স" : "Total Responses"}</div></div>
                <div className="card p-4 text-center"><div className="text-xl font-bold text-green-600">{skillsStats?.responses.today || 0}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "আজকের রেসপন্স" : "Today"}</div></div>
                <div className="card p-4 text-center">                <div className="text-xl font-bold text-amber-600">{skillsStats?.skills || 0}</div><div className="text-xs text-text-secondary mt-1">{lang === "bn" ? "দক্ষতা শিখেছে" : "Skills Learned"}</div></div>
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

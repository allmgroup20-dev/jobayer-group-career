"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

interface Stats {
  responses: { total: number; today: number };
  models: { active: number; total: number };
  keys: { active: number };
  conversations: number;
  profiles: number;
  skills: number;
  painPointFrequency: Record<string, number>;
}

interface ConsolidationResult {
  faqs: number;
  shortcuts: number;
}

interface AuditLogEntry {
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  updated_by: string;
  created_at: string;
  details: string | null;
}

interface PsychTask {
  id: number;
  agent_id: string;
  target_phone: string;
  issue_type: string;
  context: string;
  created_at: string;
}

interface SkillHistoryItem {
  id: number;
  name: string;
  category: string;
  keywords: string;
  question: string;
  answer: string;
  version: number;
  usage_count: number;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
  psychologist_notes: string | null;
  is_psychologist_updated: boolean;
  manual_override: number;
  audit_log: AuditLogEntry[];
}

export default function SkillsPage() {
  const { lang } = useLanguageStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [consolidating, setConsolidating] = useState(false);
  const [result, setResult] = useState<ConsolidationResult | null>(null);
  const [skillHistory, setSkillHistory] = useState<SkillHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<number | null>(null);
  const [buttonLoading, setButtonLoading] = useState<number | null>(null);
  const [editingSkill, setEditingSkill] = useState<number | null>(null);
  const [pendingTasks, setPendingTasks] = useState<PsychTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskAnswers, setTaskAnswers] = useState<Record<number, string>>({});
  const [taskSubmitting, setTaskSubmitting] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ keywords: "", question: "", answer: "", category: "" });
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ keywords: "", question: "", answer: "", category: "general" });
  const [addSaving, setAddSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/stats");
      const data: Stats = await res.json();
      if (data.responses) setStats(data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadStats(); }, []);

  const loadSkillHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/ai/psychologist?action=skill_history");
      const data: { skills?: SkillHistoryItem[] } = await res.json();
      if (data.skills) setSkillHistory(data.skills);
    } catch {}
    setHistoryLoading(false);
  }, []);

  useEffect(() => { if (showHistory) loadSkillHistory(); }, [showHistory, loadSkillHistory]);

  async function loadPendingTasks() {
    setTasksLoading(true);
    try {
      const res = await fetch("/api/ai/psychologist?action=feedback");
      const data: { feedback?: PsychTask[] } = await res.json();
      if (data.feedback) setPendingTasks(data.feedback.filter((f: PsychTask) => f.issue_type === "manual_override"));
    } catch {}
    setTasksLoading(false);
  }

  useEffect(() => { loadPendingTasks(); }, []);

  function extractSkillId(context: string): number | null {
    const m = context.match(/Skill\s+#?(\d+)/i);
    return m ? parseInt(m[1]) : null;
  }

  async function resolveTask(taskId: number, context: string) {
    const skillId = extractSkillId(context);
    if (!skillId) { setMsg({ type: "error", text: "Skill ID not found in request" }); return; }
    const answer = taskAnswers[taskId];
    if (!answer || !answer.trim()) return;
    setTaskSubmitting(taskId);
    try {
      const res = await fetch("/api/ai/psychologist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_skill", skillId, answer }),
      });
      const data: { success: boolean } = await res.json();
      if (data.success) {
        await fetch("/api/ai/psychologist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "resolve_feedback", feedbackId: taskId }),
        });
        setMsg({ type: "success", text: lang === "bn"
          ? "✅ উত্তর সংরক্ষিত হয়েছে — override সরানো হয়েছে"
          : "✅ Answer saved — override removed" });
        loadPendingTasks();
        if (showHistory) loadSkillHistory();
      }
    } catch {
      setMsg({ type: "error", text: lang === "bn" ? "ব্যর্থ" : "Failed" });
    }
    setTaskSubmitting(null);
  }

  useEffect(() => {
    if (msg) { const t = setTimeout(() => setMsg(null), 3000); return () => clearTimeout(t); }
  }, [msg]);

  async function runConsolidation() {
    setConsolidating(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/skills/consolidate", { method: "POST" });
      const data: ConsolidationResult & { ok: boolean } = await res.json();
      if (data.ok) setResult(data);
    } catch {}
    setConsolidating(false);
    loadStats();
  }

  async function notifyPsychologist(skillId: number) {
    setButtonLoading(skillId);
    try {
      const res = await fetch("/api/ai/psychologist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_override", skillId }),
      });
      const data: { success: boolean; manual_override: number } = await res.json();
      if (data.success) {
        setSkillHistory((prev) =>
          prev.map((s) => (s.id === skillId ? { ...s, manual_override: data.manual_override } : s))
        );
        if (data.manual_override) {
          setMsg({ type: "success", text: lang === "bn"
            ? "✅ সাইকোলজিস্টের জন্য রিকোয়েস্ট পাঠানো হয়েছে — এই প্রশ্নের সর্বোত্তম উত্তর নির্ধারণ করবেন"
            : "✅ Request sent to psychologist — they will determine the best answer" });
        } else {
          setMsg({ type: "success", text: lang === "bn"
            ? "✅ রিকোয়েস্ট ইতিমধ্যেই পাঠানো হয়েছে"
            : "✅ Request already sent" });
        }
      }
    } catch {
      setMsg({ type: "error", text: lang === "bn" ? "ব্যর্থ" : "Failed" });
    }
    setButtonLoading(null);
  }

  function startEdit(skill: SkillHistoryItem) {
    setEditingSkill(skill.id);
    setEditForm({
      keywords: skill.keywords || "",
      question: skill.question || "",
      answer: skill.answer || "",
      category: skill.category || "general",
    });
  }

  async function saveEdit(skillId: number) {
    setSaving(true);
    try {
      const res = await fetch("/api/ai/psychologist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_skill", skillId, ...editForm }),
      });
      const data: { success: boolean; error?: string } = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: lang === "bn" ? "✅ আপডেট হয়েছে" : "✅ Updated" });
        setEditingSkill(null);
        loadSkillHistory();
      } else {
        setMsg({ type: "error", text: data.error || "Failed" });
      }
    } catch {
      setMsg({ type: "error", text: lang === "bn" ? "ব্যর্থ" : "Failed" });
    }
    setSaving(false);
  }

  async function addSkill() {
    if (!addForm.keywords || !addForm.question || !addForm.answer) {
      setMsg({ type: "error", text: lang === "bn" ? "কীওয়ার্ড, প্রশ্ন ও উত্তর প্রয়োজন" : "Keywords, question & answer required" });
      return;
    }
    setAddSaving(true);
    try {
      const res = await fetch("/api/ai/psychologist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_skill", ...addForm, updatedBy: "manual" }),
      });
      const data: { success: boolean; error?: string } = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: lang === "bn" ? "✅ নতুন দক্ষতা যোগ হয়েছে" : "✅ Skill added" });
        setAddForm({ keywords: "", question: "", answer: "", category: "general" });
        setShowAddForm(false);
        loadStats();
        if (showHistory) loadSkillHistory();
      } else {
        setMsg({ type: "error", text: data.error || "Failed" });
      }
    } catch {
      setMsg({ type: "error", text: lang === "bn" ? "ব্যর্থ" : "Failed" });
    }
    setAddSaving(false);
  }

  const topPainPoints = stats ? Object.entries(stats.painPointFrequency).sort(([, a], [, b]) => b - a).slice(0, 10) : [];

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "দক্ষতা ও অ্যানালিটিক্স" : "Skills & Analytics"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "এআই দক্ষতা একত্রীকরণ ও সিস্টেম অ্যানালিটিক্স" : "AI skill consolidation & system analytics"}
          </p>
        </div>

        {msg && (
          <div className={`mb-4 px-4 py-2 rounded-xl text-sm font-medium ${
            msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>{msg.text}</div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: lang === "bn" ? "মোট রেসপন্স" : "Total Responses", value: stats?.responses.total || 0, color: "text-primary" },
            { label: lang === "bn" ? "আজকের রেসপন্স" : "Today", value: stats?.responses.today || 0, color: "text-green-600" },
            { label: lang === "bn" ? "কনভারসেশন" : "Conversations", value: stats?.conversations || 0, color: "text-blue-600" },
            { label: lang === "bn" ? "প্রোফাইল" : "Profiles", value: stats?.profiles || 0, color: "text-purple-600" },
            { label: lang === "bn" ? "দক্ষতা" : "Skills Learned", value: stats?.skills || 0, color: "text-amber-600" },
            { label: lang === "bn" ? "একটিভ মডেল" : "Active Models", value: stats?.models.active || 0, color: "text-indigo-600" },
            { label: lang === "bn" ? "একটিভ কী" : "Active API Keys", value: stats?.keys.active || 0, color: "text-teal-600" },
            { label: "AI Models", value: `${stats?.models.active || 0}/${stats?.models.total || 26}`, color: "text-rose-600" },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-text-secondary mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="card p-5">
            <h3 className="font-bold text-primary text-sm mb-3">
              {lang === "bn" ? "স্কিল কনসলিডেশন" : "Skill Consolidation"}
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              {lang === "bn"
                ? "স্বয়ংক্রিয়ভাবে WhatsApp কথোপকথন বিশ্লেষণ করে বারবার আসা প্রশ্নগুলোকে দক্ষতা হিসেবে সংরক্ষণ করে।"
                : "Automatically analyzes WhatsApp conversations and saves repeated questions as skills."}
            </p>
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 text-xs text-green-800">
                {lang === "bn"
                  ? `${result.shortcuts}টি শর্টকাট + ${result.faqs}টি FAQ তৈরি হয়েছে`
                  : `${result.shortcuts} shortcuts + ${result.faqs} FAQs created`}
              </div>
            )}
            <button onClick={runConsolidation} disabled={consolidating} className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all">
              {consolidating
                ? (lang === "bn" ? "কনসলিডেট হচ্ছে..." : "Consolidating...")
                : (lang === "bn" ? "🔍 স্কিল কনসলিডেট করুন" : "🔍 Consolidate Skills Now")}
            </button>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-primary text-sm mb-3">
              {lang === "bn" ? "শীর্ষ পেইন পয়েন্ট" : "Top Pain Points"}
            </h3>
            {topPainPoints.length === 0 ? (
              <p className="text-xs text-text-secondary">{lang === "bn" ? "কোনো পেইন পয়েন্ট নেই" : "No pain points recorded yet"}</p>
            ) : (
              <div className="space-y-2">
                {topPainPoints.map(([point, count], i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">{point}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 bg-primary/20 rounded-full" style={{ width: `${Math.min(100, (count / topPainPoints[0][1]) * 100)}px` }} />
                      <span className="text-xs font-bold text-text-secondary">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-primary text-sm mb-3">
            {lang === "bn" ? "সিস্টেম হেলথ" : "System Health"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div>
                <div className="text-xs font-medium text-green-800">
                  {lang === "bn" ? "ওয়েবহুক" : "Webhook"}
                </div>
                <div className="text-xs text-green-600">
                  {lang === "bn" ? "কানেক্টেড" : "Connected"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div>
                <div className="text-xs font-medium text-amber-800">
                  {lang === "bn" ? "ক্যাশে" : "Cache"}
                </div>
                <div className="text-xs text-amber-600">{stats?.skills || 0} {lang === "bn" ? "দক্ষতা" : "skills"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div>
                <div className="text-xs font-medium text-blue-800">
                  {lang === "bn" ? "ডাটাবেস" : "Database"}
                </div>
                <div className="text-xs text-blue-600">{stats?.profiles || 0} {lang === "bn" ? "প্রোফাইল" : "profiles"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ ADD NEW SKILL ══════════════ */}
        <div className="card p-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-primary text-sm">
              {lang === "bn" ? "নতুন দক্ষতা যোগ করুন" : "Add New Skill"}
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-xl hover:bg-primary/90 transition-all"
            >
              {showAddForm ? (lang === "bn" ? "বন্ধ করুন" : "Close") : (lang === "bn" ? "➕ যোগ করুন" : "➕ Add")}
            </button>
          </div>
          {showAddForm && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">{lang === "bn" ? "কীওয়ার্ড (কমা দিয়ে আলাদা):" : "Keywords (comma-separated):"}</label>
                <input type="text" value={addForm.keywords} onChange={(e) => setAddForm({ ...addForm, keywords: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1">{lang === "bn" ? "প্রশ্ন:" : "Question:"}</label>
                <input type="text" value={addForm.question} onChange={(e) => setAddForm({ ...addForm, question: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1">{lang === "bn" ? "উত্তর:" : "Answer:"}</label>
                <textarea value={addForm.answer} onChange={(e) => setAddForm({ ...addForm, answer: e.target.value })} rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1">{lang === "bn" ? "বিভাগ:" : "Category:"}</label>
                <select value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="general">{lang === "bn" ? "সাধারণ" : "General"}</option>
                  <option value="psychologist">{lang === "bn" ? "সাইকোলজিস্ট" : "Psychologist"}</option>
                  <option value="faq">{lang === "bn" ? "FAQ" : "FAQ"}</option>
                  <option value="auto_learn">{lang === "bn" ? "অটো লার্ন" : "Auto Learn"}</option>
                </select>
              </div>
              <button onClick={addSkill} disabled={addSaving}
                className="px-4 py-2 text-xs font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all">
                {addSaving ? (lang === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving...") : (lang === "bn" ? "✅ সংরক্ষণ করুন" : "✅ Save Skill")}
              </button>
            </div>
          )}
        </div>

        {/* ══════════════ PENDING PSYCHOLOGIST TASKS ══════════════ */}
        {pendingTasks.length > 0 && (
          <div className="card p-5 mt-6 border-2 border-purple-200 bg-purple-50/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-purple-700 text-sm">
                🧠 {lang === "bn" ? "সাইকোলজিস্টের জন্য অপেক্ষমাণ টাস্ক" : "Pending Psychologist Tasks"}
                <span className="ml-2 text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">{pendingTasks.length}</span>
              </h3>
              <button onClick={loadPendingTasks} className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all">
                {lang === "bn" ? "🔄 রিফ্রেশ" : "🔄 Refresh"}
              </button>
            </div>
            {tasksLoading ? (
              <Skeleton className="h-4 w-32 mx-auto" />
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((task) => {
                  const skillId = extractSkillId(task.context);
                  return (
                    <div key={task.id} className="border border-purple-200 bg-white rounded-xl p-3">
                      <div className="text-xs text-text-secondary mb-1">
                        {lang === "bn" ? "স্কিল #" : "Skill #"}{skillId || "?"}
                        <span className="mx-2">|</span>
                        {new Date(task.created_at).toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-primary mb-2 whitespace-pre-wrap">{task.context}</div>
                      <textarea
                        value={taskAnswers[task.id] || ""}
                        onChange={(e) => setTaskAnswers((prev) => ({ ...prev, [task.id]: e.target.value }))}
                        placeholder={lang === "bn" ? "এই প্রশ্নের জন্য সর্বোত্তম উত্তর লিখুন..." : "Write the best answer for this question..."}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 mb-2"
                      />
                      <button
                        onClick={() => resolveTask(task.id, task.context)}
                        disabled={taskSubmitting === task.id || !taskAnswers[task.id]?.trim()}
                        className="px-4 py-2 text-xs font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all"
                      >
                        {taskSubmitting === task.id
                          ? (lang === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving...")
                          : (lang === "bn" ? "✅ উত্তর সংরক্ষণ করুন" : "✅ Save Answer")}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════ SKILL HISTORY ══════════════ */}
        <div className="card p-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-primary text-sm">
              {lang === "bn" ? "স্কিল হিস্টোরি (সাইকোলজিস্ট ট্র্যাকিং)" : "Skill History (Psychologist Tracking)"}
            </h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-xl hover:bg-primary/90 transition-all"
            >
              {showHistory ? (lang === "bn" ? "বন্ধ করুন" : "Close") : (lang === "bn" ? "দেখুন" : "View History")}
            </button>
          </div>

          {showHistory && (
            historyLoading ? (
              <Skeleton className="h-4 w-32 mx-auto" />
            ) : skillHistory.length === 0 ? (
              <div className="text-text-secondary text-sm py-8 text-center">
                {lang === "bn" ? "কোনো স্কিল পাওয়া যায়নি" : "No skills found"}
              </div>
            ) : (
              <div className="space-y-2">
                {skillHistory.map((skill) => (
                  <div key={skill.id} className={`border rounded-xl overflow-hidden ${
                    skill.manual_override === 1 ? "border-amber-300 bg-amber-50/30" : "border-gray-100"
                  }`}>
                    <div className="flex items-center justify-between p-3">
                      <div
                        onClick={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)}
                        className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover:opacity-80"
                      >
                        <span className={`w-2 h-2 rounded-full ${skill.is_psychologist_updated ? "bg-purple-500" : skill.manual_override === 1 ? "bg-amber-500" : "bg-gray-300"}`} />
                        <span className="text-sm font-medium text-primary truncate">{skill.question || skill.name || `Skill #${skill.id}`}</span>
                        <span className="text-xs text-text-secondary">v{skill.version || 0}</span>
                        {skill.is_psychologist_updated && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                            {lang === "bn" ? "সাইকোলজিস্ট" : "Psychologist"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <button
                          onClick={(e) => { e.stopPropagation(); notifyPsychologist(skill.id); }}
                          disabled={buttonLoading === skill.id}
                          className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all flex items-center gap-1 ${
                            skill.manual_override === 1
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          } disabled:opacity-50`}
                        >
                          {buttonLoading === skill.id ? (
                            <><span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> {lang === "bn" ? "পাঠানো হচ্ছে..." : "Sending..."}</>
                          ) : skill.manual_override === 1 ? (
                            lang === "bn" ? "✅ সাইকোলজিস্ট রিকোয়েস্টেড" : "✅ Psychologist Requested"
                          ) : (
                            lang === "bn" ? "🧠 সাইকোলজিস্টকে জানান" : "🧠 Notify Psychologist"
                          )}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); startEdit(skill); }}
                          className="px-2 py-1 text-[10px] font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                        >
                          {lang === "bn" ? "এডিট" : "Edit"}
                        </button>
                        <span>{new Date(skill.updated_at).toLocaleDateString()}</span>
                        <span className={`transition-transform ${expandedSkill === skill.id ? "rotate-180" : ""}`}>▼</span>
                      </div>
                    </div>

                    {/* Edit Mode */}
                    {editingSkill === skill.id && (
                      <div className="px-3 pb-3 space-y-2 text-xs border-t border-gray-100 pt-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-text-secondary block mb-0.5">{lang === "bn" ? "কীওয়ার্ড:" : "Keywords:"}</label>
                            <input type="text" value={editForm.keywords} onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                          </div>
                          <div>
                            <label className="text-text-secondary block mb-0.5">{lang === "bn" ? "বিভাগ:" : "Category:"}</label>
                            <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/30">
                              <option value="general">General</option>
                              <option value="psychologist">Psychologist</option>
                              <option value="faq">FAQ</option>
                              <option value="auto_learn">Auto Learn</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-text-secondary block mb-0.5">{lang === "bn" ? "প্রশ্ন:" : "Question:"}</label>
                          <input type="text" value={editForm.question} onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                        </div>
                        <div>
                          <label className="text-text-secondary block mb-0.5">{lang === "bn" ? "উত্তর:" : "Answer:"}</label>
                          <textarea value={editForm.answer} onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })} rows={3}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(skill.id)} disabled={saving}
                            className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                            {saving ? (lang === "bn" ? "সংরক্ষণ..." : "Saving...") : (lang === "bn" ? "✅ সংরক্ষণ" : "✅ Save")}
                          </button>
                          <button onClick={() => setEditingSkill(null)}
                            className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                            {lang === "bn" ? "বাতিল" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {expandedSkill === skill.id && editingSkill !== skill.id && (
                      <div className="px-3 pb-3 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                          <div><span className="text-text-secondary">{lang === "bn" ? "বিভাগ:" : "Category:"}</span> {skill.category || "-"}</div>
                          <div><span className="text-text-secondary">{lang === "bn" ? "কীওয়ার্ড:" : "Keywords:"}</span> {skill.keywords?.slice(0, 100) || "-"}</div>
                          <div><span className="text-text-secondary">{lang === "bn" ? "আপডেট করেছেন:" : "Updated by:"}</span> {skill.updated_by || "system"}</div>
                          <div><span className="text-text-secondary">{lang === "bn" ? "তৈরি:" : "Created:"}</span> {new Date(skill.created_at).toLocaleDateString()}</div>
                          <div><span className="text-text-secondary">{lang === "bn" ? "ব্যবহার:" : "Usage:"}</span> {skill.usage_count || 0}x</div>
                          <div><span className="text-text-secondary">{lang === "bn" ? "ম্যানুয়াল:" : "Manual:"}</span>
                            <span className={skill.manual_override === 1 ? "text-amber-600 font-medium" : ""}>
                              {skill.manual_override === 1 ? (lang === "bn" ? "চালু" : "ON") : (lang === "bn" ? "বন্ধ" : "OFF")}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-text-secondary mt-2 mb-1">
                            {lang === "bn" ? "প্রশ্ন:" : "Question:"}
                          </div>
                          <div className="p-2 bg-gray-50 rounded-lg text-primary whitespace-pre-wrap">
                            {skill.question || "-"}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-text-secondary mt-2 mb-1">
                            {lang === "bn" ? "উত্তর:" : "Answer:"}
                          </div>
                          <div className="p-2 bg-gray-50 rounded-lg text-text-secondary whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {skill.answer?.slice(0, 1000) || "-"}
                          </div>
                        </div>

                        {skill.psychologist_notes && (
                          <div className="p-2 bg-purple-50 border border-purple-100 rounded-lg">
                            <span className="font-medium text-purple-700">{lang === "bn" ? "সাইকোলজিস্ট নোট:" : "Psychologist Notes:"}</span>
                            <p className="mt-0.5 text-purple-600">{skill.psychologist_notes}</p>
                          </div>
                        )}

                        {skill.audit_log && skill.audit_log.length > 0 && (
                          <>
                            <div className="text-xs font-medium text-text-secondary mt-2 mb-1">
                              {lang === "bn" ? "অডিট লগ:" : "Audit Log:"}
                            </div>
                            <div className="space-y-1">
                              {skill.audit_log.map((log, li) => (
                                <div key={li} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    log.action === "update" ? "bg-amber-100 text-amber-700" :
                                    log.action === "created" || log.action === "create" ? "bg-green-100 text-green-700" :
                                    "bg-blue-100 text-blue-700"
                                  }`}>{log.action}{log.field_name ? `:${log.field_name}` : ""}</span>
                                  <span className="text-text-secondary">{log.updated_by}</span>
                                  <span className="text-text-secondary/60">{new Date(log.created_at).toLocaleDateString()}</span>
                                  {(log.old_value || log.new_value) && (
                                    <span className="text-text-secondary/60 truncate max-w-[200px]">
                                      {log.old_value ? `"${log.old_value.slice(0, 30)}"` : ""}
                                      {log.old_value && log.new_value ? " → " : ""}
                                      {log.new_value ? `"${log.new_value.slice(0, 30)}"` : ""}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

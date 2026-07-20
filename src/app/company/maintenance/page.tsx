"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card, StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface TableStat {
  name: string;
  rows: number;
}

interface HistoryItem {
  id: number;
  action: string;
  table_name: string;
  rows_deleted: number;
  status: string;
  details: string;
  created_at: string;
}

const TABLES_FOR_CLEANUP = [
  { key: "user_events", en: "User Events", bn: "ইউজার ইভেন্ট", desc: "Page views, clicks, searches" },
  { key: "user_sessions", en: "User Sessions", bn: "ইউজার সেশন", desc: "Session start/end records" },
  { key: "user_searches", en: "User Searches", bn: "সার্চ", desc: "Search queries" },
  { key: "notifications", en: "Notifications", bn: "বিজ্ঞপ্তি", desc: "Sent notifications" },
  { key: "communication_history", en: "Communication", bn: "যোগাযোগ", desc: "Message history" },
  { key: "ai_log", en: "AI Log", bn: "এআই লগ", desc: "AI prompt/response pairs" },
  { key: "ai_conversations", en: "AI Conversations", bn: "এআই কথোপকথন", desc: "Full conversation logs" },
  { key: "ai_agent_logs", en: "Agent Logs", bn: "এজেন্ট লগ", desc: "Agent action logs" },
  { key: "ai_agent_tasks", en: "Agent Tasks", bn: "এজেন্ট টাস্ক", desc: "Agent task records" },
  { key: "ai_agent_submissions", en: "Agent Submissions", bn: "এজেন্ট সাবমিশন", desc: "Agent submission records" },
  { key: "ai_agent_reports", en: "Agent Reports", bn: "এজেন্ট রিপোর্ট", desc: "Generated reports" },
  { key: "wa_logs", en: "WhatsApp Logs", bn: "হোয়াটসঅ্যাপ লগ", desc: "WhatsApp message logs" },
  { key: "wa_message_queue", en: "WhatsApp Queue", bn: "হোয়াটসঅ্যাপ কিউ", desc: "Queued messages (sent only)" },
  { key: "brain_usage", en: "Brain Usage", bn: "ব্রেইন ইউসেজ", desc: "AI brain request logs" },
  { key: "agent_feedback", en: "Agent Feedback", bn: "এজেন্ট ফিডব্যাক", desc: "AI feedback records" },
];

export default function MaintenancePage() {
  const { lang } = useLanguageStore();
  const [tab, setTab] = useState<"overview" | "cleanup" | "history" | "schedule">("overview");
  const [tableStats, setTableStats] = useState<TableStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState("user_events");
  const [retentionDays, setRetentionDays] = useState(90);
  const [estimating, setEstimating] = useState(false);
  const [estimatedRows, setEstimatedRows] = useState<number | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleHour, setScheduleHour] = useState(3);
  const [scheduleDays, setScheduleDays] = useState(90);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/maintenance/stats");
      const data = await res.json() as { tables?: TableStat[] };
      setTableStats(data.tables || []);
    } catch {}
    setLoading(false);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/maintenance/history");
      const data = await res.json() as { logs?: HistoryItem[] };
      setHistory(data.logs || []);
    } catch {}
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/maintenance/schedule");
      const data = await res.json() as { enabled?: boolean; retentionDays?: number; scheduleHour?: number };
      setScheduleEnabled(data.enabled || false);
      setScheduleDays(data.retentionDays || 90);
      setScheduleHour(data.scheduleHour || 3);
    } catch {}
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleEstimate = async () => {
    setEstimating(true);
    setEstimatedRows(null);
    try {
      const res = await fetch("/api/maintenance/stats");
      const data = await res.json() as { tables?: TableStat[] };
      const found = (data.tables || []).find((t: TableStat) => t.name === selectedTable);
      setEstimatedRows(found?.rows || 0);
    } catch {}
    setEstimating(false);
  };

  const handleCleanup = async () => {
    if (!confirm(lang === "bn" ? `নিশ্চিত? ${selectedTable} টেবিল থেকে ${retentionDays} দিনের বেশি পুরনো ডাটা ডিলিট হবে।` : `Confirm? Delete data older than ${retentionDays} days from ${selectedTable}?`)) return;
    setCleaning(true);
    setResult(null);
    try {
      const res = await fetch("/api/maintenance/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: selectedTable, olderThanDays: retentionDays }),
      });
      const data = await res.json() as { success?: boolean; rowsDeleted?: number };
      if (data.success) {
        setResult(lang === "bn" ? `${data.rowsDeleted}টি row ডিলিট হয়েছে` : `${data.rowsDeleted} rows deleted`);
        loadStats();
      }
    } catch {
      setResult(lang === "bn" ? "ব্যর্থ" : "Failed");
    }
    setCleaning(false);
  };

  const handleCleanAll = async () => {
    if (!confirm(lang === "bn" ? `নিশ্চিত? সব টেবিল থেকে ${retentionDays} দিনের বেশি পুরনো ডাটা ডিলিট হবে।` : `Confirm? Delete ALL data older than ${retentionDays} days from all tables?`)) return;
    setCleaning(true);
    setResult(null);
    try {
      const res = await fetch("/api/maintenance/cleanup-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ olderThanDays: retentionDays }),
      });
      const data = await res.json() as { success?: boolean; totalRowsDeleted?: number };
      if (data.success) {
        setResult(lang === "bn" ? `সব মোট ${data.totalRowsDeleted}টি row ডিলিট হয়েছে` : `Total ${data.totalRowsDeleted} rows deleted`);
        loadStats();
      }
    } catch {
      setResult(lang === "bn" ? "ব্যর্থ" : "Failed");
    }
    setCleaning(false);
  };

  const handleClearCache = async () => {
    try {
      await fetch("/api/maintenance/clear-cache", { method: "POST" });
      setResult(lang === "bn" ? "ক্যাশে ক্লিয়ার হয়েছে" : "Cache cleared");
    } catch {
      setResult(lang === "bn" ? "ব্যর্থ" : "Failed");
    }
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    try {
      await fetch("/api/maintenance/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: scheduleEnabled, retentionDays: scheduleDays, scheduleHour }),
      });
      setResult(lang === "bn" ? "শিডিউল সেভ হয়েছে" : "Schedule saved");
    } catch {
      setResult(lang === "bn" ? "ব্যর্থ" : "Failed");
    }
    setSavingSchedule(false);
  };

  const totalRows = tableStats.reduce((s, t) => s + (t.rows > 0 ? t.rows : 0), 0);

  const tabs = [
    { id: "overview" as const, en: "Overview", bn: "ওভারভিউ" },
    { id: "cleanup" as const, en: "Cleanup", bn: "ক্লিনআপ" },
    { id: "history" as const, en: "History", bn: "ইতিহাস" },
    { id: "schedule" as const, en: "Schedule", bn: "শিডিউল" },
  ];

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "🔧 রক্ষণাবেক্ষণ" : "🔧 System Maintenance"}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "ডাটাবেজ ক্লিনআপ, ক্যাশে ও পারফরম্যান্স মনিটরিং" : "Database cleanup, cache & performance monitoring"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "history") loadHistory(); if (t.id === "schedule") loadSchedule(); }}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? "bg-action text-white shadow-lg shadow-action/25" : "text-text-secondary hover:bg-primary/5 hover:text-primary"}`}>
              {lang === "bn" ? t.bn : t.en}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12"><Skeleton className="w-8 h-8 rounded-full" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label={lang === "bn" ? "মোট টেবিল" : "Tables"} value={String(tableStats.length)} color="text-primary" />
                  <StatCard label={lang === "bn" ? "মোট সারি" : "Total Rows"} value={totalRows.toLocaleString()} color="text-action" />
                  <StatCard label={lang === "bn" ? "ক্লিনযোগ্য" : "Cleanable Tables"} value={String(tableStats.filter(t => t.name !== "workers" && t.rows > 0).length)} color="text-secondary-dark" />
                  <StatCard label={lang === "bn" ? "ক্লিনআপ ইতিহাস" : "History"} value={String(history.length)} color="text-accent" />
                </div>

                <Card>
                  <h3 className="font-bold text-primary mb-3">{lang === "bn" ? "টেবিল স্ট্যাটাস" : "Table Status"}</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tableStats.map((t) => (
                      <div key={t.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <span className="text-sm font-medium text-primary">{t.name}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${t.rows > 10000 ? "bg-red-100 text-red-600" : t.rows > 1000 ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>
                            {t.rows < 0 ? (lang === "bn" ? "নেই" : "N/A") : `${t.rows.toLocaleString()} rows`}
                          </span>
                        </div>
                        {t.rows > 10000 && <span className="text-xs text-red-500 font-medium">{lang === "bn" ? "⚠️ ক্লিন প্রয়োজন" : "⚠️ Needs cleanup"}</span>}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3 className="font-bold text-primary mb-3">{lang === "bn" ? "দ্রুত অপারেশন" : "Quick Actions"}</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => { setTab("cleanup"); }} className="!py-2.5 !px-5">{lang === "bn" ? "🧹 ক্লিনআপ" : "🧹 Go to Cleanup"}</Button>
                    <Button onClick={handleClearCache} className="!py-2.5 !px-5 !bg-accent/10 !text-accent !border-accent/30">
                      {lang === "bn" ? "🗑️ ক্যাশে ক্লিয়ার" : "🗑️ Clear Cache"}
                    </Button>
                    <Button onClick={() => loadStats()} className="!py-2.5 !px-5 !bg-gray-100 !text-gray-600">
                      {lang === "bn" ? "🔄 রিফ্রেশ" : "🔄 Refresh"}
                    </Button>
                  </div>
                </Card>

                {result && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">{result}</div>
                )}
              </>
            )}
          </div>
        )}

        {/* Cleanup Tab */}
        {tab === "cleanup" && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "🧹 ডাটা ক্লিনআপ" : "🧹 Data Cleanup"}</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "টেবিল সিলেক্ট করুন" : "Select Table"}</label>
                  <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} className="input-field">
                    {TABLES_FOR_CLEANUP.map((t) => (
                      <option key={t.key} value={t.key}>{lang === "bn" ? t.bn : t.en}</option>
                    ))}
                  </select>
                  <p className="text-xs text-text-secondary mt-1">{TABLES_FOR_CLEANUP.find(t => t.key === selectedTable)?.desc}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "কত দিনের পুরনো?" : "Older than (days)"}</label>
                  <input type="number" value={retentionDays} onChange={(e) => setRetentionDays(Math.max(30, parseInt(e.target.value) || 90))} min={30} className="input-field" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleEstimate} disabled={estimating} className="!py-2.5">
                  {estimating ? (lang === "bn" ? "গণনা..." : "Estimating...") : (lang === "bn" ? "📊 অনুমান" : "📊 Estimate")}
                </Button>
                <Button onClick={handleCleanup} disabled={cleaning} className="!py-2.5 !bg-red-500 hover:!bg-red-600">
                  {cleaning ? (lang === "bn" ? "ক্লিনিং..." : "Cleaning...") : (lang === "bn" ? "🗑️ ক্লিন নাও" : "🗑️ Clean Now")}
                </Button>
              </div>
              {estimatedRows !== null && (
                <p className="text-sm text-text-secondary mt-3">
                  {lang === "bn" ? `≈ ${estimatedRows.toLocaleString()}টি row ডিলিট হবে` : `≈ ${estimatedRows.toLocaleString()} rows will be deleted`}
                </p>
              )}
            </Card>

            <Card>
              <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "⚡ বাল্ক ক্লিনআপ" : "⚡ Bulk Cleanup"}</h3>
              <p className="text-sm text-text-secondary mb-4">
                {lang === "bn" ? "সব টেবিল থেকে {retentionDays} দিনের বেশি পুরনো ডাটা একবারে ডিলিট করুন।" : `Delete data older than ${retentionDays} days from ALL tables at once.`}
              </p>
              <Button onClick={handleCleanAll} disabled={cleaning} className="!py-2.5 !bg-red-500 hover:!bg-red-600">
                {cleaning ? (lang === "bn" ? "ক্লিনিং..." : "Cleaning...") : (lang === "bn" ? "🧹 সব ক্লিন করুন" : "🧹 Clean All Tables")}
              </Button>
            </Card>

            {result && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">{result}</div>
            )}
          </div>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "📋 ক্লিনআপ ইতিহাস" : "📋 Cleanup History"}</h3>
            {history.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-8">{lang === "bn" ? "কোনো ক্লিনআপ করা হয়নি" : "No cleanup performed yet"}</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${h.status === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {h.action}
                      </span>
                      <span className="text-sm text-primary ml-2">{h.table_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-text-secondary">{h.rows_deleted} rows</span>
                      <p className="text-[10px] text-gray-400">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={loadHistory} className="mt-4 w-full !py-2.5 !bg-gray-100 !text-gray-600">
              {lang === "bn" ? "🔄 রিফ্রেশ" : "🔄 Refresh"}
            </Button>
          </Card>
        )}

        {/* Schedule Tab */}
        {tab === "schedule" && (
          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "⏰ অটো-ক্লিনআপ শিডিউল" : "⏰ Auto-Cleanup Schedule"}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-action focus:ring-action" />
                <span className="text-sm text-primary">{lang === "bn" ? "অটো-ক্লিনআপ সক্রিয় করুন" : "Enable auto-cleanup"}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "প্রতি ঘন্টা" : "Schedule Hour"}</label>
                  <select value={scheduleHour} onChange={(e) => setScheduleHour(parseInt(e.target.value))} className="input-field">
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
                    ))}
                  </select>
                  <p className="text-xs text-text-secondary mt-1">{lang === "bn" ? "আপনার টাইমজোন অনুসারে সময় (কনফিগার করা সেটিংস থেকে)" : "Time in your configured timezone (from Settings)"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "তথ্য সংরক্ষণের সময়" : "Retention Period (days)"}</label>
                  <input type="number" value={scheduleDays} onChange={(e) => setScheduleDays(Math.max(30, parseInt(e.target.value) || 90))} min={30} className="input-field" />
                </div>
              </div>
              <Button onClick={handleSaveSchedule} disabled={savingSchedule} className="w-full !py-3">
                {savingSchedule ? (lang === "bn" ? "সংরক্ষণ..." : "Saving...") : (lang === "bn" ? "শিডিউল সেভ করুন" : "Save Schedule")}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

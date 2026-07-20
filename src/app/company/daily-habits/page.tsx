"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";

export default function DailyHabitsPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [stats, setStats] = useState<{ today: { morningSent: number; eveningSnap: number; avgTrust: number }; totalWorkers: number } | null>(null);
  const [logs, setLogs] = useState<{ habit_type: string; count: number; date: string }[]>([]);
  const [candidates, setCandidates] = useState<{ worker_id: string; name: string; phone: string; sector: string | null }[]>([]);
  const [running, setRunning] = useState(false);
  const [snapshotMsg, setSnapshotMsg] = useState("");

  useEffect(() => {
    fetch("/api/company/daily-habits?action=stats")
      .then(r => r.json() as Promise<{ today: { morningSent: number; eveningSnap: number; avgTrust: number }; totalWorkers: number }>).then(d => { if (d.today) setStats(d); });
    fetch("/api/company/daily-habits?action=log&days=14")
      .then(r => r.json() as Promise<{ logs: { habit_type: string; count: number; date: string }[] }>).then(d => { if (d.logs) setLogs(d.logs); });
    fetch("/api/company/daily-habits?action=morning_candidates")
      .then(r => r.json() as Promise<{ candidates: { worker_id: string; name: string; phone: string; sector: string | null }[] }>).then(d => { if (d.candidates) setCandidates(d.candidates); });
  }, []);

  const runSnapshot = async () => {
    setRunning(true);
    setSnapshotMsg("");
    const res = await fetch("/api/company/daily-habits", {
      method: "POST", body: JSON.stringify({ action: "snapshot_trust" }),
    });
    const d: { avgTrust: number; totalProfiles: number; trusting: number } = await res.json();
    setSnapshotMsg(isBn ? `স্ন্যাপশট নেওয়া হয়েছে: গড় বিশ্বাস ${d.avgTrust}, মোট ${d.totalProfiles}, উচ্চ বিশ্বাস ${d.trusting}` : `Snapshot taken: avg trust ${d.avgTrust}, total ${d.totalProfiles}, high trust ${d.trusting}`);
    setRunning(false);
    fetch("/api/company/daily-habits?action=stats").then(r => r.json() as Promise<{ today: { morningSent: number; eveningSnap: number; avgTrust: number }; totalWorkers: number }>).then(d2 => { if (d2.today) setStats(d2); });
    fetch("/api/company/daily-habits?action=log&days=14").then(r => r.json() as Promise<{ logs: { habit_type: string; count: number; date: string }[] }>).then(d2 => { if (d2.logs) setLogs(d2.logs); });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{isBn ? "দৈনিক অভ্যাস অটোমেশন" : "Daily Habit Automation"}</h1>
      <p className="text-gray-500 mb-6">
        {isBn
          ? "বব বার্গের The Art of Persuasion — ৭ম অধ্যায়: প্রতিদিনের অভ্যাস। সকালে মূল্য বার্তা, রাতে বিশ্বাস কারেন্সি স্ন্যাপশট।"
          : "Bob Berg's The Art of Persuasion — Ch 8: Influence as a Daily Habit. Morning value messages, evening trust currency snapshots."}
      </p>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">{isBn ? "সকালের বার্তা" : "Morning Messages"}</div>
          <div className="text-3xl font-bold text-blue-600">{stats?.today.morningSent || 0}</div>
          <div className="text-xs text-gray-400">{isBn ? "আজ পাঠানো হয়েছে" : "Sent today"}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">{isBn ? "সন্ধ্যা স্ন্যাপশট" : "Evening Snapshot"}</div>
          <div className="text-3xl font-bold text-green-600">{stats?.today.eveningSnap || 0}</div>
          <div className="text-xs text-gray-400">{isBn ? "আজ নেওয়া হয়েছে" : "Taken today"}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">{isBn ? "গড় বিশ্বাস" : "Avg Trust Currency"}</div>
          <div className="text-3xl font-bold text-purple-600">{stats?.today.avgTrust || "—"}</div>
          <div className="text-xs text-gray-400">{isBn ? "আজকের স্ন্যাপশট" : "Today's snapshot"}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">{isBn ? "মোট সদস্য" : "Total Workers"}</div>
          <div className="text-3xl font-bold text-gray-800">{stats?.totalWorkers || 0}</div>
          <div className="text-xs text-gray-400">{isBn ? "বার্তা পাওয়ার যোগ্য" : "Eligible for messages"}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Morning Candidates */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-semibold mb-3">{isBn ? "আজকের মূল্য বার্তা প্রার্থী" : "Today's Value Message Candidates"}</h2>
          <p className="text-sm text-gray-500 mb-3">
            {isBn ? "যাদের আজ এখনো বার্তা পাঠানো হয়নি। কোন অফার নয় — শুধু সংযোগ ও মূল্য।" : "Not yet messaged today. No offers — just connection and value."}
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {candidates.map(c => (
              <div key={c.worker_id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                <span className="font-medium">{c.name || c.phone}</span>
                <span className="text-gray-400 text-xs">{c.sector || "—"}</span>
              </div>
            ))}
            {candidates.length === 0 && <div className="text-gray-400 text-center py-4">{isBn ? "সবাইকে বার্তা পাঠানো হয়েছে!" : "Everyone messaged today!"}</div>}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {isBn
              ? "বার্তাগুলি AI এজেন্টের মাধ্যমে স্বয়ংক্রিয়ভাবে পাঠানো হবে (ক্রন জব সেটআপ প্রয়োজন)"
              : "Messages will be sent automatically via AI agents (cron job setup required)"}
          </p>
        </div>

        {/* Snapshot */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-semibold mb-3">{isBn ? "বিশ্বাস কারেন্সি স্ন্যাপশট" : "Trust Currency Snapshot"}</h2>
          <p className="text-sm text-gray-500 mb-3">
            {isBn
              ? "সারাদিনের সব ইন্টারঅ্যাকশনের পর বিশ্বাস কারেন্সি ব্যালেন্স আপডেট করুন।"
              : "Update the trust currency balance after all daily interactions."}
          </p>
          <button
            onClick={runSnapshot}
            disabled={running}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {running ? (isBn ? "নেওয়া হচ্ছে..." : "Snapshoting...") : isBn ? "🔴 স্ন্যাপশট নিন" : "🔴 Take Snapshot"}
          </button>
          {snapshotMsg && <p className="text-sm text-green-600 mt-2">{snapshotMsg}</p>}
        </div>
      </div>

      {/* Log */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="font-semibold mb-3">{isBn ? "১৪ দিনের ইতিহাস" : "14-Day History"}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">{isBn ? "তারিখ" : "Date"}</th>
                <th className="pb-2 font-medium">{isBn ? "ধরন" : "Type"}</th>
                <th className="pb-2 font-medium">{isBn ? "গণনা" : "Count"}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{l.date}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      l.habit_type === "morning_value" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                      {l.habit_type === "morning_value" ? (isBn ? "সকালের বার্তা" : "Morning") : (isBn ? "বিশ্বাস স্ন্যাপশট" : "Trust Snap")}
                    </span>
                  </td>
                  <td className="py-2 font-medium">{l.count}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">{isBn ? "কোনো লগ নেই" : "No logs"}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

interface Worker { worker_id: string; name: string; phone: string; }

export default function CompanyNotificationsPage() {
  const { lang } = useLanguageStore();
  const [tab, setTab] = useState<"broadcast" | "history">("broadcast");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");

  useEffect(() => {
    fetch("/api/track/analytics?allCustomers=1")
      .then(r => r.json())
      .then((d: any) => setWorkers(d.customers || []))
      .catch(() => {});
  }, []);

  const sendNotification = async () => {
    if (!title) return;
    setSending(true);
    setResult("");
    let sent = 0;
    const targets = selectedWorker ? [selectedWorker] : workers.map(w => w.worker_id);
    for (const wid of targets) {
      try {
        const res = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerId: wid, title, message, type }),
        });
        if (res.ok) sent++;
      } catch {}
    }
    setResult(lang === "bn" ? `${sent} জনকে পাঠানো হয়েছে` : `Sent to ${sent} users`);
    setSending(false);
    setTitle(""); setMessage("");
  };

  const loadHistory = async () => {
    setLoading(true);
    setNotifications([]);
    try {
      const res = await fetch("/api/notifications?workerId=_all_");
      const data = await res.json() as { notifications: any[] };
      // For admin, fetch last 100 across all workers (by fetching sample)
      setNotifications(data.notifications || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (tab === "history") loadHistory(); }, [tab]);

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-primary">
          {lang === "bn" ? "বিজ্ঞপ্তি ব্যবস্থাপনা" : "Notification Management"}
        </h1>

        <div className="flex gap-2">
          <button onClick={() => setTab("broadcast")} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === "broadcast" ? "bg-primary text-white" : "bg-white border border-border text-text-secondary"}`}>
            {lang === "bn" ? "বার্তা পাঠান" : "Broadcast"}
          </button>
          <button onClick={() => setTab("history")} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === "history" ? "bg-primary text-white" : "bg-white border border-border text-text-secondary"}`}>
            {lang === "bn" ? "ইতিহাস" : "History"}
          </button>
        </div>

        {tab === "broadcast" && (
          <Card className="!p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                {lang === "bn" ? "গ্রাহক (ফাঁকা রাখলে সবাই)" : "Target (leave empty for all)"}
              </label>
              <input type="text" value={workerSearch} onChange={e => { setWorkerSearch(e.target.value); setSelectedWorker(""); }} placeholder={lang === "bn" ? "গ্রাহক খুঁজুন..." : "Search customer..."} className="w-full px-4 py-2 rounded-xl border border-border bg-white text-sm mb-2" />
              <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-border bg-white text-sm">
                <option value="">{lang === "bn" ? "সব গ্রাহক" : "All customers"} ({workers.length})</option>
                {workers.filter(w => w.name?.toLowerCase().includes(workerSearch.toLowerCase()) || w.phone?.includes(workerSearch)).slice(0, 20).map(w => (
                  <option key={w.worker_id} value={w.worker_id}>{w.name} ({w.phone})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">{lang === "bn" ? "ধরন" : "Type"}</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-border bg-white text-sm">
                <option value="info">ℹ️ {lang === "bn" ? "তথ্য" : "Info"}</option>
                <option value="success">✅ {lang === "bn" ? "সাফল্য" : "Success"}</option>
                <option value="warning">⚠️ {lang === "bn" ? "সতর্কতা" : "Warning"}</option>
                <option value="alert">🔴 {lang === "bn" ? "জরুরি" : "Alert"}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">{lang === "bn" ? "শিরোনাম" : "Title"} *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-border bg-white text-sm" placeholder={lang === "bn" ? "বিজ্ঞপ্তির শিরোনাম" : "Notification title"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">{lang === "bn" ? "বার্তা" : "Message"}</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-xl border border-border bg-white text-sm resize-none" placeholder={lang === "bn" ? "বিজ্ঞপ্তির বার্তা" : "Notification message"} />
            </div>
            <button onClick={sendNotification} disabled={sending || !title} className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {sending ? (lang === "bn" ? "পাঠানো হচ্ছে..." : "Sending...") : lang === "bn" ? "বার্তা পাঠান" : "Send Notification"}
            </button>
            {result && <p className="text-sm text-green-600">{result}</p>}
          </Card>
        )}

        {tab === "history" && (
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-text-secondary">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">{lang === "bn" ? "কোনো বিজ্ঞপ্তি নেই" : "No notifications"}</div>
            ) : (
              <>
                {notifications.slice(0, showAll ? notifications.length : 50).map((n: any) => (
                  <Card key={n.id} className="!p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{n.type === "success" ? "✅" : n.type === "warning" ? "⚠️" : n.type === "alert" ? "🔴" : "ℹ️"}</span>
                      <span className="font-medium text-primary">{n.title}</span>
                      <span className="text-xs text-gray-400 ml-auto">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">To: {n.worker_id} {n.is_read ? "✓" : "○"}</p>
                  </Card>
                ))}
                {!showAll && notifications.length > 50 && (
                  <button onClick={() => setShowAll(true)} className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    {lang === "bn" ? `আরও ${notifications.length - 50}টি দেখুন` : `Show ${notifications.length - 50} more`}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

type TabId = "dashboard" | "contacts" | "campaigns" | "numbers" | "leads";

const TABS: { id: TabId; icon: string; en: string; bn: string }[] = [
  { id: "dashboard", icon: "📊", en: "Dashboard", bn: "ড্যাশবোর্ড" },
  { id: "contacts", icon: "👥", en: "Contacts", bn: "কন্ট্যাক্ট" },
  { id: "campaigns", icon: "📢", en: "Campaigns", bn: "ক্যাম্পেইন" },
  { id: "numbers", icon: "🔢", en: "Number Tools", bn: "নাম্বার টুলস" },
  { id: "leads", icon: "🎯", en: "Leads", bn: "লিডস" },
];

export default function WhatsAppHubPage() {
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  // Dashboard state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [warmups, setWarmups] = useState<any[]>([]);
  const [queueStats, setQueueStats] = useState({ queued: 0, sent: 0, failed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  // Contacts state
  const [contacts, setContacts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsFilter, setContactsFilter] = useState("");
  const [search, setSearch] = useState("");
  const [importText, setImportText] = useState("");
  const [contactMsg, setContactMsg] = useState("");

  // Campaigns state
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [campaignMsg, setCampaignMsg] = useState("");

  // Number Tools state
  const [numbers, setNumbers] = useState<any[]>([]);
  const [numbersLoading, setNumbersLoading] = useState(false);
  const [genCount, setGenCount] = useState(10);
  const [validatePhone, setValidatePhone] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [numbersMsg, setNumbersMsg] = useState("");

  // Leads state
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsStats, setLeadsStats] = useState<any>(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsFilter, setLeadsFilter] = useState("");
  const [leadsPage, setLeadsPage] = useState(0);
  const [editing, setEditing] = useState<{ phone: string; status: string; notes: string } | null>(null);
  const perPage = 20;

  // Load dashboard data
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [accRes, queueRes] = await Promise.all([
        fetch("/api/whatsapp/accounts"),
        fetch("/api/whatsapp/queue"),
      ]);
      const accData = await accRes.json() as { accounts?: any[]; warmups?: any[] };
      const queueData = await queueRes.json() as { queued?: number; sent?: number; failed?: number; pending?: number };
      if (accData.accounts) setAccounts(accData.accounts);
      if (accData.warmups) setWarmups(accData.warmups);
      const webAccount = (accData.accounts || []).find((a: any) => a.provider === "web");
      let pendingCount = 0;
      if (webAccount) {
        try {
          const pRes = await fetch(`/api/whatsapp/queue?account_id=${webAccount.account_id}`);
          const pData = await pRes.json() as { pending?: unknown[] };
          pendingCount = (pData.pending || []).length;
        } catch {}
      }
      setQueueStats({ queued: queueData.queued ?? 0, sent: queueData.sent ?? 0, failed: queueData.failed ?? 0, pending: pendingCount });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadDashboard(); }, []);

  const handleAction = async (action: string, accountId?: string, extra?: any) => {
    await fetch("/api/whatsapp/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, accountId, ...extra }) });
    loadDashboard();
  };

  const handleQueueAction = async (action: string) => {
    await fetch("/api/whatsapp/queue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    loadDashboard();
  };

  const webAccount = accounts.find((a: any) => a.provider === "web");

  // Contacts
  const loadContacts = async (status = "", q = "") => {
    setContactsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q) params.set("search", q);
      params.set("limit", "100");
      const res = await fetch(`/api/whatsapp/contacts?${params}`);
      const data = await res.json() as { contacts?: any[]; total?: number };
      if (data.contacts) setContacts(data.contacts);
      if (data.total !== undefined) setTotal(data.total);
    } catch (e) { console.error(e); }
    setContactsLoading(false);
  };

  useEffect(() => { if (activeTab === "contacts") loadContacts(); }, [activeTab]);

  const handleImport = async () => {
    const lines = importText.trim().split("\n").filter(Boolean);
    const list = lines.map((l) => {
      const parts = l.split(",");
      return { phone: parts[0].trim(), name: parts[1]?.trim() || undefined };
    });
    const res = await fetch("/api/whatsapp/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ import: list, source: "import" }) });
    const data = await res.json() as { imported?: number };
    setContactMsg(data.imported ? `${data.imported} contacts imported` : "Import failed");
    setImportText("");
    loadContacts();
  };

  const statuses = ["", "pending", "contacted", "replied", "converted", "blocked"];

  // Campaigns
  const loadCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const res = await fetch("/api/whatsapp/campaigns");
      const data = await res.json() as { campaigns?: any[] };
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch (e) { console.error(e); }
    setCampaignsLoading(false);
  };

  useEffect(() => { if (activeTab === "campaigns") loadCampaigns(); }, [activeTab]);

  const createCampaign = async () => {
    if (!name.trim() || !message.trim()) return;
    setCreating(true);
    setCampaignMsg("");
    try {
      const res = await fetch("/api/whatsapp/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, message }) });
      const data = await res.json() as { campaignId?: number };
      if (data.campaignId) {
        setCampaignMsg(lang === "bn" ? `ক্যাম্পেইন তৈরি হয়েছে (ID: ${data.campaignId})` : `Campaign created (ID: ${data.campaignId})`);
        setName(""); setMessage(""); loadCampaigns();
      }
    } catch { setCampaignMsg("Failed to create campaign"); }
    setCreating(false);
  };

  const startCampaign = async (campaignId: number) => {
    setCampaignMsg("");
    try {
      const res = await fetch("/api/whatsapp/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start", campaignId }) });
      const data = await res.json() as { targets?: number };
      setCampaignMsg(data.targets ? `Campaign started! ${data.targets} targets` : "Failed");
      loadCampaigns();
    } catch { setCampaignMsg("Error starting campaign"); }
  };

  // Number Tools
  const loadNumbers = async () => {
    setNumbersLoading(true);
    try {
      const res = await fetch("/api/whatsapp/numbers?limit=100");
      const data = await res.json() as any;
      if (data.numbers) setNumbers(data.numbers);
    } catch { console.error("Failed to load numbers"); }
    setNumbersLoading(false);
  };

  useEffect(() => { if (activeTab === "numbers") loadNumbers(); }, [activeTab]);

  const generate = async () => {
    setNumbersMsg("");
    try {
      const res = await fetch("/api/whatsapp/numbers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate", count: genCount }) });
      const data = await res.json() as any;
      setNumbersMsg(data.generated ? `Generated ${data.generated} numbers` : "Generation failed");
      loadNumbers();
    } catch { setNumbersMsg("Error generating numbers"); }
  };

  const validate = async () => {
    if (!validatePhone.trim()) return;
    setValidationResult(null); setNumbersMsg("");
    try {
      const res = await fetch("/api/whatsapp/numbers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "validate", phone: validatePhone }) });
      const data = await res.json() as any;
      setValidationResult(data);
    } catch { setValidationResult({ valid: false, message: "Error validating" }); }
  };

  // Leads
  const loadLeads = async () => {
    setLeadsLoading(true);
    try {
      const url = new URL("/api/leads", location.origin);
      if (leadsFilter) url.searchParams.set("status", leadsFilter);
      url.searchParams.set("limit", String(perPage));
      url.searchParams.set("offset", String(leadsPage * perPage));
      const res = await fetch(url.toString());
      const data: { leads?: any[] } = await res.json();
      if (data.leads) setLeads(data.leads); else setLeads([]);
    } catch { setLeads([]); }
    setLeadsLoading(false);
  };

  const loadLeadsStats = async () => {
    try {
      const res = await fetch("/api/leads?stats=true");
      const data: any = await res.json();
      if (data && typeof data.total === "number") setLeadsStats(data);
    } catch {}
  };

  useEffect(() => { if (activeTab === "leads") { loadLeads(); loadLeadsStats(); } }, [activeTab, leadsFilter, leadsPage]);

  const updateLead = async (phone: string, status: string, notes: string) => {
    await fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, status, notes }) });
    setEditing(null); loadLeads(); loadLeadsStats();
  };

  const LEAD_STATUSES = ["new", "contacted", "replied", "converted", "blocked"];

  return (
    <div className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">
          {lang === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lang === "bn" ? "হোয়াটসঅ্যাপ ম্যানেজমেন্ট — ড্যাশবোর্ড, কন্ট্যাক্ট, ক্যাম্পেইন, নাম্বার টুলস, লিডস" : "WhatsApp management — dashboard, contacts, campaigns, number tools, leads"}
        </p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto mb-6">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text"}`}>
            <span>{tab.icon}</span>
            <span>{lang === "bn" ? tab.bn : tab.en}</span>
          </button>
        ))}
      </div>

      {/* ════════════════════════ DASHBOARD TAB ════════════════════════ */}
      {activeTab === "dashboard" && (
        <div>
          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h2 className="font-bold text-base text-primary">{lang === "bn" ? "WhatsApp Web Connector" : "WhatsApp Web Connector"}</h2>
                  <p className="text-xs text-text-secondary mt-0.5">{lang === "bn" ? "কোনো API কী লাগবে না — শুধু QR স্ক্যান করে কানেক্ট করুন" : "No API key needed — just scan QR to connect"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {webAccount ? (
                  <>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${webAccount.has_session ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                      {webAccount.has_session ? (lang === "bn" ? "✅ সেশন আছে" : "✅ Session saved") : (lang === "bn" ? "⚪ কানেক্ট করা হয়নি" : "⚪ Not connected")}
                    </span>
                    <a href={`/company/whatsapp/connect?account=${webAccount.account_id}`} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90">{lang === "bn" ? "🔗 কানেক্ট" : "🔗 Connect"}</a>
                    <button onClick={() => handleAction("remove", webAccount.account_id)} className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100">{lang === "bn" ? "মুছুন" : "Remove"}</button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-text-secondary">{lang === "bn" ? "কোনো Web অ্যাকাউন্ট নেই" : "No web account"}</span>
                    <button onClick={() => handleAction("add", undefined, { provider: "web", accountId: "web_main" })} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90">+ {lang === "bn" ? "অ্যাকাউন্ট তৈরি" : "Create Account"}</button>
                  </>
                )}
              </div>
            </div>
            {webAccount && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="bg-gray-50 rounded-xl p-3"><div className="text-lg font-bold text-primary">{queueStats.pending}</div><div className="text-xs text-text-secondary">{lang === "bn" ? "অপেক্ষমান" : "Pending"}</div></div>
                <div className="bg-gray-50 rounded-xl p-3"><div className="text-lg font-bold text-green-600">{webAccount.total_sent || 0}</div><div className="text-xs text-text-secondary">{lang === "bn" ? "পাঠানো" : "Sent"}</div></div>
                <div className="bg-gray-50 rounded-xl p-3"><div className={`text-lg font-bold ${webAccount.has_session ? "text-green-600" : "text-gray-400"}`}>{webAccount.has_session ? "🟢" : "⚪"}</div><div className="text-xs text-text-secondary">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</div></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card p-5"><div className="text-sm text-text-secondary">{lang === "bn" ? "কিউতে" : "Queued"}</div><div className="text-2xl font-bold text-primary mt-1">{queueStats.queued}</div></div>
            <div className="card p-5"><div className="text-sm text-text-secondary">{lang === "bn" ? "পাঠানো" : "Sent"}</div><div className="text-2xl font-bold text-action mt-1">{queueStats.sent}</div></div>
            <div className="card p-5"><div className="text-sm text-text-secondary">{lang === "bn" ? "ব্যর্থ" : "Failed"}</div><div className="text-2xl font-bold text-red-600 mt-1">{queueStats.failed}</div></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <h2 className="font-bold text-lg text-primary mb-4">{lang === "bn" ? "অ্যাকাউন্টসমূহ" : "Accounts"}</h2>
              {accounts.length === 0 ? (
                <div className="text-sm text-text-secondary py-8 text-center">{lang === "bn" ? "কোনো অ্যাকাউন্ট নেই" : "No accounts configured"}</div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((acc: any) => {
                    const warmup = warmups.find((w: any) => w.account_id === acc.account_id);
                    return (
                      <div key={acc.id} className="p-4 rounded-xl border border-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-primary">{acc.account_id}</span>
                              {acc.provider === "web" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">Web</span>}
                            </div>
                            <div className="text-xs text-text-secondary">{acc.phone || "No phone"} · {acc.provider}</div>
                            <div className="text-xs text-text-secondary mt-1">{warmup ? `${lang === "bn" ? "দিন" : "Day"} ${warmup.day_count} · ${lang === "bn" ? "লিমিট" : "Limit"}: ${acc.daily_sent}/${acc.daily_limit}` : ""}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${acc.status === 'connected' ? 'bg-action' : acc.status === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                            <span className="text-xs text-text-secondary">{acc.status}</span>
                            {acc.provider !== "web" && (
                              <button onClick={() => handleAction(acc.status === 'connected' ? 'disconnect' : 'connect', acc.account_id)} className="text-xs text-primary underline">{acc.status === 'connected' ? (lang === "bn" ? "বন্ধ" : "Disconnect") : (lang === "bn" ? "চালু" : "Connect")}</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-primary">{lang === "bn" ? "মেসেজ কিউ" : "Message Queue"}</h2>
                <div className="flex gap-2">
                  <button onClick={() => handleQueueAction("flush")} className="px-3 py-1.5 text-xs font-medium bg-action/10 text-action rounded-xl hover:bg-action/20">{lang === "bn" ? "পাঠাও" : "Flush"}</button>
                  <button onClick={() => handleQueueAction("retry_failed")} className="px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100">{lang === "bn" ? "পুনরায়" : "Retry"}</button>
                  <button onClick={() => handleQueueAction("clear_failed")} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-xl hover:bg-red-100">{lang === "bn" ? "মুছুন" : "Clear"}</button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50"><span className="text-sm text-primary">{lang === "bn" ? "কিউতে অপেক্ষমান" : "Waiting in queue"}</span><span className="font-bold text-lg text-primary">{queueStats.queued}</span></div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50"><span className="text-sm text-primary">{lang === "bn" ? "পাঠানো হয়েছে" : "Successfully sent"}</span><span className="font-bold text-lg text-action">{queueStats.sent}</span></div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50"><span className="text-sm text-primary">{lang === "bn" ? "ব্যর্থ হয়েছে" : "Failed"}</span><span className="font-bold text-lg text-red-600">{queueStats.failed}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ CONTACTS TAB ════════════════════════ */}
      {activeTab === "contacts" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2">
            <h2 className="font-bold text-base text-primary mb-4">{lang === "bn" ? "কন্ট্যাক্ট" : "Contacts"} ({total})</h2>
            {contactMsg && <div className="mb-3 p-3 rounded-xl bg-action/10 text-sm text-action font-medium">{contactMsg}</div>}
            <div className="flex gap-2 mb-4 flex-wrap">
              {statuses.map((s) => (
                <button key={s} onClick={() => { setContactsFilter(s); loadContacts(s, search); }} className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors ${contactsFilter === s ? "gradient-premium text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"}`}>{s || (lang === "bn" ? "সব" : "All")}</button>
              ))}
              <input type="text" placeholder={lang === "bn" ? "খুঁজুন..." : "Search..."} value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadContacts(contactsFilter, search)} className="ml-auto px-3 py-1.5 text-xs rounded-xl border border-border bg-white text-primary" />
            </div>
            {contactsLoading ? (
              <Skeleton className="h-4 w-32 mx-auto" />
            ) : contacts.length === 0 ? (
              <div className="text-center text-sm text-text-secondary py-12">{lang === "bn" ? "কোনো কন্ট্যাক্ট নেই" : "No contacts yet"}</div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {contacts.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                    <div><div className="text-sm font-medium text-primary">{c.phone}</div><div className="text-xs text-text-secondary">{c.name || "—"}</div></div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${c.status === "replied" ? "bg-green-50 text-green-700" : c.status === "contacted" ? "bg-blue-50 text-blue-700" : c.status === "converted" ? "bg-purple-50 text-purple-700" : c.status === "blocked" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"}`}>{c.status}</span>
                      <span className="text-xs text-text-secondary">Score: {c.priority_score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-sm text-primary mb-3">{lang === "bn" ? "ইম্পোর্ট কন্ট্যাক্ট" : "Import Contacts"}</h3>
            <p className="text-xs text-text-secondary mb-3">{lang === "bn" ? "প্রতি লাইনে একটি ফোন নাম্বার দিন। নাম যোগ করতে কমা ব্যবহার করুন:" : "One phone per line. Use comma for name:"}<br /><code className="text-primary">01712345678, Rajib</code></p>
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={6} className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-white text-primary resize-none" placeholder="01712345678&#10;01898765432, Sajib" />
            <button onClick={handleImport} disabled={!importText.trim()} className="mt-3 w-full px-4 py-2 gradient-premium text-white text-sm font-medium rounded-xl disabled:opacity-50">{lang === "bn" ? "ইম্পোর্ট" : "Import"}</button>
          </div>
        </div>
      )}

      {/* ════════════════════════ CAMPAIGNS TAB ════════════════════════ */}
      {activeTab === "campaigns" && (
        <div>
          {campaignMsg && <div className="mb-4 p-3 rounded-xl bg-action/10 text-sm text-action font-medium">{campaignMsg}</div>}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 lg:col-span-2">
              <h2 className="font-bold text-base text-primary mb-4">{lang === "bn" ? "ক্যাম্পেইনসমূহ" : "Campaigns"}</h2>
              {campaignsLoading ? (
                <Skeleton className="h-4 w-32 mx-auto" />
              ) : campaigns.length === 0 ? (
                <div className="text-center text-sm text-text-secondary py-12">{lang === "bn" ? "কোনো ক্যাম্পেইন নেই" : "No campaigns yet"}</div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((c: any) => (
                    <div key={c.id} className="p-4 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm text-primary">{c.name}</div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${c.status === "running" ? "bg-green-50 text-green-700" : c.status === "completed" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"}`}>{c.status}</span>
                      </div>
                      <div className="text-xs text-text-secondary mb-2 line-clamp-2">{c.message}</div>
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{lang === "bn" ? "টার্গেট" : "Targets"}: {c.total_targets} | {lang === "bn" ? "পাঠানো" : "Sent"}: {c.sent_count} | {lang === "bn" ? "রিপ্লাই" : "Replies"}: {c.replied_count}</span>
                        {c.status === "draft" && <button onClick={() => startCampaign(c.id)} className="px-3 py-1 text-xs font-medium bg-action/10 text-action rounded-xl hover:bg-action/20">{lang === "bn" ? "স্টার্ট" : "Start"}</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-sm text-primary mb-3">{lang === "bn" ? "নতুন ক্যাম্পেইন" : "New Campaign"}</h3>
              <input type="text" placeholder={lang === "bn" ? "ক্যাম্পেইনের নাম" : "Campaign name"} value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-white text-primary mb-3" />
              <textarea placeholder={lang === "bn" ? "মেসেজ লিখুন... {name} ব্যবহার করুন পার্সোনালাইজেশনের জন্য" : "Write message... Use {name} for personalization"} value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-white text-primary resize-none mb-3" />
              <button onClick={createCampaign} disabled={creating || !name || !message} className="w-full px-4 py-2 gradient-premium text-white text-sm font-medium rounded-xl disabled:opacity-50">{creating ? "..." : (lang === "bn" ? "ক্যাম্পেইন তৈরি" : "Create Campaign")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ NUMBER TOOLS TAB ════════════════════════ */}
      {activeTab === "numbers" && (
        <div>
          {numbersMsg && <div className="mb-4 p-3 rounded-xl bg-action/10 text-sm text-action font-medium">{numbersMsg}</div>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <h2 className="font-bold text-base text-primary mb-4">{lang === "bn" ? "নাম্বার জেনারেটর" : "Number Generator"}</h2>
              <p className="text-xs text-text-secondary mb-3">{lang === "bn" ? "বাংলাদেশী প্রিফিক্স (013-019) সহ র্যান্ডম ১১ ডিজিটের নাম্বার জেনারেট করে" : "Generates random 11-digit BD numbers with prefixes 013-019"}</p>
              <div className="flex gap-3">
                <input type="number" min={1} max={100} value={genCount} onChange={(e) => setGenCount(parseInt(e.target.value) || 10)} className="w-24 px-3 py-2 text-sm rounded-xl border border-border bg-white text-primary" />
                <button onClick={generate} className="px-6 py-2 gradient-premium text-white text-sm font-medium rounded-xl">{lang === "bn" ? "জেনারেট" : "Generate"}</button>
              </div>
            </div>
            <div className="card p-6">
              <h2 className="font-bold text-base text-primary mb-4">{lang === "bn" ? "নাম্বার ভ্যালিডেটর" : "Number Validator"}</h2>
              <p className="text-xs text-text-secondary mb-3">{lang === "bn" ? "বাংলাদেশী মোবাইল নাম্বার ভ্যালিডেট করুন (যেমন: 01712345678)" : "Validate a BD mobile number (e.g., 01712345678)"}</p>
              <div className="flex gap-3">
                <input type="text" placeholder="01712345678" value={validatePhone} onChange={(e) => setValidatePhone(e.target.value)} className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-white text-primary" />
                <button onClick={validate} className="px-6 py-2 gradient-premium text-white text-sm font-medium rounded-xl">{lang === "bn" ? "ভ্যালিডেট" : "Validate"}</button>
              </div>
              {validationResult && <div className={`mt-3 p-3 rounded-xl text-sm ${validationResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{validationResult.valid ? `✅ Valid · ${validationResult.operator}` : `❌ ${validationResult.message}`}</div>}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-bold text-base text-primary mb-4">{lang === "bn" ? "স্ক্যান করা নাম্বারসমূহ" : "Scanned Numbers"} ({numbers.length})</h2>
            {numbersLoading ? (
              <Skeleton className="h-4 w-32 mx-auto" />
            ) : numbers.length === 0 ? (
              <div className="text-center text-sm text-text-secondary py-8">{lang === "bn" ? "এখনো কোনো নাম্বার জেনারেট করা হয়নি" : "No numbers generated yet"}</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[400px] overflow-y-auto">
                {numbers.map((n: any) => <div key={n.id || n.phone} className="px-3 py-2 rounded-lg bg-gray-50 text-xs text-primary font-mono text-center">{n.phone}</div>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════ LEADS TAB ════════════════════════ */}
      {activeTab === "leads" && (
        <div>
          {leadsStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
              {[
                { label: "Total", value: leadsStats.total, color: "text-primary" },
                { label: "New", value: leadsStats.new, color: "text-blue-600" },
                { label: "Contacted", value: leadsStats.contacted, color: "text-amber-600" },
                { label: "Replied", value: leadsStats.replied, color: "text-purple-600" },
                { label: "Converted", value: leadsStats.converted, color: "text-green-600" },
                { label: "Blocked", value: leadsStats.blocked, color: "text-red-600" },
                { label: "High Priority", value: leadsStats.highPriority, color: "text-orange-600" },
              ].map((s) => (
                <div key={s.label} className="card p-3 text-center">
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-text-secondary">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => { setLeadsFilter(""); setLeadsPage(0); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!leadsFilter ? "bg-primary text-white" : "bg-white text-text-secondary hover:bg-primary/10"}`}>{lang === "bn" ? "সব" : "All"}</button>
            {LEAD_STATUSES.map((s) => (
              <button key={s} onClick={() => { setLeadsFilter(s); setLeadsPage(0); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${leadsFilter === s ? "bg-primary text-white" : "bg-white text-text-secondary hover:bg-primary/10"}`}>{s}</button>
            ))}
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-secondary text-xs uppercase tracking-wider">
                  <th className="p-3 font-medium">{lang === "bn" ? "ফোন" : "Phone"}</th>
                  <th className="p-3 font-medium">{lang === "bn" ? "নাম" : "Name"}</th>
                  <th className="p-3 font-medium">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                  <th className="p-3 font-medium">{lang === "bn" ? "প্রায়োরিটি" : "Priority"}</th>
                  <th className="p-3 font-medium">{lang === "bn" ? "সোর্স" : "Source"}</th>
                  <th className="p-3 font-medium">{lang === "bn" ? "চ্যাট" : "Chats"}</th>
                  <th className="p-3 font-medium">{lang === "bn" ? "সেক্টর" : "Sector"}</th>
                  <th className="p-3 font-medium">{lang === "bn" ? "পেইন পয়েন্ট" : "Pain Points"}</th>
                  <th className="p-3 font-medium">{lang === "bn" ? "লাস্ট চ্যাট" : "Last Chat"}</th>
                  <th className="p-3 font-medium">{lang === "bn" ? "অ্যাকশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && !leadsLoading && <tr><td colSpan={10} className="p-6 text-center text-text-secondary">{lang === "bn" ? "কোনো লিড নেই" : "No leads found"}</td></tr>}
                {leadsLoading && <tr><td colSpan={10} className="p-6 text-center"><Skeleton className="h-4 w-32 mx-auto" /></td></tr>}
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="border-b border-border/50 hover:bg-primary/5">
                    <td className="p-3 font-mono text-xs">{lead.phone}</td>
                    <td className="p-3 font-medium">{lead.name || "—"}</td>
                    <td className="p-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${lead.status === "new" ? "bg-blue-100 text-blue-700" : lead.status === "contacted" ? "bg-amber-100 text-amber-700" : lead.status === "replied" ? "bg-purple-100 text-purple-700" : lead.status === "converted" ? "bg-green-100 text-green-700" : lead.status === "blocked" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{lead.status}</span></td>
                    <td className="p-3"><span className={`font-bold ${lead.priorityScore >= 5 ? "text-red-600" : lead.priorityScore >= 3 ? "text-amber-600" : "text-text-secondary"}`}>{lead.priorityScore}</span></td>
                    <td className="p-3 text-xs">{lead.source || "—"}</td>
                    <td className="p-3">{lead.totalChats}</td>
                    <td className="p-3 text-xs">{lead.sector || "—"}</td>
                    <td className="p-3 text-xs max-w-[150px] truncate">{lead.painPoints || "—"}</td>
                    <td className="p-3 text-xs text-text-secondary">{lead.lastChatAt ? new Date(lead.lastChatAt).toLocaleDateString() : "—"}</td>
                    <td className="p-3"><button onClick={() => setEditing({ phone: lead.phone, status: lead.status, notes: lead.notes || "" })} className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20">{lang === "bn" ? "এডিট" : "Edit"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button disabled={leadsPage === 0} onClick={() => setLeadsPage(p => p - 1)} className="px-3 py-1.5 text-xs font-medium bg-white border border-border rounded-lg disabled:opacity-30 hover:bg-primary/5">← {lang === "bn" ? "পূর্ববর্তী" : "Previous"}</button>
            <span className="text-xs text-text-secondary">{lang === "bn" ? "পাতা" : "Page"} {leadsPage + 1}</span>
            <button disabled={leads.length < perPage} onClick={() => setLeadsPage(p => p + 1)} className="px-3 py-1.5 text-xs font-medium bg-white border border-border rounded-lg disabled:opacity-30 hover:bg-primary/5">{lang === "bn" ? "পরবর্তী" : "Next"} →</button>
          </div>

          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setEditing(null)}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-primary mb-4">{lang === "bn" ? "লিড আপডেট" : "Update Lead"}</h3>
                <p className="text-xs text-text-secondary mb-4 font-mono">{editing.phone}</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</label>
                    <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white">{LEAD_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}</select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1">{lang === "bn" ? "নোটস" : "Notes"}</label>
                    <textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white resize-none" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setEditing(null)} className="flex-1 px-4 py-2 text-sm font-medium bg-gray-100 text-text-secondary rounded-xl hover:bg-gray-200">{lang === "bn" ? "বাতিল" : "Cancel"}</button>
                    <button onClick={() => updateLead(editing.phone, editing.status, editing.notes)} className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90">{lang === "bn" ? "সেভ" : "Save"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

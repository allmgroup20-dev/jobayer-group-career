"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card, StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchWithCache } from "@/lib/use-swr-fetch";

interface Withdrawal {
  id: number;
  withdrawal_id: string;
  worker_id: string;
  workerName?: string;
  amount: number;
  currency: string;
  payment_method: string;
  account_number: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

interface Channel {
  id: string;
  label: string;
  labelBn: string;
  enabled: boolean;
  status?: "active" | "paused";
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: "bkash", label: "bKash", labelBn: "বিকাশ", enabled: true, status: "active" },
  { id: "nagad", label: "Nagad", labelBn: "নগদ", enabled: true, status: "active" },
  { id: "rocket", label: "Rocket", labelBn: "রকেট", enabled: true, status: "active" },
  { id: "bank", label: "Bank", labelBn: "ব্যাংক", enabled: false, status: "active" },
];

const WEEKDAYS = [
  { id: 0, en: "Sunday", bn: "রবিবার" },
  { id: 1, en: "Monday", bn: "সোমবার" },
  { id: 2, en: "Tuesday", bn: "মঙ্গলবার" },
  { id: 3, en: "Wednesday", bn: "বুধবার" },
  { id: 4, en: "Thursday", bn: "বৃহস্পতিবার" },
  { id: 5, en: "Friday", bn: "শুক্রবার" },
  { id: 6, en: "Saturday", bn: "শনিবার" },
];

export default function CompanyWithdrawalsPage() {
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<"requests" | "stats" | "settings">("requests");

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "উইথড্রয়াল ম্যানেজমেন্ট" : "Withdrawal Management"}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "সকল উত্তোলনের তথ্য, পরিসংখ্যান ও সেটিংস এক জায়গায়" : "All withdrawal info, stats & settings in one place"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {([
            { id: "requests" as const, en: "Requests", bn: "রিকোয়েস্ট" },
            { id: "stats" as const, en: "Statistics", bn: "পরিসংখ্যান" },
            { id: "settings" as const, en: "Settings", bn: "সেটিংস" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-action text-white shadow-lg shadow-action/25"
                  : "text-text-secondary hover:bg-primary/5 hover:text-primary"
              }`}
            >
              {lang === "bn" ? tab.bn : tab.en}
            </button>
          ))}
        </div>

        {activeTab === "requests" && <WithdrawalRequestsTab lang={lang} />}
        {activeTab === "stats" && <WithdrawalStatsTab lang={lang} />}
        {activeTab === "settings" && <WithdrawalSettingsTab lang={lang} />}
      </div>
    </div>
  );
}

function WithdrawalRequestsTab({ lang }: { lang: string }) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [workerNames, setWorkerNames] = useState<Record<string, string>>({});
  const [showAll, setShowAll] = useState(false);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await fetch("/api/withdrawals");
      const data = await res.json() as { withdrawals?: Withdrawal[] };
      const list: Withdrawal[] = data.withdrawals || [];
      setWithdrawals(list);

      // worker names now come via JOIN from the API
      const nameMap: Record<string, string> = {};
      for (const w of list) {
        if (w.workerName) nameMap[w.worker_id] = w.workerName;
      }
      setWorkerNames(nameMap);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  const updateStatus = async (withdrawalId: string, status: string) => {
    setUpdating(withdrawalId);
    try {
      await fetch("/api/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, status }),
      });
      fetchWithdrawals();
    } catch {}
    setUpdating(null);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      pending: lang === "bn" ? "পেন্ডিং" : "Pending",
      processing: lang === "bn" ? "প্রসেসিং" : "Processing",
      completed: lang === "bn" ? "সম্পন্ন" : "Completed",
      rejected: lang === "bn" ? "বাতিল" : "Rejected",
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) return (
    <div className="text-center py-12">
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {lang === "bn" ? `মোট ${withdrawals.length} টি রিকোয়েস্ট` : `Total ${withdrawals.length} requests`}
        </p>
        <button
          onClick={fetchWithdrawals}
          className="text-xs text-action hover:text-action-light font-medium"
        >
          ↻ {lang === "bn" ? "রিফ্রেশ" : "Refresh"}
        </button>
      </div>

      {withdrawals.length === 0 ? (
        <Card>
          <p className="text-center text-text-secondary py-8 text-sm">
            {lang === "bn" ? "কোনো উইথড্রয়াল রিকোয়েস্ট নেই" : "No withdrawal requests yet"}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">{lang === "bn" ? "আইডি" : "ID"}</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">{lang === "bn" ? "সদস্য" : "Member"}</th>
                <th className="text-right px-4 py-3 font-semibold text-text-secondary">{lang === "bn" ? "পরিমাণ" : "Amount"}</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">{lang === "bn" ? "মাধ্যম" : "Method"}</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">{lang === "bn" ? "হিসাব" : "Account"}</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">{lang === "bn" ? "তারিখ" : "Date"}</th>
                <th className="text-center px-4 py-3 font-semibold text-text-secondary">{lang === "bn" ? "অ্যাকশন" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.slice(0, showAll ? withdrawals.length : 50).map((w) => (
                <tr key={w.id} className="border-b border-border last:border-b-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{w.withdrawal_id}</td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-primary font-medium">{workerNames[w.worker_id] || w.worker_id}</span>
                      <span className="block text-[10px] text-text-secondary font-mono">{w.worker_id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">{w.amount.toLocaleString()} ৳</td>
                  <td className="px-4 py-3 capitalize text-text-secondary">{w.payment_method}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{w.account_number || "-"}</td>
                  <td className="px-4 py-3">{getStatusBadge(w.status)}</td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {new Date(w.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {w.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            loading={updating === w.withdrawal_id}
                            onClick={() => updateStatus(w.withdrawal_id, "completed")}
                          >
                            {lang === "bn" ? "অনুমোদন" : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={updating === w.withdrawal_id}
                            onClick={() => updateStatus(w.withdrawal_id, "rejected")}
                          >
                            {lang === "bn" ? "বাতিল" : "Reject"}
                          </Button>
                        </>
                      )}
                      {w.status === "processing" && (
                        <Button
                          size="sm"
                          variant="primary"
                          loading={updating === w.withdrawal_id}
                          onClick={() => updateStatus(w.withdrawal_id, "completed")}
                        >
                          {lang === "bn" ? "সম্পন্ন" : "Complete"}
                        </Button>
                      )}
                      {(w.status === "completed" || w.status === "rejected") && (
                        <span className="text-xs text-text-secondary px-2">
                          {w.processed_at
                            ? new Date(w.processed_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
                                day: "numeric", month: "short",
                              })
                            : "-"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!showAll && withdrawals.length > 50 && (
            <button onClick={() => setShowAll(true)} className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
              {lang === "bn" ? `আরও ${withdrawals.length - 50}টি দেখুন` : `Show ${withdrawals.length - 50} more`}
            </button>
          )}
        </div>
      )}

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: lang === "bn" ? "পেন্ডিং" : "Pending", value: withdrawals.filter((w) => w.status === "pending").length, color: "text-yellow-600" },
          { label: lang === "bn" ? "প্রসেসিং" : "Processing", value: withdrawals.filter((w) => w.status === "processing").length, color: "text-blue-600" },
          { label: lang === "bn" ? "সম্পন্ন" : "Completed", value: withdrawals.filter((w) => w.status === "completed").length, color: "text-green-600" },
          { label: lang === "bn" ? "বাতিল" : "Rejected", value: withdrawals.filter((w) => w.status === "rejected").length, color: "text-red-600" },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-xl bg-gray-50 text-center border border-border">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-secondary mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WithdrawalStatsTab({ lang }: { lang: string }) {
  const [data, setData] = useState<{
    totalWithdrawn: number;
    pendingAmount: number;
    totalRequests: number;
    thisMonth: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [finance, wd] = await Promise.all([
        fetchWithCache<any>("/api/company/finance", 300000),
        fetchWithCache<any>("/api/withdrawals", 300000),
      ]);
      const list: Withdrawal[] = wd.withdrawals || [];
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      setData({
        totalWithdrawn: finance.withdrawals?.total || 0,
        pendingAmount: finance.withdrawals?.pending || 0,
        totalRequests: list.length,
        thisMonth: list.filter((w) => w.created_at >= monthStart).reduce((s, w) => s + w.amount, 0),
      });
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center py-12">
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  );

  const format = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={lang === "bn" ? "মোট উত্তোলন" : "Total Withdrawn"}
          value={`${format(data?.totalWithdrawn || 0)} ৳`}
          color="text-teal-600"
        />
        <StatCard
          label={lang === "bn" ? "পেন্ডিং উত্তোলন" : "Pending Withdrawal"}
          value={`${format(data?.pendingAmount || 0)} ৳`}
          color="text-rose-600"
        />
        <StatCard
          label={lang === "bn" ? "মোট রিকোয়েস্ট" : "Total Requests"}
          value={format(data?.totalRequests || 0)}
          color="text-blue-600"
        />
        <StatCard
          label={lang === "bn" ? "এই মাসে" : "This Month"}
          value={`${format(data?.thisMonth || 0)} ৳`}
          color="text-purple-600"
        />
      </div>
    </div>
  );
}

function WithdrawalSettingsTab({ lang }: { lang: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [minWithdrawal, setMinWithdrawal] = useState("500");
  const [registrationBonus, setRegistrationBonus] = useState("0");
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);

  // Payment schedule state
  const [intervalDays, setIntervalDays] = useState(7);
  const [dayOfWeek, setDayOfWeek] = useState(5);
  const [systemActive, setSystemActive] = useState(true);
  const [nextPaymentDate, setNextPaymentDate] = useState("");

  useEffect(() => {
    const load = async () => {
      const [data, schedule] = await Promise.all([
        fetchWithCache<{ settings?: Record<string, string> }>("/api/company/settings", 300000),
        fetchWithCache<any>("/api/company/payment-schedule", 300000).catch(() => ({})),
      ]);
      if (data?.settings) {
        const s = data.settings;
        setMinWithdrawal(s.min_withdrawal || "500");
        setRegistrationBonus(s.registration_bonus || "0");
        try {
          const bc = (s as any).banking_channels ? JSON.parse((s as any).banking_channels) : null;
          if (bc && Array.isArray(bc)) setChannels(bc);
        } catch {}
      }
      if (schedule && typeof schedule.intervalDays === "number") {
        setIntervalDays(schedule.intervalDays as number);
        setDayOfWeek(schedule.dayOfWeek as number);
        setSystemActive(schedule.systemActive as boolean);
        setNextPaymentDate((schedule.nextPaymentDate as string) || "");
      }
    };
    load().catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch))
    );
  };

  const toggleChannelStatus = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === id
          ? { ...ch, status: ch.status === "paused" ? "active" : "paused" as "active" | "paused" }
          : ch
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const settings = [
      { key: "min_withdrawal", value: minWithdrawal },
      { key: "registration_bonus", value: registrationBonus },
      { key: "banking_channels", value: JSON.stringify(channels) },
    ];
    try {
      await Promise.all([
        fetch("/api/company/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings }),
        }),
        fetch("/api/company/payment-schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intervalDays, dayOfWeek, systemActive }),
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetch("/api/company/payment-schedule").then((r) => r.json()).then((d: any) => {
        if (d.nextPaymentDate) setNextPaymentDate(d.nextPaymentDate);
      }).catch(() => {});
    } catch {
      alert(lang === "bn" ? "সেভ ব্যর্থ" : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Skeleton className="w-8 h-8 rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">

      {/* Finance Settings */}
      <Card>
        <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "ফাইন্যান্স" : "Finance"}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ন্যূনতম উইথড্র" : "Min Withdrawal"} (৳)</label>
            <input type="number" value={minWithdrawal} onChange={(e) => setMinWithdrawal(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "রেজিস্ট্রেশন বোনাস" : "Registration Bonus"} (৳)</label>
            <input type="number" value={registrationBonus} onChange={(e) => setRegistrationBonus(e.target.value)} className="input-field" />
          </div>
        </div>
      </Card>

      {/* Payment Schedule */}
      <Card>
        <h3 className="font-bold text-primary mb-4">
          {lang === "bn" ? "পেমেন্ট শিডিউল" : "Payment Schedule"}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-primary">
              {lang === "bn" ? "পেমেন্ট সিস্টেম" : "Payment System"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSystemActive(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  systemActive ? "bg-action text-white" : "bg-gray-200 text-text-secondary"
                }`}
              >
                {lang === "bn" ? "সক্রিয়" : "Active"}
              </button>
              <button
                type="button"
                onClick={() => setSystemActive(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  !systemActive ? "bg-red-500 text-white" : "bg-gray-200 text-text-secondary"
                }`}
              >
                {lang === "bn" ? "নিষ্ক্রিয়" : "Disabled"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {lang === "bn" ? "পেমেন্ট Interval (দিন)" : "Payment Interval (Days)"}
            </label>
            <select
              value={intervalDays}
              onChange={(e) => setIntervalDays(parseInt(e.target.value))}
              className="input-field"
            >
              {[1, 3, 7, 14, 15, 30].map((d) => (
                <option key={d} value={d}>{d} {lang === "bn" ? "দিন" : "days"}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {lang === "bn" ? "পেমেন্টের দিন" : "Payment Day of Week"}
            </label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((wd) => (
                <button
                  key={wd.id}
                  type="button"
                  onClick={() => setDayOfWeek(wd.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    dayOfWeek === wd.id
                      ? "border-action bg-action/10 text-action"
                      : "border-border text-text-secondary hover:border-action/50"
                  }`}
                >
                  {lang === "bn" ? wd.bn : wd.en}
                </button>
              ))}
            </div>
          </div>

          {nextPaymentDate && (
            <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
              {lang === "bn"
                ? `পরবর্তী পেমেন্ট: ${new Date(nextPaymentDate).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}`
                : `Next Payment: ${new Date(nextPaymentDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`}
            </div>
          )}
        </div>
      </Card>

      {/* Banking Channels */}
      <Card>
        <h3 className="font-bold text-primary mb-4">
          {lang === "bn" ? "ব্যাংকিং চ্যানেল" : "Banking Channels"}
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          {lang === "bn"
            ? "সক্রিয় চ্যানেল ইউজার ড্যাশবোর্ডে দেখাবে, সাময়িক বন্ধ চ্যানেল গ্রে আউট থাকবে"
            : "Active channels appear in dashboard, paused channels are grayed out"}
        </p>
        <div className="space-y-3">
          {channels.map((ch) => (
            <div key={ch.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleChannel(ch.id)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    ch.enabled ? "bg-action" : "bg-gray-300"
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all shadow-sm ${
                    ch.enabled ? "left-6" : "left-0.5"
                  }`} />
                </button>
                <span className="text-sm font-medium text-primary">
                  {lang === "bn" ? ch.labelBn : ch.label}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => toggleChannelStatus(ch.id)}
                  disabled={!ch.enabled}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    !ch.enabled
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : ch.status === "paused"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {ch.status === "paused"
                    ? (lang === "bn" ? "সাময়িক বন্ধ" : "Paused")
                    : (lang === "bn" ? "চালু" : "Active")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full !py-4">
        {saving ? (lang === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving...") : saved ? (lang === "bn" ? "✓ সংরক্ষিত হয়েছে" : "✓ Saved") : (lang === "bn" ? "সব সেভ করুন" : "Save All Settings")}
      </Button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Card, StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Channel { id: string; label: string; labelBn: string; enabled?: boolean; status?: "active" | "paused" }
const DEFAULT_CHANNELS: Channel[] = [
  { id: "bkash", label: "bKash", labelBn: "বিকাশ" },
  { id: "nagad", label: "Nagad", labelBn: "নগদ" },
  { id: "rocket", label: "Rocket", labelBn: "রকেট" },
  { id: "bank", label: "Bank", labelBn: "ব্যাংক" },
];

export default function WorkerDashboard() {
  const { lang } = useLanguageStore();
  const [worker, setWorker] = useState<{
    workerId: string; name: string; phone: string; balance: number;
    totalEarned: number; totalTeamMembers: number; level: number;
    levelName?: string; joinDate: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [minWithdraw, setMinWithdraw] = useState(500);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawChannel, setWithdrawChannel] = useState("bkash");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [paySysActive, setPaySysActive] = useState(true);
  const [nextPayDate, setNextPayDate] = useState("");
  const [payInterval, setPayInterval] = useState(7);

  useEffect(() => {
    const workerId = localStorage.getItem("worker_id");
    if (!workerId) { setLoading(false); return; }

    Promise.all([
      fetch(`/api/workers/profile?workerId=${workerId}`).then(r => r.json() as Promise<Record<string, unknown>>),
      fetch("/api/company/settings").then(r => r.json() as Promise<Record<string, unknown>>).catch(() => ({} as Record<string, unknown>)),
      fetch("/api/company/payment-schedule").then(r => r.json()).catch(() => ({})),
    ]).then(([profile, settings, schedule]: [any, any, any]) => {
      if (profile?.workerId) setWorker(profile as any);
      const s = settings && typeof settings.settings === "object" ? (settings.settings as Record<string, string>) : {};
      const mw = parseInt(s.min_withdrawal || "500");
      setMinWithdraw(isNaN(mw) ? 500 : mw);
      try {
        const bcStr = s.banking_channels;
        if (bcStr) {
          const saved = JSON.parse(bcStr);
          if (Array.isArray(saved)) setChannels(saved);
        }
      } catch {}
      if (schedule && typeof schedule.systemActive === "boolean") {
        setPaySysActive(schedule.systemActive as boolean);
        setNextPayDate((schedule.nextPaymentDate as string) || "");
        setPayInterval(schedule.intervalDays as number || 7);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const doWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return alert(lang === "bn" ? "সঠিক পরিমাণ দিন" : "Enter valid amount");
    if (amount < minWithdraw) return alert(lang === "bn" ? `ন্যূনতম উইথড্র: ৳${minWithdraw}` : `Min withdrawal: ৳${minWithdraw}`);
    if (amount > (worker?.balance || 0)) return alert(lang === "bn" ? "পর্যাপ্ত ব্যালেন্স নেই" : "Insufficient balance");
    if (!withdrawAccount) return alert(lang === "bn" ? "অ্যাকাউন্ট নাম্বার দিন" : "Enter account number");
    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId: worker!.workerId, amount, paymentMethod: withdrawChannel, accountNumber: withdrawAccount }),
    });
    const data = await res.json() as { error?: string };
    if (res.ok) {
      alert(lang === "bn" ? "উইথড্রয়াল অনুরোধ জমা দেওয়া হয়েছে" : "Withdrawal request submitted");
      setWithdrawAmount("");
      setWithdrawAccount("");
    } else {
      alert(data.error || "Failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 px-4 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-action border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <h2 className="text-xl font-bold text-primary mb-4">
              {lang === "bn" ? "লগইন প্রয়োজন" : "Login Required"}
            </h2>
            <Link href="/login"><Button className="w-full">{lang === "bn" ? "লগইন করুন" : "Login"}</Button></Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {lang === "bn" ? "স্বাগতম" : "Welcome"}, {worker.name}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {lang === "bn" ? "সদস্য আইডি" : "Member ID"}: {worker.workerId}
            </p>
          </div>
          <Link href="/company/login" className="text-sm text-text-secondary hover:text-primary underline">
            {lang === "bn" ? "কোম্পানি লগইন" : "Company Login"} →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label={lang === "bn" ? "ব্যালেন্স" : "Balance"} value={formatCurrency(worker.balance)} color="text-action" />
          <StatCard label={lang === "bn" ? "মোট আয়" : "Total Earnings"} value={formatCurrency(worker.totalEarned)} color="text-secondary-dark" />
          <StatCard label={lang === "bn" ? "টিম মেম্বার" : "Team Members"} value={worker.totalTeamMembers.toString()} color="text-primary" />
          <StatCard label={lang === "bn" ? "পদবী" : "Position"} value={worker.levelName || `Level ${worker.level}`} color="text-accent" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/dashboard/tree" className="card hover:shadow-lg hover:-translate-y-1 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-primary text-sm">{lang === "bn" ? "আমার টিম" : "My Team"}</p>
              <p className="text-xs text-text-secondary">{worker.totalTeamMembers} {lang === "bn" ? "মেম্বার" : "Members"}</p>
            </div>
          </Link>

          <Link href="/dashboard/commissions" className="card hover:shadow-lg hover:-translate-y-1 flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-primary text-sm">{lang === "bn" ? "কমিশন" : "Commissions"}</p>
              <p className="text-xs text-text-secondary">{lang === "bn" ? "ইতিহাস দেখুন" : "View History"}</p>
            </div>
          </Link>

          <Link href="/dashboard/orders" className="card hover:shadow-lg hover:-translate-y-1 flex items-center gap-4">
            <div className="w-12 h-12 bg-action/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-action" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-primary text-sm">{lang === "bn" ? "আমার অর্ডার" : "My Orders"}</p>
              <p className="text-xs text-text-secondary">{lang === "bn" ? "অর্ডার ট্র্যাক করুন" : "Track Orders"}</p>
            </div>
          </Link>

          <Link href="/dashboard/profile" className="card hover:shadow-lg hover:-translate-y-1 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-primary text-sm">{lang === "bn" ? "প্রোফাইল" : "Profile"}</p>
              <p className="text-xs text-text-secondary">{lang === "bn" ? "সেটিংস" : "Settings"}</p>
            </div>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "রেফারেল লিংক" : "Referral Link"}</h3>
            <div className="flex gap-2">
              <input
                readOnly
                value={`https://jobayer-group.com/register?ref=${worker.workerId}`}
                className="input-field text-xs flex-1"
              />
              <button
                onClick={() => navigator.clipboard.writeText(`https://jobayer-group.com/register?ref=${worker.workerId}`)}
                className="btn-primary text-xs !px-4 !py-2.5"
              >
                {lang === "bn" ? "কপি" : "Copy"}
              </button>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "পেমেন্ট শিডিউল" : "Payment Schedule"}</h3>
            <div className={`p-3 rounded-xl text-sm ${paySysActive ? "bg-green-50" : "bg-red-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${paySysActive ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`font-medium ${paySysActive ? "text-green-700" : "text-red-700"}`}>
                  {paySysActive
                    ? (lang === "bn" ? "পেমেন্ট সিস্টেম চালু আছে" : "Payment system is active")
                    : (lang === "bn" ? "পেমেন্ট সিস্টেম বর্তমানে বন্ধ" : "Payment system is disabled")}
                </span>
              </div>
              {nextPayDate && (
                <p className="text-text-secondary">
                  {lang === "bn" ? "পরবর্তী পেমেন্ট:" : "Next Payment:"}{" "}
                  {new Date(nextPayDate).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
              <p className="text-text-secondary text-xs mt-1">
                {lang === "bn" ? `প্রতি ${payInterval} দিন পর পর` : `Every ${payInterval} days`}
              </p>
            </div>
            <div className="mt-3 text-xs text-text-secondary">
              {lang === "bn" ? `আপনার ব্যালেন্স: ৳${worker.balance.toLocaleString()}` : `Your balance: ৳${worker.balance.toLocaleString()}`}
              {lang === "bn" ? ` | ন্যূনতম উইথড্র: ৳${minWithdraw.toLocaleString()}` : ` | Min withdrawal: ৳${minWithdraw.toLocaleString()}`}
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "দ্রুত উইথড্র" : "Quick Withdraw"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  {lang === "bn" ? "পরিমাণ" : "Amount"}
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={lang === "bn" ? "পরিমাণ" : "Amount"}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  {lang === "bn" ? "অ্যাকাউন্ট নাম্বার" : "Account Number"}
                </label>
                <input
                  type="text"
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  placeholder={lang === "bn" ? "আপনার অ্যাকাউন্ট নাম্বার দিন" : "Enter your account number"}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  {lang === "bn" ? "পেমেন্ট চ্যানেল" : "Payment Channel"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {channels.filter((ch) => ch.enabled !== false).map((ch) => {
                    const isPaused = ch.status === "paused";
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => !isPaused && setWithdrawChannel(ch.id)}
                        disabled={isPaused}
                        title={isPaused ? (lang === "bn" ? "এই চ্যানেলটি সাময়িকভাবে বন্ধ রয়েছে" : "This channel is temporarily paused") : ""}
                        className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                          isPaused
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                            : withdrawChannel === ch.id
                              ? "border-action bg-action/10 text-action"
                              : "border-border text-text-secondary hover:border-action/50"
                        }`}
                      >
                        {lang === "bn" ? ch.labelBn || ch.label : ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={doWithdraw}
                disabled={!paySysActive}
                className={`w-full text-xs !py-3 rounded-xl font-medium transition-all ${
                  !paySysActive
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "btn-primary"
                }`}
              >
                {!paySysActive
                  ? (lang === "bn" ? "পেমেন্ট সিস্টেম বন্ধ" : "Payment Disabled")
                  : (lang === "bn" ? "উইথড্র" : "Withdraw")}
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              {lang === "bn" ? `ন্যূনতম উইথড্র: ৳${minWithdraw}` : `Min withdrawal: ৳${minWithdraw}`}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
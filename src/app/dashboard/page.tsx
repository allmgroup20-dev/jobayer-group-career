"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import ContactSyncBanner from "@/components/onboarding/ContactSyncBanner";
import { Card, StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const IncomeProgress = dynamic(() => import("@/components/dashboard/IncomeProgress"), {
  loading: () => (
    <div className="mb-8">
      <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />)}
      </div>
    </div>
  ),
});

interface Channel { id: string; label: string; labelBn: string; enabled?: boolean; status?: "active" | "paused"; recommended?: boolean }
interface SavedAccount { id: number; worker_id: string; account_type: string; account_number: string; account_name: string | null; is_default: number; created_at: string }

const DEFAULT_CHANNELS: Channel[] = [
  { id: "bkash", label: "bKash", labelBn: "বিকাশ", enabled: true, status: "active", recommended: false },
  { id: "nagad", label: "Nagad", labelBn: "নগদ", enabled: true, status: "active", recommended: true },
  { id: "rocket", label: "Rocket", labelBn: "রকেট", enabled: true, status: "active", recommended: false },
  { id: "bank", label: "Bank", labelBn: "ব্যাংক", enabled: false, status: "active", recommended: false },
];

export default function WorkerDashboard() {
  const { lang } = useLanguageStore();
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState<any>(null);
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [minWithdraw, setMinWithdraw] = useState(500);
  const [premiumMinWithdraw, setPremiumMinWithdraw] = useState(200);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [pwStep, setPwStep] = useState<0 | 1 | 2>(0);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [paySysActive, setPaySysActive] = useState(true);
  const [nextPayDate, setNextPayDate] = useState("");
  const [payInterval, setPayInterval] = useState(7);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccType, setNewAccType] = useState("nagad");
  const [newAccNumber, setNewAccNumber] = useState("");
  const [newAccName, setNewAccName] = useState("");
  const [selectedAccId, setSelectedAccId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [referralRedirectPath, setReferralRedirectPath] = useState("/register");
  const [analytics, setAnalytics] = useState<{
    totalPageViews: number;
    totalSessions: number;
  } | null>(null);
  const [recommendations, setRecommendations] = useState<{
    courses: { title: string; description: string; url: string; icon: string; category: string; score: number }[];
    products: { id: number; name: string; nameBn: string | null; price: number; imageUrl: string | null; score: number }[];
    topCategories: string[];
  } | null>(null);
  const [personalizedInsights, setPersonalizedInsights] = useState<{
    insights: { type: string; title: string; titleBn: string; priority: number; actionUrl: string; emoji: string }[];
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const wid = localStorage.getItem("worker_id");
    if (!wid) {
      router.replace("/login");
      return;
    }
    setWorkerId(wid);
  }, []);

  useEffect(() => {
    if (!workerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/dashboard/summar?workerId=${workerId}`)
      .then(r => r.json())
      .then((data: any) => {
        if (data.error) { setLoading(false); return; }
        const p = data.profile;
        if (p) {
          setWorker(p);
          if (!p.profileCompleted) {
            router.replace("/onboarding");
            setLoading(false);
            return;
          }
        }
        const s = data.settings || {};
        const mw = parseInt(s.min_withdrawal || "500");
        setMinWithdraw(isNaN(mw) ? 500 : mw);
        const pmw = parseInt(s.min_withdrawal_premium || "200");
        setPremiumMinWithdraw(isNaN(pmw) ? 200 : pmw);
        try {
          const bcStr = s.banking_channels;
          if (bcStr) {
            const saved = JSON.parse(bcStr);
            if (Array.isArray(saved)) setChannels(saved);
          }
        } catch {}
        const accounts = data.accounts || [];
        setSavedAccounts(accounts);
        if (accounts.length) setSelectedAccId(accounts[0].id);
        if (data.analytics) setAnalytics(data.analytics);
        setReferralRedirectPath(s.referral_redirect_path || "/register");
        // Fetch personalized insights
        fetch(`/api/personalize/insights?workerId=${workerId}`)
          .then(r => r.json())
          .then((insightData: any) => {
            if (insightData?.insights) setPersonalizedInsights(insightData);
          })
          .catch(() => {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workerId, router]);

  const isPremium = worker?.membershipStatus === "premium";

  const doWithdraw = async (autoAccount?: SavedAccount) => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return alert(lang === "bn" ? "সঠিক পরিমাণ দিন" : "Enter valid amount");
    const effectiveMin = isPremium ? premiumMinWithdraw : minWithdraw;
    if (amount < effectiveMin) return alert(lang === "bn" ? `ন্যূনতম উইথড্র: ৳${effectiveMin}` : `Min withdrawal: ৳${effectiveMin}`);
    if (amount > (worker?.balance || 0)) return alert(lang === "bn" ? "পর্যাপ্ত ব্যালেন্স নেই" : "Insufficient balance");
    const acc = autoAccount || savedAccounts.find(a => a.id === selectedAccId);
    if (!acc) return alert(lang === "bn" ? "একটি অ্যাকাউন� সিলেক্ট করুন" : "Select an account");
    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId: worker!.workerId, amount, paymentMethod: acc.account_type, accountNumber: acc.account_number }),
    });
    const data = await res.json() as { error?: string };
    if (res.ok) {
      alert(lang === "bn" ? "উইথড্রয়াল অনুরোধ জমা দেওয়া হয়েছে" : "Withdrawal request submitted");
      setWithdrawAmount("");
    } else {
      alert(data.error || "Failed");
    }
  };

  const saveAccountWithPassword = async () => {
    if (!newAccNumber) return alert(lang === "bn" ? "অ্যাকাউন্ট নাম্বার দিন" : "Enter account number");
    if (!pwInput) return alert(lang === "bn" ? "পাসওয়ার্ড দিন" : "Enter password");
    setIsSaving(true);
    setPwError("");
    try {
      const check = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker!.workerId, password: pwInput }),
      });
      const checkData = await check.json() as { valid?: boolean; error?: string };
      if (!check.ok || !checkData.valid) {
        setPwError(lang === "bn" ? "ভুল পাসওয়ার্ড" : "Wrong password");
        setIsSaving(false);
        return;
      }
      if (pwStep === 1) {
        setPwStep(2);
        setPwInput("");
        setIsSaving(false);
        return;
      }
      const isDefault = savedAccounts.length === 0 ? 1 : 0;
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker!.workerId, accountType: newAccType, accountNumber: newAccNumber, accountName: newAccName || null, isDefault }),
      });
      if (res.ok) {
        const updated = await fetch(`/api/accounts?workerId=${worker!.workerId}`).then(r => r.json() as Promise<{ accounts: SavedAccount[] }>);
        setSavedAccounts(updated.accounts || []);
        if (updated.accounts?.length && !selectedAccId) setSelectedAccId(updated.accounts[0].id);
        setNewAccNumber("");
        setNewAccName("");
        setShowAddAccount(false);
        setPwStep(0);
        setPwInput("");
      } else {
        alert("Failed to save account");
      }
    } catch { alert(lang === "bn" ? "সংযোগ ব্যর্থ" : "Connection failed"); }
    setIsSaving(false);
  };

  const deleteAccount = async (id: number) => {
    if (!confirm(lang === "bn" ? "অ্যাকাউন্টটি ডিলিট করবেন?" : "Delete this account?")) return;
    const res = await fetch("/api/accounts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) {
      setSavedAccounts(prev => prev.filter(a => a.id !== id));
      if (selectedAccId === id) setSelectedAccId(savedAccounts.length > 1 ? savedAccounts[0].id === id ? (savedAccounts[1]?.id || null) : savedAccounts[0].id : null);
    }
  };

  const setDefaultAccount = async (id: number) => {
    await fetch("/api/accounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, workerId: worker!.workerId, isDefault: 1 }) });
    setSavedAccounts(prev => prev.map(a => ({ ...a, is_default: a.id === id ? 1 : 0 })));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-border space-y-3">
              <div className="animate-pulse bg-gray-200 h-4 w-16 rounded-lg" />
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-border space-y-3">
              <div className="animate-pulse bg-gray-200 h-5 w-1/3 rounded-lg" />
              <div className="animate-pulse bg-gray-200 h-4 w-2/3 rounded-lg" />
              <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!worker) {
    if (!workerId) return null;
    return (
      <div className="min-h-screen bg-bg p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-border space-y-3">
              <div className="animate-pulse bg-gray-200 h-4 w-16 rounded-lg" />
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-border space-y-3">
              <div className="animate-pulse bg-gray-200 h-5 w-1/3 rounded-lg" />
              <div className="animate-pulse bg-gray-200 h-4 w-2/3 rounded-lg" />
              <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
          {/* Onboarding prompt for new users */}
          {worker.name?.startsWith("User") && (
            <Link href="/onboarding" className="col-span-full p-4 rounded-xl bg-gradient-to-r from-action/10 to-secondary/10 border border-action/20 flex items-center gap-3 hover:shadow-lg transition-all">
              <span className="text-2xl">👋</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-primary">{lang === "bn" ? "আপনার প্রোফাইল কমপ্লিট করুন" : "Complete Your Profile"}</p>
                <p className="text-xs text-text-secondary">{lang === "bn" ? "নাম, পেশা ও আগ্রহ দিন — আপনার জন্য ব্যক্তিগতকৃত অভিজ্ঞতা তৈরি হবে" : "Add your name, occupation & interests for a personalized experience"}</p>
              </div>
              <span className="text-sm font-semibold text-action">{lang === "bn" ? "স্টার্ট" : "Start"} →</span>
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
              {lang === "bn" ? "স্বাগতম" : "Welcome"}, {worker.name}
              {worker.membershipStatus === "premium" ? (
                <span className="text-xs bg-gradient-to-r from-secondary to-secondary-light text-primary-dark font-bold px-3 py-1 rounded-full shadow-sm">⭐ PREMIUM</span>
              ) : (
                <span className="text-xs bg-primary/5 text-text-secondary font-medium px-3 py-1 rounded-full border border-border/60">{lang === "bn" ? "সাধারণ" : "General"}</span>
              )}
            </h1>
            <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {lang === "bn" ? "সদস্য আইডি" : "Member ID"}: {worker.workerId}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label={lang === "bn" ? "ব্যালেন্স" : "Balance"} value={formatCurrency(worker.balance)} color="text-action" />
          <StatCard label={lang === "bn" ? "মোট আয়" : "Total Earnings"} value={formatCurrency(worker.totalEarned)} color="text-secondary-dark" />
          <StatCard label={lang === "bn" ? "সহযোগী" : "Associates"} value={(worker.totalTeamMembers ?? 0).toString()} color="text-primary" />
          <StatCard label={lang === "bn" ? "পদবী" : "Position"} value={lang === "bn" && worker.levelNameBn ? worker.levelNameBn : (worker.levelName || (worker.level ? `Level ${worker.level}` : ""))} color="text-accent" />
        </div>

        {/* Contact Sync Banner (onboarding) */}
        {typeof window !== "undefined" && !localStorage.getItem("contact_sync_done") && workerId && (
          <ContactSyncBanner workerId={workerId} />
        )}

        {/* Resource Income */}
        {typeof worker.resourceIncome === "number" && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-accent/5 to-success/5 border border-accent/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-accent-dark">
                  {lang === "bn" ? "রিসোর্স আয়" : "Resource Income"}
                </p>
                <p className="text-xs text-accent/70 mt-0.5">
                  {lang === "bn"
                    ? `আপনার রিসোর্স আয় দিয়ে প্রতি ৳৯৯ তে একটি প্রিমিয়াম রিসোর্স আনলক করুন। এই আয় উত্তোলন করা যাবে না।`
                    : `Use your resource income to unlock premium resources at ৳99 each. This income cannot be withdrawn.`}
                </p>
                <Link href="/courses" className="inline-block mt-2 px-4 py-1.5 text-xs font-bold rounded-lg bg-accent text-white hover:bg-accent-light transition-all">
                  {lang === "bn" ? `রিসোর্স আনলক করুন (${Math.floor(worker.resourceIncome / 99)}টি)` : `Unlock Resources (${Math.floor(worker.resourceIncome / 99)})`}
                </Link>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-accent-dark">৳{worker.resourceIncome.toLocaleString()}</p>
                <p className="text-[10px] text-accent/60">
                  {lang === "bn" ? `আনলক করতে পারবেন ${Math.floor(worker.resourceIncome / 99)}টি রিসোর্স` : `${Math.floor(worker.resourceIncome / 99)} resources unlockable`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Personalized Insights */}
        {personalizedInsights?.insights && personalizedInsights.insights.length > 0 && (
          <div className="mb-6 space-y-2">
            {personalizedInsights.insights.slice(0, 3).map((insight, i) => (
              <a key={i} href={insight.actionUrl}
                className={`block p-4 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  insight.priority === 1
                    ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                    : insight.priority === 2
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{insight.emoji || (insight.priority === 1 ? '🔴' : insight.priority === 2 ? '🟡' : '🟢')}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary">{lang === "bn" ? insight.titleBn : insight.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {insight.priority === 1
                        ? (lang === "bn" ? "⚡ জরুরি সুপারিশ" : "⚡ Urgent Recommendation")
                        : insight.priority === 2
                        ? (lang === "bn" ? "📌 আপনার জন্য" : "📌 For You")
                        : (lang === "bn" ? "💡 টিপস" : "💡 Tips")}
                    </p>
                  </div>
                  <span className="text-sm text-primary font-medium shrink-0">
                    {lang === "bn" ? "দেখুন" : "View"} →
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Personalized Section */}
        {worker.goal && (
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">
                {worker.goal === "career" ? "🚀" : worker.goal === "freelancing" ? "💻" : worker.goal === "business" ? "📊" : worker.goal === "skill" ? "🧠" : worker.goal === "job" ? "💼" : "🎯"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-primary">
                  {lang === "bn"
                    ? (worker.goal === "career" ? "ক্যারিয়ার গড়তে চান!" : worker.goal === "freelancing" ? "ফ্রিল্যান্সিং শুরু করতে চান!" : worker.goal === "business" ? "ব্যবসা করতে চান!" : worker.goal === "skill" ? "স্কিল ডেভেলপ করতে চান!" : worker.goal === "job" ? "চাকরি পেতে চান!" : "শিখতে চান!")
                    : (worker.goal === "career" ? "Want to build a career!" : worker.goal === "freelancing" ? "Want to start freelancing!" : worker.goal === "business" ? "Want to start a business!" : worker.goal === "skill" ? "Want to develop skills!" : worker.goal === "job" ? "Want to get a job!" : "Want to learn!")}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {lang === "bn" ? "আমরা আপনার লক্ষ্য অনুযায়ী রিসোর্স ও কন্টেন্ট সাজিয়ে দিচ্ছি" : "We're tailoring resources & content based on your goal"}
                </p>
              </div>
              <Link href="/courses" className="px-4 py-2 text-xs font-semibold rounded-lg bg-action text-white hover:bg-action/90 transition-all shrink-0">
                {lang === "bn" ? "রিসোর্স দেখুন" : "View Resources"}
              </Link>
            </div>
          </div>
        )}

        {/* Profile completeness check moved to server redirect above */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/dashboard/tree" className="card hover:shadow-lg hover:-translate-y-0.5 hover:border-accent/30 flex items-center gap-4 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-primary text-sm">{lang === "bn" ? "আমার সহযোগী" : "My Associates"}</p>
              <p className="text-xs text-text-secondary">{worker.totalTeamMembers} {lang === "bn" ? "সহযোগী" : "Associates"}</p>
            </div>
          </Link>

          <Link href="/dashboard/commissions" className="card hover:shadow-lg hover:-translate-y-1 flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-primary text-sm">{lang === "bn" ? "আমার আয়" : "My Earnings"}</p>
              <p className="text-xs text-text-secondary">{lang === "bn" ? "উপার্জনের বিবরণ" : "Income details"}</p>
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

          <Link href="/product-list" className="card hover:shadow-lg hover:-translate-y-1 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-primary text-sm">{lang === "bn" ? "পণ্যসমূহ" : "Products"}</p>
              <p className="text-xs text-text-secondary">{lang === "bn" ? "সকল পণ্য দেখুন ও কিনুন" : "Browse & Buy"}</p>
            </div>
          </Link>
        </div>

        {/* Income Progress */}
        {workerId && <IncomeProgress workerId={workerId} lang={lang} />}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "রেফারেল লিংক" : "Referral Link"}</h3>
            <div className="flex gap-2">
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}${referralRedirectPath}?ref=${worker.workerId}`}
                className="input-field text-xs flex-1"
              />
              <button
                onClick={() => navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}${referralRedirectPath}?ref=${worker.workerId}`)}
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
              {lang === "bn" ? `আপনার ব্যালেন্স: ৳${(worker.balance ?? 0).toLocaleString()}` : `Your balance: ৳${(worker.balance ?? 0).toLocaleString()}`}
              {lang === "bn" ? ` | ন্যূনতম উইথড্র: ৳${minWithdraw.toLocaleString()}` : ` | Min withdrawal: ৳${minWithdraw.toLocaleString()}`}
            </div>
          </Card>
          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "আপনার প্রোফাইল" : "Your Profile"}</h3>
            <div className="space-y-2">
              {worker.country && <div className="flex items-center gap-2 text-xs"><span className="text-text-secondary w-20 shrink-0">{lang === "bn" ? "অবস্থান" : "Location"}:</span><span className="font-medium text-primary">{worker.city ? `${worker.city}, ${worker.country}` : worker.country}</span></div>}
              {worker.goal && <div className="flex items-center gap-2 text-xs"><span className="text-text-secondary w-20 shrink-0">{lang === "bn" ? "লক্ষ্য" : "Goal"}:</span><span className="font-medium text-primary">{worker.goal.replace(/_/g, " ")}</span></div>}
              {worker.preferredLearningTime && <div className="flex items-center gap-2 text-xs"><span className="text-text-secondary w-20 shrink-0">{lang === "bn" ? "পড়ার সময়" : "Study Time"}:</span><span className="font-medium text-primary">{worker.preferredLearningTime}</span></div>}
              {worker.occupation && <div className="flex items-center gap-2 text-xs"><span className="text-text-secondary w-20 shrink-0">{lang === "bn" ? "পেশা" : "Occupation"}:</span><span className="font-medium text-primary">{worker.occupation}</span></div>}
              {worker.ageGroup && <div className="flex items-center gap-2 text-xs"><span className="text-text-secondary w-20 shrink-0">{lang === "bn" ? "বয়স" : "Age"}:</span><span className="font-medium text-primary">{worker.ageGroup.replace(/_/g, " ")}</span></div>}
            </div>
            <Link href="/dashboard/profile" className="mt-3 inline-block text-xs text-action font-semibold hover:underline">
              {lang === "bn" ? "এডিট প্রোফাইল →" : "Edit Profile →"}
            </Link>
          </Card>
        </div>

        {analytics && (analytics.totalPageViews > 0 || analytics.totalSessions > 0) && (
          <div className="mt-6">
            <Card>
              <h3 className="font-bold text-primary flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                </svg>
                {lang === "bn" ? "আপনার কার্যকলাপ" : "Your Activity"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-xs text-text-secondary">{lang === "bn" ? "পৃষ্ঠা দেখা" : "Page Views"}</p>
                  <p className="text-2xl font-bold text-primary mt-1">{analytics.totalPageViews}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-xs text-text-secondary">{lang === "bn" ? "সেশন" : "Sessions"}</p>
                  <p className="text-2xl font-bold text-primary mt-1">{analytics.totalSessions}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {recommendations && (recommendations.courses.length > 0 || recommendations.products.length > 0) && (
          <div className="mt-6 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-primary flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {lang === "bn" ? "আপনার জন্য সুপারিশ" : "Recommended for You"}
                </h3>
              </div>

              {recommendations.courses.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    {lang === "bn" ? "রিসোর্স" : "Resources"}
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {recommendations.courses.map((c, i) => (
                      <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <i className={`fas ${c.icon} text-sm`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-primary group-hover:text-action transition-colors truncate">{c.title}</p>
                          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{c.description}</p>
                          <span className="text-[10px] text-accent font-medium mt-1 inline-block">{c.category}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {recommendations.products.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    {lang === "bn" ? "পণ্য" : "Products"}
                  </h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {recommendations.products.map((p) => (
                      <Link key={p.id} href={`/products?id=${p.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary/5 transition-all group"
                      >
                        {p.imageUrl ? (
                          /* eslint-disable @next/next/no-img-element */
                          <img src={p.imageUrl} alt="" loading="lazy" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-action/10 flex items-center justify-center text-action shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-primary truncate">{lang === "bn" && p.nameBn ? p.nameBn : p.name}</p>
                          <p className="text-xs font-semibold text-action mt-0.5">৳{p.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Personalized Recommendations Trigger */}
        <div className="mt-6">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔔</span>
                <div>
                  <h3 className="font-bold text-primary text-sm">{lang === "bn" ? "ব্যক্তিগতকৃত নোটিফিকেশন" : "Personalized Notifications"}</h3>
                  <p className="text-xs text-text-secondary">{lang === "bn" ? "আপনার আগ্রহ ও লক্ষ্যের উপর ভিত্তি করে কাস্টম আপডেট" : "Custom updates based on your interests and goals"}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const wid = localStorage.getItem("worker_id");
                  if (!wid) return;
                  const res = await fetch("/api/personalize/notify", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId: wid }),
                  });
                  const d = await res.json() as { success?: boolean; sent?: number };
                  if (d.success) alert(lang === "bn" ? `${d.sent}টি ব্যক্তিগতকৃত নোটিফিকেশন তৈরি হয়েছে` : `${d.sent} personalized notifications created`);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-all"
              >
                {lang === "bn" ? "নোটিফিকেশন জেনারেট করুন" : "Generate Notifications"}
              </button>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <h3 className="font-bold text-primary mb-4">
              {lang === "bn" ? "📤 উইথড্র" : "📤 Withdraw"}
              {paySysActive ? (
                <span className="ml-2 text-xs font-normal text-green-600">● {lang === "bn" ? "রিকোয়েস্ট মোড" : "Request Mode"}</span>
              ) : (
                <span className="ml-2 text-xs font-normal text-amber-600">● {lang === "bn" ? "অটো-পে-আউট মোড" : "Auto Payout Mode"}</span>
              )}
            </h3>

            {!paySysActive && (
              <div className="p-4 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <p className="font-semibold">{lang === "bn" ? "⚡ অটোমেটিক পে-আউট সক্রিয়" : "⚡ Auto Payout Active"}</p>
                <p className="mt-1 text-xs">{lang === "bn"
                  ? "উইথড্রয়াল রিকোয়েস্ট সিস্টেম বন্ধ রয়েছে। আপনার সম্পূর্ণ ব্যালেন্স স্বয়ংক্রিয়ভাবে উত্তোলন করা হবে।"
                  : "Withdrawal request system is disabled. Your full balance will be automatically withdrawn."}</p>
                <p className="mt-2 text-lg font-bold text-amber-900">{lang === "bn" ? "বর্তমান ব্যালেন্স:" : "Current Balance:"} ৳{worker?.balance?.toLocaleString() || 0}</p>
              </div>
            )}

            {paySysActive && (
              <>
                {/* Saved Accounts */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    {lang === "bn" ? "আপনার অ্যাকাউন্ট" : "Your Accounts"}
                  </label>
                  {savedAccounts.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {savedAccounts.map(acc => (
                        <div
                          key={acc.id}
                          onClick={() => setSelectedAccId(acc.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedAccId === acc.id
                              ? "border-action bg-action/5"
                              : "border-border hover:border-action/40 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{acc.account_type === "nagad" ? "💚" : acc.account_type === "bkash" ? "🩷" : acc.account_type === "rocket" ? "🚀" : "🏦"}</span>
                            <div>
                              <p className="text-sm font-medium text-primary">
                                {lang === "bn"
                                  ? channels.find(c => c.id === acc.account_type)?.labelBn || acc.account_type
                                  : channels.find(c => c.id === acc.account_type)?.label || acc.account_type}
                                {acc.is_default ? <span className="ml-1.5 text-[10px] text-action font-semibold">({lang === "bn" ? "ডিফল্ট" : "Default"})</span> : ""}
                              </p>
                              <p className="text-xs font-mono text-text-secondary">{acc.account_number}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!acc.is_default && (
                              <button onClick={e => { e.stopPropagation(); setDefaultAccount(acc.id); }}
                                className="p-1.5 text-[10px] text-action hover:bg-action/10 rounded-lg" title={lang === "bn" ? "ডিফল্ট করুন" : "Set default"}>
                                {lang === "bn" ? "ডিফল্ট" : "Default"}
                              </button>
                            )}
                            <button onClick={e => { e.stopPropagation(); deleteAccount(acc.id); }}
                              className="p-1.5 text-[10px] text-red-500 hover:bg-red-50 rounded-lg" title={lang === "bn" ? "ডিলিট" : "Delete"}>
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!showAddAccount ? (
                    <button onClick={() => setShowAddAccount(true)}
                      className="text-sm text-action hover:text-action-light font-medium flex items-center gap-1">
                      + {lang === "bn" ? "নতুন অ্যাকাউন্ট যোগ করুন" : "Add New Account"}
                    </button>
                  ) : pwStep > 0 ? (
                    <div className="p-4 bg-white rounded-xl border-2 border-action/30 space-y-3 animate-fade-up">
                      <p className="text-sm font-bold text-primary text-center">
                        {pwStep === 1
                          ? (lang === "bn" ? "🔒 পাসওয়ার্ড দিন (১ম ধাপ)" : "🔒 Enter Password (Step 1)")
                          : (lang === "bn" ? `🔒 নিশ্চিত করুন — ${channels.find(c => c.id === newAccType)?.labelBn || newAccType}: ${newAccNumber}` : `🔒 Confirm — ${newAccType}: ${newAccNumber}`)}
                      </p>
                      {pwStep === 2 && (
                        <div className="p-3 bg-gray-100 rounded-xl text-center">
                          <p className="text-lg font-bold text-primary">{channels.find(c => c.id === newAccType)?.labelBn || newAccType}</p>
                          <p className="text-sm font-mono text-text-secondary">{newAccNumber}</p>
                          {newAccName && <p className="text-xs text-text-secondary mt-1">{newAccName}</p>}
                        </div>
                      )}
                      <p className="text-xs text-text-secondary text-center">{lang === "bn" ? "নিরাপত্তার জন্য পুনরায় পাসওয়ার্ড দিন" : "Re-enter password for security"}</p>
                      <input type="password" value={pwInput} onChange={e => { setPwInput(e.target.value); setPwError(""); }}
                        placeholder={lang === "bn" ? "পাসওয়ার্ড" : "Password"}
                        className="input-field w-full text-sm text-center" autoFocus />
                      {pwError && <p className="text-xs text-red-500 text-center">{pwError}</p>}
                      <div className="flex gap-2">
                        <button onClick={saveAccountWithPassword} disabled={isSaving || !pwInput}
                          className="btn-primary text-xs !py-2 flex-1 disabled:opacity-50">
                          {isSaving ? "..." : (lang === "bn" ? "নিশ্চিত করুন" : "Confirm")}
                        </button>
                        <button onClick={() => { setPwStep(0); setPwInput(""); setPwError(""); }}
                          className="px-4 py-2 text-xs text-text-secondary hover:text-primary rounded-lg border border-border">
                          {lang === "bn" ? "বাতিল" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                      <div className="flex gap-2">
                        {["nagad", "bkash", "rocket", "bank"].map(type => (
                          <button key={type} onClick={() => setNewAccType(type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                              newAccType === type ? "bg-action text-white" : "bg-white text-text-secondary border border-border"
                            }`}>
                            {lang === "bn"
                              ? ({ nagad: "নগদ", bkash: "বিকাশ", rocket: "রকেট", bank: "ব্যাংক" } as Record<string, string>)[type] || type
                              : type}
                          </button>
                        ))}
                      </div>
                      <input type="text" value={newAccNumber} onChange={e => setNewAccNumber(e.target.value)}
                        placeholder={lang === "bn" ? "অ্যাকাউন্ট নাম্বার" : "Account Number"}
                        className="input-field w-full text-sm" />
                      <input type="text" value={newAccName} onChange={e => setNewAccName(e.target.value)}
                        placeholder={lang === "bn" ? "অ্যাকাউন্টের নাম (ঐচ্ছিক)" : "Account Label (optional)"}
                        className="input-field w-full text-sm" />
                      <div className="flex gap-2">
                        <button onClick={() => {
                          if (!newAccNumber) return alert(lang === "bn" ? "অ্যাকাউন্ট নাম্বার দিন" : "Enter account number");
                          setPwStep(1);
                          setPwInput("");
                          setPwError("");
                        }} className="btn-primary text-xs !py-2 flex-1">
                          {lang === "bn" ? "সেভ করুন" : "Save Account"}
                        </button>
                        <button onClick={() => setShowAddAccount(false)} className="px-4 py-2 text-xs text-text-secondary hover:text-primary rounded-lg border border-border">
                          {lang === "bn" ? "বাতিল" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount Input */}
                <div className="mb-4">
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
                {/* Min withdrawal info */}
                <div className="mb-4 p-3 rounded-xl bg-gray-50 text-sm">
                  {!isPremium && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">{lang === "bn" ? "সাধারণ সদস্য:" : "Regular:"}</span>
                      <span className="font-semibold text-primary">ন্যূনতম ৳{minWithdraw}</span>
                    </div>
                  )}
                  <div className={`flex items-center justify-between ${!isPremium ? "mt-1" : ""}`}>
                    <span className="text-text-secondary">
                      {lang === "bn" ? "প্রিমিয়াম সদস্য:" : "Premium:"} ⭐
                      {!isPremium && (
                        <Link href="/membership" className="ml-2 text-xs text-action hover:underline">
                          {lang === "bn" ? "আপগ্রেড করুন →" : "Upgrade →"}
                        </Link>
                      )}
                    </span>
                    <span className="font-semibold text-primary">ন্যূনতম ৳{premiumMinWithdraw}</span>
                  </div>
                  {!isPremium && (
                    <>
                      <p className="mt-2 text-xs text-amber-600">
                        {lang === "bn"
                          ? `প্রিমিয়ামে আপগ্রেড করে মাত্র ৳${premiumMinWithdraw} থেকে উত্তোলন শুরু করুন!`
                          : `Upgrade to Premium and withdraw from just ৳${premiumMinWithdraw}!`}
                      </p>
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {lang === "bn"
                          ? "⚠ সাধারণ মেম্বার হিসেবে উত্তোলনে প্ল্যাটফর্ম ট্যাক্স কাটা হবে। প্রিমিয়াম মেম্বার হলে কোনো ট্যাক্স নেই।"
                          : "⚠ General member withdrawals are subject to platform tax. Premium members pay no tax."}
                      </p>
                    </>
                  )}
                </div>

                {/* Submit button */}
                <button
                  onClick={() => doWithdraw()}
                  className="w-full btn-primary !py-3 text-sm"
                >
                  {lang === "bn" ? "✅ উইথড্র করুন" : "✅ Withdraw"}
                </button>
              </>
            )}

            {!paySysActive && (
              <button
                onClick={async () => {
                  if (!confirm(lang === "bn" ? "আপনার সম্পূর্ণ ব্যালেন্স উত্তোলন হবে, নিশ্চিত?" : "Your full balance will be withdrawn. Confirm?")) return;
                  const acc = savedAccounts.find(a => a.id === selectedAccId);
                  if (!acc) return alert(lang === "bn" ? "একটি অ্যাকাউন্ট সিলেক্ট করুন" : "Select an account");
                  await doWithdraw(acc || undefined);
                }}
                className="w-full btn-primary !py-3 text-sm mt-2"
              >
                {lang === "bn" ? "⚡ অটো উইথড্র" : "⚡ Auto Withdraw"}
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

interface LevelProgress {
  levelNumber: number; levelName: string; levelNameBn: string | null;
  percentage: number; fixedAmount: number;
  requiredMembers: number;
  targetIncome: number; actualIncome: number;
  isUnlocked: boolean; progressPct: number;
}


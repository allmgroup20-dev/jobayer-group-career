"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSWRFetch } from "@/lib/use-swr-fetch";
import { Skeleton } from "@/components/ui/Skeleton";

interface Member {
  workerId: string; name: string; phone: string; email: string | null;
  level: number; sponsorId: string | null; sponsorName: string | null;
  joinDate: string; balance: number; totalEarned: number;
  totalTeamMembers: number; membershipStatus: string; isTestAccount: number;
  createdAt: string;
}

const emptyForm = () => ({
  name: "", phone: "", password: "", sponsorId: "",
});

export default function CompanyMembersPage() {
  const { lang } = useLanguageStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const params = new URLSearchParams({ page: String(page), limit: "50" });
  if (debouncedSearch) params.set("search", debouncedSearch);
  const { data, loading, refresh } = useSWRFetch<{ members?: Member[]; total?: number }>(
    `/api/company/members?${params}`,
    { ttlMs: 180_000 }
  );
  const members = data?.members ?? [];
  const total = data?.total ?? 0;
  const [showAdd, setShowAdd] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deletePass, setDeletePass] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLocked, setDeleteLocked] = useState(false);
  const [deleteLockTimer, setDeleteLockTimer] = useState(0);
  const [form, setForm] = useState(emptyForm());
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", password: "", level: 1, membershipStatus: "active", balance: 0, sponsorId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [companyUser, setCompanyUser] = useState<{ username: string; name: string } | null>(null);

  useEffect(() => {
    try {
      const stored = document.cookie.split("; ").find((r) => r.startsWith("company_user="));
      if (stored) setCompanyUser(JSON.parse(decodeURIComponent(stored.split("=")[1])));
    } catch {}
  }, []);

  const resetForm = () => { setForm(emptyForm()); setError(""); };

  const handleAdd = async () => {
    if (!form.phone || !form.password) { setError(lang === "bn" ? "ফোন এবং পাসওয়ার্ড প্রয়োজন" : "Phone and password required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/company/members", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      setShowAdd(false); resetForm(); refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const startEdit = async (m: Member) => {
    setEditMember(m);
    setEditForm({
      name: m.name, phone: m.phone, email: m.email || "", password: "",
      level: m.level, membershipStatus: m.membershipStatus, balance: m.balance,
      sponsorId: m.sponsorId || "",
    });
  };

  const handleEdit = async () => {
    if (!editMember) return;
    setSaving(true); setError("");
    try {
      const payload: Record<string, unknown> = { name: editForm.name };
      if (editForm.phone !== editMember.phone) payload.phone = editForm.phone;
      if (editForm.email !== (editMember.email || "")) payload.email = editForm.email || null;
      if (editForm.password) payload.password = editForm.password;
      if (editForm.level !== editMember.level) payload.level = editForm.level;
      if (editForm.membershipStatus !== editMember.membershipStatus) payload.membershipStatus = editForm.membershipStatus;
      if (editForm.balance !== editMember.balance) payload.balance = editForm.balance;
      if (editForm.sponsorId !== (editMember.sponsorId || "")) payload.sponsorId = editForm.sponsorId || null;

      const res = await fetch(`/api/company/members/${editMember.workerId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Update failed");
      setEditMember(null); refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const startDelete = (m: Member) => {
    setDeleteTarget(m); setDeleteStep(1); setDeletePass("");
    setDeleteError(""); setDeleteLocked(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !companyUser) return;
    setSaving(true); setDeleteError("");
    try {
      const res = await fetch(`/api/company/members/${deleteTarget.workerId}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePass, username: companyUser.username }),
      });
      if (res.status === 401) {
        if (deleteStep >= 3) {
          setDeleteError(lang === "bn" ? "অনেক চেষ্টা করুন। ৩০ সেকেন্ড অপেক্ষা করুন।" : "Too many attempts. Wait 30 seconds.");
          setDeleteLocked(true);
          setDeleteLockTimer(30);
          const iv = setInterval(() => {
            setDeleteLockTimer((p) => { if (p <= 1) { clearInterval(iv); setDeleteLocked(false); setDeleteStep(1); return 0; } return p - 1; });
          }, 1000);
          return;
        }
        setDeleteError(lang === "bn" ? `ভুল পাসওয়ার্ড। আর ${3 - deleteStep} বার চেষ্টা বাকি` : `Wrong password. ${3 - deleteStep} attempts left`);
        setDeleteStep(deleteStep + 1);
        setDeletePass("");
        return;
      }
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setDeleteTarget(null); setDeleteStep(0); setDeletePass(""); refresh();
    } catch (err) { setDeleteError(err instanceof Error ? err.message : "Error"); }
    finally { setSaving(false); }
  };

  const loginAsMember = async (m: Member) => {
    try {
      const res = await fetch("/api/company/impersonate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: m.workerId }),
      });
      const data = await res.json() as { error?: string; token?: string; workerId?: string };
      if (!res.ok) throw new Error(data.error || "Impersonation failed");
      if (data.token) {
        localStorage.setItem("worker_token", data.token);
        localStorage.setItem("worker_id", data.workerId || m.workerId);
        window.open("/dashboard", "_blank");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to login as member");
    }
  };

  const togglePremium = async (m: Member) => {
    const newStatus = m.membershipStatus === "premium" ? "active" : "premium";
    try {
      await fetch(`/api/company/members/${m.workerId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipStatus: newStatus }),
      });
      refresh();
    } catch {}
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "মেম্বার ম্যানেজমেন্ট" : "Member Management"}</h1>
            <p className="text-sm text-text-secondary mt-1">{total.toLocaleString()} {lang === "bn" ? "জন মোট সদস্য" : "total members"}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field max-w-xs" placeholder={lang === "bn" ? "নাম, আইডি বা ফোন..." : "Search name, ID or phone..."}
            />
            <Button onClick={() => { resetForm(); setShowAdd(!showAdd); }}>
              {lang === "bn" ? "+ নিবন্ধন" : "+ Register"}
            </Button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

        {showAdd && (
          <Card className="mb-6 animate-fade-up">
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "নতুন মেম্বার নিবন্ধন" : "Register New Member"}</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder={lang === "bn" ? "নাম" : "Name"} />
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder={lang === "bn" ? "ফোন নম্বর" : "Phone number"} required />
              <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder={lang === "bn" ? "পাসওয়ার্ড" : "Password"} required />
              <input type="text" value={form.sponsorId} onChange={(e) => setForm({ ...form, sponsorId: e.target.value })} className="input-field" placeholder={lang === "bn" ? "স্পন্সর আইডি (ঐচ্ছিক)" : "Sponsor ID (optional)"} />
            </div>
            <div className="flex gap-2 justify-end border-t border-border pt-4">
              <Button variant="ghost" onClick={() => { setShowAdd(false); resetForm(); }}>{lang === "bn" ? "বাতিল" : "Cancel"}</Button>
              <Button onClick={handleAdd} disabled={saving}>{saving ? (lang === "bn" ? "..." : "...") : (lang === "bn" ? "নিবন্ধন" : "Register")}</Button>
            </div>
          </Card>
        )}

        {editMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setEditMember(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "মেম্বার সম্পাদনা" : "Edit Member"} — {editMember.name}</h3>
              <div className="space-y-3">
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field w-full" placeholder={lang === "bn" ? "নাম" : "Name"} />
                <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input-field w-full" placeholder={lang === "bn" ? "ফোন" : "Phone"} />
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field w-full" placeholder={lang === "bn" ? "ইমেইল" : "Email"} />
                <input type="text" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="input-field w-full" placeholder={lang === "bn" ? "নতুন পাসওয়ার্ড (খালি রাখলে unchanged)" : "New password (leave empty to keep)"} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">{lang === "bn" ? "লেভেল" : "Level"}</label>
                    <input type="number" value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: parseInt(e.target.value) || 1 })} className="input-field w-full" min="1" max="20" />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">{lang === "bn" ? "ব্যালেন্স" : "Balance"}</label>
                    <input type="number" value={editForm.balance} onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) || 0 })} className="input-field w-full" min="0" step="0.01" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</label>
                    <select value={editForm.membershipStatus} onChange={(e) => setEditForm({ ...editForm, membershipStatus: e.target.value })} className="input-field w-full">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">{lang === "bn" ? "স্পন্সর আইডি" : "Sponsor ID"}</label>
                    <input type="text" value={editForm.sponsorId} onChange={(e) => setEditForm({ ...editForm, sponsorId: e.target.value })} className="input-field w-full" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-border">
                <Button variant="ghost" onClick={() => setEditMember(null)}>{lang === "bn" ? "বাতিল" : "Cancel"}</Button>
                <Button onClick={handleEdit} disabled={saving}>{saving ? "..." : (lang === "bn" ? "সংরক্ষণ" : "Save")}</Button>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => !deleteLocked && setDeleteTarget(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">⚠️</div>
                <h3 className="font-bold text-primary text-lg">{lang === "bn" ? "মেম্বার ডিলিট" : "Delete Member"}</h3>
                <p className="text-sm text-text-secondary mt-1">
                  {lang === "bn"
                    ? `"${deleteTarget.name}" (${deleteTarget.workerId}) কে ডিলিট করতে ${deleteStep}/৩ বার পাসওয়ার্ড দিন`
                    : `Enter company password (${deleteStep}/3) to delete "${deleteTarget.name}" (${deleteTarget.workerId})`}
                </p>
              </div>

              {deleteLocked ? (
                <div className="text-center py-4">
                  <p className="text-red-600 font-semibold">{lang === "bn" ? `অপেক্ষা করুন ${deleteLockTimer} সেকেন্ড` : `Wait ${deleteLockTimer} seconds`}</p>
                </div>
              ) : (
                <>
                  <input
                    type="password" value={deletePass}
                    onChange={(e) => setDeletePass(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && deletePass && handleDeleteConfirm()}
                    className="input-field w-full text-center text-lg py-3 mb-3"
                    placeholder={lang === "bn" ? "কোম্পানি পাসওয়ার্ড দিন" : "Enter company password"}
                    autoFocus
                  />
                  {deleteError && <p className="text-xs text-red-600 text-center mb-3">{deleteError}</p>}
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => { setDeleteTarget(null); setDeleteStep(0); }} className="flex-1">
                      {lang === "bn" ? "বাতিল" : "Cancel"}
                    </Button>
                    <Button onClick={handleDeleteConfirm} disabled={saving || !deletePass} className="flex-1 !bg-red-600 hover:!bg-red-700">
                      {saving ? "..." : (lang === "bn" ? `নিশ্চিত (${deleteStep}/৩)` : `Confirm (${deleteStep}/3)`)}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <Card className="overflow-hidden !p-0">
          {loading ? (
            <Skeleton className="h-4 w-32 mx-auto" />
          ) : members.length === 0 ? (
            <div className="p-12 text-center text-text-secondary text-sm">{lang === "bn" ? "কোনো মেম্বার পাওয়া যায়নি" : "No members found"}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="text-left p-3 text-xs font-semibold text-primary">ID</th>
                    <th className="text-left p-3 text-xs font-semibold text-primary">{lang === "bn" ? "নাম" : "Name"}</th>
                    <th className="text-left p-3 text-xs font-semibold text-primary">{lang === "bn" ? "ফোন" : "Phone"}</th>
                    <th className="text-center p-3 text-xs font-semibold text-primary">{lang === "bn" ? "লেভেল" : "Lv"}</th>
                    <th className="text-center p-3 text-xs font-semibold text-primary">{lang === "bn" ? "সহযোগী" : "Associates"}</th>
                    <th className="text-center p-3 text-xs font-semibold text-primary">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                    <th className="text-center p-3 text-xs font-semibold text-primary">⭐</th>
                    <th className="text-center p-3 text-xs font-semibold text-primary">{lang === "bn" ? "লগইন" : "Login"}</th>
                    <th className="text-center p-3 text-xs font-semibold text-primary">{lang === "bn" ? "কাজ" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.workerId} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                      <td className="p-3 text-xs font-mono text-primary">{m.workerId}</td>
                      <td className="p-3 text-sm font-medium text-primary">{m.name}</td>
                      <td className="p-3 text-xs text-text-secondary">{m.phone}</td>
                      <td className="p-3 text-xs text-center">L{m.level}</td>
                      <td className="p-3 text-xs text-center font-medium">{m.totalTeamMembers}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.membershipStatus === "premium" ? "bg-amber-50 text-amber-600" :
                          m.membershipStatus === "active" ? "bg-green-50 text-green-600" :
                          "bg-gray-50 text-gray-500"
                        }`}>
                          {m.membershipStatus === "premium" ? (lang === "bn" ? "প্রিমিয়াম" : "Premium") :
                           m.membershipStatus === "active" ? (lang === "bn" ? "সক্রিয়" : "Active") : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => togglePremium(m)}
                          className={`text-lg transition-all ${m.membershipStatus === "premium" ? "scale-110" : "grayscale opacity-40 hover:opacity-100 hover:grayscale-0"}`}
                          title={m.membershipStatus === "premium" ? (lang === "bn" ? "প্রিমিয়াম সরান" : "Remove Premium") : (lang === "bn" ? "প্রিমিয়াম করুন" : "Make Premium")}
                        >⭐</button>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => loginAsMember(m)}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                          title={lang === "bn" ? "এই মেম্বার হিসেবে লগইন করুন" : "Login as this member"}
                        >🔑 {lang === "bn" ? "লগইন" : "Login"}</button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => startEdit(m)} className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded" title={lang === "bn" ? "সম্পাদনা" : "Edit"}>✏️</button>
                          <button onClick={() => startDelete(m)} className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded" title={lang === "bn" ? "ডিলিট" : "Delete"}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {total > 50 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >←</button>
            <span className="text-sm text-text-secondary">{lang === "bn" ? "পাতা" : "Page"} {page} / {Math.ceil(total / 50)}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / 50)}
              className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >→</button>
          </div>
        )}
      </div>
    </div>
  );
}

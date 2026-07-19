"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface CompanyUser {
  id: number;
  username: string;
  name: string;
  role: string;
  created_at: string;
}

export default function CompanyUsersPage() {
  const { lang } = useLanguageStore();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState<CompanyUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/company/users");
      const data = await res.json() as { users?: CompanyUser[]; error?: string };
      if (res.ok) setUsers(data.users || []);
      else setError(data.error || "Failed to load");
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {lang === "bn" ? "অ্যাডমিন ব্যবহারকারী" : "Admin Users"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {users.length} {lang === "bn" ? "জন ব্যবহারকারী" : "user(s)"}
            </p>
          </div>
          <Button onClick={() => setShowAdd(true)}>
            {lang === "bn" ? "+ নতুন ব্যবহারকারী" : "+ Add User"}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Skeleton className="h-4 w-32" /></div>
        ) : (
          <Card className="overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="text-left p-4 text-sm font-semibold text-primary">
                      {lang === "bn" ? "ইউজারনেম" : "Username"}
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-primary">
                      {lang === "bn" ? "নাম" : "Name"}
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-primary">
                      {lang === "bn" ? "রোল" : "Role"}
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-primary hidden sm:table-cell">
                      {lang === "bn" ? "তৈরির তারিখ" : "Created"}
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-primary">
                      {lang === "bn" ? "অ্যাকশন" : "Action"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                      <td className="p-4 text-sm font-mono font-medium text-primary">{u.username}</td>
                      <td className="p-4 text-sm text-primary">{u.name}</td>
                      <td className="p-4 text-sm">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.role === "superadmin" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-text-secondary hidden sm:table-cell">
                        {u.created_at ? u.created_at.split("T")[0] || u.created_at.split(" ")[0] : "-"}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setShowDelete(u)}
                        >
                          {lang === "bn" ? "মুছুন" : "Delete"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-text-secondary text-sm">
                        {lang === "bn" ? "কোনো ব্যবহারকারী নেই" : "No users found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {showAdd && <AddUserDialog lang={lang} onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); fetchUsers(); }} />}
      {showDelete && <DeleteUserDialog lang={lang} user={showDelete} onClose={() => setShowDelete(null)} onDeleted={() => { setShowDelete(null); fetchUsers(); }} />}
    </div>
  );
}

function AddUserDialog({ lang, onClose, onCreated }: { lang: string; onClose: () => void; onCreated: () => void }) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !name || !password) {
      setError(lang === "bn" ? "সব ফিল্ড পূরণ করুন" : "All fields are required");
      return;
    }
    if (password.length < 6) {
      setError(lang === "bn" ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError(lang === "bn" ? "পাসওয়ার্ড মিলছে না" : "Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/company/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, password, role }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to create");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-primary">
            {lang === "bn" ? "নতুন ব্যবহারকারী" : "Add User"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {lang === "bn" ? "ইউজারনেম" : "Username"}
            </label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {lang === "bn" ? "নাম" : "Name"}
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {lang === "bn" ? "পাসওয়ার্ড" : "Password"}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field w-full" required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {lang === "bn" ? "পাসওয়ার্ড আবার দিন" : "Confirm Password"}
            </label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {lang === "bn" ? "রোল" : "Role"}
            </label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field w-full">
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
              <option value="manager">Manager</option>
              <option value="support">Support</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {lang === "bn" ? "তৈরি করুন" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteUserDialog({ lang, user, onClose, onDeleted }: { lang: string; user: CompanyUser; onClose: () => void; onDeleted: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword) {
      setError(lang === "bn" ? "আপনার নিজের পাসওয়ার্ড দিন" : "Enter your current password");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/company/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, currentPassword }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-red-600">
            {lang === "bn" ? "ব্যবহারকারী মুছুন" : "Delete User"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-text-secondary mb-4">
          {lang === "bn"
            ? `আপনি কি "${user.username}" (${user.name}) কে মুছে ফেলতে চান?`
            : `Are you sure you want to delete "${user.username}" (${user.name})?`
          }
        </p>

        {error && <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>}

        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {lang === "bn" ? "নিশ্চিত করতে আপনার নিজের পাসওয়ার্ড দিন" : "Enter your password to confirm"}
            </label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field w-full" required />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              {lang === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button type="submit" variant="danger" loading={saving} className="flex-1">
              {lang === "bn" ? "মুছুন" : "Delete"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

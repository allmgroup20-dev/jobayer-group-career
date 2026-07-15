"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";

interface PlatformUser {
  phone: string;
  preferred_platform: string;
  last_active_platform: string | null;
  platforms_tried: string;
  last_active_at: string | null;
}

export default function PlatformsPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPlatform, setEditPlatform] = useState("whatsapp");

  const loadUsers = useCallback(async (q?: string) => {
    setLoading(true);
    const url = q ? `/api/platform-prefs?search=${encodeURIComponent(q)}` : "/api/platform-prefs";
    const res = await fetch(url);
    const data = await res.json() as any;
    setUsers(data?.data || (Array.isArray(data) ? data : []));
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSearch = () => { loadUsers(search); };

  const handleUpdate = async () => {
    await fetch("/api/platform-prefs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: editPhone, platform: editPlatform }),
    });
    setEditPhone("");
    loadUsers(search);
  };

  const handleDelete = async (phone: string) => {
    await fetch(`/api/platform-prefs?phone=${encodeURIComponent(phone)}`, { method: "DELETE" });
    loadUsers(search);
  };

  const platformBadge = (p: string) => {
    const colors: Record<string, string> = {
      whatsapp: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      messenger: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      telegram: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[p] || "bg-gray-100"}`}>{p}</span>;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Platform Preferences</h1>
      <p className="text-sm text-gray-500 mb-6">
        Each user&apos;s preferred communication platform is auto-detected from their replies.
      </p>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search by phone ID..."
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Manual override */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow flex gap-3 items-end flex-wrap">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Phone ID</label>
          <input
            type="text"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="88017... / tg_... / fb_..."
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 w-60"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Preferred Platform</label>
          <select
            value={editPlatform}
            onChange={(e) => setEditPlatform(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="messenger">Messenger</option>
            <option value="telegram">Telegram</option>
          </select>
        </div>
        <Button onClick={handleUpdate}>Set Preference</Button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 px-2">Phone ID</th>
                <th className="text-left py-2 px-2">Preferred</th>
                <th className="text-left py-2 px-2">Last Active</th>
                <th className="text-left py-2 px-2">Platforms Tried</th>
                <th className="text-left py-2 px-2">Last Active</th>
                <th className="py-2 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.phone} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="py-2 px-2 font-mono text-xs">{u.phone}</td>
                  <td className="py-2 px-2">{platformBadge(u.preferred_platform)}</td>
                  <td className="py-2 px-2">
                    {u.last_active_platform ? platformBadge(u.last_active_platform) : "—"}
                  </td>
                  <td className="py-2 px-2 text-xs">
                    {(JSON.parse(u.platforms_tried || "[]") as string[]).map((p) => (
                      <span key={p} className="mr-1">{platformBadge(p)}</span>
                    ))}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-500">
                    {u.last_active_at ? new Date(u.last_active_at + "Z").toLocaleString() : "—"}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() => handleDelete(u.phone)}
                      className="text-red-500 hover:text-red-700 text-xs"
                      title="Reset preference"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

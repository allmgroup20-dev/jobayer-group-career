"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { formatDate, getStatusBadge, getStatusColor } from "@/lib/utils";

const mockMembers = [
  { id: "JGRH1234", name: "Rahim Molla", phone: "01712345678", level: 1, team: 45, earnings: 87500, status: "active", date: "2025-12-01" },
  { id: "JGKH5678", name: "Karim Hossain", phone: "01987654321", level: 1, team: 12, earnings: 45200, status: "active", date: "2026-01-15" },
  { id: "JGFB9012", name: "Fatima Begum", phone: "01655567890", level: 2, team: 5, earnings: 12300, status: "active", date: "2026-02-20" },
  { id: "JGSR1234", name: "Shamim Reza", phone: "01733345678", level: 1, team: 8, earnings: 28900, status: "active", date: "2026-03-01" },
  { id: "JGJH3456", name: "Jahid Hasan", phone: "0187772345", level: 2, team: 3, earnings: 5600, status: "inactive", date: "2026-03-15" },
];

export default function CompanyMembersPage() {
  const { lang } = useLanguageStore();
  const [search, setSearch] = useState("");

  const filtered = mockMembers.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "সকল সদস্য" : "All Members"}</h1>
            <p className="text-sm text-text-secondary mt-1">{mockMembers.length} {lang === "bn" ? "জন মোট সদস্য" : "total members"}</p>
          </div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field max-w-xs" placeholder={lang === "bn" ? "নাম বা আইডি দিয়ে খুঁজুন..." : "Search by name or ID..."} />
        </div>

        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-primary">ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "নাম" : "Name"}</th>
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "ফোন" : "Phone"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "লেভেল" : "Level"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "টিম" : "Team"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                  <th className="text-right p-4 text-sm font-semibold text-primary">{lang === "bn" ? "যোগদান" : "Joined"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    <td className="p-4 text-sm font-mono text-primary">{m.id}</td>
                    <td className="p-4 text-sm font-medium text-primary">{m.name}</td>
                    <td className="p-4 text-sm text-text-secondary">{m.phone}</td>
                    <td className="p-4 text-sm text-center">Level {m.level}</td>
                    <td className="p-4 text-sm text-center font-medium">{m.team}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(m.status)}`}>
                        {getStatusBadge(m.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary text-right">{formatDate(m.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

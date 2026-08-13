"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";

interface JoinedContact {
  name: string | null;
  phone: string;
  joinedName: string | null;
  hasWhatsapp: boolean;
}

interface NotJoinedContact {
  name: string | null;
  phone: string;
}

interface InviteContactsProps {
  workerId: string;
  lang?: "bn" | "en";
  redirectPath?: string;
}

export default function InviteContacts({ workerId, lang = "bn", redirectPath = "/register" }: InviteContactsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState<JoinedContact[]>([]);
  const [notJoined, setNotJoined] = useState<NotJoinedContact[]>([]);
  const [search, setSearch] = useState("");
  const [showJoined, setShowJoined] = useState(false);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/affiliate/invite-contacts?workerId=${encodeURIComponent(workerId)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await res.json() as {
        ok?: boolean;
        error?: string;
        joined?: JoinedContact[];
        notJoined?: NotJoinedContact[];
        joinedCount?: number;
        notJoinedCount?: number;
      };
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setJoined(data.joined || []);
      setNotJoined(data.notJoined || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const refLink = `${origin}${redirectPath}?ref=${workerId}`;

  const waLink = (contact: { name: string | null; phone: string }) => {
    const namePart = contact.name ? `প্রিয় ${contact.name}, ` : "";
    const msg = encodeURIComponent(
      `${namePart}🎯 Jobayer Group Career — ৯৭০+ প্রিমিয়াম রিসোর্স মাত্র ৳৯৯ থেকে!\nশেয়ার করে টাকা কমান! আমার রেফারেল: ${refLink}`
    );
    return `https://wa.me/88${contact.phone}?text=${msg}`;
  };

  const filteredNotJoined = search
    ? notJoined.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
    : notJoined;

  const totalJoined = joined.length;
  const totalNotJoined = notJoined.length;

  return (
    <Card className="mt-6">
      <h3 className="font-bold text-primary mb-1">👥 {t("Invite Your Contacts", "আপনার পরিচিতদের আমন্ত্রণ জানান")}</h3>
      <p className="text-xs text-text-secondary mb-3">
        {t("Find friends & family personally on WhatsApp — they join with your code!", "বন্ধু ও আত্মীয়দের ব্যক্তিগতভাবে WhatsApp-এ invite করুন — তারা আপনার কোডে যোগ দেবে!")}
      </p>

      {loading ? (
        <div className="py-6 text-center text-xs text-text-secondary">⏳ {t("Loading contacts...", "কন্টাক্ট লোড হচ্ছে...")}</div>
      ) : error ? (
        <div className="py-4 text-center text-xs text-red-500">
          {error}
          <button onClick={fetchContacts} className="ml-2 text-action hover:underline font-semibold cursor-pointer">{t("Retry", "আবার চেষ্টা")}</button>
        </div>
      ) : (
        <div className="space-y-4">
          {totalJoined > 0 && (
            <div className="bg-green-50 rounded-xl p-3">
              <button
                onClick={() => setShowJoined((v) => !v)}
                className="w-full flex items-center justify-between cursor-pointer"
              >
                <span className="text-xs font-bold text-green-700">
                  ✅ {t(`${totalJoined} of your contacts already joined`, `${totalJoined} জন আপনার পরিচিত ইতিমধ্যেই জয়েন করেছেন`)}
                </span>
                <span className="text-green-600 text-xs">{showJoined ? "▲" : "▼"}</span>
              </button>
              {showJoined && (
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {joined.map((c) => (
                    <div key={c.phone} className="flex items-center justify-between text-xs text-green-800 py-0.5">
                      <span className="truncate">{c.name || c.phone}</span>
                      <span className="shrink-0 text-green-600 ml-2">{c.joinedName ? `${c.joinedName} হিসেবে` : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-amber-50 rounded-xl p-3">
            <p className="text-xs font-bold text-amber-700 mb-2">
              📲 {t(`${totalNotJoined} contacts not joined yet — invite them personally!`, `${totalNotJoined} জন কন্টাক্ট এখনো জয়েন করেনি — ব্যক্তিগতভাবে invite করুন!`)}
            </p>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search name or phone...", "নাম বা ফোন খুঁজুন...")}
              className="w-full mb-2 px-3 py-2 rounded-lg border border-amber-200 bg-white text-xs text-primary focus:outline-none focus:ring-2 focus:ring-amber-300"
            />

            <div className="space-y-1 max-h-72 overflow-y-auto">
              {filteredNotJoined.length === 0 ? (
                <p className="text-xs text-amber-600 text-center py-3">{t("No contacts to invite.", "Invite করার মতো কন্টাক্ট নেই।")}</p>
              ) : (
                filteredNotJoined.slice(0, 100).map((c) => (
                  <div key={c.phone} className="flex items-center gap-2">
                    <span className="flex-1 truncate text-xs text-amber-900">{c.name || c.phone}</span>
                    <a
                      href={waLink(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-[10px] font-bold cursor-pointer hover:opacity-90"
                    >
                      📲 {t("Invite", "Invite")}
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="mt-2 text-[10px] text-amber-600">
              {t("Need more contacts? Sync your phonebook first.", "আরও কন্টাক্ট দরকার? আগে আপনার ফোনবুক সিঙ্ক করুন।")}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

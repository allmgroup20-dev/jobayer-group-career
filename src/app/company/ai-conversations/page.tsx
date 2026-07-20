"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

interface Conversation {
  phone: string;
  summary: string;
  language: string;
  source: string;
  message_count: number;
  updated_at: string;
}

interface Message {
  role: string;
  content: string;
}

interface ConversationDetail {
  id: number;
  phone: string;
  messages: Message[];
  summary: string;
  language: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export default function AIConversationsPage() {
  const { lang } = useLanguageStore();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);

  async function loadConversations() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/conversations");
      const data: { conversations?: Conversation[] } = await res.json();
      if (data.conversations) setConvs(data.conversations);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadConversations(); }, []);

  async function loadDetail(phone: string) {
    setSelectedPhone(phone);
    setDetailLoading(true);
    setDetail([]);
    try {
      const res = await fetch(`/api/ai/conversations?phone=${encodeURIComponent(phone)}`);
      const data: { conversations?: ConversationDetail[] } = await res.json();
      if (data.conversations) setDetail(data.conversations);
    } catch {}
    setDetailLoading(false);
  }

  const filtered = convs.filter((c) =>
    c.phone.includes(search) || c.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-primary mb-1">
        {lang === "bn" ? "কথোপকথন সমূহ" : "Conversations"}
      </h1>
      <p className="text-xs text-text-secondary mb-4">
        {lang === "bn" ? "সকল এআই কথোপকথন দেখুন এবং পড়ুন" : "View and read all AI conversations"}
      </p>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "bn" ? "ফোন বা বিষয় দিয়ে খুঁজুন..." : "Search by phone or topic..."}
          className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button onClick={loadConversations} className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-xl hover:bg-primary/90">
          {lang === "bn" ? "🔄 রিফ্রেশ" : "🔄 Refresh"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {loading ? (
            <Skeleton className="h-4 w-32 mx-auto" />
          ) : filtered.length === 0 ? (
            <div className="text-text-secondary text-sm py-12 text-center">
              {lang === "bn" ? "কোনো কথোপকথন নেই" : "No conversations found"}
            </div>
          ) : (
            <>
              {filtered.slice(0, showAll ? filtered.length : 50).map((c, i) => (
                <div
                  key={i}
                  onClick={() => loadDetail(c.phone)}
                  className={`card p-3 cursor-pointer transition-all hover:shadow-md ${selectedPhone === c.phone ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-primary">{c.phone}</span>
                    <span className="text-xs text-text-secondary">{new Date(c.updated_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 mb-1">{c.summary}</p>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span>{c.message_count || "?"} msg</span>
                    <span>|</span>
                    <span>{c.language || "bn"}</span>
                    {c.source && <><span>|</span><span>{c.source}</span></>}
                  </div>
                </div>
              ))}
              {!showAll && filtered.length > 50 && (
                <button onClick={() => setShowAll(true)} className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {lang === "bn" ? `আরও ${filtered.length - 50}টি দেখুন` : `Show ${filtered.length - 50} more`}
                </button>
              )}
            </>
          )}
        </div>

        <div>
          {!selectedPhone ? (
            <div className="text-text-secondary text-sm py-12 text-center">
              {lang === "bn" ? "বাম থেকে একটি কথোপকথন নির্বাচন করুন" : "Select a conversation from the left"}
            </div>
          ) : detailLoading ? (
            <div className="text-text-secondary text-sm py-12 text-center">Loading messages...</div>
          ) : detail.length === 0 ? (
            <div className="text-text-secondary text-sm py-12 text-center">
              {lang === "bn" ? "কোনো মেসেজ নেই" : "No messages"}
            </div>
          ) : (
            <div className="space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="text-xs text-text-secondary mb-2 font-medium">
                {lang === "bn" ? `ফোন: ${detail[0].phone}` : `Phone: ${detail[0].phone}`}
                {detail[0].summary && <span className="ml-2">| {detail[0].summary}</span>}
              </div>
              {detail.flatMap((conv) => conv.messages).slice(0, showAllMessages ? undefined : 30).map((msg, j) => (
                <div key={j} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-gray-100 text-gray-800 rounded-bl-md"
                      : "bg-primary/10 text-primary rounded-br-md"
                  }`}>
                    <div className="text-xs font-medium mb-1 opacity-60">
                      {msg.role === "user" ? (lang === "bn" ? "ব্যবহারকারী" : "User") : (lang === "bn" ? "AI" : "Assistant")}
                    </div>
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  </div>
                </div>
              ))}
              {!showAllMessages && detail.reduce((sum, c) => sum + c.messages.length, 0) > 30 && (
                <button onClick={() => setShowAllMessages(true)} className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {lang === "bn" ? `আরও ${detail.reduce((sum, c) => sum + c.messages.length, 0) - 30}টি মেসেজ দেখুন` : `Show ${detail.reduce((sum, c) => sum + c.messages.length, 0) - 30} more messages`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

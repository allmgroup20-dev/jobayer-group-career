"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type GoogleContact = { name: string; phone: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (contacts: { name: string; tel: string }[]) => void;
  busy?: boolean;
  alreadyAdded?: Set<string>;
};

const CONTACTS_SCOPE = "https://www.googleapis.com/auth/contacts.readonly";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

export default function ContactsModal({ open, onClose, onPick, busy, alreadyAdded }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "list" | "fallback" | "denied">("idle");
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const googleRef = useRef<{ clientId: string }>({ clientId: "" });

  const fetchTokenAndContacts = useCallback(async () => {
    setState("loading");
    try {
      let gid = googleRef.current.clientId;
      if (!gid) {
        const cfg = await fetch("/api/auth/config").then((r) => r.json() as { googleClientId?: string }).catch(() => ({} as { googleClientId?: string }));
        gid = cfg.googleClientId || "";
        googleRef.current.clientId = gid;
      }
      if (!gid) { setState("fallback"); setErrMsg("no-client"); return; }
      await loadScript("https://accounts.google.com/gsi/client");

      const google = (window as any).google;
      if (!google?.accounts?.oauth2) { setState("fallback"); setErrMsg("no-gsi"); return; }

      const accessToken = await new Promise<string>((resolve, reject) => {
        try {
          const client = google.accounts.oauth2.initTokenClient({
            client_id: gid,
            scope: CONTACTS_SCOPE,
            callback: (resp: { access_token?: string; error?: string }) => {
              if (resp.access_token) resolve(resp.access_token);
              else reject(new Error(resp.error || "no_token"));
            },
          });
          client.requestAccessToken();
        } catch (e) {
          reject(e as Error);
        }
      });

      const res = await fetch(`/api/contacts`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        // Google verification 403 or access_denied -> show specific help
        if (String(errData.error || "").includes("403") || String(errData.error || "").includes("verification") || res.status === 403) {
          setState("fallback");
          setErrMsg("verification");
          return;
        }
        setState("fallback");
        return;
      }
      const data = await res.json() as { contacts?: GoogleContact[]; fallback?: boolean; error?: string };
      if (data.fallback || !data.contacts) {
        if (String(data.error || "").includes("403") || String(data.error || "").includes("verification")) {
          setErrMsg("verification");
        }
        setState("fallback");
        return;
      }
      const unique: GoogleContact[] = [];
      const seen = new Set<string>();
      for (const c of data.contacts) {
        if (!c.phone || seen.has(c.phone)) continue;
        seen.add(c.phone);
        unique.push(c);
      }
      setContacts(unique);
      setSelected(new Set());
      setErrMsg("");
      setState("list");
    } catch {
      setState("denied");
    }
  }, []);

  // Token holder: initTokenClient callback captures the token here for the
  // /api/contacts call. Kept at module scope so the callback can write it.
  useEffect(() => {
    if (!open) return;
    setSearch("");
    fetchTokenAndContacts();
  }, [open, fetchTokenAndContacts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [contacts, search]);

  const allInFilter = filtered.every((c) => selected.has(c.phone));
  const toggleAll = () => {
    if (allInFilter) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const c of filtered) next.delete(c.phone);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const c of filtered) next.add(c.phone);
        return next;
      });
    }
  };

  const toggleOne = (phone: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  };

  const submit = () => {
    const picked = contacts
      .filter((c) => selected.has(c.phone))
      .map((c) => ({ name: c.name, tel: c.phone }));
    if (picked.length === 0) return;
    onPick(picked);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-[rgba(2,6,23,0.6)] backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white border border-line rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-line">
          <div>
            <h3 className="text-base font-black text-[#0B1F33]">📇 {busy ? "যোগ হচ্ছে…" : "আপনার পছন্দের মানুষ"}</h3>
            <p className="text-[11px] text-ink-soft mt-0.5">সার্চ করে বেছে নিন — চাইলে সবাইকে একসাথে</p>
          </div>
          <button onClick={onClose} disabled={busy} className="w-9 h-9 rounded-xl bg-slate-100 text-ink-soft font-black hover:bg-slate-200 disabled:opacity-50">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {state === "loading" && (
            <div className="py-12 text-center">
              <div className="mx-auto w-9 h-9 border-4 border-pink/20 border-t-pink rounded-full animate-spin" />
              <p className="mt-4 text-xs text-ink-soft">Google থেকে আপনার মানুষদের আনা হচ্ছে…</p>
            </div>
          )}

          {state === "denied" && (
            <div className="py-10 text-center">
              <div className="text-4xl">🔐</div>
              <p className="mt-3 text-sm font-bold text-[#0B1F33]">অনুমতি দেওয়া হয়নি</p>
              <p className="mt-1 text-xs text-ink-soft">আপনার মানুষদের দেখতে Google অনুমতি দিন, তারপর আবার চেষ্টা করুন।</p>
              <button onClick={fetchTokenAndContacts} className="mt-4 px-5 py-2.5 rounded-xl btn-excite text-sm font-black">
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {state === "fallback" && (
            <div className="py-10 text-center">
              <div className="text-4xl">📲</div>
              <p className="mt-3 text-sm font-bold text-[#0B1F33]">
                {errMsg === "verification" ? "Google যাচাইকরণ বাকি — অ্যাক্সেস ব্লক" : "Google থেকে মানুষ পাওয়া যায়নি"}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                {errMsg === "verification"
                  ? "earner.workers.dev এখনো Google verification সম্পন্ন করেনি — অ্যাপটি Testing মোডে আছে, শুধু অনুমোদিত tester-রা প্রবেশ করতে পারে। আপনি যদি tester হন, Developer (allmgroup20@gmail.com) কে আপনার Gmail Test users-এ যোগ করতে বলুন। অথবা নিচের ফোনবুক/হাতে লেখা উপায়ে আমন্ত্রণ জানান। বিস্তারিত: Privacy Policy দেখুন।"
                  : "হয় Google-এ সাময়িক সমস্যা বা আপনার পছন্দের মানুষগুলো Google-এ নেই। চিন্তা নেই — পেজে ফিরে নিচের বাটন দিয়ে ফোনবুক/সিম থেকে খুঁজে নিন, অথবা বন্ধুর নাম্বার লিখে যোগ করুন।"}
              </p>
              {errMsg === "verification" && (
                <a href="/privacy" className="mt-3 inline-block text-xs font-bold text-teal underline">
                  Privacy Policy দেখুন
                </a>
              )}
              <button onClick={onClose} className="mt-4 px-5 py-2.5 rounded-xl bg-slate-100 text-brand text-sm font-black hover:bg-slate-200">
                ঠিক আছে
              </button>
            </div>
          )}

          {state === "list" && (
            <>
              {errMsg && (
                <p className="mb-3 text-[11px] font-bold text-warning">
                  {errMsg.startsWith("no-")
                    ? "Google সংযোগ একটু অস্থির ছিল — তালিকা লোড হয়েছে, চাইলে আবার চেষ্টা করতে পারেন।"
                    : errMsg}
                </p>
              )}

              {/* Search */}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 নাম বা নম্বর দিয়ে খুঁজুন…"
                className="input-field"
              />

              {/* Select all */}
              <button
                onClick={toggleAll}
                className="mt-3 w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-line active:scale-[0.99] transition-all"
              >
                <span className="flex items-center gap-2 text-sm font-black text-[#0B1F33]">
                  <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs ${allInFilter ? "bg-teal border-teal text-white" : "border-slate-400"}`}>
                    {allInFilter ? "✓" : ""}
                  </span>
                  ✓ সব বেছে নিন
                </span>
                <span className="text-[11px] font-bold text-ink-soft">দেখানো: {filtered.length} • বেছে নেওয়া: {selected.size}</span>
              </button>

              {/* Counter */}
              <div className="mt-3 px-3 py-2 rounded-xl bg-teal/10 border border-teal/20 text-[11px] font-bold text-teal">
                {selected.size > 0
                  ? `✅ ${selected.size} জন বেছে নিয়েছেন — যতজন চান, সবই পারবেন!`
                  : `অল্প কয়েকজন বেছে নিন — আমন্ত্রণ জানালে আপনার পার্সেন্টেজ বাড়বে!`}
              </div>

              {/* List */}
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted">কাউকে পাওয়া যায়নি।</p>
              ) : (
                <div className="mt-3 space-y-1.5 pb-2">
                  {filtered.map((c) => {
                    const isOn = selected.has(c.phone);
                    const isAdded = alreadyAdded?.has(c.phone);
                    return (
                      <button
                        key={c.phone}
                        onClick={() => toggleOne(c.phone)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-line text-left active:bg-slate-100 transition-all"
                      >
                        <span className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center text-xs ${isOn ? "bg-teal border-teal text-white" : "border-slate-400"}`}>
                          {isOn ? "✓" : ""}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-bold text-slate-900 truncate">{c.name || "নাম নেই"}</span>
                          <span className="block text-[10px] text-ink-soft font-mono">+{c.phone}</span>
                        </span>
                        {isAdded && <span className="shrink-0 px-2 py-1 rounded-md bg-slate-200 text-[10px] font-bold text-ink-soft">✓ আগেই যুক্ত</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {state === "list" && (
          <div className="px-5 py-3 border-t border-line space-y-2">
            <button
              onClick={() => {
                const allPhones = filtered.map((c) => c.phone);
                setSelected(new Set(allPhones));
                const picked = filtered.map((c) => ({ name: c.name, tel: c.phone }));
                if (picked.length) onPick(picked);
              }}
              disabled={busy || filtered.length === 0}
              className="w-full py-3 rounded-2xl bg-teal text-white text-sm font-black hover:bg-teal/90 active:scale-[0.99] transition-all disabled:opacity-40"
            >
              ⚡ এক ক্লিকে সব ({filtered.length} জন) — একবারে সব
            </button>
            <button
              onClick={submit}
              disabled={selected.size === 0 || busy}
              className="w-full py-3.5 rounded-2xl bg-excite text-white text-sm font-black hover:bg-excite-light active:scale-[0.99] transition-all disabled:opacity-40"
            >
              {busy ? "যোগ হচ্ছে…" : `✅ ${selected.size} জনকে আমন্ত্রণ জানান`}
            </button>
            {selected.size > 0 && (
              <p className="text-center text-[11px] text-muted">এখন যা বেছে নিলেন তা-ই যোগ হবে — পরে আরও যোগ করতে পারবেন</p>
            )}
            <p className="text-center text-[11px] text-ink-soft">সব দেখানো হবে, WhatsApp নম্বর উপরে থাকবে</p>
          </div>
        )}
      </div>
    </div>
  );
}
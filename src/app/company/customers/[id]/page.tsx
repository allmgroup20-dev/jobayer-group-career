"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";

interface C360Data {
  worker: any;
  interests: { categoryScores: Record<string, number>; topCategories: string[]; lastCalculatedAt: string } | null;
  behavior: any;
  sessions: any[];
  recentEvents: any[];
  searches: any[];
  orders: any[];
  devices: any[];
  reviews: any[];
  communications: any[];
  attributions: any[];
}

const tabs = ["overview", "events", "sessions", "searches", "orders", "devices", "reviews", "comms", "attribution"];

export default function Customer360Page() {
  const { lang } = useLanguageStore();
  const params = useParams();
  const workerId = params.id as string;
  const [data, setData] = useState<C360Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!workerId) return;
    setLoading(true);
    fetch(`/api/customer360/${workerId}`)
      .then(r => r.json())
      .then((d: any) => setData(d as C360Data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workerId]);

  if (loading) return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  );

  if (!data?.worker) return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center py-12 text-red-500">
        {lang === "bn" ? "গ্রাহক পাওয়া যায়নি" : "Customer not found"}
      </div>
    </div>
  );

  const w = data.worker;
  const segmentColors: Record<string, string> = {
    vip: "bg-purple-100 text-purple-700 border-purple-200",
    active: "bg-green-100 text-green-700 border-green-200",
    new: "bg-blue-100 text-blue-700 border-blue-200",
    at_risk: "bg-orange-100 text-orange-700 border-orange-200",
    churned: "bg-red-100 text-red-700 border-red-200",
  };

  const segClass = segmentColors[data.behavior?.segment] || "bg-gray-100 text-gray-600 border-gray-200";

  const formatDate = (d: string) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleString(lang === "bn" ? "bn-BD" : "en-US"); } catch { return d; }
  };

  const scoreBar = (label: string, val: number | null) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-secondary w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(val ?? 0, 100)}%`, background: (val ?? 0) > 70 ? "#22c55e" : (val ?? 0) > 40 ? "#eab308" : "#ef4444" }} />
      </div>
      <span className="text-xs font-medium w-8 text-right">{val ?? 0}</span>
    </div>
  );

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;

  const TabButton = ({ id, label }: { id: string; label: string }) => (
    <button onClick={() => setActiveTab(id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === id ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:bg-primary/5"}`}>{label}</button>
  );

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/company/customers" className="text-primary hover:underline">{t("Customers", "গ্রাহক")}</Link>
          <span className="text-text-secondary">/</span>
          <span className="text-text-secondary truncate">{w.name}</span>
        </div>

        {/* Profile Header */}
        <Card className="!p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-16 h-16 rounded-full gradient-premium flex items-center justify-center text-white font-bold text-xl shrink-0 shadow">
              {w.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-primary truncate">{w.name}</h1>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${segClass}`}>
                  {data.behavior?.segment || t("new", "নতুন")}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-secondary">
                <span>📞 {w.phone}</span>
                {w.email && <span>✉️ {w.email}</span>}
                <span>🆔 {w.worker_id}</span>
                <span>📅 {t("Joined", "যোগদান")}: {w.join_date ? new Date(w.join_date).toLocaleDateString() : "—"}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {w.preferred_language && <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{t("Lang", "ভাষা")}: {w.preferred_language}</span>}
                {w.age_group && <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{t("Age", "বয়স")}: {w.age_group}</span>}
                {w.occupation && <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{t("Occ", "পেশা")}: {w.occupation}</span>}
                {w.education_level && <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{t("Edu", "শিক্ষা")}: {w.education_level}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-primary">{w.total_spent ?? 0} ৳</div>
              <div className="text-xs text-text-secondary">{t("Total Spent", "মোট ব্যয়")}</div>
              <div className="text-sm font-medium text-green-600 mt-1">{w.total_earned ?? 0} ৳ {t("earned", "আয়")}</div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <TabButton id="overview" label={t("Overview", "ওভারভিউ")} />
          <TabButton id="events" label={t("Events", "ইভেন্ট")} />
          <TabButton id="sessions" label={t("Sessions", "সেশন")} />
          <TabButton id="searches" label={t("Searches", "অনুসন্ধান")} />
          <TabButton id="orders" label={t("Orders", "অর্ডার")} />
          <TabButton id="devices" label={t("Devices", "ডিভাইস")} />
          <TabButton id="reviews" label={t("Reviews", "রিভিউ")} />
          <TabButton id="comms" label={t("Comms", "যোগাযোগ")} />
          <TabButton id="attribution" label={t("Attribution", "অ্যাট্রিবিউশন")} />
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scores */}
            <Card className="!p-5">
              <h3 className="font-semibold text-sm text-primary mb-4">{t("Behavior Scores", "আচরণ স্কোর")}</h3>
              <div className="space-y-3">
                {scoreBar(t("Lead Score", "লিড স্কোর"), data.behavior?.lead_score)}
                {scoreBar(t("Churn Risk", "চার্ন রিস্ক"), data.behavior?.churn_probability)}
                {scoreBar(t("Purchase Intent", "ক্রয় আগ্রহ"), data.behavior?.purchase_intent)}
              </div>
              {data.behavior && (
                <div className="mt-4 pt-4 border-t border-border space-y-1 text-xs text-text-secondary">
                  <div className="flex justify-between"><span>RFM R</span><span>{data.behavior.rfm_recency}</span></div>
                  <div className="flex justify-between"><span>RFM F</span><span>{data.behavior.rfm_frequency}</span></div>
                  <div className="flex justify-between"><span>RFM M</span><span>{data.behavior.rfm_monetary} ৳</span></div>
                  <div className="flex justify-between"><span>{t("LTV", "এলটিভি")}</span><span>{data.behavior.lifetime_value} ৳</span></div>
                </div>
              )}
            </Card>

            {/* Interests */}
            <Card className="!p-5">
              <h3 className="font-semibold text-sm text-primary mb-4">{t("Interest Categories", "আগ্রহের বিভাগ")}</h3>
              {data.interests && Object.keys(data.interests.categoryScores).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(data.interests.categoryScores)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 10)
                    .map(([cat, score]) => (
                      <div key={cat} className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary flex-1 truncate">{cat.replace(/_/g, " ")}</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(Number(score), 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium w-6 text-right">{String(score)}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-text-secondary">{t("No interest data yet", "এখনো কোনো আগ্রহের তথ্য নেই")}</p>
              )}
              {data.interests?.lastCalculatedAt && (
                <p className="text-xs text-text-secondary mt-3">{t("Last calculated", "শেষ গণনা")}: {formatDate(data.interests.lastCalculatedAt)}</p>
              )}
            </Card>

            {/* Recent Events */}
            <Card className="!p-5">
              <h3 className="font-semibold text-sm text-primary mb-4">{t("Recent Activity", "সাম্প্রতিক কার্যকলাপ")}</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {data.recentEvents.slice(0, 15).map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`inline-block w-2 h-2 rounded-full ${e.event_type === "purchase" ? "bg-green-500" : e.event_type === "page_view" ? "bg-blue-500" : "bg-yellow-500"}`} />
                    <span className="text-text-secondary capitalize">{e.event_type?.replace(/_/g, " ")}</span>
                    {e.page_category && <span className="text-text-secondary">· {e.page_category}</span>}
                    <span className="text-gray-400 ml-auto">{formatDate(e.created_at)}</span>
                  </div>
                ))}
                {data.recentEvents.length === 0 && <p className="text-xs text-text-secondary">{t("No events yet", "কোনো ইভেন্ট নেই")}</p>}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="!p-5">
              <h3 className="font-semibold text-sm text-primary mb-4">{t("Quick Stats", "দ্রুত পরিসংখ্যান")}</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t("Total Events", "মোট ইভেন্ট"), val: data.recentEvents.length },
                  { label: t("Sessions", "সেশন"), val: data.sessions.length },
                  { label: t("Searches", "অনুসন্ধান"), val: data.searches.length },
                  { label: t("Orders", "অর্ডার"), val: data.orders.length },
                  { label: t("Devices", "ডিভাইস"), val: data.devices.length },
                  { label: t("Reviews", "রিভিউ"), val: data.reviews.length },
                  { label: t("Comms", "যোগাযোগ"), val: data.communications.length },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-primary">{s.val}</div>
                    <div className="text-xs text-text-secondary">{s.label}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* MLM / Sponsor */}
            <Card className="!p-5">
              <h3 className="font-semibold text-sm text-primary mb-4">{t("Network Info", "নেটওয়ার্ক তথ্য")}</h3>
              <div className="space-y-2 text-sm">
                {w.sponsor_id ? <div className="flex justify-between"><span className="text-text-secondary">{t("Sponsor", "স্পনসর")}</span><span>{w.sponsor_name || w.sponsor_id}</span></div> : null}
                <div className="flex justify-between"><span className="text-text-secondary">{t("Level", "লেভেল")}</span><span>{w.level ?? 1}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">{t("Associates", "সহযোগী")}</span><span>{w.total_team_members ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">{t("Balance", "ব্যালেন্স")}</span><span>{w.balance ?? 0} ৳</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">{t("Status", "স্ট্যাটাস")}</span><span className="capitalize">{w.membership_status}</span></div>
              </div>
            </Card>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <Card className="!p-5">
            <h3 className="font-semibold text-sm text-primary mb-4">{t("Event History", "ইভেন্ট ইতিহাস")} ({data.recentEvents.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-2 font-semibold text-text-secondary">{t("Type", "ধরন")}</th>
                    <th className="p-2 font-semibold text-text-secondary">{t("Page", "পৃষ্ঠা")}</th>
                    <th className="p-2 font-semibold text-text-secondary hidden md:table-cell">{t("Category", "ক্যাটাগরি")}</th>
                    <th className="p-2 font-semibold text-text-secondary">{t("Time", "সময়")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentEvents.map((e: any, i: number) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2 capitalize">{e.event_type?.replace(/_/g, " ")}</td>
                      <td className="p-2 max-w-[200px] truncate text-text-secondary">{e.page_url || "—"}</td>
                      <td className="p-2 text-text-secondary hidden md:table-cell">{e.page_category || "—"}</td>
                      <td className="p-2 text-text-secondary text-xs">{formatDate(e.created_at)}</td>
                    </tr>
                  ))}
                  {data.recentEvents.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-text-secondary">{t("No events", "কোনো ইভেন্ট নেই")}</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.sessions.map((s: any, i: number) => (
              <Card key={i} className="!p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{s.device_type === "mobile" ? "📱" : s.device_type === "tablet" ? "📟" : "💻"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-primary capitalize">{s.device_type || t("Unknown", "অজানা")}</span>
                      {s.duration_seconds && (
                        <span className="text-xs text-text-secondary">{Math.round(s.duration_seconds / 60)}m {s.duration_seconds % 60}s</span>
                      )}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {[s.browser, s.os, s.screen_resolution].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  <a
                    href={`/company/sessions`}
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    {t("Details", "বিস্তারিত")} →
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-text-secondary">{t("Start", "শুরু")}</span>
                    <div className="font-medium text-primary truncate">{formatDate(s.session_start)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-text-secondary">{t("Referrer", "রেফারার")}</span>
                    <div className="font-medium text-primary truncate">{s.referrer || "—"}</div>
                  </div>
                  {s.city && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-text-secondary">{t("Location", "অবস্থান")}</span>
                      <div className="font-medium text-primary truncate">{s.city}{s.country ? `, ${s.country}` : ""}</div>
                    </div>
                  )}
                  {s.utm_source && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-text-secondary">UTM</span>
                      <div className="font-medium text-primary truncate">{s.utm_source}{s.utm_campaign ? ` / ${s.utm_campaign}` : ""}</div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {data.sessions.length === 0 && (
              <div className="col-span-full text-center py-8 text-text-secondary">{t("No sessions", "কোনো সেশন নেই")}</div>
            )}
          </div>
        )}

        {/* Searches Tab */}
        {activeTab === "searches" && (
          <Card className="!p-5">
            <h3 className="font-semibold text-sm text-primary mb-4">{t("Search History", "অনুসন্ধানের ইতিহাস")} ({data.searches.length})</h3>
            <div className="space-y-2">
              {data.searches.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                  <span className="text-text-secondary">🔍</span>
                  <span className="font-medium text-primary">{s.search_query}</span>
                  <span className="text-xs text-text-secondary capitalize">({s.search_type || "general"})</span>
                  <span className="text-xs text-gray-400 ml-auto">{formatDate(s.created_at)}</span>
                </div>
              ))}
              {data.searches.length === 0 && <p className="text-center text-text-secondary py-4">{t("No searches", "কোনো অনুসন্ধান নেই")}</p>}
            </div>
          </Card>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <Card className="!p-5">
            <h3 className="font-semibold text-sm text-primary mb-4">{t("Order History", "অর্ডারের ইতিহাস")} ({data.orders.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-2 font-semibold text-text-secondary">{t("Product", "পণ্য")}</th>
                    <th className="p-2 font-semibold text-text-secondary">{t("Amount", "পরিমাণ")}</th>
                    <th className="p-2 font-semibold text-text-secondary">{t("Status", "স্ট্যাটাস")}</th>
                    <th className="p-2 font-semibold text-text-secondary">{t("Payment", "পেমেন্ট")}</th>
                    <th className="p-2 font-semibold text-text-secondary hidden md:table-cell">{t("Date", "তারিখ")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((o: any, i: number) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2">{o.product_name || `#${o.product_id}`}</td>
                      <td className="p-2 font-medium">{o.total_amount} {o.currency || "৳"}</td>
                      <td className="p-2"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${o.order_status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{o.order_status}</span></td>
                      <td className="p-2 capitalize text-text-secondary">{o.payment_status}</td>
                      <td className="p-2 text-text-secondary text-xs hidden md:table-cell">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                  {data.orders.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-text-secondary">{t("No orders", "কোনো অর্ডার নেই")}</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Devices Tab */}
        {activeTab === "devices" && (
          <Card className="!p-5">
            <h3 className="font-semibold text-sm text-primary mb-4">{t("Known Devices", "পরিচিত ডিভাইস")} ({data.devices.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.devices.map((d: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{d.device_type === "mobile" ? "📱" : d.device_type === "tablet" ? "📟" : "💻"}</span>
                    <span className="font-medium text-primary capitalize">{d.device_type || t("Unknown", "অজানা")}</span>
                    {d.is_active ? <span className="ml-auto text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">{t("Active", "সক্রিয়")}</span> : null}
                  </div>
                  <div className="space-y-1 text-xs text-text-secondary">
                    <div>{d.browser} · {d.os}</div>
                    {d.city && <div>📍 {d.city}{d.country ? `, ${d.country}` : ""}</div>}
                    {d.last_seen_at && <div>{t("Last seen", "শেষ দেখা")}: {formatDate(d.last_seen_at)}</div>}
                  </div>
                </div>
              ))}
              {data.devices.length === 0 && <div className="col-span-full text-center py-4 text-text-secondary">{t("No devices", "কোনো ডিভাইস নেই")}</div>}
            </div>
          </Card>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <Card className="!p-5">
            <h3 className="font-semibold text-sm text-primary mb-4">{t("Product Reviews", "পণ্য রিভিউ")} ({data.reviews.length})</h3>
            <div className="space-y-3">
              {data.reviews.map((r: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-primary">{r.product_id || `#${r.product_id}`}</span>
                    <span className="text-xs text-text-secondary capitalize">({r.product_type})</span>
                    <span className="ml-auto text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.review_text && <p className="text-sm text-text-secondary mt-1">{r.review_text}</p>}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(r.created_at)}</p>
                </div>
              ))}
              {data.reviews.length === 0 && <p className="text-center py-4 text-text-secondary">{t("No reviews", "কোনো রিভিউ নেই")}</p>}
            </div>
          </Card>
        )}

        {/* Communications Tab */}
        {activeTab === "comms" && (
          <Card className="!p-5">
            <h3 className="font-semibold text-sm text-primary mb-4">{t("Communication History", "যোগাযোগের ইতিহাস")} ({data.communications.length})</h3>
            <div className="space-y-2">
              {data.communications.map((c: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-lg mt-0.5">{c.channel === "whatsapp" ? "💬" : c.channel === "email" ? "📧" : "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium capitalize text-primary">{c.channel}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.direction === "inbound" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {c.direction}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.status === "sent" || c.status === "delivered" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {c.status}
                      </span>
                    </div>
                    {c.message && <p className="text-xs text-text-secondary mt-1 truncate">{c.message}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(c.sent_at || c.created_at)}</p>
                  </div>
                </div>
              ))}
              {data.communications.length === 0 && <p className="text-center py-4 text-text-secondary">{t("No communications", "কোনো যোগাযোগ নেই")}</p>}
            </div>
          </Card>
        )}

        {/* Attribution Tab */}
        {activeTab === "attribution" && (
          <Card className="!p-5">
            <h3 className="font-semibold text-sm text-primary mb-4">{t("Attribution History", "অ্যাট্রিবিউশন ইতিহাস")} ({data.attributions.length})</h3>
            <div className="space-y-2">
              {data.attributions.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                  <span className="text-lg">{a.channel === "facebook" ? "📘" : a.channel === "google" ? "🔍" : a.channel === "referral" ? "🔗" : "🌐"}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary capitalize">{a.channel}</span>
                      {a.utm_campaign && <span className="text-xs text-text-secondary">· {a.utm_campaign}</span>}
                      {a.converted ? <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">{t("Converted", "কনভার্টেড")}</span> : null}
                    </div>
                    {a.landing_page && <p className="text-xs text-text-secondary truncate">{a.landing_page}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.created_at)}</p>
                  </div>
                </div>
              ))}
              {data.attributions.length === 0 && <p className="text-center py-4 text-text-secondary">{t("No attribution data", "কোনো অ্যাট্রিবিউশন তথ্য নেই")}</p>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

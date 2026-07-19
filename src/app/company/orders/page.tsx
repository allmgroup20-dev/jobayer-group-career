"use client";

import { useState, useMemo } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSWRFetch } from "@/lib/use-swr-fetch";
import { Skeleton } from "@/components/ui/Skeleton";

interface Order {
  order_id: string; worker_id: string; product_id: number | null;
  product_name: string | null; quantity: number; total_amount: number;
  currency: string; payment_method: string | null; payment_status: string;
  commission_status: string; order_status: string; shipping_address: string | null;
  transaction_id: string | null; created_at: string; delivery_notes: string | null;
  worker_name: string | null; worker_phone: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  with_courier: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  payment_received: "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
  return_requested: "bg-orange-100 text-orange-700",
  return_received: "bg-rose-100 text-rose-700",
};

const COD_STAGES = [
  { status: "processing", label: "📦 প্রসেসিং", labelEn: "Processing", icon: "📦" },
  { status: "with_courier", label: "🚚 কুরিয়ারে পাঠান", labelEn: "Send to Courier", icon: "🚚" },
  { status: "delivered", label: "🏠 ডেলিভারি সম্পন্ন", labelEn: "Delivered", icon: "🏠" },
  { status: "payment_received", label: "💰 পেমেন্ট প্রাপ্ত", labelEn: "Payment Received", icon: "💰" },
  { status: "completed", label: "✅ সম্পন্ন", labelEn: "Completed", icon: "✅" },
];

const RETURN_STAGES = [
  { status: "return_requested", label: "↩️ রিটার্ন রিকোয়েস্ট", labelEn: "Return Requested", icon: "↩️" },
  { status: "return_received", label: "📥 রিটার্ন প্রাপ্ত", labelEn: "Return Received", icon: "📥" },
];

const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "shipped", "with_courier",
  "delivered", "payment_received", "completed", "cancelled",
  "return_requested", "return_received",
];

function getNextStage(current: string): string | null {
  const codIndex = COD_STAGES.findIndex(s => s.status === current);
  if (codIndex >= 0 && codIndex < COD_STAGES.length - 1) return COD_STAGES[codIndex + 1].status;
  if (current === "delivered" || current === "payment_received") return "return_requested";
  if (current === "return_requested") return "return_received";
  return null;
}

export default function CompanyOrdersPage() {
  const { lang } = useLanguageStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState("");
  const [payFilter, setPayFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const limit = 20;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (debouncedSearch) params.set("search", debouncedSearch);
  if (statusFilter) params.set("status", statusFilter);
  if (payFilter) params.set("paymentStatus", payFilter);
  const { data, loading, refresh } = useSWRFetch<{ orders?: Order[]; total?: number }>(
    `/api/company/orders?${params}`,
    { ttlMs: 180_000 }
  );
  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const orderStatusCounts = useMemo(() => ({
    pending: orders.filter(o => o.order_status === "pending").length,
    processing: orders.filter(o => o.order_status === "processing").length,
    with_courier: orders.filter(o => o.order_status === "with_courier").length,
    delivered: orders.filter(o => o.order_status === "delivered").length,
    payment_received: orders.filter(o => o.order_status === "payment_received").length,
    return_requested: orders.filter(o => o.order_status === "return_requested").length,
  }), [orders]);

  const updateOrder = async (orderId: string, updates: Record<string, string>) => {
    setUpdating(orderId);
    try {
      await fetch("/api/company/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...updates }),
      });
      refresh();
    } catch {} finally { setUpdating(null); }
  };

  const isCod = (o: Order) => o.payment_method === "cod";
  const isSsl = (o: Order) => o.payment_method === "sslcommerz";

  const terminalStatuses = ["completed", "cancelled", "failed", "return_received"];

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "অর্ডার ম্যানেজমেন্ট" : "Order Management"}</h1>
            <p className="text-sm text-text-secondary mt-1">{total} {lang === "bn" ? "টি অর্ডার" : "orders total"}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder={lang === "bn" ? "অর্ডার/গ্রাহক সার্চ..." : "Search order/customer..."}
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-action/30" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl border border-border bg-white text-sm">
            <option value="">{lang === "bn" ? "সব স্ট্যাটাস" : "All Status"}</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={payFilter} onChange={e => { setPayFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl border border-border bg-white text-sm">
            <option value="">{lang === "bn" ? "সব পেমেন্ট" : "All Payment"}</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: lang === "bn" ? "মোট" : "Total", count: total, color: "text-primary" },
            { label: lang === "bn" ? "পেন্ডিং" : "Pending", count: orderStatusCounts.pending, color: "text-yellow-600" },
            { label: lang === "bn" ? "প্রসেসিং" : "Processing", count: orderStatusCounts.processing, color: "text-blue-600" },
            { label: lang === "bn" ? "কুরিয়ারে" : "With Courier", count: orderStatusCounts.with_courier, color: "text-indigo-600" },
            { label: lang === "bn" ? "ডেলিভারড" : "Delivered", count: orderStatusCounts.delivered, color: "text-green-600" },
            { label: lang === "bn" ? "পেমেন্ট প্রাপ্ত" : "Payment Recv.", count: orderStatusCounts.payment_received, color: "text-teal-600" },
            { label: lang === "bn" ? "রিটার্ন" : "Return", count: orderStatusCounts.return_requested, color: "text-orange-600" },
          ].map((s, i) => (
            <Card key={i} className="text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.count}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="overflow-x-auto">
          {loading ? (
            <Skeleton className="h-4 w-32 mx-auto" />
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">{lang === "bn" ? "কোন অর্ডার পাওয়া যায়নি" : "No orders found"}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary text-xs uppercase tracking-wider">
                  <th className="text-left pb-3 font-semibold">{lang === "bn" ? "অর্ডার" : "Order"}</th>
                  <th className="text-left pb-3 font-semibold">{lang === "bn" ? "গ্রাহক" : "Customer"}</th>
                  <th className="text-left pb-3 font-semibold">{lang === "bn" ? "প্রোডাক্ট" : "Product"}</th>
                  <th className="text-right pb-3 font-semibold">{lang === "bn" ? "পরিমাণ" : "Amount"}</th>
                  <th className="text-center pb-3 font-semibold">{lang === "bn" ? "পেমেন্ট" : "Payment"}</th>
                  <th className="text-center pb-3 font-semibold">{lang === "bn" ? "ডেলিভারি" : "Delivery"}</th>
                  <th className="text-center pb-3 font-semibold">{lang === "bn" ? "তারিখ" : "Date"}</th>
                  <th className="text-center pb-3 font-semibold w-64">{lang === "bn" ? "একশন" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.order_id} className="border-b border-border/50 hover:bg-gray-50/50">
                    <td className="py-3 pr-2">
                      <div className="font-mono text-xs">{o.order_id}</div>
                      {isCod(o) && <span className="text-[10px] text-amber-600 font-medium">COD</span>}
                      {isSsl(o) && <span className="text-[10px] text-blue-600 font-medium">SSL</span>}
                    </td>
                    <td className="py-3 pr-2">
                      <div className="font-medium text-xs">{o.worker_name || o.worker_id}</div>
                      {o.worker_phone && <div className="text-[10px] text-text-secondary">{o.worker_phone}</div>}
                    </td>
                    <td className="py-3 pr-2 max-w-[150px] truncate text-xs">{o.product_name || `#${o.product_id}`}</td>
                    <td className="py-3 pr-2 text-right font-semibold text-xs">{o.total_amount} {o.currency}</td>
                    <td className="py-3 pr-2 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        o.payment_status === "completed" || o.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : o.payment_status === "refunded"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}>{o.payment_status}</span>
                    </td>
                    <td className="py-3 pr-2 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${statusColors[o.order_status] || "bg-gray-100 text-gray-700"}`}>
                        {o.order_status}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-[10px] text-text-secondary text-center">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-3 text-center">
                      {terminalStatuses.includes(o.order_status) ? (
                        <span className="text-[10px] text-text-secondary italic">
                          {lang === "bn" ? "চূড়ান্ত" : "Final"}
                        </span>
                      ) : isCod(o) ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {COD_STAGES.map((stage) => {
                            const currentIdx = COD_STAGES.findIndex(s => s.status === o.order_status);
                            const stageIdx = COD_STAGES.findIndex(s => s.status === stage.status);
                            const isPast = stageIdx < currentIdx;
                            const isCurrent = stage.status === o.order_status;
                            const isNext = stageIdx === currentIdx + 1;
                            const isDisabled = stageIdx !== currentIdx + 1 || updating === o.order_id;
                            const isReturnPath = o.order_status === "return_requested" || o.order_status === "return_received";

                            if (isReturnPath && stage.status === "processing") return null;

                            return (
                              <button
                                key={stage.status}
                                onClick={() => updateOrder(o.order_id, { orderStatus: stage.status })}
                                disabled={!isNext || isPast}
                                className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
                                  isPast || isCurrent
                                    ? "bg-green-100 text-green-700 cursor-default"
                                    : isNext
                                      ? "bg-action/10 text-action hover:bg-action/20 cursor-pointer"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                {isPast || isCurrent ? "✓ " : ""}{stage.icon} {lang === "bn" ? stage.label.replace(/^[^\s]+\s/, "") : stage.labelEn}
                              </button>
                            );
                          })}

                          {/* Return path */}
                          {(o.order_status === "delivered" || o.order_status === "payment_received" || o.order_status === "return_requested" || o.order_status === "return_received") && (
                            <>
                              <div className="w-full border-t border-dashed border-gray-300 my-1" />
                              {RETURN_STAGES.map((stage) => {
                                const isCurrent = stage.status === o.order_status;
                                const canRequest = o.order_status === "delivered" || o.order_status === "payment_received";
                                const canReceive = o.order_status === "return_requested";
                                const isDisabled = !(canRequest && stage.status === "return_requested") && !(canReceive && stage.status === "return_received");
                                const isPast = stage.status === "return_received" && o.order_status === "return_received";

                                return (
                                  <button
                                    key={stage.status}
                                    onClick={() => updateOrder(o.order_id, { orderStatus: stage.status })}
                                    disabled={isDisabled || updating === o.order_id}
                                    className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
                                      isPast || isCurrent
                                        ? stage.status === "return_received"
                                          ? "bg-rose-100 text-rose-700 cursor-default"
                                          : "bg-orange-100 text-orange-700 cursor-default"
                                        : (canRequest && stage.status === "return_requested") || (canReceive && stage.status === "return_received")
                                          ? "bg-orange-50 text-orange-600 hover:bg-orange-100 cursor-pointer"
                                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                                  >
                                    {isPast || isCurrent ? "✓ " : ""}{stage.icon}
                                  </button>
                                );
                              })}
                            </>
                          )}

                          {/* Cancel */}
                          {o.order_status !== "cancelled" && o.order_status !== "return_received" && (
                            <button
                              onClick={() => { if (confirm(lang === "bn" ? "বাতিল করবেন?" : "Cancel order?")) updateOrder(o.order_id, { orderStatus: "cancelled" }); }}
                              disabled={updating === o.order_id}
                              className="text-[10px] px-2 py-1 rounded-md font-medium bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      ) : (
                        /* SSLCommerz: simple dropdown */
                        <select
                          value={o.order_status}
                          onChange={e => updateOrder(o.order_id, { orderStatus: e.target.value })}
                          disabled={updating === o.order_id}
                          className="px-2 py-1 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-action/30"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
              {lang === "bn" ? "পূর্ববর্তী" : "Previous"}
            </Button>
            <span className="text-sm text-text-secondary px-3">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              {lang === "bn" ? "পরবর্তী" : "Next"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

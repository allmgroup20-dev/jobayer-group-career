"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Order {
  order_id: string; worker_id: string; product_id: number | null;
  product_name: string | null; quantity: number; total_amount: number;
  currency: string; payment_method: string | null; payment_status: string;
  commission_status: string; order_status: string; shipping_address: string | null;
  transaction_id: string | null; created_at: string;
  worker_name: string | null; worker_phone: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const payStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function CompanyOrdersPage() {
  const { lang } = useLanguageStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState("");
  const [payFilter, setPayFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const orderStatusCounts = useMemo(() => ({
    pending: orders.filter(o => o.order_status === "pending").length,
    processing: orders.filter(o => o.order_status === "processing").length,
    delivered: orders.filter(o => o.order_status === "delivered").length,
  }), [orders]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (payFilter) params.set("paymentStatus", payFilter);
      const res = await fetch(`/api/company/orders?${params}`);
      const data = await res.json() as { orders?: Order[]; total?: number };
      if (data.orders) setOrders(data.orders);
      if (data.total !== undefined) setTotal(data.total);
    } catch {} finally { setLoading(false); }
  }, [page, debouncedSearch, statusFilter, payFilter]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const updateOrder = async (orderId: string, updates: Record<string, string>) => {
    setUpdating(orderId);
    try {
      await fetch("/api/company/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...updates }),
      });
      await loadOrders();
    } catch {} finally { setUpdating(null); }
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "অর্ডার ম্যানেজমেন্ট" : "Order Management"}</h1>
            <p className="text-sm text-text-secondary mt-1">{total} {lang === "bn" ? "টি অর্ডার" : "orders total"}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={lang === "bn" ? "অর্ডার/গ্রাহক সার্চ..." : "Search order/customer..."}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-action/30"
          />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl border border-border bg-white text-sm">
            <option value="">{lang === "bn" ? "সব স্ট্যাটাস" : "All Status"}</option>
            <option value="pending">{lang === "bn" ? "পেন্ডিং" : "Pending"}</option>
            <option value="processing">{lang === "bn" ? "প্রসেসিং" : "Processing"}</option>
            <option value="shipped">{lang === "bn" ? "শিপড" : "Shipped"}</option>
            <option value="delivered">{lang === "bn" ? "ডেলিভারড" : "Delivered"}</option>
            <option value="cancelled">{lang === "bn" ? "বাতিল" : "Cancelled"}</option>
          </select>
          <select value={payFilter} onChange={e => { setPayFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl border border-border bg-white text-sm">
            <option value="">{lang === "bn" ? "সব পেমেন্ট" : "All Payment"}</option>
            <option value="pending">{lang === "bn" ? "পেন্ডিং" : "Pending"}</option>
            <option value="completed">{lang === "bn" ? "সম্পন্ন" : "Completed"}</option>
            <option value="failed">{lang === "bn" ? "ব্যর্থ" : "Failed"}</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: lang === "bn" ? "মোট" : "Total", count: total, color: "text-primary" },
            { label: lang === "bn" ? "পেন্ডিং" : "Pending", count: orderStatusCounts.pending, color: "text-yellow-600" },
            { label: lang === "bn" ? "প্রসেসিং" : "Processing", count: orderStatusCounts.processing, color: "text-blue-600" },
            { label: lang === "bn" ? "ডেলিভারড" : "Delivered", count: orderStatusCounts.delivered, color: "text-green-600" },
          ].map((s, i) => (
            <Card key={i} className="text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-text-secondary mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-text-secondary text-sm">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">{lang === "bn" ? "কোন অর্ডার পাওয়া যায়নি" : "No orders found"}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary text-xs uppercase tracking-wider">
                  <th className="text-left pb-3 font-semibold">{lang === "bn" ? "অর্ডার আইডি" : "Order ID"}</th>
                  <th className="text-left pb-3 font-semibold">{lang === "bn" ? "গ্রাহক" : "Customer"}</th>
                  <th className="text-left pb-3 font-semibold">{lang === "bn" ? "প্রোডাক্ট" : "Product"}</th>
                  <th className="text-right pb-3 font-semibold">{lang === "bn" ? "পরিমাণ" : "Amount"}</th>
                  <th className="text-center pb-3 font-semibold">{lang === "bn" ? "পেমেন্ট" : "Payment"}</th>
                  <th className="text-center pb-3 font-semibold">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                  <th className="text-center pb-3 font-semibold">{lang === "bn" ? "তারিখ" : "Date"}</th>
                  <th className="text-center pb-3 font-semibold">{lang === "bn" ? "অ্যাকশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.order_id} className="border-b border-border/50 hover:bg-gray-50/50">
                    <td className="py-3 pr-2 font-mono text-xs">{o.order_id}</td>
                    <td className="py-3 pr-2">
                      <div className="font-medium">{o.worker_name || o.worker_id}</div>
                      {o.worker_phone && <div className="text-xs text-text-secondary">{o.worker_phone}</div>}
                    </td>
                    <td className="py-3 pr-2 max-w-[200px] truncate">{o.product_name || `#${o.product_id}`}</td>
                    <td className="py-3 pr-2 text-right font-semibold">{o.total_amount} {o.currency}</td>
                    <td className="py-3 pr-2 text-center">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${payStatusColors[o.payment_status] || "bg-gray-100 text-gray-700"}`}>{o.payment_status}</span>
                    </td>
                    <td className="py-3 pr-2 text-center">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[o.order_status] || "bg-gray-100 text-gray-700"}`}>{o.order_status}</span>
                    </td>
                    <td className="py-3 pr-2 text-xs text-text-secondary text-center">{o.created_at ? new Date(o.created_at).toLocaleDateString() : "-"}</td>
                    <td className="py-3 text-center">
                      <select
                        value={o.order_status}
                        onChange={e => updateOrder(o.order_id, { orderStatus: e.target.value })}
                        disabled={updating === o.order_id}
                        className="px-2 py-1 text-xs rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-action/30"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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

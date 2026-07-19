"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate, getStatusColor, getStatusBadge } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSWRFetch } from "@/lib/use-swr-fetch";

interface Order {
  order_id: string; product_name: string; total_amount: number;
  currency: string; order_status: string; payment_status: string;
  payment_method: string; transaction_id: string; created_at: string;
}

const statusMap: Record<string, string> = {
  pending: "pending", confirmed: "processing", paid: "paid",
  failed: "cancelled", cancelled: "cancelled",
};

export default function OrdersPage() {
  const { lang } = useLanguageStore();
  const workerId = typeof window !== "undefined" ? localStorage.getItem("worker_id") : null;
  const { data, loading } = useSWRFetch<{ orders?: Order[] }>(
    workerId ? `/api/orders?workerId=${workerId}` : null,
    { ttlMs: 300_000 }
  );
  const orders = data?.orders ?? [];
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-2">{lang === "bn" ? "আমার অর্ডার" : "My Orders"}</h1>
        <p className="text-sm text-text-secondary mb-8">{lang === "bn" ? "আপনার সব অর্ডার" : "All your orders"}</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-text-secondary">{lang === "bn" ? "কোন অর্ডার নেই" : "No orders yet"}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, showAll ? orders.length : 30).map((order) => (
              <Card key={order.order_id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-lg">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-primary truncate">{order.product_name || "Product"}</p>
                  <p className="text-xs text-text-secondary">{order.order_id} • {formatDate(order.created_at)}</p>
                  {order.transaction_id && (
                    <p className="text-xs text-text-secondary">Tx: {order.transaction_id}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-primary">{formatCurrency(order.total_amount, order.currency)}</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(statusMap[order.order_status] || order.order_status)}`}>
                    {getStatusBadge(statusMap[order.order_status] || order.order_status, lang)}
                  </span>
                </div>
              </Card>
            ))}
            {orders.length > 30 && !showAll && (
              <button onClick={() => setShowAll(true)} className="w-full text-center text-sm text-action hover:underline py-2">
                {lang === "bn" ? "আরও দেখুন" : "Show More"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate, getStatusColor, getStatusBadge } from "@/lib/utils";

const mockOrders = [
  { id: "ORD001", product: "Starter Business Kit", amount: 2990, currency: "BDT", status: "completed", payment: "paid", date: "2026-06-28" },
  { id: "ORD002", product: "Premium Career Package", amount: 9990, currency: "BDT", status: "processing", payment: "paid", date: "2026-06-25" },
  { id: "ORD003", product: "Digital Marketing Course", amount: 1990, currency: "BDT", status: "pending", payment: "pending", date: "2026-06-20" },
];

export default function OrdersPage() {
  const { lang } = useLanguageStore();

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-2">{lang === "bn" ? "আমার অর্ডার" : "My Orders"}</h1>
        <p className="text-sm text-text-secondary mb-8">{lang === "bn" ? "আপনার সব অর্ডার" : "All your orders"}</p>

        <div className="space-y-3">
          {mockOrders.map((order) => (
            <Card key={order.id} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-lg">📦</div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-primary">{order.product}</p>
                <p className="text-xs text-text-secondary">{order.id} • {formatDate(order.date)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-primary">{formatCurrency(order.amount, order.currency)}</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusBadge(order.status)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

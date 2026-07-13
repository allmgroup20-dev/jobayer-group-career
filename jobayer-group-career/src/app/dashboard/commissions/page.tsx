"use client";

import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate, getStatusColor, getStatusBadge } from "@/lib/utils";

const mockCommissions = [
  { id: "C001", from: "Karim Hossain", level: 1, percentage: 10, amount: 299, currency: "BDT", status: "paid", date: "2026-07-01" },
  { id: "C002", from: "Fatima Begum", level: 2, percentage: 5, amount: 149.5, currency: "BDT", status: "paid", date: "2026-06-28" },
  { id: "C003", from: "Shamim Reza", level: 1, percentage: 10, amount: 499, currency: "BDT", status: "paid", date: "2026-06-25" },
  { id: "C004", from: "Jahid Hasan", level: 2, percentage: 5, amount: 99.5, currency: "BDT", status: "pending", date: "2026-06-20" },
  { id: "C005", from: "Nasrin Akter", level: 2, percentage: 3, amount: 59.7, currency: "BDT", status: "pending", date: "2026-06-15" },
];

export default function CommissionsPage() {
  const { lang } = useLanguageStore();

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-2">
          {lang === "bn" ? "কমিশন ইতিহাস" : "Commission History"}
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          {lang === "bn" ? "আপনার সব কমিশনের বিস্তারিত" : "Details of all your commissions"}
        </p>

        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "থেকে" : "From"}</th>
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "লেভেল" : "Level"}</th>
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "%" : "%"}</th>
                  <th className="text-right p-4 text-sm font-semibold text-primary">{lang === "bn" ? "পরিমাণ" : "Amount"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                  <th className="text-right p-4 text-sm font-semibold text-primary">{lang === "bn" ? "তারিখ" : "Date"}</th>
                </tr>
              </thead>
              <tbody>
                {mockCommissions.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-primary">{c.from}</td>
                    <td className="p-4 text-sm text-text-secondary">Level {c.level}</td>
                    <td className="p-4 text-sm text-text-secondary">{c.percentage}%</td>
                    <td className="p-4 text-sm font-semibold text-right">{formatCurrency(c.amount, c.currency)}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                        {getStatusBadge(c.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary text-right">{formatDate(c.date)}</td>
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

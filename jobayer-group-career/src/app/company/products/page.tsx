"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

export default function CompanyProductsPage() {
  const { lang } = useLanguageStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", nameBn: "", price: "", commission: "", category: "business" });

  const products = [
    { id: 1, name: "Starter Business Kit", price: 2990, commission: 10, orders: 1250, status: "active" },
    { id: 2, name: "Premium Career Package", price: 9990, commission: 15, orders: 890, status: "active" },
    { id: 3, name: "Elite Success Bundle", price: 24990, commission: 20, orders: 345, status: "active" },
  ];

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "পণ্য ব্যবস্থাপনা" : "Manage Products"}</h1>
            <p className="text-sm text-text-secondary mt-1">{products.length} {lang === "bn" ? "টি পণ্য" : "products"}</p>
          </div>
          <Button onClick={() => setShowAdd(!showAdd)}>
            {lang === "bn" ? "নতুন পণ্য" : "Add Product"}
          </Button>
        </div>

        {showAdd && (
          <Card className="mb-6 animate-fade-up">
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "নতুন পণ্য যোগ করুন" : "Add New Product"}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder={lang === "bn" ? "পণ্যের নাম (ইংরেজি)" : "Product Name (EN)"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              <input type="text" placeholder={lang === "bn" ? "পণ্যের নাম (বাংলা)" : "Product Name (BN)"} value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} className="input-field" />
              <input type="number" placeholder={lang === "bn" ? "মূল্য" : "Price"} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
              <input type="number" placeholder={`${lang === "bn" ? "কমিশন" : "Commission"} %`} value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} className="input-field" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                <option value="business">{lang === "bn" ? "ব্যবসা" : "Business"}</option>
                <option value="career">{lang === "bn" ? "ক্যারিয়ার" : "Career"}</option>
                <option value="elite">{lang === "bn" ? "এলিট" : "Elite"}</option>
                <option value="education">{lang === "bn" ? "শিক্ষা" : "Education"}</option>
              </select>
              <Button variant="primary" className="self-end">{lang === "bn" ? "সেভ করুন" : "Save"}</Button>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left p-4 text-sm font-semibold text-primary">{lang === "bn" ? "পণ্য" : "Product"}</th>
                  <th className="text-right p-4 text-sm font-semibold text-primary">{lang === "bn" ? "মূল্য" : "Price"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">%</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "অর্ডার" : "Orders"}</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    <td className="p-4 text-sm font-medium text-primary">{p.name}</td>
                    <td className="p-4 text-sm text-right font-semibold">{formatCurrency(p.price)}</td>
                    <td className="p-4 text-sm text-center">{p.commission}%</td>
                    <td className="p-4 text-sm text-center">{p.orders}</td>
                    <td className="p-4 text-center"><span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">Active</span></td>
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

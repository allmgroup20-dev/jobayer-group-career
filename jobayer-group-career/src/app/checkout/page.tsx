"use client";

import { useState } from "react";
import { useLanguageStore, useCartStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const { lang } = useLanguageStore();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    clearCart();
    alert(lang === "bn" ? "অর্ডার সফল হয়েছে!" : "Order placed successfully!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-8">{lang === "bn" ? "চেকআউট" : "Checkout"}</h1>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">
            <Card>
              <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "শিপিং তথ্য" : "Shipping Info"}</h3>
              <div className="space-y-3">
                <input type="text" placeholder={lang === "bn" ? "আপনার নাম" : "Your Name"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                <input type="tel" placeholder={lang === "bn" ? "ফোন নম্বর" : "Phone Number"} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                <textarea placeholder={lang === "bn" ? "ঠিকানা" : "Address"} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field min-h-[80px]" />
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "পেমেন্ট মেথড" : "Payment Method"}</h3>
              <div className="space-y-2">
                {[
                  { id: "bkash", en: "bKash", bn: "বিকাশ" },
                  { id: "nagad", en: "Nagad", bn: "নগদ" },
                  { id: "sslcommerz", en: "SSLCommerz", bn: "এসএসএলকমার্জ" },
                ].map((method) => (
                  <label key={method.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? "border-action bg-action/5" : "border-border"}`}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-action" />
                    <span className="font-medium text-sm text-primary">{lang === "bn" ? method.bn : method.en}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="sticky top-24">
              <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "অর্ডার সারাংশ" : "Order Summary"}</h3>
              {items.length === 0 ? (
                <p className="text-sm text-text-secondary">{lang === "bn" ? "কার্ট খালি" : "Cart is empty"}</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-text-secondary">{item.name} × {item.quantity}</span>
                        <span className="font-medium text-primary">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-border my-3" />
                  <div className="flex justify-between mb-6">
                    <span className="font-bold text-primary">{lang === "bn" ? "মোট" : "Total"}</span>
                    <span className="font-bold text-lg text-action">{formatCurrency(items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
                  </div>
                  <Button onClick={handleSubmit} loading={loading} className="w-full !py-4">
                    {lang === "bn" ? "অর্ডার নিশ্চিত করুন" : "Place Order"}
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

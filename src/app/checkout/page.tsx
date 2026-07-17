"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguageStore, useCartStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

function CheckoutContent() {
  const { lang } = useLanguageStore();
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [productTypes, setProductTypes] = useState<Record<number, string>>({});
  const [hasPhysical, setHasPhysical] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const wid = localStorage.getItem("worker_id");
    const token = localStorage.getItem("worker_token");
    if (wid && token) {
      setWorkerId(wid);
      setIsLoggedIn(true);
      fetch(`/api/workers/profile?workerId=${wid}`)
        .then(r => r.json() as Promise<{ name?: string; phone?: string; email?: string }>)
        .then(data => {
          setForm(f => ({
            ...f,
            name: data.name || f.name,
            phone: data.phone || f.phone,
            email: data.email || f.email,
          }));
          setProfileLoaded(true);
        })
        .catch(() => setProfileLoaded(true));
    } else {
      setProfileLoaded(true);
    }

    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success(lang === "bn" ? "পেমেন্ট সফল হয়েছে!" : "Payment successful!");
    } else if (paymentStatus === "failed") {
      toast.error(lang === "bn" ? "পেমেন্ট ব্যর্থ হয়েছে" : "Payment failed");
    } else if (paymentStatus === "cancelled") {
      toast(lang === "bn" ? "পেমেন্ট বাতিল করা হয়েছে" : "Payment cancelled");
    } else if (paymentStatus === "error") {
      toast.error(lang === "bn" ? "পেমেন্ট এ সমস্যা হয়েছে" : "Payment error occurred");
    }
  }, []);

  const [sslEnabled, setSslEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      (async () => {
        try {
          const res = await fetch("/api/products");
          const data = await res.json() as { products?: { id: number; productType: string; enableSslcommerz: number; enableCod: number }[] };
          const types: Record<number, string> = {};
          let physical = false;
          if (data.products) {
            data.products.forEach(p => {
              types[p.id] = p.productType || "physical";
              if (p.productType === "virtual") {
                items.forEach(item => {
                  if (item.productId === p.id) types[item.productId] = "virtual";
                });
              }
            });
            items.forEach(item => {
              const t = types[item.productId] || "physical";
              types[item.productId] = t;
              if (t === "physical") physical = true;
            });
            const first = data.products.find(x => x.id === items[0].productId);
            if (first) {
              setSslEnabled(first.enableSslcommerz === 1);
              setCodEnabled(first.enableCod === 1);
            }
          } else {
            items.forEach(() => { physical = true; });
          }
          setProductTypes(types);
          setHasPhysical(physical);
        } catch {
          setHasPhysical(true);
        }
      })();
    }
  }, [items]);

  const doPayment = async (paymentMethod: string) => {
    if (!workerId) {
      toast.error(lang === "bn" ? "দয়া করে লগইন করুন" : "Please login first");
      router.push("/login");
      return;
    }
    if (hasPhysical && (!form.name || !form.phone || !form.address)) {
      toast.error(lang === "bn" ? "সব তথ্য পূরণ করুন" : "Fill all fields");
      return;
    }
    if (items.length === 0) {
      toast.error(lang === "bn" ? "কার্ট খালি" : "Cart is empty");
      return;
    }

    setLoading(true);
    try {
      const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const firstItem = items[0];
      const res = await fetch("/api/payment/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          productId: firstItem.productId,
          productName: items.map((i) => i.name).join(", "),
          quantity: items.reduce((s, i) => s + i.quantity, 0),
          totalAmount,
          currency: firstItem.currency || "BDT",
          shippingAddress: hasPhysical ? form.address : "",
          cusName: form.name || "",
          cusPhone: form.phone || "",
          cusEmail: form.email || "",
          paymentMethod,
        }),
      });

      const data = await res.json() as { gatewayUrl?: string; orderId?: string; method?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Payment init failed");

      clearCart();
      if (paymentMethod === "cod") {
        setOrderPlaced(data.orderId || "N/A");
      } else if (data.gatewayUrl) {
        window.location.href = data.gatewayUrl;
      } else {
        toast.success(lang === "bn" ? "অর্ডার সফল হয়েছে!" : "Order placed!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!profileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-action border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <h2 className="text-xl font-bold text-primary mb-4">
              {lang === "bn" ? "অ্যাকাউন্ট প্রয়োজন" : "Account Required"}
            </h2>
            <p className="text-text-secondary mb-6">
              {lang === "bn"
                ? "অর্ডার করার জন্য আপনাকে একটি অ্যাকাউন্ট খুলতে হবে"
                : "You need to create an account to place an order"}
            </p>
            <div className="space-y-3">
              <Link href="/register">
                <Button className="w-full">{lang === "bn" ? "নতুন অ্যাকাউন্ট খুলুন" : "Create Account"}</Button>
              </Link>
              <div className="text-sm text-text-secondary">
                {lang === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
                <Link href="/login" className="text-action hover:underline font-medium">
                  {lang === "bn" ? "লগইন করুন" : "Login"}
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-8">{lang === "bn" ? "চেকআউট" : "Checkout"}</h1>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">
            {hasPhysical && (
              <Card>
                <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "শিপিং তথ্য" : "Shipping Info"}</h3>
                <div className="space-y-3">
                  <input type="text" placeholder={lang === "bn" ? "আপনার নাম" : "Your Name"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                  <input type="tel" placeholder={lang === "bn" ? "ফোন নম্বর" : "Phone Number"} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" required />
                  <input type="email" placeholder={lang === "bn" ? "ইমেইল (ঐচ্ছিক)" : "Email (optional)"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
                  <textarea placeholder={lang === "bn" ? "ঠিকানা" : "Address"} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field min-h-[80px]" required />
                </div>
              </Card>
            )}

            {!hasPhysical && items.length > 0 && (
              <Card>
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="font-bold text-primary mb-2">
                    {lang === "bn" ? "ভার্চুয়াল পণ্য" : "Virtual Product"}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {lang === "bn"
                      ? "এটি একটি ডিজিটাল পণ্য, ডেলিভারির প্রয়োজন নেই। আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে যুক্ত হবে।"
                      : "This is a digital product — no delivery needed. It will be added to your account automatically."}
                  </p>
                </div>
              </Card>
            )}

            {orderPlaced ? (
              <Card>
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">✅</div>
                  <h3 className="font-bold text-primary mb-2">
                    {lang === "bn" ? "অর্ডার কনফার্মড!" : "Order Confirmed!"}
                  </h3>
                  <p className="text-sm text-text-secondary mb-2">
                    {lang === "bn" ? "আপনার অর্ডার নম্বর:" : "Your order ID:"}
                  </p>
                  <p className="text-xl font-bold text-action">{orderPlaced}</p>
                  <p className="text-xs text-text-secondary mt-3">
                    {lang === "bn"
                      ? "ক্যাশ অন ডেলিভারি নির্বাচিত হয়েছে। পণ্য হাতে পেয়ে পেমেন্ট করুন।"
                      : "Cash on Delivery selected. Pay when you receive the product."}
                  </p>
                  <Link href="/">
                    <Button className="mt-4">{lang === "bn" ? "হোম পেইজে ফিরুন" : "Back to Home"}</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <Card>
                <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "পেমেন্ট মেথড" : "Payment Method"}</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => doPayment("sslcommerz")}
                    disabled={loading || !sslEnabled}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      sslEnabled ? "border-action bg-action/5 hover:bg-action/10 cursor-pointer" : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-action flex items-center justify-center text-white text-sm font-bold shrink-0">SSL</div>
                      <div>
                        <div className="font-semibold text-sm text-primary">SSLCommerz</div>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {lang === "bn" ? "ক্রেডিট/ডেবিট কার্ড, মোবাইল ব্যাংকিং" : "Credit/Debit Card, Mobile Banking"}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <div className="animate-pulse w-2 h-2 rounded-full bg-action" />
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => doPayment("cod")}
                    disabled={loading || !codEnabled}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      codEnabled ? "border-green-400 bg-green-50 hover:bg-green-100 cursor-pointer" : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold shrink-0">৳</div>
                      <div>
                        <div className="font-semibold text-sm text-primary">{lang === "bn" ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery"}</div>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {lang === "bn" ? "পণ্য হাতে পেয়ে পেমেন্ট করুন" : "Pay when you receive"}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </div>
                    </div>
                  </button>
                  {!sslEnabled && (
                    <p className="text-xs text-red-500 text-center">
                      {lang === "bn" ? "এই পণ্যের জন্য SSLCommerz পেমেন্ট উপলব্ধ নেই" : "SSLCommerz not available for this product"}
                    </p>
                  )}
                  {!codEnabled && (
                    <p className="text-xs text-red-500 text-center">
                      {lang === "bn" ? "এই পণ্যের জন্য ক্যাশ অন ডেলিভারি উপলব্ধ নেই" : "COD not available for this product"}
                    </p>
                  )}
                </div>
              </Card>
            )}
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
                        <span className="text-text-secondary">
                          {item.name} × {item.quantity}
                          {productTypes[item.productId] === "virtual" && (
                            <span className="ml-1.5 text-[10px] text-purple-500 font-medium">(Digital)</span>
                          )}
                        </span>
                        <span className="font-medium text-primary">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-border my-3" />
                  <div className="flex justify-between mb-6">
                    <span className="font-bold text-primary">{lang === "bn" ? "মোট" : "Total"}</span>
                    <span className="font-bold text-lg text-action">{formatCurrency(items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-action border-t-transparent rounded-full" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

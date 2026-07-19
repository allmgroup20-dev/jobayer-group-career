"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguageStore, useCartStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

type PageStep = "loading" | "login-required" | "form" | "ssl-success" | "ssl-failed" | "ssl-cancelled" | "ssl-error" | "cod-confirmed";

function CheckoutContent() {
  const { lang } = useLanguageStore();
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<PageStep>("loading");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [products, setProducts] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("sslcommerz");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const wid = localStorage.getItem("worker_id");
    const token = localStorage.getItem("worker_token");

    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      setOrderId(searchParams.get("order")); setStep("ssl-success"); return;
    } else if (paymentStatus === "failed") {
      setOrderId(searchParams.get("order")); setStep("ssl-failed"); return;
    } else if (paymentStatus === "cancelled") { setStep("ssl-cancelled"); return; }
    else if (paymentStatus === "error") { setStep("ssl-error"); return; }

    if (!wid || !token) { setStep("login-required"); return; }

    setWorkerId(wid);
    fetch(`/api/workers/profile?workerId=${wid}`)
      .then(r => r.json() as Promise<{ name?: string; phone?: string }>)
      .then(data => setForm(f => ({ name: data.name || f.name, phone: data.phone || f.phone })))
      .catch(() => {})
      .finally(() => {
        const productId = searchParams.get("product");
        if (productId || items.length > 0) {
          (async () => {
            try {
              const res = await fetch("/api/products");
              const data: any = await res.json();
              setProducts(data);
              if (productId) {
                useCartStore.getState().clearCart();
                const p = data.products?.find((x: any) => x.id === parseInt(productId));
                if (p) {
                  useCartStore.getState().addItem({
                    productId: p.id,
                    name: lang === "bn" && p.nameBn ? p.nameBn : p.name,
                    price: p.price,
                    currency: p.currency || "BDT",
                    quantity: 1,
                    productType: p.productType,
                  });
                }
              }
            } catch {}
          })();
        }
        setStep("form");
      });
  }, []);

  const { hasPhysical, sslEnabled, codEnabled } = useMemo(() => {
    let physical = false;
    let ssl = true;
    let cod = true;
    if (products?.products) {
      items.forEach(item => {
        const p = products.products.find((x: any) => x.id === item.productId);
        if (p) {
          if (p.productType === "physical") physical = true;
          if (item === items[0]) {
            ssl = p.enableSslcommerz === 1;
            cod = p.enableCod === 1;
          }
        }
      });
    }
    return { hasPhysical: physical, sslEnabled: ssl, codEnabled: cod };
  }, [products, items]);

  useEffect(() => {
    if (!sslEnabled && codEnabled) setSelectedMethod("cod");
    else if (sslEnabled) setSelectedMethod("sslcommerz");
    else if (codEnabled) setSelectedMethod("cod");
  }, [sslEnabled, codEnabled]);

  const doPayment = async () => {
    if (!form.name || !form.phone) {
      toast.error(lang === "bn" ? "নাম ও ফোন নম্বর দিন" : "Name and phone required");
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
          productName: items.map(i => i.name).join(", "),
          quantity: items.reduce((s, i) => s + i.quantity, 0),
          totalAmount,
          currency: firstItem.currency || "BDT",
          cusName: form.name,
          cusPhone: form.phone,
          paymentMethod: selectedMethod,
        }),
      });

      const data = await res.json() as { gatewayUrl?: string; orderId?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Payment init failed");

      if (selectedMethod === "cod") {
        setOrderId(data.orderId || ""); clearCart(); setStep("cod-confirmed");
      } else if (data.gatewayUrl) {
        clearCart(); window.location.href = data.gatewayUrl;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (step === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><Skeleton className="w-8 h-8 rounded-full" /></div>;
  }

  if (step === "login-required") {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-primary mb-4">{lang === "bn" ? "অ্যাকাউন্ট প্রয়োজন" : "Account Required"}</h2>
            <p className="text-text-secondary mb-6">{lang === "bn" ? "অর্ডার করার জন্য আপনার একটি অ্যাকাউন্ট প্রয়োজন" : "You need an account to place an order"}</p>
            <div className="space-y-3">
              <Link href="/register"><Button className="w-full">{lang === "bn" ? "নতুন অ্যাকাউন্ট খুলুন" : "Create Account"}</Button></Link>
              <div className="text-sm text-text-secondary">
                {lang === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
                <Link href="/login" className="text-action hover:underline font-medium">{lang === "bn" ? "লগইন করুন" : "Login"}</Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "ssl-success") {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Card>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-primary mb-2">{lang === "bn" ? "পেমেন্ট সফল হয়েছে!" : "Payment Successful!"}</h2>
            <p className="text-text-secondary mb-4">{lang === "bn" ? "আপনার অর্ডার কনফার্ম করা হয়েছে।" : "Your order has been confirmed."}</p>
            {orderId && <div className="bg-gray-50 rounded-xl p-4 mb-6"><p className="text-xs text-text-secondary mb-1">{lang === "bn" ? "অর্ডার নম্বর" : "Order ID"}</p><p className="text-lg font-bold text-action">{orderId}</p></div>}
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/orders"><Button>{lang === "bn" ? "অর্ডার দেখুন" : "View Orders"}</Button></Link>
              <Link href="/"><Button variant="ghost">{lang === "bn" ? "হোম" : "Home"}</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "ssl-failed") {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Card>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-primary mb-2">{lang === "bn" ? "পেমেন্ট ব্যর্থ হয়েছে" : "Payment Failed"}</h2>
            <p className="text-text-secondary mb-6">{lang === "bn" ? "পুনরায় চেষ্টা করুন" : "Please try again."}</p>
            {orderId && <div className="bg-gray-50 rounded-xl p-4 mb-6"><p className="text-xs text-text-secondary mb-1">{lang === "bn" ? "অর্ডার নম্বর" : "Order ID"}</p><p className="text-lg font-bold text-primary">{orderId}</p></div>}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setStep("form")}>{lang === "bn" ? "পুনরায় চেষ্টা করুন" : "Try Again"}</Button>
              <Link href="/"><Button variant="ghost">{lang === "bn" ? "হোম" : "Home"}</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "ssl-cancelled") {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Card>
            <div className="text-6xl mb-4">↩️</div>
            <h2 className="text-2xl font-bold text-primary mb-2">{lang === "bn" ? "পেমেন্ট বাতিল" : "Payment Cancelled"}</h2>
            <p className="text-text-secondary mb-6">{lang === "bn" ? "আপনি পেমেন্ট বাতিল করেছেন।" : "You cancelled the payment."}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setStep("form")}>{lang === "bn" ? "পুনরায় চেষ্টা করুন" : "Try Again"}</Button>
              <Link href="/"><Button variant="ghost">{lang === "bn" ? "হোম" : "Home"}</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "ssl-error") {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Card>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-primary mb-2">{lang === "bn" ? "পেমেন্ট এ সমস্যা" : "Payment Error"}</h2>
            <p className="text-text-secondary mb-6">{lang === "bn" ? "পুনরায় চেষ্টা করুন।" : "Please try again."}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setStep("form")}>{lang === "bn" ? "পুনরায় চেষ্টা করুন" : "Try Again"}</Button>
              <Link href="/"><Button variant="ghost">{lang === "bn" ? "হোম" : "Home"}</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "cod-confirmed") {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Card>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-primary mb-2">{lang === "bn" ? "অর্ডার কনফার্মড!" : "Order Confirmed!"}</h2>
            <p className="text-text-secondary mb-4">{lang === "bn" ? "পণ্য হাতে পেয়ে পেমেন্ট করুন।" : "Pay when you receive the product."}</p>
            {orderId && <div className="bg-gray-50 rounded-xl p-4 mb-6"><p className="text-xs text-text-secondary mb-1">{lang === "bn" ? "অর্ডার নম্বর" : "Order ID"}</p><p className="text-lg font-bold text-action">{orderId}</p></div>}
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/orders"><Button>{lang === "bn" ? "অর্ডার দেখুন" : "View Orders"}</Button></Link>
              <Link href="/"><Button variant="ghost">{lang === "bn" ? "হোম" : "Home"}</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const bothDisabled = !sslEnabled && !codEnabled;

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cart" className="text-sm text-action hover:underline">← {lang === "bn" ? "পিছনে" : "Back"}</Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "চেকআউট" : "Checkout"}</h1>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-primary mb-2">{lang === "bn" ? "কার্ট খালি" : "Cart is Empty"}</h2>
            <Link href="/product-list"><Button>{lang === "bn" ? "পণ্য দেখুন" : "Browse Products"}</Button></Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3 space-y-4">
              {hasPhysical && (
                <Card>
                  <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "আপনার তথ্য" : "Your Info"}</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder={lang === "bn" ? "আপনার নাম" : "Your Name"} value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
                    <input type="tel" placeholder={lang === "bn" ? "ফোন নম্বর" : "Phone Number"} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" />
                  </div>
                </Card>
              )}

              {!hasPhysical && (
                <Card>
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="text-sm text-text-secondary">
                      {lang === "bn" ? "ডিজিটাল পণ্য — কোন তথ্যের প্রয়োজন নেই। অর্ডার সম্পন্ন হলে অ্যাকাউন্টে যুক্ত হবে।" : "Digital product — no info needed. It will be added to your account."}
                    </p>
                  </div>
                </Card>
              )}
            </div>

            <div className="md:col-span-2">
              <Card className="sticky top-24">
                <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "অর্ডার সারাংশ" : "Order Summary"}</h3>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-text-secondary">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-primary">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-border my-3" />
                <div className="flex justify-between">
                  <span className="font-bold text-primary">{lang === "bn" ? "মোট" : "Total"}</span>
                  <span className="font-bold text-lg text-action">{formatCurrency(totalAmount)}</span>
                </div>

                <div className="h-px bg-border my-4" />

                {bothDisabled ? (
                  <p className="text-sm text-red-500 text-center">{lang === "bn" ? "কোনো পেমেন্ট মেথড উপলব্ধ নেই" : "No payment method available"}</p>
                ) : (
                  <div className="space-y-3">
                    {sslEnabled && (
                      <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedMethod === "sslcommerz" ? "border-action bg-action/5" : "border-gray-200"}`}>
                        <input type="radio" name="payment" value="sslcommerz" checked={selectedMethod === "sslcommerz"} onChange={() => setSelectedMethod("sslcommerz")} className="w-4 h-4 accent-action" />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-action flex items-center justify-center text-white text-xs font-bold shrink-0">SSL</div>
                          <span className="text-sm font-medium text-primary">SSLCommerz</span>
                        </div>
                      </label>
                    )}
                    {codEnabled && (
                      <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedMethod === "cod" ? "border-green-500 bg-green-50" : "border-gray-200"}`}>
                        <input type="radio" name="payment" value="cod" checked={selectedMethod === "cod"} onChange={() => setSelectedMethod("cod")} className="w-4 h-4 accent-green-500" />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">৳</div>
                          <span className="text-sm font-medium text-primary">{lang === "bn" ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery"}</span>
                        </div>
                      </label>
                    )}
                    <Button onClick={doPayment} loading={loading} className="w-full !py-4 text-base font-bold">
                      {lang === "bn" ? "অর্ডার নিশ্চিত করুন" : "Confirm Order"}
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Skeleton className="w-8 h-8 rounded-full" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

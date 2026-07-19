"use client";

import { useState } from "react";

interface CheckoutModalProps {
  workerId: string;
  cusName?: string;
  cusPhone?: string;
  cusEmail?: string;
  onClose: () => void;
}

const BASE_PRICE = 99;

export default function CheckoutModal({ workerId, cusName, cusPhone, cusEmail, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<"select" | "bargain" | "pay">("select");
  const [customCount, setCustomCount] = useState(2);
  const [finalAmount, setFinalAmount] = useState(BASE_PRICE);
  const [finalCount, setFinalCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [bargainSessionId, setBargainSessionId] = useState<number | null>(null);
  const [bargainMessages, setBargainMessages] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [userPriceInput, setUserPriceInput] = useState("");
  const [canBargain, setCanBargain] = useState(true);

  const isSingle = finalCount === 1;
  const totalPrice = finalCount * BASE_PRICE;

  const handleStartBargain = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/bargain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, resourceCount: finalCount }),
      });
      const data = await res.json() as { sessionId: number; currentOffer: number; message: string; canBargain: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      setBargainSessionId(data.sessionId);
      setBargainMessages([{ role: "ai", text: data.message }]);
      setFinalAmount(data.currentOffer);
      setCanBargain(data.canBargain);
      setStep("bargain");
    } catch (err) {
      setError(err instanceof Error ? err.message : "বার্গেনিং শুরু করতে ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  const handleBargainRespond = async () => {
    const desiredPrice = parseInt(userPriceInput);
    if (!desiredPrice || desiredPrice < totalPrice * 0.5 || desiredPrice > finalAmount) {
      setError(`দয়া করে একটি বৈধ মূল্য লিখুন (${(totalPrice * 0.5).toFixed(0)}-${finalAmount} ৳)`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/bargain/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: bargainSessionId, desiredPrice }),
      });
      const data = await res.json() as { accepted: boolean; offer: number | null; message: string; canContinue?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");

      const newMessages = [...bargainMessages, { role: "user" as const, text: `আমি ৳${desiredPrice.toLocaleString()} দিতে চাই` }];

      if (data.accepted) {
        newMessages.push({ role: "ai", text: data.message });
        setBargainMessages(newMessages);
        setFinalAmount(data.offer || desiredPrice);
        setTimeout(() => setStep("pay"), 1500);
      } else if (data.offer) {
        newMessages.push({ role: "ai", text: data.message });
        setBargainMessages(newMessages);
        setFinalAmount(data.offer);
        setCanBargain(data.canContinue !== false);
      } else {
        newMessages.push({ role: "ai", text: data.message });
        setBargainMessages(newMessages);
        setCanBargain(false);
      }
      setBargainMessages(newMessages);
      setUserPriceInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "বার্গেনিং ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDeal = async () => {
    if (bargainSessionId) {
      try {
        await fetch("/api/ai/bargain/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: bargainSessionId }),
        });
      } catch {}
    }
    setStep("pay");
  };

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resource-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          resourceCount: finalCount,
          amount: finalAmount,
          cusName: cusName || "Resource User",
          cusPhone: cusPhone || "01XXXXXXXXX",
          cusEmail: cusEmail || "user@example.com",
        }),
      });
      const data = await res.json() as { gatewayUrl?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Payment initiation failed");
      if (data.gatewayUrl) {
        window.location.href = data.gatewayUrl;
      } else {
        throw new Error("No gateway URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "পেমেন্ট শুরু করতে ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {step === "bargain" ? "💰 দাম দরকরুন" : step === "pay" ? "💳 পেমেন্ট" : "🛒 রিসোর্স কিনুন"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-lg">✕</button>
          </div>
          <p className="text-white/80 text-sm mt-1">প্রতি রিসোর্স মাত্র {BASE_PRICE} ৳</p>
        </div>

        <div className="p-5 space-y-4">
          {step === "select" && (
            <>
              <div className="bg-primary/5 rounded-2xl p-5 text-center border-2 border-primary/20">
                <p className="text-sm text-text-secondary mb-1">১টি রিসোর্স</p>
                <p className="text-3xl font-black text-primary">{BASE_PRICE} ৳</p>
                <p className="text-xs text-text-secondary mt-1">ফিক্সড প্রাইস — কোনো দরদর নেই</p>
                <button
                  onClick={() => { setFinalCount(1); setFinalAmount(BASE_PRICE); setStep("pay"); }}
                  className="mt-3 w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm"
                >
                  💳 {BASE_PRICE} ৳ - সরাসরি কিনুন
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-text-secondary">অথবা</span></div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text mb-2">একাধিক রিসোর্স — আপনার পছন্দমত সংখ্যা দিন</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCustomCount(Math.max(2, customCount - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold hover:bg-gray-200 transition-colors"
                  >−</button>
                  <input
                    type="number"
                    value={customCount}
                    min={2}
                    max={100}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 2;
                      setCustomCount(Math.max(2, Math.min(100, v)));
                    }}
                    className="flex-1 text-center text-2xl font-black text-text py-2 border-2 border-gray-200 rounded-xl outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => setCustomCount(Math.min(100, customCount + 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold hover:bg-gray-200 transition-colors"
                  >+</button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">{customCount} × {BASE_PRICE} ৳</span>
                  <span className="font-bold text-text">{(customCount * BASE_PRICE).toLocaleString()} ৳</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setFinalCount(customCount); setFinalAmount(customCount * BASE_PRICE); handleStartBargain(); }}
                  disabled={loading}
                  className="flex-1 py-3 bg-amber-50 border-2 border-amber-200 text-amber-700 font-bold rounded-xl hover:bg-amber-100 transition-all disabled:opacity-50 text-sm"
                >
                  💰 দাম দরকরুন
                </button>
                <button
                  onClick={() => { setFinalCount(customCount); setFinalAmount(customCount * BASE_PRICE); setStep("pay"); }}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary/80 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-sm"
                >
                  💳 সরাসরি কিনুন
                </button>
              </div>
            </>
          )}

          {step === "bargain" && (
            <>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 max-h-60 overflow-y-auto text-sm">
                {bargainMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.role === "ai"
                        ? "bg-white border border-gray-200 text-text"
                        : "bg-primary text-white"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {canBargain && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={userPriceInput}
                    onChange={(e) => setUserPriceInput(e.target.value)}
                    placeholder="আপনার প্রস্তাবিত মূল্য (৳)"
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-primary"
                    min={Math.max(99, Math.floor(totalPrice * 0.5))}
                    max={finalAmount}
                  />
                  <button
                    onClick={handleBargainRespond}
                    disabled={loading || !userPriceInput}
                    className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
                  >
                    {loading ? "..." : "পাঠান"}
                  </button>
                </div>
              )}

              {!canBargain && (
                <button
                  onClick={handleAcceptDeal}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all"
                >
                  ✅ {finalAmount.toLocaleString()} ৳ তে ডিল করুন
                </button>
              )}
            </>
          )}

          {step === "pay" && (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-xl p-4 text-center">
                <p className="text-xl font-black text-primary">{finalAmount.toLocaleString()} ৳</p>
                <p className="text-sm text-text-secondary">{finalCount}টি রিসোর্স</p>
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/80 text-white font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "⏳ প্রসেসিং..." : `💳 ${finalAmount.toLocaleString()} ৳ পেমেন্ট করুন`}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium">{error}</div>
          )}

          <p className="text-center text-xs text-text-secondary">SSLCommerz এর মাধ্যমে নিরাপদ পেমেন্ট</p>
        </div>
      </div>
    </div>
  );
}

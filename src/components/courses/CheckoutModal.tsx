"use client";

import { useState } from "react";

interface CheckoutModalProps {
  workerId: string;
  cusName?: string;
  cusPhone?: string;
  cusEmail?: string;
  onClose: () => void;
}

const PRICE_PER_RESOURCE = 99;

const packs = [
  { count: 1, label: "1টি রিসোর্স", price: 99 },
  { count: 3, label: "3টি রিসোর্স", price: 297 },
  { count: 5, label: "5টি রিসোর্স", price: 495 },
  { count: 10, label: "10টি রিসোর্স", price: 990 },
];

export default function CheckoutModal({ workerId, cusName, cusPhone, cusEmail, onClose }: CheckoutModalProps) {
  const [selectedPack, setSelectedPack] = useState(packs[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resource-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          resourceCount: selectedPack.count,
          amount: selectedPack.price,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">🛒 রিসোর্স আনলক প্যাকেজ</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-lg">✕</button>
          </div>
          <p className="text-white/80 text-sm mt-1">প্রতি রিসোর্স মাত্র {PRICE_PER_RESOURCE} ৳ — প্রিমিয়াম রিসোর্স আনলক করুন</p>
        </div>

        <div className="p-5 space-y-3">
          {packs.map((pack) => (
            <button
              key={pack.count}
              onClick={() => setSelectedPack(pack)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selectedPack.count === pack.count
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-text">{pack.label}</span>
                  <p className="text-xs text-text-secondary mt-0.5">{pack.price / PRICE_PER_RESOURCE} ৳/রিসোর্স</p>
                </div>
                <span className="text-xl font-black text-primary">{pack.price.toLocaleString()} ৳</span>
              </div>
            </button>
          ))}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/80 text-white font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "⏳ প্রসেসিং..." : `💳 ${selectedPack.price.toLocaleString()} ৳ পেমেন্ট করুন`}
          </button>

          <p className="text-center text-xs text-text-secondary">
            SSLCommerz এর মাধ্যমে নিরাপদ পেমেন্ট
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

interface CheckoutModalProps {
  workerId: string;
  cusName?: string;
  cusPhone?: string;
  cusEmail?: string;
  onClose: () => void;
}

interface Tier {
  id: string; credits: number; retailPrice: number;
  offerPrice: number; savings: number; popular: boolean; pricePerCredit: number;
  floor: number;
}

export default function CheckoutModal({ workerId, cusName, cusPhone, cusEmail, onClose }: CheckoutModalProps) {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [step, setStep] = useState<"tiers" | "bargain" | "pay">("tiers");
  const [finalAmount, setFinalAmount] = useState(0);
  const [finalCredits, setFinalCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [bargainRound, setBargainRound] = useState(1);
  const [bargainMessages, setBargainMessages] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [userPriceInput, setUserPriceInput] = useState("");
  const [canBargain, setCanBargain] = useState(true);
  const [bargainAccepted, setBargainAccepted] = useState(false);

  useEffect(() => {
    fetch("/api/pricing/tiers")
      .then(r => r.json() as Promise<{ tiers: Tier[] }>)
      .then(d => { setTiers(d.tiers); setLoadingTiers(false); })
      .catch(() => setLoadingTiers(false));
  }, []);

  const handleSelectTier = (tier: Tier) => {
    setSelectedTier(tier);
    setFinalAmount(tier.offerPrice);
    setFinalCredits(tier.credits);
    setBargainMessages([{
      role: "ai",
      text: `👋 ${tier.credits}টি রিসোর্সের জন্য রিটেইল প্রাইস ৳${tier.retailPrice.toLocaleString()}। আমাদের অফার ৳${tier.offerPrice.toLocaleString()}। আপনি কত দিতে চান?`,
    }]);
    setBargainRound(1);
    setCanBargain(true);
    setBargainAccepted(false);
    setUserPriceInput("");
    setError("");
    setStep("bargain");
  };

  const handleBargainRespond = async () => {
    if (!selectedTier) return;
    const desiredPrice = parseInt(userPriceInput);
    if (!desiredPrice || desiredPrice < selectedTier.floor || desiredPrice > selectedTier.offerPrice) {
      const expectedMin = selectedTier.floor;
      setError(`দয়া করে ৳${expectedMin.toLocaleString()} – ৳${selectedTier.offerPrice.toLocaleString()} এর মধ্যে একটি মূল্য দিন`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pricing/tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: selectedTier.id, desiredPrice, round: bargainRound }),
      });
      const data = await res.json() as {
        accepted: boolean; final: boolean; message: string;
        counterOffer?: number; finalPrice?: number; credits?: number; round?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Failed");

      const newMessages = [...bargainMessages, { role: "user" as const, text: `আমি ৳${desiredPrice.toLocaleString()} দিতে চাই` }];

      if (data.accepted) {
        newMessages.push({ role: "ai", text: data.message });
        setBargainMessages(newMessages);
        setFinalAmount(data.finalPrice || desiredPrice);
        setBargainAccepted(true);
        setCanBargain(false);
        setTimeout(() => { setStep("pay"); }, 2000);
      } else if (data.counterOffer) {
        newMessages.push({ role: "ai", text: data.message });
        setBargainMessages(newMessages);
        setFinalAmount(data.counterOffer);
        setBargainRound(data.round || bargainRound + 1);
        setCanBargain(!data.final);
      } else {
        newMessages.push({ role: "ai", text: data.message });
        setBargainMessages(newMessages);
        setCanBargain(false);
      }
      setUserPriceInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "বার্গেনিং ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resource-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("worker_token") || ""}` },
        body: JSON.stringify({
          workerId,
          resourceCount: finalCredits,
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

  const progressBar = () => (
    <div className="flex gap-1.5 mb-4">
      {["tiers", "bargain", "pay"].map((s, i) => (
        <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/20">
          <div className={`h-full rounded-full transition-all duration-500 ${stepperIndex(s) <= stepperIndex(step) ? "bg-amber-300" : ""}`}
            style={{ width: stepperIndex(s) <= stepperIndex(step) ? "100%" : "0%" }} />
        </div>
      ))}
    </div>
  );

  const stepperIndex = (s: string) => s === "tiers" ? 0 : s === "bargain" ? 1 : 2;

  const stepLabel = () => {
    if (step === "tiers") return { title: "🛒 রিসোর্স ক্রয়", subtitle: "আপনার প্যাকেজ নির্বাচন করুন" };
    if (step === "bargain") return { title: "💰 দাম দরকরুন", subtitle: `${selectedTier?.credits || 0}টি রিসোর্স` };
    return { title: "💳 পেমেন্ট", subtitle: `${finalCredits}টি রিসোর্স = ৳${finalAmount.toLocaleString()}` };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] p-5 text-white sticky top-0 z-10">
          {progressBar()}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{stepLabel().title}</h2>
              <p className="text-white/70 text-sm mt-0.5">{stepLabel().subtitle}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-lg">✕</button>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {step === "tiers" && (
            loadingTiers ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <p className="text-xs text-text-secondary text-center mb-1 font-medium">
                  ⚡ যেকোনো প্যাকেজের সাথে ফ্রি প্রিমিয়াম ব্যাজ
                </p>
                <div className="space-y-2.5">
                  {tiers.map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => handleSelectTier(tier)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 ${
                        tier.popular
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-lg shadow-amber-200/30"
                          : "bg-white border-gray-200 hover:border-primary/30 hover:shadow-md"
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${
                            tier.popular ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"
                          }`}>
                            {tier.credits}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-text">{tier.credits}টি {tier.id === "try" ? "রিসোর্স" : "রিসোর্স"}</p>
                              {tier.popular && (
                                <span className="px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[9px] font-bold tracking-wide">🔥 BEST</span>
                              )}
                            </div>
                            <p className="text-xs text-text-secondary/60">
                              ৳{tier.pricePerCredit}/রিসোর্স {tier.savings > 0 && `· সাশ্রয় ${tier.savings}%`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-primary">৳{tier.offerPrice.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 line-through">৳{tier.retailPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">👑</span>
                    <p className="text-purple-700 font-semibold">
                      যেকোনো প্যাকেজ কিনলেই ফ্রি প্রিমিয়াম ব্যাজ!
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1">
                    <li className="text-xs text-purple-600/80 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-purple-400" /> বাকি রিসোর্স আলাদা দরে কেনা যায়
                    </li>
                    <li className="text-xs text-purple-600/80 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-purple-400" /> উত্তোলনে কোনো প্ল্যাটফর্ম ট্যাক্স নেই
                    </li>
                    <li className="text-xs text-purple-600/80 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-purple-400" /> ন্যূনতম উত্তোলন মাত্র ৳২০
                    </li>
                  </ul>
                </div>
              </>
            )
          )}

          {step === "bargain" && selectedTier && (
            <>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 space-y-3 max-h-60 overflow-y-auto text-sm border border-gray-100">
                {bargainMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"} animate-fade-up`}>
                    <div className={`max-w-[88%] p-3 rounded-2xl leading-relaxed ${
                      msg.role === "ai"
                        ? "bg-white border border-gray-200 text-text shadow-sm"
                        : "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md"
                    }`}>
                      {msg.role === "ai" && <span className="text-sm mr-1">🤖</span>}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {bargainAccepted && (
                  <div className="flex justify-center">
                    <div className="px-5 py-3 bg-green-50 border-2 border-green-200 rounded-2xl text-green-700 font-bold text-center animate-bounce-in">
                      ✅ ডিল সম্পন্ন! পেমেন্টে যাচ্ছি...
                    </div>
                  </div>
                )}
              </div>

              {canBargain && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={userPriceInput}
                      onChange={(e) => setUserPriceInput(e.target.value)}
                      placeholder={`আপনার প্রস্তাব (৳${selectedTier.floor.toLocaleString()} – ৳${selectedTier.offerPrice.toLocaleString()})`}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-primary"
                      min={selectedTier.floor}
                      max={selectedTier.offerPrice}
                    />
                    <button
                      onClick={handleBargainRespond}
                      disabled={loading || !userPriceInput}
                      className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm cursor-pointer"
                    >
                      {loading ? "..." : "পাঠান"}
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary/50 text-center">
                    * {selectedTier.credits}টি রিসোর্সের জন্য ন্যূনতম ৳{selectedTier.floor.toLocaleString()}
                  </p>
                </div>
              )}

              {!canBargain && !bargainAccepted && (
                <button
                  onClick={() => setStep("pay")}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all cursor-pointer"
                >
                  ✅ {finalAmount.toLocaleString()} ৳ তে ডিল করুন
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-text-secondary/50">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>আমাদের টিম অনলাইন — সর্বোচ্চ চেষ্টা করছে সেরা দাম দিতে</span>
              </div>
            </>
          )}

          {step === "pay" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl p-5 text-center border border-primary/10">
                <div className="text-3xl mb-1">👑</div>
                <p className="text-2xl font-black text-primary">{finalAmount.toLocaleString()} ৳</p>
                <p className="text-sm text-text-secondary">{finalCredits}টি রিসোর্স আনলক</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                  ⭐ প্রিমিয়াম ব্যাজ ফ্রি
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/80 text-white font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "⏳ SSLCommerz এ যাচ্ছি..." : `💳 ${finalAmount.toLocaleString()} ৳ পেমেন্ট করুন`}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <p className="text-center text-xs text-text-secondary/40 pt-2">
            🔒 SSLCommerz এর মাধ্যমে নিরাপদ পেমেন্ট | পেমেন্ট সম্পন্ন হলে আনলক কোটা + প্রিমিয়াম ব্যাজ
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/lang";
import { JOIN_CERT_DEFAULTS, useJoinContent } from "@/lib/join-content";

export const dynamic = "force-dynamic";

type Earned = { foundation: boolean; ambassador: boolean; elite: boolean };

function SelectView() {
  const { lang } = useLang();
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const sp = useSearchParams();
  const id = sp.get("id") || "";
  const { content: certCfg } = useJoinContent("join_certificate", JOIN_CERT_DEFAULTS);
  const costs = certCfg.costs as any;

  const [earned, setEarned] = useState<Earned>({ foundation: false, ambassador: false, elite: false });
  const [selected, setSelected] = useState<Record<string, boolean>>({ foundation: false, ambassador: false, elite: false });
  const [copies, setCopies] = useState<Record<string, number>>({ foundation: 1, ambassador: 1, elite: 1 });
  const [deliveryMode, setDeliveryMode] = useState<"post" | "home">("post");
  const [deliveryDiscount, setDeliveryDiscount] = useState(0);
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem("original_copy_offer_views");
      const views = v ? Number(v) : 0;
      const steps = [0,5,10,15,20,30,40];
      setDeliveryDiscount(steps[Math.min(views, steps.length-1)] || 0);
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [meRes, shareRes, memRes] = await Promise.all([
          fetch("/api/me").then(r=>r.ok?r.json():null).catch(()=>null),
          fetch("/api/share").then(r=>r.ok?r.json():null).catch(()=>null),
          fetch("/api/membership/status").then(r=>r.ok?r.json():null).catch(()=>null),
        ]);
        const isPremium = !!(memRes as any)?.isPremium || !!(memRes as any)?.eliteCertificateId;
        const share = shareRes as any;
        const hasFoundation = !!(share?.completed || share?.certificateId);
        // ambassador: need to check referral or screenshots, fallback to share completed as proxy
        let hasAmbassador = false;
        try {
          const sRes = await fetch("/api/share/screenshots").then(r=>r.ok?r.json():null).catch(()=>null);
          hasAmbassador = (sRes as any)?.status === "verified" || (sRes as any)?.status === "pending";
        } catch {}
        // also check referralJoins
        const referralJoins = (meRes as any)?.referralJoins ?? 0;
        if (referralJoins >= 11) hasAmbassador = true;
        const hasElite = isPremium;
        const e = { foundation: hasFoundation, ambassador: hasAmbassador, elite: hasElite };
        setEarned(e);
        // auto-select earned
        setSelected({ foundation: hasFoundation, ambassador: hasAmbassador, elite: hasElite });
        // if id param indicates tier, ensure that tier selected
        if (id.startsWith("YA-ELITE-")) setSelected(s=>({ ...s, elite: true }));
        else if (id.startsWith("YA-AMB-")) setSelected(s=>({ ...s, ambassador: true }));
        else if (id) setSelected(s=>({ ...s, foundation: true }));
      } catch {}
    })();
  }, [id]);

  const toggle = (k: string) => {
    if (!earned[k as keyof Earned]) return;
    setSelected(s=>({ ...s, [k]: !s[k] }));
  };
  const changeCopy = (k: string, delta: number) => setCopies(c=> {
    const v = Math.max(1, Math.min(10, (c[k] || 1) + delta));
    return { ...c, [k]: v };
  });

  const totalCopies = (selected.foundation ? copies.foundation : 0) + (selected.ambassador ? copies.ambassador : 0) + (selected.elite ? copies.elite : 0);
  const selectedCount = (selected.foundation?1:0)+(selected.ambassador?1:0)+(selected.elite?1:0);
  const deliveryFeeRaw = deliveryMode === "home" ? (costs.homeFeeUsd ?? 1) : (costs.postFeeUsd ?? 0.5);
  const deliveryFee = totalCopies >= 2 ? deliveryFeeRaw * (1 - deliveryDiscount / 100) : deliveryFeeRaw;
  const perCopyBase = (costs.printUsd ?? 0.6) + (costs.packagingUsd ?? 0.4) + (costs.shippingUsd ?? 0.5);
  const totalBase = perCopyBase * Math.max(1, totalCopies);
  const totalUsd = totalBase + deliveryFee;
  const rate = costs.usdRate || 111;
  const totalBdt = Math.floor(totalUsd * rate);

  const handlePay = async () => {
    if (totalCopies === 0) { setMsg(t("অন্তত একটি সার্টিফিকেট সিলেক্ট করুন", "Select at least one certificate")); return; }
    if (selectedCount === 0) { setMsg(t("অন্তত একটি সার্টিফিকেট সিলেক্ট করুন", "Select at least one certificate")); return; }
    setPaying(true); setMsg(null);
    try {
      // Determine highest tier for delivery init
      let tier: string = "foundation";
      if (selected.elite) tier = "elite";
      else if (selected.ambassador) tier = "ambassador";
      const res = await fetch("/api/delivery/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, deliveryMode, bundleCount: totalCopies, discount: totalCopies >= 2 ? deliveryDiscount : 0, selected, copies }),
      });
      const j = await res.json().catch(()=>({})) as any;
      if (!res.ok) { setMsg(j.error || t("পেমেন্ট শুরু করা যায়নি", "Could not start payment")); return; }
      if (j.GatewayPageURL) window.location.href = j.GatewayPageURL;
    } catch {
      setMsg(t("পেমেন্ট শুরু করা যায়নি", "Could not start payment"));
    } finally { setPaying(false); }
  };

  const Card = ({ k, title, icon, earned }: { k: string; title: string; icon: string; earned: boolean }) => (
    <div className={`rounded-2xl border p-4 ${!earned ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed" : selected[k] ? "bg-teal/10 border-teal/30" : "bg-white border-slate-200"} `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">{icon}</div>
          <div>
            <p className="text-sm font-black text-slate-900">{title}</p>
            <p className="text-[11px] text-slate-600">{earned ? t("অর্জিত ✓", "Earned ✓") : t("এখনো অর্জিত নয় — অর্ডার করা যাবে না", "Not yet earned — cannot order")}</p>
          </div>
        </div>
        <input type="checkbox" checked={!!selected[k]} onChange={()=>{ if(!earned) return; toggle(k); }} disabled={!earned} className="w-5 h-5 accent-teal disabled:opacity-40" />
      </div>
      {selected[k] && earned && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">{t("কপি", "Copies")}</span>
          <div className="flex items-center gap-2">
            <button onClick={()=>changeCopy(k,-1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-black">−</button>
            <span className="w-8 text-center font-black">{copies[k]}</span>
            <button onClick={()=>changeCopy(k,1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-black">+</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen page-under-header pb-24 px-4 bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-black text-[#0B1F33] text-center mt-4">{t("কয়টি সার্টিফিকেট অর্ডার করবেন?", "How many certificates to order?")}</h1>
        <p className="text-xs text-slate-600 text-center mt-1">{t("আপনি কয়টি পেয়েছেন দেখুন, যতগুলো সিলেক্ট করবেন ততগুলো পাবেন — একই সার্টিফিকেটের একাধিক কপিও নিতে পারবেন। প্রতিটি কপির খরচ বাড়বে।", "See how many you have earned, select as many as you want — multiple copies of same certificate also possible. Cost increases per copy.")}</p>
        <p className="text-[11px] text-teal text-center mt-1">{t("ডেলিভারি খরচ সবগুলোতে সমান — একটি ডেলিভারির খরচই সবগুলোর জন্য", "Delivery cost same for all — single delivery fee for all")}</p>

        <div className="mt-4 space-y-3">
          <Card k="foundation" title={t("ফাউন্ডেশন সার্টিফিকেট", "Foundation Certificate")} icon="🎓" earned={earned.foundation} />
          <Card k="ambassador" title={t("অ্যাম্বাসেডর সার্টিফিকেট", "Ambassador Certificate")} icon="🔗" earned={earned.ambassador} />
          <Card k="elite" title={t("এলিট সার্টিফিকেট", "Elite Certificate")} icon="🏆" earned={earned.elite} />
        </div>

        <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-black text-slate-900">{t("ডেলিভারি", "Delivery")}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={()=>setDeliveryMode("post")} className={`py-2.5 rounded-xl border text-xs font-black ${deliveryMode==="post" ? "bg-teal/15 border-teal/30 text-teal" : "bg-white border-slate-200 text-slate-600"}`}>📍 {t("পোস্ট অফিস — ০.৫$", "Post — 0.5$")}</button>
            <button onClick={()=>setDeliveryMode("home")} className={`py-2.5 rounded-xl border text-xs font-black ${deliveryMode==="home" ? "bg-gold/15 border-gold/30 text-gold" : "bg-white border-slate-200 text-slate-600"}`}>🏠 {t("হোম — ১$", "Home — 1$")}</button>
          </div>
          <div className="mt-3 text-xs text-slate-600 space-y-1">
            <p className="flex justify-between"><span>{t("প্রতি কপি (প্রিন্ট+প্যাক+শিপ)", "Per copy (print+pack+ship)")}</span><span className="font-bold text-slate-900">{perCopyBase} USD</span></p>
            <p className="flex justify-between"><span>{t("ডেলিভারি ফি (একবার)", "Delivery fee (once)")}</span><span className="font-bold text-slate-900">{deliveryFeeRaw} USD {totalCopies>=2 && deliveryDiscount>0 ? <span className="text-teal">-{deliveryDiscount}% → {deliveryFee.toFixed(2)} USD</span> : ""}</span></p>
            <p className="flex justify-between font-black text-slate-900"><span>{t("মোট", "Total")}</span><span>{totalUsd.toFixed(2)} USD — {totalBdt} ৳</span></p>
            {totalCopies>=2 && <p className="text-teal text-[11px] text-center">{t("ডেলিভারি ফি-তে ছাড় প্রযোজ্য", "Discount on delivery fee")}</p>}
          </div>
          <button onClick={handlePay} disabled={paying || totalCopies===0} className="mt-3 w-full py-3 rounded-xl bg-gold text-black font-black disabled:opacity-50 shadow-md">{paying ? t("প্রক্রিয়াধীন…", "Processing…") : t("অর্ডার করুন", "Order now")}</button>
          {msg && <p className="mt-2 text-xs font-bold text-center text-gold">{msg}</p>}
        </div>
      </div>
    </main>
  );
}

export default function SelectCertificatePage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center pt-20"><div className="w-9 h-9 border-4 border-pink/20 border-t-pink rounded-full animate-spin" /></main>}>
      <SelectView />
    </Suspense>
  );
}

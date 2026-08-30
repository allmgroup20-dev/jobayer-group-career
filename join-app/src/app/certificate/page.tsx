"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/lang";
import { A4_LANDSCAPE_H, useCertScale } from "@/lib/useCertScale";
import { JOIN_CERT_DEFAULTS, useJoinContent } from "@/lib/join-content";
import CertCanvas from "@/components/CertCanvas";
import CertLightbox from "@/components/CertLightbox";

type CertData = {
  certificateId: string;
  name: string;
  completedAt: string | null;
  siteUrl: string;
  target?: number;
};

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value.replace(" ", "T"));
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function CertificateView() {
  const sp = useSearchParams();
  const { lang } = useLang();
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const id = sp.get("id") || "";
  const { ref, scale } = useCertScale();
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const [data, setData] = useState<CertData | null>(null);
  const [showValue, setShowValue] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<"post" | "home">("post");
  const [postOfficeName, setPostOfficeName] = useState("");
  const [postOfficeAddress, setPostOfficeAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [rateInfo, setRateInfo] = useState<{ rate: number; totalUsd: number; totalBdt: number } | null>(null);
  const [deliveryPaying, setDeliveryPaying] = useState(false);
  const [deliveryMsg, setDeliveryMsg] = useState<string | null>(null);
  const [deliveryDiscount, setDeliveryDiscount] = useState(0);

  const { content: certCfg } = useJoinContent("join_certificate", JOIN_CERT_DEFAULTS);
  const costs = certCfg.costs;
  const tier: "foundation" | "ambassador" | "elite" = (() => {
    const cid = data?.certificateId || "";
    if (cid.startsWith("YA-ELITE-")) return "elite";
    if (cid.startsWith("YA-AMB-")) return "ambassador";
    return "foundation";
  })();

  const earnedCount = tier === "elite" ? 3 : tier === "ambassador" ? 2 : 1;
  const shipUsd = tier === "elite" ? ((costs as unknown as { shippingEliteUsd?: number }).shippingEliteUsd ?? 1.0) : costs.shippingUsd;
  const deliveryFeeRaw = deliveryMode === "home" ? costs.homeFeeUsd : costs.postFeeUsd;
  const bundleHandling = earnedCount >= 2 ? (certCfg.bundleHandlingUsd || 0) : 0;
  const deliveryFee = earnedCount >= 2 ? deliveryFeeRaw * (1 - deliveryDiscount / 100) : deliveryFeeRaw;
  const totalBase = deliveryMode === "home"
    ? costs.printUsd + costs.packagingUsd + shipUsd + costs.homeFeeUsd
    : costs.printUsd + costs.packagingUsd + shipUsd + costs.postFeeUsd;
  const totalUsd = totalBase + bundleHandling - (earnedCount >= 2 ? deliveryFeeRaw * deliveryDiscount / 100 : 0);

  useEffect(() => {
    if (!id) { setState("missing"); return; }
    let cancelled = false;
    fetch(`/api/share/certificate?id=${encodeURIComponent(id)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        const json = await r.json() as CertData;
        if (!cancelled) { setData(json); setState("ok"); }
      })
      .catch(() => { if (!cancelled) setState("missing"); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (state !== "ok" || !data) return;
    const rate = certCfg.usdRate || 111;
    const totalBdt = Math.floor(totalUsd * rate);
    setRateInfo({ rate, totalUsd, totalBdt });
  }, [state, data, tier, deliveryMode, totalUsd, earnedCount, deliveryDiscount, certCfg.usdRate]);

  useEffect(() => {
    try {
      const v = localStorage.getItem("original_copy_offer_views");
      const views = v ? Number(v) : 0;
      const steps = [0,5,10,15,20,30,40];
      setDeliveryDiscount(steps[Math.min(views, steps.length-1)] || 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (state !== "ok") return;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const m = j as Record<string, unknown> | null;
        if (!m) return;
        const parts = [m.division, m.district, m.upazila, m.cityCorporation, m.ward, m.area, m.union, m.pourashava, m.city, m.country].filter(Boolean) as string[];
        const addr = parts.join(", ");
        setDeliveryAddress(addr || (m.city as string) || "");
      })
      .catch(() => {});
    // delivery status toast
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const d = p.get("delivery");
      if (d === "success") setDeliveryMsg(t("✅ অর্ডার সফল — শীঘ্রই পোস্ট অফিস/হোমে পাঠানো হবে", "Order successful — will be shipped soon"));
      else if (d === "failed") setDeliveryMsg(t("❌ পেমেন্ট ব্যর্থ", "Payment failed"));
      else if (d === "cancelled") setDeliveryMsg(t("পেমেন্ট বাতিল হয়েছে", "Payment cancelled"));
      if (d) {
        const url = new URL(window.location.href);
        url.searchParams.delete("delivery");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [state, t]);

  if (state === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center page-under-header">
        <div className="w-9 h-9 border-4 border-pink/20 border-t-pink rounded-full animate-spin" />
      </main>
    );
  }

  if (state === "missing" || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center page-under-header px-4">
        <div className="max-w-md w-full card-pop !rounded-[2rem] text-center p-8">
          <div className="text-5xl">🔍</div>
          <h1 className="mt-3 text-2xl font-black text-brand">{t("সার্টিফিকেট পাওয়া যায়নি", "Certificate not found")}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {t("আপনি যে লিংক দিয়ে এসেছেন তা সঠিক নয় বা সার্টিফিকেটটি এখনো তৈরি হয়নি।", "The link you followed is invalid, or this certificate hasn't been issued yet.")}
          </p>
        </div>
      </main>
    );
  }

  const verifyUrl = `${data.siteUrl}/certificate?id=${data.certificateId}`;
  const date = formatDate(data.completedAt);

  const handleDeliveryPay = async () => {
    if (deliveryPaying) return;
    if (deliveryMode === "post" && (!postOfficeName.trim() || !postOfficeAddress.trim())) {
      setDeliveryMsg(t("পোস্ট অফিসের নাম ও ঠিকানা দিন", "Please enter post office name and address"));
      return;
    }
    setDeliveryPaying(true);
    setDeliveryMsg(null);
    try {
      const res = await fetch("/api/delivery/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, deliveryMode, postOfficeName, postOfficeAddress, shippingAddress: deliveryAddress, bundleCount: earnedCount, discount: earnedCount >= 2 ? deliveryDiscount : 0 }),
      });
      const j = await res.json().catch(() => ({})) as { GatewayPageURL?: string; error?: string };
      if (!res.ok) {
        setDeliveryMsg(j.error || t("পেমেন্ট শুরু করা যায়নি", "Could not start payment"));
        return;
      }
      if (j.GatewayPageURL) window.location.href = j.GatewayPageURL;
    } catch {
      setDeliveryMsg(t("পেমেন্ট শুরু করা যায়নি", "Could not start payment"));
    } finally {
      setDeliveryPaying(false);
    }
  };

  return (
    <main className="min-h-screen page-under-header pb-16 px-4 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 rounded-2xl bg-teal/15 border border-teal/30 text-[#2DD4BF] text-xs font-bold px-4 py-3 print:hidden">
          ✅ এই সার্টিফিকেটটি অনলাইনে যাচাইকৃত — আসল ও বৈধ। নিয়োগকর্তা/যেকেউ এই পেজ দেখে যাচাই করতে পারেন।
        </div>

        {/* Value — on top */}
        <div className="mt-4 print:hidden">
          <button
            onClick={() => setShowValue((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 active:scale-[0.99] transition-all"
          >
            <span className="text-xs font-black text-gold">🎓 {t("এই সার্টিফিকেটের মূল্য", "What this certificate means")}</span>
            <span className={`text-white/60 text-sm transition-transform ${showValue ? "rotate-180" : ""}`}>▾</span>
          </button>

          {showValue && (
            <div className="mt-3 rounded-2xl bg-white/[0.03] border border-white/10 p-6">
              <div className={`mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-black tracking-wider uppercase ${tier === "elite" ? "bg-gold/15 border-gold/30 text-gold" : tier === "ambassador" ? "bg-teal/15 border-teal/30 text-teal" : "bg-white/10 border-white/15 text-white/70"}`}>
                {tier === "elite" ? t("Elite · সর্বোচ্চ সম্মান", "Elite · Highest Honor")
                  : tier === "ambassador" ? t("Ambassador · প্রফেশনাল", "Ambassador · Professional")
                  : t("Foundation • এন্ট্রি", "Foundation • Entry")}
              </div>
              <div className="mt-2 space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-lg">📜</div>
              <div>
                <p className="text-sm font-black text-white">{t("কী ধরনের সার্টিফিকেট", "Type of certificate")}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{t((certCfg.tierDescriptions as Record<string, Record<string,string>>)[tier].typeBn, (certCfg.tierDescriptions as Record<string, Record<string,string>>)[tier].typeEn)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-teal/15 border border-teal/30 flex items-center justify-center text-lg">💼</div>
              <div>
                <p className="text-sm font-black text-white">{t("কোন কোন কাজে ব্যবহার করা যাবে", "Where this experience applies")}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{t((certCfg.tierDescriptions as Record<string, Record<string,string>>)[tier].whereBn, (certCfg.tierDescriptions as Record<string, Record<string,string>>)[tier].whereEn)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-pink/15 border border-pink/30 flex items-center justify-center text-lg">🚀</div>
              <div>
                <p className="text-sm font-black text-white">{t("ক্যারিয়ার সম্ভাবনা", "Career Opportunity")}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{t((certCfg.tierDescriptions as Record<string, Record<string,string>>)[tier].careerBn, (certCfg.tierDescriptions as Record<string, Record<string,string>>)[tier].careerEn)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-violet/15 border border-violet/30 flex items-center justify-center text-lg">📈</div>
              <div>
                <p className="text-sm font-black text-white">{t("কেন বিশ্বাসযোগ্য", "Why it's trusted")}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{t((certCfg.tierDescriptions as Record<string, Record<string,string>>)[tier].trustBn, (certCfg.tierDescriptions as Record<string, Record<string,string>>)[tier].trustEn)}</p>
              </div>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Certificate — fixed A4-landscape canvas (297x210mm), scaled to fit.
            Clicking it opens the fullscreen zoom viewer (CertLightbox). */}
        {/* View — middle */}
        <div className="mt-4 print:hidden">
          <button
            onClick={() => setShowCertificate((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 active:scale-[0.99] transition-all"
          >
            <span className="text-xs font-black text-white">👁️ {t("আপনার সার্টিফিকেট দেখুন", "View your certificate")}</span>
            <span className={`text-white/60 text-sm transition-transform ${showCertificate ? "rotate-180" : ""}`}>▾</span>
          </button>
          {showCertificate && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowZoom(true)}
                aria-label={t("সার্টিফিকেট বড় করে দেখুন", "View certificate larger")}
                className="block w-full text-left active:scale-[0.995] transition-transform"
              >
                <div ref={ref} className="w-full overflow-hidden rounded-2xl" style={{ height: A4_LANDSCAPE_H * scale }}>
                  <CertCanvas
                    className="print-area"
                    tier={tier}
                    data={{
                      name: data.name,
                      certificateId: data.certificateId,
                      date,
                      qrValue: verifyUrl,
                      siteUrl: data.siteUrl,
                    }}
                    style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
                  />
                </div>
              </button>
              <p className="mt-2 rounded-xl bg-teal/10 border border-teal/30 px-3 py-2 text-center text-[11px] font-black text-[#2DD4BF]">
                🔍 {t("সার্টিফিকেটে ট্যাপ/ক্লিক করে বড় করে জুম করে দেখুন", "Tap/click the certificate to view it larger and zoom in")}
              </p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => window.print()} className="btn-excite text-sm !py-3 px-5">⬇️ ডাউনলোড</button>
                <a href="/" className="btn-outline text-sm !py-3 px-5">হোমে যান</a>
              </div>
            </div>
          )}
        </div>

        <CertLightbox
          open={showZoom}
          onClose={() => setShowZoom(false)}
          tier={tier}
          data={{
            name: data.name,
            certificateId: data.certificateId,
            date,
            qrValue: verifyUrl,
            siteUrl: data.siteUrl,
          }}
        />

        <style>{`
          @media print {
            @page { size: A4 landscape; margin: 0; }
            body * { visibility: hidden !important; }
            .print-area, .print-area * { visibility: visible !important; }
            .print-area {
              transform: none !important;
              width: 297mm !important;
              height: 210mm !important;
              position: absolute !important;
              left: 0 !important; top: 0 !important;
              box-shadow: none !important; border-radius: 0 !important;
            }
          }
        `}</style>

        {/* Order — bottom */}
        <div className="mt-4 print:hidden">
          <button
            onClick={() => setShowDelivery((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 active:scale-[0.99] transition-all"
          >
            <span className="text-xs font-black text-gold">📮 {t("আপনার অরিজিনাল সার্টিফিকেট অর্ডার করুন", "Order your original certificate")}</span>
            <span className={`text-white/60 text-sm transition-transform ${showDelivery ? "rotate-180" : ""}`}>▾</span>
          </button>
          {showDelivery && (
        <div id="delivery-card" className="mt-3 rounded-2xl bg-white/[0.03] border border-white/10 p-6 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-lg">📮</div>
            <div>
              <h3 className="text-sm font-black text-white">{t("অরিজিনাল সার্টিফিকেট — হাতে পান", "Get Your Original Certificate")}</h3>
              <p className="text-[11px] font-bold text-white/50">{tier === "elite" ? t("সিঙ্গাপুর হেড অফিস → বাংলাদেশ", "Singapore HQ → Bangladesh") : t("ইন্ডিয়া হেড অফিস → বাংলাদেশ", "India HQ → Bangladesh")}</p>
            </div>
          </div>
          <div className="mt-2 px-3 py-2 rounded-xl bg-gold/10 border border-gold/30 text-center">
            <p className="text-[11px] font-black text-gold">💰 {t(`সব খরচ অন্তর্ভুক্ত — প্রিন্ট, প্যাকেজিং, শিপিং — কোনো হিডেন চার্জ নেই (বিশেষ রেট ${certCfg.usdRate} টাকা/ডলার)`, `All costs included — print, packaging, shipping — no hidden fees (special rate ${certCfg.usdRate} Taka/USD)`)}</p>
          </div>

          <div className="mt-3 rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <p className="text-[11px] font-black text-white/70 uppercase tracking-wide">{t("ধাপ অনুযায়ী খরচ", "Cost breakdown")}</p>
            <div className="mt-2 space-y-1.5 text-xs leading-relaxed">
              <p className="flex justify-between"><span className="text-white/60">{t(`① ${costs.printLabelBn} — ${costs.printUsd} USD`, `① ${costs.printLabelEn} — ${costs.printUsd} USD`)}</span><span className="text-white/40 text-[10px]">{t("অন্তর্ভুক্ত", "included")}</span></p>
              <p className="flex justify-between"><span className="text-white/60">{t(`② ${costs.packagingLabelBn} — ${costs.packagingUsd} USD`, `② ${costs.packagingLabelEn} — ${costs.packagingUsd} USD`)}</span><span className="text-white/40 text-[10px]">{t("অন্তর্ভুক্ত", "included")}</span></p>
              <p className="flex justify-between"><span className="text-white/60">{tier === "elite" ? t(`③ ${costs.shippingEliteLabelBn} — ${shipUsd} USD`, `③ ${costs.shippingEliteLabelEn} — ${shipUsd} USD`) : t(`③ ${costs.shippingLabelBn} — ${costs.shippingUsd} USD`, `③ ${costs.shippingLabelEn} — ${costs.shippingUsd} USD`)}</span><span className="font-black text-white">{(shipUsd * certCfg.usdRate).toLocaleString("en-US")} টাকা <span className="text-[10px] text-white/40">({shipUsd} USD)</span></span></p>
              <p className="flex justify-between">
                <span className="text-white/60">{deliveryMode === "home" ? t(`④ ${costs.homeLabelBn} — ${costs.homeFeeUsd} USD (বান্ডেলে একবার)`, `④ ${costs.homeLabelEn} — ${costs.homeFeeUsd} USD (once per bundle)`) : t(`④ ${costs.postLabelBn} — ${costs.postFeeUsd} USD (বান্ডেলে একবার)`, `④ ${costs.postLabelEn} — ${costs.postFeeUsd} USD (once per bundle)`)}</span>
                <span className="font-black text-white">
                  {earnedCount >= 2 && deliveryDiscount > 0 ? (
                    <>
                      <span className="line-through text-white/40 mr-1">{(deliveryFeeRaw * certCfg.usdRate).toLocaleString("en-US")}৳</span>
                      {(deliveryFee * certCfg.usdRate).toLocaleString("en-US")} টাকা <span className="text-teal text-[10px]">-{deliveryDiscount}%</span>
                    </>
                  ) : (
                    <>{(deliveryFeeRaw * certCfg.usdRate).toLocaleString("en-US")} টাকা <span className="text-[10px] text-white/40">({deliveryFeeRaw} USD)</span></>
                  )}
                </span>
              </p>
              {bundleHandling > 0 && earnedCount >= 2 && <p className="text-[10px] text-white/40 text-right">{t(`+ বান্ডেল হ্যান্ডলিং ${bundleHandling} USD`, `+ bundle handling ${bundleHandling} USD`)}</p>}
              {earnedCount >= 2 && deliveryDiscount > 0 && <p className="text-[10px] font-bold text-teal text-right">🎉 {deliveryDiscount}% {t("ছাড় প্রযোজ্য — ডেলিভারি ফি-তে", "off on delivery fee")}</p>}
              {earnedCount >= 2 && deliveryDiscount >= 40 && <p className="text-[10px] font-bold text-gold text-right">{t("🎉 আপনাকে সর্বোচ্চ ৪০% ছাড় দেওয়া হয়েছে — এর চেয়ে বেশি কোনোভাবেই সম্ভব নয়","Maximum 40% discount — no more possible")}</p>}
              {earnedCount === 1 && <p className="text-[10px] text-white/40 text-right">{t("১টি-তে ছাড় নেই, ২/৩টি একসাথে নিলে ছাড়","No discount for 1, discount for 2/3 bundle")}</p>}
              <div className="pt-2 mt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm font-black text-white">{t("মোট", "Total")}</span>
                <span className="text-right">
                  <span className="text-sm font-black text-gold">{rateInfo ? `${rateInfo.totalBdt.toLocaleString("en-US")} টাকা` : `${totalUsd.toFixed(2)} USD`}</span>
                  <span className="ml-2 text-[11px] font-bold text-white/40">({totalUsd.toFixed(2)} USD{t(" • আজকের রেটে", " at today's rate")})</span>
                </span>
              </div>
              <p className="text-[10px] text-white/40 text-right">1 USD = {certCfg.usdRate} BDT <span className="line-through opacity-40">{certCfg.marketRate} BDT</span> • {t("বিশেষ ছাড় • পয়সা বাদ, শুধু টাকা", "special discount • floor, no paisa")}</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <p className="text-[11px] font-black text-white/70 text-center">
              {earnedCount === 1 ? t("আপনি ১টি সার্টিফিকেট অর্জন করেছেন", "You have earned 1 certificate") : earnedCount === 2 ? t("আপনি ২টি সার্টিফিকেট (Foundation + Ambassador) অর্জন করেছেন — একসাথে অর্ডারে ডেলিভারি একবারই", "You have earned 2 certificates (Foundation + Ambassador) — single delivery for bundle") : t("আপনি ৩টি সার্টিফিকেট (Foundation + Ambassador + Elite) অর্জন করেছেন — একসাথে অর্ডারে ডেলিভারি একবারই", "You have earned 3 certificates (Foundation + Ambassador + Elite) — single delivery for bundle")}
            </p>
            {earnedCount >= 2 && <p className="mt-1 text-[10px] text-teal text-center">{t(certCfg.bundleNoteBn, certCfg.bundleNoteEn)}</p>}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setDeliveryMode("post")} className={`py-2.5 rounded-xl border text-xs font-black ${deliveryMode === "post" ? "bg-teal/15 border-teal/30 text-teal" : "bg-white/5 border-white/10 text-white/60"}`}>📍 {t("পোস্ট অফিসে নেব", "Post Office")}</button>
            <button onClick={() => setDeliveryMode("home")} className={`py-2.5 rounded-xl border text-xs font-black ${deliveryMode === "home" ? "bg-gold/15 border-gold/30 text-gold" : "bg-white/5 border-white/10 text-white/60"}`}>🏠 {t("হোম ডেলিভারি (+১ ডলার)", "Home (+1 USD)")}</button>
          </div>
          <p className="mt-1.5 text-[10px] text-white/40 text-center">{deliveryMode === "post" ? t("পোস্ট অফিসে ডেলিভারি — হোম ডেলিভারি নিলে +১ ডলার", "Post office delivery — +1 USD for home") : t("হোম ডেলিভারি — পোস্ট অফিসের চেয়ে ১ ডলার বেশি", "Home delivery — 1 USD more than post office")}</p>

          <div className="mt-3 rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black text-white/70">{t("আপনার জমা করা ঠিকানা", "Your saved address")}</p>
              <button onClick={() => setEditingAddress((v) => !v)} className="text-[11px] font-black text-gold underline">{editingAddress ? t("বন্ধ করুন", "Close") : t("✏️ এডিট", "Edit")}</button>
            </div>
            {!editingAddress ? (
              <p className="mt-1 text-xs leading-relaxed text-white/80">{deliveryAddress || t("ঠিকানা লোড হচ্ছে…", "Loading address…")}</p>
            ) : (
              <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} rows={3} placeholder={t("আপনার ঠিকানা লিখুন", "Enter your address")} className="mt-2 w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none" />
            )}
          </div>

          {deliveryMode === "post" ? (
            <div className="mt-3 space-y-2">
              <input value={postOfficeName} onChange={(e) => setPostOfficeName(e.target.value)} placeholder={t("পোস্ট অফিসের নাম * (যেমন — GPO, Dhaka)", "Post office name * (e.g. GPO, Dhaka)")} className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold placeholder-white/40 focus:outline-none" />
              <input value={postOfficeAddress} onChange={(e) => setPostOfficeAddress(e.target.value)} placeholder={t("পোস্ট অফিসের ঠিকানা *", "Post office address *")} className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold placeholder-white/40 focus:outline-none" />
              <p className="text-[10px] text-white/40 leading-relaxed">{t("হোম ডেলিভারি না নিলে পোস্ট অফিসে ডেলিভারি হবে — পোস্ট অফিসের নাম ও ঠিকানা দিন।", "Without home delivery, it will be sent to the post office — enter its name and address.")}</p>
            </div>
          ) : (
            <p className="mt-2 text-[10px] text-white/50 leading-relaxed">{t("হোম ডেলিভারি নির্বাচিত — আপনার বাসার ঠিকানায় পাঠানো হবে।", "Home delivery selected — will be sent to your home address.")}</p>
          )}

          {deliveryMsg && (
            <p className={`mt-3 text-xs font-bold text-center ${deliveryMsg.includes("✅") ? "text-teal" : deliveryMsg.includes("❌") ? "text-red" : "text-gold"}`}>{deliveryMsg}</p>
          )}

          <button
            onClick={handleDeliveryPay}
            disabled={deliveryPaying}
            className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-gold to-amber text-black text-sm font-black active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {deliveryPaying ? t("প্রক্রিয়াধীন…", "Processing…") : rateInfo ? t(`💳 ${rateInfo.totalBdt.toLocaleString("en-US")} টাকা — SSLCommerz দিয়ে পে করুন`, `Pay ${rateInfo.totalBdt.toLocaleString("en-US")} Taka via SSLCommerz`) : t("💳 পে করুন — SSLCommerz", "Pay via SSLCommerz")}
          </button>
          <p className="mt-1.5 text-[10px] text-white/40 text-center">SSLCommerz • bKash / Nagad / Card • {t("শুধু টাকা, পয়সা বাদ — আজকের রেটে • পেমেন্টের পরেই অর্ডার কনফার্ম হবে", "Taka only, no paisa — at today's rate • order confirmed right after payment")}</p>
        </div>
          )}
        </div>

        {/* Next, even more valuable certificate teaser */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-gold/20 via-pink/20 to-violet/20 border border-gold/30 p-6 text-center print:hidden">
          <div className="text-4xl">🏆</div>
          <h2 className="mt-2 text-lg font-black text-white">
            {t("আরেকটি আরও মূল্যবান সার্টিফিকেট অপেক্ষা করছে!", "An even more valuable certificate is waiting!")}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-white/70">
            {t("অভিনন্দন! এই সার্টিফিকেটের পর আপনার জন্য আরও একটি — এর চেয়েও বেশি মূল্যবান সার্টিফিকেট — দেওয়া হবে। এটি দেখতে হোমে গিয়ে নতুন অপশনটি চেক করুন।", "Congratulations! After this certificate, an even more valuable one awaits you. Go to Home and check the new option to see it.")}
          </p>
          <a href="/" className="mt-4 btn-excite w-full text-sm !py-3.5 block text-center">
            🏠 {t("হোমে গিয়ে দেখুন", "Go Home to see it")}
          </a>
        </div>
      </div>
    </main>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-9 h-9 border-4 border-pink/20 border-t-pink rounded-full animate-spin" />
      </main>
    }>
      <CertificateView />
    </Suspense>
  );
}
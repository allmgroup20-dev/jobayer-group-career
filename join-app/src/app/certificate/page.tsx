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
  const [showZoom, setShowZoom] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<"post" | "home">("post");
  const [postOfficeName, setPostOfficeName] = useState("");
  const [postOfficeAddress, setPostOfficeAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [rateInfo, setRateInfo] = useState<{ rate: number; totalUsd: number; totalBdt: number } | null>(null);
  const [deliveryPaying, setDeliveryPaying] = useState(false);
  const [deliveryMsg, setDeliveryMsg] = useState<string | null>(null);
  const [deliveryDiscount, setDeliveryDiscount] = useState(0);
  const [showDelivery, setShowDelivery] = useState(false);

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
    // delivery status — global banner + auto-open, handles all statuses
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const d = p.get("delivery");
      if (d) {
        if (d === "success") { setDeliveryMsg(t("✅ অর্ডার সফল — শীঘ্রই পোস্ট অফিস/হোমে পাঠানো হবে", "Order successful — will be shipped soon")); setShowDelivery(true); }
        else if (d === "failed") { setDeliveryMsg(t("❌ পেমেন্ট ব্যর্থ — আবার চেষ্টা করুন", "Payment failed — please try again")); setShowDelivery(true); }
        else if (d === "cancelled") { setDeliveryMsg(t("↩️ পেমেন্ট বাতিল হয়েছে", "Payment cancelled")); setShowDelivery(true); }
        else if (d === "amount_mismatch") { setDeliveryMsg(t("⚠️ টাকার পরিমাণ মিলেনি — সাপোর্টে যোগাযোগ করুন", "Amount mismatch — please contact support")); setShowDelivery(true); }
        else if (d === "error") { setDeliveryMsg(t("❌ পেমেন্ট যাচাই করা যায়নি", "Payment verification failed")); setShowDelivery(true); }
        else { setDeliveryMsg(t(`ℹ️ পেমেন্ট: ${d}`, `Payment: ${d}`)); setShowDelivery(true); }
        const url = new URL(window.location.href);
        url.searchParams.delete("delivery");
        // keep clean URL after 5s so banner stays visible
        setTimeout(() => window.history.replaceState({}, "", url.toString()), 5000);
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
        {deliveryMsg && (
          <div className={`mb-4 rounded-2xl border text-xs font-black px-4 py-3 print:hidden ${deliveryMsg.includes("✅") ? "bg-teal/15 border-teal/30 text-[#2DD4BF]" : deliveryMsg.includes("❌") || deliveryMsg.includes("⚠️") ? "bg-red-500/15 border-red-500/30 text-red-300" : "bg-gold/15 border-gold/30 text-gold"}`}>
            {deliveryMsg}
          </div>
        )}
        <div className="mb-4 rounded-2xl bg-teal/15 border border-teal/30 text-[#2DD4BF] text-xs font-bold px-4 py-3 print:hidden">
          ✅ এই সার্টিফিকেটটি অনলাইনে যাচাইকৃত — আসল ও বৈধ। নিয়োগকর্তা/যেকেউ এই পেজ দেখে যাচাই করতে পারেন।
        </div>

        {/* Certificate — directly visible */}
        <div className="mt-4">
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
            <button onClick={() => window.print()} className="flex-1 btn-excite text-sm !py-3">⬇️ ডাউনলোড</button>
            <a href={`/certificate/select?id=${data.certificateId}`} className="flex-1 btn-excite text-sm !py-3 text-center">📮 {t("আপনার অরিজিনাল সার্টিফিকেট অর্ডার করুন", "Order your original certificate")}</a>
          </div>
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
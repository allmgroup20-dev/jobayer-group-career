"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/lang";
import { A4_LANDSCAPE_H, useCertScale } from "@/lib/useCertScale";
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
  const [deliveryMode, setDeliveryMode] = useState<"post" | "home">("post");
  const [postOfficeName, setPostOfficeName] = useState("");
  const [postOfficeAddress, setPostOfficeAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [rateInfo, setRateInfo] = useState<{ rate: number; totalUsd: number; totalBdt: number } | null>(null);
  const [deliveryPaying, setDeliveryPaying] = useState(false);
  const [deliveryMsg, setDeliveryMsg] = useState<string | null>(null);

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

  if (state === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-9 h-9 border-4 border-pink/20 border-t-pink rounded-full animate-spin" />
      </main>
    );
  }

  if (state === "missing" || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-md w-full card-pop !rounded-[2rem] text-center p-8">
          <div className="text-5xl">🔍</div>
          <h1 className="mt-3 text-2xl font-black text-brand">সার্টিফিকেট পাওয়া যায়নি</h1>
          <p className="mt-2 text-sm text-ink-soft">
            আপনি যে লিংক দিয়ে এসেছেন তা সঠিক নয় বা সার্টিফিকেটটি এখনো তৈরি হয়নি।
          </p>
        </div>
      </main>
    );
  }

  const verifyUrl = `${data.siteUrl}/certificate?id=${data.certificateId}`;
  const date = formatDate(data.completedAt);
  const tier: "foundation" | "ambassador" | "elite" = (() => {
    const id = data.certificateId || "";
    if (id.startsWith("YA-ELITE-")) return "elite";
    if (id.startsWith("YA-AMB-")) return "ambassador";
    return "foundation";
  })();

  const baseUsd = tier === "elite" ? 3 : 2;
  const totalUsd = baseUsd + (deliveryMode === "home" ? 1 : 0);

  useEffect(() => {
    fetch(`/api/delivery/rate?tier=${tier}&mode=${deliveryMode}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const d = j as { totalBdt: number; rate: number; totalUsd: number } | null;
        if (d && typeof d.totalBdt === "number") setRateInfo({ rate: d.rate, totalUsd: d.totalUsd, totalBdt: d.totalBdt });
      })
      .catch(() => {});
  }, [tier, deliveryMode]);

  useEffect(() => {
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
  }, [t]);

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
        body: JSON.stringify({ tier, deliveryMode, postOfficeName, postOfficeAddress, shippingAddress: deliveryAddress }),
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
    <main className="min-h-screen pt-20 pb-16 px-4 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 print:hidden gap-2 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="btn-gold text-sm !py-3 px-5"
            >
              ⬇️ ডাউনলোড
            </button>
            <button
              onClick={() => document.getElementById("delivery-card")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-outline text-sm !py-3 px-5"
            >
              📮 {t("অরিজিনাল কপি অর্ডার করুন", "Order Original Copy")}
            </button>
          </div>
          <a href="/" className="btn-outline text-sm !py-3 px-5">হোমে যান</a>
        </div>

        <div className="mb-4 rounded-2xl bg-teal/15 border border-teal/30 text-teal text-xs font-bold px-4 py-3 print:hidden">
          ✅ এই সার্টিফিকেটটি অনলাইনে যাচাইকৃত — আসল ও বৈধ। নিয়োগকর্তা/যেকেউ এই পেজ দেখে যাচাই করতে পারেন।
        </div>

        {/* Certificate — fixed A4-landscape canvas (297x210mm), scaled to fit.
            Clicking it opens the fullscreen zoom viewer (CertLightbox). */}
        <button
          type="button"
          onClick={() => setShowZoom(true)}
          aria-label={t("সার্টিফিকেট বড় করে দেখুন", "View certificate larger")}
          className="mt-2 block w-full text-left active:scale-[0.995] transition-transform"
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

        <p className="mt-2 rounded-xl bg-teal/10 border border-teal/30 px-3 py-2 text-center text-[11px] font-black text-teal print:hidden">
          🔍 {t("সার্টিফিকেটে ট্যাপ/ক্লিক করে বড় করে জুম করে দেখুন", "Tap/click the certificate to view it larger and zoom in")}
        </p>

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

        {/* Value / benefits — behind a button so the page stays calm */}
        <div className="mt-6 print:hidden">
          <button
            onClick={() => setShowValue((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 active:scale-[0.99] transition-all"
          >
            <span className="text-xs font-black text-gold">🎓 {t("এই সার্টিফিকেটের মূল্য", "What this certificate means")}</span>
            <span className={`text-white/60 text-sm transition-transform ${showValue ? "rotate-180" : ""}`}>▾</span>
          </button>

          {showValue && (
            <div className="mt-3 rounded-2xl bg-white/[0.03] border border-white/10 p-6">
              {/* Tier badge */}
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
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {tier === "elite"
                    ? t("Elite Final — YouTube Earner কমিউনিটির সর্বোচ্চ সম্মান। অসাধারণ পারফরম্যান্স ও দেশব্যাপী লার্নারদের মেন্টরিং-এর বিশ্বমানের স্বীকৃতি। ৩ জন গ্লোবাল এক্সিকিউটিভ সই + QR যাচাই।", "Elite Final — the highest honor of the YouTube Earner community. World-class recognition for extraordinary performance and nationwide learner mentoring. Signed by 3 global executives + QR verification.")
                    : tier === "ambassador"
                    ? t("রেফারেল অ্যাম্বাসেডর — কমিউনিটি বিল্ডিং ও ডিজিটাল মার্কেটিং-এ প্রিমিয়াম স্বীকৃতি। বিশ্বস্ত অ্যাম্বাসেডর হিসেবে নেটওয়ার্ক গড়ার সরকারি-মানের সনদ। QR যাচাই সহ।", "Referral Ambassador — premium recognition for community-building and digital marketing. Verifiable certificate as a trusted ambassador. With QR verification.")
                    : t("ফাউন্ডেশন — কমিউনিটি বিল্ডিং ও ডিজিটাল মার্কেটিং-এর এন্ট্রি-লেভেল অভিজ্ঞতার সনদ। প্রোফাইল সম্পন্ন ও প্রাথমিক দক্ষতা প্রমাণের স্বীকৃতি। QR যাচাই সহ।", "Foundation — entry-level certificate of community-building and digital marketing. Recognition for completing your profile and proving core skills. With QR verification.")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-teal/15 border border-teal/30 flex items-center justify-center text-lg">💼</div>
              <div>
                <p className="text-sm font-black text-white">{t("কোন কোন কাজে ব্যবহার করা যাবে", "Where this experience applies")}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {tier === "elite"
                    ? t("টিম লিড, প্রজেক্ট ম্যানেজার, ডিজিটাল মার্কেটিং লিড, ইনফ্লুয়েন্সার ম্যানেজার ও স্টার্টআপ লিডারশিপ ভূমিকায় CV-তে সবচেয়ে বেশি প্রাধান্য পায়।", "Carries the most weight for team lead, project manager, digital marketing lead, influencer manager and startup leadership roles.")
                    : tier === "ambassador"
                    ? t("ডিজিটাল মার্কেটিং এসিস্ট্যান্ট, কমিউনিটি ম্যানেজার, সেলস/প্রমোশন এক্সিকিউটিভ, অ্যাফিলিয়েট মার্কেটার ও ফ্রিল্যান্সিং-এ মাঝারি-স্তরের ভূমিকায় বাড়তি সুবিধা।", "Adds strong value for digital marketing assistant, community manager, sales/promotion executive, affiliate marketer and freelancing — mid-level advantage.")
                    : t("ডিজিটাল মার্কেটিং এসিস্ট্যান্ট, কমিউনিটি ম্যানেজার, সেলস/প্রমোশন এক্সিকিউটিভ, অ্যাফিলিয়েট মার্কেটার ও ফ্রিল্যান্সিং ভূমিকায় CV-তে এন্ট্রি হিসেবে কাজে লাগে।", "Useful as an entry credential for digital marketing assistant, community manager, sales/promotion executive, affiliate marketer and freelancing.")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-pink/15 border border-pink/30 flex items-center justify-center text-lg">💰</div>
              <div>
                <p className="text-sm font-black text-white">{t("মাসিক আয় সম্ভাবনা", "Monthly income potential")}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {tier === "elite"
                    ? t("এই সর্বোচ্চ সার্টিফিকেট দিয়ে লিডারশিপ ও এডভান্সড ডিজিটাল মার্কেটিং ভূমিকায় সাধারণত ৳৬০,০০০–৳১,২০,০০০+ আয় সম্ভব — অভিজ্ঞতা ও নিয়োগকর্তার ওপর নির্ভর করে।", "With this top certificate, leadership and advanced digital marketing roles typically pay ৳60,000–৳120,000+ per month, depending on experience and employer.")
                    : tier === "ambassador"
                    ? t("অ্যাম্বাসেডর সার্টিফিকেট দিয়ে মিড-লেভেল ডিজিটাল মার্কেটিং ও কমিউনিটি ভূমিকায় সাধারণত ৳৩০,০০০–৳৬০,০০০ আয় সম্ভব।", "With the Ambassador certificate, mid-level digital marketing and community roles typically pay ৳30,000–৳60,000 per month.")
                    : t("ফাউন্ডেশন সার্টিফিকেট দিয়ে এন্ট্রি-লেভেল ডিজিটাল মার্কেটিং, কমিউনিটি ম্যানেজমেন্ট ও সেলস ভূমিকায় সাধারণত মাসে ৳১৫,০০০–৳৩০,০০০ আয় সম্ভব।", "With the Foundation certificate, entry-level digital marketing, community management and sales roles typically pay ৳15,000–৳30,000 per month.")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-violet/15 border border-violet/30 flex items-center justify-center text-lg">📈</div>
              <div>
                <p className="text-sm font-black text-white">{t("কেন বিশ্বাসযোগ্য", "Why it's trusted")}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {tier === "elite"
                    ? t("৩ জন গ্লোবাল এক্সিকিউটিভ (CEO, CBO, APAC President) সই + ইউনিক ID + QR — সর্বোচ্চ যাচাইযোগ্যতা।", "Signed by 3 global executives (CEO, CBO, APAC President) + unique ID + QR — maximum verifiability.")
                    : tier === "ambassador"
                    ? t("Country Manager (PREETI LOBANA) সই + সিল + QR — নিয়োগকর্তা এই পেজ থেকেই যাচাই করতে পারেন।", "Signed by Country Manager (PREETI LOBANA) + seal + QR — any employer can verify on this page.")
                    : t("Authorized Signatory + ইউনিক ID + QR — এন্ট্রি-লেভেল যাচাইযোগ্য সনদ।", "Authorized Signatory + unique ID + QR — verifiable entry-level credential.")}
                </p>
              </div>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Original Certificate Delivery — India/Singapore -> Bangladesh Post Office / Home */}
        <div id="delivery-card" className="mt-6 rounded-2xl bg-white/[0.03] border border-white/10 p-6 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-lg">📮</div>
            <div>
              <h3 className="text-sm font-black text-white">{t("অরিজিনাল সার্টিফিকেট — হাতে পান", "Get Your Original Certificate")}</h3>
              <p className="text-[11px] font-bold text-white/50">{tier === "elite" ? t("সিঙ্গাপুর হেড অফিস → বাংলাদেশ", "Singapore HQ → Bangladesh") : t("ইন্ডিয়া হেড অফিস → বাংলাদেশ", "India HQ → Bangladesh")}</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-white/[0.04] border border-white/10 p-3">
            <p className="text-[11px] font-black text-white/70 uppercase tracking-wide">{t("ধাপ অনুযায়ী খরচ", "Cost breakdown")}</p>
            <div className="mt-2 space-y-1.5 text-xs leading-relaxed">
              <p className="flex justify-between"><span className="text-white/60">{t("① ভালো কাগজে প্রিন্ট", "① Print on quality paper")}</span><span className="text-white/40 text-[10px]">{t("অন্তর্ভুক্ত", "included")}</span></p>
              <p className="flex justify-between"><span className="text-white/60">{t("② প্যাকেজিং", "② Packaging")}</span><span className="text-white/40 text-[10px]">{t("অন্তর্ভুক্ত", "included")}</span></p>
              <p className="flex justify-between"><span className="text-white/60">{tier === "elite" ? t("③ সিঙ্গাপুর থেকে বাংলাদেশ পোস্ট অফিসে পাঠানো", "③ Ship from Singapore to Bangladesh Post Office") : t("③ ইন্ডিয়া হেড অফিস থেকে বাংলাদেশ পোস্ট অফিসে পাঠানো", "③ Ship from India HQ to Bangladesh Post Office")}</span><span className="font-black text-white">{baseUsd} USD</span></p>
              {deliveryMode === "home" && (
                <p className="flex justify-between"><span className="text-white/60">{t("④ হোম ডেলিভারি (অতিরিক্ত)", "④ Home delivery (extra)")}</span><span className="font-black text-gold">+1 USD</span></p>
              )}
              <div className="pt-2 mt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm font-black text-white">{t("মোট", "Total")}</span>
                <span className="text-right">
                  <span className="text-sm font-black text-gold">{rateInfo ? `${rateInfo.totalBdt.toLocaleString("en-US")} টাকা` : `${totalUsd} USD`}</span>
                  <span className="ml-2 text-[11px] font-bold text-white/40">({totalUsd} USD{t(" • আজকের রেটে", " at today's rate")})</span>
                </span>
              </div>
              {rateInfo && <p className="text-[10px] text-white/40 text-right">{t("আজকের রেট:", "Today's rate:")} 1 USD = {rateInfo.rate.toFixed(2)} BDT • {t("পয়সা বাদ, শুধু টাকা", "floor, no paisa")}</p>}
            </div>
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
          <p className="mt-1.5 text-[10px] text-white/40 text-center">SSLCommerz • bKash / Nagad / Card • {t("শুধু টাকা, পয়সা বাদ — আজকের রেটে", "Taka only, no paisa — at today's rate")}</p>
        </div>

        {/* Next, even more valuable certificate teaser */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-gold/20 via-pink/20 to-violet/20 border border-gold/30 p-6 text-center print:hidden">
          <div className="text-4xl">🏆</div>
          <h2 className="mt-2 text-lg font-black gradient-text">
            {t("আরেকটি আরও মূল্যবান সার্টিফিকেট অপেক্ষা করছে!", "An even more valuable certificate is waiting!")}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-white/70">
            {t("অভিনন্দন! এই সার্টিফিকেটের পর আপনার জন্য আরও একটি — এর চেয়েও বেশি মূল্যবান সার্টিফিকেট — দেওয়া হবে। এটি দেখতে হোমে গিয়ে নতুন অপশনটি চেক করুন।", "Congratulations! After this certificate, an even more valuable one awaits you. Go to Home and check the new option to see it.")}
          </p>
          <a href="/" className="mt-4 btn-gold w-full text-sm !py-3.5 block text-center">
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
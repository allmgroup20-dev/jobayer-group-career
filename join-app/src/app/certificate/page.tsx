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

  return (
    <main className="min-h-screen pt-20 pb-16 px-4 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="btn-gold text-sm !py-3 px-5"
          >
            🖨️ PDF/প্রিন্ট করুন
          </button>
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
              tier="foundation"
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
          tier="foundation"
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
              <div className="mt-2 space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-lg">📜</div>
              <div>
                <p className="text-sm font-black text-white">{t("কী ধরনের সার্টিফিকেট", "Type of certificate")}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {t("রেফারেল অ্যাম্বাসেডর — কমিউনিটি বিল্ডিং ও ডিজিটাল মার্কেটিং অভিজ্ঞতার সরকারি-মানের সনদ। QR কোড, ইউনিক সার্টিফিকেট ID ও অনলাইন যাচাই — নিয়োগকর্তা যেকোনো সময় এই পেজে গিয়ে সত্যতা নিশ্চিত করতে পারেন।", "Referral Ambassador — a verifiable certificate of community-building and digital marketing experience. QR code, unique certificate ID and online verification — any employer can confirm its authenticity on this page.")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-teal/15 border border-teal/30 flex items-center justify-center text-lg">💼</div>
              <div>
                <p className="text-sm font-black text-white">{t("কোন কোন কাজে ব্যবহার করা যাবে", "Where this experience applies")}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {t("ডিজিটাল মার্কেটিং এসিস্ট্যান্ট, কমিউনিটি ম্যানেজার, সেলস/প্রমোশন এক্সিকিউটিভ, অ্যাফিলিয়েট মার্কেটার ও ফ্রিল্যান্সিং ভূমিকায় CV-তে যুক্ত করলে প্রার্থী হিসেবে আলাদাভাবে দাঁড় করায়।", "Adds value to your CV for roles like digital marketing assistant, community manager, sales/promotion executive, affiliate marketer and freelancing.")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-pink/15 border border-pink/30 flex items-center justify-center text-lg">💰</div>
              <div>
                <p className="text-sm font-black text-white">{t("মাসিক আয় সম্ভাবনা", "Monthly income potential")}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {t("এই অভিজ্ঞতা-সার্টিফিকেট দিয়ে এন্ট্রি-লেভেল ডিজিটাল মার্কেটিং, কমিউনিটি ম্যানেজমেন্ট ও সেলস ভূমিকায় সাধারণত মাসে ৳১৫,০০০–৳৪০,০০০ আয় সম্ভব — অভিজ্ঞতা, নিয়োগকর্তা ও ফ্রিল্যান্স প্রজেক্টের ওপর নির্ভর করে।", "With this experience certificate, entry-level digital marketing, community management and sales roles typically pay ৳15,000–৳40,000 per month, depending on experience, employer and freelancing projects.")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-violet/15 border border-violet/30 flex items-center justify-center text-lg">📈</div>
              <div>
                <p className="text-sm font-black text-white">{t("কেন বিশ্বাসযোগ্য", "Why it's trusted")}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {t("গ্লোবাল সার্ভেতে ৭৬% সার্টিফিকেটধারী আয় বৃদ্ধি বা প্রমোশন পেয়েছেন — আপনারটাও হতে পারে!", "In a global survey, 76% of certificate holders received a salary increase or promotion — yours could be next!")}
                </p>
              </div>
              </div>
            </div>
          </div>
          )}
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
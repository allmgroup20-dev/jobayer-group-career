"use client";

import { Suspense, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useSearchParams } from "next/navigation";

type CertData = {
  certificateId: string;
  name: string;
  completedAt: string | null;
  siteUrl: string;
};

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value.replace(" ", "T"));
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function CertificateView() {
  const sp = useSearchParams();
  const id = sp.get("id") || "";
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const [data, setData] = useState<CertData | null>(null);

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
      <div className="max-w-3xl mx-auto">
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

        {/* Certificate */}
        <div className="print-area relative bg-white text-gray-900 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="absolute inset-3 border-2 border-gold rounded-xl pointer-events-none" />
          <div className="absolute inset-4 border border-gold/50 rounded-lg pointer-events-none" />

          <div className="relative text-center">
            <p className="text-xs font-black tracking-[0.25em] text-gold">ইউটিউব আর্নার · YOUTUBE EARNER</p>
            <h1 className="mt-3 text-2xl md:text-3xl font-black text-gray-900">CERTIFICATE OF ACHIEVEMENT</h1>
            <div className="mt-2 mx-auto h-0.5 w-40 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <p className="mt-3 text-sm font-bold text-gray-600">This certifies that</p>

            <p className="mt-3 text-3xl md:text-4xl font-black text-brand">{data.name}</p>

            <p className="mt-4 text-sm leading-relaxed text-gray-700 max-w-xl mx-auto">
              has successfully completed their full profile on <b>YouTube Earner</b> and referred
              <b> 25 people</b> through the referral program, demonstrating outstanding
              community-building and digital marketing skills.
            </p>

            <div className="mt-6 flex items-end justify-between">
              <div className="text-left text-xs text-gray-600">
                <p className="font-black text-gray-900">Certificate ID</p>
                <p className="mt-1 font-mono font-bold">{data.certificateId}</p>
                <p className="mt-2 font-black text-gray-900">Date</p>
                <p className="mt-1 font-bold">{date}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <QRCode value={verifyUrl} size={96} />
                </div>
                <p className="mt-1 text-[9px] text-gray-500">Scan to verify</p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-gray-200 text-xs text-gray-500">
              <p className="font-bold">Authorized Signatory — YouTube Earner</p>
              <p className="mt-0.5">Verify online: {verifyUrl}</p>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            .print-area, .print-area * { visibility: visible !important; }
            .print-area {
              position: absolute !important;
              left: 0; top: 0; width: 100%;
              box-shadow: none !important; border-radius: 0 !important;
              margin: 0 !important; padding: 32px !important;
            }
          }
        `}</style>
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
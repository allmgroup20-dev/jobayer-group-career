"use client";

import { useState } from "react";
import { useCertScale, A4_LANDSCAPE_W, A4_LANDSCAPE_H } from "@/lib/useCertScale";
import { useLang } from "@/lib/lang";
import CertCanvas, { type CertTier } from "@/components/CertCanvas";
import CertLightbox from "@/components/CertLightbox";

// A self-contained, clearly-fake sample of a certificate ("নমুনা"). Renders on
// the fixed A4-landscape canvas (1122x794) scaled to fit its container, exactly
// like the real certificate — but it can NEVER be used as a real certificate:
// sample name, fake ID/date, locked (non-scannable) QR, diagonal watermark and
// a bilingual warning note. Clicking the sample opens a fullscreen zoom viewer.
export default function CertificateSample({ variant }: { variant: CertTier }) {
  const { lang } = useLang();
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const { ref, scale } = useCertScale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <p className="mt-4 text-xs font-black text-gold">
        👀 {t("এভাবেই দেখাবে আপনার সার্টিফিকেট", "Here's how your certificate will look")}
      </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("নমুনা বড় করে দেখুন", "View sample larger")}
        className="mt-2 block w-full text-left active:scale-[0.995] transition-transform"
      >
        <div ref={ref} className="w-full overflow-hidden rounded-2xl" style={{ height: A4_LANDSCAPE_H * scale }}>
          <CertCanvas
            tier={variant}
            sample
            style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
          />
        </div>
      </button>

      <p className="mt-2 rounded-xl bg-teal/10 border border-teal/30 px-3 py-2 text-center text-[11px] font-black text-teal">
        🔍 {t("ছবিতে ট্যাপ/ক্লিক করে বড় করে জুম করে দেখুন", "Tap/click the image to view it larger and zoom in")}
      </p>

      <p className="mt-2 rounded-xl bg-red/10 border border-red/30 px-3 py-2 text-[10px] font-bold text-red leading-relaxed">
        ⚠️ {t("এটি নমুনা মাত্র — স্ক্রিনশট নিয়ে কোথাও ব্যবহার করা যাবে না। আসল সার্টিফিকেটে আপনার নিজের নাম, ইউনিক আইডি ও যাচাইযোগ্য QR থাকবে — যা শর্ত পূরণ করলেই পাওয়া যাবে।", "This is only a sample — it cannot be used anywhere, even via screenshot. Your real certificate will have your own name, a unique ID and a verifiable QR — available only when you meet the requirements.")}
      </p>

      <CertLightbox open={open} onClose={() => setOpen(false)} tier={variant} sample />
    </>
  );
}
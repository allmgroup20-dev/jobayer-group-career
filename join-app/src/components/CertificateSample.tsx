"use client";

import { useCertScale, A4_LANDSCAPE_W, A4_LANDSCAPE_H } from "@/lib/useCertScale";
import { useLang } from "@/lib/lang";

// A self-contained, clearly-fake sample of a certificate ("নমুনা"). Renders on
// the fixed A4-landscape canvas (1122x794) scaled to fit its container, exactly
// like the real certificate — but it can NEVER be used as a real certificate:
// sample name, fake ID/date, locked (non-scannable) QR, diagonal watermark and
// a bilingual warning note. Three tiers, each more premium than the last:
//   foundation — simple gold border
//   ambassador — premium double gold-gradient border + medal ribbon
//   elite      — world-class ornate border + embossed seal
export default function CertificateSample({
  variant,
}: {
  variant: "foundation" | "ambassador" | "elite";
}) {
  const { lang } = useLang();
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);
  const { ref, scale } = useCertScale();

  const isAmbassador = variant === "ambassador";
  const isElite = variant === "elite";

  const certTitle = isElite
    ? "ELITE FINAL CERTIFICATE"
    : isAmbassador
      ? "REFERRAL AMBASSADOR CERTIFICATE"
      : "CERTIFICATE OF ACHIEVEMENT";

  const certId = isElite
    ? "YA-ELITE-2026-XXXXXX"
    : isAmbassador
      ? "YA-AMB-2026-XXXXXX"
      : "YA-REF-2026-XXXXXX";

  const ribbon = isElite
    ? "🎖️ WORLD-CLASS · সর্বোচ্চ প্রিমিয়াম"
    : isAmbassador
      ? "🥇 PREMIUM · প্রিমিয়াম স্তর"
      : null;

  const bodyText = isElite
    ? "has been awarded the highest honor of the YouTube Earner community for extraordinary performance, uniting and mentoring a nationwide network of learners — a world-class benchmark of leadership, influence and digital mastery."
    : isAmbassador
      ? "has earned this premium recognition for outstanding community-building and digital marketing excellence, bringing a growing network of associates together as a trusted referral ambassador."
      : "has successfully completed their full profile on YouTube Earner and proven outstanding community-building and digital marketing skills by uniting a growing community of learners and friends.";

  return (
    <>
      <p className="mt-4 text-xs font-black text-gold">
        👀 {t("এভাবেই দেখাবে আপনার সার্টিফিকেট", "Here's how your certificate will look")}
      </p>

      <div ref={ref} className="mt-2 w-full overflow-hidden" style={{ height: A4_LANDSCAPE_H * scale }}>
        <div
          className="relative bg-white text-gray-900 rounded-2xl shadow-2xl select-none overflow-hidden"
          style={{
            width: A4_LANDSCAPE_W,
            height: A4_LANDSCAPE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* tier-specific frame */}
          {isElite ? (
            <>
              <div className="absolute inset-2 border-4 border-gold rounded-2xl pointer-events-none" />
              <div className="absolute inset-4 border border-gold/60 rounded-xl pointer-events-none" />
              <div className="absolute inset-6 border border-gold/30 rounded-lg pointer-events-none" />
              {/* corner flourishes */}
              <span className="pointer-events-none absolute top-8 left-8 text-4xl text-gold">❖</span>
              <span className="pointer-events-none absolute top-8 right-8 text-4xl text-gold">❖</span>
              <span className="pointer-events-none absolute bottom-8 left-8 text-4xl text-gold">❖</span>
              <span className="pointer-events-none absolute bottom-8 right-8 text-4xl text-gold">❖</span>
              {/* holographic top band */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold via-pink to-violet" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-violet via-pink to-gold" />
            </>
          ) : isAmbassador ? (
            <>
              <div className="absolute inset-3 border-[3px] border-gold rounded-xl pointer-events-none" />
              <div className="absolute inset-5 border border-gold/60 rounded-lg pointer-events-none" />
              {/* premium top ribbon */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-gold via-amber to-gold" />
            </>
          ) : (
            <>
              <div className="absolute inset-4 border-2 border-gold rounded-xl pointer-events-none" />
              <div className="absolute inset-5 border border-gold/50 rounded-lg pointer-events-none" />
            </>
          )}

          <span className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-full bg-gold px-3 py-1 text-[13px] font-black uppercase tracking-wider text-white">
            ◈ PREVIEW · নমুনা
          </span>

          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
            <span className="whitespace-nowrap rotate-[-24deg] text-[90px] font-black uppercase tracking-[0.25em] text-gray-900/10">
              নমুনা · SAMPLE
            </span>
          </div>

          <div className="relative flex h-full flex-col items-center justify-center px-14 text-center">
            <img src="/logo-light.png" alt="YouTube Earner" className="mx-auto h-12 w-auto" />

            {ribbon && (
              <span className={`mt-2 rounded-full px-4 py-1 text-[13px] font-black tracking-wide text-white ${isElite ? "bg-gradient-to-r from-gold via-pink to-violet" : "bg-gradient-to-r from-gold to-amber"}`}>
                {ribbon}
              </span>
            )}

            <h3 className={`mt-3 font-black text-gray-900 ${isElite ? "text-[42px] tracking-wide" : "text-4xl"}`}>{certTitle}</h3>
            <div className={`mt-2 mx-auto h-0.5 w-64 bg-gradient-to-r from-transparent via-gold to-transparent`} />
            <p className="mt-3 text-base font-bold text-gray-600">This certifies that</p>
            <p className="mt-3 text-5xl font-black text-brand">{t("রহিম উদ্দিন", "Rahim Uddin")}</p>
            <p className={`mt-4 text-base leading-relaxed text-gray-700 max-w-3xl mx-auto ${isElite ? "font-medium" : ""}`}>{bodyText}</p>

            <div className="mt-6 flex w-full items-end justify-between">
              <div className="text-left text-sm text-gray-600">
                <p className="font-black text-gray-900">Certificate ID</p>
                <p className="mt-1 font-mono font-bold">{certId}</p>
                <p className="mt-3 font-black text-gray-900">Date</p>
                <p className="mt-1 font-bold">01 January 2026</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-[96px] w-[96px] items-center justify-center rounded-lg border border-gray-300 bg-gray-100">
                  <span className="text-center text-sm font-black leading-tight text-gray-400">🔒<br />নমুনা QR</span>
                </div>
                <p className="mt-1 text-[10px] font-bold text-gray-400">
                  {t("সত্যতা যাচাই করা যাবে না", "Not verifiable")}
                </p>
              </div>
            </div>

            <div className="mt-6 w-full pt-4 border-t border-gray-200 text-sm text-gray-500">
              <p className="font-bold">Authorized Signatory — YouTube Earner</p>
              <p className="mt-1">Verify online: youtube.earner.workers.dev/certificate?id={certId}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 rounded-xl bg-red/10 border border-red/30 px-3 py-2 text-[10px] font-bold text-red leading-relaxed">
        ⚠️ {t("এটি নমুনা মাত্র — স্ক্রিনশট নিয়ে কোথাও ব্যবহার করা যাবে না। আসল সার্টিফিকেটে আপনার নিজের নাম, ইউনিক আইডি ও যাচাইযোগ্য QR থাকবে — যা শর্ত পূরণ করলেই পাওয়া যাবে।", "This is only a sample — it cannot be used anywhere, even via screenshot. Your real certificate will have your own name, a unique ID and a verifiable QR — available only when you meet the requirements.")}
      </p>
    </>
  );
}
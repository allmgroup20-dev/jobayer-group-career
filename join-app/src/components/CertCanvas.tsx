"use client";

import QRCode from "react-qr-code";
import { useLang } from "@/lib/lang";
import { A4_LANDSCAPE_W, A4_LANDSCAPE_H } from "@/lib/useCertScale";

export type CertTier = "foundation" | "ambassador" | "elite";

export type CertCanvasData = {
  name?: string;
  certificateId?: string;
  date?: string;
  qrValue?: string;
  siteUrl?: string;
};

// The single A4-landscape (1122 x 794) certificate renderer — used by the sample
// previews (complete page), the real certificate page AND the fullscreen zoom
// lightbox, so every tier looks identical wherever it appears.
//
// Three intentionally very different designs:
//   foundation — simple, calm (entry tier; kept as-is)
//   ambassador — premium executive award: deep navy panel, double gold frame,
//                corner ornaments, medal + ribbons
//   elite      — ultra-luxury international honor: metallic gold frame, corner
//                medallions, damask pattern, crest + laurels, gold-gradient text,
//                holographic bands and a slow metallic sheen
export default function CertCanvas({
  tier,
  sample = false,
  data,
  className,
  style,
}: {
  tier: CertTier;
  sample?: boolean;
  data?: CertCanvasData;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { lang } = useLang();
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);

  const isAmbassador = tier === "ambassador";
  const isElite = tier === "elite";

  const certTitle = isElite
    ? "ELITE FINAL CERTIFICATE"
    : isAmbassador
      ? "REFERRAL AMBASSADOR CERTIFICATE"
      : "CERTIFICATE OF ACHIEVEMENT";

  const sampleId = isElite
    ? "YA-ELITE-2026-XXXXXX"
    : isAmbassador
      ? "YA-AMB-2026-XXXXXX"
      : "YA-REF-2026-XXXXXX";

  const name = data?.name || t("রহিম উদ্দিন", "Rahim Uddin");
  const certId = data?.certificateId || sampleId;
  const date = data?.date || "01 January 2026";
  const verifyLine = data?.siteUrl
    ? `${data.siteUrl}/certificate?id=${certId}`
    : `youtube.earner.workers.dev/certificate?id=${certId}`;

  const ribbonText = isElite
    ? t("🎖️ WORLD-CLASS · সর্বোচ্চ প্রিমিয়াম", "🎖️ WORLD-CLASS · Ultimate Premium")
    : isAmbassador
      ? t("🥇 PREMIUM · প্রিমিয়াম স্তর", "🥇 PREMIUM · Premium tier")
      : null;

  const bodyText = isElite
    ? t(
        "has been awarded the highest honor of the YouTube Earner community for extraordinary performance, uniting and mentoring a nationwide network of learners — a world-class benchmark of leadership, influence and digital mastery.",
        "has been awarded the highest honor of the YouTube Earner community for extraordinary performance, uniting and mentoring a nationwide network of learners — a world-class benchmark of leadership, influence and digital mastery."
      )
    : isAmbassador
      ? t(
          "has earned this premium recognition for outstanding community-building and digital marketing excellence, bringing a growing network of associates together as a trusted referral ambassador.",
          "has earned this premium recognition for outstanding community-building and digital marketing excellence, bringing a growing network of associates together as a trusted referral ambassador."
        )
      : t(
          "has successfully completed their full profile on YouTube Earner and proven outstanding community-building and digital marketing skills by uniting a growing community of learners and friends.",
          "has successfully completed their full profile on YouTube Earner and proven outstanding community-building and digital marketing skills by uniting a growing community of learners and friends."
        );

  const watermarkColor = isElite
    ? "text-[#8a6d1f]/10"
    : isAmbassador
      ? "text-white/10"
      : "text-gray-900/10";

  return (
    <div
      className={`relative bg-white text-gray-900 rounded-2xl shadow-2xl select-none overflow-hidden ${isAmbassador ? "bg-gradient-to-b from-[#0e2444] to-[#153a63]" : isElite ? "bg-[#fdfaf2]" : "bg-white"} ${className || ""}`}
      style={{ width: A4_LANDSCAPE_W, height: A4_LANDSCAPE_H, ...style }}
    >
      {/* ═══════════ Tier decorations ═══════════ */}
      {isElite ? (
        <>
          {/* metallic gold outer band */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f7d76a] via-[#c9a227] to-[#8a6d1f] pointer-events-none" />
          <div className="absolute inset-[7px] bg-[#fdfaf2] rounded-[10px] pointer-events-none" />
          {/* ornate triple frame */}
          <div className="absolute inset-3 border-2 border-[#b8860b] rounded-xl pointer-events-none" />
          <div className="absolute inset-4 border border-[#d4af37]/70 rounded-lg pointer-events-none" />
          <div className="absolute inset-5 border border-dotted border-[#b8860b]/60 rounded-lg pointer-events-none" />
          {/* damask / guilloche pattern + vignette */}
          <div
            className="absolute inset-5 rounded-lg opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: "repeating-radial-gradient(circle at 22% 30%, #8a6d1f 0 1px, transparent 1px 26px)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(139,109,31,0.12) 100%)" }}
          />
          {/* corner medallions */}
          {["top-5 left-5", "top-5 right-5", "bottom-5 left-5", "bottom-5 right-5"].map((pos) => (
            <div
              key={pos}
              className={`absolute ${pos} h-12 w-12 rounded-full bg-gradient-to-br from-[#f7d76a] via-[#d4af37] to-[#8a6d1f] flex items-center justify-center shadow-inner ring-2 ring-white/50 pointer-events-none`}
            >
              <span className="text-lg text-white drop-shadow">✦</span>
            </div>
          ))}
          {/* holographic security bands */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold via-pink to-violet pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-violet via-pink to-gold pointer-events-none" />
          {/* side pinstripes */}
          <div className="absolute top-1/2 left-0 w-1.5 -translate-y-1/2 h-40 rounded-r bg-gradient-to-b from-transparent via-[#d4af37] to-transparent pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-1.5 -translate-y-1/2 h-40 rounded-l bg-gradient-to-b from-transparent via-[#d4af37] to-transparent pointer-events-none" />
          {/* metallic sheen */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="ye-certs-sheen" />
          </div>
        </>
      ) : isAmbassador ? (
        <>
          {/* outer gold frame */}
          <div className="absolute inset-3 border-[3px] border-gold rounded-2xl pointer-events-none" />
          <div className="absolute inset-5 border border-gold/50 rounded-xl pointer-events-none" />
          {/* deep navy executive panel */}
          <div className="absolute inset-7 rounded-lg bg-gradient-to-br from-[#0e2444] to-[#163a63] border border-gold/30 pointer-events-none" />
          <div
            className="absolute inset-7 rounded-lg opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #ffffff 0 1px, transparent 1px 14px)" }}
          />
          {/* top / bottom gold bands */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-gold via-amber to-gold pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-gold via-amber to-gold pointer-events-none" />
          {/* corner ornaments */}
          <span className="absolute top-8 left-8 text-3xl text-gold pointer-events-none">✦</span>
          <span className="absolute top-8 right-8 text-3xl text-gold pointer-events-none">✦</span>
          <span className="absolute bottom-8 left-8 text-3xl text-gold pointer-events-none">✦</span>
          <span className="absolute bottom-8 right-8 text-3xl text-gold pointer-events-none">✦</span>
        </>
      ) : (
        <>
          <div className="absolute inset-4 border-2 border-gold rounded-xl pointer-events-none" />
          <div className="absolute inset-5 border border-gold/50 rounded-lg pointer-events-none" />
        </>
      )}

      {/* ═══════════ Sample-only guard rails ═══════════ */}
      {sample && (
        <>
          <span className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-full bg-gold px-3 py-1 text-[13px] font-black uppercase tracking-wider text-white">
            ◈ PREVIEW · নমুনা
          </span>
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
            <span className={`whitespace-nowrap rotate-[-24deg] text-[90px] font-black uppercase tracking-[0.25em] ${watermarkColor}`}>
              নমুনা · SAMPLE
            </span>
          </div>
        </>
      )}

      {/* ═══════════ Content ═══════════ */}
      <div
        className={`relative flex h-full flex-col items-center justify-center px-14 text-center ${
          isAmbassador ? "text-white" : isElite ? "text-[#6b5322]" : "text-gray-900"
        }`}
      >
        {isAmbassador ? (
          <div className="relative z-20 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f7d76a] via-[#d4af37] to-[#b8860b] shadow-lg ring-2 ring-white/20">
              <span className="text-2xl">🎖️</span>
            </div>
            <div className="-mt-1 flex gap-1">
              <div className="h-6 w-3 rounded-b-sm bg-gradient-to-b from-[#d4af37] to-[#8a6d1f]" />
              <div className="h-6 w-3 rounded-b-sm bg-gradient-to-b from-[#d4af37] to-[#8a6d1f]" />
            </div>
          </div>
        ) : isElite ? (
          <div className="relative z-20 flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#b8860b] bg-gradient-to-br from-[#f7d76a] via-[#d4af37] to-[#8a6d1f] shadow-[0_0_0_4px_rgba(255,255,255,0.6),0_0_0_5px_#d4af37]">
              <span className="text-3xl text-white drop-shadow">🏆</span>
            </div>
            <div className="-mt-1 flex gap-1.5">
              <div className="h-7 w-4 rounded-b-sm bg-gradient-to-b from-[#c9a227] to-[#7a5a1e]" />
              <div className="h-7 w-4 rounded-b-sm bg-gradient-to-b from-[#c9a227] to-[#7a5a1e]" />
            </div>
          </div>
        ) : (
          <img src="/logo-light.png" alt="YouTube Earner" className="mx-auto h-12 w-auto" />
        )}

        {ribbonText && (
          <span
            className={`mt-2 rounded-full px-4 py-1 text-[13px] font-black tracking-wide text-white ${
              isElite ? "bg-gradient-to-r from-gold via-pink to-violet" : "bg-gradient-to-r from-gold to-amber"
            }`}
          >
            {ribbonText}
          </span>
        )}

        <h3
          className={`mt-3 font-black tracking-wide ${
            isElite
              ? "bg-clip-text text-transparent bg-gradient-to-b from-[#e7c23c] via-[#b8860b] to-[#8a6d1f] drop-shadow-sm font-serif text-[42px]"
              : isAmbassador
                ? "font-serif text-4xl text-white"
                : "text-4xl text-gray-900"
          }`}
        >
          {certTitle}
        </h3>

        <div
          className={`mt-2 mx-auto h-0.5 w-64 bg-gradient-to-r from-transparent via-gold to-transparent ${
            isAmbassador ? "via-gold" : ""
          }`}
        />

        <p className={`mt-3 text-base font-bold ${isAmbassador ? "text-white/60" : isElite ? "text-[#8a6d1f]" : "text-gray-600"}`}>
          This certifies that
        </p>

        <p
          className={`mt-3 text-5xl font-black ${
            isElite
              ? "bg-clip-text text-transparent bg-gradient-to-b from-[#b8860b] to-[#8a6d1f] font-serif"
              : isAmbassador
                ? "bg-clip-text text-transparent bg-gradient-to-b from-[#f7d76a] to-[#d4af37]"
                : "text-brand"
          }`}
        >
          {name}
        </p>

        <p
          className={`mt-4 text-base leading-relaxed max-w-3xl mx-auto ${
            isAmbassador ? "font-medium text-white/80" : isElite ? "font-medium text-[#7a5a1e]" : "text-gray-700"
          }`}
        >
          {bodyText}
        </p>

        <div className={`mt-6 flex w-full items-end justify-between ${isAmbassador ? "text-white/80" : isElite ? "text-[#6b5322]" : "text-gray-600"}`}>
          <div className="text-left text-sm">
            <p className={`font-black ${isAmbassador ? "text-gold" : isElite ? "text-[#8a6d1f]" : "text-gray-900"}`}>Certificate ID</p>
            <p className="mt-1 font-mono font-bold">{certId}</p>
            <p className={`mt-3 font-black ${isAmbassador ? "text-gold" : isElite ? "text-[#8a6d1f]" : "text-gray-900"}`}>Date</p>
            <p className="mt-1 font-bold">{date}</p>
          </div>
          <div className="flex flex-col items-center">
            {sample ? (
              <div className="flex h-[96px] w-[96px] items-center justify-center rounded-lg border border-gray-300 bg-gray-100">
                <span className="text-center text-sm font-black leading-tight text-gray-400">🔒<br />নমুনা QR</span>
              </div>
            ) : (
              <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                <QRCode value={data?.qrValue || ""} size={112} />
              </div>
            )}
            <p className="mt-1 text-[10px] font-bold text-gray-400">
              {sample ? t("সত্যতা যাচাই করা যাবে না", "Not verifiable") : "Scan to verify"}
            </p>
          </div>
        </div>

        <div className={`mt-6 w-full pt-4 border-t text-sm ${isAmbassador ? "border-white/20 text-white/70" : isElite ? "border-[#c9a227]/40 text-[#6b5322]" : "border-gray-200 text-gray-500"}`}>
          <p className="font-bold">Authorized Signatory — YouTube Earner</p>
          <p className="mt-1">Verify online: {verifyLine}</p>
        </div>
      </div>

      <style>{`
        .ye-certs-sheen {
          position: absolute;
          top: -20%;
          bottom: -20%;
          left: -30%;
          width: 30%;
          background: linear-gradient(105deg, transparent, rgba(255,255,255,0.28), transparent);
          animation: ye-certs-sheen-move 6s ease-in-out infinite;
        }
        @keyframes ye-certs-sheen-move {
          0%   { transform: rotate(8deg) translateX(0); }
          55%  { transform: rotate(8deg) translateX(480%); }
          100% { transform: rotate(8deg) translateX(480%); }
        }
      `}</style>
    </div>
  );
}
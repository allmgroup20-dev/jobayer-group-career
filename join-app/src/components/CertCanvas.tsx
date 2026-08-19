"use client";

import QRCode from "react-qr-code";
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
// Three intentionally very different designs — ALL TEXT INSIDE THE CERTIFICATE IS
// ALWAYS 100% ENGLISH (no Bengali on the canvas, regardless of app language):
//   foundation — simple, calm (entry tier; kept as-is)
//   ambassador — ULTRA-PREMIUM creator award (YouTube-friendly creator
//                recognition palette — NOT an official YouTube certificate):
//                graphite velvet + platinum/silver + champagne + metallic gold
//                + diamond/icy-white material language; no red, no play-button
//                shape, no YouTube trade dress. Layered graphite-velvet side
//                panels (SVG, organic bezier edge, silver edge + multi-metal
//                silver→champagne→gold curve, silver contour lines, mixed
//                gold/silver/diamond particle dust), 4-layer border system
//                (metallic silver → champagne hairline → ivory → inner
//                platinum), ivory cardstock #FBF8F1 with fine paper grain +
//                faint diamond glow + champagne waves, editorial "CERTIFICATE
//                OF EXCELLENCE" header in Cinzel with silver/white + gold-edge
//                diamond ornaments, embossed medallion (platinum rim, gold
//                rings, graphite core, diamond-white sparkle, metallic-gold
//                SVG star, gold-tipped graphite ribbons), champagne-metallic
//                Great Vibes name, executive signing area (graphite name,
//                champagne role lines, silver accents, printed signature +
//                graphite/gold seal + white quiet-zone QR)
//   elite      — ultra-luxury international honor (restrained luxury: ivory
//                parchment + oxblood + champagne gold): thin double gold frame,
//                filigree/guilloche strip, corner medallions, royal seal with YE
//                monogram, ribbon banner cartouche, gold-foil italic name,
//                diamond rule, holographic micro-bands, slow metallic sheen
function SideOrnament({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  const b = "M118 0 C 100 80, 106 170, 96 258 C 88 346, 100 442, 112 468 C 104 536, 92 620, 100 700 C 105 746, 114 776, 118 794";
  return (
    <div
      className={`absolute inset-y-0 ${left ? "left-0" : "right-0"} w-[118px] pointer-events-none ${
        left ? "shadow-[18px_0_30px_-18px_rgba(0,0,0,0.35)]" : "shadow-[-18px_0_30px_-18px_rgba(0,0,0,0.35)]"
      }`}
    >
      <svg className="w-full h-full" viewBox="0 0 118 794" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`velvet${side}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#111214" />
            <stop offset="0.5" stopColor="#202226" />
            <stop offset="1" stopColor="#111214" />
          </linearGradient>
          <radialGradient id={`sheen${side}`} cx="0.32" cy="0.28" r="0.8">
            <stop offset="0" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id={`silverEdge${side}`} x1="0" y1="0" x2="118" y2="794" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#626A72" />
            <stop offset="0.28" stopColor="#8E969E" />
            <stop offset="0.5" stopColor="#F5F7F8" />
            <stop offset="0.72" stopColor="#D9DEE2" />
            <stop offset="1" stopColor="#626A72" />
          </linearGradient>
          <linearGradient id={`flow${side}`} x1="0" y1="0" x2="118" y2="794" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8E969E" />
            <stop offset="0.16" stopColor="#D9DEE2" />
            <stop offset="0.34" stopColor="#E8D8AD" />
            <stop offset="0.48" stopColor="#F4D98B" />
            <stop offset="0.66" stopColor="#D9B95C" />
            <stop offset="0.84" stopColor="#87691F" />
            <stop offset="1" stopColor="#5F491A" />
          </linearGradient>
          <pattern id={`dots${side}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="rgba(232,216,173,0.22)" />
          </pattern>
        </defs>

        <g transform={left ? undefined : "scale(-1,1) translate(-118,0)"}>
          {/* 1 · graphite velvet base */}
          <path d={`${b} L 0 794 L 0 0 Z`} fill={`url(#velvet${side})`} />
          {/* soft velvet sheen */}
          <path d={`${b} L 0 794 L 0 0 Z`} fill={`url(#sheen${side})`} />
          {/* fine champagne dust texture */}
          <path d={`${b} L 0 794 L 0 0 Z`} fill={`url(#dots${side})`} opacity="0.85" />
          {/* 2 · brushed-platinum boundary edge */}
          <path d={b} fill="none" stroke={`url(#silverEdge${side})`} strokeWidth="2" />
          {/* light catch on the raised edge */}
          <path d="M117 0 C 99 80, 105 170, 95 258 C 87 346, 99 442, 111 468 C 103 536, 91 620, 99 700 C 104 746, 113 776, 117 794" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          {/* 3 · thin silver contour line */}
          <path d="M112 0 C 94 80, 100 170, 90 258 C 82 346, 94 442, 106 468 C 98 536, 86 620, 94 700 C 99 746, 108 776, 112 794" fill="none" stroke="#D9DEE2" strokeWidth="0.7" opacity="0.4" />
          {/* 4 · large multi-metal curve: silver → champagne → gold → shadow */}
          <path d="M118 62 C 62 190, 30 330, 74 420 C 36 505, 58 640, 110 722" fill="none" stroke={`url(#flow${side})`} strokeWidth="2.2" opacity="0.7" />
          {/* 7 · secondary dashed silver curve + faint champagne curve */}
          <path d="M118 150 C 56 270, 24 400, 66 480 C 34 560, 66 700, 112 762" fill="none" stroke="#D9DEE2" strokeWidth="1" opacity="0.3" strokeDasharray="3 7" />
          <path d="M118 236 C 48 342, 28 462, 62 548 C 42 620, 78 720, 114 780" fill="none" stroke="#E8D8AD" strokeWidth="0.8" opacity="0.22" />
          {/* 5 · mixed metallic dust: gold/champagne + silver + diamond-white */}
          <circle cx="92" cy="120" r="1.6" fill="#F4D98B" opacity="0.8" />
          <circle cx="70" cy="210" r="1" fill="#D9DEE2" opacity="0.6" />
          <circle cx="100" cy="320" r="2" fill="#FFFFFF" opacity="0.55" />
          <circle cx="56" cy="405" r="1.3" fill="#F4D98B" opacity="0.7" />
          <circle cx="86" cy="500" r="1.1" fill="#D9DEE2" opacity="0.6" />
          <circle cx="104" cy="590" r="1.7" fill="#E8D8AD" opacity="0.5" />
          <circle cx="62" cy="660" r="1" fill="#F8FBFD" opacity="0.7" />
          <circle cx="90" cy="740" r="1.4" fill="#B8BEC4" opacity="0.5" />
          <circle cx="48" cy="300" r="0.9" fill="#FFFFFF" opacity="0.5" />
          <circle cx="76" cy="560" r="0.8" fill="#F8FBFD" opacity="0.45" />
        </g>
      </svg>
    </div>
  );
}

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

  const name = data?.name || "Rahim Uddin";
  const certId = data?.certificateId || sampleId;
  const date = data?.date || "01 January 2026";
  const verifyLine = data?.siteUrl
    ? `${data.siteUrl}/certificate?id=${certId}`
    : `youtube.earner.workers.dev/certificate?id=${certId}`;

  const ribbonText = isElite ? "🎖️ WORLD-CLASS · ULTIMATE PREMIUM" : null;

  const bodyText = isElite
    ? "has been awarded the highest honor of the YouTube Earner community for extraordinary performance, uniting and mentoring a nationwide network of learners — a world-class benchmark of leadership, influence and digital mastery."
    : isAmbassador
      ? "has earned this premium recognition for outstanding community-building and digital marketing excellence, bringing a growing network of associates together as a trusted referral ambassador."
      : "has successfully completed their full profile on YouTube Earner and proven outstanding community-building and digital marketing skills by uniting a growing community of learners and friends.";

  const watermarkColor = isElite
    ? "text-[#6E1423]/10"
    : isAmbassador
      ? "text-[#111214]/[0.06]"
      : "text-gray-900/10";

  return (
    <div
      className={`relative bg-white text-gray-900 rounded-2xl shadow-2xl select-none overflow-hidden ${isAmbassador ? "bg-[#FBF8F1]" : isElite ? "bg-[#F8F1E1]" : "bg-white"} ${className || ""}`}
      style={{ width: A4_LANDSCAPE_W, height: A4_LANDSCAPE_H, ...style }}
    >
      {/* ═══════════ Tier decorations ═══════════ */}
      {isElite ? (
        <>
          {/* restrained luxury: ivory canvas + thin double gold frame (no full-bleed gold) */}
          <div className="absolute inset-2 rounded-2xl border-2 border-[#C69B3C] overflow-hidden pointer-events-none">
            <div className="ye-certs-sheen" />
          </div>
          <div className="absolute inset-4 rounded-xl border border-[#C69B3C]/60 pointer-events-none" />
          {/* filigree / guilloche strip */}
          <div className="absolute inset-5 rounded-lg border border-dotted border-[#C69B3C]/50 pointer-events-none" />
          <div
            className="absolute inset-[6px] rounded-xl opacity-[0.05] pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #C69B3C 0 2px, transparent 2px 10px)" }}
          />
          {/* damask pattern + soft vignette */}
          <div
            className="absolute inset-5 rounded-lg opacity-[0.05] pointer-events-none"
            style={{ backgroundImage: "repeating-radial-gradient(circle at 22% 30%, #C69B3C 0 1px, transparent 1px 26px)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(110,20,35,0.10) 100%)" }}
          />
          {/* corner medallions — ivory disc, gold ring, oxblood star */}
          {["top-5 left-5", "top-5 right-5", "bottom-5 left-5", "bottom-5 right-5"].map((pos) => (
            <div
              key={pos}
              className={`absolute ${pos} h-12 w-12 rounded-full bg-[#F8F1E1] border-[1.5px] border-[#C69B3C] flex items-center justify-center shadow-sm pointer-events-none`}
            >
              <span className="text-lg text-[#6E1423]">✦</span>
            </div>
          ))}
          {/* holographic security micro-bands */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-pink to-violet pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet via-pink to-gold pointer-events-none" />
          {/* side pinstripes */}
          <div className="absolute top-1/2 left-0 w-1.5 -translate-y-1/2 h-40 rounded-r bg-gradient-to-b from-transparent via-[#C69B3C] to-transparent pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-1.5 -translate-y-1/2 h-40 rounded-l bg-gradient-to-b from-transparent via-[#C69B3C] to-transparent pointer-events-none" />
          {/* microtext authenticity line */}
          <p className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-[0.35em] text-[#C69B3C]/80 uppercase">
            NO. {certId.slice(3)} · YouTube Earner · VERIFIABLE
          </p>
        </>
      ) : isAmbassador ? (
        <>
          {/* ULTRA-PREMIUM creator award — graphite + platinum + champagne +
              metallic gold + diamond ivory (YouTube-friendly, no red) */}
          {/* border system · layer 1: brushed-platinum metallic line */}
          <div
            className="absolute inset-[5px] rounded-[10px] pointer-events-none"
            style={{ border: "1px solid", borderImage: "linear-gradient(135deg, #626A72 0%, #B8BEC4 25%, #F5F7F8 50%, #D9DEE2 75%, #626A72 100%) 1" }}
          />
          {/* border system · layer 2: champagne hairline */}
          <div className="absolute inset-[10px] rounded-[8px] border border-[#E8D8AD]/40 pointer-events-none" />
          {/* border system · layer 4: inner platinum frame */}
          <div className="absolute left-[124px] right-[124px] top-[7px] bottom-[7px] rounded-lg border-[1.5px] border-[#8E969E]/70 pointer-events-none" />
          <div className="absolute left-[131px] right-[131px] top-[14px] bottom-[14px] rounded-md border border-[#8E969E]/35 pointer-events-none" />
          {/* fine ivory cardstock grain */}
          <div className="ye-paper-grain absolute inset-0 pointer-events-none" />
          {/* subtle diamond/icy-white glow near center + warm ivory vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 40%, rgba(248,251,253,0.45), transparent 55%)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(180,150,90,0.05) 100%)" }}
          />
          {/* refined champagne + faint silver-white wave lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1122 794" fill="none" preserveAspectRatio="none">
            <path d="M-20 236 C 220 186, 380 306, 560 246 C 760 176, 940 286, 1142 226" stroke="#E8D8AD" strokeWidth="1.1" opacity="0.05" />
            <path d="M-20 304 C 220 264, 380 364, 560 314 C 760 264, 940 344, 1142 294" stroke="#F8FBFD" strokeWidth="0.8" opacity="0.05" />
            <path d="M-20 470 C 220 530, 380 440, 560 510 C 760 560, 940 460, 1142 530" stroke="#E8D8AD" strokeWidth="0.8" opacity="0.045" />
            <path d="M-20 546 C 220 596, 380 506, 560 576 C 760 626, 940 526, 1142 596" stroke="#E8D8AD" strokeWidth="1.1" opacity="0.05" />
          </svg>
          {/* graphite-velvet + platinum + multi-metal ornamental side panels */}
          <SideOrnament side="left" />
          <SideOrnament side="right" />
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
          <span className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-full bg-[#202226] border border-[#B8BEC4]/50 px-3 py-1 text-[13px] font-black uppercase tracking-wider text-[#F4D98B]">
            ◈ PREVIEW · SAMPLE
          </span>
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
            <span className={`whitespace-nowrap rotate-[-24deg] text-[90px] font-black uppercase tracking-[0.25em] ${watermarkColor}`}>
              SAMPLE
            </span>
          </div>
        </>
      )}

      {/* ═══════════ Content — Ambassador (ULTRA-PREMIUM luxury) ═══════════ */}
      {isAmbassador ? (
        <div className="relative flex h-full flex-col items-center justify-center px-36 text-center text-[#1a1a1a]">
          {/* editorial header */}
          {/* brand logo — always visible; dark logo on light ivory background */}
          <img src="/logo-light.png" alt="YouTube Earner" className="h-9 w-auto opacity-95" />

          <h3 className="mt-4 font-cinzel text-[50px] font-bold leading-none tracking-[0.14em] text-[#111214]">
            CERTIFICATE
          </h3>

          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="ye-gold-rule h-px w-16" />
            <svg viewBox="0 0 10 10" className="h-[9px] w-[9px]" aria-hidden="true">
              <rect x="2.7" y="2.7" width="4.6" height="4.6" transform="rotate(45 5 5)" fill="#F8FBFD" stroke="#D9B95C" strokeWidth="1" />
            </svg>
            <span className="ye-gold-text font-cinzel text-[19px] font-bold uppercase tracking-[0.42em]">
              OF EXCELLENCE
            </span>
            <svg viewBox="0 0 10 10" className="h-[9px] w-[9px]" aria-hidden="true">
              <rect x="2.7" y="2.7" width="4.6" height="4.6" transform="rotate(45 5 5)" fill="#F8FBFD" stroke="#D9B95C" strokeWidth="1" />
            </svg>
            <div className="ye-gold-rule h-px w-16" />
          </div>

          {/* embossed platinum + gold + graphite medallion emblem */}
          <div className="mt-5 flex flex-col items-center">
            <div className="relative flex h-[84px] w-[84px] items-center justify-center">
              {/* brushed-platinum outer rim with embossed edge */}
              <div className="ye-silver-surface absolute inset-0 rounded-full shadow-[inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-3px_6px_rgba(0,0,0,0.4),0_8px_18px_rgba(0,0,0,0.25)]" />
              {/* bright top-left catch-light */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55), transparent 45%)" }}
              />
              {/* concentric gold rings */}
              <div className="absolute inset-[5px] rounded-full border border-[#D9B95C]/80" />
              <div className="absolute inset-[8px] rounded-full border border-[#F4D98B]/90" />
              {/* graphite core */}
              <div className="ye-velvet absolute inset-[11px] rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)]" />
              {/* diamond-white sparkle on the core */}
              <div
                className="absolute inset-[11px] rounded-full"
                style={{ background: "radial-gradient(circle at 32% 26%, rgba(248,251,253,0.35), transparent 40%)" }}
              />
              {/* engraved champagne dot ring */}
              <div
                className="absolute inset-[16px] rounded-full"
                style={{ backgroundImage: "radial-gradient(circle, rgba(232,216,173,0.6) 1px, transparent 1.4px)", backgroundSize: "7px 7px" }}
              />
              <div className="absolute inset-[26px] rounded-full border border-[#D9B95C]/80" />
              <span className="absolute left-[22%] top-[19%] h-1.5 w-1.5 rounded-full bg-white opacity-70" />
              {/* inline-SVG metallic gold star (not a text glyph) */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="yeAmbStar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FFF4CF" />
                    <stop offset="0.45" stopColor="#F4D98B" />
                    <stop offset="1" stopColor="#B99238" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 22 L57.8 41.2 L78.5 41.8 L62.2 54.8 L67.8 74.2 L50 61.4 L32.2 74.2 L37.8 54.8 L21.5 41.8 L42.2 41.2 Z"
                  fill="url(#yeAmbStar)"
                  stroke="#F4D98B"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
            {/* graphite ribbons with champagne edging + gold tips */}
            <div className="mt-1.5 flex items-start gap-2">
              <div className="flex flex-col items-center">
                <div className="h-6 w-[22px] rounded-t-sm border-x border-[#E8D8AD]/50 bg-gradient-to-b from-[#111214] to-[#202226]" />
                <div className="h-[6px] w-[24px] bg-gradient-to-b from-[#F4D98B] to-[#87691F] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-[22px] rounded-t-sm border-x border-[#E8D8AD]/50 bg-gradient-to-b from-[#111214] to-[#202226]" />
                <div className="h-[6px] w-[24px] bg-gradient-to-b from-[#F4D98B] to-[#87691F] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
              </div>
            </div>
          </div>

          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.3em] text-[#57504a]">
            This is granted to
          </p>

          {/* champagne-metallic script name with embossed lift */}
          <p
            className="ye-name-foil mt-2 font-great-vibes text-[56px] leading-none"
            style={{ filter: "drop-shadow(0 1px 0 rgba(255,248,230,0.55)) drop-shadow(0 1px 1px rgba(60,40,5,0.16))" }}
          >
            {name}
          </p>
          <div className="ye-gold-rule mt-3 h-px w-[300px]" />

          <p className="mt-4 max-w-[560px] text-[14px] font-medium leading-[1.65] tracking-[0.01em] text-[#3a352f]">
            {bodyText}
          </p>

          <div className="mt-6 flex w-full items-end justify-between">
            {/* executive signature — printed, not a sticker */}
            <div className="text-left">
              <div className="relative inline-block">
                <img
                  src="/certs/ambassador-signature.png"
                  alt="Signature"
                  className="h-12 w-auto opacity-90"
                  style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))" }}
                />
                <div className="ye-gold-rule absolute left-0 -bottom-2 h-px w-full" />
              </div>
              <p className="mt-4 text-[14px] font-bold tracking-wide text-[#111214]">PREETI LOBANA</p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#B99238]">Country Manager &amp; Vice President</p>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#B99238]">YouTube India</p>
            </div>

            {/* graphite + gold printed seal — blends into the paper */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-[74px] w-[74px] rounded-full border border-[#8E969E]/50" />
              <div className="ye-graphite-surface absolute h-[68px] w-[68px] rounded-full opacity-90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" />
              <div className="absolute h-[68px] w-[68px] rounded-full border border-[#E8D8AD]/60" />
              <img
                src="/certs/ambassador-seal.png"
                alt="Official Seal"
                className="relative h-[60px] w-[60px] rounded-full object-cover opacity-95 mix-blend-multiply"
              />
            </div>

            {/* small QR with white quiet zone */}
            <div className="flex flex-col items-center">
              {sample ? (
                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-sm border border-[#E8D8AD]/50 bg-[#F7F3EA]">
                  <span className="text-center text-[8px] font-black leading-tight text-gray-400">🔒<br />SAMPLE</span>
                </div>
              ) : (
                <div className="rounded-sm border border-[#E8D8AD]/50 bg-white p-1">
                  <QRCode value={data?.qrValue || ""} size={48} />
                </div>
              )}
              <p className="mt-1 text-[9px] font-bold tracking-[0.08em] text-[#8E969E]">{sample ? "Not verifiable" : "Scan to verify"}</p>
            </div>

            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#B99238]">Date</p>
              <p className="mt-1 text-[14px] font-bold text-[#111214]">{date}</p>
              <p className="mt-2.5 text-[9px] font-black uppercase tracking-[0.28em] text-[#B99238]">Certificate ID</p>
              <p className="mt-1 font-mono text-[12px] font-bold text-[#111214]">{certId}</p>
            </div>
          </div>

          <p className="mt-3 text-[9px] font-bold tracking-[0.14em] text-[#B99238]">
            VERIFY ONLINE: {verifyLine}
          </p>
        </div>
      ) : (
        <div
          className={`relative flex h-full flex-col items-center justify-center px-14 text-center ${
            isElite ? "text-[#1A1A1A]" : "text-gray-900"
          }`}
        >
          {isElite ? (
            <div className="relative z-20 flex flex-col items-center">
              {/* brand logo — always visible on the light ivory card */}
              <img src="/logo-light.png" alt="YouTube Earner" className="mb-3 h-9 w-auto" />
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[3px] border-[#C69B3C]" />
                <div className="absolute inset-[6px] rounded-full border border-[#C69B3C]/60" />
                <div className="absolute inset-[10px] rounded-full border border-dotted border-[#C69B3C]/70" />
                <div className="absolute inset-[4px] rounded-full bg-gradient-to-br from-[#7a1830] to-[#5c0f1e] flex items-center justify-center shadow-inner">
                  <span className="text-2xl font-serif font-black text-[#F5D76E] tracking-tight">YE</span>
                </div>
                <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-2xl text-[#C69B3C]">❋</span>
                <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-2xl text-[#C69B3C]">❋</span>
              </div>
              <div className="-mt-1.5 flex gap-1">
                <div className="h-6 w-3.5 rounded-b-sm bg-gradient-to-b from-[#6E1423] to-[#4a0d16]" />
                <div className="h-6 w-3.5 rounded-b-sm bg-gradient-to-b from-[#6E1423] to-[#4a0d16]" />
              </div>
            </div>
          ) : (
            <img src="/logo-light.png" alt="YouTube Earner" className="mx-auto h-12 w-auto" />
          )}

          {ribbonText && (
            <span
              className="relative z-20 mt-2 px-6 py-1.5 bg-[#6E1423] text-[#F5D76E] text-[13px] font-black tracking-[0.18em] uppercase shadow-md rounded-sm"
              style={{ clipPath: "polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%)" }}
            >
              {ribbonText}
            </span>
          )}

          <h3
            className={`mt-3 font-black tracking-wide ${
              isElite
                ? "font-serif text-[40px] tracking-[0.08em] text-[#1A1A1A]"
                : "text-4xl text-gray-900"
            }`}
          >
            {certTitle}
          </h3>

          {isElite ? (
            <div className="mt-2 flex items-center justify-center gap-2 w-72 mx-auto">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C69B3C]" />
              <span className="text-[#C69B3C] text-sm leading-none">◆</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C69B3C]" />
            </div>
          ) : (
            <div className="mt-2 mx-auto h-0.5 w-64 bg-gradient-to-r from-transparent via-gold to-transparent" />
          )}

          <p className={`mt-3 text-base font-bold ${isElite ? "italic text-[#7a1830]" : "text-gray-600"}`}>
            This certifies that
          </p>

          <p
            className={`mt-3 font-black ${
              isElite
                ? "font-serif italic text-[54px] bg-clip-text text-transparent bg-gradient-to-b from-[#E8C860] via-[#C69B3C] to-[#9a7a2e] drop-shadow-[0_1px_1px_rgba(110,20,35,0.2)]"
                : "text-5xl text-brand"
            }`}
          >
            {name}
          </p>

          <p
            className={`mt-4 text-base leading-relaxed max-w-3xl mx-auto ${
              isElite ? "font-medium text-[#3d2b1f]" : "text-gray-700"
            }`}
          >
            {bodyText}
          </p>

          <div className={`mt-6 flex w-full items-end justify-between ${isElite ? "text-[#3d2b1f]" : "text-gray-600"}`}>
            <div className="text-left text-sm">
              <p className={`font-black tracking-[0.08em] uppercase text-xs ${isElite ? "text-[#6E1423]" : "text-gray-900"}`}>Certificate ID</p>
              <p className="mt-1 font-mono font-bold">{certId}</p>
              <p className={`mt-3 font-black tracking-[0.08em] uppercase text-xs ${isElite ? "text-[#6E1423]" : "text-gray-900"}`}>Date</p>
              <p className="mt-1 font-bold">{date}</p>
            </div>
            <div className="flex flex-col items-center">
              {sample ? (
                <div className="flex h-[96px] w-[96px] items-center justify-center rounded-lg border border-gray-300 bg-gray-100">
                  <span className="text-center text-sm font-black leading-tight text-gray-400">🔒<br />SAMPLE QR</span>
                </div>
              ) : (
                <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                  <QRCode value={data?.qrValue || ""} size={112} />
                </div>
              )}
              <p className="mt-1 text-[10px] font-bold text-gray-400">
                {sample ? "Not verifiable" : "Scan to verify"}
              </p>
            </div>
          </div>

          {isElite ? (
            <div className="mt-6 flex w-full items-end justify-between pt-4 border-t border-[#C69B3C]/40 text-sm text-[#3d2b1f]">
              <div>
                <p className="font-bold">Authorized Signatory — YouTube Earner</p>
                <p className="mt-1">Verify online: {verifyLine}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7a1830] to-[#5c0f1e] shadow-inner ring-1 ring-[#C69B3C]/70">
                  <span className="text-[#F5D76E] text-base">✦</span>
                </div>
                <p className="mt-1 text-[8px] font-black tracking-[0.2em] uppercase text-[#6E1423]">
                  OFFICIAL SEAL
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 w-full pt-4 border-t text-sm text-gray-500">
              <p className="font-bold">Authorized Signatory — YouTube Earner</p>
              <p className="mt-1">Verify online: {verifyLine}</p>
            </div>
          )}
        </div>
      )}

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

        /* ── Ambassador "YouTube-friendly creator award" palette ──────────── */
        /* graphite + platinum/silver + champagne + metallic gold + diamond/icy */
        .ye-gold-text {
          background: linear-gradient(180deg, #E8D8AD 0%, #FFF4CF 16%, #F4D98B 36%, #D9B95C 55%, #B99238 75%, #87691F 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .ye-name-foil {
          background: linear-gradient(180deg, #F4D98B 0%, #D9B95C 32%, #B99238 62%, #87691F 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .ye-gold-rule {
          background: linear-gradient(90deg, transparent, #E8D8AD 25%, #F4E8C8 50%, #E8D8AD 75%, transparent);
        }
        .ye-silver-surface {
          background: linear-gradient(135deg, #626A72 0%, #8E969E 14%, #D9DEE2 32%, #F5F7F8 50%, #B8BEC4 64%, #8E969E 84%, #626A72 100%);
        }
        .ye-graphite-surface {
          background: linear-gradient(135deg, #111214 0%, #202226 45%, #2A2D31 60%, #111214 100%);
        }
        .ye-velvet {
          background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.05), transparent 60%),
            linear-gradient(180deg, #111214, #202226 50%, #111214);
        }
        .ye-paper-grain {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='linear' slope='0.045'/></feComponentTransfer></filter><rect width='140' height='140' filter='url(%23n)'/></svg>");
        }
      `}</style>
    </div>
  );
}
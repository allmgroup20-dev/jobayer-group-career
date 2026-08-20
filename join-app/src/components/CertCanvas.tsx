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
//   elite      — ultra-luxury international honor (ELITE FINAL CERTIFICATE):
//                100% reconstruction of the approved reference design — warm
//                ivory paper with fine grain, bold charcoal left panel with an
//                organic curved edge + thick gold curve + fine parallel gold
//                line, jagged 12-point gold medallion (gold-foil scalloped
//                perimeter, dark radial core, twin rings, ticks, ELITE/
//                EXCELLENCE) sitting on the panel boundary, soft champagne
//                shapes top-right, sweeping gold hairlines top + bottom, brand
//                two-tone wordmark + website, dark capsule title bar
//                "CERTIFICATE OF EXCELLENCE", small-caps presentation eyebrow,
//                large gold-foil block name (Cinzel, no script) over a thin
//                gold rule + descriptor + body copy, bottom row with 3
//                executive signatures (double champagne hairline + caps name),
//                date + certificate ID, and quiet QR + verify. No red, no flat
//                gold, no invented decoration — 100% English.
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

  const ribbonText = null;

  const bodyText = isElite
    ? "has been awarded the highest honor of the YouTube Earner community for extraordinary performance, uniting and mentoring a nationwide network of learners — a world-class benchmark of leadership, influence and digital mastery."
    : isAmbassador
      ? "has earned this premium recognition for outstanding community-building and digital marketing excellence, bringing a growing network of associates together as a trusted referral ambassador."
      : "has successfully completed their full profile on YouTube Earner and proven outstanding community-building and digital marketing skills by uniting a growing community of learners and friends.";

  const watermarkColor = isElite
    ? "text-[#252225]/[0.06]"
    : isAmbassador
      ? "text-[#111214]/[0.06]"
      : "text-gray-900/10";

  return (
    <div
      className={`relative text-gray-900 rounded-2xl shadow-2xl select-none overflow-hidden ${isAmbassador ? "bg-[#FBF8F1]" : isElite ? "bg-[#fffefa]" : "bg-white"} ${className || ""}`}
      style={{ width: A4_LANDSCAPE_W, height: A4_LANDSCAPE_H, ...style }}
    >
      {/* ═══════════ Tier decorations ═══════════ */}
      {isElite ? (
        <>
          {/* ═══ ELITE FINAL CERTIFICATE — reference design reconstruction ═══
              100% copy of the approved reference (preview.html): warm ivory
              paper + grain, bold charcoal left panel with organic curved edge,
              thick gold curve + fine parallel gold line, jagged 12-point gold
              medallion on the panel boundary, champagne shapes top-right,
              sweeping gold hairlines top + bottom, subtle inner paper edge.
              (few large shapes · no red · 100% EN) */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <svg viewBox="0 0 1122 794" className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="yeRefPaper" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fffefa" />
                  <stop offset=".55" stopColor="#fffdf8" />
                  <stop offset="1" stopColor="#fbfaf4" />
                </linearGradient>
                <linearGradient id="yeRefPanel" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#0e0d0e" />
                  <stop offset=".82" stopColor="#151315" />
                  <stop offset="1" stopColor="#211d20" />
                </linearGradient>
                <linearGradient id="yeRefGoldFoil" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#8c6314" />
                  <stop offset=".18" stopColor="#d0a333" />
                  <stop offset=".38" stopColor="#f0d36f" />
                  <stop offset=".55" stopColor="#b9851d" />
                  <stop offset=".78" stopColor="#e5c85b" />
                  <stop offset="1" stopColor="#936714" />
                </linearGradient>
                <linearGradient id="yeRefGoldLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#9f781e" />
                  <stop offset=".45" stopColor="#ead27e" />
                  <stop offset="1" stopColor="#a57718" />
                </linearGradient>
                <radialGradient id="yeRefMedalCenter" cx=".34" cy=".28" r=".82">
                  <stop offset="0" stopColor="#262124" />
                  <stop offset=".6" stopColor="#121012" />
                  <stop offset="1" stopColor="#090809" />
                </radialGradient>
                <filter id="yeRefMedalShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="2" dy="4" stdDeviation="5" floodColor="#000" floodOpacity=".30" />
                </filter>
                <filter id="yeRefGrain" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="11" result="n" />
                  <feColorMatrix in="n" type="saturate" values="0" result="m" />
                  <feComponentTransfer in="m">
                    <feFuncA type="table" tableValues="0 .022" />
                  </feComponentTransfer>
                </filter>
                <path id="yeRefMedalOuter" d="M0-61 C5-72 14-72 20-63 C26-54 33-53 43-56 C53-59 59-53 57-43 C55-33 59-26 68-20 C77-13 75-4 65 1 C56 6 54 14 59 24 C64 34 58 41 48 40 C37 39 30 44 27 54 C24 65 15 68 7 60 C0 52-8 53-15 60 C-23 68-32 64-34 53 C-36 43-42 38-52 40 C-63 42-68 35-64 25 C-60 15-62 8-71 2 C-80-4-78-13-69-19 C-60-26-58-34-61-43 C-64-54-56-60-46-57 C-36-54-28-57-23-66 C-17-76-8-72 0-61Z" />
                <path id="yeRefMedalInner" d="M0-48 C8-56 16-54 21-46 C27-38 34-36 44-39 C53-42 58-35 55-26 C52-17 55-10 63-4 C71 2 68 10 60 14 C51 18 49 26 53 35 C57 44 50 50 41 48 C32 46 25 51 20 59 C15 68 7 67 2 59 C-3 51-12 50-20 56 C-29 61-36 55-35 46 C-34 37-40 31-48 27 C-57 23-57 15-49 10 C-40 5-38-4-43-12 C-49-21-44-28-35-30 C-26-31-20-38-21-47 C-22-56-13-60-7-52 C-4-48-2-47 0-48Z" />
              </defs>

              {/* paper base + grain */}
              <rect width="1122" height="794" fill="url(#yeRefPaper)" />
              <rect width="1122" height="794" fill="#ffffff" opacity=".12" filter="url(#yeRefGrain)" />

              {/* right top champagne shapes — restrained, like the reference */}
              <path d="M760 0 C823 34 871 65 933 72 C1004 80 1067 64 1122 22 L1122 0Z" fill="#fbfaf4" />
              <path d="M815 0 C854 30 894 59 941 68 C1015 83 1078 68 1122 37 L1122 0Z" fill="#f0ead7" />
              <path d="M1079 73 C1095 87 1110 92 1122 94 L1122 205 C1087 200 1061 176 1045 145 C1034 124 1031 103 1033 85Z" fill="#f4eedf" />

              {/* left dark panel */}
              <path d="M0 0H78 C118 67 142 147 150 235 C159 333 157 452 146 546 C136 638 115 719 78 794 H0Z" fill="url(#yeRefPanel)" />

              {/* primary gold edge line */}
              <path d="M79 0 C121 68 145 148 154 237 C164 334 161 452 150 546 C140 641 117 722 79 794" fill="none" stroke="url(#yeRefGoldLine)" strokeWidth="4.8" />
              {/* fine gold parallel edge */}
              <path d="M86 0 C127 69 152 148 161 237 C170 336 168 451 156 548 C146 641 123 722 86 794" fill="none" stroke="#d7bd72" strokeWidth="1.05" opacity=".74" />

              {/* top sweeping hairlines */}
              <g fill="none" strokeLinecap="round">
                <path d="M92 12 C175 92 258 80 348 0" stroke="#aa914f" strokeWidth="1.15" opacity=".72" />
                <path d="M91 20 C176 101 264 88 358 0" stroke="#baa36a" strokeWidth="1.05" opacity=".70" />
                <path d="M90 28 C178 111 273 96 368 0" stroke="#c9bb96" strokeWidth="1" opacity=".62" />
                <path d="M90 36 C181 120 281 105 378 0" stroke="#d3c9ac" strokeWidth=".95" opacity=".56" />
              </g>

              {/* bottom sweeping hairlines */}
              <g fill="none" strokeLinecap="round">
                <path d="M89 781 C174 701 260 711 351 794" stroke="#aa914f" strokeWidth="1.15" opacity=".72" />
                <path d="M90 773 C177 691 267 703 360 794" stroke="#baa36a" strokeWidth="1.05" opacity=".70" />
                <path d="M91 765 C180 683 276 695 369 794" stroke="#c9bb96" strokeWidth="1" opacity=".62" />
                <path d="M92 757 C183 675 286 687 378 794" stroke="#d3c9ac" strokeWidth=".95" opacity=".56" />
              </g>

              {/* medallion — clean symmetric 12-point gold star medal on the curved boundary */}
              <g transform="translate(162 396)" filter="url(#yeRefMedalShadow)">
                {/* clean 12-point gold star — two 6-point stars, 30° apart (fully symmetric) */}
                <g fill="url(#yeRefGoldFoil)" stroke="#78540c" strokeWidth="1.2">
                  <use href="#yeRefStar6" />
                  <use href="#yeRefStar6" transform="rotate(30)" />
                </g>
                {/* circular medal core — dark charcoal radial + two clean gold rings */}
                <circle r="46" fill="url(#yeRefMedalCenter)" stroke="#a87b1a" strokeWidth="1.5" />
                <circle r="42" fill="none" stroke="#e9ca67" strokeWidth=".8" opacity=".9" />
                {/* clean center emblem — faceted gold diamond + two laurel arcs */}
                <path d="M-26 8 C-20 -4 -10 -6 -5 2" fill="none" stroke="url(#yeRefGoldFoil)" strokeWidth="1.3" strokeLinecap="round" opacity=".9" />
                <path d="M26 8 C20 -4 10 -6 5 2" fill="none" stroke="url(#yeRefGoldFoil)" strokeWidth="1.3" strokeLinecap="round" opacity=".9" />
                <path d="M0-20 L8-7 L0 18 L-8-7 Z" fill="url(#yeRefGoldFoil)" stroke="#f0d36f" strokeWidth=".7" />
                <path d="M0-20 L8-7 L0-7 Z" fill="#ffffff" opacity=".28" />
              </g>

              {/* ultra-subtle inner paper edge */}
              <rect x="5" y="5" width="1112" height="784" fill="none" stroke="#eee7d8" strokeWidth="1" />
            </svg>
          </div>
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

            {/* premium gold medallion seal — golden disc, larger rings */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-[104px] w-[104px] rounded-full border border-[#D9B95C]/60" />
              <div className="absolute h-[98px] w-[98px] rounded-full border border-[#E8D8AD]/70" />
              <div className="ye-gold-surface absolute h-[90px] w-[90px] rounded-full shadow-[inset_0_2px_3px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.35),0_6px_14px_rgba(0,0,0,0.2)]" />
              <div
                className="absolute h-[90px] w-[90px] rounded-full"
                style={{ background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.4), transparent 45%)" }}
              />
              <img
                src="/certs/ambassador-seal.png"
                alt="Official Seal"
                className="relative h-[78px] w-[78px] rounded-full object-cover opacity-95 mix-blend-multiply"
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
          className={`relative flex h-full flex-col items-center justify-center text-center ${
            isElite
              ? "p-0 text-[#1A1A1A]"
              : "px-14 text-gray-900"
          }`}
        >
          {isElite ? (
            <div className="absolute inset-0 z-20">
              {/* ── content column — shifted right to match the reference
                    proportions (optical center ≈ x647, because of the left panel) ── */}
              <div className="absolute left-[172px] right-[40px] top-0 flex h-full flex-col items-center text-center">
                {/* brand logo — dark logo on ivory paper */}
                <div className="mt-[84px] flex flex-col items-center">
                  <img src="/logo-light.png" alt="YouTube Earner" className="h-12 w-auto opacity-95" />
                </div>

                {/* capsule title bar */}
                <div className="mt-[84px] flex h-[28px] w-[455px] items-center justify-center rounded-full bg-[#111011]">
                  <span className="font-cinzel text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#FEFCF6]">
                    Certificate of Excellence
                  </span>
                </div>

                {/* presentation eyebrow */}
                <p className="mt-[30px] text-[8.8px] font-bold uppercase tracking-[0.22em] text-[#252225]">
                  This certificate is proudly presented to
                </p>

                {/* large gold-foil block name (no script — matches reference) */}
                <p
                  className="ye-ref-name mt-[70px] max-w-[620px] truncate font-cinzel text-[44px] font-bold leading-none tracking-[0.02em]"
                  style={{ marginRight: "-0.02em" }}
                >
                  {name}
                </p>

                {/* thin gold rule under the name */}
                <div className="ye-ref-gold-rule mt-[16px] h-[1.5px] w-[292px]" />

                {/* descriptor */}
                <p className="mt-[16px] text-[8.6px] font-bold uppercase tracking-[0.16em] text-[#272427]">
                  Elite · Executive Recognition
                </p>

                {/* body copy */}
                <p className="mt-[18px] max-w-[560px] text-[9.5px] font-medium leading-[1.7] tracking-[0.02em] text-[#393638]">
                  {bodyText}
                </p>
              </div>

              {/* ── bottom row — executive signatures · date/ID · QR/verify ── */}
              <div className="absolute left-[172px] right-[40px] top-[620px] flex items-end justify-between">
                {/* 3 executive signatures — reference style (double champagne
                    hairline + caps name) */}
                <div className="flex items-end gap-8">
                  <div className="flex w-[170px] flex-col items-center text-center">
                    <img src="/certs/elite-seal-ceo.png" alt="Seal" className="h-12 w-12 rounded-full object-cover ring-2 ring-[#c79a28]/50 shadow-[0_2px_6px_rgba(0,0,0,0.12)]" />
                    <img src="/certs/elite-signature-ceo.png" alt="Neal Mohan" className="mt-2 h-9 w-auto opacity-90" />
                    <div className="mt-1 h-px w-24 bg-[#c5b88f]" />
                    <div className="mt-px h-px w-24 bg-[#e4dcc5]" />
                    <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#454144]">Neal Mohan</p>
                    <p className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.08em] text-[#7a7478]">Chief Executive Officer</p>
                  </div>
                  <div className="flex w-[170px] flex-col items-center text-center">
                    <img src="/certs/elite-seal-cbo.png" alt="Seal" className="h-12 w-12 rounded-full object-cover ring-2 ring-[#c79a28]/50 shadow-[0_2px_6px_rgba(0,0,0,0.12)]" />
                    <img src="/certs/elite-signature-cbo.png" alt="Mary Ellen Coe" className="mt-2 h-9 w-auto opacity-90" />
                    <div className="mt-1 h-px w-24 bg-[#c5b88f]" />
                    <div className="mt-px h-px w-24 bg-[#e4dcc5]" />
                    <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#454144]">Mary Ellen Coe</p>
                    <p className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.08em] text-[#7a7478]">Chief Business Officer</p>
                  </div>
                  <div className="flex w-[170px] flex-col items-center text-center">
                    <img src="/certs/elite-seal-apac.png" alt="Seal" className="h-12 w-12 rounded-full object-cover ring-2 ring-[#c79a28]/50 shadow-[0_2px_6px_rgba(0,0,0,0.12)]" />
                    <img src="/certs/elite-signature-apac.png" alt="Sanjay Gupta" className="mt-2 h-9 w-auto opacity-90" />
                    <div className="mt-1 h-px w-24 bg-[#c5b88f]" />
                    <div className="mt-px h-px w-24 bg-[#e4dcc5]" />
                    <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#454144]">Sanjay Gupta</p>
                    <p className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.08em] text-[#7a7478]">President, Asia-Pacific</p>
                  </div>
                </div>

                {/* date + certificate id */}
                <div className="flex w-[170px] flex-col items-center text-center">
                  <p className="text-[14px] font-bold tracking-[0.06em] text-[#161416]">{date}</p>
                  <div className="mt-2 h-px w-24 bg-[#c5b88f]" />
                  <div className="mt-px h-px w-24 bg-[#e4dcc5]" />
                  <p className="mt-1.5 text-[8.5px] font-bold uppercase tracking-[0.18em] text-[#454144]">Date</p>
                  <p className="mt-2.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#454144]">Certificate ID</p>
                  <p className="mt-0.5 font-mono text-[10.5px] font-bold text-[#161416]">{certId}</p>
                </div>

                {/* QR + verify */}
                <div className="flex flex-col items-center">
                  {sample ? (
                    <div className="flex h-[56px] w-[56px] items-center justify-center rounded-md border border-[#b9b2a6] bg-[#f6f3ea]">
                      <span className="text-center text-[7px] font-bold leading-tight text-[#8a8378]">🔒<br />SAMPLE</span>
                    </div>
                  ) : (
                    <div className="rounded-md border border-[#c79a28]/40 bg-white p-1.5">
                      <QRCode value={data?.qrValue || ""} size={56} />
                    </div>
                  )}
                  <p className="mt-1.5 text-[7.5px] font-bold uppercase tracking-[0.1em] text-[#7a7478]">
                    {sample ? "Not verifiable" : "Scan to verify"}
                  </p>
                  <p className="mt-1 max-w-[160px] text-center text-[6.5px] font-bold uppercase leading-relaxed tracking-[0.06em] text-[#a19a90]">
                    Verify: {verifyLine}
                  </p>
                </div>
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

          {isElite ? null : (
            <>
              <h3 className="mt-3 font-black tracking-wide text-4xl text-gray-900">{certTitle}</h3>
              <div className="mt-2 mx-auto h-0.5 w-64 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <p className="mt-3 text-base font-bold text-gray-600">This certifies that</p>
              <p className="mt-3 text-5xl font-black text-brand">{name}</p>
              <p className="mt-4 text-base leading-relaxed max-w-3xl mx-auto text-gray-700">{bodyText}</p>
            </>
          )}

          {isElite ? null : (
            <>
              <div className="mt-6 flex w-full items-end justify-between text-gray-600">
                <div className="text-left text-sm">
                  <p className="font-black tracking-[0.08em] uppercase text-xs text-gray-900">Certificate ID</p>
                  <p className="mt-1 font-mono font-bold">{certId}</p>
                  <p className="mt-3 font-black tracking-[0.08em] uppercase text-xs text-gray-900">Date</p>
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
              <div className="mt-6 w-full pt-4 border-t text-sm text-gray-500">
                <p className="font-bold">Authorized Signatory — YouTube Earner</p>
                <p className="mt-1">Verify online: {verifyLine}</p>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
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
        .ye-gold-surface {
          background: linear-gradient(135deg, #5F491A 0%, #87691F 15%, #D9B95C 32%, #FFF4CF 48%, #F4D98B 58%, #D9B95C 70%, #87691F 88%, #5F491A 100%);
        }
        .ye-graphite-surface {
          background: linear-gradient(135deg, #111214 0%, #202226 45%, #2A2D31 60%, #111214 100%);
        }
        .ye-velvet {
          background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.05), transparent 60%),
            linear-gradient(180deg, #111214, #202226 50%, #111214);
        }
        .ye-paper-grain {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='linear' slope='0.035'/></feComponentTransfer></filter><rect width='140' height='140' filter='url(%23n)'/></svg>");
        }

        /* ── Elite palette — reference design reconstruction ─────────────── */
        /* warm ivory paper + charcoal panel + gold foil + champagne + ink
           (gold-foil name + thin gold rule utilities; no red, no flat gold) */
        .ye-ref-name {
          background: linear-gradient(180deg, #8c6314 0%, #d0a333 18%, #f0d36f 38%, #b9851d 55%, #e5c85b 78%, #936714 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .ye-ref-gold-rule {
          background: linear-gradient(90deg, #9f781e, #ead27e, #a57718);
        }
      `}</style>
    </div>
  );
}
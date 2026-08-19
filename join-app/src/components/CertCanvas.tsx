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
//   elite      — ultra-luxury international honor (LUXURY CREATOR AWARD —
//                executive edition): COMPLETE ART DIRECTION — full-bleed midnight
//                navy mat (#091725→#0D1D2C→#12283A) with a single master metallic
//                gold hairline frame + ultra-fine platinum hairline + 4 layered
//                architectural corners (navy→gold→platinum→ivory diagonal cuts),
//                one flowing metallic gold S-curve ribbon in the bottom navy band
//                (dark gold edge → metallic body → champagne highlight → thin
//                bright reflection), central ivory inlaid plate (#FBF8F0, cotton
//                paper grain + warm light + faint champagne wave + recessed
//                shadow + gold inner frame), editorial Cinzel "CERTIFICATE OF
//                EXCELLENCE" masthead with gold-foil subtitle + diamond ornaments,
//                7-layer embossed medallion (graphite shadow → gold scalloped
//                edge → platinum ring → navy velvet ring → engraved gold ring →
//                laurel + faceted gold diamond → micro stars), champagne-foil
//                Great Vibes name over a single thin gold rule with diamond
//                point, 3-column executive signing area (CEO/CBO/APAC) with
//                seals, micro-typography metadata + graphite QR. Generous
//                negative space — few large confident shapes, no decoration
//                overload, no red, no flat gold, 100% English.
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

/* ── Elite "Luxury Creator Award" building blocks ─────────────────────────
   midnight navy + ivory + platinum + champagne + metallic gold + diamond.
   A few large, confident shapes — not scattered micro-decoration. */

function LuxuryCorner({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute h-[52px] w-[52px] pointer-events-none";
  const pos =
    corner === "tl"
      ? "top-[28px] left-[28px]"
      : corner === "tr"
        ? "top-[28px] right-[28px]"
        : corner === "bl"
          ? "bottom-[28px] left-[28px]"
          : "bottom-[28px] right-[28px]";
  const flipH = corner === "tr" || corner === "br" ? "-scale-x-100" : "";
  const flipV = corner === "bl" || corner === "br" ? "-scale-y-100" : "";
  return (
    <div className={`${base} ${pos} ${flipH} ${flipV}`}>
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)", background: "linear-gradient(135deg, #0D1D2C, #12283A)" }}
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(0 0, 60% 0, 0 60%)", background: "linear-gradient(135deg, #FFF3C4, #D5AF50 38%, #87621F 76%, #5B4116)" }}
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)", boxShadow: "inset 0 0 0 1px rgba(242,245,247,0.3)" }}
      />
    </div>
  );
}

function GoldRibbon() {
  return (
    <svg className="absolute bottom-[14px] left-0 right-0 h-[60px] w-full pointer-events-none" viewBox="0 0 1122 68" fill="none" preserveAspectRatio="none">
      <defs>
        <linearGradient id="yeRibbonBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#87621F" />
          <stop offset="0.14" stopColor="#B8862F" />
          <stop offset="0.26" stopColor="#D5AF50" />
          <stop offset="0.36" stopColor="#F2D27B" />
          <stop offset="0.44" stopColor="#FFF3C4" />
          <stop offset="0.5" stopColor="#D5AF50" />
          <stop offset="0.62" stopColor="#B8862F" />
          <stop offset="0.72" stopColor="#F2D27B" />
          <stop offset="0.8" stopColor="#FFF3C4" />
          <stop offset="0.9" stopColor="#D5AF50" />
          <stop offset="1" stopColor="#87621F" />
        </linearGradient>
      </defs>
      {/* soft contact shadow (below the ribbon) */}
      <path
        d="M-140 56 C 80 40, 240 70, 400 58 C 560 46, 720 68, 940 52 C 1080 42, 1200 58, 1262 48 L1262 62 C 1200 72, 1080 58, 940 72 C 720 86, 560 64, 400 76 C 240 88, 80 58, -140 74 Z"
        fill="#0D0F12"
        opacity="0.14"
      />
      {/* dark gold edge (bottom rim — gives the ribbon thickness) */}
      <path
        d="M-140 46 C 80 30, 240 60, 400 48 C 560 36, 720 58, 940 42 C 1080 32, 1200 48, 1262 38 L1262 52 C 1200 62, 1080 48, 940 62 C 720 76, 560 54, 400 66 C 240 78, 80 48, -140 64 Z"
        fill="#5B4116"
      />
      {/* metallic gold body — controlled highlight zones (≈44% + 80%) */}
      <path
        d="M-140 24 C 80 8, 240 38, 400 26 C 560 14, 720 36, 940 20 C 1080 10, 1200 28, 1262 18 L1262 38 C 1200 48, 1080 30, 940 42 C 720 58, 560 36, 400 48 C 240 60, 80 30, -140 46 Z"
        fill="url(#yeRibbonBody)"
      />
      {/* subtle dark top edge */}
      <path d="M-140 24 C 80 8, 240 38, 400 26 C 560 14, 720 36, 940 20 C 1080 10, 1200 28, 1262 18" stroke="#5B4116" strokeWidth="1.1" opacity="0.5" />
      {/* one controlled champagne highlight (upper-left light zone) */}
      <path d="M110 9 C 235 3, 340 17, 430 16" stroke="#F2D27B" strokeWidth="4.5" opacity="0.55" strokeLinecap="round" />
      {/* tiny specular accent — same light zone, very subtle */}
      <path d="M145 6 C 215 1, 290 11, 350 10" stroke="#FFFFFF" strokeWidth="1.1" opacity="0.32" strokeLinecap="round" />
    </svg>
  );
}

function EliteMedallion() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-[82px] w-[82px] items-center justify-center">
        {/* layer 1 · tight contact shadow — pressed into the card, not floating */}
        <div className="absolute inset-[3px] rounded-full shadow-[0_5px_10px_rgba(9,23,37,0.28),inset_0_1px_0_rgba(255,243,196,0.5)]" />
        {/* layer 2 · metallic gold scalloped outer edge */}
        <div className="ye-gold-metal absolute inset-0 rounded-full shadow-[inset_0_2px_3px_rgba(255,243,196,0.45),inset_0_-3px_6px_rgba(0,0,0,0.4)]" />
        {/* very thin bright polished rim (upper-left light) */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,243,196,0.35), inset -2px -2px 4px rgba(0,0,0,0.18)" }}
        />
        {/* fine scallop engraving on the gold edge */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,243,196,0.55) 1px, transparent 1.6px)", backgroundSize: "9px 9px" }}
        />
        {/* bright upper-left highlight (soft, satin — not plastic) */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.3), transparent 46%)" }}
        />
        {/* layer 3 · polished platinum ring */}
        <div className="ye-platinum-metal absolute inset-[7px] rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),inset_0_-2px_3px_rgba(0,0,0,0.28)]" />
        {/* layer 4 · navy/graphite velvet inner ring */}
        <div className="ye-navy-velvet-ring absolute inset-[12px] rounded-full" />
        {/* layer 5 · one fine engraved gold ring */}
        <div className="absolute inset-[15px] rounded-full border border-dotted border-[#D5AF50]/80" />
        {/* crystal glow on center */}
        <div
          className="absolute inset-[15px] rounded-full"
          style={{ background: "radial-gradient(circle at 32% 26%, rgba(245,250,252,0.3), transparent 42%)" }}
        />
        {/* micro engraving stars (max 3) */}
        <span className="absolute left-[23%] top-[19%] h-[4px] w-[4px] rounded-full bg-white opacity-70" />
        <span className="absolute right-[19%] top-[33%] h-[3px] w-[3px] rounded-full bg-white opacity-55" />
        <span className="absolute left-[27%] bottom-[21%] h-[3px] w-[3px] rounded-full bg-[#F5FAFC] opacity-60" />
        {/* layer 6+7 · restrained laurel + faceted gold diamond */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="yeDiamondGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFF3C4" />
              <stop offset="0.4" stopColor="#D5AF50" />
              <stop offset="0.75" stopColor="#B8862F" />
              <stop offset="1" stopColor="#87621F" />
            </linearGradient>
          </defs>
          {/* thin engraved laurel branches */}
          <path d="M31 35 C 22 46, 18 58, 26 68" fill="none" stroke="url(#yeDiamondGrad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
          <path d="M69 35 C 78 46, 82 58, 74 68" fill="none" stroke="url(#yeDiamondGrad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
          <path d="M27 44 l3.6 -2.4 l0.4 4 Z" fill="#D5AF50" opacity="0.7" />
          <path d="M24 53 l3.5 -2.5 l0.5 3.7 Z" fill="#D5AF50" opacity="0.7" />
          <path d="M73 44 l-3.6 -2.4 l-0.4 4 Z" fill="#D5AF50" opacity="0.7" />
          <path d="M76 53 l-3.5 -2.5 l-0.5 3.7 Z" fill="#D5AF50" opacity="0.7" />
          {/* one elegant faceted gold diamond — small + precise */}
          <path d="M50 31 L58 44 L50 66 L42 44 Z" fill="url(#yeDiamondGrad)" stroke="#FFF3C4" strokeWidth="0.8" />
          <path d="M50 31 L58 44 L50 44 Z" fill="#FFFFFF" opacity="0.28" />
          <path d="M50 44 L58 44 L50 66 Z" fill="#5B4116" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

function LuxuryDivider({ width = 320 }: { width?: number }) {
  return (
    <div className="flex items-center justify-center gap-2" style={{ width }}>
      <div className="ye-gold-rule-e h-px flex-1" />
      <svg viewBox="0 0 10 10" className="h-[8px] w-[8px]" aria-hidden="true">
        <rect x="2.7" y="2.7" width="4.6" height="4.6" transform="rotate(45 5 5)" fill="#FFFFFF" stroke="#D5AF50" strokeWidth="1" />
      </svg>
      <div className="ye-gold-rule-e h-px flex-1" />
    </div>
  );
}

function ExecutiveSignature({
  sig,
  seal,
  name,
  role,
  office,
}: {
  sig: string;
  seal: string;
  name: string;
  role: string;
  office: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-end justify-center gap-2">
        <img src={sig} alt={name} className="h-8 w-auto opacity-90" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.12))" }} />
        <img src={seal} alt="Seal" className="h-7 w-7 rounded-full object-cover mix-blend-multiply ring-1 ring-[#D5AF50]/50" />
      </div>
      <div className="ye-gold-rule-e mt-1 h-px w-24" />
      <p className="mt-1.5 font-cinzel text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#111214]">{name}</p>
      <p className="mt-0.5 text-[6.5px] font-bold uppercase tracking-[0.12em] text-[#68737C]">{role}</p>
      <p className="mt-0.5 text-[7.5px] font-medium uppercase tracking-[0.06em] text-[#929DA6]">{office}</p>
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
    ? "text-[#F5F0E6]/[0.05]"
    : isAmbassador
      ? "text-[#111214]/[0.06]"
      : "text-gray-900/10";

  return (
    <div
      className={`relative text-gray-900 rounded-2xl shadow-2xl select-none overflow-hidden ${isAmbassador ? "bg-[#FBF8F1]" : isElite ? "bg-[#091725]" : "bg-white"} ${className || ""}`}
      style={{ width: A4_LANDSCAPE_W, height: A4_LANDSCAPE_H, ...style }}
    >
      {/* ═══════════ Tier decorations ═══════════ */}
      {isElite ? (
        <>
          {/* ═══ LUXURY CREATOR AWARD — executive edition ═══
              COMPLETE ART DIRECTION: midnight navy mat → ivory inlaid plate
              → metallic gold architecture → one flowing gold ribbon.
              (few large shapes · generous negative space · no red · 100% EN) */}
          {/* ── layer 1 · full-bleed midnight navy mat ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 34%, #12283A 0%, #0D1D2C 55%, #091725 100%)",
            }}
          />
          {/* navy depth grain */}
          <div className="ye-navy-grain absolute inset-0 pointer-events-none" />
          {/* satin center sheen (extremely subtle velvet light) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0.03), transparent 55%)" }}
          />
          {/* ── layer 2 · outer gold frame (one master gold hairline, restrained) ── */}
          <div
            className="absolute inset-[10px] rounded-[14px] opacity-[0.85] pointer-events-none"
            style={{ border: "1px solid", borderImage: "linear-gradient(135deg, #5B4116 0%, #87621F 14%, #D5AF50 30%, #FFF3C4 48%, #F2D27B 62%, #D5AF50 78%, #87621F 90%, #5B4116 100%) 1" }}
          />
          {/* ultra-fine platinum hairline just outside the gold */}
          <div className="absolute inset-[13px] rounded-[12px] border border-[#AEB8C0]/60 pointer-events-none" />
          {/* ── layer 3 · architectural corners (4) — navy → gold → platinum → ivory ── */}
          <LuxuryCorner corner="tl" />
          <LuxuryCorner corner="tr" />
          <LuxuryCorner corner="bl" />
          <LuxuryCorner corner="br" />
          {/* ── layer 4 · central ivory plate (inlaid card) ── */}
          <div className="absolute left-[44px] right-[44px] top-[44px] bottom-[64px] rounded-[12px] pointer-events-none">
            {/* ivory cardstock base + warm light + soft vignette */}
            <div className="ye-ivory-plate absolute inset-0 rounded-[12px]" />
            {/* fine cotton paper grain */}
            <div className="ye-paper-grain absolute inset-0 rounded-[12px]" />
            {/* faint champagne wave (one, subtle) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1034 686" fill="none" preserveAspectRatio="none">
              <path d="M-20 150 C 200 110, 420 210, 620 160 C 820 110, 980 210, 1054 150" stroke="#E9D6A4" strokeWidth="1.2" opacity="0.05" />
            </svg>
            {/* plate edge · layer 1 · soft recessed shadow (inlaid, not floating) */}
            <div
              className="absolute inset-0 rounded-[12px] pointer-events-none"
              style={{ boxShadow: "inset 0 1.5px 10px rgba(9,23,37,0.08), inset 0 -1.5px 10px rgba(9,23,37,0.05)" }}
            />
            {/* plate edge · layer 2 · ultra-fine champagne line */}
            <div className="absolute inset-[15px] rounded-[7px] border border-[#E9D6A4]/65 pointer-events-none" />
            {/* plate edge · layer 3 · subtle platinum hairline */}
            <div className="absolute inset-[12px] rounded-[9px] border border-[#AEB8C0]/45 pointer-events-none" />
            {/* subtle warm edge light */}
            <div
              className="absolute inset-0 rounded-[12px] pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0.3), transparent 60%)" }}
            />
            {/* extremely subtle edge darkening — clean cardstock depth */}
            <div
              className="absolute inset-0 rounded-[12px] pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, transparent 72%, rgba(9,23,37,0.045) 100%)" }}
            />
          </div>
          {/* ── layer 5 · flowing metallic gold ribbon (bottom navy band) ── */}
          <div className="absolute bottom-[12px] left-0 right-0 pointer-events-none">
            <GoldRibbon />
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
              ? "px-[78px] pt-[48px] pb-[96px] text-[#1A1A1A]"
              : "px-14 text-gray-900"
          }`}
        >
          {isElite ? (
            <div className="relative z-20 flex w-full flex-col items-center text-center">
              {/* typographic column — hidden grid, optical axis ≈ 561 */}
              <div className="flex w-full max-w-[620px] flex-col items-center text-center">
                {/* editorial masthead — brand logo + tier marker + title */}
                <img src="/logo-light.png" alt="YouTube Earner" className="h-6 w-auto opacity-90" />
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className="ye-gold-rule-e h-px w-8" />
                  <span className="text-[7px] font-bold uppercase tracking-[0.32em] text-[#AEB8C0]">Elite · Executive Recognition</span>
                  <div className="ye-gold-rule-e h-px w-8" />
                </div>
                <h3
                  className="mt-2.5 font-cinzel text-[42px] font-bold leading-none tracking-[0.2em] text-[#111214]"
                  style={{ marginRight: "-0.2em" }}
                >
                  CERTIFICATE
                </h3>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <div className="ye-gold-rule-e h-px w-20" />
                  <svg viewBox="0 0 10 10" className="h-2 w-2" aria-hidden="true">
                    <rect x="2.7" y="2.7" width="4.6" height="4.6" transform="rotate(45 5 5)" fill="#FFFFFF" stroke="#D5AF50" strokeWidth="1" />
                  </svg>
                  <span
                    className="ye-champagne-master font-cinzel text-[16px] font-bold uppercase tracking-[0.45em]"
                    style={{ marginRight: "-0.45em" }}
                  >
                    OF EXCELLENCE
                  </span>
                  <svg viewBox="0 0 10 10" className="h-2 w-2" aria-hidden="true">
                    <rect x="2.7" y="2.7" width="4.6" height="4.6" transform="rotate(45 5 5)" fill="#FFFFFF" stroke="#D5AF50" strokeWidth="1" />
                  </svg>
                  <div className="ye-gold-rule-e h-px w-20" />
                </div>
                {/* premium embossed medallion */}
                <div className="mt-5">
                  <EliteMedallion />
                </div>
                {/* presentation line */}
                <p className="mt-5 text-[10.5px] font-semibold uppercase tracking-[0.36em] text-[#57504a]">
                  This certificate is proudly presented to
                </p>
                {/* champagne-gold script name with embossed lift */}
                <p
                  className="ye-name-foil-e mt-3 font-great-vibes text-[48px] leading-none"
                  style={{ filter: "drop-shadow(0 1px 0 rgba(255,243,196,0.55)) drop-shadow(0 1px 1px rgba(60,40,5,0.16))" }}
                >
                  {name}
                </p>
                <div className="mt-3">
                  <LuxuryDivider width={360} />
                </div>
                {/* achievement description — editorial copy, restrained */}
                <p className="mt-3 max-w-[540px] text-[13px] font-medium leading-[1.55] tracking-[0.01em] text-[#57504a]">
                  {bodyText}
                </p>
              </div>
              {/* executive signing area */}
              <div className="mt-5 w-full">
                <div className="grid grid-cols-3 gap-5 text-center text-[#2a2a2a]">
                  <ExecutiveSignature
                    sig="/certs/elite-signature-ceo.png"
                    seal="/certs/elite-seal-ceo.png"
                    name="Neal Mohan"
                    role="Chief Executive Officer"
                    office="YouTube Global · San Bruno, USA"
                  />
                  <ExecutiveSignature
                    sig="/certs/elite-signature-cbo.png"
                    seal="/certs/elite-seal-cbo.png"
                    name="Mary Ellen Coe"
                    role="Chief Business Officer"
                    office="YouTube Global · San Bruno, USA"
                  />
                  <ExecutiveSignature
                    sig="/certs/elite-signature-apac.png"
                    seal="/certs/elite-seal-apac.png"
                    name="Sanjay Gupta"
                    role="President, Asia-Pacific"
                    office="YouTube Asia Pacific · Singapore"
                  />
                </div>
                {/* metadata + QR row — informationally rich, visually quiet */}
                <div className="mt-4 flex w-full items-end justify-between border-t border-[#E9D6A4]/55 pt-2.5 text-[#2a2a2a]">
                  <div className="text-left">
                    <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#929DA6]">Issued Date</p>
                    <p className="mt-1 text-[12px] font-bold text-[#1a1a1a]">{date}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    {sample ? (
                      <div className="flex h-[56px] w-[56px] items-center justify-center rounded-md border border-[#AEB8C0] bg-[#F2F5F7]">
                        <span className="text-center text-[8px] font-bold leading-tight text-[#AEB8C0]">🔒<br />SAMPLE</span>
                      </div>
                    ) : (
                      <div className="rounded-md border border-[#D5AF50]/40 bg-white p-1.5">
                        <QRCode value={data?.qrValue || ""} size={56} />
                      </div>
                    )}
                    <p className="mt-1.5 text-[7px] font-bold uppercase tracking-[0.1em] text-[#AEB8C0]">
                      {sample ? "Not verifiable" : "Scan to verify"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#929DA6]">Certificate ID</p>
                    <p className="mt-1 font-mono text-[12px] font-bold text-[#1a1a1a]">{certId}</p>
                    <p className="mt-1.5 text-[7px] font-bold uppercase tracking-[0.1em] text-[#929DA6]">Verify: {verifyLine}</p>
                  </div>
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

        /* ── Elite "Luxury Creator Award" palette ─────────────────────────── */
        /* midnight navy + ivory + platinum + champagne + metallic gold + diamond
           (one master gold-foil system · no red, no flat gold) */
        .ye-champagne-master {
          background: linear-gradient(180deg, #F3E5C1 0%, #FFF3C4 18%, #F2D27B 45%, #D5AF50 72%, #B8862F 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .ye-name-foil-e {
          background: linear-gradient(180deg, #F3E5C1 0%, #FFF3C4 20%, #F2D27B 42%, #D5AF50 62%, #B8862F 80%, #87621F 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .ye-gold-rule-e {
          background: linear-gradient(90deg, transparent, #E9D6A4 25%, #F3E5C1 50%, #E9D6A4 75%, transparent);
        }
        .ye-gold-metal {
          background: linear-gradient(135deg, #5B4116 0%, #87621F 14%, #D5AF50 32%, #FFF3C4 48%, #F2D27B 58%, #D5AF50 72%, #87621F 86%, #5B4116 100%);
        }
        .ye-platinum-metal {
          background: linear-gradient(135deg, #AEB8C0 0%, #D5DCE1 16%, #F5FAFC 34%, #FFFFFF 48%, #F2F5F7 58%, #D5DCE1 76%, #AEB8C0 100%);
        }
        .ye-navy-velvet-ring {
          background: radial-gradient(circle at 32% 26%, rgba(255,255,255,0.06), transparent 55%),
            linear-gradient(180deg, #0D1D2C, #12283A 55%, #091725);
        }
        .ye-navy-grain {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='linear' slope='0.028'/></feComponentTransfer></filter><rect width='160' height='160' filter='url(%23n)'/></svg>");
        }
        .ye-ivory-plate {
          background: radial-gradient(ellipse at 50% 38%, #FFFDF8 0%, #FBF8F0 45%, #F5F0E6 100%);
        }
      `}</style>
    </div>
  );
}
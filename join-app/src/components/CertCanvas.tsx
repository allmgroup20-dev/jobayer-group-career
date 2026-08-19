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
//   ambassador — ULTRA-PREMIUM luxury award (Reference #2, material realism):
//                layered velvet-black ornamental side panels (SVG, organic
//                bezier inner edge, metallic-gold curves + contour lines +
//                particles + dot texture + edge catch-light + cast shadow),
//                4-layer border system (metallic gold border-image → champagne
//                → ivory breathing space), ivory cardstock center with fine
//                paper grain + warm vignette + champagne wave lines, editorial
//                "CERTIFICATE OF EXCELLENCE" header in Cinzel, embossed gold
//                medallion emblem (metallic foil disc, concentric rings,
//                engraved dot ring, inline-SVG gold star, velvet black core,
//                gold-tipped ribbon), Great Vibes gold-foil recipient name,
//                executive signing area with printed signature + wax-style seal
//                + small QR with quiet zone
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
            <stop offset="0" stopColor="#070707" />
            <stop offset="0.5" stopColor="#1d1a14" />
            <stop offset="1" stopColor="#070707" />
          </linearGradient>
          <radialGradient id={`sheen${side}`} cx="0.32" cy="0.28" r="0.8">
            <stop offset="0" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id={`goldEdge${side}`} x1="0" y1="0" x2="118" y2="794" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6d551f" />
            <stop offset="0.3" stopColor="#C69B3C" />
            <stop offset="0.5" stopColor="#F5E5A6" />
            <stop offset="0.7" stopColor="#C69B3C" />
            <stop offset="1" stopColor="#6d551f" />
          </linearGradient>
          <linearGradient id={`flow${side}`} x1="0" y1="0" x2="118" y2="794" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#9a7a2e" />
            <stop offset="0.4" stopColor="#E8C860" />
            <stop offset="0.55" stopColor="#FBF3C9" />
            <stop offset="0.75" stopColor="#C69B3C" />
            <stop offset="1" stopColor="#6d551f" />
          </linearGradient>
          <pattern id={`dots${side}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="rgba(212,175,55,0.28)" />
          </pattern>
        </defs>

        <g transform={left ? undefined : "scale(-1,1) translate(-118,0)"}>
          {/* 1 · velvet black base */}
          <path d={`${b} L 0 794 L 0 0 Z`} fill={`url(#velvet${side})`} />
          {/* soft velvet sheen */}
          <path d={`${b} L 0 794 L 0 0 Z`} fill={`url(#sheen${side})`} />
          {/* fine gold dot texture */}
          <path d={`${b} L 0 794 L 0 0 Z`} fill={`url(#dots${side})`} opacity="0.85" />
          {/* 2 · metallic-gold boundary edge */}
          <path d={b} fill="none" stroke={`url(#goldEdge${side})`} strokeWidth="2" />
          {/* light catch on the raised edge */}
          <path d="M117 0 C 99 80, 105 170, 95 258 C 87 346, 99 442, 111 468 C 103 536, 91 620, 99 700 C 104 746, 113 776, 117 794" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          {/* 3 · thin gold contour line */}
          <path d="M112 0 C 94 80, 100 170, 90 258 C 82 346, 94 442, 106 468 C 98 536, 86 620, 94 700 C 99 746, 108 776, 112 794" fill="none" stroke="#C69B3C" strokeWidth="0.7" opacity="0.45" />
          {/* 4 · large flowing metallic-gold curve */}
          <path d="M118 62 C 62 190, 30 330, 74 420 C 36 505, 58 640, 110 722" fill="none" stroke={`url(#flow${side})`} strokeWidth="2.2" opacity="0.7" />
          {/* 7 · secondary dashed curve */}
          <path d="M118 150 C 56 270, 24 400, 66 480 C 34 560, 66 700, 112 762" fill="none" stroke={`url(#flow${side})`} strokeWidth="1" opacity="0.32" strokeDasharray="3 7" />
          <path d="M118 236 C 48 342, 28 462, 62 548 C 42 620, 78 720, 114 780" fill="none" stroke="#E8C860" strokeWidth="0.8" opacity="0.2" />
          {/* 5 · champagne particle field */}
          <circle cx="92" cy="120" r="1.6" fill="#E8C860" opacity="0.8" />
          <circle cx="70" cy="210" r="1" fill="#C69B3C" opacity="0.6" />
          <circle cx="100" cy="320" r="2" fill="#FBF3C9" opacity="0.5" />
          <circle cx="56" cy="405" r="1.3" fill="#C69B3C" opacity="0.7" />
          <circle cx="86" cy="500" r="1.1" fill="#E8C860" opacity="0.6" />
          <circle cx="104" cy="590" r="1.7" fill="#E8C860" opacity="0.45" />
          <circle cx="62" cy="660" r="1" fill="#FBF3C9" opacity="0.7" />
          <circle cx="90" cy="740" r="1.4" fill="#C69B3C" opacity="0.5" />
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
      ? "text-[#0b0b0b]/[0.07]"
      : "text-gray-900/10";

  return (
    <div
      className={`relative bg-white text-gray-900 rounded-2xl shadow-2xl select-none overflow-hidden ${isAmbassador ? "bg-[#FDFBF7]" : isElite ? "bg-[#F8F1E1]" : "bg-white"} ${className || ""}`}
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
          {/* ULTRA-PREMIUM luxury — material realism: layered borders, ivory
              cardstock grain + vignette, champagne waves, velvet-gold panels */}
          {/* border system · layer 1: metallic-gold foil line (border-image) */}
          <div
            className="absolute inset-[5px] rounded-[10px] pointer-events-none"
            style={{ border: "1px solid", borderImage: "linear-gradient(135deg, #6d551f 0%, #C69B3C 25%, #F3E1A0 50%, #C69B3C 75%, #6d551f 100%) 1" }}
          />
          {/* border system · layer 2: fine champagne hairline */}
          <div className="absolute inset-[10px] rounded-[8px] border border-[#C69B3C]/40 pointer-events-none" />
          {/* central content frame (around the ornamental panels) */}
          <div className="absolute left-[124px] right-[124px] top-[7px] bottom-[7px] rounded-lg border-[1.5px] border-[#C69B3C] pointer-events-none" />
          <div className="absolute left-[131px] right-[131px] top-[14px] bottom-[14px] rounded-md border border-[#C69B3C]/40 pointer-events-none" />
          {/* fine ivory cardstock grain + warm vignette */}
          <div className="ye-paper-grain absolute inset-0 pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(120,95,45,0.06) 100%)" }}
          />
          {/* refined champagne wave lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1122 794" fill="none" preserveAspectRatio="none">
            <path d="M-20 236 C 220 186, 380 306, 560 246 C 760 176, 940 286, 1142 226" stroke="#C69B3C" strokeWidth="1.1" opacity="0.05" />
            <path d="M-20 304 C 220 264, 380 364, 560 314 C 760 264, 940 344, 1142 294" stroke="#C69B3C" strokeWidth="0.8" opacity="0.04" />
            <path d="M-20 470 C 220 530, 380 440, 560 510 C 760 560, 940 460, 1142 530" stroke="#E8C860" strokeWidth="0.8" opacity="0.04" />
            <path d="M-20 546 C 220 596, 380 506, 560 576 C 760 626, 940 526, 1142 596" stroke="#C69B3C" strokeWidth="1.1" opacity="0.05" />
          </svg>
          {/* velvet-black + metallic-gold ornamental side panels */}
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
          <span className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-full bg-gold px-3 py-1 text-[13px] font-black uppercase tracking-wider text-white">
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
          <p className="text-[10px] font-black uppercase tracking-[0.42em] text-[#a08a4f]">YouTube Earner</p>

          <h3 className="mt-3.5 font-cinzel text-[50px] font-bold leading-none tracking-[0.14em] text-[#101010]">
            CERTIFICATE
          </h3>

          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="ye-gold-rule h-px w-16" />
            <span className="text-[8px] text-[#C69B3C]">◆</span>
            <span className="ye-gold-text font-cinzel text-[19px] font-bold uppercase tracking-[0.42em]">
              OF EXCELLENCE
            </span>
            <span className="text-[8px] text-[#C69B3C]">◆</span>
            <div className="ye-gold-rule h-px w-16" />
          </div>

          {/* embossed gold medallion emblem */}
          <div className="mt-5 flex flex-col items-center">
            <div className="relative flex h-[84px] w-[84px] items-center justify-center">
              {/* metallic gold foil disc with embossed edge */}
              <div className="ye-gold-surface absolute inset-0 rounded-full shadow-[inset_0_2px_3px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.4),0_8px_18px_rgba(0,0,0,0.28)]" />
              {/* bright top-left catch-light */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.5), transparent 45%)" }}
              />
              {/* concentric gold rings */}
              <div className="absolute inset-[5px] rounded-full border border-[#9a7a2e]/70" />
              <div className="absolute inset-[8px] rounded-full border border-[#F3E1A0]/80" />
              {/* velvet black core */}
              <div className="ye-velvet absolute inset-[11px] rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)]" />
              {/* engraved dot ring */}
              <div
                className="absolute inset-[16px] rounded-full"
                style={{ backgroundImage: "radial-gradient(circle, rgba(232,200,96,0.7) 1px, transparent 1.4px)", backgroundSize: "7px 7px" }}
              />
              <div className="absolute inset-[26px] rounded-full border border-[#C69B3C]/70" />
              {/* inline-SVG metallic gold star (not a text glyph) */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="yeAmbStar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FBF3C9" />
                    <stop offset="0.45" stopColor="#E8C860" />
                    <stop offset="1" stopColor="#9a7a2e" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 22 L57.8 41.2 L78.5 41.8 L62.2 54.8 L67.8 74.2 L50 61.4 L32.2 74.2 L37.8 54.8 L21.5 41.8 L42.2 41.2 Z"
                  fill="url(#yeAmbStar)"
                  stroke="#F3E1A0"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
            {/* premium black ribbons with gold tips */}
            <div className="mt-1.5 flex items-start gap-2">
              <div className="flex flex-col items-center">
                <div className="h-6 w-[22px] rounded-t-sm border-x border-[#C69B3C]/50 bg-gradient-to-b from-[#0a0a0a] to-[#1d1a14]" />
                <div className="h-[6px] w-[24px] bg-gradient-to-b from-[#E8C860] to-[#9a7a2e] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-[22px] rounded-t-sm border-x border-[#C69B3C]/50 bg-gradient-to-b from-[#0a0a0a] to-[#1d1a14]" />
                <div className="h-[6px] w-[24px] bg-gradient-to-b from-[#E8C860] to-[#9a7a2e] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
              </div>
            </div>
          </div>

          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.3em] text-[#57504a]">
            This is granted to
          </p>

          {/* gold-foil script name with embossed lift */}
          <p
            className="ye-gold-text mt-2 font-great-vibes text-[56px] leading-none"
            style={{ filter: "drop-shadow(0 1px 0 rgba(255,250,230,0.6)) drop-shadow(0 1px 1px rgba(60,40,5,0.18))" }}
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
              <p className="mt-4 text-[14px] font-bold tracking-wide text-[#16130e]">PREETI LOBANA</p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#8a6d1f]">Country Manager &amp; Vice President</p>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8a6d1f]">YouTube India</p>
            </div>

            {/* wax-style printed seal — blends into the paper */}
            <div className="relative flex items-center justify-center">
              <div className="ye-gold-surface absolute h-[68px] w-[68px] rounded-full opacity-70" />
              <img
                src="/certs/ambassador-seal.png"
                alt="Official Seal"
                className="relative h-[60px] w-[60px] rounded-full object-cover opacity-95 mix-blend-multiply"
              />
            </div>

            {/* small QR with white quiet zone */}
            <div className="flex flex-col items-center">
              {sample ? (
                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-sm border border-[#C69B3C]/40 bg-gray-50">
                  <span className="text-center text-[8px] font-black leading-tight text-gray-400">🔒<br />SAMPLE</span>
                </div>
              ) : (
                <div className="rounded-sm border border-[#C69B3C]/40 bg-white p-1">
                  <QRCode value={data?.qrValue || ""} size={48} />
                </div>
              )}
              <p className="mt-1 text-[9px] font-bold tracking-[0.08em] text-[#8a8a85]">{sample ? "Not verifiable" : "Scan to verify"}</p>
            </div>

            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#8a6d1f]">Date</p>
              <p className="mt-1 text-[14px] font-bold text-[#16130e]">{date}</p>
              <p className="mt-2.5 text-[9px] font-black uppercase tracking-[0.28em] text-[#8a6d1f]">Certificate ID</p>
              <p className="mt-1 font-mono text-[12px] font-bold text-[#16130e]">{certId}</p>
            </div>
          </div>

          <p className="mt-3 text-[9px] font-bold tracking-[0.14em] text-[#a08a4f]">
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

        /* ── Ambassador ULTRA-PREMIUM material utilities ─────────────────── */
        .ye-gold-text {
          background: linear-gradient(180deg, #F9EFC7 0%, #E8C860 22%, #C69B3C 46%, #9a7a2e 72%, #6d551f 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .ye-gold-rule {
          background: linear-gradient(90deg, transparent, #C69B3C 30%, #F3E1A0 50%, #C69B3C 70%, transparent);
        }
        .ye-gold-surface {
          background: linear-gradient(135deg, #6d551f 0%, #9a7a2e 18%, #E8C860 38%, #FBF3C9 50%, #C69B3C 62%, #9a7a2e 82%, #5c4518 100%);
        }
        .ye-velvet {
          background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.06), transparent 60%),
            linear-gradient(180deg, #070707, #1d1a14 50%, #070707);
        }
        .ye-paper-grain {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='linear' slope='0.045'/></feComponentTransfer></filter><rect width='140' height='140' filter='url(%23n)'/></svg>");
        }
      `}</style>
    </div>
  );
}
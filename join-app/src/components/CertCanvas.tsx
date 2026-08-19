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
//   ambassador — premium luxury award following Reference #2: white/ivory
//                center, deep black ornamental side panels with flowing gold
//                curves + particles, metallic gold double frames, subtle
//                champagne wave lines, "CERTIFICATE OF EXCELLENCE" in Cinzel,
//                CSS-built gold award seal (black center + gold star),
//                Great Vibes script recipient name, signature + seal + date
//   elite      — ultra-luxury international honor (restrained luxury: ivory
//                parchment + oxblood + champagne gold): thin double gold frame,
//                filigree/guilloche strip, corner medallions, royal seal with YE
//                monogram, ribbon banner cartouche, gold-foil italic name,
//                diamond rule, holographic micro-bands, slow metallic sheen
function SideOrnament({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  return (
    <div className={`absolute inset-y-0 ${left ? "left-0" : "right-0"} w-[100px] pointer-events-none`}>
      {/* deep black panel */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070707] via-[#1a1711] to-[#070707]" />
      {/* subtle gold dot texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.15) 1px, transparent 1.4px)",
          backgroundSize: "15px 15px",
        }}
      />
      {/* gold edge lines */}
      <div className={`absolute inset-y-0 ${left ? "left-0" : "right-0"} w-[3px] bg-gradient-to-b from-[#E8C860]/70 via-[#C69B3C] to-[#E8C860]/70`} />
      <div className={`absolute inset-y-0 ${left ? "right-0" : "left-0"} w-px bg-gradient-to-b from-transparent via-[#C69B3C]/80 to-transparent`} />
      {/* flowing gold curves */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 794" fill="none" preserveAspectRatio="none">
        {left ? (
          <>
            <path d="M100 40 C 34 170, 34 330, 86 420 C 34 510, 34 660, 100 770" stroke="#E8C860" strokeWidth="1.6" opacity="0.5" />
            <path d="M100 120 C 44 230, 44 360, 88 440 C 44 520, 44 620, 100 700" stroke="#C69B3C" strokeWidth="0.8" opacity="0.35" strokeDasharray="3 6" />
            <path d="M100 200 C 50 300, 50 400, 80 470 C 50 540, 50 600, 100 640" stroke="#E8C860" strokeWidth="0.7" opacity="0.22" />
          </>
        ) : (
          <>
            <path d="M0 40 C 66 170, 66 330, 14 420 C 66 510, 66 660, 0 770" stroke="#E8C860" strokeWidth="1.6" opacity="0.5" />
            <path d="M0 120 C 56 230, 56 360, 12 440 C 56 520, 56 620, 0 700" stroke="#C69B3C" strokeWidth="0.8" opacity="0.35" strokeDasharray="3 6" />
            <path d="M0 200 C 50 300, 50 400, 20 470 C 50 540, 50 600, 0 640" stroke="#E8C860" strokeWidth="0.7" opacity="0.22" />
          </>
        )}
      </svg>
      {/* gold particles */}
      <span className={`absolute ${left ? "left-5" : "right-5"} top-[20%] h-2 w-2 rounded-full bg-[#E8C860] opacity-70`} />
      <span className={`absolute ${left ? "left-10" : "right-10"} top-[35%] h-1 w-1 rounded-full bg-[#C69B3C] opacity-60`} />
      <span className={`absolute ${left ? "left-7" : "right-7"} top-[52%] h-1.5 w-1.5 rounded-full bg-[#E8C860] opacity-50`} />
      <span className={`absolute ${left ? "left-11" : "right-11"} top-[66%] h-1 w-1 rounded-full bg-[#C69B3C] opacity-70`} />
      <span className={`absolute ${left ? "left-4" : "right-4"} top-[80%] h-2 w-2 rounded-full bg-[#E8C860] opacity-60`} />
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
          {/* premium luxury following Reference #2 — black-and-gold side
              structures, metallic gold frames, subtle flowing wave lines on the
              white/ivory canvas */}
          <div className="absolute inset-[4px] rounded-xl border border-[#C69B3C]/50 pointer-events-none" />
          <div className="absolute left-[104px] right-[104px] top-[6px] bottom-[6px] rounded-xl border-2 border-[#C69B3C] pointer-events-none" />
          <div className="absolute left-[110px] right-[110px] top-[12px] bottom-[12px] rounded-lg border border-[#C69B3C]/45 pointer-events-none" />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1122 794" fill="none" preserveAspectRatio="none">
            <path d="M-20 240 C 220 190, 380 310, 560 250 C 760 180, 940 290, 1142 230" stroke="#C69B3C" strokeWidth="1.1" opacity="0.06" />
            <path d="M-20 310 C 220 270, 380 370, 560 320 C 760 270, 940 350, 1142 300" stroke="#C69B3C" strokeWidth="0.8" opacity="0.05" />
            <path d="M-20 470 C 220 530, 380 440, 560 510 C 760 560, 940 460, 1142 530" stroke="#E8C860" strokeWidth="0.8" opacity="0.05" />
            <path d="M-20 550 C 220 600, 380 510, 560 580 C 760 630, 940 530, 1142 600" stroke="#C69B3C" strokeWidth="1.1" opacity="0.06" />
          </svg>
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

      {/* ═══════════ Content — Ambassador (Reference #2 luxury) ═══════════ */}
      {isAmbassador ? (
        <div className="relative flex h-full flex-col items-center justify-center px-28 text-center text-[#1a1a1a]">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#8a6d1f]">YouTube Earner</p>

          <h3 className="mt-3 font-cinzel text-[54px] font-bold leading-none tracking-[0.05em] text-[#111111]">
            CERTIFICATE
          </h3>

          <div className="mt-3 flex items-center justify-center gap-4">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#C69B3C]" />
            <span className="font-cinzel text-[21px] font-bold uppercase tracking-[0.32em] bg-clip-text text-transparent bg-gradient-to-b from-[#E8C860] via-[#C69B3C] to-[#9a7a2e]">
              OF EXCELLENCE
            </span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#C69B3C]" />
          </div>

          {/* gold award emblem — metallic gold seal, deep black center, gold star */}
          <div className="mt-5 flex flex-col items-center">
            <div className="relative flex h-[88px] w-[88px] items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#E8C860] via-[#C69B3C] to-[#9a7a2e] shadow-[0_2px_10px_rgba(198,155,60,0.4)]" />
              <div className="absolute inset-[3px] rounded-full bg-[#111111]" />
              <div className="absolute inset-[10px] rounded-full border border-[#C69B3C]/70" />
              <div className="absolute inset-[14px] rounded-full border border-dotted border-[#C69B3C]/60" />
              <span className="text-[26px] text-[#E8C860] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">✦</span>
            </div>
            <div className="mt-1.5 flex gap-1.5">
              <div className="h-5 w-3 rounded-b-sm bg-gradient-to-b from-[#1a1a1a] to-[#000000]" />
              <div className="h-5 w-3 rounded-b-sm bg-gradient-to-b from-[#1a1a1a] to-[#000000]" />
            </div>
          </div>

          <p className="mt-5 text-[13px] font-semibold uppercase tracking-[0.22em] text-[#55504a]">
            This is granted to
          </p>

          <p className="mt-2 font-great-vibes text-[62px] leading-none bg-clip-text text-transparent bg-gradient-to-b from-[#E8C860] via-[#C69B3C] to-[#9a7a2e] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
            {name}
          </p>
          <div className="mt-3 h-px w-72 bg-gradient-to-r from-transparent via-[#C69B3C] to-transparent" />

          <p className="mt-4 max-w-xl text-[14.5px] font-medium leading-relaxed text-[#2e2a26]">
            {bodyText}
          </p>

          <div className="mt-7 flex w-full items-end justify-between">
            <div className="text-left">
              <img src="/certs/ambassador-signature.png" alt="Signature" className="h-12 w-auto" />
              <p className="mt-0.5 text-[14px] font-bold text-[#1a1a1a]">PREETI LOBANA</p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#8a6d1f]">Country Manager &amp; Vice President</p>
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#8a6d1f]">YouTube India</p>
            </div>

            <img src="/certs/ambassador-seal.png" alt="Official Seal" className="h-14 w-14 rounded-full object-cover ring-1 ring-[#C69B3C]/60 shadow-sm" />

            <div className="flex flex-col items-center">
              {sample ? (
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-md border border-gray-300 bg-gray-100">
                  <span className="text-center text-[10px] font-black leading-tight text-gray-400">🔒<br />SAMPLE QR</span>
                </div>
              ) : (
                <div className="bg-white p-1.5 rounded-md border border-gray-200">
                  <QRCode value={data?.qrValue || ""} size={60} />
                </div>
              )}
              <p className="mt-1 text-[9px] font-bold text-[#999]">{sample ? "Not verifiable" : "Scan to verify"}</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8a6d1f]">Date</p>
              <p className="mt-1 text-[14px] font-bold text-[#1a1a1a]">{date}</p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#8a6d1f]">Certificate ID</p>
              <p className="mt-1 font-mono text-[12px] font-bold text-[#1a1a1a]">{certId}</p>
            </div>
          </div>

          <p className="mt-3 text-[9px] font-bold tracking-[0.12em] text-[#8a6d1f]">
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
      `}</style>
    </div>
  );
}
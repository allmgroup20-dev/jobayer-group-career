"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { A4_LANDSCAPE_W, A4_LANDSCAPE_H } from "@/lib/useCertScale";
import CertCanvas, { type CertTier, type CertCanvasData } from "@/components/CertCanvas";

const MIN_S = 0.5;
const MAX_S = 4;

// Fullscreen certificate viewer: click a certificate (sample or real) to open it
// large, then zoom in / out (buttons, mouse wheel, mobile pinch) and pan by
// dragging. Esc or the ✕ / backdrop closes it.
export default function CertLightbox({
  open,
  onClose,
  tier,
  sample = false,
  data,
}: {
  open: boolean;
  onClose: () => void;
  tier: CertTier;
  sample?: boolean;
  data?: CertCanvasData;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0.5);
  const [s, setS] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Track pointers for pan (1 finger / mouse) and pinch zoom (2 fingers).
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ type: "none" | "pan" | "pinch"; startS: number; startDist: number; startPan: { x: number; y: number } }>({
    type: "none",
    startS: 1,
    startDist: 0,
    startPan: { x: 0, y: 0 },
  });

  const measureFit = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const f = Math.min(el.clientWidth / A4_LANDSCAPE_W, el.clientHeight / A4_LANDSCAPE_H);
    setFit(f);
    return f;
  }, []);

  // On open: measure the viewport and reset to "fit" view.
  useEffect(() => {
    if (!open) return;
    const f = measureFit() || 0.5;
    setS(f);
    setPan({ x: 0, y: 0 });
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, measureFit]);

  // Re-fit on resize while open.
  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      measureFit();
      setS((prev) => Math.min(prev, MAX_S));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, measureFit]);

  // Whenever the scale changes, keep the pan inside the visible bounds.
  const clampPan = useCallback((px: number, py: number) => {
    const el = viewportRef.current;
    if (!el) return { x: 0, y: 0 };
    const maxX = Math.max(0, (A4_LANDSCAPE_W * s - el.clientWidth) / 2);
    const maxY = Math.max(0, (A4_LANDSCAPE_H * s - el.clientHeight) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, px)), y: Math.max(-maxY, Math.min(maxY, py)) };
  }, [s]);

  useEffect(() => {
    setPan((p) => clampPan(p.x, p.y));
  }, [s, clampPan]);

  const zoomStep = useCallback((factor: number) => {
    setS((prev) => Math.max(MIN_S, Math.min(MAX_S, prev * factor)));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomStep(1.3);
      if (e.key === "-") zoomStep(1 / 1.3);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      gesture.current = { type: "pan", startS: s, startDist: 0, startPan: pan };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        type: "pinch",
        startS: s,
        startDist: Math.hypot(a.x - b.x, a.y - b.y),
        startPan: pan,
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const prev = pointers.current.get(e.pointerId)!;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const g = gesture.current;
    if (g.type === "pan" && pointers.current.size === 1) {
      setPan((p) => clampPan(p.x + (e.clientX - prev.x), p.y + (e.clientY - prev.y)));
    } else if (g.type === "pinch" && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.startDist > 0 && dist > 0) {
        setS(Math.max(MIN_S, Math.min(MAX_S, g.startS * (dist / g.startDist))));
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current.type = "none";
    if (pointers.current.size === 1) {
      const [a] = [...pointers.current.values()];
      gesture.current = { type: "pan", startS: s, startDist: 0, startPan: pan };
      void a;
    }
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    zoomStep(factor);
  };

  if (!open) return null;

  const percent = Math.round((s / fit) * 100);

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm select-none">
      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white">
          {percent}%
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-lg active:scale-95 transition-all"
        >
          ✕
        </button>
      </div>

      {/* viewport */}
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <div
          className="absolute"
          style={{
            left: `calc(50% - ${(A4_LANDSCAPE_W * s) / 2}px)`,
            top: `calc(50% - ${(A4_LANDSCAPE_H * s) / 2}px)`,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          <div style={{ width: A4_LANDSCAPE_W, height: A4_LANDSCAPE_H, transform: `scale(${s})`, transformOrigin: "top left" }}>
            <CertCanvas tier={tier} sample={sample} data={data} />
          </div>
        </div>
      </div>

      {/* bottom controls */}
      <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-2 px-4">
        <div className="flex items-center gap-1 rounded-2xl bg-white/10 p-1.5 backdrop-blur">
          <button
            onClick={() => zoomStep(1 / 1.3)}
            aria-label="Zoom out"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white text-lg active:scale-95 transition-all"
          >
            −
          </button>
          <button
            onClick={() => zoomStep(1.3)}
            aria-label="Zoom in"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white text-lg active:scale-95 transition-all"
          >
            +
          </button>
          <button
            onClick={() => { const f = measureFit() || 0.5; setS(f); setPan({ x: 0, y: 0 }); }}
            className="h-10 px-4 rounded-xl bg-white/10 text-white text-xs font-black active:scale-95 transition-all"
          >
            ⤢ {percent === 100 ? "" : "ফিট"}
          </button>
          <button
            onClick={() => setS(1)}
            className="h-10 px-4 rounded-xl bg-white/10 text-white text-xs font-black active:scale-95 transition-all"
          >
            ১:১
          </button>
        </div>
      </div>
    </div>
  );
}
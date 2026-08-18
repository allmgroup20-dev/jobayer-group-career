"use client";

import { useCallback, useLayoutEffect, useState } from "react";

// A4 landscape logical canvas (297mm x 210mm at 96dpi ≈ 1122 x 794 px).
// Both the sample preview and the real certificate are designed once at this
// fixed size, then scaled to fit the screen; print outputs at true A4 landscape.
export const A4_LANDSCAPE_W = 1122;
export const A4_LANDSCAPE_H = 794;

// Measures the wrapping container and returns a scale so a fixed-size
// certificate canvas (A4_LANDSCAPE_W x A4_LANDSCAPE_H) fills the available
// width proportionally. Never upscales beyond 1.
//
// Uses a callback ref + layout effect so it re-measures whenever the container
// actually mounts (e.g. a hidden preview opened later, or the certificate shown
// only after data loads) — otherwise scale would stay 1 and the fixed 1122px
// canvas would overflow hugely on every smaller screen.
export function useCertScale() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  const ref = useCallback((node: HTMLDivElement | null) => {
    setEl(node);
  }, []);

  useLayoutEffect(() => {
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(Math.min(w / A4_LANDSCAPE_W, 1));
    };
    update();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ro) ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [el]);

  return { ref, scale };
}
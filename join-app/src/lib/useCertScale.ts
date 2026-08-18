"use client";

import { useEffect, useRef, useState } from "react";

// A4 landscape logical canvas (297mm x 210mm at 96dpi ≈ 1122 x 794 px).
// Both the sample preview and the real certificate are designed once at this
// fixed size, then scaled to fit the screen; print outputs at true A4 landscape.
export const A4_LANDSCAPE_W = 1122;
export const A4_LANDSCAPE_H = 794;

// Measures the wrapping container and returns a scale so a fixed-size
// certificate canvas (A4_LANDSCAPE_W x A4_LANDSCAPE_H) fills the available
// width proportionally. Never upscales beyond 1.
export function useCertScale() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
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
  }, []);

  return { ref, scale };
}

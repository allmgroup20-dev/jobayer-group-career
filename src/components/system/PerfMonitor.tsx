"use client";

import { useEffect } from "react";

function sendMetric(name: string, value: number, rating: string) {
  const payload = {
    logType: "perf",
    source: "web-vitals",
    message: `${name}: ${Math.round(value)}ms (${rating})`,
    details: JSON.stringify({ metric: name, value, rating }),
    route: window.location.pathname,
    method: "client",
  };
  try {
    navigator.sendBeacon("/api/system/logs", JSON.stringify(payload));
  } catch {
    fetch("/api/system/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
}

export function PerfMonitor() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // LCP
    try {
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const last = entries[entries.length - 1];
          sendMetric("LCP", last.startTime, last.startTime < 2500 ? "good" : last.startTime < 4000 ? "needs-improvement" : "poor");
        }
      });
      lcpObs.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}

    // CLS
    try {
      let clsValue = 0;
      const clsObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) clsValue += (entry as any).value;
        }
      });
      clsObs.observe({ type: "layout-shift", buffered: true });
      window.addEventListener("beforeunload", () => {
        const rating = clsValue < 0.1 ? "good" : clsValue < 0.25 ? "needs-improvement" : "poor";
        sendMetric("CLS", Math.round(clsValue * 1000), rating);
      }, { once: true });
    } catch {}

    // FID/INP
    try {
      const fidObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          sendMetric("FID", fidEntry.processingStart - fidEntry.startTime, fidEntry.duration < 100 ? "good" : fidEntry.duration < 300 ? "needs-improvement" : "poor");
        }
      });
      fidObs.observe({ type: "first-input", buffered: true });
    } catch {}

    // TTFB
    try {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (nav) {
        const ttfb = nav.responseStart - nav.requestStart;
        sendMetric("TTFB", ttfb, ttfb < 800 ? "good" : ttfb < 1800 ? "needs-improvement" : "poor");
      }
    } catch {}
  }, []);

  return null;
}

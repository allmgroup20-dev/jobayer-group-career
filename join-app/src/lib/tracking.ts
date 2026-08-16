"use client";

import { useEffect, useRef, useCallback } from "react";

let sessionId = "";
let pageEnterTime = 0;
let currentPath = "";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getWorkerId(): string {
  try {
    return window.localStorage.getItem("worker_id") || "";
  } catch {
    return "";
  }
}

function getDeviceInfo() {
  if (typeof window === "undefined") {
    return { raw: "{}", deviceType: "unknown", browser: "unknown", os: "unknown" };
  }
  const ua = navigator.userAgent;
  const deviceType = /Mobi|Android/i.test(ua) ? "mobile" : /Tablet|iPad/i.test(ua) ? "tablet" : "desktop";
  let browser = "unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "chrome";
  else if (ua.includes("Firefox")) browser = "firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "safari";
  else if (ua.includes("Edg")) browser = "edge";
  let os = "unknown";
  if (ua.includes("Windows")) os = "windows";
  else if (ua.includes("Mac OS")) os = "macos";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "linux";
  else if (ua.includes("Android")) os = "android";
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "ios";
  return {
    raw: JSON.stringify({
      w: window.innerWidth,
      h: window.innerHeight,
      dt: deviceType,
      la: navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
    deviceType,
    browser,
    os,
    screenResolution: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

const eventQueue: Record<string, unknown>[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;

async function flushEvents() {
  if (eventQueue.length === 0) return;
  const batch = eventQueue.splice(0);
  if (!getWorkerId()) return;
  try {
    await fetch("/api/track/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    });
  } catch {}
}

function sendEvent(data: Record<string, unknown>) {
  const workerId = getWorkerId();
  if (!workerId) return;
  const timeOnPage = pageEnterTime > 0 ? Math.round((Date.now() - pageEnterTime) / 1000) : 0;
  eventQueue.push({
    ...data,
    timeSpentSeconds: timeOnPage,
    deviceInfo: getDeviceInfo().raw,
    sessionId,
  });
  if (batchTimer) clearTimeout(batchTimer);
  batchTimer = setTimeout(flushEvents, 2000);
  if (eventQueue.length >= 10) flushEvents();
}

export function trackEvent(eventType: string, extra?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  sendEvent({ eventType, ...extra });
}

export function useTracker() {
  const pathRef = useRef(currentPath);
  const endedRef = useRef(false);

  const trackPageView = useCallback(() => {
    if (!getWorkerId()) return;
    const path = window.location.pathname + window.location.search;
    if (path === pathRef.current) return;
    pathRef.current = path;
    currentPath = path;
    pageEnterTime = Date.now();

    let pageCategory = "";
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0) {
      pageCategory = segments[0];
    }

    sendEvent({
      eventType: "page_view",
      pageUrl: path,
      pageCategory,
      timeSpentSeconds: 0,
    });
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("tsid");
    if (stored) {
      sessionId = stored;
    } else {
      sessionId = generateId();
      sessionStorage.setItem("tsid", sessionId);
    }
    pageEnterTime = Date.now();
    currentPath = window.location.pathname;

    const start = () => {
      if (getWorkerId()) {
        window.clearInterval(timer);
        trackPageView();
      }
    };

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts++;
      if (getWorkerId() || attempts > 20) {
        window.clearInterval(timer);
        start();
      }
    }, 1000);
    start();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        pageEnterTime = Date.now();
        trackPageView();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleBeforeUnload = () => {
      if (!endedRef.current) {
        endedRef.current = true;
        flushEvents();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (!endedRef.current) {
        endedRef.current = true;
        flushEvents();
      }
    };
  }, [trackPageView]);

  useEffect(() => {
    const origPushState = history.pushState.bind(history);
    const origReplaceState = history.replaceState.bind(history);

    history.pushState = function (data: unknown, unused: string, url?: string | URL | null) {
      origPushState(data, unused, url);
      trackPageView();
    };
    history.replaceState = function (data: unknown, unused: string, url?: string | URL | null) {
      origReplaceState(data, unused, url);
      trackPageView();
    };

    window.addEventListener("popstate", trackPageView);

    return () => {
      window.removeEventListener("popstate", trackPageView);
    };
  }, [trackPageView]);
}
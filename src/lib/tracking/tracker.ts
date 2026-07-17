"use client";

import { useEffect, useRef, useCallback } from "react";

let sessionId = "";
let pageEnterTime = 0;
let currentPath = "";
let deviceRegistered = false;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getDeviceInfo() {
  if (typeof window === "undefined") return { raw: "{}", deviceType: "", browser: "", os: "" };
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

function getUTMParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmCampaign = params.get("utm_campaign");
  const utmMedium = params.get("utm_medium");
  return { utmSource, utmCampaign, utmMedium };
}

function getWorkerId(): string {
  try {
    return localStorage.getItem("worker_id") || "";
  } catch {
    return "";
  }
}

function isCompanyLoggedIn(): boolean {
  try {
    return document.cookie.includes("company_user=");
  } catch {
    return false;
  }
}

function getIpHint(): string {
  return "";
}

async function registerDevice() {
  if (deviceRegistered) return;
  if (isCompanyLoggedIn()) return;
  const workerId = getWorkerId();
  if (!workerId) return;
  const di = getDeviceInfo();
  try {
    await fetch("/api/track/device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerId,
        deviceType: di.deviceType,
        browser: di.browser,
        os: di.os,
        userAgent: navigator.userAgent,
        screenResolution: di.screenResolution,
        language: di.language,
        timezone: di.timezone,
      }),
      keepalive: true,
    });
    deviceRegistered = true;
  } catch {}
}

async function trackSessionStart() {
  if (isCompanyLoggedIn()) return;
  const workerId = getWorkerId();
  if (!workerId || !sessionId) return;
  const di = getDeviceInfo();
  const utm = getUTMParams();
  try {
    await fetch("/api/track/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "start",
        sessionId,
        workerId,
        deviceType: di.deviceType,
        browser: di.browser,
        os: di.os,
        userAgent: navigator.userAgent,
        screenResolution: di.screenResolution,
        referrer: document.referrer || "",
        language: di.language,
        timezone: di.timezone,
        ...utm,
      }),
      keepalive: true,
    });
  } catch {}
}

async function trackSessionEnd() {
  if (isCompanyLoggedIn()) return;
  const workerId = getWorkerId();
  if (!workerId || !sessionId) return;
  try {
    await fetch("/api/track/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end", sessionId, workerId }),
      keepalive: true,
    });
  } catch {}
}

async function sendEvent(data: Record<string, unknown>) {
  if (isCompanyLoggedIn()) return;
  try {
    const payload: Record<string, unknown> = {
      ...data,
      deviceInfo: getDeviceInfo().raw,
      sessionId,
      workerId: getWorkerId(),
    };
    fetch("/api/track/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function trackEvent(
  eventType: string,
  extra?: Record<string, unknown>
) {
  if (isCompanyLoggedIn()) return;
  const timeOnPage = pageEnterTime > 0 ? Math.round((Date.now() - pageEnterTime) / 1000) : 0;
  sendEvent({ eventType, timeSpentSeconds: timeOnPage, ...extra });
}

export function useTracker() {
  const pathRef = useRef(currentPath);
  const endedRef = useRef(false);

  const trackPageView = useCallback(() => {
    if (isCompanyLoggedIn()) return;
    const path = window.location.pathname + window.location.search;
    if (path === pathRef.current) return;
    pathRef.current = path;
    currentPath = path;
    pageEnterTime = Date.now();

    let pageCategory = "";
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0) {
      const first = segments[0];
      pageCategory = ["courses", "products", "product-list"].includes(first)
        ? first
        : ["dashboard", "company"].includes(first)
        ? "app"
        : first;
    }

    sendEvent({
      eventType: "page_view",
      pageUrl: path,
      pageCategory,
      timeSpentSeconds: 0,
    });
  }, []);

  useEffect(() => {
    if (isCompanyLoggedIn()) return;
    const stored = sessionStorage.getItem("tsid");
    if (stored) {
      sessionId = stored;
    } else {
      sessionId = generateId();
      sessionStorage.setItem("tsid", sessionId);
    }
    pageEnterTime = Date.now();
    currentPath = window.location.pathname;

    registerDevice();
    trackSessionStart();
    trackPageView();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        pageEnterTime = Date.now();
        trackPageView();
      } else if (document.visibilityState === "hidden") {
        trackSessionEnd();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleBeforeUnload = () => {
      if (!endedRef.current) {
        endedRef.current = true;
        trackSessionEnd();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (!endedRef.current) {
        endedRef.current = true;
        trackSessionEnd();
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

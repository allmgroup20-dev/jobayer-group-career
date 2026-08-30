// Join-site dynamic content hook — reads from shared D1 via /api/site-content (same pattern as root useSiteContent)
"use client";
import { useEffect, useState } from "react";

type SectionState = { content: unknown; enabled: boolean } | null;
let fetchPromise: Promise<Record<string, SectionState>> | null = null;
const cache: Record<string, SectionState> = {};

async function loadAll(): Promise<Record<string, SectionState>> {
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch("/api/site-content")
    .then((r) => r.json() as Promise<{ sections?: Record<string, { content: unknown; enabled: boolean }> }>)
    .then((d) => {
      const secs = d.sections || {};
      for (const [k, v] of Object.entries(secs)) cache[k] = v;
      return cache;
    })
    .catch(() => cache);
  return fetchPromise;
}

function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (Array.isArray(base) && Array.isArray(override)) return override as unknown as T;
  if (typeof base === "object" && base !== null && typeof override === "object" && override !== null && !Array.isArray(override)) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
      const bv = (base as Record<string, unknown>)[k];
      out[k] = typeof v === "object" && v !== null && !Array.isArray(v) && typeof bv === "object" && bv !== null && !Array.isArray(bv)
        ? deepMerge(bv as unknown, v) : v;
    }
    return out as T;
  }
  return override as T;
}

export function useJoinContent<T>(section: string, defaults: T): { content: T; enabled: boolean } {
  const [state, setState] = useState<SectionState>(() => cache[section] ?? null);
  useEffect(() => {
    let cancelled = false;
    if (cache[section]) { setState(cache[section]); return; }
    loadAll().then(() => { if (!cancelled) setState(cache[section] ?? null); });
    return () => { cancelled = true; };
  }, [section]);
  const content = state?.content ? deepMerge(defaults, state.content) : defaults;
  const enabled = state ? state.enabled !== false : true;
  return { content, enabled };
}

// ── Defaults mirrored from root SITE_CONTENT_DEFAULTS (fallback if D1 empty) ──
export const JOIN_HOME_DEFAULTS = {
  heroBadgeBn: "এখনই জয়েন করুন", heroBadgeEn: "Join Now",
  heroTitleBn: "ইউটিউব আর্নার — আসল নিয়ম শিখুন, বাস্তব সার্টিফিকেট পান",
  heroTitleEn: "YouTube Earner — learn real rules, earn real certificates",
  heroSubtitleBn: "৯৭০+ রিসোর্স · ৩-টিয়ার সার্টিফিকেট · প্রমাণিত দক্ষতা",
  heroSubtitleEn: "970+ resources · 3-tier certificates · proven skills",
  heroDescBn: "ইউটিউব-এ বড় হওয়ার সঠিক পথ — আমরা গাইড করব ধাপে ধাপে।",
  heroDescEn: "The right path to grow on YouTube — we guide you step by step.",
  benefits: [
    { emoji: "🎁", bn: "বোনাস রিসোর্স", en: "Instant bonus resources" },
    { emoji: "💰", bn: "সার্টিফিকেট ও স্বীকৃতি", en: "Certificates & recognition" },
    { emoji: "📚", bn: "৯৭০+ প্রিমিয়াম রিসোর্স", en: "970+ premium resources" },
    { emoji: "🤝", bn: "বন্ধুর সাথে শিখুন", en: "Learn together & earn certificates together" },
  ],
  steps: [
    { n: "১", bn: "Google দিয়ে লগইন করুন", en: "Log in with Google" },
    { n: "২", bn: "প্রোফাইল সম্পূর্ণ করুন", en: "Complete your profile" },
    { n: "৩", bn: "শিখুন, রিসোর্স আনলক করুন ও সার্টিফিকেট অর্জন করুন", en: "Learn, unlock resources & earn certificates" },
  ],
};

export const JOIN_CERT_DEFAULTS = {
  costs: {
    printUsd: 0.6, printLabelBn: "ভালো কাগজে প্রিন্ট", printLabelEn: "Print on quality paper",
    packagingUsd: 0.4, packagingLabelBn: "প্যাকেজিং", packagingLabelEn: "Packaging",
    shippingUsd: 0.5, shippingEliteUsd: 1.0, shippingLabelBn: "ইন্ডিয়া থেকে বাংলাদেশ", shippingLabelEn: "Ship from India to Bangladesh",
    shippingEliteLabelBn: "সিঙ্গাপুর থেকে বাংলাদেশ", shippingEliteLabelEn: "Ship from Singapore to Bangladesh",
    postFeeUsd: 0.5, postLabelBn: "পোস্ট অফিস ফি", postLabelEn: "Post office fee",
    homeFeeUsd: 1.0, homeLabelBn: "হোম ডেলিভারি ফি", homeLabelEn: "Home delivery fee",
  },
  bundleHandlingUsd: 0.0,
  bundleNoteBn: "২/৩টি একসাথে — ডেলিভারি ফি একবার + ছাড়",
  bundleNoteEn: "2/3 bundle — single delivery fee + discount",
  usdRate: 111, marketRate: 124,
  tierDescriptions: {
    foundation: { typeBn: "ফাউন্ডেশন — এন্ট্রি-লেভেল সনদ।", typeEn: "Foundation — entry-level certificate.", whereBn: "ডিজিটাল মার্কেটিং এসিস্ট্যান্ট", whereEn: "Digital marketing assistant", careerBn: "এন্ট্রি-লেভেল ভূমিকায় আবেদন", careerEn: "Apply for entry-level roles", trustBn: "Authorized Signatory + QR", trustEn: "Authorized Signatory + QR" },
    ambassador: { typeBn: "অ্যাম্বাসেডর — প্রিমিয়াম স্বীকৃতি।", typeEn: "Ambassador — premium.", whereBn: "কমিউনিটি ম্যানেজার", whereEn: "Community manager", careerBn: "মিড-লেভেল ভূমিকায়", careerEn: "Mid-level roles", trustBn: "PREETI LOBANA সই + QR", trustEn: "PREETI LOBANA + QR" },
    elite: { typeBn: "Elite — সর্বোচ্চ সম্মান।", typeEn: "Elite — highest honor.", whereBn: "টিম লিড, প্রজেক্ট ম্যানেজার", whereEn: "Team lead, project manager", careerBn: "লিডারশিপ ভূমিকায়", careerEn: "Leadership roles", trustBn: "৩ জন এক্সিকিউটিভ সই + QR", trustEn: "3 executives + QR" },
  },
};

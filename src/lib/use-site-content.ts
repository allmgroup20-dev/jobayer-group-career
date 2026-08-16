"use client";

import { useEffect, useState } from "react";

interface SectionState {
  content: unknown;
  enabled: boolean;
}

let fetchPromise: Promise<Record<string, SectionState>> | null = null;

function loadAll(): Promise<Record<string, SectionState>> {
  if (!fetchPromise) {
    fetchPromise = fetch("/api/site-content")
      .then((r) => r.json().catch(() => null))
      .then((d) => (d && (d as { sections?: Record<string, SectionState> }).sections ? (d as { sections: Record<string, SectionState> }).sections : {}))
      .finally(() => {
        fetchPromise = null;
      });
  }
  return fetchPromise;
}

function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (Array.isArray(override) || typeof override !== "object") return override as T;
  if (typeof base !== "object" || base === null) return override as T;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    out[key] = deepMerge(out[key], (override as Record<string, unknown>)[key]);
  }
  return out as T;
}

/**
 * Fetch admin-editable site content for one section and deep-merge it over the
 * shipped defaults. `enabled` is false when the admin has turned the section
 * (or its feature flag) off — components should render nothing in that case.
 */
export function useSiteContent<T>(section: string, defaults: T, opts?: { enabledByDefault?: boolean }): {
  content: T;
  enabled: boolean;
} {
  const [state, setState] = useState<SectionState>({
    content: null,
    enabled: opts?.enabledByDefault ?? true,
  });

  useEffect(() => {
    let cancelled = false;
    loadAll().then((sections) => {
      if (cancelled) return;
      const sec = sections[section];
      if (sec) {
        setState({ content: sec.content ?? null, enabled: sec.enabled });
      } else {
        setState({ content: null, enabled: opts?.enabledByDefault ?? true });
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const content = state.content ? deepMerge(defaults, state.content) : defaults;
  return { content, enabled: state.enabled };
}
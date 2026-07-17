import { useState, useEffect, useRef } from "react";

const isBrowser = typeof window !== "undefined" && typeof indexedDB !== "undefined";

async function getCached<T>(key: string, ttlMs: number): Promise<T | null> {
  if (!isBrowser) return null;
  const { getCached: gc } = await import("./client-cache");
  return gc<T>(key, ttlMs);
}

async function setCached(key: string, data: unknown): Promise<void> {
  if (!isBrowser) return;
  const { setCached: sc } = await import("./client-cache");
  return sc(key, data);
}

export async function deleteCached(key: string): Promise<void> {
  if (!isBrowser) return;
  const { deleteCached: dc } = await import("./client-cache");
  return dc(key);
}

interface SWROptions<T> {
  ttlMs?: number;
  onData?: (data: T) => void;
  cacheKey?: string;
}

interface SWRResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSWRFetch<T = unknown>(
  url: string | null,
  options: SWROptions<T> = {}
): SWRResult<T> {
  const { ttlMs = 120_000, cacheKey } = options;
  const key = cacheKey || url || "";
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inflightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchData = async (isBackground = false) => {
    if (!url || inflightRef.current) return;
    inflightRef.current = true;
    if (!isBackground) setLoading(true);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as T;
      if (!mountedRef.current) return;
      setData(json);
      setError(null);
      await setCached(key, json);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
      inflightRef.current = false;
    }
  };

  useEffect(() => {
    if (!url) { setLoading(false); return; }

    getCached<T>(key, ttlMs).then((cached) => {
      if (cached !== null && mountedRef.current) {
        setData(cached);
        setLoading(false);
      }
      fetchData(cached !== null);
    }).catch(() => {
      fetchData(false);
    });
  }, [url, ttlMs]);

  const refresh = () => fetchData(false);

  return { data, loading, error, refresh };
}

export async function invalidateFetch(key: string): Promise<void> {
  await deleteCached(key);
}

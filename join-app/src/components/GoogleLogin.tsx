"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onSuccess?: (workerId: string, name: string, isNew: boolean) => void;
  onError?: (msg: string) => void;
  loading?: boolean;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

export function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function GoogleLogin({ onSuccess, onError, loading }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<{ googleClientId: string }>({ googleClientId: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/config")
      .then((r) => r.json() as Promise<{ googleClientId?: string }>)
      .then((cfg) => {
        if (cancelled) return;
        const gid = cfg.googleClientId || "";
        setConfig({ googleClientId: gid });
        if (gid) {
          loadScript("https://accounts.google.com/gsi/client")
            .then(() => setReady(true))
            .catch(() => {});
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !config.googleClientId || !btnRef.current) return;
    const g = (window as any).google?.accounts?.id;
    if (!g) return;
    g.initialize({
      client_id: config.googleClientId,
      callback: handleCredential,
      auto_select: false,
      itp_support: true,
    });
    g.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      width: "100%",
      text: "continue_with",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, config.googleClientId]);

  const handleCredential = async (resp: { credential?: string }) => {
    if (!resp?.credential) return;
    setBusy(true);
    try {
      const referralCode = (typeof window !== "undefined" && window.localStorage.getItem("referral_code")) || undefined;
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: resp.credential, referralCode }),
      });
      const data = await res.json() as { error?: string; workerId?: string; name?: string; isNew?: boolean };
      if (!res.ok) throw new Error(data.error || "Google login failed");
      if (data.workerId) {
        window.localStorage.setItem("worker_id", data.workerId);
        window.localStorage.setItem("worker_name", data.name || "");
        onSuccess?.(data.workerId, data.name || "", data.isNew === true);
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Google login failed");
    } finally {
      setBusy(false);
    }
  };

  if (busy || loading) {
    return (
      <button type="button" disabled className="btn-excite w-full opacity-80 cursor-wait">
        <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        Loading...
      </button>
    );
  }

  return (
    <div>
      {config.googleClientId ? (
        <div ref={btnRef} className="w-full [&>div]:w-full" />
      ) : (
        <button
          type="button"
          className="btn-white w-full"
          onClick={() => onError?.("Google Login: Not Configured Yet")}
        >
          <GoogleG className="w-5 h-5" />
          Continue with Google
        </button>
      )}
    </div>
  );
}

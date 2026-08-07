"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  lang: "bn" | "en";
  redirectTo?: string;
  onError?: (msg: string) => void;
  onSuccess?: (workerId: string, name: string) => void;
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

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function FacebookF({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#1877F2" d="M24 0C10.74 0 0 10.74 0 24c0 12.97 9.44 23.72 21.79 25.78V30.94h-6.3V24h6.3v-5.46c0-6.21 3.7-9.64 9.36-9.64 2.71 0 5.55.48 5.55.48v6.1h-3.13c-3.08 0-4.04 1.91-4.04 3.87V24h6.88l-1.1 6.94h-5.78v18.84C38.56 47.72 48 36.97 48 24 48 10.74 37.26 0 24 0z" />
    </svg>
  );
}

export default function SocialLoginButtons({ lang, redirectTo = "/dashboard", onError, onSuccess }: Props) {
  const [config, setConfig] = useState<{ googleClientId: string; facebookAppId: string }>({ googleClientId: "", facebookAppId: "" });
  const [googleReady, setGoogleReady] = useState(false);
  const [fbReady, setFbReady] = useState(false);
  const [busy, setBusy] = useState<"google" | "facebook" | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/oauth-config")
      .then((r) => r.json() as Promise<{ googleClientId?: string; facebookAppId?: string }>)
      .then((cfg) => {
        if (cancelled) return;
        const gid = cfg.googleClientId || "";
        const faid = cfg.facebookAppId || "";
        setConfig({ googleClientId: gid, facebookAppId: faid });
        if (gid) {
          loadScript("https://accounts.google.com/gsi/client")
            .then(() => setGoogleReady(true))
            .catch(() => {});
        }
        if (faid) {
          (window as any).fbAsyncInit = () => {
            (window as any).FB?.init({ appId: faid, version: "v19.0", xfbml: true, cookie: true });
            setFbReady(true);
          };
          loadScript("https://connect.facebook.net/en_US/sdk.js").catch(() => {});
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!googleReady || !config.googleClientId || !googleBtnRef.current) return;
    const g = (window as any).google?.accounts?.id;
    if (!g) return;
    g.initialize({
      client_id: config.googleClientId,
      callback: handleGoogleCredential,
      auto_select: false,
      itp_support: true,
    });
    g.renderButton(googleBtnRef.current, {
      theme: "outline", size: "large", shape: "pill", width: "100%", text: "continue_with",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleReady, config.googleClientId]);

  const finishAuth = (workerId: string, name: string) => {
    localStorage.setItem("worker_id", workerId);
    localStorage.setItem("worker_name", name || "");
    onSuccess?.(workerId, name || "");
    window.location.href = redirectTo;
  };

  const handleGoogleCredential = async (resp: { credential?: string }) => {
    if (!resp?.credential) return;
    setBusy("google");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: resp.credential }),
      });
      const data = await res.json() as { error?: string; workerId?: string; name?: string };
      if (!res.ok) throw new Error(data.error || "Google login failed");
      if (data.workerId) finishAuth(data.workerId, data.name || "");
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Google login failed");
    } finally {
      setBusy(null);
    }
  };

  const handleFbLogin = () => {
    const FB = (window as any).FB;
    if (!FB) return;
    FB.login((resp: { authResponse?: { accessToken?: string } }) => {
      if (!resp.authResponse?.accessToken) {
        onError?.(lang === "bn" ? "ফেসবুক লগইন বাতিল হয়েছে" : "Facebook login cancelled");
        return;
      }
      setBusy("facebook");
      fetch("/api/auth/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: resp.authResponse.accessToken }),
      })
        .then((r) => r.json() as Promise<{ error?: string; workerId?: string; name?: string }>)
        .then((data) => {
          if (!data.workerId) throw new Error(data.error || "Facebook login failed");
          finishAuth(data.workerId, data.name || "");
        })
        .catch((err: unknown) => onError?.(err instanceof Error ? err.message : "Facebook login failed"))
        .finally(() => setBusy(null));
    }, { scope: "public_profile,email" });
  };

  const notConfiguredNote = lang === "bn" ? "· কনফিগার করা হয়নি" : "· not configured";

  return (
    <div className="space-y-3">
      {config.googleClientId ? (
        <div ref={googleBtnRef} className="w-full [&>div]:w-full" />
      ) : (
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border/60 text-sm font-bold text-text-secondary/60 bg-gray-50 cursor-not-allowed"
        >
          <GoogleG className="w-5 h-5" />
          {lang === "bn" ? "গুগল দিয়ে লগইন" : "Continue with Google"}
          <span className="text-[10px] font-semibold text-amber-600">{notConfiguredNote}</span>
        </button>
      )}

      {config.facebookAppId ? (
        <button
          type="button"
          onClick={handleFbLogin}
          disabled={!fbReady || busy !== null}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border/80 text-sm font-bold text-text-secondary hover:bg-primary/5 hover:border-primary/30 transition-all disabled:opacity-50"
        >
          <FacebookF className="w-5 h-5" />
          {lang === "bn" ? "ফেসবুক দিয়ে লগইন" : "Continue with Facebook"}
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border/60 text-sm font-bold text-text-secondary/60 bg-gray-50 cursor-not-allowed"
        >
          <FacebookF className="w-5 h-5" />
          {lang === "bn" ? "ফেসবুক দিয়ে লগইন" : "Continue with Facebook"}
          <span className="text-[10px] font-semibold text-amber-600">{notConfiguredNote}</span>
        </button>
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Catch-all landing page for unique per-share links (e.g. /a1b2c3?ref=ABC123).
// Captures the ref into localStorage (same as the home page) so referral
// attribution still works, then sends the user to the real home page.
export default function ShareLandingPage() {
  const params = useSearchParams();

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) window.localStorage.setItem("referral_code", ref);
    window.location.replace("/");
  }, [params]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-9 h-9 border-4 border-pink/20 border-t-pink rounded-full animate-spin" />
    </main>
  );
}
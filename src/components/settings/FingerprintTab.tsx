"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function FingerprintTab() {
  const { lang } = useLanguageStore();
  const [username, setUsername] = useState("");
  const [bioRegistered, setBioRegistered] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json() as Promise<{ username?: string }>)
      .then((data) => {
        if (data.username) {
          setUsername(data.username);
          fetch("/api/auth/biometric/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "begin", workerId: data.username, userType: "company" }),
          }).then((r) => { if (r.ok) setBioRegistered(true); }).catch(() => {});
        }
      }).catch(() => {});
  }, []);

  function base64url(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  const handleSetupFingerprint = async () => {
    if (!window.PublicKeyCredential) {
      return alert(lang === "bn" ? "এই ব্রাউজার ফিঙ্গারপ্রিন্ট সাপোর্ট করে না" : "Browser does not support fingerprint");
    }
    setBioLoading(true);
    try {
      const chalRes = await fetch("/api/auth/biometric/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "challenge", workerId: username, userType: "company" }),
      });
      const chalData = await chalRes.json() as { challengeId?: string; challenge?: string };
      if (!chalData.challenge || !chalData.challengeId) {
        alert(lang === "bn" ? "চ্যালেঞ্জ প্রস্তুত ব্যর্থ" : "Challenge preparation failed"); setBioLoading(false); return;
      }
      const challenge = Uint8Array.from(atob(chalData.challenge.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      const userId = new TextEncoder().encode(username);
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge, rp: { name: "Jobayer Group", id: window.location.hostname },
          user: { id: userId, name: username, displayName: username },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000, attestation: "none",
        },
      }) as PublicKeyCredential;
      if (!credential) { alert(lang === "bn" ? "ফিঙ্গারপ্রিন্ট সেটআপ বাতিল" : "Setup cancelled"); setBioLoading(false); return; }
      const attResp = credential.response as AuthenticatorAttestationResponse;
      const regRes = await fetch("/api/auth/biometric/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register", challengeId: chalData.challengeId, workerId: username, userType: "company",
          credentialId: base64url(credential.rawId),
          clientDataJSON: base64url(attResp.clientDataJSON),
          attestationObject: base64url(attResp.attestationObject),
        }),
      });
      if (regRes.ok) { setBioRegistered(true); alert(lang === "bn" ? "✓ ফিঙ্গারপ্রিন্ট নিবন্ধিত" : "✓ Fingerprint registered"); }
      else { alert(lang === "bn" ? "নিবন্ধন ব্যর্থ" : "Registration failed"); }
    } catch (e) { console.error(e); alert(lang === "bn" ? "ফিঙ্গারপ্রিন্ট সেটআপ ব্যর্থ" : "Setup failed"); }
    setBioLoading(false);
  };

  const handleRemoveFingerprint = async () => {
    if (!confirm(lang === "bn" ? "ফিঙ্গারপ্রিন্ট সরান?" : "Remove fingerprint?")) return;
    setShowWarning(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🔐</span>
        <div>
          <h2 className="text-lg font-bold text-primary">{lang === "bn" ? "বায়োমেট্রিক সেটিংস" : "Biometric Settings"}</h2>
          <p className="text-sm text-text-secondary">{lang === "bn" ? "ফিঙ্গারপ্রিন্ট দিয়ে লগইন করুন" : "Log in using your fingerprint"}</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-primary">{lang === "bn" ? "ফিঙ্গারপ্রিন্ট লগইন" : "Fingerprint Login"}</p>
            <p className="text-xs text-text-secondary mt-1">{lang === "bn" ? "পাসওয়ার্ড ছাড়াই কোম্পানি প্যানেলে প্রবেশ করুন।" : "Access the company panel without a password."}</p>
          </div>
          {username && <span className="text-xs text-text-secondary bg-gray-100 px-3 py-1 rounded-full">{username}</span>}
        </div>
        {bioRegistered ? (
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700">{lang === "bn" ? "ফিঙ্গারপ্রিন্ট রেজিস্টার্ড" : "Fingerprint Registered"}</span>
            <Button variant="danger" size="sm" onClick={handleRemoveFingerprint} className="ml-auto">
              {lang === "bn" ? "সরান" : "Remove"}
            </Button>
          </div>
        ) : (
          <Button onClick={handleSetupFingerprint} disabled={bioLoading}>
            {bioLoading ? "..." : (lang === "bn" ? "📱 ফিঙ্গারপ্রিন্ট সেটআপ" : "📱 Setup Fingerprint")}
          </Button>
        )}
      </Card>

      {showWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          {lang === "bn"
            ? "⚠️ ফিঙ্গারপ্রিন্ট রিমুভ করা হচ্ছে। শুধুমাত্র যদি আপনি অন্য ডিভাইসে মাইগ্রেট করছেন। আপনার পাসওয়ার্ড মনে না থাকলে আপনি লক আউট হয়ে যেতে পারেন!"
            : "⚠️ Removing fingerprint. Only if you are migrating to a different device. If you don't remember your password, you will be locked out!"}
          <div className="flex gap-2 mt-3">
            <Button variant="danger" size="sm" onClick={async () => {
              try { await fetch("/api/auth/biometric/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "remove", workerId: username, userType: "company" }) }); } catch {}
              setBioRegistered(false); setShowWarning(false);
            }}>{lang === "bn" ? "হ্যাঁ, সরান" : "Yes, Remove"}</Button>
            <Button variant="outline" size="sm" onClick={() => setShowWarning(false)}>{lang === "bn" ? "বাতিল" : "Cancel"}</Button>
          </div>
        </div>
      )}

      {!window.PublicKeyCredential && (
        <div className="p-4 bg-gray-50 rounded-xl text-sm text-text-secondary">
          {lang === "bn" ? "ℹ️ আপনার ব্রাউজার WebAuthn সাপোর্ট করে না। Chrome, Edge, বা Safari ব্যবহার করুন।" : "ℹ️ Your browser does not support WebAuthn. Use Chrome, Edge, or Safari."}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CompanyFingerprintPage() {
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
          }).then((r) => {
            if (r.ok) setBioRegistered(true);
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const handleSetupFingerprint = async () => {
    if (!window.PublicKeyCredential) {
      return alert(lang === "bn" ? "এই ব্রাউজার ফিঙ্গারপ্রিন্ট সাপোর্ট করে না" : "Browser does not support fingerprint");
    }
    setBioLoading(true);
    try {
      const rawId = crypto.getRandomValues(new Uint8Array(32));
      const credentialId = btoa(String.fromCharCode(...rawId));
      const keyPair = await crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["sign", "verify"]
      );
      const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
      const publicKeyStr = JSON.stringify(publicKeyJwk);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: rawId,
          rp: { name: "Jobayer Group Career" },
          user: {
            id: rawId,
            name: username,
            displayName: username,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "required",
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      const res = await fetch("/api/auth/biometric/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: username,
          credentialId: credId,
          publicKey: publicKeyStr,
          deviceName: navigator.userAgent.slice(0, 50),
          userType: "company",
        }),
      });
      if (!res.ok) throw new Error("Registration failed");
      setBioRegistered(true);
      alert(lang === "bn" ? "ফিঙ্গারপ্রিন্ট সেটআপ সম্পন্ন" : "Fingerprint setup complete");
    } catch (err: any) {
      alert(err.message || "Setup failed");
    } finally {
      setBioLoading(false);
    }
  };

  const handleRemoveFingerprint = async () => {
    if (!confirm(lang === "bn" ? "ফিঙ্গারপ্রিন্ট মুছে ফেলবেন?" : "Remove fingerprint?")) return;
    try {
      await fetch("/api/auth/biometric/register", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: username, userType: "company" }),
      });
      setBioRegistered(false);
    } catch {}
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-8">
          {lang === "bn" ? "ফিঙ্গারপ্রিন্ট সেটিংস" : "Fingerprint Settings"}
        </h1>

        <Card>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16.5V9.5C7 6.46 9.24 4 12 4c2.76 0 5 2.46 5 5.5v2M12 13v4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 14.5v-2A7 7 0 0119 12" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0118 0v2M8 12a4 4 0 018 0M12 20v-1" />
              </svg>
            </div>
            <h2 className="font-bold text-lg text-primary">{username}</h2>
            <p className="text-sm text-text-secondary mt-1">
              {lang === "bn" ? "কোম্পানি অ্যাকাউন্ট" : "Company Account"}
            </p>
          </div>

          <p className="text-sm text-text-secondary mb-4 text-center">
            {lang === "bn"
              ? "ফিঙ্গারপ্রিন্ট সেটআপ করলে company.jobayer-group.com/login এ ফিঙ্গারপ্রিন্ট দিয়ে লগইন করতে পারবেন"
              : "Setup fingerprint to login at company.jobayer-group.com/login using your fingerprint"}
          </p>

          {bioRegistered ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <span className="text-green-600 font-medium">
                  {lang === "bn" ? "✓ ফিঙ্গারপ্রিন্ট সক্রিয় আছে" : "✓ Fingerprint is active"}
                </span>
              </div>
              <Button onClick={handleRemoveFingerprint} className="w-full !bg-red-500 !text-white hover:!bg-red-600">
                {lang === "bn" ? "ফিঙ্গারপ্রিন্ট সরান" : "Remove Fingerprint"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowWarning(true)} disabled={bioLoading} className="w-full">
              {bioLoading
                ? (lang === "bn" ? "সেটআপ হচ্ছে..." : "Setting up...")
                : (lang === "bn" ? "ফিঙ্গারপ্রিন্ট সেটআপ করুন" : "Setup Fingerprint")}
            </Button>
          )}
        </Card>
      </div>

      {/* Fingerprint Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowWarning(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-primary text-center mb-3">
              {lang === "bn" ? "সতর্কবার্তা" : "Warning"}
            </h3>
            <div className="space-y-2 text-sm text-text-secondary mb-6">
              <p>{lang === "bn"
                ? "ফিঙ্গারপ্রিন্ট শুধুমাত্র আপনার নিজস্ব ডিভাইসে সেটআপ করুন।"
                : "Set up fingerprint only on your own device."}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{lang === "bn" ? "নিজের মোবাইল/ল্যাপটপ → সেটআপ করুন" : "Use your own device to set up"}</li>
                <li>{lang === "bn" ? "অন্যের ডিভাইসে সেটআপ করবেন না" : "Do NOT set up on someone else's device"}</li>
                <li>{lang === "bn" ? "শুধু এই ডিভাইসে কাজ করবে" : "Works only on THIS device"}</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowWarning(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-gray-50 transition-all">
                {lang === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button onClick={() => { setShowWarning(false); handleSetupFingerprint(); }} className="flex-1 py-3 rounded-xl bg-action text-white text-sm font-medium hover:bg-action/90 transition-all">
                {lang === "bn" ? "আমি বুঝেছি, সেটআপ করুন" : "I Understand, Set Up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

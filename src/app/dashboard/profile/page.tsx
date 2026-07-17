"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { lang } = useLanguageStore();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", workerId: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [bioRegistered, setBioRegistered] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const workerId = localStorage.getItem("worker_id");
    if (!workerId) { setLoading(false); return; }
    fetch(`/api/workers/profile?workerId=${workerId}`)
      .then((r) => r.json() as Promise<{ workerId?: string; name?: string; phone?: string; email?: string }>)
      .then((data) => {
        if (data.workerId) {
          setForm({ name: data.name || "", phone: data.phone || "", email: data.email || "", password: "", workerId: data.workerId });
        }
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
    fetch(`/api/auth/biometric/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "begin", workerId }),
    }).then((r) => {
      if (r.ok) setBioRegistered(true);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const body: Record<string, string> = { workerId: form.workerId };
    if (form.name) body.name = form.name;
    if (form.email !== undefined) body.email = form.email;
    if (form.password) body.password = form.password;
    try {
      const res = await fetch("/api/workers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setForm((p) => ({ ...p, password: "" }));
    } catch {
      setError(lang === "bn" ? "আপডেট ব্যর্থ" : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSetupFingerprint = async () => {
    if (!window.PublicKeyCredential) {
      return alert(lang === "bn" ? "এই ব্রাউজার ফিঙ্গারপ্রিন্ট সাপোর্ট করে না" : "Browser does not support fingerprint");
    }
    setBioLoading(true);
    try {
      // Generate a unique credential ID
      const rawId = crypto.getRandomValues(new Uint8Array(32));
      const credentialId = btoa(String.fromCharCode(...rawId));
      // Generate a simple key pair using Web Crypto
      const keyPair = await crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        true,
        ["sign", "verify"]
      );
      const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
      const publicKeyStr = JSON.stringify(publicKeyJwk);

      // Create WebAuthn credential (discoverable = residentKey)
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: rawId,
          rp: { name: "Jobayer Group Career" },
          user: {
            id: rawId,
            name: form.phone,
            displayName: form.name,
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
          workerId: form.workerId,
          credentialId: credId,
          publicKey: publicKeyStr,
          deviceName: navigator.userAgent.slice(0, 50),
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
        body: JSON.stringify({ workerId: form.workerId }),
      });
      setBioRegistered(false);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 px-4 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-action border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-8">{lang === "bn" ? "প্রোফাইল" : "Profile"}</h1>

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
            {form.name ? form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
          </div>
          <h2 className="font-bold text-xl text-primary">{form.name}</h2>
          <p className="text-sm text-text-secondary">{form.workerId}</p>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "নাম" : "Name"}</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ফোন" : "Phone"}</label>
                <input type="tel" value={form.phone} className="input-field bg-gray-50" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder={lang === "bn" ? "ফাঁকা রাখলে অপরিবর্তিত" : "Leave blank to keep current"} />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (lang === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving...") : saved ? (lang === "bn" ? "✓ সংরক্ষিত" : "✓ Saved") : (lang === "bn" ? "আপডেট করুন" : "Update Profile")}
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-4">
              {lang === "bn" ? "ফিঙ্গারপ্রিন্ট লগইন" : "Fingerprint Login"}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {lang === "bn"
                ? "ফিঙ্গারপ্রিন্ট সেটআপ করলে পাসওয়ার্ড না দিয়েই লগইন করতে পারবেন"
                : "Setup fingerprint to login without password"}
            </p>
            {bioRegistered ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">
                  {lang === "bn" ? "✓ ফিঙ্গারপ্রিন্ট সক্রিয়" : "✓ Fingerprint active"}
                </span>
                <button onClick={handleRemoveFingerprint} className="text-sm text-red-500 hover:underline">
                  {lang === "bn" ? "মুছে ফেলুন" : "Remove"}
                </button>
              </div>
            ) : (
              <>
                <Button onClick={() => setShowWarning(true)} disabled={bioLoading} className="w-full bg-action/10 text-action hover:bg-action/20 border border-action/30">
                  {bioLoading
                    ? (lang === "bn" ? "সেটআপ হচ্ছে..." : "Setting up...")
                    : (lang === "bn" ? "ফিঙ্গারপ্রিন্ট সেটআপ করুন" : "Setup Fingerprint")}
                </Button>
              </>
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
                  <li>{lang === "bn" ? "নিজের মোবাইল/ল্যাপটপ → সেটআপ করুন" : "Use your own phone/laptop to set up"}</li>
                  <li>{lang === "bn" ? "অন্যের ডিভাইসে সেটআপ করবেন না" : "Do NOT set up on someone else's device"}</li>
                  <li>{lang === "bn" ? "একবার সেটআপ করলে শুধু এই ডিভাইসে কাজ করবে" : "Works only on THIS device once set up"}</li>
                  <li>{lang === "bn" ? "অন্য ডিভাইস থেকে লগইন করতে পাসওয়ার্ড ব্যবহার করুন" : "Use password to login from other devices"}</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWarning(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-gray-50 transition-all"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={() => { setShowWarning(false); handleSetupFingerprint(); }}
                  className="flex-1 py-3 rounded-xl bg-action text-white text-sm font-medium hover:bg-action/90 transition-all"
                >
                  {lang === "bn" ? "আমি বুঝেছি, সেটআপ করুন" : "I Understand, Set Up"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
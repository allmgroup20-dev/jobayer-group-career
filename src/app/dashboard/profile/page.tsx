"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import LinkedPlatformsSection from "@/components/LinkedPlatformsSection";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSWRFetch } from "@/lib/use-swr-fetch";
import { geoIndex, loadDistrict, loadCC, geoSlug, type GeoDivision, type GeoDistrictData, type GeoCC } from "@/lib/geo";
import { religionKeys, religionPath, religionOptions, religionLevels } from "@/lib/religions";

export default function ProfilePage() {
  const { lang } = useLanguageStore();
  const workerId = typeof window !== "undefined" ? localStorage.getItem("worker_id") : null;
  const { data: profileData, loading } = useSWRFetch<Record<string, any>>(
    workerId ? `/api/workers/profile?workerId=${workerId}` : null,
    { ttlMs: 180_000 }
  );
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", currentPassword: "", workerId: "", ageGroup: "", occupation: "", educationLevel: "", preferredLanguage: "", gender: "", country: "বাংলাদেশ", city: "", division: "", district: "", upazila: "", cityCorporation: "", ward: "", area: "", union: "", pourashava: "", goal: "", preferredLearningTime: "", referralSource: "", communicationPreference: "whatsapp", budgetRange: "", religion: "" });
  const [geoDivisions, setGeoDivisions] = useState<GeoDivision[]>([]);
  const [districtData, setDistrictData] = useState<GeoDistrictData | null>(null);
  const [ccData, setCcData] = useState<GeoCC | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [bioRegistered, setBioRegistered] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState("");

  useEffect(() => {
    if (!profileData?.workerId) return;
    setForm({ name: profileData.name || "", phone: profileData.phone || "", email: profileData.email || "", password: "", currentPassword: "", workerId: profileData.workerId, ageGroup: profileData.ageGroup || "", occupation: profileData.occupation || "", educationLevel: profileData.educationLevel || "", preferredLanguage: profileData.preferredLanguage || "bn", gender: profileData.gender || "", country: "বাংলাদেশ", city: profileData.cityCorporation || profileData.upazila || profileData.city || "", division: profileData.division || "", district: profileData.district || "", upazila: profileData.upazila || "", cityCorporation: profileData.cityCorporation || "", ward: profileData.ward || "", area: profileData.area || "", union: profileData.union || "", pourashava: profileData.pourashava || "", goal: profileData.goal || "", preferredLearningTime: profileData.preferredLearningTime || "", referralSource: profileData.referralSource || "", communicationPreference: profileData.communicationPreference || "whatsapp", budgetRange: profileData.budgetRange || "", religion: profileData.religion || "" });
    if (profileData.membershipStatus) setMembershipStatus(profileData.membershipStatus);
  }, [profileData]);

  useEffect(() => {
    if (!workerId) return;
    fetch(`/api/auth/biometric/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "begin", workerId }),
    }).then((r) => {
      if (r.ok) setBioRegistered(true);
    }).catch(() => {});
  }, [workerId]);

  useEffect(() => {
    let active = true;
    geoIndex()
      .then((data) => { if (active) setGeoDivisions(data.divisions); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!form.district || !form.division) { setDistrictData(null); setCcData(null); return; }
    let active = true;
    setGeoBusy(true);
    const division = geoDivisions.find((d) => d.en === form.division || d.id === form.division);
    const dist = division?.districts.find((di) => di.en === form.district || di.id === form.district);
    if (!dist) { setGeoBusy(false); return; }
    loadDistrict(dist.id)
      .then((data) => { if (active) { setDistrictData(data); setCcData(null); } })
      .catch(() => {})
      .finally(() => { if (active) setGeoBusy(false); });
    return () => { active = false; };
  }, [form.division, form.district, geoDivisions]);

  useEffect(() => {
    if (!form.cityCorporation) { setCcData(null); return; }
    let active = true;
    setGeoBusy(true);
    loadCC(geoSlug(form.cityCorporation))
      .then((data) => { if (active) setCcData(data); })
      .catch(() => {})
      .finally(() => { if (active) setGeoBusy(false); });
    return () => { active = false; };
  }, [form.cityCorporation]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const body: Record<string, string> = { workerId: form.workerId };
    if (form.name) body.name = form.name;
    if (form.email !== undefined) body.email = form.email;
    if (form.password) body.password = form.password;
    if (form.currentPassword) body.currentPassword = form.currentPassword;
    if (form.ageGroup) body.ageGroup = form.ageGroup;
    if (form.occupation) body.occupation = form.occupation;
    if (form.educationLevel) body.educationLevel = form.educationLevel;
    if (form.preferredLanguage) body.preferredLanguage = form.preferredLanguage;
    if (form.gender) body.gender = form.gender;
    if (form.country) body.country = form.country;
    if (form.city) body.city = form.city;
    if (form.division) body.division = form.division;
    if (form.district) body.district = form.district;
    if (form.upazila) body.upazila = form.upazila;
    if (form.cityCorporation) body.cityCorporation = form.cityCorporation;
    if (form.ward) body.ward = form.ward;
    if (form.area) body.area = form.area;
    if (form.union) body.union = form.union;
    if (form.pourashava) body.pourashava = form.pourashava;
    if (form.goal) body.goal = form.goal;
    if (form.preferredLearningTime) body.preferredLearningTime = form.preferredLearningTime;
    if (form.referralSource) body.referralSource = form.referralSource;
    if (form.communicationPreference) body.communicationPreference = form.communicationPreference;
    if (form.budgetRange) body.budgetRange = form.budgetRange;
    const religion = form.religion;
    if (religion) body.religion = religion;
    try {
      const res = await fetch("/api/workers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setForm((p) => ({ ...p, password: "", currentPassword: "" }));
    } catch {
      setError(lang === "bn" ? "আপডেট ব্যর্থ" : "Update failed");
    } finally {
      setSaving(false);
    }
  };

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
      // 1. Get server challenge
      const chalRes = await fetch("/api/auth/biometric/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "challenge", workerId, userType: "worker" }),
      });
      const chalData = await chalRes.json() as { challengeId?: string; challenge?: string };
      if (!chalRes.ok) throw new Error(chalData.challenge || "Failed to get challenge");
      const { challengeId, challenge } = chalData;
      if (!challenge) throw new Error("No challenge received");

      // 2. Create WebAuthn credential with server challenge
      const challengeBytes = Uint8Array.from(atob(challenge.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      const userId = form.phone || workerId || "unknown";
      const userName = form.name || userId;
      const userBytes = new TextEncoder().encode(userId);
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challengeBytes,
          rp: { id: window.location.hostname, name: "Jobayer Group Career" },
          user: { id: userBytes, name: userId, displayName: userName },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "required" },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      const respData = credential.response as any;
      const credId = base64url(credential.rawId);
      const attObj = btoa(String.fromCharCode(...new Uint8Array(respData.attestationObject)));
      const cdJSON = btoa(String.fromCharCode(...new Uint8Array(respData.clientDataJSON)));

      // 3. Send to server for verification
      const res = await fetch("/api/auth/biometric/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          challengeId,
          workerId,
          credentialId: credId,
          attestationObject: attObj,
          clientDataJSON: cdJSON,
          deviceName: navigator.userAgent.slice(0, 50),
          userType: "worker",
        }),
      });
      if (!res.ok) {
        const errData = await res.json() as { error?: string };
        throw new Error(errData.error || "Registration failed");
      }
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
        <Skeleton className="w-8 h-8 rounded-full" />
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
          {membershipStatus === "premium" ? (
            <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full">⭐ PREMIUM MEMBER</span>
          ) : (
            <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-500 font-medium px-3 py-1 rounded-full">{lang === "bn" ? "সাধারণ সদস্য" : "General Member"}</span>
          )}
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
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "বর্তমান পাসওয়ার্ড" : "Current Password"}</label>
                <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className="input-field" placeholder={lang === "bn" ? "পাসওয়ার্ড বদলাতে চাইলে দিন" : "Required to change password"} autoComplete="current-password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder={lang === "bn" ? "ফাঁকা রাখলে অপরিবর্তিত" : "Leave blank to keep current"} autoComplete="new-password" />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "পছন্দের ভাষা" : "Preferred Language"}</label>
                <select value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })} className="input-field">
                  <option value="bn">বাংলা</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "বয়স" : "Age"}</label>
                <select value={form.ageGroup} onChange={(e) => setForm({ ...form, ageGroup: e.target.value })} className="input-field">
                  <option value="">{lang === "bn" ? "বয়স নির্বাচন করুন" : "Select age..."}</option>
                  {Array.from({ length: 94 }, (_, i) => i + 7).map((age) => (
                    <option key={age} value={String(age)}>{age}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "পেশা" : "Occupation"}</label>
                <select value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="student">{lang === "bn" ? "ছাত্র/ছাত্রী" : "Student"}</option>
                  <option value="job_seeker">{lang === "bn" ? "চাকরি প্রার্থী" : "Job Seeker"}</option>
                  <option value="employed">{lang === "bn" ? "চাকরিজীবী (বেসরকারি)" : "Employed (Private)"}</option>
                  <option value="govt_job">{lang === "bn" ? "সরকারি চাকরিজীবী" : "Government Job"}</option>
                  <option value="freelancer">{lang === "bn" ? "ফ্রিল্যান্সার" : "Freelancer"}</option>
                  <option value="content_creator">{lang === "bn" ? "কনটেন্ট ক্রিয়েটর / ইউটিউবার" : "Content Creator / YouTuber"}</option>
                  <option value="teacher">{lang === "bn" ? "শিক্ষক/শিক্ষিকা" : "Teacher"}</option>
                  <option value="doctor">{lang === "bn" ? "ডাক্তার / স্বাস্থ্যকর্মী" : "Doctor / Health Worker"}</option>
                  <option value="engineer">{lang === "bn" ? "ইঞ্জিনিয়ার / টেকনিশিয়ান" : "Engineer / Technician"}</option>
                  <option value="business">{lang === "bn" ? "ব্যবসায়ী" : "Business Owner"}</option>
                  <option value="shopkeeper">{lang === "bn" ? "দোকানদার" : "Shopkeeper"}</option>
                  <option value="driver">{lang === "bn" ? "চালক" : "Driver"}</option>
                  <option value="farmer">{lang === "bn" ? "কৃষক" : "Farmer"}</option>
                  <option value="day_laborer">{lang === "bn" ? "দিনমজুর / শ্রমিক" : "Day Laborer"}</option>
                  <option value="homemaker">{lang === "bn" ? "গৃহিণী" : "Homemaker"}</option>
                  <option value="retired">{lang === "bn" ? "অবসরপ্রাপ্ত" : "Retired"}</option>
                  <option value="unemployed">{lang === "bn" ? "বেকার" : "Unemployed"}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "শিক্ষাগত যোগ্যতা" : "Education Level"}</label>
                <select value={form.educationLevel} onChange={(e) => setForm({ ...form, educationLevel: e.target.value })} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <optgroup label={lang === "bn" ? "জাতীয় কারিকুলাম (বাংলা মাধ্যম)" : "National Curriculum (Bangla Medium)"}>
                    <option value="psc">PSC (প্রাথমিক শিক্ষা সমাপনী)</option>
                    <option value="jsc">JSC (জুনিয়র স্কুল সার্টিফিকেট)</option>
                    <option value="ssc">SSC (মাধ্যমিক)</option>
                    <option value="hsc">HSC (উচ্চ মাধ্যমিক)</option>
                  </optgroup>
                  <optgroup label={lang === "bn" ? "ইংরেজি মাধ্যম / ইংরেজি ভার্সন" : "English Medium / English Version"}>
                    <option value="olevel">O-Level / IGCSE (SSC সমতুল্য)</option>
                    <option value="alevel">A-Level (HSC সমতুল্য)</option>
                  </optgroup>
                  <optgroup label={lang === "bn" ? "মাদ্রাসা শিক্ষা" : "Madrasa (Islamic) Education"}>
                    <option value="ebtedayee">এবতেদায়ী (প্রাথমিক সমতুল্য)</option>
                    <option value="dakhil">দাখিল (SSC সমতুল্য)</option>
                    <option value="alim">আলিম (HSC সমতুল্য)</option>
                    <option value="fazil">ফাযিল (স্নাতক সমতুল্য)</option>
                    <option value="kamil">কামিল (স্নাতকোত্তর সমতুল্য)</option>
                  </optgroup>
                  <optgroup label={lang === "bn" ? "কারিগরি / ভোকেশনাল" : "Technical / Vocational (BTEB)"}>
                    <option value="ssc_voc">SSC (ভোকেশনাল)</option>
                    <option value="hsc_voc">HSC (ভোকেশনাল)</option>
                    <option value="diploma">ডিপ্লোমা-ইন-ইঞ্জিনিয়ারিং</option>
                  </optgroup>
                  <optgroup label={lang === "bn" ? "উচ্চশিক্ষা" : "Higher Education"}>
                    <option value="bachelor">{lang === "bn" ? "স্নাতক (অনার্স/পাস)" : "Bachelor's (Honours/Pass)"}</option>
                    <option value="master">{lang === "bn" ? "স্নাতকোত্তর" : "Master's"}</option>
                    <option value="phd">PhD</option>
                  </optgroup>
                  <optgroup label={lang === "bn" ? "অন্যান্য" : "Other"}>
                    <option value="literate">{lang === "bn" ? "শুধু স্বাক্ষর" : "Only literate"}</option>
                    <option value="none">{lang === "bn" ? "কোনো আনুষ্ঠানিক শিক্ষা নেই" : "No formal education"}</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "লিঙ্গ" : "Gender"}</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="male">{lang === "bn" ? "পুরুষ" : "Male"}</option>
                  <option value="female">{lang === "bn" ? "মহিলা" : "Female"}</option>
                  <option value="other">{lang === "bn" ? "অন্যান্য" : "Other"}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "কেন এই কোর্স? (লক্ষ্য)" : "Your Goal"}</label>
                <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="career">{lang === "bn" ? "ক্যারিয়ার গড়তে" : "Build a Career"}</option>
                  <option value="freelancing">{lang === "bn" ? "ফ্রিল্যান্সিং শুরু করতে" : "Start Freelancing"}</option>
                  <option value="business">{lang === "bn" ? "ব্যবসা করতে" : "Start a Business"}</option>
                  <option value="skill">{lang === "bn" ? "স্কিল ডেভেলপ করতে" : "Develop Skills"}</option>
                  <option value="job">{lang === "bn" ? "চাকরি পেতে" : "Get a Job"}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "দেশ" : "Country"}</label>
                <div className="input-field flex items-center justify-between">
                  <span>🇧🇩 {lang === "bn" ? "বাংলাদেশ" : "Bangladesh"}</span>
                  <span className="text-[11px] font-bold text-teal">{lang === "bn" ? "অটো সিলেক্টেড" : "Auto-selected"}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "বিভাগ" : "Division"}</label>
                <select value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value, district: "", upazila: "", cityCorporation: "", ward: "", area: "", union: "", pourashava: "", city: "" })} className="input-field">
                  <option value="">{lang === "bn" ? "বিভাগ নির্বাচন করুন" : "Select division..."}</option>
                  {geoDivisions.map((d) => (
                    <option key={d.id} value={d.en}>{lang === "bn" ? d.bn : d.en}</option>
                  ))}
                </select>
              </div>
              {form.division && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "জেলা" : "District"}</label>
                  <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, upazila: "", cityCorporation: "", ward: "", area: "", union: "", pourashava: "", city: "" })} className="input-field">
                    <option value="">{lang === "bn" ? "জেলা নির্বাচন করুন" : "Select district..."}</option>
                    {geoDivisions.find((d) => d.en === form.division || d.id === form.division)?.districts.map((di) => (
                      <option key={di.id} value={di.en}>{lang === "bn" ? di.bn : di.en}</option>
                    ))}
                  </select>
                </div>
              )}
              {form.division && form.district && geoBusy && (
                <div className="text-sm text-text-secondary flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-border border-t-teal rounded-full animate-spin" />
                  {lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}
                </div>
              )}
              {form.division && form.district && !geoBusy && districtData && districtData.cityCorporations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "সিটি কর্পোরেশন" : "City Corporation"}</label>
                  <select value={form.cityCorporation} onChange={(e) => setForm({ ...form, cityCorporation: e.target.value, upazila: "", ward: "", area: "", union: "", pourashava: "", city: e.target.value })} className="input-field">
                    <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                    {districtData.cityCorporations.map((c) => (
                      <option key={c.id} value={c.en}>{lang === "bn" ? c.bn : c.en}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-text-secondary">{lang === "bn" ? "শহরের ভেতরে থাকলে সিটি কর্পোরেশন নির্বাচন করুন" : "Pick a city corporation if you live inside the city"}</p>
                </div>
              )}
              {form.division && form.district && form.cityCorporation && !geoBusy && ccData && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ওয়ার্ড" : "Ward"}</label>
                  <select value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value, area: "" })} className="input-field">
                    <option value="">{lang === "bn" ? "ওয়ার্ড নির্বাচন করুন" : "Select ward..."}</option>
                    {ccData.wards.map((w) => (
                      <option key={w.n} value={String(w.n)}>{lang === "bn" ? `ওয়ার্ড ${w.n}` : `Ward ${w.n}`}</option>
                    ))}
                  </select>
                </div>
              )}
              {form.cityCorporation && form.ward && !geoBusy && ccData && (
                (() => {
                  const areas = ccData.wards.find((w) => String(w.n) === form.ward)?.areas || [];
                  if (areas.length > 0) {
                    return (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "এলাকা" : "Area"}</label>
                        <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input-field">
                          <option value="">{lang === "bn" ? "এলাকা নির্বাচন করুন" : "Select area..."}</option>
                          {areas.map((a) => (
                            <option key={a.en} value={a.en}>{lang === "bn" ? (a.bn || a.en) : a.en}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "এলাকা / মহল্লা" : "Area / Neighborhood"}</label>
                      <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input-field" placeholder={lang === "bn" ? "আপনার এলাকার নাম লিখুন" : "Type your area name"} />
                    </div>
                  );
                })()
              )}
              {form.division && form.district && form.cityCorporation && (
                <div className="text-[11px] text-text-secondary">{lang === "bn" ? "অথবা নিচে উপজেলা নির্বাচন করে গ্রাম/মফস্বল এলাকা দিন" : "Or pick an upazila below for a village/rural area"}</div>
              )}
              {form.division && form.district && districtData && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "উপজেলা / থানা" : "Upazila / Thana"}</label>
                  <select value={form.upazila} onChange={(e) => setForm({ ...form, upazila: e.target.value, union: "", pourashava: "", ward: "", area: "", city: e.target.value })} className="input-field">
                    <option value="">{lang === "bn" ? "উপজেলা / থানা নির্বাচন করুন" : "Select upazila / thana..."}</option>
                    {districtData.upazilas.map((u) => (
                      <option key={u.id} value={u.en}>{lang === "bn" ? u.bn : u.en}</option>
                    ))}
                  </select>
                </div>
              )}
              {form.upazila && districtData && (() => {
                const upazila = districtData.upazilas.find((u) => u.en === form.upazila);
                if (!upazila) return null;
                return (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ইউনিয়ন / পৌরসভা" : "Union / Pourashava"}</label>
                    <select value={form.union || form.pourashava} onChange={(e) => {
                      const v = e.target.value;
                      const isPourashava = upazila.pourashavas.some((p) => p.en === v);
                      setForm({ ...form, union: isPourashava ? "" : v, pourashava: isPourashava ? v : "", ward: "", area: "" });
                    }} className="input-field">
                      <option value="">{lang === "bn" ? "ইউনিয়ন / পৌরসভা নির্বাচন করুন" : "Select union / pourashava..."}</option>
                      {upazila.unions.length > 0 && (
                        <optgroup label={lang === "bn" ? "ইউনিয়ন" : "Union"}>
                          {upazila.unions.map((u) => (
                            <option key={"u" + u.en} value={u.en}>{lang === "bn" ? u.bn : u.en}</option>
                          ))}
                        </optgroup>
                      )}
                      {upazila.pourashavas.length > 0 && (
                        <optgroup label={lang === "bn" ? "পৌরসভা" : "Pourashava"}>
                          {upazila.pourashavas.map((p) => (
                            <option key={"p" + p.en} value={p.en}>{lang === "bn" ? p.bn : p.en}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                );
              })()}
              {form.pourashava && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ওয়ার্ড" : "Ward"}</label>
                  <select value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value, area: "" })} className="input-field">
                    <option value="">{lang === "bn" ? "ওয়ার্ড নির্বাচন করুন" : "Select ward..."}</option>
                    {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={String(n)}>{lang === "bn" ? `ওয়ার্ড ${n}` : `Ward ${n}`}</option>
                    ))}
                  </select>
                </div>
              )}
              {(form.pourashava || form.union) && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "এলাকা / মহল্লা" : "Area / Neighborhood"}</label>
                  <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input-field" placeholder={lang === "bn" ? "আপনার এলাকার নাম লিখুন" : "Type your area name"} />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "পছন্দের পড়ার সময়" : "Preferred Learning Time"}</label>
                <select value={form.preferredLearningTime} onChange={(e) => setForm({ ...form, preferredLearningTime: e.target.value })} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="morning">{lang === "bn" ? "সকাল" : "Morning"}</option>
                  <option value="afternoon">{lang === "bn" ? "দুপুর" : "Afternoon"}</option>
                  <option value="evening">{lang === "bn" ? "বিকেল" : "Evening"}</option>
                  <option value="night">{lang === "bn" ? "রাত" : "Night"}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "কীভাবে জানতে পেরেছেন?" : "How did you find us?"}</label>
                <select value={form.referralSource} onChange={(e) => setForm({ ...form, referralSource: e.target.value })} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="facebook">Facebook</option>
                  <option value="google">Google</option>
                  <option value="youtube">YouTube</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="friend">{lang === "bn" ? "বন্ধুর মাধ্যমে" : "Friend/Family"}</option>
                  <option value="other">{lang === "bn" ? "অন্যান্য" : "Other"}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "যোগাযোগের মাধ্যম" : "Preferred Contact"}</label>
                <select value={form.communicationPreference} onChange={(e) => setForm({ ...form, communicationPreference: e.target.value })} className="input-field">
                  <option value="whatsapp">{lang === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp"}</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "বাজেট (প্রতি কোর্সে)" : "Budget Range (per course)"}</label>
                <select value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="under_1000">{lang === "bn" ? "১,০০০ এর নিচে" : "Under 1,000 ৳"}</option>
                  <option value="1000_3000">{lang === "bn" ? "১,০০০ - ৩,০০০" : "1,000 - 3,000 ৳"}</option>
                  <option value="3000_5000">{lang === "bn" ? "৩,০০০ - ৫,০০০" : "3,000 - 5,000 ৳"}</option>
                  <option value="5000_10000">{lang === "bn" ? "৫,০০০ - ১০,০০০" : "5,000 - 10,000 ৳"}</option>
                  <option value="over_10000">{lang === "bn" ? "১০,০০০ এর উপরে" : "Above 10,000 ৳"}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ধর্ম" : "Religion"}</label>
                <div className="space-y-2">
                  {(() => {
                    const keys = religionKeys(form.religion);
                    const levels = religionLevels(keys);
                    return Array.from({ length: levels }, (_, i) => {
                      const opts = religionOptions(keys, i);
                      const val = keys[i] || "";
                      return (
                        <select
                          key={i}
                          value={val}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((p) => ({ ...p, religion: religionPath([...religionKeys(p.religion).slice(0, i), v]) }));
                          }}
                          className="input-field"
                        >
                          <option value="">{i === 0 ? (lang === "bn" ? "ধর্ম নির্বাচন করুন" : "Select religion...") : (lang === "bn" ? "ভিতরের অংশ নির্বাচন করুন" : "Select branch...")}</option>
                          {opts.map((o) => (
                            <option key={o.v} value={o.v}>{lang === "bn" ? o.bn : o.en}</option>
                          ))}
                        </select>
                      );
                    });
                  })()}
                </div>
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

          <LinkedPlatformsSection />
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
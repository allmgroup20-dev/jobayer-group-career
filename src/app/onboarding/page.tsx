"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/lib/store";

const STEPS = ["name", "details", "interests", "done"];

const INTEREST_OPTIONS = [
  { en: "Web Development", bn: "ওয়েব ডেভেলপমেন্ট", icon: "🌐" },
  { en: "Programming", bn: "প্রোগ্রামিং", icon: "💻" },
  { en: "Graphics Design", bn: "গ্রাফিক্স ডিজাইন", icon: "🎨" },
  { en: "Digital Marketing", bn: "ডিজিটাল মার্কেটিং", icon: "📱" },
  { en: "Video Editing", bn: "ভিডিও এডিটিং", icon: "🎬" },
  { en: "Freelancing", bn: "ফ্রিল্যান্সিং", icon: "💼" },
  { en: "English Learning", bn: "ইংলিশ লার্নিং", icon: "📖" },
  { en: "Cyber Security", bn: "সাইবার সিকিউরিটি", icon: "🔒" },
  { en: "AI & ChatGPT", bn: "এআই ও চ্যাটজিপিটি", icon: "🤖" },
  { en: "Business", bn: "ব্যবসা", icon: "📊" },
];

export default function OnboardingPage() {
  const { lang } = useLanguageStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [workerId, setWorkerId] = useState("");
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [occupation, setOccup] = useState("");
  const [educationLevel, setEdu] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [goal, setGoal] = useState("");
  const [preferredLearningTime, setLearningTime] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [communicationPreference, setCommPref] = useState("whatsapp");
  const [budgetRange, setBudgetRange] = useState("");
  const [religion, setReligion] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const wid = localStorage.getItem("worker_id");
    if (!wid) { router.push("/login"); return; }
    setWorkerId(wid);
    // Pre-fill existing name
    fetch(`/api/workers/profile?workerId=${wid}`)
      .then(r => r.json())
      .then((d: any) => {
        if (d.name && !d.name.startsWith("User")) setName(d.name);
        if (d.gender) setGender(d.gender);
        if (d.country) setCountry(d.country);
        if (d.city) setCity(d.city);
        if (d.goal) setGoal(d.goal);
        if (d.preferredLearningTime) setLearningTime(d.preferredLearningTime);
        if (d.referralSource) setReferralSource(d.referralSource);
        if (d.communicationPreference) setCommPref(d.communicationPreference);
        if (d.budgetRange) setBudgetRange(d.budgetRange);
        if (d.religion) setReligion(d.religion);
      })
      .catch(() => {});
  }, [router]);

  const toggleInterest = (key: string) => {
    setInterests(prev => prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]);
  };

  const saveAndNext = async () => {
    setSaving(true);
    try {
      const body: Record<string, string> = { workerId };
      if (name) body.name = name;
      if (ageGroup) body.ageGroup = ageGroup;
      if (occupation) body.occupation = occupation;
      if (educationLevel) body.educationLevel = educationLevel;
      if (gender) body.gender = gender;
      if (country) body.country = country;
      if (city) body.city = city;
      if (goal) body.goal = goal;
      if (preferredLearningTime) body.preferredLearningTime = preferredLearningTime;
      if (referralSource) body.referralSource = referralSource;
      if (communicationPreference) body.communicationPreference = communicationPreference;
      if (budgetRange) body.budgetRange = budgetRange;
      if (religion) body.religion = religion;

      if (Object.keys(body).length > 1) {
        await fetch("/api/workers/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (step === STEPS.length - 2 && interests.length > 0) {
        // Trigger scoring with interest keywords
        for (const interest of interests) {
          await fetch("/api/track/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerId, eventType: "search", searchKeyword: interest, pageCategory: "onboarding" }),
          }).catch(() => {});
        }
        await fetch(`/api/track/score?workerId=${workerId}`, { method: "POST" }).catch(() => {});
      }

      if (step < STEPS.length - 1) {
        setStep(s => s + 1);
      }
    } catch {} finally { setSaving(false); }
  };

  const finish = () => {
    router.push("/dashboard");
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-gray-50">
      <div className="w-full max-w-lg animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-premium rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-2xl text-white font-bold">JGC</span>
          </div>
          <h1 className="text-xl font-bold text-primary">
            {lang === "bn" ? "আপনার প্রোফাইল কমপ্লিট করুন" : "Complete Your Profile"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "আপনাকে আরও ভালোভাবে জানতে" : "So we can serve you better"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-action to-secondary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-border">
          {/* Step 0: Name */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-primary">{lang === "bn" ? "আপনার নাম কী?" : "What's your name?"}</h2>
              <p className="text-sm text-text-secondary">{lang === "bn" ? "আমরা আপনাকে নাম ধরে ডাকতে চাই" : "We'd like to call you by your name"}</p>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field text-lg"
                placeholder={lang === "bn" ? "আপনার নাম লিখুন" : "Enter your name"}
              />
              <button onClick={saveAndNext} disabled={saving || !name.trim()} className="btn-primary w-full">
                {saving ? "..." : lang === "bn" ? "পরবর্তী" : "Next"}
              </button>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-primary">{lang === "bn" ? "আপনার সম্পর্কে কিছু তথ্য" : "Tell us about yourself"}</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "বয়স গ্রুপ" : "Age Group"}</label>
                  <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} className="input-field">
                    <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                    <option value="under_18">Under 18</option>
                    <option value="18_24">18-24</option>
                    <option value="25_34">25-34</option>
                    <option value="35_44">35-44</option>
                    <option value="45_plus">45+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "লিঙ্গ" : "Gender"}</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="input-field">
                    <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                    <option value="male">{lang === "bn" ? "পুরুষ" : "Male"}</option>
                    <option value="female">{lang === "bn" ? "মহিলা" : "Female"}</option>
                    <option value="other">{lang === "bn" ? "অন্যান্য" : "Other"}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "পেশা" : "Occupation"}</label>
                <select value={occupation} onChange={e => setOccup(e.target.value)} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="student">{lang === "bn" ? "ছাত্র/ছাত্রী" : "Student"}</option>
                  <option value="employed">{lang === "bn" ? "চাকরিজীবী" : "Employed"}</option>
                  <option value="freelancer">{lang === "bn" ? "ফ্রিল্যান্সার" : "Freelancer"}</option>
                  <option value="business">{lang === "bn" ? "ব্যবসায়ী" : "Business Owner"}</option>
                  <option value="homemaker">{lang === "bn" ? "গৃহিণী" : "Homemaker"}</option>
                  <option value="unemployed">{lang === "bn" ? "বেকার" : "Unemployed"}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "শিক্ষাগত যোগ্যতা" : "Education Level"}</label>
                <select value={educationLevel} onChange={e => setEdu(e.target.value)} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="ssc">SSC / O-Level</option>
                  <option value="hsc">HSC / A-Level</option>
                  <option value="bachelor">{lang === "bn" ? "স্নাতক" : "Bachelor's"}</option>
                  <option value="master">{lang === "bn" ? "স্নাতকোত্তর" : "Master's"}</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "ধর্ম" : "Religion"}</label>
                <select value={religion} onChange={e => setReligion(e.target.value)} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="islam">{lang === "bn" ? "ইসলাম" : "Islam"}</option>
                  <option value="hindu">{lang === "bn" ? "হিন্দু" : "Hindu"}</option>
                  <option value="buddhist">{lang === "bn" ? "বৌদ্ধ" : "Buddhist"}</option>
                  <option value="christian">{lang === "bn" ? "খ্রিস্টান" : "Christian"}</option>
                  <option value="atheist">{lang === "bn" ? "নাস্তিক" : "Atheist"}</option>
                  <option value="agnostic">{lang === "bn" ? "সঞ্চয়বাদী" : "Agnostic"}</option>
                  <option value="sanatan">{lang === "bn" ? "সনাতন" : "Sanatan"}</option>
                  <option value="seventh_day_adventist">{lang === "bn" ? "সেভেনডে অ্যাডভেন্টিস্ট" : "Seventh-day Adventist"}</option>
                  <option value="tawhidi">{lang === "bn" ? "তাওহীদি" : "Tawhidi"}</option>
                  <option value="quran_sunnah">{lang === "bn" ? "কোরান-সুন্নাহ" : "Quran Sunnah"}</option>
                  <option value="sarbabadi">{lang === "bn" ? "সর্ববাদী" : "Sarbabadi"}</option>
                  <option value="lgbtq">{lang === "bn" ? "এলজিবিটি" : "LGBTQ+"}</option>
                  <option value="other">{lang === "bn" ? "অন্যান্য" : "Other"}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "কেন এই কোর্স? (আপনার লক্ষ্য)" : "Why this course? (Your Goal)"}</label>
                <select value={goal} onChange={e => setGoal(e.target.value)} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="career">{lang === "bn" ? "ক্যারিয়ার গড়তে" : "Build a Career"}</option>
                  <option value="freelancing">{lang === "bn" ? "ফ্রিল্যান্সিং শুরু করতে" : "Start Freelancing"}</option>
                  <option value="business">{lang === "bn" ? "ব্যবসা করতে" : "Start a Business"}</option>
                  <option value="skill">{lang === "bn" ? "স্কিল ডেভেলপ করতে" : "Develop Skills"}</option>
                  <option value="job">{lang === "bn" ? "চাকরি পেতে" : "Get a Job"}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "দেশ" : "Country"}</label>
                  <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="input-field" placeholder={lang === "bn" ? "যেমন: বাংলাদেশ" : "e.g. Bangladesh"} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "শহর" : "City"}</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className="input-field" placeholder={lang === "bn" ? "যেমন: ঢাকা" : "e.g. Dhaka"} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "কখন পড়তে পছন্দ করেন?" : "Preferred Learning Time"}</label>
                <select value={preferredLearningTime} onChange={e => setLearningTime(e.target.value)} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="morning">{lang === "bn" ? "সকাল" : "Morning"}</option>
                  <option value="afternoon">{lang === "bn" ? "দুপুর" : "Afternoon"}</option>
                  <option value="evening">{lang === "bn" ? "বিকেল" : "Evening"}</option>
                  <option value="night">{lang === "bn" ? "রাত" : "Night"}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "কীভাবে জানতে পেরেছেন?" : "How did you find us?"}</label>
                <select value={referralSource} onChange={e => setReferralSource(e.target.value)} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="facebook">{lang === "bn" ? "ফেসবুক" : "Facebook"}</option>
                  <option value="google">{lang === "bn" ? "গুগল" : "Google"}</option>
                  <option value="youtube">{lang === "bn" ? "ইউটিউব" : "YouTube"}</option>
                  <option value="whatsapp">{lang === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp"}</option>
                  <option value="friend">{lang === "bn" ? "বন্ধুর মাধ্যমে" : "Friend/Family"}</option>
                  <option value="other">{lang === "bn" ? "অন্যান্য" : "Other"}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "যোগাযোগের মাধ্যম" : "Preferred Contact"}</label>
                <select value={communicationPreference} onChange={e => setCommPref(e.target.value)} className="input-field">
                  <option value="whatsapp">{lang === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp"}</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{lang === "bn" ? "আপনার বাজেট (প্রতি কোর্সে)" : "Budget Range (per course)"}</label>
                <select value={budgetRange} onChange={e => setBudgetRange(e.target.value)} className="input-field">
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  <option value="under_1000">{lang === "bn" ? "১,০০০ এর নিচে" : "Under 1,000 ৳"}</option>
                  <option value="1000_3000">{lang === "bn" ? "১,০০০ - ৩,০০০" : "1,000 - 3,000 ৳"}</option>
                  <option value="3000_5000">{lang === "bn" ? "৩,০০০ - ৫,০০০" : "3,000 - 5,000 ৳"}</option>
                  <option value="5000_10000">{lang === "bn" ? "৫,০০০ - ১০,০০০" : "5,000 - 10,000 ৳"}</option>
                  <option value="over_10000">{lang === "bn" ? "১০,০০০ এর উপরে" : "Above 10,000 ৳"}</option>
                </select>
              </div>
              <button onClick={saveAndNext} disabled={saving} className="btn-primary w-full">
                {saving ? "..." : lang === "bn" ? "পরবর্তী" : "Next"}
              </button>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-primary">{lang === "bn" ? "আপনার আগ্রহ কী?" : "What are you interested in?"}</h2>
              <p className="text-sm text-text-secondary">{lang === "bn" ? "এক বা একাধিক সিলেক্ট করুন" : "Select one or more topics"}</p>
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_OPTIONS.map((opt) => {
                  const selected = interests.includes(opt.en);
                  return (
                    <button
                      key={opt.en}
                      onClick={() => toggleInterest(opt.en)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selected
                          ? "border-action bg-action/10"
                          : "border-border hover:border-action/50"
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <p className="text-sm font-semibold text-primary mt-1">{lang === "bn" ? opt.bn : opt.en}</p>
                    </button>
                  );
                })}
              </div>
              <button onClick={saveAndNext} disabled={saving} className="btn-primary w-full">
                {saving ? "..." : lang === "bn" ? "সম্পন্ন" : "Finish"}
              </button>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-primary">{lang === "bn" ? "শুরু করা যাক!" : "Let's Get Started!"}</h2>
              <p className="text-sm text-text-secondary">
                {lang === "bn"
                  ? "আপনার প্রোফাইল কমপ্লিট। এখন আপনার জন্য ব্যক্তিগতকৃত অভিজ্ঞতা তৈরি করছি..."
                  : "Your profile is complete. We're now personalizing your experience..."}
              </p>
              <button onClick={finish} className="btn-primary w-full">
                {lang === "bn" ? "ড্যাশবোর্ডে যান" : "Go to Dashboard"}
              </button>
            </div>
          )}
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i <= step ? "bg-action" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

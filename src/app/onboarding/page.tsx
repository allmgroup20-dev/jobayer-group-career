"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/lib/store";

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

type FieldKey =
  | "ageGroup" | "occupation" | "educationLevel" | "gender"
  | "country" | "city" | "goal" | "preferredLearningTime"
  | "referralSource" | "communicationPreference" | "budgetRange" | "religion";

interface FieldDef {
  key: FieldKey;
  labelEn: string;
  labelBn: string;
  type: "select" | "text";
  options?: { value: string; en: string; bn: string }[];
}

const ALL_FIELDS: FieldDef[] = [
  {
    key: "ageGroup", labelEn: "Age Group", labelBn: "বয়স গ্রুপ", type: "select",
    options: [
      { value: "under_18", en: "Under 18", bn: "১৮ এর নিচে" },
      { value: "18_24", en: "18-24", bn: "১৮-২৪" },
      { value: "25_34", en: "25-34", bn: "২৫-৩৪" },
      { value: "35_44", en: "35-44", bn: "৩৫-৪৪" },
      { value: "45_plus", en: "45+", bn: "৪৫+" },
    ],
  },
  {
    key: "occupation", labelEn: "Occupation", labelBn: "পেশা", type: "select",
    options: [
      { value: "student", en: "Student", bn: "ছাত্র/ছাত্রী" },
      { value: "employed", en: "Employed", bn: "চাকরিজীবী" },
      { value: "freelancer", en: "Freelancer", bn: "ফ্রিল্যান্সার" },
      { value: "business", en: "Business Owner", bn: "ব্যবসায়ী" },
      { value: "homemaker", en: "Homemaker", bn: "গৃহিণী" },
      { value: "unemployed", en: "Unemployed", bn: "বেকার" },
    ],
  },
  {
    key: "educationLevel", labelEn: "Education Level", labelBn: "শিক্ষাগত যোগ্যতা", type: "select",
    options: [
      { value: "ssc", en: "SSC / O-Level", bn: "এসএসসি / ও-লেভেল" },
      { value: "hsc", en: "HSC / A-Level", bn: "এইচএসসি / এ-লেভেল" },
      { value: "bachelor", en: "Bachelor's", bn: "স্নাতক" },
      { value: "master", en: "Master's", bn: "স্নাতকোত্তর" },
      { value: "phd", en: "PhD", bn: "পিএইচডি" },
    ],
  },
  {
    key: "gender", labelEn: "Gender", labelBn: "লিঙ্গ", type: "select",
    options: [
      { value: "male", en: "Male", bn: "পুরুষ" },
      { value: "female", en: "Female", bn: "মহিলা" },
      { value: "other", en: "Other", bn: "অন্যান্য" },
    ],
  },
  {
    key: "country", labelEn: "Country", labelBn: "দেশ", type: "text",
  },
  {
    key: "city", labelEn: "City", labelBn: "শহর", type: "text",
  },
  {
    key: "goal", labelEn: "Your Goal", labelBn: "আপনার লক্ষ্য", type: "select",
    options: [
      { value: "career", en: "Build a Career", bn: "ক্যারিয়ার গড়তে" },
      { value: "freelancing", en: "Start Freelancing", bn: "ফ্রিল্যান্সিং শুরু করতে" },
      { value: "business", en: "Start a Business", bn: "ব্যবসা করতে" },
      { value: "skill", en: "Develop Skills", bn: "স্কিল ডেভেলপ করতে" },
      { value: "job", en: "Get a Job", bn: "চাকরি পেতে" },
    ],
  },
  {
    key: "preferredLearningTime", labelEn: "Preferred Learning Time", labelBn: "পড়ার সময়", type: "select",
    options: [
      { value: "morning", en: "Morning", bn: "সকাল" },
      { value: "afternoon", en: "Afternoon", bn: "দুপুর" },
      { value: "evening", en: "Evening", bn: "বিকেল" },
      { value: "night", en: "Night", bn: "রাত" },
    ],
  },
  {
    key: "referralSource", labelEn: "How did you find us?", labelBn: "কীভাবে জানতে পেরেছেন?", type: "select",
    options: [
      { value: "facebook", en: "Facebook", bn: "ফেসবুক" },
      { value: "google", en: "Google", bn: "গুগল" },
      { value: "youtube", en: "YouTube", bn: "ইউটিউব" },
      { value: "whatsapp", en: "WhatsApp", bn: "হোয়াটসঅ্যাপ" },
      { value: "friend", en: "Friend/Family", bn: "বন্ধুর মাধ্যমে" },
      { value: "other", en: "Other", bn: "অন্যান্য" },
    ],
  },
  {
    key: "communicationPreference", labelEn: "Preferred Contact", labelBn: "যোগাযোগের মাধ্যম", type: "select",
    options: [
      { value: "whatsapp", en: "WhatsApp", bn: "হোয়াটসঅ্যাপ" },
      { value: "email", en: "Email", bn: "ইমেইল" },
      { value: "sms", en: "SMS", bn: "এসএমএস" },
    ],
  },
  {
    key: "budgetRange", labelEn: "Budget Range (per course)", labelBn: "বাজেট (প্রতি কোর্সে)", type: "select",
    options: [
      { value: "under_1000", en: "Under 1,000 ৳", bn: "১,০০০ এর নিচে" },
      { value: "1000_3000", en: "1,000 - 3,000 ৳", bn: "১,০০০ - ৩,০০০" },
      { value: "3000_5000", en: "3,000 - 5,000 ৳", bn: "৩,০০০ - ৫,০০০" },
      { value: "5000_10000", en: "5,000 - 10,000 ৳", bn: "৫,০০০ - ১০,০০০" },
      { value: "over_10000", en: "Above 10,000 ৳", bn: "১০,০০০ এর উপরে" },
    ],
  },
  {
    key: "religion", labelEn: "Religion", labelBn: "ধর্ম", type: "select",
    options: [
      { value: "islam", en: "▸ Islam", bn: "▸ ইসলাম" },
      { value: "islam_sunni", en: "  Sunni", bn: "  সুন্নি" },
      { value: "islam_shia", en: "  Shia", bn: "  শিয়া" },
      { value: "islam_ahle_sunnat", en: "  Ahle Sunnat Wal Jamaat", bn: "  আহলে সুন্নাত ওয়াল জামাত" },
      { value: "islam_ahle_hadith", en: "  Ahle Hadith", bn: "  আহলে হাদীস" },
      { value: "islam_ahle_quran", en: "  Ahle Quran", bn: "  আহলে কোরআন" },
      { value: "islam_sufi", en: "  Sufi", bn: "  সুফি" },
      { value: "islam_deobandi", en: "  Deobandi", bn: "  দেওবন্দি" },
      { value: "islam_ismaili", en: "  Ismaili", bn: "  ইসমাইলি" },
      { value: "hindu", en: "▸ Hindu", bn: "▸ হিন্দু" },
      { value: "hindu_vaishnav", en: "  Vaishnav", bn: "  বৈষ্ণব" },
      { value: "hindu_shaiva", en: "  Shaiva", bn: "  শৈব" },
      { value: "hindu_shakta", en: "  Shakta", bn: "  শাক্ত" },
      { value: "buddhist", en: "▸ Buddhist", bn: "▸ বৌদ্ধ" },
      { value: "buddhist_theravada", en: "  Theravada", bn: "  থেরবাদ" },
      { value: "buddhist_mahayana", en: "  Mahayana", bn: "  মহাযান" },
      { value: "christian", en: "▸ Christian", bn: "▸ খ্রিস্টান" },
      { value: "christian_catholic", en: "  Catholic", bn: "  ক্যাথলিক" },
      { value: "christian_orthodox", en: "  Orthodox", bn: "  অর্থোডক্স" },
      { value: "christian_protestant", en: "  Protestant", bn: "  প্রোটেস্ট্যান্ট" },
      { value: "atheist", en: "Atheist", bn: "নাস্তিক" },
      { value: "agnostic", en: "Agnostic", bn: "সঞ্চয়বাদী" },
      { value: "sanatan", en: "Sanatan", bn: "সনাতন" },
      { value: "sarbabadi", en: "Sarbabadi", bn: "সর্ববাদী" },
      { value: "lgbtq", en: "LGBTQ+", bn: "এলজিবিটি" },
      { value: "other", en: "Other", bn: "অন্যান্য" },
    ],
  },
];

const TOTAL_STEPS = ALL_FIELDS.length + 1;

function defaultValues(): Record<FieldKey, string> {
  return {
    ageGroup: "", occupation: "", educationLevel: "", gender: "",
    country: "", city: "", goal: "", preferredLearningTime: "",
    referralSource: "", communicationPreference: "whatsapp", budgetRange: "", religion: "",
  };
}

export default function OnboardingPage() {
  const { lang } = useLanguageStore();
  const router = useRouter();
  const [workerId, setWorkerId] = useState("");
  const [values, setValues] = useState<Record<FieldKey, string>>(defaultValues());
  const [suggestions, setSuggestions] = useState<Record<string, string | null>>({});
  const [pendingFields, setPendingFields] = useState<FieldKey[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [showInterests, setShowInterests] = useState(false);
  const [interestSaved, setInterestSaved] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const wid = localStorage.getItem("worker_id");
    if (!wid) { router.push("/login"); return; }
    setWorkerId(wid);

    (async () => {
      try {
        const [profRes, sugRes] = await Promise.all([
          fetch(`/api/workers/profile?workerId=${wid}`).then(r => r.json()),
          fetch("/api/profile/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId: wid }) }).then(r => r.json()),
        ]);

        const existing = profRes as Record<string, any>;
        const sug = sugRes as Record<string, any>;
        setSuggestions(sug);

        const vals = defaultValues();
        const missing: FieldKey[] = [];

        for (const field of ALL_FIELDS) {
          const existingVal = existing[field.key] as string | undefined;
          const suggestedVal = sug[field.key] as string | undefined;

          if (existingVal) {
            vals[field.key] = existingVal;
          } else {
            missing.push(field.key);
            vals[field.key] = suggestedVal || "";
          }
        }

        setValues(vals);

        const storedIdx = sessionStorage.getItem("onboarding_idx");
        if (missing.length > 0 && storedIdx) {
          const idx = parseInt(storedIdx);
          const savedHalfway = sessionStorage.getItem("onboarding_last_key");
          const savedField = ALL_FIELDS.find(f => f.key === savedHalfway);
          if (savedField && !existing[savedField.key]) {
            const fieldIdx = missing.indexOf(savedField.key as FieldKey);
            setCurrentIdx(fieldIdx >= 0 ? fieldIdx : 0);
          } else {
            setCurrentIdx(0);
          }
        } else {
          setCurrentIdx(0);
        }

        if (missing.length === 0 && existing.profileCompleted) {
          setDone(true);
        } else {
          setPendingFields(missing);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, [router]);

  const currentField = pendingFields[currentIdx];
  const fieldDef = currentField ? ALL_FIELDS.find(f => f.key === currentField) : null;
  const completedCount = TOTAL_STEPS - (pendingFields.length - currentIdx) - (showInterests ? 0 : 0);
  const progressPct = Math.round((completedCount / TOTAL_STEPS) * 100);

  const setValue = (key: FieldKey, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const saveCurrent = useCallback(async () => {
    if (!workerId || !currentField) return;
    const val = values[currentField];
    if (!val) return;

    setSaving(true);
    try {
      await fetch("/api/workers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, [currentField]: val }),
      });
      sessionStorage.setItem("onboarding_idx", String(currentIdx));
      sessionStorage.setItem("onboarding_last_key", currentField);
    } catch {} finally { setSaving(false); }
  }, [workerId, currentField, values, currentIdx]);

  const handleNext = async () => {
    await saveCurrent();

    if (currentIdx < pendingFields.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      sessionStorage.removeItem("onboarding_idx");
      sessionStorage.removeItem("onboarding_last_key");
      setShowInterests(true);
    }
  };

  const handleInterestDone = async () => {
    setSaving(true);
    try {
      for (const interest of interests) {
        await fetch("/api/track/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerId, eventType: "search", searchKeyword: interest, pageCategory: "onboarding" }),
        }).catch(() => {});
      }
      await fetch(`/api/track/score?workerId=${workerId}`, { method: "POST" }).catch(() => {});
      setInterestSaved(true);
    } catch {} finally { setSaving(false); }
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-action border-t-transparent rounded-full" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-gray-50">
        <div className="w-full max-w-lg animate-fade-up bg-white rounded-2xl p-6 shadow-xl border border-border text-center space-y-4 py-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-primary">{lang === "bn" ? "প্রোফাইল সম্পূর্ণ!" : "Profile Complete!"}</h2>
          <p className="text-sm text-text-secondary">{lang === "bn" ? "আপনার প্রোফাইল আগেই কমপ্লিট ছিল" : "Your profile was already complete"}</p>
          <button onClick={handleFinish} className="btn-primary w-full">{lang === "bn" ? "ড্যাশবোর্ডে যান" : "Go to Dashboard"}</button>
        </div>
      </div>
    );
  }

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
            {lang === "bn" ? "প্রত্যেকটি ধাপে একটি করে তথ্য দিন" : "One step at a time"}
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-action to-secondary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs font-bold text-action whitespace-nowrap">{progressPct}%</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-border">
          {!showInterests && fieldDef && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-text-secondary bg-gray-100 px-2 py-0.5 rounded-full">
                  {currentIdx + 1} / {pendingFields.length}
                </span>
              </div>
              <h2 className="text-lg font-bold text-primary">{lang === "bn" ? fieldDef.labelBn : fieldDef.labelEn}</h2>

              {fieldDef.type === "select" && fieldDef.options ? (
                <select
                  value={values[currentField]}
                  onChange={e => setValue(currentField, e.target.value)}
                  className="input-field text-base"
                >
                  <option value="">{lang === "bn" ? "নির্বাচন করুন" : "Select..."}</option>
                  {fieldDef.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {lang === "bn" ? opt.bn : opt.en}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={values[currentField]}
                  onChange={e => setValue(currentField, e.target.value)}
                  className="input-field text-base"
                  placeholder={lang === "bn" ? "আপনার উত্তর লিখুন" : "Type your answer"}
                />
              )}

              {suggestions[currentField] && !values[currentField] && (
                <p className="text-xs text-action/70">
                  {lang === "bn" ? "পরামর্শ" : "Suggested"}: {suggestions[currentField]}
                </p>
              )}

              <button
                onClick={handleNext}
                disabled={saving || !values[currentField]?.trim()}
                className="btn-primary w-full"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {lang === "bn" ? "সংরক্ষণ..." : "Saving..."}
                  </span>
                ) : (
                  lang === "bn" ? "পরবর্তী →" : "Next →"
                )}
              </button>
            </div>
          )}

          {showInterests && !interestSaved && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-primary">{lang === "bn" ? "আপনার আগ্রহ কী?" : "What are you interested in?"}</h2>
              <p className="text-sm text-text-secondary">{lang === "bn" ? "এক বা একাধিক সিলেক্ট করুন" : "Select one or more topics"}</p>
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_OPTIONS.map((opt) => {
                  const selected = interests.includes(opt.en);
                  return (
                    <button
                      key={opt.en}
                      onClick={() => setInterests(prev => prev.includes(opt.en) ? prev.filter(i => i !== opt.en) : [...prev, opt.en])}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selected ? "border-action bg-action/10" : "border-border hover:border-action/50"
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <p className="text-sm font-semibold text-primary mt-1">{lang === "bn" ? opt.bn : opt.en}</p>
                    </button>
                  );
                })}
              </div>
              <button onClick={handleInterestDone} disabled={saving || interests.length === 0} className="btn-primary w-full">
                {saving ? "..." : lang === "bn" ? "সম্পন্ন" : "Finish"}
              </button>
            </div>
          )}

          {interestSaved && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-primary">{lang === "bn" ? "শুরু করা যাক!" : "Let's Get Started!"}</h2>
              <p className="text-sm text-text-secondary">
                {lang === "bn" ? "আপনার প্রোফাইল কমপ্লিট। এখন আপনার জন্য ব্যক্তিগতকৃত অভিজ্ঞতা তৈরি করছি..." : "Profile complete! Personalizing your experience..."}
              </p>
              <button onClick={handleFinish} className="btn-primary w-full">
                {lang === "bn" ? "ড্যাশবোর্ডে যান" : "Go to Dashboard"}
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {ALL_FIELDS.slice(0, 6).map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i <= currentIdx && !showInterests && i < pendingFields.length ? "bg-action" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

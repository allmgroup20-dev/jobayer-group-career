"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang";
import { trackEvent } from "@/lib/tracking";
import { geoIndex, loadDistrict, loadCC, geoSlug, type GeoDivision, type GeoDistrictData, type GeoCC } from "@/lib/geo";
import { religionKeys, religionPath, religionOptions, religionLevels } from "@/lib/religions";

type Me = {
  workerId?: string;
  name?: string;
  phone?: string;
  email?: string;
  preferredLanguage?: string;
  ageGroup?: string;
  occupation?: string;
  educationLevel?: string;
  gender?: string;
  country?: string;
  city?: string;
  division?: string;
  district?: string;
  upazila?: string;
  cityCorporation?: string;
  ward?: string;
  area?: string;
  union?: string;
  pourashava?: string;
  goal?: string;
  preferredLearningTime?: string;
  referralSource?: string;
  communicationPreference?: string;
  budgetRange?: string;
  religion?: string;
  profileCompleted?: boolean;
};

type StepKey = "consent" | "whatsapp" | "basic" | "location" | "goals" | "source" | "done";

const STEP_ORDER: StepKey[] = ["consent", "whatsapp", "basic", "location", "goals", "source", "done"];

const OCCUPATIONS = [
  { en: "Student", bn: "ছাত্র/ছাত্রী", v: "student" },
  { en: "Job Seeker", bn: "চাকরি প্রার্থী", v: "job_seeker" },
  { en: "Employed (Private)", bn: "চাকরিজীবী (বেসরকারি)", v: "employed" },
  { en: "Government Job", bn: "সরকারি চাকরিজীবী", v: "govt_job" },
  { en: "Freelancer", bn: "ফ্রিল্যান্সার", v: "freelancer" },
  { en: "Content Creator / YouTuber", bn: "কনটেন্ট ক্রিয়েটর / ইউটিউবার", v: "content_creator" },
  { en: "Teacher", bn: "শিক্ষক/শিক্ষিকা", v: "teacher" },
  { en: "Doctor / Health Worker", bn: "ডাক্তার / স্বাস্থ্যকর্মী", v: "doctor" },
  { en: "Engineer / Technician", bn: "ইঞ্জিনিয়ার / টেকনিশিয়ান", v: "engineer" },
  { en: "Business", bn: "ব্যবসায়ী", v: "business" },
  { en: "Shopkeeper", bn: "দোকানদার", v: "shopkeeper" },
  { en: "Driver", bn: "চালক", v: "driver" },
  { en: "Farmer", bn: "কৃষক", v: "farmer" },
  { en: "Day Laborer", bn: "দিনমজুর / শ্রমিক", v: "day_laborer" },
  { en: "Homemaker", bn: "গৃহিণী", v: "homemaker" },
  { en: "Retired", bn: "অবসরপ্রাপ্ত", v: "retired" },
  { en: "Unemployed", bn: "বেকার", v: "unemployed" },
];

const EDUCATION_GROUPS: { label: { en: string; bn: string }; options: { en: string; bn: string; v: string }[] }[] = [
  {
    label: { en: "National Curriculum (Bangla Medium)", bn: "জাতীয় কারিকুলাম (বাংলা মাধ্যম)" },
    options: [
      { en: "PSC (Primary School Certificate)", bn: "পিএসসি (প্রাথমিক শিক্ষা সমাপনী)", v: "psc" },
      { en: "JSC (Junior School Certificate)", bn: "জেএসসি (জুনিয়র স্কুল সার্টিফিকেট)", v: "jsc" },
      { en: "SSC (Secondary School Certificate)", bn: "এসএসসি (মাধ্যমিক)", v: "ssc" },
      { en: "HSC (Higher Secondary Certificate)", bn: "এইচএসসি (উচ্চ মাধ্যমিক)", v: "hsc" },
    ],
  },
  {
    label: { en: "English Medium / English Version", bn: "ইংরেজি মাধ্যম / ইংরেজি ভার্সন" },
    options: [
      { en: "O-Level / IGCSE (SSC equivalent)", bn: "ও-লেভেল / আইজিসিএসই (এসএসসি সমতুল্য)", v: "olevel" },
      { en: "A-Level (HSC equivalent)", bn: "এ-লেভেল (এইচএসসি সমতুল্য)", v: "alevel" },
    ],
  },
  {
    label: { en: "Madrasa (Islamic) Education", bn: "মাদ্রাসা শিক্ষা" },
    options: [
      { en: "Ebtedayee (Primary equivalent)", bn: "এবতেদায়ী (প্রাথমিক সমতুল্য)", v: "ebtedayee" },
      { en: "Dakhil (SSC equivalent)", bn: "দাখিল (এসএসসি সমতুল্য)", v: "dakhil" },
      { en: "Alim (HSC equivalent)", bn: "আলিম (এইচএসসি সমতুল্য)", v: "alim" },
      { en: "Fazil (Bachelor's equivalent)", bn: "ফাযিল (স্নাতক সমতুল্য)", v: "fazil" },
      { en: "Kamil (Master's equivalent)", bn: "কামিল (স্নাতকোত্তর সমতুল্য)", v: "kamil" },
    ],
  },
  {
    label: { en: "Technical / Vocational (BTEB)", bn: "কারিগরি / ভোকেশনাল" },
    options: [
      { en: "SSC (Vocational)", bn: "এসএসসি (ভোকেশনাল)", v: "ssc_voc" },
      { en: "HSC (Vocational)", bn: "এইচএসসি (ভোকেশনাল)", v: "hsc_voc" },
      { en: "Diploma in Engineering", bn: "ডিপ্লোমা-ইন-ইঞ্জিনিয়ারিং", v: "diploma" },
    ],
  },
  {
    label: { en: "Higher Education", bn: "উচ্চশিক্ষা" },
    options: [
      { en: "Bachelor's (Honours/Pass)", bn: "স্নাতক (অনার্স/পাস)", v: "bachelor" },
      { en: "Master's", bn: "স্নাতকোত্তর", v: "master" },
      { en: "PhD", bn: "পিএইচডি", v: "phd" },
    ],
  },
  {
    label: { en: "Other", bn: "অন্যান্য" },
    options: [
      { en: "Only literate", bn: "শুধু স্বাক্ষর", v: "literate" },
      { en: "No formal education", bn: "কোনো আনুষ্ঠানিক শিক্ষা নেই", v: "none" },
    ],
  },
];

const GENDERS = [
  { en: "Male", bn: "পুরুষ", v: "male" },
  { en: "Female", bn: "মহিলা", v: "female" },
  { en: "Other", bn: "অন্যান্য", v: "other" },
];

const GOALS = [
  { en: "Build a Career", bn: "ক্যারিয়ার গড়তে", v: "career", e: "💼" },
  { en: "Start Freelancing", bn: "ফ্রিল্যান্সিং শুরু", v: "freelancing", e: "🌍" },
  { en: "Start a Business", bn: "ব্যবসা শুরু", v: "business", e: "📊" },
  { en: "Develop Skills", bn: "স্কিল ডেভেলপ", v: "skill", e: "🎯" },
  { en: "Get a Job", bn: "চাকরি পেতে", v: "job", e: "🕴️" },
  { en: "Become a Content Creator (YouTube/Facebook)", bn: "ইউটিউব/ফেসবুক কনটেন্ট ক্রিয়েটর", v: "content_creator", e: "🎬" },
  { en: "Extra Skill for Side Projects", bn: "অতিরিক্ত দক্ষতা (পাশাপাশি শেখা)", v: "extra_income", e: "💡" },
];

const DAILY_HOURS = [
  { en: "Less than 1 hour", bn: "১ ঘণ্টার কম", v: "lt_1h", e: "⏱️" },
  { en: "1 - 2 hours", bn: "১ - ২ ঘণ্টা", v: "1_2h", e: "📖" },
  { en: "2 - 3 hours", bn: "২ - ৩ ঘণ্টা", v: "2_3h", e: "📚" },
  { en: "More than 3 hours", bn: "৩ ঘণ্টার বেশি", v: "gt_3h", e: "🚀" },
];

const SOURCES = [
  { en: "Facebook", bn: "ফেসবুক", v: "facebook" },
  { en: "Google", bn: "গুগল", v: "google" },
  { en: "YouTube", bn: "ইউটিউব", v: "youtube" },
  { en: "WhatsApp", bn: "হোয়াটসঅ্যাপ", v: "whatsapp" },
  { en: "Friend/Family", bn: "বন্ধুর মাধ্যমে", v: "friend" },
  { en: "Other", bn: "অন্যান্য", v: "other" },
];

const CONTACT_PREFS = [
  { en: "WhatsApp", bn: "হোয়াটসঅ্যাপ", v: "whatsapp", e: "💬" },
  { en: "Email", bn: "ইমেইল", v: "email", e: "📧" },
  { en: "SMS", bn: "এসএমএস", v: "sms", e: "📱" },
];

const BUDGETS = [
  { en: "1 - 100 ৳", bn: "১ - ১০০ টাকা", v: "1_100" },
  { en: "100 - 300 ৳", bn: "১০০ - ৩০০ টাকা", v: "100_300" },
  { en: "300 - 500 ৳", bn: "৩০০ - ৫০০ টাকা", v: "300_500" },
  { en: "500 - 1,000 ৳", bn: "৫০০ - ১,০০০ টাকা", v: "500_1000" },
  { en: "1,000 - 2,000 ৳", bn: "১,০০০ - ২,০০০ টাকা", v: "1000_2000" },
  { en: "2,000 - 5,000 ৳", bn: "২,০০০ - ৫,০০০ টাকা", v: "2000_5000" },
  { en: "5,000 - 10,000 ৳", bn: "৫,০০০ - ১০,০০০ টাকা", v: "5000_10000" },
];

const INTERESTS = [
  { en: "YouTube Content Creation", bn: "ইউটিউব কনটেন্ট ক্রিয়েশন", icon: "🎬", goals: ["content_creator", "extra_income", "business"] },
  { en: "Facebook Content Creation & Page Monetization", bn: "ফেসবুক কনটেন্ট ও পেজ মনিটাইজেশন", icon: "📱", goals: ["content_creator", "extra_income", "business"] },
  { en: "Instagram & Reels", bn: "ইনস্টাগ্রাম ও রিলস", icon: "🎥", goals: ["content_creator", "extra_income"] },
  { en: "Video Editing", bn: "ভিডিও এডিটিং", icon: "🎬", goals: ["content_creator", "freelancing", "career", "skill"] },
  { en: "Photo Editing & Photography", bn: "ফটো এডিটিং ও ফটোগ্রাফি", icon: "📷", goals: ["content_creator", "freelancing"] },
  { en: "Social Media Management", bn: "সোশ্যাল মিডিয়া ম্যানেজমেন্ট", icon: "📲", goals: ["business", "content_creator", "extra_income"] },
  { en: "Podcasting", bn: "পডকাস্টিং", icon: "🎙️", goals: ["content_creator"] },
  { en: "Graphics Design", bn: "গ্রাফিক্স ডিজাইন", icon: "🎨", goals: ["freelancing", "career", "skill"] },
  { en: "UI/UX Design", bn: "ইউআই/ইউএক্স ডিজাইন", icon: "🧩", goals: ["career", "skill", "freelancing"] },
  { en: "Logo & Branding Design", bn: "লোগো ও ব্র্যান্ডিং ডিজাইন", icon: "✏️", goals: ["freelancing", "business"] },
  { en: "Motion Graphics & Animation", bn: "মোশন গ্রাফিক্স ও অ্যানিমেশন", icon: "🧊", goals: ["content_creator", "skill", "freelancing"] },
  { en: "Web Development", bn: "ওয়েব ডেভেলপমেন্ট", icon: "🌐", goals: ["career", "freelancing", "skill"] },
  { en: "Programming / Coding", bn: "প্রোগ্রামিং / কোডিং", icon: "💻", goals: ["career", "skill"] },
  { en: "App Development", bn: "অ্যাপ ডেভেলপমেন্ট", icon: "📱", goals: ["career", "freelancing", "skill"] },
  { en: "WordPress & Website", bn: "ওয়ার্ডপ্রেস ও ওয়েবসাইট", icon: "🖥️", goals: ["freelancing", "business", "career"] },
  { en: "Game Development", bn: "গেম ডেভেলপমেন্ট", icon: "🎮", goals: ["skill", "career"] },
  { en: "AI & ChatGPT", bn: "এআই ও চ্যাটজিপিটি", icon: "🤖", goals: ["career", "skill", "business"] },
  { en: "Ethical Hacking / Cyber Security", bn: "এথিক্যাল হ্যাকিং / সাইবার সিকিউরিটি", icon: "🔐", goals: ["career", "skill"] },
  { en: "Freelancing", bn: "ফ্রিল্যান্সিং", icon: "💼", goals: ["freelancing", "extra_income"] },
  { en: "Digital Marketing", bn: "ডিজিটাল মার্কেটিং", icon: "📢", goals: ["business", "freelancing", "career", "extra_income"] },
  { en: "Facebook / Instagram Ads", bn: "ফেসবুক / ইনস্টাগ্রাম অ্যাডস", icon: "📈", goals: ["business", "freelancing", "extra_income"] },
  { en: "SEO", bn: "এসইও", icon: "🔍", goals: ["business", "freelancing", "career"] },
  { en: "Affiliate Marketing", bn: "অ্যাফিলিয়েট মার্কেটিং", icon: "🔗", goals: ["extra_income", "business", "freelancing"] },
  { en: "E-commerce & Dropshipping", bn: "ই-কমার্স ও ড্রপশিপিং", icon: "🛒", goals: ["business", "extra_income", "freelancing"] },
  { en: "Amazon & Online Business", bn: "অ্যামাজন ও অনলাইন ব্যবসা", icon: "🛍️", goals: ["business", "extra_income"] },
  { en: "Content Writing & Blogging", bn: "কনটেন্ট রাইটিং ও ব্লগিং", icon: "✍️", goals: ["content_creator", "extra_income", "business"] },
  { en: "Online Course & Digital Product Selling", bn: "অনলাইন কোর্স ও ডিজিটাল প্রোডাক্ট সেলিং", icon: "📚", goals: ["business", "extra_income", "content_creator"] },
  { en: "English Learning / Spoken English", bn: "ইংলিশ লার্নিং / স্পোকেন ইংলিশ", icon: "🗣️", goals: ["job", "career", "freelancing"] },
  { en: "IELTS & Study Abroad", bn: "আইইএলটিএস ও বিদেশে পড়াশোনা", icon: "🎓", goals: ["job"] },
  { en: "Job Preparation (BCS / Bank)", bn: "চাকরির প্রস্তুতি (বিসিএস / ব্যাংক)", icon: "🏛️", goals: ["job"] },
  { en: "MS Office & Computer Basics", bn: "এমএস অফিস ও কম্পিউটার বেসিক", icon: "🖥️", goals: ["job", "career"] },
  { en: "Personal Development & Leadership", bn: "পার্সোনাল ডেভেলপমেন্ট ও লিডারশিপ", icon: "🌟", goals: ["career", "job", "extra_income"] },
];

const POPULAR_INTERESTS = [
  "YouTube Content Creation",
  "Facebook Content Creation & Page Monetization",
  "Instagram & Reels",
  "Video Editing",
  "Freelancing",
  "Digital Marketing",
  "Graphics Design",
  "Web Development",
  "AI & ChatGPT",
  "Social Media Management",
  "English Learning / Spoken English",
  "E-commerce & Dropshipping",
];

const INCOME_SECTORS = [
  { en: "YouTube Content", bn: "ইউটিউব কনটেন্ট ক্রিয়েশন", icon: "🎬", v: "youtube_content" },
  { en: "Facebook Content & Page Monetization", bn: "ফেসবুক কনটেন্ট ও পেজ মনিটাইজেশন", icon: "📱", v: "facebook_content" },
  { en: "Freelancing", bn: "ফ্রিল্যান্সিং", icon: "💼", v: "freelancing" },
  { en: "E-commerce & Online Business", bn: "ই-কমার্স ও অনলাইন ব্যবসা", icon: "🛒", v: "ecommerce" },
  { en: "Affiliate Marketing", bn: "অ্যাফিলিয়েট মার্কেটিং", icon: "📢", v: "affiliate" },
  { en: "Social Media Management", bn: "সোশ্যাল মিডিয়া ম্যানেজমেন্ট", icon: "📲", v: "social_media" },
  { en: "Digital Skills", bn: "ডিজিটাল স্কিল (গ্রাফিক্স, ভিডিও, কোডিং)", icon: "🎨", v: "digital_skills" },
  { en: "Online Courses & Products", bn: "অনলাইন কোর্স ও ডিজিটাল প্রোডাক্ট", icon: "📚", v: "online_courses" },
];

const STEP_META: Record<StepKey, { en: string; bn: string; emoji: string }> = {
  consent: { en: "Permission", bn: "অনুমতি", emoji: "🔒" },
  whatsapp: { en: "WhatsApp Number", bn: "হোয়াটসঅ্যাপ নাম্বার", emoji: "💬" },
  basic: { en: "Basic Info", bn: "ব্যক্তিগত তথ্য", emoji: "👤" },
  location: { en: "Location", bn: "অবস্থান ও ভাষা", emoji: "📍" },
  goals: { en: "Goals & Interests", bn: "লক্ষ্য ও আগ্রহ", emoji: "🎯" },
  source: { en: "How You Found Us", bn: "উৎস ও যোগাযোগ", emoji: "📢" },
  done: { en: "Almost Done", bn: "প্রায় শেষ!", emoji: "🎉" },
};

export default function OnboardingPage() {
  const { lang } = useLang();
  const router = useRouter();
  const t = (bn: string, en: string) => (lang === "bn" ? bn : en);

  const [stepIdx, setStepIdx] = useState(0);
  const [loadingInit, setLoadingInit] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [showAllInterests, setShowAllInterests] = useState(false);

  const [geoDivisions, setGeoDivisions] = useState<GeoDivision[]>([]);
  const [districtData, setDistrictData] = useState<GeoDistrictData | null>(null);
  const [ccData, setCcData] = useState<GeoCC | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);

  const [form, setForm] = useState({
    workerId: "",
    name: "",
    phone: "",
    email: "",
    gender: "",
    ageGroup: "",
    occupation: "",
    educationLevel: "",
    country: "বাংলাদেশ",
    city: "",
    division: "",
    district: "",
    upazila: "",
    cityCorporation: "",
    ward: "",
    area: "",
    union: "",
    pourashava: "",
    religion: "",
    preferredLanguage: "bn",
    goal: "",
    interests: [] as string[],
    incomeSectors: [] as string[],
    preferredLearningTime: "",
    budgetRange: "",
    referralSource: "",
    communicationPreference: "whatsapp",
  });

  const step = STEP_ORDER[stepIdx];
  const total = STEP_ORDER.length;
  const progress = Math.round((stepIdx / (total - 1)) * 100);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() as Promise<Me> : Promise.resolve(null)))
      .then((data) => {
        if (!data?.workerId) { window.location.href = "/"; return; }
        setForm((prev) => ({
          ...prev,
          workerId: data.workerId || "",
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          gender: data.gender || "",
          ageGroup: data.ageGroup || "",
          occupation: data.occupation || "",
          educationLevel: data.educationLevel || "",
          country: "বাংলাদেশ",
          city: data.upazila || data.cityCorporation || data.city || "",
          division: data.division || "",
          district: data.district || "",
          upazila: data.upazila || "",
          cityCorporation: data.cityCorporation || "",
          ward: data.ward || "",
          area: data.area || "",
          union: data.union || "",
          pourashava: data.pourashava || "",
          religion: data.religion || "",
          preferredLanguage: data.preferredLanguage || "bn",
          goal: data.goal || "",
          preferredLearningTime: data.preferredLearningTime || "",
          referralSource: data.referralSource || "",
          communicationPreference: data.communicationPreference || "whatsapp",
          budgetRange: data.budgetRange || "",
        }));
        if (data.profileCompleted) {
          router.replace("/complete");
          return;
        }
      })
      .catch(() => {})
      .finally(() => setLoadingInit(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lazy-load the division/district index from the CDN edge (free static asset).
  useEffect(() => {
    let active = true;
    geoIndex()
      .then((data) => { if (active) setGeoDivisions(data.divisions); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Load the district detail (upazilas + CCs) when a district is chosen.
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

  // Load the CC detail (wards -> areas) when a CC is chosen.
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

  const api = async (path: string, body: Record<string, unknown>) => {
    const res = await fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) throw new Error(data.error || "Failed");
  };

  const update = (k: string, v: unknown) => setForm((prev) => ({ ...prev, [k]: v }));

  const validate = (): string => {
    switch (step) {
      case "whatsapp": {
        const digits = form.phone.replace(/\D/g, "");
        if (digits.length < 10) return t("সঠিক হোয়াটসঅ্যাপ নাম্বার দিন", "Enter a valid WhatsApp number");
        return "";
      }
      case "basic":
        if (!form.name.trim()) return t("আপনার নাম লিখুন", "Enter your name");
        if (!form.gender) return t("লিঙ্গ নির্বাচন করুন", "Select your gender");
        if (!form.ageGroup) return t("বয়স গ্রুপ নির্বাচন করুন", "Select your age group");
        if (!form.occupation) return t("পেশা নির্বাচন করুন", "Select your occupation");
        if (!form.educationLevel) return t("শিক্ষাগত যোগ্যতা নির্বাচন করুন", "Select your education level");
        return "";
      case "location":
        if (!form.division) return t("বিভাগ নির্বাচন করুন", "Select your division");
        if (!form.district) return t("জেলা নির্বাচন করুন", "Select your district");
        if (form.cityCorporation) {
          if (!form.ward) return t("ওয়ার্ড নির্বাচন করুন", "Select your ward");
          const areas = ccData?.wards.find((w) => String(w.n) === form.ward)?.areas;
          if (areas && areas.length > 0 && !form.area) return t("এলাকা নির্বাচন করুন", "Select your area");
        } else {
          if (!form.upazila) return t("উপজেলা / থানা নির্বাচন করুন", "Select your upazila / thana");
          if (!form.union && !form.pourashava) return t("ইউনিয়ন / পৌরসভা নির্বাচন করুন", "Select your union / pourashava");
          if (form.pourashava && !form.ward) return t("ওয়ার্ড নির্বাচন করুন", "Select your ward");
        }
        if (!religionKeys(form.religion).length) return t("ধর্ম নির্বাচন করুন", "Select your religion");
        return "";
      case "goals":
        if (!form.goal) return t("আপনার লক্ষ্য নির্বাচন করুন", "Select your goal");
        if (!form.preferredLearningTime) return t("পড়ার সময় নির্বাচন করুন", "Select preferred time");
        if (!form.budgetRange) return t("বাজেট নির্বাচন করুন", "Select your budget");
        return "";
      case "source":
        if (!form.referralSource) return t("কীভাবে জানলেন নির্বাচন করুন", "Select how you found us");
        return "";
      default:
        return "";
    }
  };

  const next = async () => {
    setError(""); setSaved("");
    const v = validate();
    if (v) { setError(v); return; }
    setBusy(true);
    try {
      switch (step) {
        case "consent":
          await fetch("/api/consent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consentType: "onboarding", isGranted: 1 }) }).catch(() => {});
          if (form.incomeSectors.length > 0) {
            await fetch("/api/interests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ interests: form.incomeSectors }) }).catch(() => {});
          }
          break;
        case "whatsapp":
          await api("/api/profile", { phone: form.phone });
          break;
        case "basic":
          await api("/api/profile", { name: form.name.trim(), gender: form.gender, ageGroup: form.ageGroup, occupation: form.occupation, educationLevel: form.educationLevel });
          break;
        case "location":
          await api("/api/profile", {
            country: "বাংলাদেশ",
            city: form.cityCorporation || form.upazila,
            division: form.division,
            district: form.district,
            upazila: form.upazila,
            cityCorporation: form.cityCorporation,
            ward: form.ward,
            area: form.area,
            union: form.union,
            pourashava: form.pourashava,
            religion: form.religion,
            preferredLanguage: form.preferredLanguage,
          });
          break;
        case "goals":
          await api("/api/profile", { goal: form.goal, preferredLearningTime: form.preferredLearningTime, budgetRange: form.budgetRange });
          if (form.interests.length > 0) {
            await fetch("/api/interests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ interests: form.interests }) }).catch(() => {});
          }
          break;
        case "source":
          await api("/api/profile", { referralSource: form.referralSource, communicationPreference: form.communicationPreference });
          break;
        case "done":
          router.push("/complete");
          return;
      }
      trackEvent("onboarding_step_complete", { pageCategory: "onboarding", metadata: { step } });
      setStepIdx((i) => Math.min(i + 1, total - 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("কিছু একটা সমস্যা হয়েছে", "Something went wrong"));
    } finally {
      setBusy(false);
    }
  };

  const back = () => {
    setError(""); setSaved("");
    setStepIdx((i) => Math.max(i - 1, 0));
  };

  if (loadingInit) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-pink/20 border-t-pink rounded-full animate-spin" />
      </main>
    );
  }

  const meta = STEP_META[step];

  const label = (bn: string, en: string) => (
    <label className="block text-xs font-black uppercase tracking-wide text-ink-soft mb-2">{t(bn, en)}</label>
  );

  const Pick = ({ options, value, onPick, cols = 2 }: { options: { v: string; en: string; bn: string; e?: string }[]; value: string; onPick: (v: string) => void; cols?: number }) => (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onPick(o.v)}
            className={`chip justify-center ${active
              ? "bg-gradient-to-r from-excite to-pink text-white shadow-lg shadow-pink/25"
              : "bg-white border border-line text-ink hover:border-pink/50"}`}
          >
            {o.e ? <span>{o.e}</span> : null} {t(o.bn, o.en)}
          </button>
        );
      })}
    </div>
  );

  return (
    <main className="min-h-screen px-4 pt-20 pb-8">
      <div className="max-w-lg mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wide text-ink-soft">
              {meta.emoji} {t(meta.bn, meta.en)}
            </span>
            <span className="text-xs font-black text-pink">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-line overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-excite via-pink to-violet transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="card-pop animate-pop-in !p-6 md:!p-8">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-sm font-bold text-red-600">
              ⚠️ {error}
            </div>
          )}
          {saved && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-teal-50 border border-teal-200 text-sm font-bold text-teal-600">
              ✅ {saved}
            </div>
          )}

          {/* consent */}
          {step === "consent" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-gold to-pink flex items-center justify-center text-3xl shadow-lg shadow-pink/25 animate-wiggle">🔒</div>
              <h1 className="text-2xl font-black text-brand">{t("সবকিছু এক বাটনে সম্মতি", "Grant Everything in One Tap")}</h1>
              <p className="text-sm text-ink-soft">{t("এক ক্লিকে উন্নত অভিজ্ঞতা", "One tap for the best experience")}</p>

              {/* Learning goal */}
              <div className="text-left pt-1">
                <p className="text-sm font-black text-brand">🎯 {t("আপনার শেখার লক্ষ্য", "Your Learning Goal")}</p>
                <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                  {t(
                    "আপনি ইউটিউব, ফ্রিল্যান্সিং বা অনলাইন ব্যবসা — এই ধরনের স্কিল শিখতে আগ্রহী বলেই আমাদের সাথে যুক্ত হয়েছেন। কোনগুলোতে আগ্রহ, একাধিক বাছাই করতে পারেন।",
                    "You joined to learn skills in YouTube, freelancing or online business. Select all that interest you."
                  )}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {INCOME_SECTORS.map((s) => {
                    const active = form.incomeSectors.includes(s.v);
                    return (
                      <button
                        key={s.v}
                        type="button"
                        onClick={() => {
                          update("incomeSectors", active ? form.incomeSectors.filter((i) => i !== s.v) : [...form.incomeSectors, s.v]);
                          trackEvent("interest_select", { pageCategory: "onboarding", searchKeyword: s.en, metadata: { action: active ? "deselect" : "select", group: "income_sector", value: s.v } });
                        }}
                        className={`chip justify-center ${active ? "bg-gradient-to-r from-excite to-pink text-white shadow-lg shadow-pink/25" : "bg-white border border-line text-ink hover:border-pink/50"}`}
                      >
                        <span>{s.icon}</span> {t(s.bn, s.en)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* whatsapp */}
          {step === "whatsapp" && (
            <div className="space-y-4">
              <Header emoji="💬" title={t("হোয়াটসঅ্যাপ নাম্বার দিন", "Enter WhatsApp Number")} sub={t("যেকোনো প্রয়োজনে আমরা এই হোয়াটসঅ্যাপ নাম্বারেই আপনার সাথে যোগাযোগ করব", "We'll reach out to you on this WhatsApp number whenever needed.")} />
              <div>
                {label("হোয়াটসঅ্যাপ নাম্বার *", "WhatsApp Number *")}
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="input-field"
                />
                <p className="mt-1 text-[11px] text-ink-soft">🇧🇩 {t("উদাহরণ: 01712345678", "Example: 01712345678")}</p>
              </div>
            </div>
          )}

          {/* basic */}
          {step === "basic" && (
            <div className="space-y-4">
              <Header emoji="👤" title={t("ব্যক্তিগত তথ্য", "Basic Information")} sub={t("আপনার সম্পর্কে জানুন", "Tell us about yourself")} />
              <div>
                {label("আপনার নাম *", "Your Name *")}
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="input-field" placeholder={t("আপনার পূর্ণ নাম", "Your full name")} />
              </div>
              <div>
                {label("লিঙ্গ *", "Gender *")}
                <Pick options={GENDERS} value={form.gender} onPick={(v) => update("gender", v)} cols={3} />
              </div>
              <div>
                {label("বয়স *", "Age *")}
                <select value={form.ageGroup} onChange={(e) => update("ageGroup", e.target.value)} className="input-field">
                  <option value="">{t("বয়স নির্বাচন করুন", "Select age...")}</option>
                  {Array.from({ length: 94 }, (_, i) => i + 7).map((age) => (
                    <option key={age} value={String(age)}>{age}</option>
                  ))}
                </select>
              </div>
              <div>
                {label("পেশা *", "Occupation *")}
                <Pick options={OCCUPATIONS} value={form.occupation} onPick={(v) => update("occupation", v)} />
              </div>
              <div>
                {label("শিক্ষাগত যোগ্যতা *", "Education Level *")}
                <select value={form.educationLevel} onChange={(e) => update("educationLevel", e.target.value)} className="input-field">
                  <option value="">{t("নির্বাচন করুন", "Select...")}</option>
                  {EDUCATION_GROUPS.map((group) => (
                    <optgroup key={group.label.en} label={t(group.label.bn, group.label.en)}>
                      {group.options.map((opt) => (
                        <option key={opt.v} value={opt.v}>{t(opt.bn, opt.en)}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* location */}
          {step === "location" && (
            <div className="space-y-4">
              <Header emoji="📍" title={t("অবস্থান ও ভাষা", "Location & Language")} sub={t("কোথায় আছেন জানান", "Let us know where you are")} />
              <div>
                {label("দেশ *", "Country *")}
                <div className="input-field flex items-center justify-between">
                  <span>🇧🇩 {t("বাংলাদেশ", "Bangladesh")}</span>
                  <span className="text-[11px] font-bold text-teal">{t("অটো সিলেক্টেড", "Auto-selected")}</span>
                </div>
              </div>
              <div>
                {label("বিভাগ *", "Division *")}
                <select
                  value={form.division}
                  onChange={(e) => { update("division", e.target.value); update("district", ""); update("upazila", ""); update("union", ""); update("pourashava", ""); update("ward", ""); update("area", ""); update("cityCorporation", ""); update("city", ""); }}
                  className="input-field"
                >
                  <option value="">{t("বিভাগ নির্বাচন করুন", "Select division...")}</option>
                  {geoDivisions.map((d) => (
                    <option key={d.id} value={d.en}>{t(d.bn, d.en)}</option>
                  ))}
                </select>
              </div>
              {form.division && (
                <div>
                  {label("জেলা *", "District *")}
                  <select
                    value={form.district}
                    onChange={(e) => { update("district", e.target.value); update("upazila", ""); update("union", ""); update("pourashava", ""); update("ward", ""); update("area", ""); update("cityCorporation", ""); update("city", ""); }}
                    className="input-field"
                  >
                    <option value="">{t("জেলা নির্বাচন করুন", "Select district...")}</option>
                    {geoDivisions.find((d) => d.en === form.division || d.id === form.division)?.districts.map((di) => (
                      <option key={di.id} value={di.en}>{t(di.bn, di.en)}</option>
                    ))}
                  </select>
                </div>
              )}
              {form.division && form.district && geoBusy && (
                <div className="text-sm text-ink-soft flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-line border-t-pink rounded-full animate-spin" />
                  {t("লোড হচ্ছে...", "Loading...")}
                </div>
              )}
              {form.division && form.district && !geoBusy && districtData && districtData.cityCorporations.length > 0 && (
                <div>
                  {label("সিটি কর্পোরেশন", "City Corporation")}
                  <select
                    value={form.cityCorporation}
                    onChange={(e) => { update("cityCorporation", e.target.value); update("upazila", ""); update("union", ""); update("pourashava", ""); update("ward", ""); update("area", ""); update("city", e.target.value); }}
                    className="input-field"
                  >
                    <option value="">{t("নির্বাচন করুন", "Select...")}</option>
                    {districtData.cityCorporations.map((c) => (
                      <option key={c.id} value={c.en}>{t(c.bn, c.en)}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-ink-soft">{t("শহরের ভেতরে থাকলে সিটি কর্পোরেশন নির্বাচন করুন", "Pick a city corporation if you live inside the city")}</p>
                </div>
              )}
              {form.division && form.district && form.cityCorporation && !geoBusy && ccData && (
                <div>
                  {label("ওয়ার্ড *", "Ward *")}
                  <select
                    value={form.ward}
                    onChange={(e) => { update("ward", e.target.value); update("area", ""); }}
                    className="input-field"
                  >
                    <option value="">{t("ওয়ার্ড নির্বাচন করুন", "Select ward...")}</option>
                    {ccData.wards.map((w) => (
                      <option key={w.n} value={String(w.n)}>{t(`ওয়ার্ড ${w.n}`, `Ward ${w.n}`)}</option>
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
                        {label("এলাকা *", "Area *")}
                        <select value={form.area} onChange={(e) => update("area", e.target.value)} className="input-field">
                          <option value="">{t("এলাকা নির্বাচন করুন", "Select area...")}</option>
                          {areas.map((a) => (
                            <option key={a.en} value={a.en}>{t(a.bn || a.en, a.en)}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div>
                      {label("এলাকা / মহল্লা", "Area / Neighborhood")}
                      <input
                        type="text"
                        value={form.area}
                        onChange={(e) => update("area", e.target.value)}
                        className="input-field"
                        placeholder={t("আপনার এলাকার নাম লিখুন", "Type your area name")}
                      />
                    </div>
                  );
                })()
              )}
              {form.division && form.district && form.cityCorporation && (
                <div className="text-[11px] text-ink-soft -mt-2">
                  {t("অথবা নিচে উপজেলা নির্বাচন করে গ্রাম/মফস্বল এলাকা দিন", "Or pick an upazila below for a village/rural area")}
                </div>
              )}
              {form.division && form.district && districtData && (
                <div>
                  {label("উপজেলা / থানা", "Upazila / Thana")}
                  <select
                    value={form.upazila}
                    onChange={(e) => { update("upazila", e.target.value); update("union", ""); update("pourashava", ""); update("ward", ""); update("area", ""); update("city", e.target.value); }}
                    className="input-field"
                  >
                    <option value="">{t("উপজেলা / থানা নির্বাচন করুন", "Select upazila / thana...")}</option>
                    {districtData.upazilas.map((u) => (
                      <option key={u.id} value={u.en}>{t(u.bn, u.en)}</option>
                    ))}
                  </select>
                </div>
              )}
              {form.upazila && districtData && (() => {
                const upazila = districtData.upazilas.find((u) => u.en === form.upazila);
                if (!upazila) return null;
                return (
                  <div>
                    {label("ইউনিয়ন / পৌরসভা", "Union / Pourashava")}
                    <select
                      value={form.union || form.pourashava}
                      onChange={(e) => {
                        const v = e.target.value;
                        const isPourashava = upazila.pourashavas.some((p) => p.en === v);
                        update("union", isPourashava ? "" : v);
                        update("pourashava", isPourashava ? v : "");
                        update("ward", "");
                        update("area", "");
                      }}
                      className="input-field"
                    >
                      <option value="">{t("ইউনিয়ন / পৌরসভা নির্বাচন করুন", "Select union / pourashava...")}</option>
                      {upazila.unions.length > 0 && (
                        <optgroup label={t("ইউনিয়ন", "Union")}>
                          {upazila.unions.map((u) => (
                            <option key={"u" + u.en} value={u.en}>{t(u.bn, u.en)}</option>
                          ))}
                        </optgroup>
                      )}
                      {upazila.pourashavas.length > 0 && (
                        <optgroup label={t("পৌরসভা", "Pourashava")}>
                          {upazila.pourashavas.map((p) => (
                            <option key={"p" + p.en} value={p.en}>{t(p.bn, p.en)}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                );
              })()}
              {form.pourashava && (
                <div>
                  {label("ওয়ার্ড", "Ward")}
                  <select value={form.ward} onChange={(e) => { update("ward", e.target.value); update("area", ""); }} className="input-field">
                    <option value="">{t("ওয়ার্ড নির্বাচন করুন", "Select ward...")}</option>
                    {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={String(n)}>{t(`ওয়ার্ড ${n}`, `Ward ${n}`)}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-ink-soft">{t("এলাকা/মহল্লার নাম নিচে লিখুন", "Enter your area/neighborhood name below")}</p>
                </div>
              )}
              {(form.pourashava || form.union) && (
                <div>
                  {label("এলাকা / মহল্লা", "Area / Neighborhood")}
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => update("area", e.target.value)}
                    className="input-field"
                    placeholder={t("আপনার এলাকার নাম লিখুন", "Type your area name")}
                  />
                </div>
              )}
              <div>
                {label("ধর্ম *", "Religion *")}
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
                            update("religion", religionPath([...keys.slice(0, i), v]));
                          }}
                          className="input-field"
                        >
                          <option value="">{i === 0 ? t("ধর্ম নির্বাচন করুন", "Select religion...") : t("ভিতরের অংশ নির্বাচন করুন", "Select branch...")}</option>
                          {opts.map((o) => (
                            <option key={o.v} value={o.v}>{t(o.bn, o.en)}</option>
                          ))}
                        </select>
                      );
                    });
                  })()}
                </div>
              </div>
              <div>
                {label("পছন্দের ভাষা", "Preferred Language")}
                <Pick options={[{ v: "bn", en: "বাংলা", bn: "বাংলা" }, { v: "en", en: "English", bn: "English" }]} value={form.preferredLanguage} onPick={(v) => update("preferredLanguage", v)} cols={2} />
              </div>
            </div>
          )}

          {/* goals */}
          {step === "goals" && (
            <div className="space-y-4">
              <Header emoji="🎯" title={t("লক্ষ্য ও আগ্রহ", "Goals & Interests")} sub={t("আপনার জন্য সেরা অফার দেখাবো", "We'll show the best offers for you")} />
              <div>
                {label("আপনার লক্ষ্য কী? *", "What's your goal? *")}
                <Pick options={GOALS} value={form.goal} onPick={(v) => { update("goal", v); setShowAllInterests(false); }} />
              </div>
              <div>
                {label("আগ্রহ নির্বাচন করুন", "Select your interests")}
                {form.goal ? (
                  <p className="text-xs text-ink-soft mb-2">
                    {t("আপনার লক্ষ্যের সাথে মানানসই আগ্রহ দেখানো হয়েছে", "Showing interests that match your goal")}
                  </p>
                ) : (
                  <p className="text-xs text-ink-soft mb-2">
                    {t("প্রথমে আপনার লক্ষ্য বেছে নিন — তাহলে মানানসই আগ্রহ দেখাবো", "Pick your goal first — we'll show matching interests")}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {(form.goal ? (showAllInterests ? INTERESTS : INTERESTS.filter((o) => o.goals.includes(form.goal))) : (showAllInterests ? INTERESTS : INTERESTS.filter((o) => POPULAR_INTERESTS.includes(o.en)))).map((opt) => {
                    const active = form.interests.includes(opt.en);
                    return (
                      <button
                        key={opt.en}
                        type="button"
                        onClick={() => {
                          update("interests", active ? form.interests.filter((i) => i !== opt.en) : [...form.interests, opt.en]);
                          trackEvent("interest_select", { pageCategory: "onboarding", searchKeyword: opt.en, metadata: { action: active ? "deselect" : "select", group: "skill", value: opt.en } });
                        }}
                        className={`chip justify-center ${active ? "bg-gradient-to-r from-violet to-pink text-white shadow-lg shadow-pink/20" : "bg-white border border-line text-ink hover:border-pink/50"}`}
                      >
                        <span>{opt.icon}</span> {t(opt.bn, opt.en)}
                      </button>
                    );
                  })}
                </div>
                {!showAllInterests && (form.goal ? INTERESTS.filter((o) => o.goals.includes(form.goal)).length : INTERESTS.filter((o) => POPULAR_INTERESTS.includes(o.en)).length) < INTERESTS.length && (
                  <button type="button" onClick={() => setShowAllInterests(true)} className="mt-2 w-full text-sm font-semibold text-pink underline">
                    {t("+ সব আগ্রহ দেখুন", "+ Show all interests")}
                  </button>
                )}
                {showAllInterests && (
                  <button type="button" onClick={() => setShowAllInterests(false)} className="mt-2 w-full text-sm font-semibold text-ink-soft underline">
                    {t("− কম দেখান", "− Show less")}
                  </button>
                )}
              </div>
              <div>
                {label("প্রতিদিন শেখার সময় *", "Daily Study Time *")}
                <Pick options={DAILY_HOURS} value={form.preferredLearningTime} onPick={(v) => update("preferredLearningTime", v)} />
                <p className="text-xs text-ink-soft mt-1">{t("রেকর্ডেড কোর্স যেকোনো সময় দেখা যায় — আপনার সুবিধা অনুযায়ী পরামর্শ দেব", "Recorded courses can be watched anytime — we'll guide you by your schedule")}</p>
              </div>
              <div>
                {label("বাজেট (প্রতি কোর্সে) *", "Budget Range *")}
                <Pick options={BUDGETS} value={form.budgetRange} onPick={(v) => update("budgetRange", v)} />
              </div>
            </div>
          )}

          {/* source */}
          {step === "source" && (
            <div className="space-y-4">
              <Header emoji="📢" title={t("কীভাবে জানলেন?", "How Did You Find Us?")} sub={t("আমাদের মার্কেটিং উন্নত করতে সাহায্য করুন", "Help us improve our marketing")} />
              <div>
                {label("কীভাবে জানতে পেরেছেন? *", "How did you find us? *")}
                <Pick options={SOURCES} value={form.referralSource} onPick={(v) => update("referralSource", v)} />
              </div>
              <div>
                {label("যোগাযোগের মাধ্যম *", "Preferred Contact *")}
                <Pick options={CONTACT_PREFS} value={form.communicationPreference} onPick={(v) => update("communicationPreference", v)} />
              </div>
            </div>
          )}

          {/* done */}
          {step === "done" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-gold to-excite flex items-center justify-center text-3xl shadow-lg shadow-excite/25 animate-pulse-glow">🎉</div>
              <h1 className="text-2xl font-black text-brand">{t("প্রোফাইল কমপ্লিট!", "Profile Complete!")}</h1>
              <p className="text-sm text-ink-soft">{t("আপনার বোনাস রিসোর্স ও রেফারেল লিংক প্রস্তুত!", "Your bonus resources & referral link are ready!")}</p>
            </div>
          )}

          {/* Nav buttons */}
          <div className="mt-6 space-y-2">
            <button onClick={next} disabled={busy} className="btn-excite w-full">
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t("সেভ হচ্ছে...", "Saving...")}
                </span>
              ) : step === "done" ? (
                t("🚀 রেফারেল সেন্টারে যান", "🚀 Go to Referral Center")
              ) : step === "consent" ? (
                t("✅ সবকিছুতে সম্মতি ও পরবর্তী", "✅ Grant All & Continue")
              ) : (
                t("সংরক্ষণ ও পরবর্তী →", "Save & Next →")
              )}
            </button>
            {stepIdx > 0 && step !== "done" && (
              <button onClick={back} disabled={busy} className="btn-outline w-full">
                ← {t("পেছনে", "Back")}
              </button>
            )}
          </div>
        </div>

        {/* dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${i === stepIdx ? "w-6 bg-pink" : i < stepIdx ? "w-2.5 bg-excite" : "w-2.5 bg-line"}`} />
          ))}
        </div>
      </div>
    </main>
  );
}

function Header({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-violet to-pink flex items-center justify-center text-2xl shadow-lg shadow-pink/20 animate-floaty">{emoji}</div>
      <h1 className="mt-3 text-xl font-black text-brand">{title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{sub}</p>
    </div>
  );
}

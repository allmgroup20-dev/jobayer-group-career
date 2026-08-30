import { heroData, heroSectionBadgeBn, heroSectionBadgeEn, heroFeatureGridItems } from "@/data/home/hero";
import { faqs } from "@/data/home/faq";
import { testimonials, chatTestimonials, gridTestimonials, phpSliderTestimonials } from "@/data/home/testimonials";
import { courseCategories } from "@/data/home/courses";
import { trainers } from "@/data/home/trainers";
import { platforms } from "@/data/home/platforms";
import { trustBadges, trustSectionData } from "@/data/home/trust";
import { howItWorksSteps, howItWorksFooterNoteBn, howItWorksFooterNoteEn } from "@/data/home/how-it-works";
import { galleryImages, paymentGalleryText } from "@/data/home/gallery";
import { salaryNames, liveNotifText, liveSalaryText } from "@/data/home/salary";

export interface PricingTier {
  id: string;
  credits: number;
  retailPrice: number;
  offerPrice: number;
  floor: number;
  savings: number;
  popular: boolean;
}

export const DEFAULT_PRICING_TIERS: PricingTier[] = [
  { id: "one", credits: 1, retailPrice: 99, offerPrice: 99, floor: 89, savings: 0, popular: false },
  { id: "duo", credits: 2, retailPrice: 198, offerPrice: 198, floor: 179, savings: 0, popular: false },
  { id: "trio", credits: 3, retailPrice: 297, offerPrice: 220, floor: 200, savings: 26, popular: true },
  { id: "five", credits: 5, retailPrice: 495, offerPrice: 350, floor: 315, savings: 29, popular: false },
  { id: "ten", credits: 10, retailPrice: 990, offerPrice: 650, floor: 585, savings: 34, popular: false },
  { id: "twenty", credits: 20, retailPrice: 1980, offerPrice: 1200, floor: 1080, savings: 39, popular: false },
  { id: "fifty", credits: 50, retailPrice: 4950, offerPrice: 2800, floor: 2520, savings: 43, popular: false },
  { id: "hundred", credits: 100, retailPrice: 9900, offerPrice: 5200, floor: 4680, savings: 47, popular: false },
];

/**
 * JSON-safe default content for every editable site section.
 * These are the fallback values used when no admin override exists, and the
 * seed data written into `site_content` on first boot.
 */
export const SITE_CONTENT_DEFAULTS: Record<string, unknown> = {
  hero: {
    ...heroData,
    heroSectionBadge: { bn: heroSectionBadgeBn, en: heroSectionBadgeEn },
    heroFeatureGridItems,
  },
  faq: { faqs },
  testimonials: { testimonials, chatTestimonials, gridTestimonials, phpSliderTestimonials },
  course_preview: {
    courseCategories,
    trainers,
    platforms,
    platformTitleBn: "যেসব প্ল্যাটফর্মের কোর্স আপনি পাচ্ছেন",
    platformTitleEn: "Platforms Whose Courses You Get",
    platformSubtitleBn: "মোট {n}টি প্রতিষ্ঠানের কোর্স — সব একসাথে",
    platformSubtitleEn: "Courses from {n} platforms — all in one place",
  },
  trust: { trustBadges, trustSectionData },
  how_it_works: {
    steps: howItWorksSteps,
    footerNote: { bn: howItWorksFooterNoteBn, en: howItWorksFooterNoteEn },
  },
  gallery: { titleBn: paymentGalleryText.titleBn, titleEn: paymentGalleryText.titleEn, images: galleryImages },
  live_feed: { salaryNames, liveNotifText, liveSalaryText },
  pricing: { tiers: DEFAULT_PRICING_TIERS },
  // ── Join App (youtube.earner.workers.dev) — editable from company panel ──
  join_home: {
    heroBadgeBn: "এখনই জয়েন করুন",
    heroBadgeEn: "Join Now",
    heroTitleBn: "ইউটিউব আর্নার — আসল নিয়ম শিখুন, বাস্তব সার্টিফিকেট পান",
    heroTitleEn: "YouTube Earner — learn real rules, earn real certificates",
    heroSubtitleBn: "৯৭০+ রিসোর্স · ৩-টিয়ার সার্টিফিকেট · প্রমাণিত দক্ষতা",
    heroSubtitleEn: "970+ resources · 3-tier certificates · proven skills",
    heroDescBn: "ইউটিউব-এ বড় হওয়ার সঠিক পথ — আমরা গাইড করব ধাপে ধাপে। ফ্রি ডেমো ক্লাস দিয়ে আজই শুরু করুন।",
    heroDescEn: "The right path to grow on YouTube — we guide you step by step. Start today with a free demo class.",
    benefits: [
      { emoji: "🎁", bn: "বোনাস রিসোর্স", en: "Instant bonus resources" },
      { emoji: "💰", bn: "সার্টিফিকেট ও স্বীকৃতি", en: "Certificates & recognition" },
      { emoji: "📚", bn: "৯৭০+ প্রিমিয়াম রিসোর্স", en: "970+ premium resources" },
      { emoji: "🤝", bn: "বন্ধুর সাথে শিখুন, একসাথে সার্টিফিকেট অর্জন করুন", en: "Learn together & earn certificates together" },
    ],
    steps: [
      { n: "১", bn: "Google দিয়ে লগইন করুন", en: "Log in with Google" },
      { n: "২", bn: "প্রোফাইল সম্পূর্ণ করুন", en: "Complete your profile" },
      { n: "৩", bn: "শিখুন, রিসোর্স আনলক করুন ও সার্টিফিকেট অর্জন করুন", en: "Learn, unlock resources & earn certificates" },
    ],
    trustBadges: ["ফ্রি আজীবন", "প্রমাণিত", "৯৭০+ রিসোর্স", "সার্টিফিকেট"],
    faq: [
      { qBn: "এটা কি ফ্রি?", qEn: "Is it free?", aBn: "হ্যাঁ, জয়েন ফ্রি।", aEn: "Yes, joining is free." },
    ],
    showGoogleContacts: true,
  },
  join_tiers: {
    foundation: { icon: "🎓", labelBn: "ফাউন্ডেশন", labelEn: "Foundation", priceRangeBn: "৳১৫,০০০–৳৩০,০০০", priceRangeEn: "৳15,000–৳30,000" },
    ambassador: { icon: "🔗", labelBn: "অ্যাম্বাসেডর", labelEn: "Ambassador", priceRangeBn: "৳৩০,০০০–৳৬০,০০০", priceRangeEn: "৳30,000–৳60,000" },
    elite: { icon: "🏆", labelBn: "এলিট", labelEn: "Elite", priceRangeBn: "৳৬০,০০০–৳১২০,০০০+", priceRangeEn: "৳60,000–৳120,000+" },
    eliteBenefits: [
      { bn: "কমিটেড লার্নার স্বীকৃতি", en: "Committed Learner" },
      { bn: "যেকোনো চাকরিতে অগ্রাধিকার", en: "Priority in Any Job" },
      { bn: "জাতীয় + আন্তর্জাতিক স্বীকৃতি", en: "National + International" },
      { bn: "গাইডলাইন + ট্রেনিং", en: "Guideline + Training" },
      { bn: "কোর্স সুবিধা", en: "Course Benefit" },
      { bn: "১০০০+ নিয়োগ + মনিটাইজেশন", en: "1000 Hires + Monetization" },
      { bn: "সর্বোচ্চ এলিট সার্টিফিকেট", en: "Highest Elite Certificate" },
      { bn: "ইন্ডিয়া ট্যুর — কোম্পানি খরচে", en: "India Tour — company expense" },
      { bn: "বার্ষিক পুরস্কার — ৭০% জেতার সুযোগ", en: "Annual Prize — 70% win chance" },
    ],
    prizeLadder: [
      { amount: "১০ কোটি", winners: 1 }, { amount: "১ কোটি", winners: 3 }, { amount: "৫০ লাখ", winners: 10 },
      { amount: "১০ লাখ", winners: 50 }, { amount: "১ লাখ", winners: 140 }, { amount: "৫০ হাজার", winners: 200 },
      { amount: "১০ হাজার", winners: 300 }, { amount: "৫ হাজার", winners: 500 }, { amount: "১ হাজার", winners: 1000 },
    ],
  },
  join_certificate: {
    // 4 items within 2 USD (post) / 2.5 USD (home) — editable, sum validated
    costs: {
      printUsd: 0.6,
      printLabelBn: "ভালো কাগজে প্রিন্ট",
      printLabelEn: "Print on quality paper",
      packagingUsd: 0.4,
      packagingLabelBn: "প্যাকেজিং",
      packagingLabelEn: "Packaging",
      shippingUsd: 0.5,
      shippingEliteUsd: 1.0,
      shippingLabelBn: "ইন্ডিয়া থেকে বাংলাদেশ",
      shippingLabelEn: "Ship from India to Bangladesh",
      shippingEliteLabelBn: "সিঙ্গাপুর থেকে বাংলাদেশ",
      shippingEliteLabelEn: "Ship from Singapore to Bangladesh",
      postFeeUsd: 0.5,
      postLabelBn: "পোস্ট অফিস ফি",
      postLabelEn: "Post office fee",
      homeFeeUsd: 1.0,
      homeLabelBn: "হোম ডেলিভারি ফি",
      homeLabelEn: "Home delivery fee",
    },
    bundleHandlingUsd: 0.0,
    bundleNoteBn: "২/৩টি একসাথে — ডেলিভারি ফি একবার + ছাড়",
    bundleNoteEn: "2/3 bundle — single delivery fee + discount",
    usdRate: 111,
    marketRate: 124,
    tierDescriptions: {
      foundation: {
        typeBn: "ফাউন্ডেশন — কমিউনিটি বিল্ডিং ও ডিজিটাল মার্কেটিং-এর এন্ট্রি-লেভেল অভিজ্ঞতার সনদ।",
        typeEn: "Foundation — entry-level certificate of community-building and digital marketing.",
        whereBn: "ডিজিটাল মার্কেটিং এসিস্ট্যান্ট, কমিউনিটি ম্যানেজার, সেলস/প্রমোশন",
        whereEn: "Digital marketing assistant, community manager, sales/promotion",
        careerBn: "এন্ট্রি-লেভেল ভূমিকায় আবেদন করতে পারবেন",
        careerEn: "You can apply for entry-level roles",
        trustBn: "Authorized Signatory + ইউনিক ID + QR",
        trustEn: "Authorized Signatory + unique ID + QR",
      },
      ambassador: {
        typeBn: "রেফারেল অ্যাম্বাসেডর — প্রিমিয়াম স্বীকৃতি।",
        typeEn: "Referral Ambassador — premium recognition.",
        whereBn: "ডিজিটাল মার্কেটিং এসিস্ট্যান্ট, কমিউনিটি ম্যানেজার, অ্যাফিলিয়েট",
        whereEn: "Digital marketing assistant, community manager, affiliate",
        careerBn: "মিড-লেভেল ভূমিকায় আবেদন করতে পারবেন",
        careerEn: "You can apply for mid-level roles",
        trustBn: "Country Manager (PREETI LOBANA) সই + QR",
        trustEn: "Signed by Country Manager (PREETI LOBANA) + QR",
      },
      elite: {
        typeBn: "Elite Final — সর্বোচ্চ সম্মান।",
        typeEn: "Elite Final — the highest honor.",
        whereBn: "টিম লিড, প্রজেক্ট ম্যানেজার, ডিজিটাল মার্কেটিং লিড",
        whereEn: "Team lead, project manager, digital marketing lead",
        careerBn: "লিডারশিপ ও এডভান্সড ভূমিকায় আবেদন করতে পারবেন",
        careerEn: "You can apply for leadership and advanced roles",
        trustBn: "৩ জন গ্লোবাল এক্সিকিউটিভ সই + QR",
        trustEn: "Signed by 3 global executives + QR",
      },
    },
  },
  join_onboarding: {
    occupations: ["ছাত্র/ছাত্রী","চাকরিজীবী","ব্যবসায়ী","ফ্রিল্যান্সার","গৃহিণী","বেকার","অন্যান্য"],
    educationGroups: ["PSC/JSC/SSC/HSC","O/A Level","Madrasa","BTEB Diploma","Higher"],
    goals: ["ইউটিউব থেকে আয়","ফ্রিল্যান্সিং","চাকরি","ব্যবসা","দক্ষতা","অন্যান্য"],
    interests: ["YouTube","Facebook","Digital Marketing","Video Editing","SEO","Content Creation"],
  },
  join_privacy: {
    lastUpdate: "27 Aug 2026",
    contactEmail: "support@youtube-earner.com",
    sections: [
      { titleBn: "আমরা কী সংগ্রহ করি", titleEn: "What we collect", bodyBn: "নাম, ফোন, ইমেইল", bodyEn: "Name, phone, email" },
    ],
  },
  join_global: {
    siteTitleBn: "ইউটিউব আর্নার — দক্ষতা শিখুন",
    siteTitleEn: "YouTube Earner — Learn Skills",
    siteUrl: "https://youtube.earner.workers.dev",
    helplineBn: "হেল্পলাইন",
    helplineEn: "Helpline",
  },
};

export type SiteSection = keyof typeof SITE_CONTENT_DEFAULTS;
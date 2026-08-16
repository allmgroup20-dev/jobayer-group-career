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
};

export type SiteSection = keyof typeof SITE_CONTENT_DEFAULTS;
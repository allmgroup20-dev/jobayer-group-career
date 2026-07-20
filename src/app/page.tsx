"use client";

import dynamic from "next/dynamic";
import LiveNotificationBar from "@/components/home/LiveNotificationBar";
import HeroSection from "@/components/home/HeroSection";

const PersonalizedSection = dynamic(() => import("@/components/home/PersonalizedSection").then(m => ({ default: m.PersonalizedSection })));
const StatsCounter = dynamic(() => import("@/components/home/StatsCounter"));
const MenuPreviewSection = dynamic(() => import("@/components/home/MenuPreviewSection"));
const HowItWorks = dynamic(() => import("@/components/home/HowItWorks"));
const Testimonials = dynamic(() => import("@/components/home/Testimonials"));
const FAQSection = dynamic(() => import("@/components/home/FAQSection"));
const TrustSection = dynamic(() => import("@/components/home/TrustSection"));

export default function HomePage() {
  return (
    <div className="bg-bg">
      <LiveNotificationBar />
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 md:space-y-16 pb-8 md:pb-16 relative z-20">
        <StatsCounter />
        <MenuPreviewSection />
        <HowItWorks />
        <Testimonials compact />
        <PersonalizedSection />
        <FAQSection />
        <TrustSection />
      </div>
    </div>
  );
}

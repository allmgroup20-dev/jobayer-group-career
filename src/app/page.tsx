"use client";

import LiveNotificationBar from "@/components/home/LiveNotificationBar";
import HeroSection from "@/components/home/HeroSection";
import { PersonalizedSection } from "@/components/home/PersonalizedSection";
import StatsCounter from "@/components/home/StatsCounter";
import MenuPreviewSection from "@/components/home/MenuPreviewSection";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import FAQSection from "@/components/home/FAQSection";
import TrustSection from "@/components/home/TrustSection";

export default function HomePage() {
  return (
    <div className="bg-bg">
      <LiveNotificationBar />
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-8 md:pb-12 relative z-20">
        <PersonalizedSection />
        <StatsCounter />
        <MenuPreviewSection />
        <HowItWorks />
        <Testimonials compact />
        <FAQSection />
        <TrustSection />
      </div>
    </div>
  );
}

"use client";

import LiveNotificationBar from "@/components/home/LiveNotificationBar";
import HeroSection from "@/components/home/HeroSection";
import StatsCounter from "@/components/home/StatsCounter";
import HowItWorks from "@/components/home/HowItWorks";
import CourseCatalog from "@/components/home/CourseCatalog";
import Testimonials from "@/components/home/Testimonials";
import SalaryTable from "@/components/home/SalaryTable";
import PaymentGallery from "@/components/home/PaymentGallery";
import FAQSection from "@/components/home/FAQSection";
import TrustSection from "@/components/home/TrustSection";

export default function HomePage() {
  return (
    <div className="bg-bg">
      <LiveNotificationBar />
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-8 md:pb-12 -mt-8 relative z-20">
        <StatsCounter />
        <HowItWorks />
        <CourseCatalog />
        <Testimonials />
        <SalaryTable />
        <PaymentGallery />
        <FAQSection />
        <TrustSection />
      </div>
    </div>
  );
}

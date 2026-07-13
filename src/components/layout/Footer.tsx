"use client";

import Link from "next/link";
import { useLanguageStore } from "@/lib/store";

export default function Footer() {
  const { lang } = useLanguageStore();

  return (
    <footer className="gradient-primary text-white pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                JG
              </div>
              <div>
                <span className="font-bold text-lg">Jobayer</span>
                <span className="text-secondary font-bold"> Group</span>
                <span className="block text-xs text-white/60">Career</span>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-md">
              {lang === "bn"
                ? "জোবায়ের গ্রুপ ক্যারিয়ার একটি প্রিমিয়াম অ্যাফিলিয়েট মার্কেটিং এবং ই-কমার্স প্ল্যাটফর্ম যা আপনাকে আপনার ক্যারিয়ার গড়তে সাহায্য করে।"
                : "Jobayer Group Career is a premium affiliate marketing and e-commerce platform designed to help you build your career."}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/60">
              {lang === "bn" ? "দ্রুত লিংক" : "Quick Links"}
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { en: "Home", bn: "হোম", href: "/" },
                { en: "Courses", bn: "কোর্স সমূহ", href: "/courses" },
                { en: "Reviews", bn: "মতামত", href: "/reviews" },
                { en: "Trainers", bn: "প্রশিক্ষক", href: "/trainers" },
                { en: "FAQ", bn: "FAQ", href: "/faq" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="text-white/60 hover:text-secondary text-sm transition-colors">
                  {lang === "bn" ? item.bn : item.en}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/60">
              {lang === "bn" ? "যোগাযোগ" : "Contact"}
            </h3>
            <div className="flex flex-col gap-2.5 text-white/60 text-sm">
              <span>info@jobayergroup.com</span>
              <span>+880 1XXX-XXXXXX</span>
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Jobayer Group Career. {lang === "bn" ? "সর্বস্বত্ব সংরক্ষিত" : "All rights reserved."}
          </p>
          <div className="flex gap-4 text-white/40 text-xs">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

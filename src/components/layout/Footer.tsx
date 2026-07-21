"use client";

import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { CourseCount } from "@/components/ui/CourseCount";

export default function Footer() {
  const { lang } = useLanguageStore();

  const quickLinks = [
    { en: "Home", bn: "হোম", href: "/" },
    { en: "Resources", bn: "রিসোর্স সমূহ", href: "/courses" },
    { en: "Reviews", bn: "মতামত", href: "/reviews" },
    { en: "Live Updates", bn: "লাইভ", href: "/live-updates" },
    { en: "Login", bn: "লগইন", href: "/login" },
    { en: "Register", bn: "রেজিস্টার", href: "/register" },
  ];

  const supportLinks = [
    { en: "Privacy Policy", bn: "গোপনীয়তা নীতি", href: "/company/privacy" },
    { en: "Terms of Service", bn: "সেবার শর্তাবলী", href: "/terms" },
  ];

  return (
    <footer className="gradient-primary pb-20 md:pb-0 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "30px 30px" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-lg ring-2 ring-white/10">
                🚀
              </div>
              <span className="font-bold text-lg text-white">
                {lang === "bn" ? "জোবায়ের গ্রুপ ক্যারিয়ার" : "Jobayer Group Career"}
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm">
              {lang === "bn" ? "আপনার ক্যারিয়ার গড়ার বিশ্বস্ত প্ল্যাটফর্ম। " : "Your trusted career-building platform. "}
              <CourseCount />
              {lang === "bn" ? "+ রিসোর্স, ১২ জন বিশেষজ্ঞ প্রশিক্ষক, আজীবন অ্যাক্সেস।" : "+ resources, 12 expert trainers, lifetime access."}
            </p>
            <div className="flex gap-3">
              {["📘", "💬", "📱", "📧"].map((icon, i) => (
                <span key={i} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base hover:bg-white/10 transition-all cursor-pointer">
                  {icon}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              {lang === "bn" ? "দ্রুত লিংক" : "Quick Links"}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.en}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent/50" />
                    {lang === "bn" ? link.bn : link.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              {lang === "bn" ? "সাপোর্ট" : "Support"}
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.en}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent/50" />
                    {lang === "bn" ? link.bn : link.en}
                  </Link>
                </li>
              ))}
              <li className="text-sm text-white/40 mt-4 space-y-1">
                <p>{lang === "bn" ? "২৪/৭ সাপোর্ট" : "24/7 Support"}</p>
                <p className="text-white/60">support@jobayergroup.com</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} {lang === "bn" ? "জোবায়ের গ্রুপ ক্যারিয়ার" : "Jobayer Group Career"}. {lang === "bn" ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <Link href="/company/privacy" className="hover:text-white/60 transition-colors">
              {lang === "bn" ? "গোপনীয়তা" : "Privacy"}
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white/60 transition-colors">
              {lang === "bn" ? "শর্তাবলী" : "Terms"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

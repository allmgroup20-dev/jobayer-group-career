"use client";

import Link from "next/link";

const badges = [
  { icon: "🔒", text: "SSL সুরক্ষিত" },
  { icon: "✅", text: "২৪ ঘণ্টা টাকা ফেরত" },
  { icon: "⚡", text: "সাথে সাথে এক্সেস" },
  { icon: "📞", text: "২৪/৭ সাপোর্ট" },
];

export default function FinalCtaSection() {
  return (
    <div className="rounded-2xl p-6 md:p-8 text-center bg-gradient-to-br from-primary/5 via-orange-500/5 to-primary/5 border border-border shadow-lg">
      <div className="badge mx-auto mb-3 border-action/20 bg-action/10 text-action">🔒 বিশ্বাসযোগ্যতা ও নিরাপত্তা</div>

      <h2 className="text-xl md:text-2xl font-black text-text mb-2 leading-tight">
        ৩০ সেকেন্ডেই শুরু করুন আপনার আয়ের যাত্রা!
      </h2>
      <p className="text-sm md:text-base font-semibold text-text-secondary max-w-xl mx-auto mb-6 leading-relaxed">
        নিচে আপনার নাম-ফোন দিন, সাথে সাথেই সব কোর্স ও অ্যাক্সেস চলে আসবে!
      </p>

      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {badges.map((badge) => (
          <span key={badge.text} className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white border border-border font-extrabold text-sm shadow-sm text-text">
            {badge.icon} {badge.text}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <span className="px-3 py-1.5 rounded-full bg-info/10 text-info text-xs font-extrabold">⚡ ইতিমধ্যে ৮৬৬+ সক্রিয় শিক্ষার্থী যুক্ত</span>
        <span className="px-3 py-1.5 rounded-full bg-action/10 text-action text-xs font-extrabold">✅ ২৩০+ প্রিমিয়াম কোর্স</span>
        <span className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-extrabold">✅ লাইফটাইম অ্যাক্সেস</span>
        <span className="px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-extrabold">✅ ২৪ ঘণ্টা নিঃশর্ত ফেরত</span>
      </div>

      <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange to-orange-dark text-white font-bold text-lg shadow-xl shadow-orange/30 hover:shadow-orange/40 hover:-translate-y-0.5 transition-all duration-300 animate-pulse">
        🚀 এখনই রেজিস্টার করুন →
      </Link>
    </div>
  );
}

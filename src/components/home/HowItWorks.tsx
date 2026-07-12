"use client";

import Link from "next/link";

export default function HowItWorks() {
  return (
    <section className="max-w-[1120px] mx-auto mt-6 md:mt-8 px-3.5 md:px-5">
      <div className="rounded-[20px] p-[18px_16px_16px] md:p-[20px] bg-[linear-gradient(135deg,rgba(29,78,216,.06),rgba(29,78,216,.02))] border border-[rgba(29,78,216,.14)]">
        <div className="flex w-fit gap-2 px-4 py-2.5 mx-auto mb-3.5 rounded-full bg-[rgba(29,78,216,.08)] border border-[rgba(29,78,216,.15)] font-extrabold text-sm text-[#1E3A8A]">
          ⚙️ আয়ের সহজ ৩টি ধাপ
        </div>

        <h3 className="text-lg md:text-xl font-black text-[#1E293B] mb-4 text-center">আপনার আয়ের সহজ ৩টি উপায়:</h3>

        <div className="grid gap-3 md:gap-4 mb-4">
          {[
            {
              num: "১",
              icon: "📝",
              title: "অ্যাকাউন্ট খুলুন",
              desc: "মাত্র ৯৯ টাকা দিন। সাথে সাথেই সব কোর্স ও টুলস খুলে যাবে!",
              highlight: "⏱ ৩০ সেকেন্ড",
            },
            {
              num: "২",
              icon: "📢",
              title: "লিংক শেয়ার করুন",
              desc: "আপনার লিংক ফেসবুক ও হোয়াটসঅ্যাপে শেয়ার করুন। কোনো অভিজ্ঞতা লাগে না — সবকিছু রেডিমেড দেওয়া আছে!",
              highlight: "🎯 শুরু করুন আজই",
            },
            {
              num: "৩",
              icon: "💰",
              title: "টাকা তুলুন",
              desc: "আপনার লিংকে যতজন যুক্ত হবে, তত আয় সরাসরি বিকাশ/নগদে চলে আসবে!",
              highlight: "🟢 সরাসরি পেমেন্ট",
            },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-[14px] bg-white border border-[#E2E8F0] shadow-[0_6px_14px_rgba(0,0,0,.06)]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#FF6B35] flex items-center justify-center text-white font-black text-base flex-shrink-0">
                {step.num}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[#1E293B] mb-1">{step.icon} {step.title}</h4>
                <p className="text-xs text-[#475569] leading-[1.6]">
                  {step.desc} <span className="font-bold text-[#1D4ED8]">{step.highlight}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center p-3.5 rounded-[14px] bg-[rgba(255,191,0,.08)] border border-[rgba(255,191,0,.2)] font-bold text-sm text-[#92400E] leading-[1.7]">
          💡 আমাদের ৮৬৬+ শিক্ষার্থীর ৭২% ই প্রথম মাসেই আয় শুরু করেছেন! 🚀 আপনার পালা এখনই!
        </div>

        <div className="text-center mt-4">
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[14px] bg-gradient-to-r from-[#FF6B35] to-[#E85D2C] text-white font-black text-sm no-underline shadow-[0_12px_28px_rgba(234,88,12,.35)] hover:-translate-y-0.5 transition-all cursor-pointer">
            🚀 এখনই শুরু করুন →
          </Link>
        </div>
      </div>
    </section>
  );
}
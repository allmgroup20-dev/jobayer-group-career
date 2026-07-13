"use client";

import Link from "next/link";

export default function HowItWorks() {
  const steps = [
    {
      num: "১",
      icon: "📝",
      title: "বিনামূল্যে রেজিস্টার করুন",
      desc: "আপনার অ্যাকাউন্ট খুলুন। সাথে সাথেই সব কোর্স ও টুলস খুলে যাবে!",
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
  ];

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-br from-primary/5 to-primary/5 border border-primary/20">
      <div className="section-header">
        <div className="badge mx-auto mb-3">⚙️ আয়ের সহজ ৩টি ধাপ</div>
        <h3 className="text-lg md:text-xl font-black text-text">আপনার আয়ের সহজ ৩টি উপায়:</h3>
      </div>

      <div className="grid gap-3 md:gap-4 mb-4">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-border shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-orange flex items-center justify-center text-white font-black text-base flex-shrink-0">
              {step.num}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-text mb-1">{step.icon} {step.title}</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {step.desc} <span className="font-bold text-info">{step.highlight}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center p-3.5 rounded-xl bg-warning/10 border border-warning/20 font-bold text-sm text-warning leading-relaxed">
        💡 আমাদের ৮৬৬+ শিক্ষার্থীর ৭২% ই প্রথম মাসেই আয় শুরু করেছেন! 🚀 আপনার পালা এখনই!
      </div>

      <div className="text-center mt-4">
        <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange to-orange-dark text-white font-black text-sm no-underline shadow-lg shadow-orange/30 hover:-translate-y-0.5 transition-all cursor-pointer">
          🚀 এখনই রেজিস্টার করুন →
        </Link>
      </div>
    </div>
  );
}

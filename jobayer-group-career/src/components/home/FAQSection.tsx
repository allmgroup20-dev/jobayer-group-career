"use client";

import { useState } from "react";

const faqs = [
  { q: "💵 বিনামূল্যে রেজিস্টার করে কি সত্যিই অনলাইনে আয় করা সম্ভব?", a: "হ্যাঁ, সম্ভব। আমাদের ৮৬৬+ শিক্ষার্থী প্রমাণ করে সঠিক গাইড পেলে যে কেউ আয় করতে পারেন। মাসে ৫০,০০০+ টাকা আয় করা সম্ভব।" },
  { q: "🛡️ এটি কি কোনো স্ক্যাম বা ফেক প্রোগ্রাম?", a: "একেবারেই না। জোবায়ের গ্রুপ ৮+ বছর ধরে কাজ করছে। আমরা ২৪ ঘণ্টায় টাকা ফেরত দিই — কোনো প্রতারক কোম্পানি টাকা ফেরত দেয় না।" },
  { q: "📱 আমার কোনো পূর্ব অভিজ্ঞতা নেই — তবু কি পারব?", a: "অবশ্যই। আপনার শুধু দরকার একটি স্মার্টফোন বা ল্যাপটপ আর শেখার ইচ্ছা। বাকি সব — আমরা দিচ্ছি।" },
  { q: "💰 কত তাড়াতাড়ি আমি প্রথম পেমেন্ট পাব?", a: "বেশিরভাগ শিক্ষার্থী প্রথম মাসেই ১,১০০ - ৫,০০০+ টাকা আয় শুরু করেন। মাসে ৫০,০০০+ টাকা আয় করতে ৩-৬ মাস লাগতে পারে।" },
  { q: "🔄 কি মাসিক ফি দিতে হবে? নাকি একবারই দিলেই হবে?", a: "একবার রেজিস্টার করলেই আজীবন অ্যাক্সেস! কোনো মাসিক ফি নেই, কোনো লুকানো চার্জ নেই।" },
  { q: "📥 রেজিস্টার করার পর কীভাবে কোর্স অ্যাক্সেস পাব?", a: "রেজিস্টার করার ১ মিনিটের মধ্যে আপনার ইমেইলে ও হোয়াটসঅ্যাপে গুগল ড্রাইভ লিংক চলে যাবে।" },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
      <div className="section-header">
        <div className="badge mx-auto mb-3">🤔 আপনার মনে কি প্রশ্ন আছে?</div>
        <h3 className="text-lg md:text-xl font-black text-text">সচরাচর জিজ্ঞাসা</h3>
      </div>

      <div className="grid gap-2.5 max-w-3xl mx-auto">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl bg-bg border border-border overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              aria-expanded={openIdx === i}
              aria-controls={`faq-panel-${i}`}
              className="w-full flex items-center justify-between p-4 text-sm font-bold text-text bg-transparent border-none cursor-pointer text-left font-[inherit] hover:bg-primary/5 transition-colors"
            >
              <span>{faq.q}</span>
              <span className={`text-text-secondary text-xs transition-transform duration-200 ${openIdx === i ? "rotate-180" : ""}`}>▼</span>
            </button>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-button-${i}`}
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: openIdx === i ? "300px" : "0px", padding: openIdx === i ? "0 16px 16px" : "0 16px" }}
            >
              <p className="text-sm text-text-secondary leading-relaxed m-0">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

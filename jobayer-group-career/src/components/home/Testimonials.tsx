"use client";

import { useState, useEffect, useRef } from "react";

const testimonials = [
  {
    stars: "★★★★★", rating: "5.0/5",
    quote: "জোবায়ের গ্রুপের নির্দেশিকা আর সহায়তার কারণে আজ আমি নিজের ল্যাপটপ থেকে মাসে ২৫,০০০+ টাকা ইনকাম করছি।",
    author: "মিতা ইসলাম", label: "ফ্রিল্যান্সার, সিলেট",
  },
  {
    stars: "★★★★★", rating: "4.9/5",
    quote: "এই কোর্সটা আমাকে রিয়েল মার্কেটের জন্য প্রস্তুত করেছে। এখন নিয়মিত ক্লায়েন্ট পাচ্ছি। সবার কাছে রেকমেন্ড করব!",
    author: "নীলা হোসেন", label: "ডিজিটাল মার্কেটার, ঢাকা",
  },
  {
    stars: "★★★★★", rating: "5.0/5",
    quote: "৭ মাসে এখন মাসিক আয় ৪০,০০০+। সবচেয়ে বড় কথা, একটা সহায়ক কমিউনিটি পেয়েছি।",
    author: "রাফসান জামান", label: "ই-কমার্স আর্নার, চট্টগ্রাম",
  },
];

export default function Testimonials() {
  const [slideIdx, setSlideIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setSlideIdx((p) => (p + 1) % testimonials.length), 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const goTo = (n: number) => {
    setSlideIdx(n);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setSlideIdx((p) => (p + 1) % testimonials.length), 4000);
  };

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
      <div className="section-header">
        <div className="badge mx-auto mb-3 border-info/20 bg-info/10 text-info">💬 শিক্ষার্থীদের মতামত</div>
        <h3 className="text-lg md:text-xl font-black text-text">যারা ইতিমধ্যেই সফল হয়েছেন</h3>
      </div>

      <div className="overflow-hidden relative">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${slideIdx * 100}%)` }}>
          {testimonials.map((t, i) => (
            <div key={i} className="min-w-full px-2 box-border">
              <div className="p-6 md:p-7 rounded-xl bg-bg border border-border text-center">
                <div className="text-info text-xl mb-2.5">{t.stars} <span className="text-text-secondary text-sm font-bold">{t.rating}</span></div>
                <p className="text-sm text-text leading-relaxed mb-3.5 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="font-bold text-sm text-info">{t.author}</div>
                <div className="text-xs text-text-secondary font-semibold">{t.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-3.5">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`w-2.5 h-2.5 rounded-full border-none p-0 cursor-pointer transition-all ${i === slideIdx ? "bg-info scale-125" : "bg-border"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

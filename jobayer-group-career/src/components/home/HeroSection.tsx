"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function toBn(v: number | string) {
  return String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)]);
}

export default function HeroSection() {
  const [liveCount, setLiveCount] = useState(866);

  useEffect(() => {
    const id = setInterval(() => setLiveCount((p) => p + Math.floor(Math.random() * 3) + 1), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1121] via-[#111B33] to-[#0F1A2E]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-info/10 blur-[120px] animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-warning/10 blur-[100px] animate-blob" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] rounded-full bg-success/10 blur-[80px] animate-blob" style={{ animationDelay: "-6s" }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="text-center animate-fade-up">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white text-sm font-bold">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              {toBn(liveCount)}+ সক্রিয় শিক্ষার্থী
            </span>
          </div>

          <div className="inline-flex gap-2 px-4 py-2.5 mx-auto mb-3.5 rounded-full bg-primary/10 border border-primary/20 font-extrabold text-sm text-primary">
            💰 সরাসরি কাজ শিখে প্রথম মাসেই <span className="text-secondary font-black">১১,০০০</span> থেকে <span className="text-secondary font-black">৯২,০০০</span> টাকা পর্যন্ত উপার্জনের বাস্তবমুখী সুযোগ!
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-4">
            <span className="text-white">আপনার ক্যারিয়ার শুরু হোক আজই!</span>
            <br />
            <span className="bg-gradient-to-r from-info via-accent to-warning bg-clip-text text-transparent">
              ১০ লক্ষ টাকার ২৩০+ কোর্স
            </span>
            <br />
            <span className="text-white">সবকিছু একসাথে — আপনার জন্য!</span>
          </h1>

          <p className="text-base md:text-lg text-white/60 max-w-3xl mx-auto mb-8 leading-relaxed">
            দেশের সেরা ১২ জন প্রশিক্ষকের ২৩০টির বেশি কোর্স — আজীবনের জন্য। পছন্দ না হলে ২৪ ঘণ্টায় টাকা ফেরত।
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange to-orange-dark text-white font-bold text-lg shadow-xl shadow-orange/30 hover:shadow-orange/40 hover:-translate-y-0.5 transition-all duration-300">
              🚀 আপনার অ্যাকাউন্ট খুলুন এখনই →
            </Link>
          </div>

          <p className="text-sm text-white/60 font-medium">
            কোর্স ও আয়ের প্রজেক্ট পছন্দ না হলে ৭ দিনের মধ্যে কোনো প্রশ্ন ছাড়াই ১০০% টাকা ফেরত পাবেন।
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
    </section>
  );
}

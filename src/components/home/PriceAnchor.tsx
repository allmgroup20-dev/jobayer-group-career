"use client";

function toBnNum(v: number) {
  return String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)]);
}

export default function PriceAnchor() {
  const savings = 10000000 - 99;
  return (
    <div className="max-w-[1120px] mx-auto mt-6 md:mt-8 px-3.5 md:px-5 animate-fade-up">
      <div className="rounded-[20px] p-[18px_16px_16px] md:p-[20px] bg-[linear-gradient(135deg,rgba(255,191,0,.06),rgba(255,191,0,.02))] border border-[rgba(255,191,0,.2)] text-center">
        <div className="flex w-fit gap-2 px-4 py-2.5 mx-auto mb-3.5 rounded-full bg-[rgba(255,191,0,.1)] border border-[rgba(255,191,0,.2)] font-extrabold text-sm text-[#92400E]">
          🔥 ভ্যালু শক — নিজেই তুলনা করে দেখুন
        </div>

        <div className="font-semibold text-sm text-[#64748B] mb-1">
          ২৩০+ কোর্সের বাজারমূল্য: <s className="text-lg font-black text-[#94A3B8]">১০,০০,০০০+ টাকা</s>
        </div>

        <div className="text-xl md:text-2xl font-black text-[#1E293B] mb-2">
          আজকের অফার মূল্য: <span className="text-[#16A34A] text-2xl md:text-3xl">মাত্র ৯৯ টাকা</span>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(22,163,74,.1)] border border-[rgba(22,163,74,.2)] font-extrabold text-sm text-[#16A34A] mb-3">
          🟢 আপনি বাঁচাচ্ছেন: <strong>{toBnNum(savings)}+ টাকা!</strong>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-2">
          <span className="px-3 py-1.5 rounded-lg bg-[rgba(255,191,0,.08)] text-[##92400E] text-[11px] font-bold">টেন মিনিট স্কুল: ৮৫,০০০+ টাকা</span>
          <span className="px-3 py-1.5 rounded-lg bg-[rgba(255,191,0,.08)] text-[##92400E] text-[11px] font-bold">ঘুড়ি লার্নিং: ৫৫,০০০+ টাকা</span>
          <span className="px-3 py-1.5 rounded-lg bg-[rgba(255,191,0,.1)] text-[#92400E] text-[11px] font-bold border border-[rgba(255,191,0,.3)]">আমাদের অফার: মাত্র ৯৯ টাকা</span>
        </div>
      </div>
    </div>
  );
}
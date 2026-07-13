"use client";

export default function PriceAnchor() {
  return (
    <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-br from-warning/5 to-warning/5 border border-warning/20 text-center">
      <div className="badge border-warning/20 bg-warning/10 text-warning mx-auto mb-3">🔥 ভ্যালু শক — নিজেই তুলনা করে দেখুন</div>

      <div className="font-semibold text-sm text-text-secondary mb-1">
        ২৩০+ কোর্সের বাজারমূল্য: <s className="text-lg font-black text-text-secondary/50">১০,০০,০০০+ টাকা</s>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-3">
        <span className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-bold">টেন মিনিট স্কুল: ৮৫,০০০+ টাকা</span>
        <span className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-bold">ঘুড়ি লার্নিং: ৫৫,০০০+ টাকা</span>
        <span className="px-3 py-1.5 rounded-lg bg-warning/20 text-warning text-xs font-bold border border-warning/30">আমাদের প্যাকেজ: ২৩০+ কোর্স</span>
      </div>

      <div className="mt-4 p-4 rounded-2xl bg-info/5 border border-info/10">
        <p className="text-sm text-text-secondary font-semibold leading-relaxed">
          📊 <strong>১০ লক্ষ টাকার কোর্স!</strong> কোর্স পছন্দ না হলে ২৪ ঘণ্টার মধ্যে টাকা ফেরত — আপনার কোনো ঝুঁকি নেই, শুধু লাভ!
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "প্রাইভেসি পলিসি",
  description: "ইউটিউব আর্নার প্রাইভেসি পলিসি — আপনার তথ্য কীভাবে সংগ্রহ, ব্যবহার ও সুরক্ষিত করা হয়।",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen page-under-header px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-brand">প্রাইভেসি পলিসি</h1>
        <p className="mt-1 text-xs text-ink-soft">সর্বশেষ আপডেট: ২৭ আগস্ট ২০২৬</p>

        <div className="mt-6 space-y-6 text-sm leading-relaxed text-ink">
          <section className="card-pop">
            <h2 className="text-base font-black text-brand">১. আমরা কী তথ্য সংগ্রহ করি</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-soft">
              <li>Google লগইনের মাধ্যমে: নাম, ইমেইল, প্রোফাইল ছবি (যদি থাকে)</li>
              <li>আপনি যা দেন: ফোন নম্বর, লোকেশন, পেশা, শিক্ষা, লক্ষ্য, আগ্রহ</li>
              <li>ব্যবহার তথ্য: কোন পেজ দেখেছেন, কতক্ষণ ছিলেন (analytics)</li>
            </ul>
          </section>

          <section className="card-pop">
            <h2 className="text-base font-black text-brand">২. কেন সংগ্রহ করি</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-soft">
              <li>আপনার প্রোফাইল ও সার্টিফিকেট তৈরি করতে</li>
              <li>আপনার জন্য মানানসই রিসোর্স দেখাতে</li>
              <li>সাপোর্টে যোগাযোগ করতে (শুধু জরুরি প্রয়োজনে)</li>
            </ul>
          </section>

          <section className="card-pop">
            <h2 className="text-base font-black text-brand">৩. তথ্য কার সাথে শেয়ার করি</h2>
            <p className="mt-2 text-ink-soft">
              আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না। শুধু Cloudflare (হোস্টিং) ও Google (লগইন) এর
              মাধ্যমে নিরাপদে প্রসেস করা হয়। আইনি প্রয়োজনে ছাড়া কারো সাথে শেয়ার করা হয় না।
            </p>
          </section>

          <section className="card-pop">
            <h2 className="text-base font-black text-brand">৪. তথ্য সুরক্ষা</h2>
            <p className="mt-2 text-ink-soft">
              D1 ডাটাবেস এনক্রিপ্টেড, Google Auth 2.0 দিয়ে লগইন সুরক্ষিত। আপনি যেকোনো সময় ডাটা
              ডিলিটের অনুরোধ করতে পারেন — support@youtube-earner.com এ ইমেইল করুন।
            </p>
          </section>

          <section className="card-pop">
            <h2 className="text-base font-black text-brand">৫. কুকি ও ট্র্যাকিং</h2>
            <p className="mt-2 text-ink-soft">
              ভাষা পছন্দ (lang), সেশন আইডি ও analytics এর জন্য ছোট কুকি ব্যবহার করি। ব্রাউজার থেকে
              কুকি বন্ধ করতে পারেন, তবে লগইনে সমস্যা হতে পারে।
            </p>
          </section>

          <section className="card-pop">
            <h2 className="text-base font-black text-brand">৬. যোগাযোগ</h2>
            <p className="mt-2 text-ink-soft">
              প্রশ্ন থাকলে: <a href="mailto:support@youtube-earner.com" className="text-teal underline">support@youtube-earner.com</a> — WhatsApp সাপোর্ট সকাল ৯টা–রাত ৯টা।
            </p>
          </section>

          <a href="/" className="btn-outline w-full text-center">🏠 হোমে ফিরুন</a>
        </div>
      </div>
    </main>
  );
}

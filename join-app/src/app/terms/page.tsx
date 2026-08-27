import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "শর্তাবলী",
  description: "ইউটিউব আর্নার শর্তাবলী — ব্যবহারের নিয়ম, সার্টিফিকেট, পেমেন্ট ও দায়বদ্ধতা।",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen page-under-header px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-brand">শর্তাবলী</h1>
        <p className="mt-1 text-xs text-ink-soft">সর্বশেষ আপডেট: ২৭ আগস্ট ২০২৬</p>

        <div className="mt-6 space-y-6 text-sm leading-relaxed text-ink">
          <section className="card-pop">
            <h2 className="text-base font-black text-brand">১. প্ল্যাটফর্ম কী</h2>
            <p className="mt-2 text-ink-soft">
              ইউটিউব আর্নার একটি লার্নিং প্ল্যাটফর্ম — YouTube এর সঠিক নিয়ম, ফ্রিল্যান্সিং ও ডিজিটাল মার্কেটিং
              শেখায়। আমরা গ্যারান্টেড ইনকাম দেই না; দক্ষতা, রিসোর্স ও সার্টিফিকেট দেই।
            </p>
          </section>

          <section className="card-pop">
            <h2 className="text-base font-black text-brand">২. অ্যাকাউন্ট</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-soft">
              <li>একটি Google অ্যাকাউন্ট দিয়ে শুরু — আলাদা পাসওয়ার্ড দরকার নেই।</li>
              <li>ভুল তথ্য দিলে সার্টিফিকেট/ডেলিভারিতে সমস্যা হতে পারে — সঠিক তথ্য দিন।</li>
              <li>অ্যাকাউন্ট শেয়ার বা বিক্রি করা যাবে না।</li>
            </ul>
          </section>

          <section className="card-pop">
            <h2 className="text-base font-black text-brand">৩. সার্টিফিকেট</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-soft">
              <li>ফাউন্ডেশন: ৩০ শেয়ার/১০০% প্রগ্রেসে; অ্যাম্বাসেডর: ১১ রেফারেল + ৩ টাস্ক; এলিট: এলিট অ্যাক্সেস ফি-তে।</li>
              <li>প্রতিটি সার্টিফিকেটে ইউনিক ID ও QR — /certificate?id=... তে যাচাইযোগ্য।</li>
              <li>সার্টিফিকেটের নাম ৩০ দিন লক থাকে — একবার সেভ করলে ৩০ দিন পরিবর্তন করা যায় না।</li>
            </ul>
          </section>

          <section className="card-pop">
            <h2 className="text-base font-black text-brand">৪. পেমেন্ট ও ডেলিভারি</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-ink-soft">
              <li>অরিজিনাল কপি অর্ডার ঐচ্ছিক — ডিজিটাল সার্টিফিকেট সবসময় ফ্রি।</li>
              <li>ডেলিভারি ফি: প্রিন্ট+প্যাকেজিং+শিপিং সহ, কোনো হিডেন চার্জ নেই। রেট ১১১ টাকা/ডলার।</li>
              <li>পেমেন্ট SSLCommerz (bKash/Nagad/Card) দিয়ে — পেমেন্টের পর অর্ডার কনফার্ম।</li>
              <li>ভুল ঠিকানায় গেলে পুনরায় শিপিং খরচ প্রযোজ্য হতে পারে।</li>
            </ul>
          </section>

          <section className="card-pop">
            <h2 className="text-base font-black text-brand">৫. আচরণবিধি</h2>
            <p className="mt-2 text-ink-soft">
              স্প্যাম, ভুয়া রেফারেল, বা সিস্টেম অপব্যবহার করলে অ্যাকাউন্ট সীমিত হতে পারে। আমরা
              কমিউনিটি-ফ্রেন্ডলি শেয়ারিং উৎসাহিত করি — জোর করে নয়।
            </p>
          </section>

          <section className="card-pop">
            <h2 className="text-base font-black text-brand">৬. দায়বদ্ধতা</h2>
            <p className="mt-2 text-ink-soft">
              আমরা শেখার উপকরণ ও স্বীকৃতি দেই; চাকরি বা আয়ের নিশ্চয়তা দেই না। আপনার শেখা ও চেষ্টাই
              মূল চালিকা শক্তি।
            </p>
          </section>

          <section className="card-pop">
            <h2 className="text-base font-black text-brand">৭. যোগাযোগ</h2>
            <p className="mt-2 text-ink-soft">
              প্রশ্ন/আপত্তি: <a href="mailto:support@youtube-earner.com" className="text-teal underline">support@youtube-earner.com</a>
            </p>
          </section>

          <a href="/" className="btn-outline w-full text-center">🏠 হোমে ফিরুন</a>
        </div>
      </div>
    </main>
  );
}

"use client";

const images = Array.from({ length: 10 }, (_, i) => ({
  url: `https://jobayergroup.com/wp-content/uploads/2026/04/image${i === 0 ? "" : `-${i}`}.jpg`,
  alt: `Payment proof ${i + 1}`,
}));

export default function PaymentGallery() {
  return (
    <section className="max-w-[1120px] mx-auto mt-6 md:mt-8 px-3.5 md:px-5" id="payment-gallery">
      <div className="rounded-[20px] p-[18px_16px_16px] md:p-[20px] bg-[linear-gradient(135deg,rgba(29,78,216,.06),rgba(29,78,216,.02))] border border-[rgba(29,78,216,.14)]">
        <div className="flex w-fit gap-2 px-4 py-2.5 mx-auto mb-3.5 rounded-full bg-[rgba(29,78,216,.08)] border border-[rgba(29,78,216,.15)] font-extrabold text-sm text-[#1E3A8A]">
          🧾 পেমেন্ট স্ক্রিনশট দেখুন (১০টি)
        </div>
        <div className="flex w-fit gap-2 px-4 py-2.5 mx-auto mb-3.5 rounded-full bg-[rgba(29,78,216,.08)] border border-[rgba(29,78,216,.15)] font-extrabold text-sm text-[#1E3A8A]">
          💰 ব্যাংক, বিকাশ ও নগদে পেমেন্টের বাস্তব ছবি — দেখুন!
        </div>
        <h3 className="text-lg md:text-xl font-black text-[#1E293B] mb-1 text-center">📸 রিয়েল পার্টনার — রিয়েল পেমেন্ট প্রমাণ</h3>
        <p className="text-sm font-semibold text-[#64748B] mb-5 text-center">
          নিচে আমাদের সফল শিক্ষার্থীদের ব্যাংক, বিকাশ ও নগদে টাকা পাওয়ার বাস্তব ছবি — আপনার চোখের সামনে প্রমাণ।
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-3">
          {images.map((img, i) => (
            <div key={i} className="rounded-[14px] overflow-hidden border border-[#E2E8F0] bg-white shadow-[0_6px_16px_rgba(0,0,0,.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,.12)] transition-all hover:-translate-y-0.5">
              <div className="aspect-[4/3] bg-[#F8FAFC]">
                <img src={img.url} alt={img.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
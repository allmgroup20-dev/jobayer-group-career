"use client";

export default function CertificateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center pt-20 px-4 bg-[#0a0a0a]">
      <div className="max-w-md w-full card-pop !rounded-[2rem] text-center p-8">
        <div className="text-5xl">⚠️</div>
        <h1 className="mt-3 text-xl font-black text-white">পেজ লোড করা যায়নি</h1>
        <p className="mt-2 text-xs leading-relaxed text-white/60">
          সাময়িক সমস্যা হয়েছে। রিলোড করুন বা হোমে ফিরে আবার চেষ্টা করুন।
        </p>
        <p className="mt-2 text-[10px] font-mono text-white/30 break-all">{error.message || "Unknown error"}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => reset()} className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-black">
            🔄 রিলোড করুন
          </button>
          <a href="/" className="flex-1 py-2.5 rounded-xl btn-excite text-xs font-black text-center block">
            হোমে যান
          </a>
        </div>
      </div>
    </main>
  );
}

"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 page-under-header pb-10 bg-bg">
      <div className="max-w-md w-full card-pop !rounded-[2rem] text-center p-8">
        <div className="text-5xl">⚠️</div>
        <h1 className="mt-3 text-xl font-black text-brand">কিছু একটা সমস্যা হয়েছে</h1>
        <p className="mt-2 text-sm text-ink-soft">
          সাময়িক সমস্যা হতে পারে। আবার চেষ্টা করুন অথবা হোমে ফিরে যান।
        </p>
        <div className="mt-4 flex gap-2">
          <button onClick={reset} className="flex-1 py-2.5 rounded-xl btn-excite text-xs font-black">
            🔄 আবার চেষ্টা করুন
          </button>
          <a href="/" className="flex-1 py-2.5 rounded-xl btn-outline text-xs font-black text-center block">
            🏠 হোম
          </a>
        </div>
        {error?.digest ? (
          <p className="mt-2 text-[10px] font-mono text-muted break-all">{error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}

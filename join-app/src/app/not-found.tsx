import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 page-under-header pb-10 bg-bg">
      <div className="max-w-md w-full card-pop !rounded-[2rem] text-center p-8">
        <div className="text-5xl">🧭</div>
        <h1 className="mt-3 text-xl font-black text-brand">পেজটি খুঁজে পাওয়া যায়নি</h1>
        <p className="mt-2 text-sm text-ink-soft">
          লিংকটি হয়তো পুরনো বা ভুল। হোম থেকে আবার শুরু করুন — Google দিয়ে লগইন করলেই সব শুরু হয়।
        </p>
        <Link href="/" className="mt-4 btn-excite inline-block text-sm !py-3 px-6">
          🏠 হোমে ফিরুন
        </Link>
      </div>
    </main>
  );
}

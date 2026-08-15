"use client";

import { useLanguageStore } from "@/lib/store";
import ContactFileSync from "@/components/contacts/ContactFileSync";

interface Props {
  workerId: string;
  onComplete?: () => void;
}

export default function ContactSyncBanner({ workerId, onComplete }: Props) {
  const { lang } = useLanguageStore();

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;

  return (
    <div className="mb-6 space-y-3">
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📚</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">
              {t("Sync all your contacts in one click & earn bonus!", "এক ক্লিকে সব কন্টাক্ট সিঙ্ক করুন ও বোনাস নিন!")}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {t(
                "Find people you know from your contacts and earn bonus up to 50 BDT",
                "আপনার কন্টাক্ট থেকে পরিচিতদের খুঁজুন এবং ৫০ টাকা পর্যন্ত বোনাস উপার্জন করুন"
              )}
            </p>
          </div>
        </div>
      </div>
      <ContactFileSync
        workerId={workerId}
        onComplete={(_count, _matched, _bonus) => {
          localStorage.setItem("contact_sync_done", "1");
          if (onComplete) setTimeout(onComplete, 3000);
        }}
      />
    </div>
  );
}

"use client";

import { useState, useRef, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import { parseContactsFile, dedupeContacts, chunkContacts, Contact } from "@/lib/contacts/parser";

interface Props {
  workerId: string;
  onComplete?: (count: number, matched: number, bonus: number) => void;
}

type SyncStatus = "idle" | "scanning" | "complete" | "error";
type Result = { total: number; matched: number; bonus: number };

export default function ContactFileSync({ workerId, onComplete }: Props) {
  const { lang } = useLanguageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [fileName, setFileName] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const t = (en: string, bn: string) => (lang === "bn" ? bn : en);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      setFileName(file.name);
      setStatus("scanning");
      setResult(null);
      try {
        const text = await file.text();
        const parsed = dedupeContacts(parseContactsFile(text, file.name));
        if (parsed.length === 0) throw new Error("No valid contacts found");

        const chunks = chunkContacts(parsed, 200);
        setProgress({ done: 0, total: chunks.length });

        let matched = 0;
        for (let i = 0; i < chunks.length; i++) {
          const res = await fetch("/api/track/phonebook/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workerId,
              contacts: chunks[i],
              skipBonus: true,
            }),
          });
          if (!res.ok) throw new Error("Sync failed");
          const data = (await res.json()) as { matchedCount?: number };
          matched += data.matchedCount || 0;
          setProgress({ done: i + 1, total: chunks.length });
        }

        // Settlement call: awards the capped bonus based on the total matched
        // across all chunks (avoids re-awarding bonus per chunk).
        let bonus = 0;
        const settleRes = await fetch("/api/track/phonebook/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerId, contacts: [], bonusCount: matched }),
        });
        if (settleRes.ok) {
          const settleData = (await settleRes.json()) as { bonusAmount?: number };
          bonus = settleData.bonusAmount || 0;
        }

        setResult({ total: parsed.length, matched, bonus });
        setStatus("complete");
        localStorage.setItem("contact_sync_done", "1");
        if (onComplete) onComplete(parsed.length, matched, bonus);
      } catch (err) {
        console.error("File sync error:", err);
        setStatus("error");
      }
    },
    [workerId, onComplete]
  );

  const guideItems = [
    {
      title: t("Android", "Android"),
      steps: [
        t(
          "Open the Contacts app, tap the menu (⋮) → Export → choose .vcf and save it",
          "কন্টাক্ট অ্যাপ খুলুন, মেনু (⋮) → Export → .vcf বাছাই করে সেভ করুন"
        ),
        t(
          "The file is usually saved in Downloads. Tap the button below to pick it",
          "ফাইলটি সাধারণত Downloads ফোল্ডারে থাকে। নিচের বাটনে ট্যাপ করে ফাইলটি নির্বাচন করুন"
        ),
      ],
    },
    {
      title: t("iPhone (iOS)", "iPhone (iOS)"),
      steps: [
        t(
          "Open Settings → Contacts → Export Contacts → save the .vcf file",
          "Settings → Contacts → Export Contacts → .vcf ফাইলটি সেভ করুন"
        ),
        t(
          "Send the file to yourself (e.g. via WhatsApp/email), then pick it below",
          "ফাইলটি নিজেকে পাঠান (যেমন WhatsApp/email), তারপর নিচে থেকে নির্বাচন করুন"
        ),
      ],
    },
    {
      title: t("Google / other phones", "Google / অন্য ফোন"),
      steps: [
        t(
          "Go to Google Contacts → Export → all contacts as .vcf",
          "Google Contacts → Export → সব কন্টাক্ট .vcf ফরম্যাটে"
        ),
        t(
          "You can also export a .csv file — both work here",
          "এছাড়া .csv ফাইলও এক্সপোর্ট করতে পারেন — দুটোই এখানে কাজ করবে"
        ),
      ],
    },
  ];

  return (
    <div className="rounded-2xl p-4 bg-white border border-border">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📚</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-primary">
            {t("Sync ALL contacts in one click", "এক ক্লিকে সব কন্টাক্ট সিঙ্ক করুন")}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {t(
              "Export your phonebook once as a .vcf/.csv file, then upload it here — all your contacts sync at once.",
              "আপনার ফোনবুক একবার .vcf/.csv ফাইল হিসেবে এক্সপোর্ট করুন, তারপর এখানে আপলোড করুন — সব কন্টাক্ট একসাথে সিঙ্ক হবে।"
            )}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={status === "scanning"}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
        >
          {status === "scanning"
            ? t("সিঙ্ক হচ্ছে...", "Syncing...")
            : t("📒 ফাইল নির্বাচন করুন", "📒 Pick Contact File")}
        </button>
        <button
          onClick={() => setShowGuide(v => !v)}
          className="py-2.5 px-4 rounded-xl bg-gray-100 text-text-secondary font-bold text-sm hover:bg-gray-200 transition-all cursor-pointer"
        >
          {t("এক্সপোর্ট গাইড", "Export Guide")}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".vcf,.csv,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {showGuide && (
        <div className="mt-3 space-y-3 animate-fade-up">
          {guideItems.map(item => (
            <div key={item.title} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-bold text-primary mb-1">📱 {item.title}</p>
              <ol className="list-decimal list-inside text-xs text-text-secondary space-y-0.5">
                {item.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {status === "scanning" && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs font-bold text-blue-800">
            {t("সিঙ্ক হচ্ছে...", "Syncing your contacts...")}
          </p>
          <p className="text-xs text-blue-600 mt-0.5">
            {progress.total > 0
              ? t(
                  `Chunk ${progress.done} / ${progress.total} — please wait`,
                  `চাঙ্ক ${progress.done} / ${progress.total} — একটু অপেক্ষা করুন`
                )
              : t("Reading file...", "ফাইল পড়া হচ্ছে...")}
          </p>
          {fileName && (
            <p className="text-[10px] text-blue-500 mt-0.5">📄 {fileName}</p>
          )}
        </div>
      )}

      {status === "complete" && result && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-sm font-bold text-green-800">
            🎉 {t(
              `${result.total} contacts synced! ${result.matched} matched · +৳${result.bonus} bonus`,
              `${result.total}টি কন্টাক্ট সিঙ্ক হয়েছে! ${result.matched}টি ম্যাচ · +৳${result.bonus} বোনাস`
            )}
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm font-bold text-red-800">
            {t(
              "Couldn't read the file. Please check the format and try again.",
              "ফাইলটি পড়া যায়নি। ফরম্যাট ঠিক আছে কিনা দেখে আবার চেষ্টা করুন।"
            )}
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useLanguageStore } from "@/lib/store";

interface ValuePropCanvasProps {
  data: {
    jobs: string[];
    pains: string[];
    gains: string[];
    products: string[];
    relievers: string[];
    creators: string[];
  };
  className?: string;
}

function Section({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5">
      <h4 className={`mb-2 text-xs font-bold uppercase tracking-wider ${color}`}>{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
            <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-40" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ValuePropCanvas({ data, className = "" }: ValuePropCanvasProps) {
  const { lang } = useLanguageStore();

  const labels = {
    customerProfile: lang === "bn" ? "গ্রাহক প্রোফাইল" : "Customer Profile",
    valueMap: lang === "bn" ? "মূল্য মানচিত্র" : "Value Map",
    jobs: lang === "bn" ? "কাজ" : "Jobs",
    pains: lang === "bn" ? "যন্ত্রণা" : "Pains",
    gains: lang === "bn" ? "লাভ" : "Gains",
    products: lang === "bn" ? "পণ্য ও সেবা" : "Products & Services",
    relievers: lang === "bn" ? "যন্ত্রণা নিরাময়" : "Pain Relievers",
    creators: lang === "bn" ? "লাভ সৃষ্টিকারী" : "Gain Creators",
  };

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`}>
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-800">{labels.customerProfile}</h3>
        <Section title={labels.jobs} items={data.jobs} color="text-blue-600" />
        <Section title={labels.pains} items={data.pains} color="text-rose-600" />
        <Section title={labels.gains} items={data.gains} color="text-emerald-600" />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-800">{labels.valueMap}</h3>
        <Section title={labels.products} items={data.products} color="text-violet-600" />
        <Section title={labels.relievers} items={data.relievers} color="text-rose-600" />
        <Section title={labels.creators} items={data.creators} color="text-emerald-600" />
      </div>
    </div>
  );
}

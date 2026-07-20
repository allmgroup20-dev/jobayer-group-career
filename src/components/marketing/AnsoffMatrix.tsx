"use client";

import { useLanguageStore } from "@/lib/store";

interface AnsoffMatrixProps {
  data?: {
    penetration?: string;
    development?: string;
    productDev?: string;
    diversification?: string;
  };
  className?: string;
}

const defaultData = {
  penetration: "Increase market share with existing products",
  development: "Enter new markets with existing products",
  productDev: "Create new products for existing markets",
  diversification: "New products for new markets",
};

export function AnsoffMatrix({ data, className = "" }: AnsoffMatrixProps) {
  const { lang } = useLanguageStore();
  const d = { ...defaultData, ...data };

  const quadrants = [
    { key: "penetration", label: lang === "bn" ? "বাজার অনুপ্রবেশ" : "Market Penetration", desc: d.penetration, color: "from-blue-500 to-indigo-400", row: 0, col: 0 },
    { key: "productDev", label: lang === "bn" ? "পণ্য উন্নয়ন" : "Product Development", desc: d.productDev, color: "from-emerald-500 to-teal-400", row: 0, col: 1 },
    { key: "development", label: lang === "bn" ? "বাজার উন্নয়ন" : "Market Development", desc: d.development, color: "from-amber-500 to-yellow-400", row: 1, col: 0 },
    { key: "diversification", label: lang === "bn" ? "বিবিধকরণ" : "Diversification", desc: d.diversification, color: "from-rose-500 to-pink-400", row: 1, col: 1 },
  ];

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-2 grid-rows-2 gap-3">
        {quadrants.map((q) => (
          <div
            key={q.key}
            className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 transition-all hover:shadow-xl"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${q.color}`} />
            <h3 className="text-sm font-bold text-gray-900">{q.label}</h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">{q.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 text-center text-[10px] font-medium uppercase tracking-wider text-gray-400">
        <span>{lang === "bn" ? "বিদ্যমান পণ্য" : "Existing Product"}</span>
        <span>{lang === "bn" ? "নতুন পণ্য" : "New Product"}</span>
      </div>
      <div className="mt-1 flex gap-3 text-[10px] font-medium uppercase tracking-wider text-gray-400">
        <span className="w-1/2 text-right">{lang === "bn" ? "বিদ্যমান বাজার" : "Existing Market"}</span>
        <span className="w-1/2 text-left">{lang === "bn" ? "নতুন বাজার" : "New Market"}</span>
      </div>
    </div>
  );
}

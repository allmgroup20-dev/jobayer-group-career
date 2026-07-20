"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const defaultCurrencies = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", bnName: "বাংলাদেশী টাকা", rate: 1, default: true, active: true },
  { code: "USD", symbol: "$", name: "US Dollar", bnName: "মার্কিন ডলার", rate: 120, default: false, active: true },
  { code: "INR", symbol: "₹", name: "Indian Rupee", bnName: "ভারতীয় রুপি", rate: 1.44, default: false, active: true },
  { code: "EUR", symbol: "€", name: "Euro", bnName: "ইউরো", rate: 130, default: false, active: false },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", bnName: "মালয়েশিয়ান রিংগিট", rate: 25.5, default: false, active: false },
];

export default function CurrenciesTab() {
  const { lang } = useLanguageStore();
  const [currencies] = useState(defaultCurrencies);

  return (
    <div className="space-y-3">
      {currencies.map((c) => (
        <Card key={c.code} className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-2xl">{c.symbol}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-primary">{c.code}</p>
              {c.default && <span className="text-xs bg-action/10 text-action px-2 py-0.5 rounded-full font-medium">{lang === "bn" ? "ডিফল্ট" : "Default"}</span>}
            </div>
            <p className="text-xs text-text-secondary">{lang === "bn" ? c.bnName : c.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-primary">1 BDT = {c.code === "BDT" ? "1" : c.rate} {c.code}</p>
            <p className={`text-xs ${c.active ? "text-action" : "text-text-secondary"}`}>
              {c.active ? (lang === "bn" ? "সক্রিয়" : "Active") : (lang === "bn" ? "নিষ্ক্রিয়" : "Inactive")}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}

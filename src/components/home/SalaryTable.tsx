"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";
import { salaryNames, liveSalaryText } from "@/data/landing-page-data";

type RowData = { name: string; amount: number; status: string; success: boolean };

interface Props {
  onNewSuccess?: (name: string) => void;
}

const AVG_DELAY = 4;
const MAX_VISIBLE = 100;
const SUCCESS_POSITIONS = [7, 12, 22, 29, 38, 46, 55, 68, 79, 89];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateRow(index: number, lang: "bn" | "en"): RowData {
  const seed = index * 999;
  const name = salaryNames[Math.floor(seededRandom(seed) * salaryNames.length)];
  const success = SUCCESS_POSITIONS.includes(index % 100);
  const amount = success
    ? Math.floor(seededRandom(seed + 2) * 1501) + 1000
    : Math.floor(seededRandom(seed + 3) * 136) + 15;
  const status = success
    ? (lang === "bn" ? liveSalaryText.successStatusBn : liveSalaryText.successStatusEn)
    : (lang === "bn" ? liveSalaryText.bonusStatusBn : liveSalaryText.bonusStatusEn);
  return { name, amount, status, success };
}

function toBn(v: number) {
  return String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)]);
}

export default function SalaryTable({ onNewSuccess }: Props) {
  const { lang } = useLanguageStore();
  const [rows, setRows] = useState<RowData[]>([]);
  const [total, setTotal] = useState(0);
  const seenSuccessRef = useRef<Set<number>>(new Set());
  const initialBatchRef = useRef(false);

  const tick = useCallback(() => {
    const totalUpdates = Math.floor(Date.now() / 1000 / AVG_DELAY);
    const start = Math.max(0, totalUpdates - MAX_VISIBLE);
    const newRows: RowData[] = [];
    const newSuccessNames: string[] = [];

    for (let i = totalUpdates - 1; i >= start; i--) {
      const data = generateRow(i, lang);
      newRows.push(data);
      if (data.success && !seenSuccessRef.current.has(i)) {
        seenSuccessRef.current.add(i);
        newSuccessNames.push(data.name);
      }
    }

    setRows(newRows);
    setTotal(totalUpdates);

    if (onNewSuccess) {
      if (!initialBatchRef.current) {
        newSuccessNames.forEach((n) => onNewSuccess(n));
        initialBatchRef.current = true;
      } else {
        newSuccessNames.forEach((n) => onNewSuccess(n));
      }
    }
  }, [lang, onNewSuccess]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
      <div className="section-header">
        <div className="badge mx-auto mb-3 border-success/20 bg-success/10 text-success">
          📊 {lang === "bn" ? liveSalaryText.badgeBn : liveSalaryText.badgeEn}
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse shadow-lg shadow-orange-500/50" />
          <h3 className="text-lg md:text-xl font-black text-text">
            {lang === "bn" ? liveSalaryText.titleBn : liveSalaryText.titleEn}
          </h3>
        </div>
        <p className="text-sm font-semibold text-text-secondary mt-1">
          {lang === "bn" ? liveSalaryText.subtitleBn : liveSalaryText.subtitleEn}
        </p>
        <div className="mt-2 inline-block mx-auto px-3 py-1 rounded-full bg-info/10 border border-info/20 text-[11px] font-bold text-text-secondary">
          {lang === "bn" ? liveSalaryText.disclaimerBn : liveSalaryText.disclaimerEn}
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-bg border border-border overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_160px_1fr] items-center px-4 py-3 bg-white border-b border-border sticky top-0 z-10">
          <span className="font-black text-[11px] text-text-secondary text-center">#</span>
          <span className="font-black text-[11px] text-text-secondary">{lang === "bn" ? "নাম" : "Name"}</span>
          <span className="font-black text-[11px] text-text-secondary text-center">{lang === "bn" ? "মোট বোনাস" : "Bonus"}</span>
          <span className="font-black text-[11px] text-text-secondary text-right">{lang === "bn" ? "স্ট্যাটাস" : "Status"}</span>
        </div>
        <div>
          {rows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-[40px_1fr_160px_1fr] items-center px-4 py-3 border-b border-border/50 last:border-none ${
                row.success
                  ? "ring-2 ring-inset ring-amber-400 bg-amber-50"
                  : i % 2 === 0 ? "bg-white/50" : ""
              }`}
            >
              <span className="font-bold text-[11px] text-text-secondary text-center">{total - i}</span>
              <span className={`font-bold text-xs truncate ${row.success ? "text-amber-700" : "text-text"}`}>
                {row.name}
              </span>
              <span className={`font-black text-sm text-center ${row.success ? "text-amber-600" : "text-success"}`}>
                {toBn(row.amount)}৳
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full justify-self-end whitespace-nowrap ${
                  row.success
                    ? "bg-amber-100 text-amber-700"
                    : "bg-info/10 text-info"
                }`}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

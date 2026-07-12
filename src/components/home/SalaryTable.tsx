"use client";

import { useEffect, useRef, useState } from "react";

const names = [
  "Ayan Rahman","সুমন দাস","Maria Gomes","Ratan Marma","উদয় বড়ুয়া",
  "Nusrat Jahan","অনিক পাল","Rakib Hasan","Bimal Tripura","তানিয়া সুলতানা",
  "Sabbir Hossain","Mithila Roy","Farhan Ahmed","Riya Chakma","Tanvir Islam",
  "Lima Das","Omar Faruk","Puja Rani","Hasan Mahmud","Nabila Noor",
];

type RowData = { name: string; amount: number; status: string; success: boolean };

function seededRandom(seed: number) {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

function generateRow(index: number): RowData {
  const seed = index * 999;
  const name = names[Math.floor(seededRandom(seed) * names.length)];
  const success = [7, 12, 22, 29, 38, 46, 55, 68, 79, 89].includes(index % 100);
  const amount = success
    ? Math.floor(seededRandom(seed + 2) * 1501) + 1000
    : Math.floor(seededRandom(seed + 3) * 136) + 15;
  const status = success ? "নগদে ট্রান্সফার হয়েছে" : "বোনাস দেওয়া হয়েছে";
  return { name, amount, status, success };
}

function toBn(v: number) {
  return String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)]);
}

export default function SalaryTable() {
  const [rows, setRows] = useState<RowData[]>([]);

  useEffect(() => {
    const generate = () => {
      const now = Date.now();
      const total = Math.floor(now / 1000 / 4);
      const start = Math.max(0, total - 100);
      const newRows: RowData[] = [];
      for (let i = total - 1; i >= start; i--) {
        newRows.push(generateRow(i));
      }
      setRows(newRows);
    };
    generate();
    const interval = setInterval(generate, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-br from-primary/5 to-primary/5 border border-primary/20">
      <div className="section-header">
        <div className="badge mx-auto mb-3">📊 লাইভ আয় দেখুন — কে কত টাকা পাচ্ছে</div>
        <h3 className="text-lg md:text-xl font-black text-text">রিয়েল টাইম বোনাস বিতরণ</h3>
      </div>

      <div className="max-h-[500px] overflow-y-auto rounded-xl border border-border bg-white">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-[2]">
            <tr className="bg-gradient-to-r from-info to-orange text-white">
              <th className="p-3 text-left text-xs font-extrabold">নাম</th>
              <th className="p-3 text-left text-xs font-extrabold">মোট বোনাস</th>
              <th className="p-3 text-left text-xs font-extrabold">স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((data, i) => (
              <tr
                key={i}
                className={`border-b border-border ${data.success ? "bg-success/20 font-bold text-success" : i % 2 === 0 ? "bg-white" : "bg-bg"}`}
              >
                <td className="p-3 text-xs font-bold text-text">{data.name}</td>
                <td className="p-3 text-xs font-bold text-text">{toBn(data.amount)} টাকা</td>
                <td className="p-3 text-xs font-semibold text-text-secondary">{data.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

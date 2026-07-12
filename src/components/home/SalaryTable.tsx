"use client";

import { useEffect, useRef } from "react";

const names = [
  "Ayan Rahman","সুমন দাস","Maria Gomes","Ratan Marma","উদয় বড়ুয়া",
  "Nusrat Jahan","অনিক পাল","Rakib Hasan","Bimal Tripura","তানিয়া সুলতানা",
  "Sabbir Hossain","Mithila Roy","Farhan Ahmed","Riya Chakma","Tanvir Islam",
  "Lima Das","Omar Faruk","Puja Rani","Hasan Mahmud","Nabila Noor",
  "Ayesha Rahman","সুমনা দাস","Priya Saha","Farzana Akter","বিজয় বড়ুয়া",
  "Tasnim Karim","রিনা পাল","মাহিরা নূর","Daniel Gomes","Tanjila Islam",
  "তপন দাস","সুমাইয়া আহমেদ","Milan Roy","Lamia Sultana","জিতু ত্রিপুরা",
  "Sohana Noor","বৃষ্টি রায়","রাবেয়া খাতুন","Peter Costa","Tamanna Yasmin",
  "Mariam Akter","লতা বিশ্বাস","আফিফা করিম","Robin Rozario","Nabila Rahman",
  "রাকেশ শীল","Sabina Islam","ডলি সরকার","তাসমিয়া রহমান","Ananda Das",
  "Farhin Sultana","শিউলি রানী","Shabnam Yasmin","Rony Marma","সামিয়া নূর",
  "John Tripura","Rukhsana Begum","সাগর রায়","Hira Ahmed","নির্মল বড়ুয়া",
  "সাদিয়া করিম","Rita Paul","Mehnaz Akter","ডেভিড কস্তা","Nuzhat Jahan",
  "কাব্য পাল","Maliha Noor","উজ্জ্বল দাস","Ishrat Sultana","Pinky Rani",
  "মাহজাবীন নূর","Simon Gomes","Tasnia Islam","বরুণ দাস","Labiba Noor",
  "রিমা সরকার","Afreen Karim","জুয়েল বড়ুয়া","Saima Rahman","রতন মারমা",
  "Halima Khatun","Tanmoy Saha","Fariha Sultana","অনিল বড়ুয়া","Amina Begum",
  "তুলি রানী","Sharmeen Akter","Victor Rozario","Zannat Ara","লিমন ত্রিপুরা",
  "Humaira Noor","রেখা বালা","Farzana Rahman","বর্ষা রায়","Nusrat Sultana",
  "Rafia Islam","Sujan Barua","Afsana Karim","Tamanna Islam","Samira Ahmed",
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getStatus(index: number) {
  const successPositions = [7, 12, 22, 29, 38, 46, 55, 68, 79, 89];
  return successPositions.includes(index % 100) ? "success" : "added";
}

function generateRow(index: number) {
  const seed = index * 999;
  const name = names[Math.floor(seededRandom(seed) * names.length)];
  const success = getStatus(index) === "success";
  const amount = success
    ? Math.floor(seededRandom(seed + 2) * 1501) + 1000
    : Math.floor(seededRandom(seed + 3) * 136) + 15;
  const status = success ? "নগদ অ্যাকাউন্টে সফলভাবে পারফরম্যান্স উপহার ট্রান্সফার হয়েছে" : "বোনাস দেওয়া হয়েছে";
  return { name, amount, status, success };
}

function toBn(v: number) {
  return String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)]);
}

export default function SalaryTable() {
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const notifRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const tbody = tbodyRef.current;
    if (!tbody) return;

    const AVG_DELAY = 4;
    const MAX_VISIBLE = 100;

    const render = () => {
      const now = Date.now();
      const totalUpdates = Math.floor(now / 1000 / AVG_DELAY);
      const start = Math.max(0, totalUpdates - MAX_VISIBLE);
      const end = totalUpdates;

      tbody.innerHTML = "";
      for (let i = end - 1; i >= start; i--) {
        const data = generateRow(i);
        const tr = document.createElement("tr");
        if (data.success) tr.className = "success-row";
        tr.style.cssText = data.success
          ? "background:rgba(255,191,0,.12)!important;color:#B8860B;font-weight:800;"
          : i % 2 === 0 ? "background:#ffffff" : "background:#F8FAFC";
        tr.style.borderBottom = "1px solid #E2E8F0";

        const td1 = document.createElement("td");
        td1.style.cssText = "padding:8px 10px;font-size:12px;font-weight:700;color:#1E293B;";
        td1.textContent = data.name;

        const td2 = document.createElement("td");
        td2.style.cssText = "padding:8px 10px;font-size:12px;font-weight:700;color:#1E293B;";
        td2.textContent = toBn(data.amount) + " টাকা";

        const td3 = document.createElement("td");
        td3.style.cssText = "padding:8px 10px;font-size:11px;font-weight:600;color:#475569;";
        td3.textContent = data.status;

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tbody.appendChild(tr);
      }
    };

    render();
    const interval = setInterval(render, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-[1120px] mx-auto mt-6 md:mt-8 px-3.5 md:px-5" id="earnings">
      <div className="rounded-[20px] p-[18px_16px_16px] md:p-[20px] bg-[linear-gradient(135deg,rgba(29,78,216,.06),rgba(29,78,216,.02))] border border-[rgba(29,78,216,.14)]">
        <div className="flex w-fit gap-2 px-4 py-2.5 mx-auto mb-3.5 rounded-full bg-[rgba(29,78,216,.08)] border border-[rgba(29,78,216,.15)] font-extrabold text-sm text-[#1E3A8A]">
          📊 লাইভ আয় দেখুন — কে কত টাকা পাচ্ছে
        </div>

        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-3 rounded-[16px] bg-[linear-gradient(90deg,rgba(29,78,216,.1),rgba(234,88,12,.1),rgba(29,78,216,.1))] border border-[#E2E8F0]">
            <span className="w-3 h-3 rounded-full bg-[#FF6B35] animate-pulse shadow-[0_0_12px_rgba(234,88,12,.8)]" />
            <span className="font-black text-lg">🟢 লাইভ — বোনাস বিতরণ করা হচ্ছে</span>
          </div>
          <p className="text-sm font-semibold text-[#64748B] mt-2 max-w-[600px] mx-auto">
            এই মুহূর্তে কে কত টাকা আয় করছে তা নিচে দেখুন — কয়েক সেকেন্ড পরপর নতুন আয়ের খবর আসবে!
          </p>
          <p className="text-xs font-bold text-[#94A3B8] mt-1">📊 নিচের তথ্যগুলো আমাদের সফল শিক্ষার্থীদের প্রকৃত আয়ের ভিত্তিতে তৈরি ডেমো</p>
        </div>

        <div className="max-h-[500px] overflow-y-auto rounded-[16px] border border-[#E2E8F0] bg-white">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-[2]">
              <tr className="bg-gradient-to-r from-[#1D4ED8] to-[#FF6B35] text-white">
                {["নাম", "মোট বোনাস", "স্ট্যাটাস"].map((h) => (
                  <th key={h} className="p-3 text-left text-xs font-extrabold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody ref={tbodyRef} />
          </table>
        </div>
      </div>
    </section>
  );
}
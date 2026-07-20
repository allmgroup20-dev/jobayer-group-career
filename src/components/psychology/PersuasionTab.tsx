"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";

interface EmployeeScore {
  phone: string;
  employee_name: string;
  avg_trust: number;
  avg_listening: number;
  avg_value: number;
  avg_resistance: number;
  total_records: number;
  last_recorded: string;
}

interface DetailRecord {
  metric_type: string;
  score: number;
  recorded_at: string;
  notes: string;
  recorded_by: string;
}

const METRIC_LABELS: Record<string, { en: string; bn: string }> = {
  trust_building: { en: "Trust Building", bn: "বিশ্বাস গঠন" },
  listening_quality: { en: "Listening Quality", bn: "শ্রবণ গুণমান" },
  value_delivery: { en: "Value Delivery", bn: "মূল্য প্রদান" },
  resistance_handling: { en: "Resistance Handling", bn: "প্রতিরোধ ব্যবস্থাপনা" },
};

const METRIC_COLORS: Record<string, string> = {
  trust_building: "bg-blue-500",
  listening_quality: "bg-green-500",
  value_delivery: "bg-purple-500",
  resistance_handling: "bg-orange-500",
};

export default function PersuasionTab() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [employees, setEmployees] = useState<EmployeeScore[]>([]);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [detail, setDetail] = useState<DetailRecord[]>([]);
  const [detailName, setDetailName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/company/employee-persuasion?action=list")
      .then(r => r.json() as Promise<{ employees: EmployeeScore[] }>)
      .then(d => { if (d.employees) setEmployees(d.employees); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadDetail = (phone: string, name: string) => {
    setSelectedPhone(phone);
    setDetailName(name);
    fetch(`/api/company/employee-persuasion?action=detail&phone=${encodeURIComponent(phone)}`)
      .then(r => r.json() as Promise<{ scores: DetailRecord[] }>)
      .then(d => { if (d.scores) setDetail(d.scores); });
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null || score === undefined) return { color: "bg-gray-100 text-gray-400", label: isBn ? "নেই" : "—" };
    const s = Math.round(score);
    if (s >= 8) return { color: "bg-green-100 text-green-700", label: String(s) };
    if (s >= 5) return { color: "bg-amber-100 text-amber-700", label: String(s) };
    if (s >= 3) return { color: "bg-orange-100 text-orange-700", label: String(s) };
    return { color: "bg-red-100 text-red-700", label: String(s) };
  };

  if (loading) return <div className="text-gray-500">{isBn ? "লোড হচ্ছে..." : "Loading..."}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-2">{isBn ? "কর্মচারী পারসুয়েশন স্কিল ট্র্যাকার" : "Employee Persuasion Skill Tracker"}</h1>

      {/* Positioning concept: Advertising is psychology in practice (Book: Ch.1) */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200/50 text-xs">
        <span className="text-base">🎯</span>
        <span className="text-text-secondary flex-1">{isBn ? "\"অ্যাডভার্টাইজিং ইজ সাইকোলজি ইন প্র্যাকটিস\" — পজিশনিং বইয়ের মূল বক্তব্য। পারসুয়েশন মানে গ্রাহকের মাইন্ডে পজিশন তৈরি করা। পারসেপশন ইজ রিয়ালিটি। এই স্কোরগুলো সেই পজিশনের শক্তি মাপে।" : "\"Advertising is psychology in practice\" — the core of Positioning. Persuasion creates a position in the customer's mind. Perception is reality. These scores measure position strength."}</span>
        <span className="inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold bg-green-100 text-green-700 shrink-0">{isBn ? "পারসেপশন" : "Perception"}</span>
      </div>

      <p className="text-gray-500 mb-6">
        {isBn
          ? "বব বার্গের The Art of Persuasion — প্রতিটি কর্মচারীর বিশ্বাস গঠন, শ্রবণ, মূল্য প্রদান ও প্রতিরোধ ব্যবস্থাপনা স্কোর"
          : "Bob Berg's The Art of Persuasion — Track trust building, listening, value delivery & resistance handling per employee"}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">{isBn ? "কর্মচারী তালিকা" : "Employee List"}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 bg-gray-50">
                  <th className="p-3 font-medium">{isBn ? "নাম" : "Name"}</th>
                  <th className="p-3 font-medium text-blue-600">{isBn ? "বিশ্বাস" : "Trust"}</th>
                  <th className="p-3 font-medium text-green-600">{isBn ? "শ্রবণ" : "Listen"}</th>
                  <th className="p-3 font-medium text-purple-600">{isBn ? "মূল্য" : "Value"}</th>
                  <th className="p-3 font-medium text-orange-600">{isBn ? "প্রতিরোধ" : "Resist"}</th>
                  <th className="p-3 font-medium">{isBn ? "রেকর্ড" : "Rec."}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => (
                  <tr
                    key={emp.phone}
                    onClick={() => loadDetail(emp.phone, emp.employee_name)}
                    className={`cursor-pointer hover:bg-blue-50 ${i < employees.length - 1 ? "border-b" : ""} ${
                      selectedPhone === emp.phone ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="p-3 font-medium text-gray-800">{emp.employee_name || emp.phone}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${getScoreBadge(emp.avg_trust).color}`}>{getScoreBadge(emp.avg_trust).label}</span></td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${getScoreBadge(emp.avg_listening).color}`}>{getScoreBadge(emp.avg_listening).label}</span></td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${getScoreBadge(emp.avg_value).color}`}>{getScoreBadge(emp.avg_value).label}</span></td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${getScoreBadge(emp.avg_resistance).color}`}>{getScoreBadge(emp.avg_resistance).label}</span></td>
                    <td className="p-3 text-gray-500">{emp.total_records}</td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center text-gray-400">{isBn ? "কোনো কর্মচারী ডেটা নেই" : "No employee data yet"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          {!selectedPhone ? (
            <div className="text-gray-400 text-center py-12">
              {isBn ? "বাম থেকে একজন কর্মচারী নির্বাচন করুন" : "Select an employee from the list"}
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-lg mb-1">{detailName || selectedPhone}</h3>
              <p className="text-xs text-gray-400 mb-4">{isBn ? "পারসুয়েশন স্কোরের ইতিহাস" : "Persuasion score history"}</p>

              {/* Current Averages */}
              {(() => {
                const emp = employees.find(e => e.phone === selectedPhone);
                if (!emp) return null;
                return (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {(["trust_building", "listening_quality", "value_delivery", "resistance_handling"] as const).map(m => {
                      const val = emp[`avg_${m === "trust_building" ? "trust" : m === "listening_quality" ? "listening" : m === "value_delivery" ? "value" : "resistance"}` as keyof EmployeeScore] as number;
                      return (
                        <div key={m} className={`${METRIC_COLORS[m]} text-white rounded-lg p-2 text-center`}>
                          <div className="text-lg font-bold">{val !== null ? val.toFixed(1) : "—"}</div>
                          <div className="text-[10px] opacity-80">{isBn ? METRIC_LABELS[m].bn : METRIC_LABELS[m].en}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <h4 className="text-sm font-medium text-gray-500 mb-2">{isBn ? "স্কোর ইতিহাস" : "Score History"}</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {detail.map((d, i) => (
                  <div key={i} className="border rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{isBn ? METRIC_LABELS[d.metric_type]?.bn : METRIC_LABELS[d.metric_type]?.en || d.metric_type}</span>
                      <span className={`font-bold ${d.score >= 7 ? "text-green-600" : d.score >= 4 ? "text-amber-600" : "text-red-600"}`}>{d.score}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {d.recorded_at?.slice(0, 10)} {d.recorded_by ? `— ${d.recorded_by}` : ""}
                    </div>
                    {d.notes && <div className="text-xs text-gray-500 mt-1">{d.notes}</div>}
                  </div>
                ))}
                {detail.length === 0 && <div className="text-gray-400 text-center py-4">{isBn ? "কোনো রেকর্ড নেই" : "No records"}</div>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        {(["trust_building", "listening_quality", "value_delivery", "resistance_handling"] as const).map(m => {
          const valid = employees.filter(e => e[`avg_${m === "trust_building" ? "trust" : m === "listening_quality" ? "listening" : m === "value_delivery" ? "value" : "resistance"}` as keyof EmployeeScore] !== null);
          const avg = valid.length > 0
            ? valid.reduce((sum, e) => sum + (e[`avg_${m === "trust_building" ? "trust" : m === "listening_quality" ? "listening" : m === "value_delivery" ? "value" : "resistance"}` as keyof EmployeeScore] as number), 0) / valid.length
            : 0;
          return (
            <div key={m} className={`rounded-xl p-4 text-white ${METRIC_COLORS[m]} bg-opacity-80`}>
              <div className="text-sm opacity-80 mb-1">{isBn ? METRIC_LABELS[m].bn : METRIC_LABELS[m].en}</div>
              <div className="text-3xl font-bold">{avg.toFixed(1)}</div>
              <div className="text-xs opacity-70">{isBn ? "সকল কর্মচারীর গড়" : "Company average"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

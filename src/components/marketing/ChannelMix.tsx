"use client";

import { useLanguageStore } from "@/lib/store";

interface ChannelMixProps {
  data: Array<{ channel: string; budget: number; percentage: number; effectiveness: number }>;
  className?: string;
}

const channelIcons: Record<string, string> = {
  advertising: "📺",
  pr: "📰",
  "sales promotion": "🏷️",
  direct: "📬",
  digital: "💻",
  events: "🎪",
  personal: "🤝",
  wom: "🗣️",
};

export function ChannelMix({ data, className = "" }: ChannelMixProps) {
  const { lang } = useLanguageStore();
  const maxBudget = Math.max(...data.map((d) => d.budget), 1);

  const effColor = (v: number) => {
    if (v >= 8) return "from-emerald-500 to-teal-400";
    if (v >= 5) return "from-amber-500 to-yellow-400";
    return "from-rose-500 to-red-400";
  };

  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${className}`}>
      {data.map((item) => {
        const key = item.channel.toLowerCase().replace(/\s+/g, "");
        const icon = channelIcons[item.channel.toLowerCase()] || "📢";
        const budgetPct = (item.budget / maxBudget) * 100;
        return (
          <div
            key={item.channel}
            className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5 transition-all hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 p-3 text-2xl opacity-20 transition-all group-hover:scale-125 group-hover:opacity-40">
              {icon}
            </div>
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-gray-900">{item.channel}</h4>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-lg font-extrabold text-gray-900">
                  ${item.budget.toLocaleString()}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                  {item.percentage}%
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  <span>{lang === "bn" ? "বাজেট" : "Budget"}</span>
                  <span>{budgetPct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-700"
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  <span>{lang === "bn" ? "কার্যকারিতা" : "Effectiveness"}</span>
                  <span>{item.effectiveness}/10</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${effColor(item.effectiveness)} transition-all duration-700`}
                    style={{ width: `${(item.effectiveness / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

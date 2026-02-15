"use client";

import { useDataStore } from "@/store/useDataStore";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Calendar } from "lucide-react";

export default function TopBar() {
  const { rawData } = useDataStore();
  const hasData = rawData.length > 0;

  // 计算数据时间范围
  const getTimeRange = () => {
    if (!hasData) return null;

    const yearMonths = new Set<string>();
    rawData.forEach((item) => {
      if (item.YEAR && item.MONTH) {
        yearMonths.add(`${item.YEAR}-${String(item.MONTH).padStart(2, "0")}`);
      }
    });

    const sorted = Array.from(yearMonths).sort();
    if (sorted.length === 0) return null;

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

    const [firstYear, firstMonth] = first.split("-");
    const [lastYear, lastMonth] = last.split("-");

    return `${firstYear} ${monthNames[parseInt(firstMonth) - 1]} - ${lastYear} ${monthNames[parseInt(lastMonth) - 1]}`;
  };

  const timeRange = getTimeRange();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#E8ECF1] bg-white px-6">
      <div className="flex items-baseline gap-4">
        <h1 className="text-lg font-bold text-[#1A1D23]">
          社交媒体监听分析
        </h1>
        <span className="text-xs text-[#9AA0AB] tracking-wide">
          Social Listening Analytics
        </span>
      </div>

      <div className="flex items-center gap-5">
        {timeRange && (
          <div className="flex items-center gap-2 text-sm text-[#5A6170]">
            <Calendar className="h-4 w-4 text-[#9AA0AB]" />
            <span>{timeRange}</span>
          </div>
        )}
        <ThemeToggle size="sm" />
      </div>
    </header>
  );
}

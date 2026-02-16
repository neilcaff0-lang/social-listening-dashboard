"use client";

import { useDataStore } from "@/store/useDataStore";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Calendar } from "lucide-react";

export default function TopBar() {
  const { rawData, filters } = useDataStore();
  const hasData = rawData.length > 0;

  const getTimeRange = () => {
    if (!hasData) return null;

    // 月份映射表（支持英文缩写）
    const monthMap: Record<string, string> = {
      "Jan": "1月", "Feb": "2月", "Mar": "3月", "Apr": "4月",
      "May": "5月", "Jun": "6月", "Jul": "7月", "Aug": "8月",
      "Sep": "9月", "Oct": "10月", "Nov": "11月", "Dec": "12月"
    };
    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

    // 获取当前筛选的时间范围
    const { year, months } = filters.timeFilter;
    if (!year || months.length === 0) return null;

    // 将月份转换为数字并排序
    const monthNums = months.map((m) => {
      if (monthMap[m]) {
        return Object.keys(monthMap).indexOf(m) + 1;
      }
      return parseInt(m);
    }).sort((a, b) => a - b);

    if (monthNums.length === 0) return null;

    const firstMonth = monthNames[monthNums[0] - 1];
    const lastMonth = monthNames[monthNums[monthNums.length - 1] - 1];

    // 如果只有一个月，显示单个月份；否则显示范围
    if (monthNums.length === 1) {
      return `${year} ${firstMonth}`;
    }
    return `${year} ${firstMonth} - ${lastMonth}`;
  };

  const timeRange = getTimeRange();

  return (
    <header className="app-header">
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-[hsl(var(--foreground))]">仪表盘</h1>
      </div>

      <div className="flex items-center gap-4">
        {timeRange && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
            <Calendar className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{timeRange}</span>
          </div>
        )}
        <ThemeToggle size="sm" />
      </div>
    </header>
  );
}

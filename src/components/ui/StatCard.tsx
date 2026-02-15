"use client";

import { ReactNode } from "react";
import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  formatNumber?: boolean;
  growthRate?: number;
  icon?: LucideIcon;
  suffix?: ReactNode;
}

function formatCompactNumber(num: number): string {
  if (num === undefined || num === null) return "0";
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString("en-US");
}

function formatPercent(num: number): string {
  if (num === undefined || num === null) return "0%";
  return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
}

export default function StatCard({
  title,
  value,
  formatNumber = false,
  growthRate,
  icon: Icon,
  suffix,
}: StatCardProps) {
  const displayValue =
    typeof value === "number" && formatNumber
      ? formatCompactNumber(value)
      : value;

  const isPositive = growthRate !== undefined && growthRate > 0;
  const isNegative = growthRate !== undefined && growthRate < 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white p-5",
        "border border-[#E8ECF1]",
        "transition-all duration-300 ease-out cursor-default",
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
      )}
    >
      {/* 标题行 */}
      <div className="flex items-center gap-2 mb-3">
        {Icon && (
          <Icon className="h-4 w-4 text-[#6C5CE7]" />
        )}
        <span className="text-[13px] font-medium text-[#5A6170]">
          {title}
        </span>
      </div>

      {/* 数值 */}
      <div className="text-[28px] font-bold text-[#1A1D23] leading-tight tabular-nums">
        {displayValue}
      </div>

      {/* 增长率 */}
      {growthRate !== undefined && (
        <div
          className={cn(
            "flex items-center gap-1 mt-2 text-[13px]",
            isPositive && "text-[#00C48C]",
            isNegative && "text-[#FF6B6B]",
            !isPositive && !isNegative && "text-[#9AA0AB]"
          )}
        >
          {isPositive ? <ArrowUp className="h-3.5 w-3.5" /> :
           isNegative ? <ArrowDown className="h-3.5 w-3.5" /> : null}
          <span>{formatPercent(growthRate)}</span>
          <span className="text-[#9AA0AB] ml-1">同比</span>
        </div>
      )}

      {/* 额外内容 */}
      {suffix && <div className="mt-2">{suffix}</div>}
    </div>
  );
}

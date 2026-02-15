"use client";

import { ReactNode } from "react";
import { LucideIcon, ArrowUp, ArrowDown, Minus } from "lucide-react";
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
        "relative overflow-hidden rounded-2xl bg-white p-6",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]",
        "transition-all duration-300 ease-out cursor-default",
        "hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:-translate-y-1",
        "border border-transparent hover:border-[#6C5CE7]/20"
      )}
    >
      {/* 背景装饰 */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#6C5CE7]/5 to-[#a29bfe]/10 blur-2xl" />

      {/* 标题行 */}
      <div className="relative flex items-center gap-3 mb-4">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] shadow-lg shadow-[#6C5CE7]/25">
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
        <span className="text-sm font-medium text-[#5A6170]">
          {title}
        </span>
      </div>

      {/* 数值 */}
      <div className="relative text-[32px] font-bold text-[#1A1D23] leading-none tabular-nums mb-3">
        {displayValue}
      </div>

      {/* 增长率 */}
      {growthRate !== undefined && (
        <div className="relative flex items-center gap-2">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold",
              isPositive && "bg-[#00C48C]/10 text-[#00C48C]",
              isNegative && "bg-[#FF6B6B]/10 text-[#FF6B6B]",
              !isPositive && !isNegative && "bg-[#9AA0AB]/10 text-[#9AA0AB]"
            )}
          >
            {isPositive ? <ArrowUp className="h-4 w-4" /> :
             isNegative ? <ArrowDown className="h-4 w-4" /> :
             <Minus className="h-4 w-4" />}
            <span>{formatPercent(Math.abs(growthRate))}</span>
          </div>
          <span className="text-xs text-[#9AA0AB]">同比变化</span>
        </div>
      )}

      {/* 额外内容 */}
      {suffix && <div className="relative mt-3">{suffix}</div>}
    </div>
  );
}

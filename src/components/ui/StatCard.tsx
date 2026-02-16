"use client";

import { ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorScheme = "blue" | "purple" | "green" | "orange";

interface StatCardProps {
  title: string;
  value: number | string;
  formatNumber?: boolean;
  growthRate?: number;
  icon?: LucideIcon;
  suffix?: ReactNode;
  color?: ColorScheme;
}

function formatCompactNumber(num: number): string {
  if (num === undefined || num === null) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString("en-US");
}

function formatPercent(num: number): string {
  if (num === undefined || num === null) return "0%";
  return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
}

// 简洁现代的配色方案
const colorConfig: Record<ColorScheme, {
  iconBg: string;
  iconColor: string;
  accent: string;
}> = {
  blue: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    accent: "bg-blue-500",
  },
  purple: {
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    accent: "bg-violet-500",
  },
  green: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    accent: "bg-emerald-500",
  },
  orange: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    accent: "bg-amber-500",
  },
};

export default function StatCard({
  title,
  value,
  formatNumber = false,
  growthRate,
  icon: Icon,
  suffix,
  color = "blue",
}: StatCardProps) {
  const displayValue =
    typeof value === "number" && formatNumber
      ? formatCompactNumber(value)
      : value;

  const isPositive = growthRate !== undefined && growthRate > 0;
  const isNegative = growthRate !== undefined && growthRate < 0;
  const colors = colorConfig[color];

  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 p-5 transition-all duration-200 hover:shadow-lg hover:border-gray-200">
      {/* 左侧装饰条 */}
      <div className={cn("absolute left-0 top-4 bottom-4 w-1 rounded-r-full", colors.accent)} />

      <div className="pl-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 tracking-tight">
              {displayValue}
            </p>

            {growthRate !== undefined && (
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                    isPositive
                      ? "bg-emerald-50 text-emerald-700"
                      : isNegative
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : isNegative ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {formatPercent(growthRate)}
                </span>
                <span className="text-xs text-gray-400">vs 上月</span>
              </div>
            )}

            {suffix && (
              <p className="mt-2 text-xs text-gray-400">{suffix}</p>
            )}
          </div>

          {Icon && (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg shrink-0 transition-colors",
                colors.iconBg,
                colors.iconColor
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

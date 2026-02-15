"use client";

import { useState } from "react";
import { AIInsightData } from "@/types/analysis";
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightProps {
  insights: AIInsightData;
  onInsightsChange?: (insights: AIInsightData) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

const insightTypes = [
  {
    key: "core" as const,
    label: "核心洞察",
    icon: Lightbulb,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    placeholder: "基于数据分析的核心发现...",
  },
  {
    key: "trend" as const,
    label: "趋势分析",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    placeholder: "市场趋势及发展方向分析...",
  },
  {
    key: "strategy" as const,
    label: "策略建议",
    icon: Target,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    placeholder: "基于分析结果的行动建议...",
  },
];

export default function AIInsight({
  insights,
  onInsightsChange,
  onGenerate,
  isGenerating = false,
}: AIInsightProps) {
  const [localInsights, setLocalInsights] = useState<AIInsightData>(insights);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});

  const handleChange = (key: keyof AIInsightData, value: string) => {
    const newInsights = { ...localInsights, [key]: value };
    setLocalInsights(newInsights);
    onInsightsChange?.(newInsights);
  };

  const handleBlur = (key: string) => {
    setIsEditing((prev) => ({ ...prev, [key]: false }));
  };

  const handleFocus = (key: string) => {
    setIsEditing((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 生成按钮 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI 洞察分析
        </h3>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            "bg-purple-50 text-purple-600 hover:bg-purple-100",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30"
          )}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isGenerating && "animate-spin")} />
          {isGenerating ? "生成中..." : "生成洞察"}
        </button>
      </div>

      {/* 洞察内容 */}
      <div className="flex flex-col gap-3">
        {insightTypes.map((type) => {
          const Icon = type.icon;
          const value = localInsights[type.key];
          const editing = isEditing[type.key];

          return (
            <div
              key={type.key}
              className={cn(
                "rounded-lg border p-3 transition-all duration-200",
                type.bgColor,
                type.borderColor,
                editing && "ring-2 ring-offset-1 ring-purple-400"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={cn(
                    "p-1.5 rounded-md",
                    "bg-white/80 dark:bg-neutral-800/80"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", type.color)} />
                </div>
                <span className={cn("text-xs font-semibold", type.color)}>
                  {type.label}
                </span>
              </div>
              <textarea
                value={value}
                onChange={(e) => handleChange(type.key, e.target.value)}
                onFocus={() => handleFocus(type.key)}
                onBlur={() => handleBlur(type.key)}
                placeholder={type.placeholder}
                className={cn(
                  "w-full text-sm text-neutral-700 dark:text-neutral-300",
                  "bg-transparent border-none resize-none focus:outline-none",
                  "placeholder:text-neutral-400"
                )}
                rows={2}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 简化版 AI Insight 用于播放模式
export function AIInsightCompact({
  insights,
  className,
}: {
  insights: AIInsightData;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-600">核心洞察</span>
        </div>
        <p className="text-sm text-neutral-700">{insights.core}</p>
      </div>
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-600">趋势分析</span>
        </div>
        <p className="text-sm text-neutral-700">{insights.trend}</p>
      </div>
      <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-600">策略建议</span>
        </div>
        <p className="text-sm text-neutral-700">{insights.strategy}</p>
      </div>
    </div>
  );
}

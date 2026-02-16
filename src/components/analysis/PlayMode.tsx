"use client";

import { useEffect, useCallback, useMemo } from "react";
import { PPTPage, QuadrantKeyword } from "@/types/analysis";
import { useDataStore } from "@/store/useDataStore";
import { RawDataRow } from "@/types";
import { X, ChevronLeft, ChevronRight, Play, TrendingUp, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMonthNumber } from "@/lib/data-processor";
import DOMPurify from "dompurify";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PlayModeProps {
  isOpen: boolean;
  pages: PPTPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
  category?: string;
}

// 维度颜色配置
const dimensionColors: Record<string, { primary: string; bg: string; light: string; border: string }> = {
  scene: { primary: "#7CB342", bg: "#E8F5E0", light: "#A3D18F", border: "#7CB342" },
  function: { primary: "#5C9CE6", bg: "#E3F2FD", light: "#90CAF9", border: "#5C9CE6" },
  material: { primary: "#AB47BC", bg: "#F3E5F5", light: "#CE93D8", border: "#AB47BC" },
  fit: { primary: "#FF7043", bg: "#FBE9E7", light: "#FFAB91", border: "#FF7043" },
  design: { primary: "#EC407A", bg: "#FCE4EC", light: "#F48FB1", border: "#EC407A" },
  other: { primary: "#78909C", bg: "#ECEFF1", light: "#B0BEC5", border: "#78909C" },
};

// 关键词卡片组件
function KeywordCard({
  keyword,
  category,
  rawData,
}: {
  keyword: QuadrantKeyword | undefined;
  category: string;
  rawData: RawDataRow[];
}) {
  const colors = keyword ? dimensionColors[keyword.dimension] : dimensionColors.other;

  // 获取关键词的月度数据
  const monthlyData = useMemo(() => {
    if (!keyword || !rawData.length || !category) return [];

    const data = rawData
      .filter(row => row.KEYWORDS === keyword.name && row.CATEGORY === category)
      .map(row => {
        const monthValue = row.MONTH || '';
        const monthNum = getMonthNumber(monthValue);
        return {
          month: monthValue,
          monthNum: monthNum,
          year: row.YEAR || 0,
          buzz: row.TTL_Buzz || 0,
          yoy: (row.TTL_Buzz_YOY || 0) * 100, // 转换为百分比
        };
      })
      .sort((a, b) => {
        // 先按年份排序，再按月份数字排序
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNum - b.monthNum;
      });

    return data;
  }, [keyword, rawData, category]);

  // 计算Y轴范围
  const { minYoy, maxYoy } = useMemo(() => {
    if (monthlyData.length === 0) return { minYoy: -100, maxYoy: 100 };

    const yoyValues = monthlyData.map(d => d.yoy);

    return {
      minYoy: Math.min(...yoyValues, 0),
      maxYoy: Math.max(...yoyValues, 0),
    };
  }, [monthlyData]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Card Header */}
      <div
        className="rounded-lg p-1.5 mb-1.5 flex items-center justify-between shrink-0"
        style={{ backgroundColor: colors.bg }}
      >
        <div className="flex items-center gap-2">
          {keyword ? (
            <>
              <span className="text-sm font-bold" style={{ color: colors.primary }}>
                {keyword.name}
              </span>
              <span className="text-[10px] text-neutral-500">
                {keyword.dimension === "scene" ? "场景" :
                 keyword.dimension === "function" ? "功能" :
                 keyword.dimension === "material" ? "材质" :
                 keyword.dimension === "fit" ? "版型" :
                 keyword.dimension === "design" ? "设计" : "其他"}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-neutral-400">空</span>
          )}
        </div>
        {keyword && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-bold" style={{ color: colors.primary }}>
                {keyword.heat.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span
                className={cn(
                  "text-xs font-bold",
                  keyword.growth >= 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {keyword.growth >= 0 ? "+" : ""}{keyword.growth.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1 flex gap-1 min-h-0">
        {/* Image Placeholders - 左右排列 */}
        <div className="flex gap-1 shrink-0 self-start">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-28 h-42 rounded bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center border border-neutral-200"
            >
              <span className="text-2xl text-neutral-300">📷</span>
            </div>
          ))}
        </div>

        {/* Combo Chart - Buzz柱状图 + YOY折线图 */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <div className="text-[9px] text-neutral-500 shrink-0">Buzz & YOY Trend</div>
          <div className="flex-1 min-h-0 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }} barCategoryGap="10%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 7, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                    padding={{ left: 0, right: 0 }}
                    tickFormatter={(value) => {
                      const match = String(value).match(/^(\d+)/);
                      return match ? match[1] : value;
                    }}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                    width={0}
                    domain={[0, 'dataMax']}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                    width={0}
                    domain={[minYoy - 20, maxYoy + 20]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '10px',
                      padding: '4px',
                    }}
                    formatter={(value, name) => {
                      const numValue = Number(value);
                      if (name === 'buzz') return [numValue.toLocaleString(), 'Buzz'];
                      if (name === 'yoy') return [`${numValue.toFixed(1)}%`, 'YOY'];
                      return [numValue, name];
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload;
                        return `${data.year || ''}年${label}`;
                      }
                      return String(label);
                    }}
                  />
                  <ReferenceLine yAxisId="right" y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                  <Bar
                    yAxisId="left"
                    dataKey="buzz"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    radius={[2, 2, 0, 0]}
                    name="buzz"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="yoy"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 2 }}
                    activeDot={{ r: 3, fill: '#10b981' }}
                    name="yoy"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-300 text-xs">
                暂无数据
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayMode({
  isOpen,
  pages,
  currentPage,
  onPageChange,
  onClose,
  category,
}: PlayModeProps) {
  const { rawData } = useDataStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (currentPage > 0) onPageChange(currentPage - 1);
          break;
        case "ArrowRight":
        case " ":
          if (currentPage < pages.length - 1) onPageChange(currentPage + 1);
          break;
      }
    },
    [isOpen, currentPage, pages.length, onPageChange, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const page = pages[currentPage];
  const hasKeywords = page.keywords.length > 0;

  // 获取主维度颜色（基于第一个关键词或默认）
  const primaryColor = page.keywords[0]
    ? dimensionColors[page.keywords[0].dimension]
    : dimensionColors.scene;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white">
            <Play className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold">演示模式</span>
          </div>
          <div className="h-4 w-px bg-neutral-700" />
          <span className="text-xs text-neutral-400">
            第 {currentPage + 1} / {pages.length} 页
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Page indicators */}
          <div className="flex items-center gap-1">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => onPageChange(index)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  currentPage === index
                    ? "bg-blue-500 w-4"
                    : "bg-neutral-600 hover:bg-neutral-500"
                )}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content - 16:9 Aspect Ratio Container */}
      <div className="flex-1 flex items-center justify-center p-4 bg-neutral-950">
        <div
          className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
          style={{ aspectRatio: "16/9", width: "80%", maxWidth: "1536px" }}
        >
          <div className="h-full flex flex-col p-6">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="text-[10px] text-neutral-400 tracking-widest uppercase mb-1">
                  CHINA DIGITAL
                </div>
                <h1 className="text-xl font-bold text-neutral-900 mb-2">
                  {page.category || "品类"} | Key Elements -{" "}
                  <span style={{ color: primaryColor.primary }}>
                    High Buzz & High Growth
                  </span>
                </h1>
                {hasKeywords && page.insights.core && (
                  <p
                    className="text-sm text-neutral-600 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        page.insights.core
                          .replace(/<span class="insight-tag[^"]*">[^<]*<\/span>/g, "")
                          .replace(/<span class="insight-highlight"/g, `<span style="color: ${primaryColor.primary}; font-weight: 600"`),
                        {
                          ALLOWED_TAGS: ['span'],
                          ALLOWED_ATTR: ['style', 'class']
                        }
                      )
                    }}
                  />
                )}
              </div>
              <div className="font-serif text-2xl font-bold text-neutral-700 cursor-pointer">
                F&F
              </div>
            </div>

            {/* Dimension Section Label */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${primaryColor.light} 0%, ${primaryColor.primary} 100%)` }}
                />
                <span className="text-sm font-bold" style={{ color: primaryColor.primary }}>
                  {page.keywords[0] ? (
                    page.keywords[0].dimension === "scene" ? "场景维度" :
                    page.keywords[0].dimension === "function" ? "功能维度" :
                    page.keywords[0].dimension === "material" ? "材质维度" :
                    page.keywords[0].dimension === "fit" ? "版型维度" :
                    page.keywords[0].dimension === "design" ? "设计维度" : "其他维度"
                  ) : "维度分析"}
                </span>
              </div>
              <span className="text-xs text-neutral-400">
                {page.keywords[0] ? (
                  page.keywords[0].dimension === "scene" ? "Scene Dimension" :
                  page.keywords[0].dimension === "function" ? "Function Dimension" :
                  page.keywords[0].dimension === "material" ? "Material Dimension" :
                  page.keywords[0].dimension === "fit" ? "Fit Dimension" :
                  page.keywords[0].dimension === "design" ? "Design Dimension" : "Other Dimension"
                ) : "Dimension Analysis"}
              </span>
            </div>

            {/* Main Content Grid */}
            {hasKeywords ? (
              <div
                className="flex-1 grid grid-cols-2 grid-rows-2 gap-2"
                style={{ border: `1px solid ${primaryColor.border}20`, borderRadius: "8px", padding: "6px", backgroundColor: `${primaryColor.bg}40` }}
              >
                {["top-left", "top-right", "bottom-left", "bottom-right"].map(
                  (position) => {
                    const keyword = page.keywords.find(
                      (kw) => kw.position === position
                    );
                    return (
                      <KeywordCard
                        key={position}
                        keyword={keyword}
                        category={category || page.category || ""}
                        rawData={rawData}
                      />
                    );
                  }
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg">暂无关键词数据</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    请在编辑模式下添加关键词
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-neutral-200">
              <div className="text-[10px] text-neutral-400 italic">
                Data Period: Jan 2026 - Dec 2026 | Source: SNS Analytics
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px]"
                  style={{ borderLeftColor: "#333" }}
                />
                <span className="text-xs font-semibold text-neutral-700">
                  {currentPage + 1} / {pages.length}
                </span>
                <div
                  className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px]"
                  style={{ borderRightColor: "#333" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-center gap-4 px-4 py-2 bg-neutral-900 border-t border-neutral-800">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          上一页
        </button>

        <span className="text-xs text-neutral-500 min-w-[60px] text-center">
          {currentPage + 1} / {pages.length}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pages.length - 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
        >
          下一页
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

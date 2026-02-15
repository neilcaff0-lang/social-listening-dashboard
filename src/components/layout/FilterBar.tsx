"use client";

import { useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import { Filter, X, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import CategoryFilter from "@/components/filters/CategoryFilter";
import TimeFilter from "@/components/filters/TimeFilter";
import QuadrantFilter from "@/components/filters/QuadrantFilter";
import KeywordSearch from "@/components/filters/KeywordSearch";

export default function FilterBar() {
  const { rawData, filters, clearFilters } = useDataStore();
  const [expanded, setExpanded] = useState(true);

  const hasData = rawData.length > 0;

  // 检查是否有任何筛选条件被激活
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.quadrants.length > 0 ||
    filters.keyword !== "";

  if (!hasData) return null;

  return (
    <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {/* 筛选栏头部 */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
        >
          <Filter className="h-4 w-4" />
          <span>筛选条件</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              已激活
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <RotateCcw className="h-3 w-3" />
            重置筛选
          </button>
        )}
      </div>

      {/* 筛选器内容 */}
      {expanded && (
        <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* 关键词搜索 */}
            <div className="min-w-0">
              <KeywordSearch />
            </div>

            {/* 品类筛选 */}
            <div className="min-w-0">
              <CategoryFilter />
            </div>

            {/* 时间筛选 */}
            <div className="min-w-0">
              <TimeFilter />
            </div>

            {/* 象限筛选 */}
            <div className="min-w-0">
              <QuadrantFilter />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

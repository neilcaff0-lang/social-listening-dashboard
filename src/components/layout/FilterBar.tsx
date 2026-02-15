"use client";

import { useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import { Filter, RotateCcw, ChevronDown, ChevronUp, X } from "lucide-react";
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

  // 计算激活的筛选数量
  const activeFilterCount =
    filters.categories.length +
    filters.quadrants.length +
    (filters.keyword ? 1 : 0);

  if (!hasData) return null;

  return (
    <div className="border-b border-[#E8ECF1] bg-white">
      {/* 筛选栏头部 */}
      <div className="flex items-center justify-between px-6 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F7FA] group-hover:bg-[#EEF1F5] transition-colors">
            <Filter className="h-4 w-4 text-[#5A6170]" />
          </div>
          <span className="text-sm font-semibold text-[#1A1D23]">筛选条件</span>
          {hasActiveFilters && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#a29bfe] px-1.5 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-[#9AA0AB]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#9AA0AB]" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-lg bg-[#F5F7FA] px-3 py-1.5 text-xs font-medium text-[#5A6170] hover:bg-[#EEF1F5] hover:text-[#1A1D23] transition-all"
          >
            <RotateCcw className="h-3 w-3" />
            重置筛选
          </button>
        )}
      </div>

      {/* 筛选器内容 */}
      {expanded && (
        <div className="border-t border-[#E8ECF1] bg-[#FAFBFC] px-6 py-4">
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

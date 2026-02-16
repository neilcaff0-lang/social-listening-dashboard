"use client";

import { useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import { Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import CategoryFilter from "@/components/filters/CategoryFilter";
import TimeFilter from "@/components/filters/TimeFilter";
import QuadrantFilter from "@/components/filters/QuadrantFilter";
import KeywordSearch from "@/components/filters/KeywordSearch";

export default function FilterBar() {
  const { rawData, filters, clearFilters } = useDataStore();
  const [expanded, setExpanded] = useState(false);

  const hasData = rawData.length > 0;

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.quadrants.length > 0 ||
    filters.keyword !== "";

  const activeFilterCount =
    filters.categories.length +
    filters.quadrants.length +
    (filters.keyword ? 1 : 0);

  if (!hasData) return null;

  return (
    <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {/* 筛选栏头部 - 紧凑的单行设计 */}
      <div className="flex items-center justify-between px-6 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="group flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center group-hover:bg-[hsl(var(--primary)/0.15)] transition-colors">
            <Filter className="h-4 w-4 text-[hsl(var(--primary))]" />
          </div>
          <span className="text-sm text-[hsl(var(--muted-foreground))]">筛选</span>
          {hasActiveFilters && (
            <span className="badge badge-primary text-[10px]">
              {activeFilterCount}
            </span>
          )}
          <div className="flex items-center justify-center h-5 w-5 rounded bg-[hsl(var(--muted))] group-hover:bg-[hsl(var(--accent))] transition-colors">
            {expanded ? (
              <ChevronUp className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
            ) : (
              <ChevronDown className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
            )}
          </div>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="btn btn-sm btn-ghost"
          >
            <RotateCcw className="h-3 w-3" />
            重置
          </button>
        )}
      </div>

      {/* 筛选器内容 - 展开时显示 */}
      {expanded && (
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-5">
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            <KeywordSearch />
            <CategoryFilter />
            <TimeFilter />
            <QuadrantFilter />
          </div>
        </div>
      )}
    </div>
  );
}

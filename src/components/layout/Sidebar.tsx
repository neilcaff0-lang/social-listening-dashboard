"use client";

import { useDataStore } from "@/store/useDataStore";
import { cn } from "@/lib/utils";
import { Filter, X, RotateCcw } from "lucide-react";
import CategoryFilter from "@/components/filters/CategoryFilter";
import TimeFilter from "@/components/filters/TimeFilter";
import QuadrantFilter from "@/components/filters/QuadrantFilter";
import KeywordSearch from "@/components/filters/KeywordSearch";

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, rawData, filters, clearFilters } = useDataStore();

  // 如果没有数据，显示提示
  const hasData = rawData.length > 0;

  // 检查是否有任何筛选条件被激活
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.quadrants.length > 0 ||
    filters.keyword !== '';

  return (
    <>
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 transform border-r bg-white transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-950",
          // 移动端：从左侧滑入/滑出
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // 桌面端：始终显示
          "md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* 侧边栏标题 */}
          <div className="flex items-center justify-between border-b px-4 py-3 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-neutral-500" />
              <span className="font-medium text-neutral-900 dark:text-neutral-50">
                筛选器
              </span>
            </div>
            {/* 移动端关闭按钮 */}
            <button
              onClick={toggleSidebar}
              className="rounded p-1 hover:bg-neutral-100 md:hidden dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4 text-neutral-500" />
            </button>
          </div>

          {/* 筛选器内容区域 */}
          <div className="flex-1 overflow-y-auto p-4">
            {hasData ? (
              <div className="space-y-6">
                {/* 关键词搜索 */}
                <KeywordSearch />

                {/* 品类筛选 */}
                <CategoryFilter />

                {/* 时间筛选 */}
                <TimeFilter />

                {/* 象限筛选 */}
                <QuadrantFilter />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-neutral-500">
                  请先导入数据
                </p>
              </div>
            )}
          </div>

          {/* 重置筛选按钮 */}
          {hasData && hasActiveFilters && (
            <div className="border-t p-4 dark:border-neutral-800">
              <button
                onClick={clearFilters}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <RotateCcw className="h-4 w-4" />
                重置筛选
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

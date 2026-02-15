'use client';

import { useDataStore } from '@/store/useDataStore';
import { X, Tag } from 'lucide-react';

export default function ActiveFilterTags() {
  const { filters, setFilters } = useDataStore();

  // 检查是否有任何筛选条件被激活
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.timeFilter.year !== undefined ||
    filters.timeFilter.months.length > 0 ||
    filters.quadrants.length > 0 ||
    (filters.keyword && filters.keyword.trim() !== '');

  if (!hasActiveFilters) {
    return null;
  }

  // 移除单个筛选条件
  const removeCategoryFilter = (category: string) => {
    setFilters({
      categories: filters.categories.filter((c) => c !== category),
    });
  };

  const removeQuadrantFilter = (quadrant: string) => {
    setFilters({
      quadrants: filters.quadrants.filter((q) => q !== quadrant),
    });
  };

  const removeKeywordFilter = () => {
    setFilters({ keyword: '' });
  };

  const removeTimeFilter = () => {
    setFilters({
      timeFilter: { year: undefined, months: [] },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-3 shadow-sm border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
      <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
        <Tag className="h-4 w-4" />
        <span>当前筛选:</span>
      </div>

      {/* 关键词筛选标签 */}
      {filters.keyword && filters.keyword.trim() !== '' && (
        <button
          onClick={removeKeywordFilter}
          className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
        >
          关键词: {filters.keyword}
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* 品类筛选标签 */}
      {filters.categories.map((category) => (
        <button
          key={category}
          onClick={() => removeCategoryFilter(category)}
          className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
        >
          {category}
          <X className="h-3.5 w-3.5" />
        </button>
      ))}

      {/* 时间筛选标签 */}
      {(filters.timeFilter.year !== undefined || filters.timeFilter.months.length > 0) && (
        <button
          onClick={removeTimeFilter}
          className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
        >
          {filters.timeFilter.year ? `${filters.timeFilter.year}年` : '时间筛选'}
          {filters.timeFilter.months.length > 0 && ` (${filters.timeFilter.months.length}个月)`}
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* 象限筛选标签 */}
      {filters.quadrants.map((quadrant) => (
        <button
          key={quadrant}
          onClick={() => removeQuadrantFilter(quadrant)}
          className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800"
        >
          {quadrant}
          <X className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

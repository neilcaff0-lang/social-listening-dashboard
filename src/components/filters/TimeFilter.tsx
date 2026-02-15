'use client';

import { useMemo, useEffect } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Checkbox } from '@/components/ui/Checkbox';

// 月份列表（支持英文缩写格式）
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 月份显示名称映射
const MONTH_DISPLAY_NAMES: Record<string, string> = {
  'Jan': '1月',
  'Feb': '2月',
  'Mar': '3月',
  'Apr': '4月',
  'May': '5月',
  'Jun': '6月',
  'Jul': '7月',
  'Aug': '8月',
  'Sep': '9月',
  'Oct': '10月',
  'Nov': '11月',
  'Dec': '12月',
};

export default function TimeFilter() {
  const { rawData, filters, setPendingFilters, setFilters } = useDataStore();

  // 从数据中动态获取可用的年份
  const availableYears = useMemo(() => {
    const years = new Set(rawData.map((row) => row.YEAR));
    return Array.from(years).sort((a, b) => b - a);
  }, [rawData]);

  // 自动选择第一个可用年份（如果当前没有选择年份）
  useEffect(() => {
    if (availableYears.length > 0 && filters.timeFilter.year === undefined) {
      const defaultYear = availableYears[0];
      const defaultMonths = Array.from(
        new Set(
          rawData
            .filter((row) => row.YEAR === defaultYear)
            .map((row) => row.MONTH)
        )
      );
      setFilters({
        timeFilter: { year: defaultYear, months: defaultMonths },
      });
    }
  }, [availableYears, filters.timeFilter.year, rawData, setFilters]);

  // 从数据中动态获取可用的月份（基于选中的年份）
  const availableMonths = useMemo(() => {
    const selectedYear = filters.timeFilter.year;
    if (!selectedYear) return [];
    const months = new Set(
      rawData
        .filter((row) => row.YEAR === selectedYear)
        .map((row) => row.MONTH)
    );
    return MONTHS.filter((month) => months.has(month));
  }, [rawData, filters.timeFilter.year]);

  const handleYearChange = (year: number) => {
    // 切换年份时，重置月份为该年份可用的月份
    const defaultMonths = rawData
      .filter((row) => row.YEAR === year)
      .map((row) => row.MONTH);
    const uniqueMonths = Array.from(new Set(defaultMonths));
    setPendingFilters({
      timeFilter: { year, months: uniqueMonths },
    });
  };

  const handleMonthChange = (month: string, checked: boolean) => {
    const currentMonths = filters.timeFilter.months;
    if (checked) {
      setPendingFilters({
        timeFilter: { ...filters.timeFilter, months: [...currentMonths, month] },
      });
    } else {
      setPendingFilters({
        timeFilter: {
          ...filters.timeFilter,
          months: currentMonths.filter((m) => m !== month),
        },
      });
    }
  };

  const handleSelectAllMonths = (checked: boolean) => {
    if (checked) {
      setPendingFilters({
        timeFilter: { ...filters.timeFilter, months: availableMonths },
      });
    } else {
      setPendingFilters({
        timeFilter: { ...filters.timeFilter, months: [] },
      });
    }
  };

  const allMonthsSelected =
    availableMonths.length > 0 &&
    filters.timeFilter.months.length === availableMonths.length;
  const someMonthsSelected =
    filters.timeFilter.months.length > 0 && !allMonthsSelected;

  const selectedYear = filters.timeFilter.year;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        时间筛选
      </h3>
      <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        {availableYears.length > 0 ? (
          <div className="space-y-3">
            {/* 年份选择 */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-500">年份</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year} 年
                  </option>
                ))}
              </select>
            </div>

            {/* 月份多选 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-neutral-500">月份</label>
                <button
                  type="button"
                  onClick={() => handleSelectAllMonths(!allMonthsSelected)}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {allMonthsSelected ? '取消全选' : '全选'}
                </button>
              </div>
              {availableMonths.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {availableMonths.map((month) => (
                    <Checkbox
                      key={month}
                      label={MONTH_DISPLAY_NAMES[month] || month}
                      checked={filters.timeFilter.months.includes(month)}
                      onCheckedChange={(checked) =>
                        handleMonthChange(month, checked ?? false)
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400">该年份无可用月份</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">暂无时间数据</p>
        )}
      </div>
    </div>
  );
}

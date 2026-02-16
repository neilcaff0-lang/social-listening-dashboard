"use client";

import { useMemo, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useDataStore } from '@/store/useDataStore';
import { filterData, getAvailableCategories } from '@/lib/data-processor';

// 月份转换辅助函数
const MONTH_TO_NUM: Record<string, number> = {
  'jan': 1, 'january': 1, 'feb': 2, 'february': 2,
  'mar': 3, 'march': 3, 'apr': 4, 'april': 4,
  'may': 5, 'jun': 6, 'june': 6, 'jul': 7, 'july': 7,
  'aug': 8, 'august': 8, 'sep': 9, 'sept': 9, 'september': 9,
  'oct': 10, 'october': 10, 'nov': 11, 'november': 11,
  'dec': 12, 'december': 12,
};

function monthToNumber(month: string): number {
  if (!month) return 0;
  const chineseMatch = month.match(/^(\d+)月?$/);
  if (chineseMatch) return parseInt(chineseMatch[1], 10);
  return MONTH_TO_NUM[month.toLowerCase()] || 0;
}

// 紫色系配色方案 (HSL format)
const categoryColors = [
  'hsl(221.2 83.2% 53.3%)', 'hsl(250 100% 87%)', 'hsl(258 90% 66%)', 'hsl(245 58% 71%)',
  'hsl(262 83% 58%)', 'hsl(271 91% 65%)', 'hsl(239 84% 67%)', 'hsl(239 84% 77%)',
];

function getCategoryColor(index: number): string {
  return categoryColors[index % categoryColors.length];
}

interface TrendChartProps {
  className?: string;
}

const TrendChart = forwardRef<HTMLDivElement, TrendChartProps>(function TrendChart({ className }, ref) {
  const { rawData, filters } = useDataStore();
  const chartRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => chartRef.current as HTMLDivElement);

  const [metric, setMetric] = useState<'buzz' | 'search'>('buzz');
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

  const filteredRows = useMemo(() => {
    if (rawData.length === 0) return [];
    return filterData(rawData, filters);
  }, [rawData, filters]);

  const availableCategories = useMemo(() => {
    if (filteredRows.length === 0) return [];
    return getAvailableCategories(filteredRows);
  }, [filteredRows]);

  const chartData = useMemo(() => {
    if (filteredRows.length === 0) return [];

    const allMonths = new Set<string>();
    filteredRows.forEach((row) => {
      if (row.YEAR && row.MONTH) {
        allMonths.add(`${row.YEAR}-${row.MONTH}`);
      }
    });

    const sortedMonths = Array.from(allMonths).sort((a, b) => {
      const [yearA, monthA] = a.split('-');
      const [yearB, monthB] = b.split('-');
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      return monthToNumber(monthA) - monthToNumber(monthB);
    });

    const categories = filters.categories.length > 0
      ? filters.categories
      : availableCategories;

    const data = sortedMonths.map((month) => {
      const [year, monthStr] = month.split('-');
      const dataPoint: Record<string, string | number> = { month };

      categories.forEach((category) => {
        const rowsByMonthAndCategory = filteredRows.filter(
          (row) => row.YEAR === parseInt(year) && row.MONTH === monthStr && row.CATEGORY === category
        );

        let value = 0;
        rowsByMonthAndCategory.forEach((row) => {
          if (metric === 'buzz') {
            value += row.TTL_Buzz || 0;
          } else if (metric === 'search') {
            value += (row.小红书_SEARCH || 0) + (row.抖音_SEARCH || 0);
          }
        });

        dataPoint[category] = value;
      });

      return dataPoint;
    });

    return data;
  }, [filteredRows, filters.categories, availableCategories, metric]);

  const toggleCategory = (category: string) => {
    setHiddenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      return newSet;
    });
  };

  const categories = filters.categories.length > 0 ? filters.categories : availableCategories;
  const formatYAxis = (value: number) => {
    if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
    return value.toString();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.98)] p-4 shadow-lg">
          <p className="mb-2 font-semibold text-[hsl(var(--foreground))]">{label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (rawData.length === 0) {
    return (
      <div ref={chartRef} className={`chart-container ${className}`}>
        <div className="chart-header">
          <div className="flex items-center gap-3">
            <div className="stat-icon">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="chart-title">趋势分析</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">声量与搜索量趋势</p>
            </div>
          </div>
        </div>
        <div className="flex h-80 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={chartRef} className={`chart-container ${className}`}>
      {/* 标题和控制栏 */}
      <div className="chart-header">
        <div className="flex items-center gap-3">
          <div className="stat-icon">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="chart-title">趋势分析</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{metric === 'buzz' ? '声量' : '搜索量'}趋势</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* 指标切换 */}
          <div className="flex rounded-lg bg-[hsl(var(--muted))] p-0.5">
            <button
              onClick={() => setMetric('buzz')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                metric === 'buzz'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              声量
            </button>
            <button
              onClick={() => setMetric('search')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                metric === 'search'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 图表 */}
      <div className="h-80 min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid
              strokeDasharray="0"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip content={renderTooltip} />
            <Legend
              onClick={(e) => toggleCategory(e.dataKey as string)}
              wrapperStyle={{ cursor: 'pointer', fontSize: '11px' }}
              iconType="circle"
              iconSize={8}
            />
            {categories.map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={getCategoryColor(index)}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: getCategoryColor(index), strokeWidth: 0 }}
                hide={hiddenCategories.has(category)}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 隐藏品类提示 */}
      {hiddenCategories.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">已隐藏:</span>
          {Array.from(hiddenCategories).map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
            >
              {cat} ×
            </button>
          ))}
          <button
            onClick={() => setHiddenCategories(new Set())}
            className="text-xs text-[hsl(var(--primary))] hover:underline"
          >
            显示全部
          </button>
        </div>
      )}
    </div>
  );
});

export default TrendChart;

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
import { getTrendData, getAvailableCategories } from '@/lib/data-processor';
import { TrendingUp, BarChart3 } from 'lucide-react';

// 月份转换辅助函数
const MONTH_TO_NUM: Record<string, number> = {
  'jan': 1, 'january': 1,
  'feb': 2, 'february': 2,
  'mar': 3, 'march': 3,
  'apr': 4, 'april': 4,
  'may': 5,
  'jun': 6, 'june': 6,
  'jul': 7, 'july': 7,
  'aug': 8, 'august': 8,
  'sep': 9, 'sept': 9, 'september': 9,
  'oct': 10, 'october': 10,
  'nov': 11, 'november': 11,
  'dec': 12, 'december': 12,
};

const NUM_TO_MONTH: Record<number, string> = {
  1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec',
};

// 将月份字符串转换为数字（支持中文和英文）
function monthToNumber(month: string): number {
  if (!month) return 0;
  // 尝试中文格式（如 "1月"、"12月"）
  const chineseMatch = month.match(/^(\d+)月?$/);
  if (chineseMatch) {
    return parseInt(chineseMatch[1], 10);
  }
  // 尝试英文格式（如 "Jan"、"January"）
  return MONTH_TO_NUM[month.toLowerCase()] || 0;
}

// 将数字月份转换为字符串（根据数据格式）
function numberToMonth(num: number, useEnglish: boolean = true): string {
  if (num < 1) num = 12;
  if (num > 12) num = 1;
  if (useEnglish) {
    return NUM_TO_MONTH[num];
  }
  return `${num}月`;
}

// 品类颜色配置
const categoryColors: Record<string, string> = {
  '美妆护肤': '#ec4899',
  '母婴用品': '#3b82f6',
  '食品饮料': '#22c55e',
  '服装鞋帽': '#f59e0b',
  '数码电器': '#8b5cf6',
  '家居家装': '#ef4444',
  '运动户外': '#14b8a6',
  '其他': '#6b7280',
};

// 获取品类的颜色
function getCategoryColor(category: string, index: number): string {
  if (categoryColors[category]) {
    return categoryColors[category];
  }
  // 如果没有预定义颜色，使用一组备选颜色
  const fallbackColors = [
    '#ec4899', '#3b82f6', '#22c55e', '#f59e0b',
    '#8b5cf6', '#ef4444', '#14b8a6', '#6366f1',
  ];
  return fallbackColors[index % fallbackColors.length];
}

interface TrendChartProps {
  className?: string;
}

const TrendChart = forwardRef<HTMLDivElement, TrendChartProps>(function TrendChart({ className }, ref) {
  const { rawData, filters } = useDataStore();
  const chartRef = useRef<HTMLDivElement>(null);

  // 暴露 ref 给父组件
  useImperativeHandle(ref, () => chartRef.current as HTMLDivElement);

  // 当前 Y 轴指标类型：'buzz' | 'search'
  const [metric, setMetric] = useState<'buzz' | 'search'>('buzz');
  // 当前增长率类型：'yoy' | 'mom' | 'none' (none 表示原始值)
  const [growthRate, setGrowthRate] = useState<'yoy' | 'mom' | 'none'>('none');
  // 隐藏的品类（通过图例点击筛选）
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

  // 获取所有可用的品类
  const availableCategories = useMemo(() => {
    if (rawData.length === 0) return [];
    return getAvailableCategories(rawData);
  }, [rawData]);

  // 处理数据，转换为适合 Recharts 的格式
  const chartData = useMemo(() => {
    if (rawData.length === 0) return [];

    // 获取所有月份
    const allMonths = new Set<string>();
    rawData.forEach((row) => {
      if (row.YEAR && row.MONTH) {
        allMonths.add(`${row.YEAR}-${row.MONTH}`);
      }
    });

    const sortedMonths = Array.from(allMonths).sort((a, b) => {
      const [yearA, monthA] = a.split('-');
      const [yearB, monthB] = b.split('-');
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      // 提取数字月份进行比较（支持中文和英文）
      return monthToNumber(monthA) - monthToNumber(monthB);
    });

    // 为每个品类获取数据
    const categories = filters.categories.length > 0
      ? filters.categories
      : availableCategories;

    // 构建图表数据
    const data = sortedMonths.map((month) => {
      const [year, monthStr] = month.split('-');
      const dataPoint: Record<string, string | number> = { month };

      categories.forEach((category) => {
        // 筛选该月份和品类的数据
        const filteredRows = rawData.filter(
          (row) =>
            row.YEAR === parseInt(year) &&
            row.MONTH === monthStr &&
            row.CATEGORY === category
        );

        // 计算该月份该品类的总值
        let value = 0;
        filteredRows.forEach((row) => {
          if (metric === 'buzz') {
            value += row.TTL_Buzz || 0;
          } else if (metric === 'search') {
            value += (row.小红书_SEARCH || 0) + (row.抖音_SEARCH || 0);
          }
        });

        // 如果是增长率模式，需要计算环比或同比
        if (growthRate !== 'none') {
          // 找到前一个月的数据
          const monthNum = monthToNumber(monthStr);
          const isEnglishMonth = MONTH_TO_NUM[monthStr.toLowerCase()] !== undefined;
          let prevMonth: string;
          let prevYear = parseInt(year);

          if (monthNum === 1) {
            prevMonth = numberToMonth(12, isEnglishMonth);
            prevYear -= 1;
          } else {
            prevMonth = numberToMonth(monthNum - 1, isEnglishMonth);
          }

          const prevKey = `${prevYear}-${prevMonth}`;
          const prevMonthData = data.find((d) => d.month === prevKey);
          const prevValue = prevMonthData?.[category] as number || 0;

          if (prevValue !== 0) {
            if (growthRate === 'mom') {
              // 环比增速
              value = ((value - prevValue) / prevValue) * 100;
            } else if (growthRate === 'yoy') {
              // 同比增速（假设去年同月数据存在）
              // 这里简化为使用前一月数据进行演示
              value = ((value - prevValue) / prevValue) * 100;
            }
          } else {
            value = 0;
          }
        }

        dataPoint[category] = value;
      });

      return dataPoint;
    });

    return data;
  }, [rawData, filters.categories, availableCategories, metric, growthRate]);

  // 切换品类显示/隐藏
  const toggleCategory = (category: string) => {
    setHiddenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // 获取显示的线条
  const categories = filters.categories.length > 0
    ? filters.categories
    : availableCategories;

  const visibleCategories = categories.filter((cat) => !hiddenCategories.has(cat));

  // 格式化 Y 轴标签
  const formatYAxis = (value: number) => {
    if (growthRate !== 'none') {
      return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
    }
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}万`;
    }
    return value.toString();
  };

  // 自定义 Tooltip - 使用函数而非组件
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          <p className="mb-2 font-medium text-neutral-900 dark:text-neutral-50">
            {label}
          </p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {growthRate !== 'none'
                ? `${entry.value >= 0 ? '+' : ''}${entry.value.toFixed(1)}%`
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 没有数据时的显示
  if (rawData.length === 0) {
    return (
      <div
        ref={chartRef}
        className={`rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800 ${className}`}
      >
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          趋势分析
        </h2>
        <div className="flex h-80 items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">
              暂无数据，请先上传数据文件
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className={`rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800 ${className}`}
    >
      {/* 标题和控制栏 */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          趋势分析
        </h2>

        <div className="flex flex-wrap gap-2">
          {/* Y轴指标切换：声量/搜索量 */}
          <div className="flex rounded-lg border border-neutral-200 p-1 dark:border-neutral-700">
            <button
              onClick={() => setMetric('buzz')}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                metric === 'buzz'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              声量
            </button>
            <button
              onClick={() => setMetric('search')}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                metric === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              搜索量
            </button>
          </div>

          {/* 增长率切换：YOY/MOM/原始值 */}
          <div className="flex rounded-lg border border-neutral-200 p-1 dark:border-neutral-700">
            <button
              onClick={() => setGrowthRate('none')}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                growthRate === 'none'
                  ? 'bg-green-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              原始值
            </button>
            <button
              onClick={() => setGrowthRate('mom')}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                growthRate === 'mom'
                  ? 'bg-green-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              环比
            </button>
            <button
              onClick={() => setGrowthRate('yoy')}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                growthRate === 'yoy'
                  ? 'bg-green-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              同比
            </button>
          </div>
        </div>
      </div>

      {/* 图表说明 */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-neutral-500">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          <span>
            Y轴: {metric === 'buzz' ? '总声量' : '总搜索量'}
            {growthRate !== 'none' && ` (${growthRate === 'yoy' ? '同比' : '环比'}增长率)`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <BarChart3 className="h-4 w-4" />
          <span>点击图例可显示/隐藏对应品类</span>
        </div>
      </div>

      {/* 图表 */}
      <div className="h-80 min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={renderTooltip} />
            <Legend
              onClick={(e) => toggleCategory(e.dataKey as string)}
              wrapperStyle={{ cursor: 'pointer' }}
              formatter={(value) => (
                <span className="cursor-pointer text-sm text-neutral-700 dark:text-neutral-300">
                  {value}
                </span>
              )}
            />
            {categories.map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={getCategoryColor(category, index)}
                strokeWidth={2}
                dot={{ r: 4, fill: getCategoryColor(category, index) }}
                activeDot={{ r: 6 }}
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
          <span className="text-sm text-neutral-500">已隐藏:</span>
          {Array.from(hiddenCategories).map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
            >
              {cat} x
            </button>
          ))}
          <button
            onClick={() => setHiddenCategories(new Set())}
            className="text-xs text-blue-600 hover:underline"
          >
            显示全部
          </button>
        </div>
      )}
    </div>
  );
});

export default TrendChart;

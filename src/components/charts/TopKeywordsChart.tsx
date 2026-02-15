"use client";

import { useMemo, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useDataStore } from '@/store/useDataStore';
import { getTopKeywords } from '@/lib/data-processor';
import { BarChart3, TrendingUp, TrendingDown, Search, Info } from 'lucide-react';
import { ChartDataPoint } from '@/types';

interface TopKeywordsChartProps {
  className?: string;
}

// 颜色配置
const BAR_COLORS = [
  '#3b82f6', // 蓝色
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#f59e0b', // 橙色
  '#22c55e', // 绿色
  '#06b6d4', // 青色
  '#ef4444', // 红色
  '#14b8a6', // 青色
  '#f97316', // 橙红
  '#6366f1', // 靛蓝
];

const TopKeywordsChart = forwardRef<HTMLDivElement, TopKeywordsChartProps>(function TopKeywordsChart({ className }, ref) {
  const { rawData, filters } = useDataStore();
  const chartRef = useRef<HTMLDivElement>(null);

  // 暴露 ref 给父组件
  useImperativeHandle(ref, () => chartRef.current as HTMLDivElement);

  // 当前显示数量：10 或 20
  const [limit, setLimit] = useState<10 | 20>(10);
  // 当前排序方式：'buzz' | 'yoy' | 'search'
  const [sortBy, setSortBy] = useState<'buzz' | 'yoy' | 'search'>('buzz');
  // 高亮的关键词
  const [highlightedKeyword, setHighlightedKeyword] = useState<string | null>(null);
  // 详情弹窗
  const [selectedKeyword, setSelectedKeyword] = useState<ChartDataPoint | null>(null);

  // 获取 Top 关键词数据
  const chartData = useMemo(() => {
    if (rawData.length === 0) return [];
    return getTopKeywords(rawData, filters, limit, sortBy);
  }, [rawData, filters, limit, sortBy]);

  // 格式化数值
  const formatValue = (value: number) => {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}万`;
    }
    return value.toLocaleString();
  };

  // 格式化 YOY
  const formatYoy = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // 自定义 Tooltip - 使用函数而非组件
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          <p className="mb-2 font-semibold text-neutral-900 dark:text-neutral-50">
            {data.keyword}
          </p>
          <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            <p>品类: {data.category}</p>
            <p>声量: {formatValue(data.buzz)}</p>
            <p>搜索量: {formatValue(data.search)}</p>
            <p className={data.yoy >= 0 ? 'text-green-600' : 'text-red-600'}>
              同比增速: {formatYoy(data.yoy)}
            </p>
            <p>象限: {data.quadrant}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // 处理点击事件
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const payload = data.activePayload[0].payload;
      setHighlightedKeyword(payload.keyword);
      setSelectedKeyword(payload);
    }
  };

  // 没有数据时的显示
  if (rawData.length === 0) {
    return (
      <div
        ref={chartRef}
        className={`rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800 ${className}`}
      >
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Top 关键词排行
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
          Top 关键词排行
        </h2>

        <div className="flex flex-wrap gap-2">
          {/* 显示数量切换：Top 10 / Top 20 */}
          <div className="flex rounded-lg border border-neutral-200 p-1 dark:border-neutral-700">
            <button
              onClick={() => setLimit(10)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                limit === 10
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              Top 10
            </button>
            <button
              onClick={() => setLimit(20)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                limit === 20
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              Top 20
            </button>
          </div>

          {/* 排序方式切换：声量/增速/搜索量 */}
          <div className="flex rounded-lg border border-neutral-200 p-1 dark:border-neutral-700">
            <button
              onClick={() => setSortBy('buzz')}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                sortBy === 'buzz'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              声量
            </button>
            <button
              onClick={() => setSortBy('yoy')}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                sortBy === 'yoy'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              增速
            </button>
            <button
              onClick={() => setSortBy('search')}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                sortBy === 'search'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              搜索量
            </button>
          </div>
        </div>
      </div>

      {/* 图表说明 */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-neutral-500">
        <div className="flex items-center gap-1">
          <BarChart3 className="h-4 w-4" />
          <span>排序: {sortBy === 'buzz' ? '声量' : sortBy === 'yoy' ? '同比增速' : '搜索量'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Info className="h-4 w-4" />
          <span>点击柱状图查看详情</span>
        </div>
      </div>

      {/* 图表 */}
      <div className="h-[500px] min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={formatValue}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              type="category"
              dataKey="keyword"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={90}
            />
            <Tooltip content={renderTooltip} />
            <Bar
              dataKey={sortBy}
              radius={[0, 4, 4, 0]}
              onClick={handleBarClick}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={highlightedKeyword === entry.keyword ? '#f59e0b' : BAR_COLORS[index % BAR_COLORS.length]}
                  stroke={highlightedKeyword === entry.keyword ? '#d97706' : 'transparent'}
                  strokeWidth={highlightedKeyword === entry.keyword ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* YOY 增长标签图例 */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <span className="text-neutral-500">YOY 增长:</span>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
          <span className="text-neutral-600 dark:text-neutral-400">正增长</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-red-500"></span>
          <span className="text-neutral-600 dark:text-neutral-400">负增长</span>
        </div>
      </div>

      {/* 关键词详情列表（带 YOY 标签） */}
      <div className="mt-4 grid max-h-48 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        {chartData.map((item, index) => (
          <button
            key={item.keyword}
            onClick={() => handleBarClick(item)}
            className={`flex items-center justify-between rounded-lg border p-2 text-left transition-all hover:shadow-md ${
              highlightedKeyword === item.keyword
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800'
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                {index + 1}
              </span>
              <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">
                {item.keyword}
              </span>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {item.yoy >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs font-medium ${item.yoy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatYoy(item.yoy)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 详情弹窗 */}
      {selectedKeyword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="m-4 max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                关键词详情
              </h3>
              <button
                onClick={() => setSelectedKeyword(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-neutral-500">关键词</span>
                <p className="font-medium text-neutral-900 dark:text-neutral-50">
                  {selectedKeyword.keyword}
                </p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">品类</span>
                <p className="text-neutral-900 dark:text-neutral-50">
                  {selectedKeyword.category}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-neutral-500">声量</span>
                  <p className="text-neutral-900 dark:text-neutral-50">
                    {formatValue(selectedKeyword.buzz)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-neutral-500">搜索量</span>
                  <p className="text-neutral-900 dark:text-neutral-50">
                    {formatValue(selectedKeyword.search)}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-sm text-neutral-500">同比增速</span>
                <p className={`font-medium ${selectedKeyword.yoy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatYoy(selectedKeyword.yoy)}
                </p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">象限</span>
                <p className="text-neutral-900 dark:text-neutral-50">
                  {selectedKeyword.quadrant}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedKeyword(null)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TopKeywordsChart;

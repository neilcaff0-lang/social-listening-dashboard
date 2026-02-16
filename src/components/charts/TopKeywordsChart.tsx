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
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import { ChartDataPoint } from '@/types';

interface TopKeywordsChartProps {
  className?: string;
}

// 紫色系配色
const BAR_COLORS = [
  '#6C5CE7', '#a29bfe', '#8B5CF6', '#A78BFA',
  '#7C3AED', '#9333EA', '#6366F1', '#818CF8',
  '#a855f7', '#c084fc',
];

const TopKeywordsChart = forwardRef<HTMLDivElement, TopKeywordsChartProps>(function TopKeywordsChart({ className }, ref) {
  const { rawData, filters } = useDataStore();
  const chartRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => chartRef.current as HTMLDivElement);

  const [limit, setLimit] = useState<10 | 20>(10);
  const [sortBy, setSortBy] = useState<'buzz' | 'yoy' | 'search'>('buzz');
  const [highlightedKeyword, setHighlightedKeyword] = useState<string | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<ChartDataPoint | null>(null);

  const chartData = useMemo(() => {
    if (rawData.length === 0) return [];
    return getTopKeywords(rawData, filters, limit, sortBy);
  }, [rawData, filters, limit, sortBy]);

  const formatValue = (value: number) => {
    if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
    return value.toLocaleString();
  };

  const formatYoy = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="rounded-xl border border-[#E2E8F0] bg-white/98 p-4 shadow-lg">
          <p className="mb-2 font-semibold text-[#0F1419]">{data.keyword}</p>
          <div className="space-y-1 text-xs text-[#718096]">
            <p>品类: {data.category}</p>
            <p>声量: {formatValue(data.buzz)}</p>
            <p>搜索量: {formatValue(data.search)}</p>
            <p className={data.yoy >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
              同比增速: {formatYoy(data.yoy)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const payload = data.activePayload[0].payload;
      setHighlightedKeyword(payload.keyword);
      setSelectedKeyword(payload);
    }
  };

  if (rawData.length === 0) {
    return (
      <div ref={chartRef} className={`rounded-2xl bg-white p-6 ${className}`}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] flex items-center justify-center shadow-md shadow-[#6C5CE7]/20">
            <Award className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F1419]">Top 关键词排行</h3>
            <p className="text-[10px] text-[#A0AEC0]">声量与增长分析</p>
          </div>
        </div>
        <div className="flex h-80 items-center justify-center rounded-xl bg-[#F8FAFC]">
          <p className="text-sm text-[#A0AEC0]">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={chartRef} className={`rounded-2xl bg-white p-6 ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}>
      {/* 标题和控制栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] flex items-center justify-center shadow-md shadow-[#6C5CE7]/20">
            <Award className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F1419]">Top 关键词排行</h3>
            <p className="text-[10px] text-[#A0AEC0]">按{sortBy === 'buzz' ? '声量' : sortBy === 'yoy' ? '增速' : '搜索量'}排序</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* 显示数量 */}
          <div className="flex rounded-lg bg-[#F8FAFC] p-0.5">
            <button
              onClick={() => setLimit(10)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                limit === 10 ? 'bg-white text-[#6C5CE7] shadow-sm' : 'text-[#A0AEC0] hover:text-[#718096]'
              }`}
            >
              Top 10
            </button>
            <button
              onClick={() => setLimit(20)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                limit === 20 ? 'bg-white text-[#6C5CE7] shadow-sm' : 'text-[#A0AEC0] hover:text-[#718096]'
              }`}
            >
              Top 20
            </button>
          </div>

          {/* 排序方式 */}
          <div className="flex rounded-lg bg-[#F8FAFC] p-0.5">
            <button
              onClick={() => setSortBy('buzz')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                sortBy === 'buzz' ? 'bg-white text-[#6C5CE7] shadow-sm' : 'text-[#A0AEC0] hover:text-[#718096]'
              }`}
            >
              声量
            </button>
            <button
              onClick={() => setSortBy('yoy')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                sortBy === 'yoy' ? 'bg-white text-[#6C5CE7] shadow-sm' : 'text-[#A0AEC0] hover:text-[#718096]'
              }`}
            >
              增速
            </button>
            <button
              onClick={() => setSortBy('search')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                sortBy === 'search' ? 'bg-white text-[#6C5CE7] shadow-sm' : 'text-[#A0AEC0] hover:text-[#718096]'
              }`}
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 图表 */}
      <div className="h-[420px] min-h-[380px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={380}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="0" stroke="#F1F5F9" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={formatValue}
              tick={{ fontSize: 10, fill: '#A0AEC0' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              type="category"
              dataKey="keyword"
              tick={{ fontSize: 10, fill: '#718096' }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip content={renderTooltip} />
            <Bar
              dataKey={sortBy}
              radius={[0, 6, 6, 0]}
              onClick={handleBarClick}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={highlightedKeyword === entry.keyword ? '#F59E0B' : BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 关键词列表 */}
      <div className="mt-4 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto lg:grid-cols-3">
        {chartData.map((item, index) => (
          <button
            key={item.keyword}
            onClick={() => handleBarClick(item)}
            className={`flex items-center justify-between rounded-lg p-2 text-left transition-all ${
              highlightedKeyword === item.keyword
                ? 'bg-[#6C5CE7]/10 ring-1 ring-[#6C5CE7]/30'
                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9]'
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-[10px] font-semibold text-[#6C5CE7]">
                {index + 1}
              </span>
              <span className="truncate text-xs font-medium text-[#0F1419]">
                {item.keyword}
              </span>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {item.yoy >= 0 ? (
                <TrendingUp className="h-3 w-3 text-[#10B981]" />
              ) : (
                <TrendingDown className="h-3 w-3 text-[#EF4444]" />
              )}
              <span className={`text-[10px] font-semibold ${item.yoy >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {formatYoy(item.yoy)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 详情弹窗 */}
      {selectedKeyword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedKeyword(null)}>
          <div className="m-4 max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F1419]">关键词详情</h3>
              <button
                onClick={() => setSelectedKeyword(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#A0AEC0] hover:bg-[#F1F5F9] hover:text-[#718096]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-[#A0AEC0]">关键词</span>
                <p className="font-semibold text-[#0F1419]">{selectedKeyword.keyword}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-[#A0AEC0]">声量</span>
                  <p className="text-sm font-semibold text-[#0F1419]">{formatValue(selectedKeyword.buzz)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#A0AEC0]">搜索量</span>
                  <p className="text-sm font-semibold text-[#0F1419]">{formatValue(selectedKeyword.search)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#A0AEC0]">同比增速</span>
                <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  selectedKeyword.yoy >= 0 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                }`}>
                  {selectedKeyword.yoy >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {formatYoy(selectedKeyword.yoy)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TopKeywordsChart;

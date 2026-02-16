"use client";

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/store/useDataStore';
import { filterData } from '@/lib/data-processor';
import { cn } from '@/lib/utils';
import { TrendingUp, Hash, Search, Award, ArrowLeft } from 'lucide-react';

interface SingleSubcategoryInsightProps {
  category: string;
  subcategory: string;
  onBack: () => void;
  className?: string;
}

interface SubcategoryDetailMetrics {
  totalBuzz: number;
  avgYoy: number;
  avgMom: number;
  xhsBuzz: number;
  dyBuzz: number;
  xhsSearch: number;
  dySearch: number;
  keywordCount: number;
  monthlyTrend: { month: string; buzz: number; yoy: number }[];
  topKeywords: { keyword: string; buzz: number; yoy: number; search: number }[];
  platformDistribution: { platform: string; value: number; color: string }[];
  growthTrend: 'up' | 'down' | 'stable';
}

export default function SingleSubcategoryInsight({
  category,
  subcategory,
  onBack,
  className,
}: SingleSubcategoryInsightProps) {
  const { rawData, filters } = useDataStore();

  const metrics = useMemo((): SubcategoryDetailMetrics | null => {
    if (rawData.length === 0) return null;

    const filteredData = filterData(rawData, filters).filter(
      (row) => row.CATEGORY === category && row.SUBCATEGORY === subcategory
    );

    if (filteredData.length === 0) return null;

    const totalBuzz = filteredData.reduce((sum, row) => sum + (row.TTL_Buzz || 0), 0);
    const xhsBuzz = filteredData.reduce((sum, row) => sum + (row.小红书_Buzz || 0), 0);
    const dyBuzz = filteredData.reduce((sum, row) => sum + (row.抖音_Buzz || 0), 0);
    const avgYoy = filteredData.reduce((sum, row) => sum + (row.TTL_Buzz_YOY || 0), 0) / filteredData.length;
    const avgMom = filteredData.reduce((sum, row) => sum + (row.TTL_Buzz_MOM || 0), 0) / filteredData.length;
    const xhsSearch = filteredData.reduce((sum, row) => sum + (row.小红书_SEARCH || 0), 0);
    const dySearch = filteredData.reduce((sum, row) => sum + (row.抖音_SEARCH || 0), 0);

    // 月度趋势
    const monthlyMap = new Map<string, { buzz: number; yoy: number }>();
    filteredData.forEach((row) => {
      const month = row.MONTH;
      const existing = monthlyMap.get(month) || { buzz: 0, yoy: 0 };
      existing.buzz += row.TTL_Buzz || 0;
      existing.yoy = row.TTL_Buzz_YOY || 0;
      monthlyMap.set(month, existing);
    });
    const monthlyTrend = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({ month, ...data }));

    // Top关键词
    const keywordMap = new Map<string, { buzz: number; yoy: number; search: number }>();
    filteredData.forEach((row) => {
      const existing = keywordMap.get(row.KEYWORDS) || { buzz: 0, yoy: 0, search: 0 };
      existing.buzz += row.TTL_Buzz || 0;
      existing.yoy = row.TTL_Buzz_YOY || 0;
      existing.search += (row.小红书_SEARCH || 0) + (row.抖音_SEARCH || 0);
      keywordMap.set(row.KEYWORDS, existing);
    });
    const topKeywords = Array.from(keywordMap.entries())
      .map(([keyword, data]) => ({ keyword, ...data }))
      .sort((a, b) => b.buzz - a.buzz)
      .slice(0, 10);

    // 增长趋势判断
    const growthTrend: 'up' | 'down' | 'stable' =
      avgYoy > 10 ? 'up' : avgYoy < -10 ? 'down' : 'stable';

    return {
      totalBuzz,
      avgYoy,
      avgMom,
      xhsBuzz,
      dyBuzz,
      xhsSearch,
      dySearch,
      keywordCount: keywordMap.size,
      monthlyTrend,
      topKeywords,
      platformDistribution: [
        { platform: '小红书', value: xhsBuzz, color: '#FE2C55' },
        { platform: '抖音', value: dyBuzz, color: '#000000' },
      ],
      growthTrend,
    };
  }, [rawData, filters, category, subcategory]);

  if (!metrics) return null;

  // 趋势图表配置
  const trendOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#E5E7EB',
        textStyle: { color: '#111827', fontSize: 12 },
      },
      legend: {
        data: ['声量', '同比增长'],
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      grid: {
        left: 50,
        right: 50,
        top: 20,
        bottom: 50,
      },
      xAxis: {
        type: 'category',
        data: metrics.monthlyTrend.map((t) => t.month),
        axisLabel: { fontSize: 10 },
        axisLine: { lineStyle: { color: '#E5E7EB' } },
      },
      yAxis: [
        {
          type: 'value',
          name: '声量',
          nameTextStyle: { fontSize: 10 },
          axisLabel: {
            fontSize: 9,
            formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v),
          },
          splitLine: { lineStyle: { type: 'dashed', color: '#F3F4F6' } },
        },
        {
          type: 'value',
          name: 'YOY %',
          nameTextStyle: { fontSize: 10 },
          axisLabel: { fontSize: 9, formatter: '{value}%' },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '声量',
          type: 'line',
          data: metrics.monthlyTrend.map((t) => t.buzz),
          smooth: true,
          itemStyle: { color: '#3B82F6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
              ],
            },
          },
        },
        {
          name: '同比增长',
          type: 'line',
          yAxisIndex: 1,
          data: metrics.monthlyTrend.map((t) => (t.yoy * 100).toFixed(1)),
          itemStyle: { color: '#10B981' },
          lineStyle: { type: 'dashed' },
        },
      ],
    };
  }, [metrics]);

  // 平台分布图表配置
  const platformOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#E5E7EB',
        textStyle: { color: '#111827', fontSize: 12 },
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '45%'],
          data: metrics.platformDistribution.map((p) => ({
            value: p.value,
            name: p.platform,
            itemStyle: { color: p.color },
          })),
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            fontSize: 11,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }, [metrics]);

  return (
    <div className={cn('rounded-xl border border-gray-100 bg-white p-5', className)}>
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <div>
          <h3 className="font-semibold text-gray-900">
            {category} - {subcategory}
          </h3>
          <p className="text-xs text-gray-500">细分深度洞察</p>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="p-4 rounded-lg bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">总声量</span>
          </div>
          <p className="text-xl font-bold text-blue-900">
            {(metrics.totalBuzz / 1000).toFixed(1)}K
          </p>
          <p
            className={cn(
              'text-xs mt-1',
              metrics.avgYoy >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            同比 {metrics.avgYoy >= 0 ? '+' : ''}
            {(metrics.avgYoy * 100).toFixed(1)}%
          </p>
        </div>

        <div className="p-4 rounded-lg bg-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">关键词数</span>
          </div>
          <p className="text-xl font-bold text-purple-900">{metrics.keywordCount}</p>
          <p className="text-xs text-gray-500 mt-1">覆盖相关词</p>
        </div>

        <div className="p-4 rounded-lg bg-pink-50">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-pink-600" />
            <span className="text-xs text-pink-600 font-medium">搜索量</span>
          </div>
          <p className="text-xl font-bold text-pink-900">
            {((metrics.xhsSearch + metrics.dySearch) / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-gray-500 mt-1">
            小红书 {(metrics.xhsSearch / 1000).toFixed(1)}K / 抖音{' '}
            {(metrics.dySearch / 1000).toFixed(1)}K
          </p>
        </div>

        <div className="p-4 rounded-lg bg-amber-50">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-600 font-medium">增长势头</span>
          </div>
          <p
            className={cn(
              'text-xl font-bold',
              metrics.growthTrend === 'up'
                ? 'text-emerald-700'
                : metrics.growthTrend === 'down'
                ? 'text-red-700'
                : 'text-amber-700'
            )}
          >
            {metrics.growthTrend === 'up' ? '强劲' : metrics.growthTrend === 'down' ? '下滑' : '平稳'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            环比 {metrics.avgMom >= 0 ? '+' : ''}
            {(metrics.avgMom * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* 趋势图 */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-medium text-gray-700 mb-3">月度趋势</h4>
          <ReactECharts
            option={trendOption}
            style={{ height: '250px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>

        {/* 平台分布 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">平台分布</h4>
          <ReactECharts
            option={platformOption}
            style={{ height: '250px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>

      {/* Top关键词排行 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">热门关键词排行</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metrics.topKeywords.map((kw, idx) => (
            <div
              key={kw.keyword}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  idx === 0
                    ? 'bg-amber-100 text-amber-700'
                    : idx === 1
                    ? 'bg-gray-200 text-gray-700'
                    : idx === 2
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{kw.keyword}</p>
                <p className="text-xs text-gray-500">
                  搜索 {(kw.search / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {(kw.buzz / 1000).toFixed(1)}K
                </p>
                <p
                  className={cn(
                    'text-xs',
                    kw.yoy >= 0 ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {kw.yoy >= 0 ? '+' : ''}
                  {(kw.yoy * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

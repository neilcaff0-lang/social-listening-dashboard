"use client";

import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/store/useDataStore';
import { filterData } from '@/lib/data-processor';
import { SUBCATEGORY_CATEGORIES } from '@/types/index';
import { cn } from '@/lib/utils';
import { TrendingUp, Target, ArrowRight, Layers } from 'lucide-react';

interface KeyCategoriesDeepDiveProps {
  className?: string;
}

interface CategoryMetrics {
  category: string;
  totalBuzz: number;
  avgYoy: number;
  keywordCount: number;
  avgSearch: number;
  shareOfTotal: number;
  growthMomentum: number;
  topKeywords: { keyword: string; buzz: number; yoy: number }[];
  monthlyTrend: { month: string; buzz: number }[];
  hasSubcategories: boolean;
}

// 常量定义
const TOP_KEYWORDS_COUNT = 10;
const DISPLAY_KEYWORDS_COUNT = 8;
const EXCLUDED_CATEGORIES = ['lifestyle', '生活方式'];

// 动态生成品类配置
const getCategoryConfig = (category: string) => {
  const colors = [
    { color: '#3B82F6', bgColor: '#EFF6FF' }, // Blue
    { color: '#8B5CF6', bgColor: '#F5F3FF' }, // Purple
    { color: '#10B981', bgColor: '#ECFDF5' }, // Green
    { color: '#F59E0B', bgColor: '#FFFBEB' }, // Amber
    { color: '#EF4444', bgColor: '#FEF2F2' }, // Red
    { color: '#EC4899', bgColor: '#FDF2F8' }, // Pink
    { color: '#06B6D4', bgColor: '#ECFEFF' }, // Cyan
    { color: '#84CC16', bgColor: '#F7FEE7' }, // Lime
  ];
  const index = category.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function KeyCategoriesDeepDive({ className }: KeyCategoriesDeepDiveProps) {
  const { rawData, filters, categories } = useDataStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 获取所有有效品类（排除lifestyle）
  const validCategories = useMemo(() => {
    const allCategories = categories.length > 0
      ? categories.map(c => c.name)
      : [...new Set(rawData.map(row => row.CATEGORY))];

    return allCategories.filter(cat =>
      !EXCLUDED_CATEGORIES.some(excluded =>
        cat.toLowerCase().includes(excluded.toLowerCase())
      )
    );
  }, [categories, rawData]);

  // 分析所有品类的整体表现
  const categoryMetrics = useMemo((): CategoryMetrics[] => {
    try {
      if (rawData.length === 0) return [];

      const filteredData = filterData(rawData, filters);

      // 只保留有效品类
      const keyCategories = validCategories.filter(cat =>
        filteredData.some(row => row.CATEGORY === cat)
      );

      if (keyCategories.length === 0) return [];

      const totalBuzzAll = filteredData.reduce((sum, row) => sum + (row.TTL_Buzz || 0), 0);

      return keyCategories.map(category => {
        const categoryData = filteredData.filter(row => row.CATEGORY === category);

        const totalBuzz = categoryData.reduce((sum, row) => sum + (row.TTL_Buzz || 0), 0);
        const avgYoy = categoryData.length > 0
          ? categoryData.reduce((sum, row) => sum + (row.TTL_Buzz_YOY || 0), 0) / categoryData.length
          : 0;
        const keywordCount = new Set(categoryData.map(row => row.KEYWORDS)).size;
        const avgSearch = categoryData.length > 0
          ? categoryData.reduce((sum, row) => sum + ((row.小红书_SEARCH || 0) + (row.抖音_SEARCH || 0)), 0) / categoryData.length
          : 0;

        // 月度趋势
        const monthlyMap = new Map<string, number>();
        categoryData.forEach(row => {
          const month = row.MONTH;
          monthlyMap.set(month, (monthlyMap.get(month) || 0) + (row.TTL_Buzz || 0));
        });
        const monthlyTrend = Array.from(monthlyMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, buzz]) => ({ month, buzz }));

        // Top关键词 - 使用不可变模式
        const keywordMap = new Map<string, { buzz: number; yoy: number }>();
        categoryData.forEach(row => {
          const existing = keywordMap.get(row.KEYWORDS) || { buzz: 0, yoy: 0 };
          keywordMap.set(row.KEYWORDS, {
            buzz: existing.buzz + (row.TTL_Buzz || 0),
            yoy: row.TTL_Buzz_YOY || 0
          });
        });
        const topKeywords = Array.from(keywordMap.entries())
          .map(([keyword, data]) => ({ keyword, ...data }))
          .sort((a, b) => b.buzz - a.buzz)
          .slice(0, TOP_KEYWORDS_COUNT);

        return {
          category,
          totalBuzz,
          avgYoy,
          keywordCount,
          avgSearch,
          shareOfTotal: totalBuzzAll > 0 ? (totalBuzz / totalBuzzAll) * 100 : 0,
          growthMomentum: avgYoy * Math.log10(totalBuzz + 1),
          topKeywords,
          monthlyTrend,
          hasSubcategories: SUBCATEGORY_CATEGORIES.includes(category as any),
        };
      }).sort((a, b) => b.totalBuzz - a.totalBuzz);
    } catch (error) {
      console.error('Error calculating category metrics:', error);
      return [];
    }
  }, [rawData, filters, validCategories]);

  if (categoryMetrics.length === 0) return null;

  // 对比图表配置
  const comparisonOption = useMemo(() => {
    const cats = categoryMetrics.map(m => m.category);
    const colors = categoryMetrics.map(m => getCategoryConfig(m.category).color);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: { color: '#111827', fontSize: 12 },
      },
      legend: {
        data: ['声量', '同比增长'],
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      grid: {
        left: 60,
        right: 60,
        top: 20,
        bottom: 50,
      },
      xAxis: {
        type: 'category',
        data: cats,
        axisLabel: { fontSize: 12 },
        axisLine: { lineStyle: { color: '#E5E7EB' } },
      },
      yAxis: [
        {
          type: 'value',
          name: '声量',
          nameTextStyle: { fontSize: 11 },
          axisLabel: {
            fontSize: 10,
            formatter: (v: number) => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : `${(v / 1000).toFixed(0)}K`,
          },
          splitLine: { lineStyle: { type: 'dashed', color: '#F3F4F6' } },
        },
        {
          type: 'value',
          name: 'YOY %',
          nameTextStyle: { fontSize: 11 },
          axisLabel: { fontSize: 10, formatter: '{value}%' },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '声量',
          type: 'bar',
          data: categoryMetrics.map((m, i) => ({
            value: m.totalBuzz,
            itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] },
          })),
          barWidth: '40%',
        },
        {
          name: '同比增长',
          type: 'line',
          yAxisIndex: 1,
          data: categoryMetrics.map(m => (m.avgYoy * 100).toFixed(1)),
          itemStyle: { color: '#F59E0B' },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 8,
        },
      ],
    };
  }, [categoryMetrics]);

  // 趋势对比图
  const trendOption = useMemo(() => {
    const months = categoryMetrics[0]?.monthlyTrend.map(t => t.month) || [];

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#E5E7EB',
        textStyle: { color: '#111827', fontSize: 12 },
      },
      legend: {
        data: categoryMetrics.map(m => m.category),
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      grid: {
        left: 50,
        right: 30,
        top: 20,
        bottom: 50,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { fontSize: 10 },
        axisLine: { lineStyle: { color: '#E5E7EB' } },
      },
      yAxis: {
        type: 'value',
        name: '声量',
        nameTextStyle: { fontSize: 10 },
        axisLabel: {
          fontSize: 9,
          formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v,
        },
        splitLine: { lineStyle: { type: 'dashed', color: '#F3F4F6' } },
      },
      series: categoryMetrics.map(m => ({
        name: m.category,
        type: 'line',
        data: m.monthlyTrend.map(t => t.buzz),
        smooth: true,
        itemStyle: { color: getCategoryConfig(m.category).color },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 4,
      })),
    };
  }, [categoryMetrics]);

  const selectedMetrics = selectedCategory
    ? categoryMetrics.find(m => m.category === selectedCategory)
    : null;

  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white p-5", className)}>
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Target className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">全品类深度分析</h3>
          <p className="text-sm text-gray-500">
            {categoryMetrics.length} 个品类整体表现对比
            {categoryMetrics.some(m => m.hasSubcategories) && ' · 部分支持细分洞察'}
          </p>
        </div>
      </div>

      {/* 品类概览卡片 - 响应式网格 */}
      <div className={cn(
        "grid gap-4 mb-6",
        categoryMetrics.length <= 3 ? "grid-cols-1 md:grid-cols-3" :
        categoryMetrics.length <= 4 ? "grid-cols-2 md:grid-cols-4" :
        "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      )}>
        {categoryMetrics.map((metrics) => {
          const config = getCategoryConfig(metrics.category);
          const isSelected = selectedCategory === metrics.category;

          return (
            <button
              key={metrics.category}
              onClick={() => setSelectedCategory(isSelected ? null : metrics.category)}
              className={cn(
                "text-left p-4 rounded-lg border transition-all",
                isSelected
                  ? "border-indigo-300 bg-indigo-50/50 ring-1 ring-indigo-300"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">{metrics.category}</span>
                {metrics.hasSubcategories && (
                  <div className="relative group">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      支持细分洞察
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">总声量</span>
                  <span className="text-sm font-medium" style={{ color: config.color }}>
                    {(metrics.totalBuzz / 1000).toFixed(1)}K
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">平均YOY</span>
                  <span className={cn(
                    "text-sm font-medium",
                    metrics.avgYoy >= 0 ? "text-emerald-600" : "text-red-600"
                  )}>
                    {metrics.avgYoy >= 0 ? '+' : ''}{(metrics.avgYoy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">整体份额</span>
                  <span className="text-sm font-medium text-gray-700">
                    {metrics.shareOfTotal.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-indigo-600">
                  <span>{isSelected ? '收起详情' : '查看详情'}</span>
                  <ArrowRight className={cn("w-3 h-3 transition-transform", isSelected && "rotate-90")} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 对比图 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-400" />
            品类声量与增长对比
          </h4>
          <ReactECharts
            option={comparisonOption}
            style={{ height: '220px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>

        {/* 趋势图 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            月度趋势对比
          </h4>
          <ReactECharts
            option={trendOption}
            style={{ height: '220px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>

      {/* 选中品类的详细洞察 */}
      {selectedMetrics && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-semibold text-gray-900">{selectedMetrics.category}</span>
            {selectedMetrics.hasSubcategories && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
                支持细分洞察
              </span>
            )}
            <span className="text-sm text-gray-500">- 热门关键词</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedMetrics.topKeywords.slice(0, DISPLAY_KEYWORDS_COUNT).map((kw, idx) => (
              <div
                key={kw.keyword}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50"
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                  idx === 0 ? "bg-amber-100 text-amber-700" :
                  idx === 1 ? "bg-gray-200 text-gray-700" :
                  idx === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-gray-100 text-gray-600"
                )}>
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-900">{kw.keyword}</span>
                <span className={cn(
                  "text-xs",
                  kw.yoy >= 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  {kw.yoy >= 0 ? '+' : ''}{(kw.yoy * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

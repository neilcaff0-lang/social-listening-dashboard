"use client";

import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/store/useDataStore';
import { analyzeCategories } from '@/lib/advanced-analytics';
import { cn } from '@/lib/utils';

type ViewMode = 'bar' | 'radar' | 'share';

interface TooltipParam {
  dataIndex: number;
  name?: string;
  value?: number | number[];
}

interface CategoryComparisonChartProps {
  className?: string;
}

const categoryColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export default function CategoryComparisonChart({ className }: CategoryComparisonChartProps) {
  const { rawData, filters } = useDataStore();
  const [viewMode, setViewMode] = useState<ViewMode>('bar');

  // 分析品类数据
  const categoryData = useMemo(() => {
    if (rawData.length === 0) return [];
    return analyzeCategories(rawData, filters);
  }, [rawData, filters]);

  // 图表配置
  const option = useMemo(() => {
    if (categoryData.length === 0) {
      return {
        graphic: [{
          type: 'text',
          left: 'center',
          top: 'middle',
          style: { text: '暂无数据', fontSize: 16, fill: '#9CA3AF' },
        }],
      };
    }

    const categories = categoryData.map(d => d.category);

    switch (viewMode) {
      case 'bar':
        return {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            borderRadius: 8,
            textStyle: { color: '#111827', fontSize: 12 },
            formatter: (params: TooltipParam[]) => {
              const data = categoryData[params[0].dataIndex];
              return `
                <div style="font-size: 13px;">
                  <div style="font-weight: 600; margin-bottom: 4px;">${data.category}</div>
                  <div style="color: #6B7280;">声量: <span style="color: #111; font-weight: 500;">${data.totalBuzz.toLocaleString()}</span></div>
                  <div style="color: #6B7280;">平均YOY: <span style="color: ${data.avgYoy >= 0 ? '#10B981' : '#EF4444'}; font-weight: 500;">${data.avgYoy >= 0 ? '+' : ''}${data.avgYoy.toFixed(1)}%</span></div>
                  <div style="color: #6B7280;">关键词数: ${data.keywordCount}</div>
                  <div style="color: #6B7280;">声量份额: ${data.shareOfVoice.toFixed(1)}%</div>
                </div>
              `;
            },
          },
          legend: {
            data: ['声量', '平均YOY'],
            bottom: 0,
            textStyle: { fontSize: 11, color: '#6B7280' },
          },
          grid: {
            left: 60,
            right: 60,
            top: 20,
            bottom: 50,
          },
          xAxis: {
            type: 'category',
            data: categories,
            axisLabel: { color: '#6B7280', fontSize: 11 },
            axisLine: { lineStyle: { color: '#E5E7EB' } },
          },
          yAxis: [
            {
              type: 'value',
              name: '声量',
              nameTextStyle: { color: '#6B7280', fontSize: 11 },
              axisLabel: {
                color: '#9CA3AF',
                fontSize: 10,
                formatter: (v: number) => v >= 10000 ? `${(v/10000).toFixed(0)}万` : `${v/1000}K`,
              },
              splitLine: { lineStyle: { type: 'dashed', color: '#F3F4F6' } },
            },
            {
              type: 'value',
              name: '平均YOY %',
              nameTextStyle: { color: '#6B7280', fontSize: 11 },
              axisLabel: {
                color: '#9CA3AF',
                fontSize: 10,
                formatter: (v: number) => `${v >= 0 ? '+' : ''}${v}%`,
              },
              splitLine: { show: false },
            },
          ],
          series: [
            {
              name: '声量',
              type: 'bar',
              data: categoryData.map(d => d.totalBuzz),
              itemStyle: {
                borderRadius: [4, 4, 0, 0],
                color: typeof window !== 'undefined' && (window as any).echarts?.graphic
                  ? new (window as any).echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: '#3B82F6' },
                      { offset: 1, color: '#60A5FA' },
                    ])
                  : '#3B82F6',
              },
              barWidth: '40%',
            },
            {
              name: '平均YOY',
              type: 'line',
              yAxisIndex: 1,
              data: categoryData.map(d => d.avgYoy),
              itemStyle: { color: '#10B981' },
              lineStyle: { width: 2 },
              symbol: 'circle',
              symbolSize: 8,
            },
          ],
        };

      case 'radar':
        const maxBuzz = Math.max(...categoryData.map(d => d.totalBuzz), 1);
        const maxYoy = Math.max(...categoryData.map(d => Math.abs(d.avgYoy)), 1);
        const maxShare = Math.max(...categoryData.map(d => d.shareOfVoice), 1);

        return {
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#E5E7EB',
            textStyle: { color: '#111827' },
          },
          legend: {
            data: categories,
            bottom: 0,
            textStyle: { fontSize: 10, color: '#6B7280' },
          },
          radar: {
            indicator: [
              { name: '声量规模', max: 1 },
              { name: '增长速度', max: 1 },
              { name: '关键词数', max: 1 },
              { name: '声量份额', max: 1 },
              { name: '增长势头', max: 1 },
            ],
            radius: '60%',
            axisName: { color: '#6B7280', fontSize: 11 },
            splitArea: { areaStyle: { color: ['#F9FAFB', '#F3F4F6'] } },
          },
          series: [{
            type: 'radar',
            data: categoryData.map((d, i) => ({
              value: [
                d.totalBuzz / maxBuzz,
                Math.max(0, d.avgYoy / maxYoy),
                Math.min(1, d.keywordCount / 10),
                d.shareOfVoice / maxShare,
                Math.max(0, Math.min(1, d.growthMomentum / 100)),
              ],
              name: d.category,
              itemStyle: { color: categoryColors[i % categoryColors.length] },
              areaStyle: { opacity: 0.2 },
            })),
          }],
        };

      case 'share':
        return {
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#E5E7EB',
            textStyle: { color: '#111827' },
            formatter: (params: TooltipParam) => {
              const data = categoryData[params.dataIndex];
              return `
                <div style="font-size: 13px;">
                  <div style="font-weight: 600; margin-bottom: 4px;">${data.category}</div>
                  <div style="color: #6B7280;">声量份额: <span style="font-weight: 500;">${data.shareOfVoice.toFixed(1)}%</span></div>
                  <div style="color: #6B7280;">声量: ${data.totalBuzz.toLocaleString()}</div>
                </div>
              `;
            },
          },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            data: categoryData.map((d, i) => ({
              value: d.shareOfVoice,
              name: d.category,
              itemStyle: { color: categoryColors[i % categoryColors.length] },
            })),
            label: {
              formatter: '{b}\n{d}%',
              fontSize: 11,
              color: '#374151',
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          }],
        };
    }
  }, [categoryData, viewMode]);

  if (categoryData.length === 0) {
    return (
      <div className={cn("rounded-xl border border-gray-100 bg-white p-5", className)}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">品类对比分析</h3>
            <p className="text-sm text-gray-500">多维度品类表现对比</p>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
          <p className="text-sm text-gray-400">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white p-5", className)}>
      {/* 标题和控制 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">品类对比分析</h3>
            <p className="text-sm text-gray-500">{categoryData.length} 个品类</p>
          </div>
        </div>

        {/* 视图切换 */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['bar', 'radar', 'share'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                viewMode === mode
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {mode === 'bar' ? '柱状图' : mode === 'radar' ? '雷达图' : '份额图'}
            </button>
          ))}
        </div>
      </div>

      {/* 图表 */}
      <ReactECharts
        option={option}
        style={{ height: '350px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />

      {/* 数据摘要 */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categoryData.slice(0, 4).map((cat) => (
          <div key={cat.category} className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">{cat.category}</p>
            <p className="text-sm font-semibold text-gray-900">
              {(cat.totalBuzz / 1000).toFixed(1)}K
            </p>
            <p className={cn(
              "text-xs",
              cat.avgYoy >= 0 ? "text-emerald-600" : "text-red-600"
            )}>
              {cat.avgYoy >= 0 ? '+' : ''}{cat.avgYoy.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

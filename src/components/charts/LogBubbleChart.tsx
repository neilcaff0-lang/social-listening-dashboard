"use client";

import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/store/useDataStore';
import { getQuadrantData } from '@/lib/data-processor';
import { toLogScale, fromLogScale, shouldUseLogScale } from '@/lib/advanced-analytics';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/utils';

// 象限颜色配置
const quadrantColors: Record<string, { primary: string; bg: string }> = {
  '第一象限': { primary: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  '第二象限': { primary: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  '第三象限': { primary: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  '第四象限': { primary: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  '未知': { primary: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' },
};

interface LogBubbleChartProps {
  className?: string;
}

export default function LogBubbleChart({ className }: LogBubbleChartProps) {
  const { rawData, filters } = useDataStore();
  const [useLogScaleX, setUseLogScaleX] = useState(false);
  const [useLogScaleY, setUseLogScaleY] = useState(false);

  // 获取图表数据
  const chartData = useMemo(() => {
    if (rawData.length === 0) return [];
    return getQuadrantData(rawData, filters);
  }, [rawData, filters]);

  // 判断是否需要对数坐标
  const shouldSuggestLogX = useMemo(() => {
    const buzzValues = chartData.map(d => d.buzz).filter(v => v > 0);
    return shouldUseLogScale(buzzValues, 10);
  }, [chartData]);

  const shouldSuggestLogY = useMemo(() => {
    const yoyValues = chartData.map(d => Math.abs(d.yoy)).filter(v => v > 0);
    return shouldUseLogScale(yoyValues, 10);
  }, [chartData]);

  // 转换数据
  const transformedData = useMemo(() => {
    return chartData.map(item => ({
      ...item,
      displayBuzz: useLogScaleX ? toLogScale(item.buzz) : item.buzz,
      displayYoy: useLogScaleY ? toLogScale(Math.abs(item.yoy)) * Math.sign(item.yoy) : item.yoy,
    }));
  }, [chartData, useLogScaleX, useLogScaleY]);

  // 计算气泡大小
  const sizeRange = useMemo(() => {
    const searches = chartData.map(d => d.search);
    return {
      min: Math.min(...searches, 0),
      max: Math.max(...searches, 1),
    };
  }, [chartData]);

  // ECharts 配置
  const option = useMemo(() => {
    if (transformedData.length === 0) {
      return {
        graphic: [{
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无数据',
            fontSize: 16,
            fill: '#9CA3AF',
          },
        }],
      };
    }

    // 按象限分组
    const quadrantMap: Record<string, typeof transformedData> = {};
    transformedData.forEach(item => {
      const q = item.quadrant || '未知';
      if (!quadrantMap[q]) quadrantMap[q] = [];
      quadrantMap[q].push(item);
    });

    const series = Object.entries(quadrantMap).map(([quadrant, data]) => ({
      name: quadrant,
      type: 'scatter',
      symbolSize: (val: number[]) => {
        const search = val[2] as number;
        if (sizeRange.max === sizeRange.min) return 20;
        const normalized = (search - sizeRange.min) / (sizeRange.max - sizeRange.min);
        return 10 + normalized * 35;
      },
      data: data.map(item => [
        item.displayBuzz,
        item.displayYoy,
        item.search,
        item.keyword,
        item.category,
        item.quadrant,
        item.buzz, // 原始值用于tooltip
        item.yoy,  // 原始值用于tooltip
      ]),
      itemStyle: {
        color: quadrantColors[quadrant]?.primary || '#6B7280',
        opacity: 0.85,
      },
      emphasis: {
        itemStyle: { opacity: 1 },
        scale: 1.2,
      },
    }));

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 8,
        padding: [12, 16],
        textStyle: { color: '#111827', fontSize: 12 },
        formatter: (params: { data: number[] }) => {
          const [_, __, search, keyword, category, quadrant, origBuzz, origYoy] = params.data;
          const yoyColor = origYoy >= 0 ? '#10B981' : '#EF4444';

          return `
            <div style="font-size: 13px; min-width: 180px;">
              <div style="font-weight: 600; margin-bottom: 6px; font-size: 14px;">
                ${keyword}
              </div>
              <div style="display: grid; gap: 4px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">品类</span>
                  <span>${category}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">声量</span>
                  <span style="font-weight: 500;">${origBuzz.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">同比增速</span>
                  <span style="color: ${yoyColor}; font-weight: 600;">
                    ${origYoy >= 0 ? '+' : ''}${origYoy.toFixed(1)}%
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">搜索量</span>
                  <span>${search.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">象限</span>
                  <span>${quadrant || '-'}</span>
                </div>
              </div>
            </div>
          `;
        },
      },
      legend: {
        data: Object.keys(quadrantMap),
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 11, color: '#6B7280' },
      },
      grid: {
        left: 60,
        right: 20,
        top: 20,
        bottom: 50,
      },
      xAxis: {
        name: useLogScaleX ? '声量 (log)' : '声量',
        nameLocation: 'middle',
        nameGap: 25,
        nameTextStyle: { fontSize: 11, color: '#6B7280' },
        type: useLogScaleX ? 'log' : 'value',
        min: useLogScaleX ? 0.01 : 0,
        axisLine: { lineStyle: { color: '#E5E7EB' } },
        axisLabel: {
          color: '#9CA3AF',
          fontSize: 10,
          formatter: (value: number) => {
            if (useLogScaleX) return value.toString();
            if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return value.toString();
          },
        },
        splitLine: { show: false },
      },
      yAxis: {
        name: useLogScaleY ? '同比增速 % (log)' : '同比增速 %',
        nameLocation: 'middle',
        nameGap: 35,
        nameTextStyle: { fontSize: 11, color: '#6B7280' },
        type: useLogScaleY ? 'log' : 'value',
        axisLine: { lineStyle: { color: '#E5E7EB' } },
        axisLabel: {
          color: '#9CA3AF',
          fontSize: 10,
          formatter: (value: number) => `${value >= 0 ? '+' : ''}${value}%`,
        },
        splitLine: { lineStyle: { type: 'dashed', color: '#F3F4F6' } },
      },
      series: [
        ...series,
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { type: 'dashed', color: '#D1D5DB', width: 1 },
            label: { show: false },
            data: [{ yAxis: 0 }],
          },
        },
      ],
    };
  }, [transformedData, useLogScaleX, useLogScaleY, sizeRange]);

  if (chartData.length === 0) {
    return (
      <div className={cn("rounded-xl border border-gray-100 bg-white p-5", className)}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">对数坐标气泡图</h3>
            <p className="text-sm text-gray-500">解决量级差异问题</p>
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
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">对数坐标气泡图</h3>
            <p className="text-sm text-gray-500">{chartData.length} 个关键词</p>
          </div>
        </div>

        {/* 对数开关 */}
        <div className="flex items-center gap-4">
          {shouldSuggestLogX && (
            <div className="flex items-center gap-2">
              <Switch
                checked={useLogScaleX}
                onCheckedChange={setUseLogScaleX}
                size="sm"
              />
              <span className={cn(
                "text-xs",
                shouldSuggestLogX ? "text-amber-600 font-medium" : "text-gray-500"
              )}>
                Log X轴
                {shouldSuggestLogX && " (推荐)"}
              </span>
            </div>
          )}
          {shouldSuggestLogY && (
            <div className="flex items-center gap-2">
              <Switch
                checked={useLogScaleY}
                onCheckedChange={setUseLogScaleY}
                size="sm"
              />
              <span className={cn(
                "text-xs",
                shouldSuggestLogY ? "text-amber-600 font-medium" : "text-gray-500"
              )}>
                Log Y轴
                {shouldSuggestLogY && " (推荐)"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 图表 */}
      <ReactECharts
        option={option}
        style={{ height: '350px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />

      {/* 提示 */}
      {(shouldSuggestLogX || shouldSuggestLogY) && (!useLogScaleX && !useLogScaleY) && (
        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-700">
            💡 检测到数据跨度较大，建议开启对数坐标以更好地展示相对变化
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/store/useDataStore';
import { getQuadrantData } from '@/lib/data-processor';
import { ChartDataPoint } from '@/types';

// 维度颜色配置
const dimensionColors: Record<string, { primary: string; bg: string; name: string }> = {
  scene: { primary: '#22c55e', bg: '#dcfce7', name: '场景' },
  function: { primary: '#3b82f6', bg: '#dbeafe', name: '功能' },
  material: { primary: '#a855f7', bg: '#f3e8ff', name: '材质' },
  fit: { primary: '#f97316', bg: '#ffedd5', name: '版型' },
  design: { primary: '#ec4899', bg: '#fce7f3', name: '设计' },
  other: { primary: '#6b7280', bg: '#f3f4f6', name: '其他' },
};

interface BubbleChartProps {
  className?: string;
}

export interface BubbleChartRef {
  getSelectedKeywords: () => string[];
  clearSelection: () => void;
  getDivElement: () => HTMLDivElement | null;
}

const BubbleChart = forwardRef<BubbleChartRef, BubbleChartProps>(function BubbleChart({ className }, ref) {
  const { rawData, filters } = useDataStore();
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getSelectedKeywords: () => Array.from(selectedKeywords),
    clearSelection: () => setSelectedKeywords(new Set()),
    getDivElement: () => chartRef.current,
  }));

  // 获取图表数据
  const chartData = useMemo(() => {
    if (rawData.length === 0) return [];
    return getQuadrantData(rawData, filters);
  }, [rawData, filters]);

  // 自动计算阈值（使用中位数更稳健）
  const thresholds = useMemo(() => {
    if (chartData.length === 0) return { buzz: 0, yoy: 0 };

    const sortedBuzz = [...chartData].sort((a, b) => a.buzz - b.buzz);
    const sortedYoy = [...chartData].sort((a, b) => a.yoy - b.yoy);

    const mid = Math.floor(sortedBuzz.length / 2);
    const buzzMedian = sortedBuzz.length % 2 !== 0
      ? sortedBuzz[mid].buzz
      : (sortedBuzz[mid - 1].buzz + sortedBuzz[mid].buzz) / 2;

    const yoyMedian = sortedYoy.length % 2 !== 0
      ? sortedYoy[mid].yoy
      : (sortedYoy[mid - 1].yoy + sortedYoy[mid].yoy) / 2;

    return { buzz: buzzMedian, yoy: yoyMedian };
  }, [chartData]);

  // 计算气泡大小范围
  const sizeRange = useMemo(() => {
    if (chartData.length === 0) return { min: 1, max: 1 };
    const searches = chartData.map(d => d.search);
    return {
      min: Math.min(...searches),
      max: Math.max(...searches),
    };
  }, [chartData]);

  // 自动生成洞察
  const insights = useMemo(() => {
    if (chartData.length === 0) return [];

    const topGrowth = [...chartData].sort((a, b) => b.yoy - a.yoy).slice(0, 3);
    const topBuzz = [...chartData].sort((a, b) => b.buzz - a.buzz).slice(0, 3);
    const avgYoy = chartData.reduce((sum, d) => sum + d.yoy, 0) / chartData.length;

    const insightsList = [];

    if (topGrowth[0]?.yoy > 100) {
      insightsList.push(`🚀 最高增长: ${topGrowth[0].keyword} (+${topGrowth[0].yoy.toFixed(0)}%)`);
    }
    if (topBuzz[0]?.buzz > 0) {
      insightsList.push(`🔥 最高声量: ${topBuzz[0].keyword} (${(topBuzz[0].buzz / 1000).toFixed(1)}K)`);
    }
    if (avgYoy > 0) {
      insightsList.push(`📈 整体趋势: 平均增长 +${avgYoy.toFixed(1)}%`);
    } else if (avgYoy < 0) {
      insightsList.push(`📉 整体趋势: 平均下降 ${avgYoy.toFixed(1)}%`);
    }

    return insightsList;
  }, [chartData]);

  // 按维度分组数据
  const dimensionDataMap = useMemo(() => {
    const map: Record<string, ChartDataPoint[]> = {};

    chartData.forEach((item) => {
      // 从数据中推断维度（如果有dimension字段）或默认为other
      const dimension = (item as ChartDataPoint & { dimension?: string }).dimension || 'other';
      if (!map[dimension]) {
        map[dimension] = [];
      }
      map[dimension].push(item);
    });

    return map;
  }, [chartData]);

  // ECharts 配置
  const option = useMemo(() => {
    if (chartData.length === 0) {
      return {
        title: {
          text: '关键词气泡图',
          subtext: 'Buzz vs Growth (Size: Search Volume)',
          left: 'center',
          top: 10,
        },
        graphic: [
          {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: '暂无数据',
              fontSize: 16,
              fill: '#9ca3af',
            },
          },
        ],
      };
    }

    // 构建系列数据
    const series = Object.entries(dimensionDataMap).map(([dimension, data]) => ({
      name: dimensionColors[dimension]?.name || dimension,
      type: 'scatter',
      symbolSize: (val: number[]) => {
        // 基于搜索量计算气泡大小，范围 15-60
        const [buzz, yoy, search] = val;
        if (sizeRange.max === sizeRange.min) return 30;
        const normalized = (search - sizeRange.min) / (sizeRange.max - sizeRange.min);
        return 15 + normalized * 45;
      },
      data: data.map((item) => [
        item.buzz,
        item.yoy,
        item.search,
        item.keyword,
        item.category,
        item.quadrant,
      ]),
      itemStyle: {
        color: dimensionColors[dimension]?.primary || '#6b7280',
        opacity: 0.75,
        shadowBlur: 4,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
      },
      emphasis: {
        itemStyle: {
          opacity: 1,
          shadowBlur: 15,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
        scale: 1.3,
      },
    }));

    return {
      title: {
        text: '关键词气泡图',
        subtext: `X: 声量 | Y: 同比增速 | 气泡大小: 搜索量 | 关键词数: ${chartData.length}`,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
        subtextStyle: {
          fontSize: 11,
          color: '#6b7280',
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 8,
        padding: [12, 16],
        textStyle: {
          color: '#1f2937',
          fontSize: 12,
        },
        formatter: (params: { data: number[] }) => {
          if (!params.data) return '';
          const [buzz, yoy, search, keyword, category, quadrant] = params.data;
          const yoyColor = yoy >= 0 ? '#22c55e' : '#ef4444';

          return `
            <div style="font-size: 13px; min-width: 200px;">
              <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px; color: #111827;">
                ${keyword}
              </div>
              <div style="display: grid; gap: 6px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">品类</span>
                  <span style="font-weight: 500;">${category}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">声量</span>
                  <span style="font-weight: 500;">${buzz.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">同比增速</span>
                  <span style="color: ${yoyColor}; font-weight: 600;">
                    ${yoy >= 0 ? '+' : ''}${yoy.toFixed(1)}%
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">搜索量</span>
                  <span style="font-weight: 500;">${search.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">象限</span>
                  <span style="font-weight: 500;">${quadrant || '-'}</span>
                </div>
              </div>
            </div>
          `;
        },
      },
      legend: {
        data: Object.keys(dimensionDataMap).map(d => dimensionColors[d]?.name || d),
        bottom: 10,
        itemWidth: 14,
        itemHeight: 14,
        textStyle: {
          fontSize: 11,
        },
      },
      grid: {
        left: 70,
        right: 30,
        top: 90,
        bottom: 70,
        containLabel: false,
      },
      xAxis: {
        name: '声量 (Buzz)',
        nameLocation: 'middle',
        nameGap: 35,
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 500,
          color: '#374151',
        },
        type: 'value',
        min: 0,
        axisLine: {
          lineStyle: {
            color: '#d1d5db',
          },
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 10,
          formatter: (value: number) => {
            if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return value.toString();
          },
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e5e7eb',
          },
        },
      },
      yAxis: {
        name: '同比增速 (%)',
        nameLocation: 'middle',
        nameGap: 45,
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 500,
          color: '#374151',
        },
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#d1d5db',
          },
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 10,
          formatter: (value: number) => `${value >= 0 ? '+' : ''}${value}%`,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e5e7eb',
          },
        },
      },
      // 参考线
      series: [
        ...series,
        // 平均声量线
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'dashed',
              color: '#9ca3af',
              width: 1,
            },
            label: {
              show: true,
              position: 'insideEndTop',
              formatter: `中位数: {c}`,
              fontSize: 9,
              color: '#6b7280',
            },
            data: [{ xAxis: thresholds.buzz }],
          },
        },
        // 零增长线
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'solid',
              color: '#9ca3af',
              width: 1,
            },
            label: {
              show: true,
              position: 'insideEndTop',
              formatter: '0%',
              fontSize: 9,
              color: '#6b7280',
            },
            data: [{ yAxis: 0 }],
          },
        },
      ],
    };
  }, [chartData, dimensionDataMap, thresholds, sizeRange]);

  // 空数据状态
  if (chartData.length === 0) {
    return (
      <div
        ref={chartRef}
        className={`rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm ${className}`}
      >
        <h3 className="text-lg font-semibold text-neutral-900">关键词气泡图</h3>
        <p className="mt-1 text-xs text-neutral-400">声量与增长分析</p>
        <div className="mt-6 flex h-72 items-center justify-center">
          <p className="text-sm text-neutral-400">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className={`rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm ${className}`}
    >
      {/* 标题 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">关键词气泡图</h3>
        <p className="mt-1 text-xs text-neutral-400">
          X: 声量 · Y: 增速 · 大小: 搜索量 · 共 {chartData.length} 个关键词
        </p>
      </div>

      {/* 洞察提示 */}
      {insights.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {insights.map((insight, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600"
            >
              {insight}
            </span>
          ))}
        </div>
      )}

      <ReactECharts
        option={option}
        style={{ height: '420px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        onEvents={{
          click: (params: { data?: unknown[] }) => {
            if (params.data && params.data[3]) {
              const keyword = String(params.data[3]);
              setSelectedKeywords(prev => {
                const newSet = new Set(prev);
                if (newSet.has(keyword)) {
                  newSet.delete(keyword);
                } else {
                  newSet.add(keyword);
                }
                return newSet;
              });
            }
          },
        }}
      />

      {/* 选中的关键词 */}
      {selectedKeywords.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
          <span className="text-xs font-medium text-neutral-500">
            已选择 {selectedKeywords.size} 个:
          </span>
          {Array.from(selectedKeywords).map(keyword => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white"
            >
              {keyword}
              <button
                onClick={() => {
                  setSelectedKeywords(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(keyword);
                    return newSet;
                  });
                }}
                className="ml-1 text-neutral-400 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={() => setSelectedKeywords(new Set())}
            className="text-xs text-neutral-400 hover:text-neutral-600"
          >
            清除
          </button>
        </div>
      )}
    </div>
  );
});

export default BubbleChart;

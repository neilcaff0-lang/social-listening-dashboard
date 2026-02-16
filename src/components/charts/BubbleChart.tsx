"use client";

import { useMemo, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/store/useDataStore';
import { getQuadrantData } from '@/lib/data-processor';
import { ChartDataPoint } from '@/types';

// 象限颜色配置 - 用于气泡着色 (HSL format for design system)
const quadrantColors: Record<string, { primary: string; bg: string }> = {
  '第一象限': { primary: 'hsl(142.1 76.2% 36.3%)', bg: 'hsl(142.1 76.2% 36.3% / 0.1)' },  // 高声量高增长 - 绿色
  '第二象限': { primary: 'hsl(221.2 83.2% 53.3%)', bg: 'hsl(221.2 83.2% 53.3% / 0.1)' },   // 低声量高增长 - 蓝色
  '第三象限': { primary: 'hsl(38 92% 50%)', bg: 'hsl(38 92% 50% / 0.1)' },   // 低声量低增长 - 橙色
  '第四象限': { primary: 'hsl(0 84.2% 60.2%)', bg: 'hsl(0 84.2% 60.2% / 0.1)' },   // 高声量低增长 - 红色
  '未知': { primary: 'hsl(215.4 16.3% 46.9%)', bg: 'hsl(215.4 16.3% 46.9% / 0.1)' },         // 未知 - 灰色
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
      insightsList.push(`最高增长: ${topGrowth[0].keyword} (+${topGrowth[0].yoy.toFixed(0)}%)`);
    }
    if (topBuzz[0]?.buzz > 0) {
      insightsList.push(`最高声量: ${topBuzz[0].keyword} (${(topBuzz[0].buzz / 1000).toFixed(1)}K)`);
    }
    if (avgYoy > 0) {
      insightsList.push(`平均增长 +${avgYoy.toFixed(1)}%`);
    }

    return insightsList;
  }, [chartData]);

  // 根据象限分组数据并着色
  const quadrantDataMap = useMemo(() => {
    const map: Record<string, ChartDataPoint[]> = {};

    chartData.forEach((item) => {
      const quadrant = item.quadrant || '未知';
      if (!map[quadrant]) {
        map[quadrant] = [];
      }
      map[quadrant].push(item);
    });

    return map;
  }, [chartData]);

  // ECharts 配置
  const option = useMemo(() => {
    if (chartData.length === 0) {
      return {
        graphic: [
          {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: '暂无数据',
              fontSize: 16,
              fill: '#A0AEC0',
            },
          },
        ],
      };
    }

    // 构建系列数据 - 按象限分组
    const series = Object.entries(quadrantDataMap).map(([quadrant, data]) => ({
      name: quadrant,
      type: 'scatter',
      symbolSize: (val: number[]) => {
        const [buzz, yoy, search] = val;
        if (sizeRange.max === sizeRange.min) return 30;
        const normalized = (search - sizeRange.min) / (sizeRange.max - sizeRange.min);
        return 12 + normalized * 40;
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
        color: quadrantColors[quadrant]?.primary || '#A0AEC0',
        opacity: 0.8,
        shadowBlur: 6,
        shadowColor: 'rgba(0, 0, 0, 0.08)',
      },
      emphasis: {
        itemStyle: {
          opacity: 1,
          shadowBlur: 15,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
        },
        scale: 1.3,
      },
    }));

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 12,
        padding: [14, 18],
        textStyle: {
          color: '#0F1419',
          fontSize: 12,
        },
        formatter: (params: { data: number[] }) => {
          if (!params.data) return '';
          const [buzz, yoy, search, keyword, category, quadrant] = params.data;
          const yoyColor = yoy >= 0 ? '#10B981' : '#EF4444';

          return `
            <div style="font-size: 13px; min-width: 200px;">
              <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px; color: #0F1419;">
                ${keyword}
              </div>
              <div style="display: grid; gap: 6px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #718096;">品类</span>
                  <span style="font-weight: 500;">${category}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #718096;">声量</span>
                  <span style="font-weight: 500;">${buzz.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #718096;">同比增速</span>
                  <span style="color: ${yoyColor}; font-weight: 600;">
                    ${yoy >= 0 ? '+' : ''}${yoy.toFixed(1)}%
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #718096;">搜索量</span>
                  <span style="font-weight: 500;">${search.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #718096;">象限</span>
                  <span style="font-weight: 500;">${quadrant || '-'}</span>
                </div>
              </div>
            </div>
          `;
        },
      },
      legend: {
        data: Object.keys(quadrantDataMap),
        bottom: 5,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: 11,
          color: '#718096',
        },
      },
      grid: {
        left: 70,
        right: 30,
        top: 30,
        bottom: 60,
        containLabel: false,
      },
      xAxis: {
        name: '声量',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          fontSize: 11,
          fontWeight: 500,
          color: '#718096',
        },
        type: 'value',
        min: 0,
        axisLine: {
          lineStyle: {
            color: '#E2E8F0',
          },
        },
        axisLabel: {
          color: '#A0AEC0',
          fontSize: 10,
          formatter: (value: number) => {
            if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return value.toString();
          },
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        name: '同比增速 (%)',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: {
          fontSize: 11,
          fontWeight: 500,
          color: '#718096',
        },
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#E2E8F0',
          },
        },
        axisLabel: {
          color: '#A0AEC0',
          fontSize: 10,
          formatter: (value: number) => `${value >= 0 ? '+' : ''}${value}%`,
        },
        splitLine: {
          lineStyle: {
            type: 'solid',
            color: '#F1F5F9',
          },
        },
      },
      series: [
        ...series,
        // 零增长线
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'dashed',
              color: '#CBD5E0',
              width: 1,
            },
            label: {
              show: false,
            },
            data: [{ yAxis: 0 }],
          },
        },
      ],
    };
  }, [chartData, quadrantDataMap, thresholds, sizeRange]);

  // 空数据状态
  if (chartData.length === 0) {
    return (
      <div
        ref={chartRef}
        className={`chart-container ${className}`}
      >
        <div className="chart-header">
          <div className="flex items-center gap-3">
            <div className="stat-icon">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h3 className="card-title">关键词气泡图</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">声量与增长分析</p>
            </div>
          </div>
        </div>
        <div className="flex h-72 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className={`chart-container ${className}`}
    >
      {/* 标题 */}
      <div className="chart-header">
        <div className="flex items-center gap-3">
          <div className="stat-icon">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 className="chart-title">关键词气泡图</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {chartData.length} 个关键词
            </p>
          </div>
        </div>
      </div>

      {/* 洞察提示 */}
      {insights && insights.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {insights.map((insight, index) => (
            <span
              key={index}
              className="badge badge-secondary"
            >
              {insight}
            </span>
          ))}
        </div>
      )}

      <ReactECharts
        option={option}
        style={{ height: '380px', width: '100%' }}
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
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[hsl(var(--border))] pt-3">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            已选择 {selectedKeywords.size} 个:
          </span>
          {Array.from(selectedKeywords).map(keyword => (
            <span
              key={keyword}
              className="badge badge-primary"
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
                className="ml-1 text-[hsl(var(--primary-foreground))/0.7] hover:text-[hsl(var(--primary-foreground))] transition-colors"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={() => setSelectedKeywords(new Set())}
            className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors font-medium"
          >
            清除
          </button>
        </div>
      )}
    </div>
  );
});

export default BubbleChart;

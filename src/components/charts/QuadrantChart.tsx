"use client";

import { useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/store/useDataStore';
import { getQuadrantData } from '@/lib/data-processor';
import { ChartDataPoint } from '@/types';

// 象限颜色配置
const quadrantColors: Record<string, string> = {
  '第一象限': '#22c55e', // 高声量高增速 - 绿色
  '第二象限': '#3b82f6', // 低声量高增速 - 蓝色
  '第三象限': '#f59e0b', // 低声量低增速 - 橙色
  '第四象限': '#ef4444', // 高声量低增速 - 红色
  '未知': '#9ca3af', // 灰色
};

// 象限标签配置
const quadrantLabels: Record<string, string> = {
  '第一象限': '高声量高增速',
  '第二象限': '低声量高增速',
  '第三象限': '低声量低增速',
  '第四象限': '高声量低增速',
  '未知': '未知',
};

interface QuadrantChartProps {
  className?: string;
}

const QuadrantChart = forwardRef<HTMLDivElement, QuadrantChartProps>(function QuadrantChart({ className }, ref) {
  const { rawData, filters } = useDataStore();
  const chartRef = useRef<HTMLDivElement>(null);

  // 暴露 ref 给父组件
  useImperativeHandle(ref, () => chartRef.current as HTMLDivElement);

  // 获取象限图数据
  const chartData = useMemo(() => {
    if (rawData.length === 0) return [];
    return getQuadrantData(rawData, filters);
  }, [rawData, filters]);

  // 计算平均值作为分割线
  const avgBuzz = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.buzz, 0);
    return sum / chartData.length;
  }, [chartData]);

  const avgYoy = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.yoy, 0);
    return sum / chartData.length;
  }, [chartData]);

  // 计算气泡大小的缩放因子
  const maxSearch = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map((item) => item.search));
  }, [chartData]);

  // 准备 ECharts 配置
  const option = useMemo(() => {
    if (chartData.length === 0) {
      return {
        title: {
          text: '四象限分析',
          left: 'center',
          top: 10,
        },
        xAxis: {
          name: '声量',
          nameLocation: 'middle',
          nameGap: 30,
          type: 'value',
          min: 0,
        },
        yAxis: {
          name: '同比增速 (%)',
          nameLocation: 'middle',
          nameGap: 40,
          type: 'value',
        },
        series: [],
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

    // 按象限分组数据
    const quadrantDataMap: Record<string, ChartDataPoint[]> = {};
    chartData.forEach((item) => {
      const quadrant = item.quadrant || '未知';
      if (!quadrantDataMap[quadrant]) {
        quadrantDataMap[quadrant] = [];
      }
      quadrantDataMap[quadrant].push(item);
    });

    // 构建系列数据
    const series = Object.entries(quadrantDataMap).map(([quadrant, data]) => ({
      name: quadrantLabels[quadrant] || quadrant,
      type: 'scatter',
      symbolSize: (val: number[]) => {
        // 根据搜索量计算气泡大小，范围 10-60
        const size = (val[2] / maxSearch) * 50 + 10;
        return size;
      },
      data: data.map((item) => [
        item.buzz,
        item.yoy,
        item.search,
        item.keyword,
        item.category,
      ]),
      itemStyle: {
        color: quadrantColors[quadrant] || '#9ca3af',
        opacity: 0.7,
      },
      emphasis: {
        itemStyle: {
          opacity: 1,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
      },
    }));

    return {
      title: {
        text: '四象限分析',
        subtext: `平均值 - 声量: ${avgBuzz.toFixed(0)}, 增速: ${avgYoy.toFixed(1)}%`,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
        subtextStyle: {
          fontSize: 12,
          color: '#6b7280',
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: [12, 16],
        textStyle: {
          color: '#1f2937',
        },
        formatter: (params: { data: [number, number, number, string, string] }) => {
          if (!params.data) return '';
          const [buzz, yoy, search, keyword, category] = params.data;
          const quadrant = chartData.find(
            (item) => item.keyword === keyword && item.category === category
          )?.quadrant || '未知';

          return `
            <div style="font-size: 14px;">
              <div style="font-weight: 600; margin-bottom: 8px; color: #111827;">
                ${keyword}
              </div>
              <div style="display: grid; gap: 4px;">
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="color: #6b7280;">品类:</span>
                  <span style="color: #374151; font-weight: 500;">${category}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="color: #6b7280;">象限:</span>
                  <span style="color: ${quadrantColors[quadrant] || '#9ca3af'}; font-weight: 500;">${quadrant} (${quadrantLabels[quadrant] || ''})</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="color: #6b7280;">声量:</span>
                  <span style="color: #374151; font-weight: 500;">${buzz.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="color: #6b7280;">同比增速:</span>
                  <span style="color: ${yoy >= 0 ? '#22c55e' : '#ef4444'}; font-weight: 500;">${yoy >= 0 ? '+' : ''}${yoy.toFixed(1)}%</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="color: #6b7280;">搜索量:</span>
                  <span style="color: #374151; font-weight: 500;">${search.toLocaleString()}</span>
                </div>
              </div>
            </div>
          `;
        },
      },
      legend: {
        data: Object.keys(quadrantDataMap).map(
          (q) => quadrantLabels[q] || q
        ),
        bottom: 10,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: 12,
        },
      },
      grid: {
        left: 80,
        right: 40,
        top: 80,
        bottom: 80,
        containLabel: true,
      },
      xAxis: {
        name: '声量',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 500,
        },
        type: 'value',
        min: 0,
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 10000) {
              return `${(value / 10000).toFixed(1)}万`;
            }
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
        nameGap: 50,
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 500,
        },
        type: 'value',
        axisLabel: {
          formatter: (value: number) => `${value >= 0 ? '+' : ''}${value}%`,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e5e7eb',
          },
        },
      },
      // 添加象限分割线
      series: [
        ...series,
        // 垂直分割线（平均声量）
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'dashed',
              color: '#374151',
              width: 1,
            },
            label: {
              show: true,
              position: 'end',
              formatter: `平均声量\n${avgBuzz.toFixed(0)}`,
              fontSize: 10,
            },
            data: [
              {
                xAxis: avgBuzz,
              },
            ],
          },
        },
        // 水平分割线（平均YOY）
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'dashed',
              color: '#374151',
              width: 1,
            },
            label: {
              show: true,
              position: 'end',
              formatter: `平均增速\n${avgYoy >= 0 ? '+' : ''}${avgYoy.toFixed(1)}%`,
              fontSize: 10,
            },
            data: [
              {
                yAxis: avgYoy,
              },
            ],
          },
        },
      ],
    };
  }, [chartData, avgBuzz, avgYoy, maxSearch]);

  // 没有数据时的显示
  if (chartData.length === 0) {
    return (
      <div
        ref={chartRef}
        className={`rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800 ${className}`}
      >
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          四象限分析
        </h2>
        <div className="flex h-80 items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700">
          <div className="text-center">
            <p className="text-sm text-neutral-500">
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
      <ReactECharts
        option={option}
        style={{ height: '400px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
});

export default QuadrantChart;

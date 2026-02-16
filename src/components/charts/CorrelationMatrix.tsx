"use client";

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/store/useDataStore';
import { generateCorrelationMatrix } from '@/lib/advanced-analytics';
import { cn } from '@/lib/utils';

interface CorrelationMatrixProps {
  className?: string;
}

export default function CorrelationMatrix({ className }: CorrelationMatrixProps) {
  const { rawData, filters } = useDataStore();

  // 生成相关性矩阵
  const matrixData = useMemo(() => {
    if (rawData.length === 0) return null;

    const metrics = [
      { key: 'TTL_Buzz' as const, label: '声量' },
      { key: '小红书_SEARCH' as const, label: '小红书搜索' },
      { key: '抖音_SEARCH' as const, label: '抖音搜索' },
      { key: 'TTL_Buzz_YOY' as const, label: 'YOY增速' },
    ];

    return generateCorrelationMatrix(rawData, metrics);
  }, [rawData, filters]);

  // 图表配置
  const option = useMemo(() => {
    if (!matrixData) {
      return {
        graphic: [{
          type: 'text',
          left: 'center',
          top: 'middle',
          style: { text: '暂无数据', fontSize: 16, fill: '#9CA3AF' },
        }],
      };
    }

    const { labels, matrix } = matrixData;

    // 转换为热力图数据格式 [x, y, value]
    const heatmapData: [number, number, number][] = [];
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        heatmapData.push([x, y, parseFloat(value.toFixed(2))]);
      });
    });

    return {
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: { color: '#111827', fontSize: 12 },
        formatter: (params: any) => {
          const xLabel = labels[params.data[0]];
          const yLabel = labels[params.data[1]];
          const value = params.data[2];
          const strength = Math.abs(value) > 0.7 ? '强' : Math.abs(value) > 0.4 ? '中等' : '弱';
          const direction = value > 0 ? '正相关' : '负相关';

          return `
            <div style="font-size: 13px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${xLabel} × ${yLabel}</div>
              <div style="color: #6B7280;">相关系数: <span style="font-weight: 500; color: #111;">${value}</span></div>
              <div style="color: ${value > 0 ? '#10B981' : '#EF4444'};">${strength}${direction}</div>
            </div>
          `;
        },
      },
      grid: {
        top: 40,
        bottom: 60,
        left: 80,
        right: 40,
      },
      xAxis: {
        type: 'category',
        data: labels,
        splitArea: { show: true },
        axisLabel: {
          interval: 0,
          rotate: 30,
          fontSize: 11,
          color: '#6B7280',
        },
      },
      yAxis: {
        type: 'category',
        data: labels,
        splitArea: { show: true },
        axisLabel: {
          fontSize: 11,
          color: '#6B7280',
        },
      },
      visualMap: {
        min: -1,
        max: 1,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 10,
        inRange: {
          color: ['#EF4444', '#FEE2E2', '#FFFFFF', '#DCFCE7', '#10B981'],
        },
        text: ['强正相关', '强负相关'],
        textStyle: { fontSize: 10, color: '#6B7280' },
      },
      series: [{
        name: '相关性',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
          fontSize: 11,
          color: '#374151',
          formatter: (params: any) => params.data[2].toFixed(2),
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      }],
    };
  }, [matrixData]);

  // 提取强相关关系
  const strongCorrelations = useMemo(() => {
    if (!matrixData) return [];

    const { labels, matrix } = matrixData;
    const strong: { x: string; y: string; value: number }[] = [];

    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (x !== y && Math.abs(value) > 0.6) {
          strong.push({ x: labels[x], y: labels[y], value });
        }
      });
    });

    return strong.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 3);
  }, [matrixData]);

  if (!matrixData) {
    return (
      <div className={cn("rounded-xl border border-gray-100 bg-white p-5", className)}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">相关性矩阵</h3>
            <p className="text-sm text-gray-500">指标间关联性分析</p>
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
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">相关性矩阵</h3>
          <p className="text-sm text-gray-500">指标间关联性分析</p>
        </div>
      </div>

      {/* 图表 */}
      <ReactECharts
        option={option}
        style={{ height: '320px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />

      {/* 强相关提示 */}
      {strongCorrelations.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-xs font-medium text-blue-800 mb-2">关键发现：</p>
          {strongCorrelations.map((item, i) => (
            <p key={i} className="text-xs text-blue-700">
              • {item.x} 与 {item.y} {item.value > 0 ? '正' : '负'}相关（{item.value.toFixed(2)}）
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

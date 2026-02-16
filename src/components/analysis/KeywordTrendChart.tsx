"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface MonthlyData {
  month: string;
  buzz: number;
  yoy: number;
}

interface KeywordTrendChartProps {
  data: MonthlyData[];
  keywordName: string;
}

export default function KeywordTrendChart({ data, keywordName }: KeywordTrendChartProps) {
  // 格式化数据用于图表
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      // 简化月份显示：2025年1月 → 1月
      shortMonth: item.month.replace(/^\d{4}年/, ""),
      // YOY转换为百分比显示
      yoyPercent: item.yoy * 100,
    }));
  }, [data]);

  // 计算最大值用于Y轴
  const { maxBuzz, minYoy, maxYoy } = useMemo(() => {
    if (chartData.length === 0) return { maxBuzz: 1000, minYoy: -100, maxYoy: 100 };

    const buzzValues = chartData.map(d => d.buzz).filter(v => v > 0);
    const yoyValues = chartData.map(d => d.yoyPercent);

    return {
      maxBuzz: Math.max(...buzzValues) || 1000,
      minYoy: Math.min(...yoyValues, 0),
      maxYoy: Math.max(...yoyValues, 0),
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-300 text-xs">
        暂无月度数据
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="shortMonth"
            tick={{ fontSize: 8, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 8, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 8, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[minYoy - 10, maxYoy + 10]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '11px',
              padding: '8px',
            }}
            formatter={(value, name) => {
              const numValue = Number(value);
              if (name === 'buzz') return [numValue.toLocaleString(), 'Buzz'];
              if (name === 'yoyPercent') return [`${numValue.toFixed(1)}%`, 'YOY'];
              return [numValue, name];
            }}
            labelFormatter={(label) => `${keywordName} - ${label}`}
          />
          <ReferenceLine yAxisId="right" y={0} stroke="#9ca3af" strokeDasharray="3 3" />
          <Bar
            yAxisId="left"
            dataKey="buzz"
            fill="#3b82f6"
            fillOpacity={0.6}
            radius={[2, 2, 0, 0]}
            name="buzz"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="yoyPercent"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 0, r: 2 }}
            activeDot={{ r: 3, fill: '#10b981' }}
            name="yoyPercent"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

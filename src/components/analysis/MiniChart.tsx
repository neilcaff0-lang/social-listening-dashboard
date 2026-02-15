"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { MiniChartDataPoint } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface MiniChartProps {
  data: MiniChartDataPoint[];
  type?: "bar" | "line" | "mixed";
  height?: number;
  showGrowth?: boolean;
}

export default function MiniChart({
  data,
  type = "mixed",
  height = 200,
  showGrowth = true,
}: MiniChartProps) {
  const formatNumber = (value: number) => {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}w`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={50}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={formatNumber}
            stroke="#9ca3af"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            formatter={(value) => [formatNumber(Number(value)), "热度"]}
          />
          <Bar
            dataKey="heat"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={50}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => `${v}%`}
            stroke="#9ca3af"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value}%`, "增速"]}
          />
          <Line
            type="monotone"
            dataKey="growth"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Mixed chart (bar + line)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={50}
          stroke="#9ca3af"
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 10 }}
          tickFormatter={formatNumber}
          stroke="#9ca3af"
        />
        {showGrowth && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => `${v}%`}
            stroke="#9ca3af"
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            fontSize: "12px",
          }}
          formatter={(value, name) => [
            name === "growth" ? `${value}%` : formatNumber(Number(value)),
            name === "growth" ? "增速" : "热度",
          ]}
        />
        <Bar
          yAxisId="left"
          dataKey="heat"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        {showGrowth && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="growth"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 3 }}
            activeDot={{ r: 5 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// 简化的迷你图表组件
export function MicroChart({
  data,
  type = "bar",
  className,
}: {
  data: number[];
  type?: "bar" | "line";
  className?: string;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  if (type === "bar") {
    return (
      <div className={cn("flex items-end gap-0.5 h-8", className)}>
        {data.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-blue-500 rounded-t"
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  }

  // Line chart using SVG
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("h-8 w-full", className)}>
      <polyline
        points={points}
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

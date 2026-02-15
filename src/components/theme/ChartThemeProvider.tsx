'use client';

import { useTheme } from './ThemeProvider';

// 图表主题配置
export const chartThemes = {
  light: {
    backgroundColor: 'transparent',
    textColor: '#374151',
    subTextColor: '#6b7280',
    axisLineColor: '#e5e7eb',
    splitLineColor: '#e5e7eb',
    tooltipBackground: 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: '#e5e7eb',
    tooltipText: '#1f2937',
  },
  dark: {
    backgroundColor: 'transparent',
    textColor: '#e5e7eb',
    subTextColor: '#9ca3af',
    axisLineColor: '#374151',
    splitLineColor: '#374151',
    tooltipBackground: 'rgba(23, 23, 23, 0.95)',
    tooltipBorder: '#404040',
    tooltipText: '#e5e7eb',
  },
};

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  return chartThemes[resolvedTheme];
}

// 获取 ECharts 主题配置
export function getEChartsTheme(theme: 'light' | 'dark') {
  const colors = chartThemes[theme];

  return {
    backgroundColor: colors.backgroundColor,
    textStyle: {
      color: colors.textColor,
    },
    title: {
      textStyle: {
        color: colors.textColor,
      },
      subtextStyle: {
        color: colors.subTextColor,
      },
    },
    legend: {
      textStyle: {
        color: colors.textColor,
      },
    },
    tooltip: {
      backgroundColor: colors.tooltipBackground,
      borderColor: colors.tooltipBorder,
      textStyle: {
        color: colors.tooltipText,
      },
    },
    xAxis: {
      axisLine: {
        lineStyle: {
          color: colors.axisLineColor,
        },
      },
      axisLabel: {
        color: colors.textColor,
      },
      splitLine: {
        lineStyle: {
          color: colors.splitLineColor,
        },
      },
    },
    yAxis: {
      axisLine: {
        lineStyle: {
          color: colors.axisLineColor,
        },
      },
      axisLabel: {
        color: colors.textColor,
      },
      splitLine: {
        lineStyle: {
          color: colors.splitLineColor,
        },
      },
    },
  };
}

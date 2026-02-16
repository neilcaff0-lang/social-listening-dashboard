"use client";

import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { calculateStats, filterData, normalizePercentValue } from '@/lib/data-processor';
import { analyzeCategories, predictTrend } from '@/lib/advanced-analytics';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Award
} from 'lucide-react';

interface InsightsPanelProps {
  className?: string;
}

interface InsightItem {
  type: 'growth' | 'decline' | 'opportunity' | 'warning' | 'trend';
  icon: React.ReactNode;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export default function InsightsPanel({ className }: InsightsPanelProps) {
  const { rawData, filters } = useDataStore();

  // 生成洞察
  const insights = useMemo<InsightItem[]>(() => {
    if (rawData.length === 0) return [];

    const items: InsightItem[] = [];
    const filteredData = filterData(rawData, filters);

    // 1. 整体趋势洞察
    const stats = calculateStats(rawData, filters);
    if (stats.avgYoy > 30) {
      items.push({
        type: 'growth',
        icon: <TrendingUp className="w-4 h-4" />,
        title: '整体高速增长',
        description: `平均同比增长 ${stats.avgYoy.toFixed(1)}%，表现优异`,
        priority: 'high',
      });
    } else if (stats.avgYoy < -10) {
      items.push({
        type: 'decline',
        icon: <TrendingDown className="w-4 h-4" />,
        title: '整体下降警示',
        description: `平均同比下降 ${Math.abs(stats.avgYoy).toFixed(1)}%，需关注`,
        priority: 'high',
      });
    }

    // 2. 品类洞察
    const categories = analyzeCategories(rawData, filters);
    if (categories.length > 1) {
      const topCategory = categories[0];
      const fastGrowingCategory = [...categories].sort((a, b) => b.avgYoy - a.avgYoy)[0];

      if (fastGrowingCategory.avgYoy > 50) {
        items.push({
          type: 'opportunity',
          icon: <Zap className="w-4 h-4" />,
          title: `${fastGrowingCategory.category} 增长迅猛`,
          description: `YOY +${fastGrowingCategory.avgYoy.toFixed(1)}%，建议加大投入`,
          priority: 'high',
        });
      }

      if (topCategory.shareOfVoice > 50) {
        items.push({
          type: 'trend',
          icon: <BarChart3 className="w-4 h-4" />,
          title: `${topCategory.category} 占据主导`,
          description: `声量份额达 ${topCategory.shareOfVoice.toFixed(1)}%`,
          priority: 'medium',
        });
      }
    }

    // 3. 关键词洞察
    const keywordMap = new Map<string, { buzz: number; yoy: number; months: string[] }>();
    filteredData.forEach(row => {
      const existing = keywordMap.get(row.KEYWORDS);
      if (existing) {
        existing.buzz += row.TTL_Buzz || 0;
        existing.months.push(`${row.YEAR}-${row.MONTH}`);
      } else {
        keywordMap.set(row.KEYWORDS, {
          buzz: row.TTL_Buzz || 0,
          yoy: normalizePercentValue(row.TTL_Buzz_YOY),
          months: [`${row.YEAR}-${row.MONTH}`],
        });
      }
    });

    const keywords = Array.from(keywordMap.entries());

    // 找出高增长关键词
    const highGrowth = keywords
      .filter(([_, data]) => data.yoy > 100 && data.buzz > 10000)
      .sort((a, b) => b[1].yoy - a[1].yoy)[0];

    if (highGrowth) {
      items.push({
        type: 'opportunity',
        icon: <Target className="w-4 h-4" />,
        title: `${highGrowth[0]} 是明星关键词`,
        description: `高增长 (${highGrowth[1].yoy.toFixed(0)}%) + 高声量`,
        priority: 'high',
      });
    }

    // 找出下降关键词
    const declining = keywords.filter(([_, data]) => data.yoy < -30);
    if (declining.length > 0) {
      items.push({
        type: 'warning',
        icon: <AlertCircle className="w-4 h-4" />,
        title: `${declining.length} 个关键词显著下降`,
        description: declining.map(([k]) => k).slice(0, 3).join('、') + (declining.length > 3 ? ' 等' : ''),
        priority: 'medium',
      });
    }

    // 4. 预测洞察
    const buzzByMonth = filteredData.reduce((acc, row) => {
      const key = `${row.YEAR}-${row.MONTH}`;
      acc[key] = (acc[key] || 0) + (row.TTL_Buzz || 0);
      return acc;
    }, {} as Record<string, number>);

    const monthValues = Object.entries(buzzByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, v]) => v);

    if (monthValues.length >= 3) {
      const prediction = predictTrend(monthValues);
      if (prediction.trend === 'up' && prediction.confidence > 0.5) {
        items.push({
          type: 'trend',
          icon: <Lightbulb className="w-4 h-4" />,
          title: '预测：声量将持续增长',
          description: `基于现有趋势预测，置信度 ${(prediction.confidence * 100).toFixed(0)}%`,
          priority: 'medium',
        });
      }
    }

    // 5. Top 关键词
    const topKeyword = keywords.sort((a, b) => b[1].buzz - a[1].buzz)[0];
    if (topKeyword) {
      items.push({
        type: 'trend',
        icon: <Award className="w-4 h-4" />,
        title: `${topKeyword[0]} 声量最高`,
        description: `总声量达 ${(topKeyword[1].buzz / 1000).toFixed(1)}K`,
        priority: 'low',
      });
    }

    return items.slice(0, 6);
  }, [rawData, filters]);

  if (insights.length === 0) {
    return (
      <div className={cn("rounded-xl border border-gray-100 bg-white p-5", className)}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">智能洞察</h3>
            <p className="text-sm text-gray-500">自动生成的数据洞察</p>
          </div>
        </div>
        <div className="flex h-32 items-center justify-center rounded-lg bg-gray-50">
          <p className="text-sm text-gray-400">暂无数据</p>
        </div>
      </div>
    );
  }

  const priorityStyles = {
    high: 'bg-red-50 border-red-100',
    medium: 'bg-amber-50 border-amber-100',
    low: 'bg-blue-50 border-blue-100',
  };

  const iconStyles = {
    high: 'text-red-600',
    medium: 'text-amber-600',
    low: 'text-blue-600',
  };

  const typeLabels = {
    growth: '增长',
    decline: '下降',
    opportunity: '机会',
    warning: '警告',
    trend: '趋势',
  };

  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white p-5", className)}>
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">智能洞察</h3>
            <p className="text-sm text-gray-500">基于 AI 分析生成的关键发现</p>
          </div>
        </div>
      </div>

      {/* 洞察列表 */}
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              priorityStyles[insight.priority]
            )}
          >
            <div className={cn("mt-0.5", iconStyles[insight.priority])}>
              {insight.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{insight.title}</p>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  insight.priority === 'high' ? "bg-red-200 text-red-800" :
                  insight.priority === 'medium' ? "bg-amber-200 text-amber-800" :
                  "bg-blue-200 text-blue-800"
                )}>
                  {typeLabels[insight.type]}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/store/useDataStore';
import {
  analyzeSubcategories,
  hasSubcategories,
} from '@/lib/advanced-analytics';
import { SUBCATEGORY_CATEGORIES } from '@/types/index';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Package, ArrowRight } from 'lucide-react';
import SingleSubcategoryInsight from './SingleSubcategoryInsight';

const categoryIcons: Record<string, string> = {
  '裤子': '👖',
  '包': '👜',
  '鞋': '👟',
};

const categoryColors: Record<string, string[]> = {
  '裤子': ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
  '包': ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
  '鞋': ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
};

interface SubcategoryAnalysisProps {
  className?: string;
}

export default function SubcategoryAnalysis({ className }: SubcategoryAnalysisProps) {
  const { rawData, filters } = useDataStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<{ category: string; subcategory: string } | null>(null);

  // 检查数据中是否有细分类目的品类
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    rawData.forEach((row) => {
      if (hasSubcategories(row.CATEGORY) && row.SUBCATEGORY) {
        categories.add(row.CATEGORY);
      }
    });
    return Array.from(categories).sort();
  }, [rawData]);

  // 如果没有细分类目数据，不显示
  if (availableCategories.length === 0) {
    return null;
  }

  // 如果选中了某个细分，显示细分洞察
  if (selectedSubcategory) {
    return (
      <SingleSubcategoryInsight
        category={selectedSubcategory.category}
        subcategory={selectedSubcategory.subcategory}
        onBack={() => setSelectedSubcategory(null)}
        className={className}
      />
    );
  }

  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white p-5", className)}>
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
          <Package className="w-4 h-4 text-pink-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">细分类目洞察</h3>
          <p className="text-sm text-gray-500">裤子、包、鞋的细分分析</p>
        </div>
      </div>

      {/* 品类列表 */}
      <div className="space-y-3">
        {availableCategories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            isExpanded={expandedCategory === category}
            onToggle={() =>
              setExpandedCategory(expandedCategory === category ? null : category)
            }
            onSelectSubcategory={(subcategory) =>
              setSelectedSubcategory({ category, subcategory })
            }
          />
        ))}
      </div>
    </div>
  );
}

// 单个品类区块
interface CategorySectionProps {
  category: string;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectSubcategory: (subcategory: string) => void;
}

function CategorySection({ category, isExpanded, onToggle, onSelectSubcategory }: CategorySectionProps) {
  const { rawData, filters } = useDataStore();

  const analysis = useMemo(
    () => analyzeSubcategories(rawData, filters, category),
    [rawData, filters, category]
  );

  const chartData = useMemo(() => {
    return {
      categories: analysis.map((a) => a.subcategory),
      buzzValues: analysis.map((a) => a.totalBuzz),
      yoyValues: analysis.map((a) => a.avgYoy),
      shareValues: analysis.map((a) => a.shareInCategory),
    };
  }, [analysis]);

  const option = useMemo(() => {
    const colors = categoryColors[category] || ['#3B82F6'];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: { color: '#111827', fontSize: 12 },
      },
      legend: {
        data: ['声量', '品类内份额'],
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      grid: {
        left: 60,
        right: 40,
        top: 20,
        bottom: 50,
      },
      xAxis: {
        type: 'category',
        data: chartData.categories,
        axisLabel: { fontSize: 10, rotate: 15 },
        axisLine: { lineStyle: { color: '#E5E7EB' } },
      },
      yAxis: [
        {
          type: 'value',
          name: '声量',
          nameTextStyle: { fontSize: 10 },
          axisLabel: {
            fontSize: 9,
            formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v),
          },
          splitLine: { lineStyle: { type: 'dashed', color: '#F3F4F6' } },
        },
        {
          type: 'value',
          name: '份额%',
          nameTextStyle: { fontSize: 10 },
          max: 100,
          axisLabel: { fontSize: 9, formatter: '{value}%' },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '声量',
          type: 'bar',
          data: chartData.buzzValues.map((v, i) => ({
            value: v,
            itemStyle: { color: colors[i % colors.length] },
          })),
          barWidth: '50%',
        },
        {
          name: '品类内份额',
          type: 'line',
          yAxisIndex: 1,
          data: chartData.shareValues,
          itemStyle: { color: '#F59E0B' },
          lineStyle: { width: 2, type: 'dashed' },
          symbol: 'circle',
          symbolSize: 6,
        },
      ],
    };
  }, [chartData, category]);

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      {/* 头部 - 可点击展开 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{categoryIcons[category]}</span>
          <span className="font-medium text-gray-900">{category}</span>
          <span className="text-xs text-gray-500">
            ({analysis.length} 个细分)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* 显示Top细分摘要 */}
          {!isExpanded && analysis[0] && (
            <span className="text-xs text-gray-500 hidden sm:inline">
              Top: {analysis[0].subcategory}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="p-4">
          {/* 图表 */}
          <ReactECharts
            option={option}
            style={{ height: '220px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />

          {/* 细分详情表格 */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-medium text-gray-600">
                    细分
                  </th>
                  <th className="text-right py-2 font-medium text-gray-600">
                    声量
                  </th>
                  <th className="text-right py-2 font-medium text-gray-600">
                    YOY
                  </th>
                  <th className="text-right py-2 font-medium text-gray-600">
                    份额
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.slice(0, 5).map((item, index) => (
                  <tr
                    key={item.subcategory}
                    className="border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    onClick={() => onSelectSubcategory(item.subcategory)}
                  >
                    <td className="py-2 text-gray-900">
                      <div className="flex items-center">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              categoryColors[category]?.[index] || '#3B82F6',
                          }}
                        />
                        <span className="flex-1">{item.subcategory}</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </td>
                    <td className="py-2 text-right text-gray-700">
                      {(item.totalBuzz / 1000).toFixed(1)}K
                    </td>
                    <td
                      className={cn(
                        'py-2 text-right font-medium',
                        item.avgYoy >= 0 ? 'text-emerald-600' : 'text-red-600'
                      )}
                    >
                      {item.avgYoy >= 0 ? '+' : ''}
                      {item.avgYoy.toFixed(1)}%
                    </td>
                    <td className="py-2 text-right text-gray-700">
                      {item.shareInCategory.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top关键词 */}
          {analysis[0]?.topKeywords && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">
                {analysis[0].subcategory} Top 关键词:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis[0].topKeywords.slice(0, 5).map((kw) => (
                  <span
                    key={kw.keyword}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                  >
                    {kw.keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

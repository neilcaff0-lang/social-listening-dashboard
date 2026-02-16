"use client";

import { useMemo, useRef, useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import { calculateStats, filterData } from "@/lib/data-processor";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, Search, Hash, Download, ChevronRight } from "lucide-react";
import Link from "next/link";
import BubbleChart from "@/components/charts/BubbleChart";
import TrendChart from "@/components/charts/TrendChart";
import TopKeywordsChart from "@/components/charts/TopKeywordsChart";
import DataTable from "@/components/charts/DataTable";
import LogBubbleChart from "@/components/charts/LogBubbleChart";
import CategoryComparisonChart from "@/components/charts/CategoryComparisonChart";
import CorrelationMatrix from "@/components/charts/CorrelationMatrix";
import AnomalyDetection from "@/components/charts/AnomalyDetection";
import InsightsPanel from "@/components/charts/InsightsPanel";
import KeyCategoriesDeepDive from "@/components/charts/KeyCategoriesDeepDive";
import SubcategoryAnalysis from "@/components/charts/SubcategoryAnalysis";
import StatCard from "@/components/ui/StatCard";
import ActiveFilterTags from "@/components/filters/ActiveFilterTags";
import FilterController from "@/components/filters/FilterController";
import ChartExporter, { ChartExporterRef, ChartItem } from "@/components/export/ChartExporter";
import DataExporter from "@/components/export/DataExporter";

interface MainContentProps {
  children?: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const { rawData, filters } = useDataStore();

  const hasData = rawData.length > 0;

  const bubbleChartRef = useRef<HTMLDivElement>(null);
  const trendChartRef = useRef<HTMLDivElement>(null);
  const topKeywordsChartRef = useRef<HTMLDivElement>(null);
  const chartExporterRef = useRef<ChartExporterRef>(null);

  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportTab, setExportTab] = useState<'charts' | 'data'>('charts');

  const charts: ChartItem[] = [
    { id: "bubble", name: "关键词气泡图", ref: bubbleChartRef },
    { id: "trend", name: "趋势分析", ref: trendChartRef },
    { id: "keywords", name: "Top关键词排行", ref: topKeywordsChartRef },
  ];

  const stats = useMemo(() => {
    if (!hasData) return null;
    return calculateStats(rawData, filters);
  }, [rawData, filters, hasData]);

  const filteredDataCount = useMemo(() => {
    if (!hasData) return 0;
    return filterData(rawData, filters).length;
  }, [rawData, filters, hasData]);

  const hasFilters = useMemo(() => {
    return (
      filters.categories.length > 0 ||
      (filters.timeFilter.year !== undefined) ||
      filters.timeFilter.months.length > 0 ||
      filters.quadrants.length > 0 ||
      (filters.keyword && filters.keyword.trim() !== "")
    );
  }, [filters]);

  return (
    <main className="flex-1 overflow-auto bg-white">
      {hasData ? (
        <div className="p-6 max-w-7xl mx-auto">
          {/* 筛选控制器 */}
          <FilterController />

          {/* 筛选标签 */}
          <ActiveFilterTags />

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="总声量"
              value={stats?.totalBuzz || 0}
              formatNumber={true}
              growthRate={stats?.avgYoy}
              icon={BarChart3}
              color="blue"
            />
            <StatCard
              title="平均同比"
              value={stats?.avgYoy ? `${stats.avgYoy.toFixed(1)}%` : "0%"}
              icon={TrendingUp}
              color="purple"
            />
            <StatCard
              title="总搜索量"
              value={stats?.totalSearch || 0}
              formatNumber={true}
              icon={Search}
              color="green"
            />
            <StatCard
              title="关键词数"
              value={stats?.keywordCount || 0}
              icon={Hash}
              color="orange"
              suffix={
                hasFilters ? (
                  <span>
                    筛选中 {filteredDataCount} / {rawData.length} 条
                  </span>
                ) : (
                  <span>
                    共 {rawData.length} 条数据
                  </span>
                )
              }
            />
          </div>

          {/* 导出按钮 */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowExportPanel(!showExportPanel)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                showExportPanel
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              )}
            >
              <Download className="h-4 w-4" />
              {showExportPanel ? '完成' : '导出'}
            </button>
          </div>

          {/* 导出面板 */}
          {showExportPanel && (
            <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setExportTab('charts')}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                    exportTab === 'charts'
                      ? 'text-gray-900 border-b-2 border-gray-900 -mb-px'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  图表导出
                </button>
                <button
                  onClick={() => setExportTab('data')}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                    exportTab === 'data'
                      ? 'text-gray-900 border-b-2 border-gray-900 -mb-px'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  数据导出
                </button>
              </div>
              <div className="p-4">
                {exportTab === 'charts' && (
                  <ChartExporter
                    ref={chartExporterRef}
                    charts={charts}
                    onExportComplete={(count) => {
                      if (count > 0) console.log(`导出 ${count} 个图表`);
                    }}
                  />
                )}
                {exportTab === 'data' && (
                  <DataExporter
                    onExportComplete={(result) => {
                      if (result.success) console.log(`导出成功: ${result.filename}`);
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* 智能洞察 */}
          <div className="mb-6">
            <InsightsPanel />
          </div>

          {/* 图表区域 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">数据分析</h2>
              <span className="text-xs text-gray-500">点击气泡查看详情</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div ref={bubbleChartRef} className="bg-white rounded-lg border border-gray-200 p-4">
                <BubbleChart />
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <TrendChart ref={trendChartRef} />
              </div>
            </div>

            {/* 新增：对数坐标气泡图 */}
            <div className="mb-4">
              <LogBubbleChart />
            </div>

            {/* 新增：品类对比和相关性分析 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CategoryComparisonChart />
              <CorrelationMatrix />
            </div>
          </div>

          {/* 新增：异常检测 */}
          <div className="mb-6">
            <AnomalyDetection />
          </div>

          {/* 新增：重点品类深度分析（裤子/包/鞋整体表现） */}
          <div className="mb-6">
            <KeyCategoriesDeepDive />
          </div>

          {/* 新增：细分类目排行（单品类内细分元素） */}
          <div className="mb-6">
            <SubcategoryAnalysis />
          </div>

          {/* Top 关键词 */}
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <TopKeywordsChart ref={topKeywordsChartRef} />
            </div>
          </div>

          {/* 数据表格 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <DataTable />
          </div>
        </div>
      ) : (
        /* 空状态 - DaisyUI Hero */
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
              <BarChart3 className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-semibold mb-2 text-gray-900">暂无数据</h1>
            <p className="text-sm text-gray-500 mb-6">
              上传社交媒体监听数据，开始分析趋势和洞察
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              上传数据
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

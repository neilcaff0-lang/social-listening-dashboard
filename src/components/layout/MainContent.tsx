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
    <main className="flex-1 overflow-auto bg-neutral-50">
      {hasData ? (
        <div className="mx-auto max-w-7xl px-8 py-10">
          {/* 筛选控制器 */}
          <FilterController />

          {/* 筛选标签 */}
          <ActiveFilterTags />

          {/* 页面标题 */}
          <div className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
              数据概览
            </h1>
            <p className="mt-2 text-base text-neutral-500">
              社交媒体监听数据的关键指标与洞察
            </p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="总声量"
              value={stats?.totalBuzz || 0}
              formatNumber={true}
              growthRate={stats?.avgYoy}
              icon={BarChart3}
            />
            <StatCard
              title="平均同比"
              value={stats?.avgYoy ? `${stats.avgYoy.toFixed(1)}%` : "0%"}
              icon={TrendingUp}
            />
            <StatCard
              title="总搜索量"
              value={stats?.totalSearch || 0}
              formatNumber={true}
              icon={Search}
            />
            <StatCard
              title="关键词数"
              value={stats?.keywordCount || 0}
              icon={Hash}
              suffix={
                hasFilters ? (
                  <p className="text-xs text-neutral-400">
                    筛选中 {filteredDataCount} / {rawData.length} 条
                  </p>
                ) : (
                  <p className="text-xs text-neutral-400">
                    共 {rawData.length} 条数据
                  </p>
                )
              }
            />
          </div>

          {/* 导出按钮 */}
          <div className="mt-10 flex justify-end">
            <button
              onClick={() => setShowExportPanel(!showExportPanel)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium",
                "transition-all duration-300",
                showExportPanel
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
              )}
            >
              <Download className="h-4 w-4" />
              {showExportPanel ? '完成' : '导出'}
            </button>
          </div>

          {/* 导出面板 */}
          {showExportPanel && (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="flex gap-6 border-b border-neutral-100 pb-4">
                <button
                  onClick={() => setExportTab('charts')}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    exportTab === 'charts'
                      ? 'text-neutral-900'
                      : 'text-neutral-400 hover:text-neutral-600'
                  )}
                >
                  图表导出
                </button>
                <button
                  onClick={() => setExportTab('data')}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    exportTab === 'data'
                      ? 'text-neutral-900'
                      : 'text-neutral-400 hover:text-neutral-600'
                  )}
                >
                  数据导出
                </button>
              </div>

              <div className="mt-6">
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

          {/* 图表区域 */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">数据分析</h2>
              <span className="text-xs text-neutral-400">点击气泡查看详情</span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div ref={bubbleChartRef}>
                <BubbleChart />
              </div>
              <TrendChart ref={trendChartRef} />
            </div>
          </div>

          {/* Top 关键词 */}
          <div className="mt-10">
            <TopKeywordsChart ref={topKeywordsChartRef} />
          </div>

          {/* 数据表格 */}
          <div className="mt-10">
            <DataTable />
          </div>
        </div>
      ) : (
        /* 空状态 */
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <BarChart3 className="h-10 w-10 text-neutral-400" />
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900">
              暂无数据
            </h2>
            <p className="mt-3 text-base text-neutral-500 max-w-sm mx-auto">
              上传社交媒体监听数据，开始分析趋势和洞察
            </p>
            <Link
              href="/upload"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800"
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

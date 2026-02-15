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
    <main className="flex-1 overflow-auto">
      {hasData ? (
        <div className="p-6">
          {/* 筛选控制器 */}
          <FilterController />

          {/* 筛选标签 */}
          <ActiveFilterTags />

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
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
                  <p className="text-xs text-[#9AA0AB]">
                    筛选中 {filteredDataCount} / {rawData.length} 条
                  </p>
                ) : (
                  <p className="text-xs text-[#9AA0AB]">
                    共 {rawData.length} 条数据
                  </p>
                )
              }
            />
          </div>

          {/* 导出按钮 */}
          <div className="flex justify-end mb-5">
            <button
              onClick={() => setShowExportPanel(!showExportPanel)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
                "transition-all duration-300",
                showExportPanel
                  ? "bg-gradient-to-r from-[#6C5CE7] to-[#a29bfe] text-white shadow-lg shadow-[#6C5CE7]/30"
                  : "bg-white text-[#5A6170] border border-[#E8ECF1] hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:shadow-md"
              )}
            >
              <Download className="h-4 w-4" />
              {showExportPanel ? '完成' : '导出数据'}
            </button>
          </div>

          {/* 导出面板 */}
          {showExportPanel && (
            <div className="mb-5 rounded-2xl border border-[#E8ECF1] bg-white p-5 shadow-sm">
              <div className="flex gap-5 border-b border-[#E8ECF1] pb-3 mb-4">
                <button
                  onClick={() => setExportTab('charts')}
                  className={cn(
                    "text-sm font-semibold transition-colors pb-1",
                    exportTab === 'charts'
                      ? 'text-[#6C5CE7] border-b-2 border-[#6C5CE7]'
                      : 'text-[#9AA0AB] hover:text-[#5A6170]'
                  )}
                >
                  图表导出
                </button>
                <button
                  onClick={() => setExportTab('data')}
                  className={cn(
                    "text-sm font-semibold transition-colors pb-1",
                    exportTab === 'data'
                      ? 'text-[#6C5CE7] border-b-2 border-[#6C5CE7]'
                      : 'text-[#9AA0AB] hover:text-[#5A6170]'
                  )}
                >
                  数据导出
                </button>
              </div>

              <div>
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1A1D23]">数据分析</h2>
              <span className="text-xs text-[#9AA0AB] bg-[#F5F7FA] px-3 py-1 rounded-full">点击气泡查看详情</span>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div ref={bubbleChartRef}>
                <BubbleChart />
              </div>
              <TrendChart ref={trendChartRef} />
            </div>
          </div>

          {/* Top 关键词 */}
          <div className="mb-6">
            <TopKeywordsChart ref={topKeywordsChartRef} />
          </div>

          {/* 数据表格 */}
          <div>
            <DataTable />
          </div>
        </div>
      ) : (
        /* 空状态 */
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5F7FA] to-[#EEF1F5] shadow-inner">
              <BarChart3 className="h-8 w-8 text-[#9AA0AB]" />
            </div>
            <h2 className="text-lg font-bold text-[#1A1D23]">
              暂无数据
            </h2>
            <p className="mt-2 text-sm text-[#9AA0AB] max-w-xs mx-auto">
              上传社交媒体监听数据，开始分析趋势和洞察
            </p>
            <Link
              href="/upload"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#a29bfe] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/30 transition-all hover:shadow-xl hover:-translate-y-0.5"
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

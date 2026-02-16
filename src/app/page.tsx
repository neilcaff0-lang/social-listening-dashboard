"use client";

import { useRouter } from "next/navigation";
import { Upload, BarChart3, FileSpreadsheet, Database, TrendingUp, Layers, Hash } from "lucide-react";
import { useDataStore } from "@/store/useDataStore";
import { sampleData, getCategories } from "@/lib/sample-data";
import { StorageStatus } from "@/components/ui/StorageStatus";
import TopBar from "@/components/layout/TopBar";

export default function Home() {
  const router = useRouter();
  const { rawData, categories, sheetInfos, setRawData, setFilters, isLoading, setLoading } = useDataStore();

  const handleUploadClick = () => {
    router.push("/upload");
  };

  const handleLoadSampleData = async () => {
    setLoading(true);
    try {
      const uniqueCategories = getCategories();
      const categoryData = uniqueCategories.map((name) => ({
        id: name,
        name,
        sheetName: "示例数据"
      }));

      const years = [...new Set(sampleData.map(d => d.YEAR))];
      const months = [...new Set(sampleData.map(d => d.MONTH))];

      setRawData(sampleData, categoryData, [
        { name: "示例数据", rowCount: sampleData.length, columns: Object.keys(sampleData[0]) }
      ]);

      setFilters({
        categories: [],
        timeFilter: { year: years[0], months: months },
        quadrants: [],
        keyword: '',
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("加载示例数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasData = rawData.length > 0;
  const uniqueKeywords = hasData ? new Set(rawData.map(d => d.KEYWORDS)).size : 0;
  const uniqueMonths = hasData ? new Set(rawData.map(d => `${d.YEAR}-${d.MONTH}`)).size : 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <TopBar />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          {/* Logo 区域 */}
          <div className="mb-10 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] flex items-center justify-center">
              <BarChart3 className="h-10 w-10" />
            </div>
          </div>

          {/* 欢迎信息 */}
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
            欢迎使用 SNS Analytics
          </h1>

          {/* 产品介绍 */}
          <p className="mb-12 text-lg text-[hsl(var(--muted-foreground))]">
            帮助用户分析社交媒体数据，生成可视化图表，支持导出用于PPT汇报
          </p>

          {/* 按钮区域 */}
          <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={handleUploadClick}
              className="btn btn-lg"
            >
              <Upload className="h-5 w-5" />
              上传数据
            </button>
            <button
              onClick={handleLoadSampleData}
              disabled={isLoading}
              className="btn btn-secondary btn-lg"
            >
              <FileSpreadsheet className="h-5 w-5" />
              {isLoading ? "加载中..." : "查看示例数据"}
            </button>
          </div>

          {/* 已有数据状态 */}
          {hasData && (
            <div className="space-y-6">
              <div className="dashboard-card text-left">
                <div className="flex items-center gap-2 mb-6">
                  <Database className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <span className="font-semibold text-[hsl(var(--foreground))]">当前数据状态</span>
                </div>

                <div className="stats-grid mb-6">
                  <div className="rounded-xl bg-[hsl(var(--muted))] p-5 text-center border border-[hsl(var(--border))]">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span className="text-2xl font-bold text-[hsl(var(--foreground))]">{rawData.length}</span>
                    </div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">数据行数</div>
                  </div>

                  <div className="rounded-xl bg-[hsl(var(--muted))] p-5 text-center border border-[hsl(var(--border))]">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Layers className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span className="text-2xl font-bold text-[hsl(var(--foreground))]">{categories.length}</span>
                    </div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">品类数量</div>
                  </div>

                  <div className="rounded-xl bg-[hsl(var(--muted))] p-5 text-center border border-[hsl(var(--border))]">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Hash className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span className="text-2xl font-bold text-[hsl(var(--foreground))]">{uniqueKeywords}</span>
                    </div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">关键词数量</div>
                  </div>
                </div>

                <div className="text-sm text-[hsl(var(--muted-foreground))] mb-6 space-y-1">
                  {sheetInfos.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">数据来源:</span>
                      <span className="truncate" title={sheetInfos.map(s => s.name).join(", ")}>
                        {sheetInfos.map(s => s.name).join(", ")}
                      </span>
                    </div>
                  )}
                  <div>共 {uniqueMonths} 个月数据</div>
                </div>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="btn w-full"
                >
                  查看仪表盘
                </button>
              </div>

              <StorageStatus />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

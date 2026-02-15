"use client";

import { useRouter } from "next/navigation";
import { Upload, BarChart3, FileSpreadsheet, Database } from "lucide-react";
import { useDataStore } from "@/store/useDataStore";
import { sampleData, getCategories } from "@/lib/sample-data";
import { Button } from "@/components/ui/Button";
import { StorageStatus } from "@/components/ui/StorageStatus";
import Header from "@/components/layout/Header";

export default function Home() {
  const router = useRouter();
  const { rawData, categories, sheetInfos, setRawData, setFilters, isLoading, setLoading } = useDataStore();

  const handleUploadClick = () => {
    router.push("/upload");
  };

  const handleLoadSampleData = async () => {
    setLoading(true);
    try {
      // 获取品类列表
      const uniqueCategories = getCategories();
      const categoryData = uniqueCategories.map((name) => ({
        id: name,
        name,
        sheetName: "示例数据"
      }));

      // 从示例数据中获取年份和月份
      const years = [...new Set(sampleData.map(d => d.YEAR))];
      const months = [...new Set(sampleData.map(d => d.MONTH))];

      // 设置示例数据
      setRawData(sampleData, categoryData, [
        { name: "示例数据", rowCount: sampleData.length, columns: Object.keys(sampleData[0]) }
      ]);

      // 重置筛选条件以匹配示例数据的时间范围
      setFilters({
        categories: [],
        timeFilter: { year: years[0], months: months },
        quadrants: [],
        keyword: '',
      });

      // 跳转到仪表盘
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* 顶部导航栏 */}
      <Header />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          {/* Logo 区域 */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/25">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* 欢迎信息 */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
            欢迎使用 SNS Analytics Dashboard
          </h1>

          {/* 产品介绍 */}
          <p className="mb-10 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            帮助用户分析社交媒体数据，生成可视化图表，支持导出用于PPT汇报
          </p>

          {/* 按钮区域 */}
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              onClick={handleUploadClick}
              size="lg"
              className="gap-2"
            >
              <Upload className="h-5 w-5" />
              上传数据
            </Button>
            <Button
              onClick={handleLoadSampleData}
              variant="outline"
              size="lg"
              disabled={isLoading}
              className="gap-2"
            >
              <FileSpreadsheet className="h-5 w-5" />
              {isLoading ? "加载中..." : "查看示例数据"}
            </Button>
          </div>

          {/* 已有数据状态 */}
          {hasData && (
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  <Database className="h-4 w-4 text-blue-600" />
                  当前数据状态
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                    <div className="text-2xl font-bold text-blue-600">{rawData.length}</div>
                    <div className="text-xs text-neutral-500">数据行数</div>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                    <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
                    <div className="text-xs text-neutral-500">品类数量</div>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                    <div className="text-2xl font-bold text-blue-600">{uniqueKeywords}</div>
                    <div className="text-xs text-neutral-500">关键词数量</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-neutral-500">
                  {sheetInfos.length > 0 && `数据来源: ${sheetInfos.map(s => s.name).join(", ")}`} · {uniqueMonths} 个月数据
                </div>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full"
                >
                  查看仪表盘
                </Button>
              </div>

              {/* 存储状态 */}
              <StorageStatus />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

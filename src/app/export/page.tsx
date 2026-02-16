"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useDataStore } from "@/store/useDataStore";
import { filterData, calculateStats } from "@/lib/data-processor";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Check,
  X,
  Square,
  SquareCheck,
  Loader2,
  BarChart3,
  TrendingUp,
  Hash,
  Settings,
  Eye,
} from "lucide-react";
import { clsx } from "clsx";
import { RawDataRow } from "@/types";
import Link from "next/link";
import ModuleNav from "@/components/layout/ModuleNav";
import TopBar from "@/components/layout/TopBar";

// 导出配置类型
interface ExportConfig {
  chartScale: 1 | 2 | 3;
  dataFormat: "csv" | "excel";
  includeHeaders: boolean;
}

// 可导出项目类型
interface ExportableItem {
  id: string;
  name: string;
  type: "chart" | "data";
  description: string;
  icon: React.ElementType;
}

// 列定义
interface ColumnDefinition {
  key: keyof RawDataRow;
  label: string;
  defaultSelected: boolean;
}

// 所有可用列定义
const AVAILABLE_COLUMNS: ColumnDefinition[] = [
  { key: "YEAR", label: "年份", defaultSelected: true },
  { key: "MONTH", label: "月份", defaultSelected: true },
  { key: "CATEGORY", label: "品类", defaultSelected: true },
  { key: "KEYWORDS", label: "关键词", defaultSelected: true },
  { key: "小红书_Buzz", label: "小红书声量", defaultSelected: true },
  { key: "抖音_Buzz", label: "抖音声量", defaultSelected: true },
  { key: "TTL_Buzz", label: "总声量", defaultSelected: true },
  { key: "TTL_Buzz_YOY", label: "声量同比增速", defaultSelected: true },
  { key: "TTL_Buzz_MOM", label: "声量环比增速", defaultSelected: false },
  { key: "小红书_SEARCH", label: "小红书搜索量", defaultSelected: true },
  { key: "小红书_SEARCH_vs_Dec", label: "小红书搜索vs12月", defaultSelected: false },
  { key: "抖音_SEARCH", label: "抖音搜索量", defaultSelected: true },
  { key: "抖音_SEARCH_vs_Dec", label: "抖音搜索vs12月", defaultSelected: false },
  { key: "象限图", label: "象限分类", defaultSelected: true },
];

// 可导出项目列表
const EXPORTABLE_ITEMS: ExportableItem[] = [
  {
    id: "quadrant-chart",
    name: "四象限分析图",
    type: "chart",
    description: "声量与增速的散点分布图",
    icon: BarChart3,
  },
  {
    id: "trend-chart",
    name: "趋势分析图",
    type: "chart",
    description: "多品类趋势对比折线图",
    icon: TrendingUp,
  },
  {
    id: "keywords-chart",
    name: "Top关键词排行图",
    type: "chart",
    description: "关键词声量/增速/搜索量排行",
    icon: Hash,
  },
  {
    id: "filtered-data",
    name: "筛选后数据",
    type: "data",
    description: "当前筛选条件下的所有数据",
    icon: FileSpreadsheet,
  },
  {
    id: "all-data",
    name: "全部数据",
    type: "data",
    description: "导入的所有原始数据",
    icon: FileText,
  },
];

// 导出进度类型
interface ExportProgress {
  status: "idle" | "preparing" | "exporting" | "completed" | "error";
  current: number;
  total: number;
  percentage: number;
  message: string;
}

// 导出结果
interface ExportResult {
  success: boolean;
  itemName: string;
  filename?: string;
  error?: string;
}

export default function ExportPage() {
  const { rawData, filters } = useDataStore();
  const [isClient, setIsClient] = useState(false);

  // 等待客户端加载完成（确保 zustand persist 恢复数据）
  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasData = rawData.length > 0;

  // 选中的导出项目
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  // 导出配置
  const [config, setConfig] = useState<ExportConfig>({
    chartScale: 2,
    dataFormat: "excel",
    includeHeaders: true,
  });
  // 选中的数据列
  const [selectedColumns, setSelectedColumns] = useState<Set<keyof RawDataRow>>(
    () => new Set(AVAILABLE_COLUMNS.filter((col) => col.defaultSelected).map((col) => col.key))
  );
  // 导出状态
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>({
    status: "idle",
    current: 0,
    total: 0,
    percentage: 0,
    message: "",
  });
  const [results, setResults] = useState<ExportResult[]>([]);
  // 预览模式
  const [previewItem, setPreviewItem] = useState<string | null>(null);

  // 图表 refs
  const quadrantChartRef = useRef<HTMLDivElement>(null);
  const trendChartRef = useRef<HTMLDivElement>(null);
  const keywordsChartRef = useRef<HTMLDivElement>(null);

  // 计算筛选后的数据
  const filteredData = useMemo(() => {
    if (!rawData.length) return [];
    return filterData(rawData, filters);
  }, [rawData, filters]);

  // 统计数据
  const stats = useMemo(() => {
    if (!hasData) return null;
    return calculateStats(rawData, filters);
  }, [rawData, filters, hasData]);

  // 切换项目选择
  const toggleItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === EXPORTABLE_ITEMS.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(EXPORTABLE_ITEMS.map((item) => item.id)));
    }
  }, [selectedItems.size]);

  // 切换列选择
  const toggleColumn = useCallback((key: keyof RawDataRow) => {
    setSelectedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  // 全选列
  const selectAllColumns = useCallback(() => {
    setSelectedColumns(new Set(AVAILABLE_COLUMNS.map((col) => col.key)));
  }, []);

  // 清空列选择
  const clearColumnSelection = useCallback(() => {
    setSelectedColumns(new Set());
  }, []);

  // 导出图表为图片
  const exportChart = async (itemId: string): Promise<ExportResult> => {
    const item = EXPORTABLE_ITEMS.find((i) => i.id === itemId);
    if (!item) return { success: false, itemName: "", error: "项目不存在" };

    let chartRef: React.RefObject<HTMLDivElement | null> | null = null;
    if (itemId === "quadrant-chart") chartRef = quadrantChartRef;
    else if (itemId === "trend-chart") chartRef = trendChartRef;
    else if (itemId === "keywords-chart") chartRef = keywordsChartRef;

    if (!chartRef?.current) {
      return { success: false, itemName: item.name, error: "图表未渲染" };
    }

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: config.chartScale,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const dataUrl = canvas.toDataURL("image/png", 1);
      const link = document.createElement("a");
      const filename = `${item.name}_${new Date().toISOString().slice(0, 10)}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();

      return { success: true, itemName: item.name, filename };
    } catch (error) {
      return {
        success: false,
        itemName: item.name,
        error: error instanceof Error ? error.message : "导出失败",
      };
    }
  };

  // 导出数据
  const exportData = async (itemId: string): Promise<ExportResult> => {
    const item = EXPORTABLE_ITEMS.find((i) => i.id === itemId);
    if (!item) return { success: false, itemName: "", error: "项目不存在" };

    const data = itemId === "filtered-data" ? filteredData : rawData;
    if (data.length === 0) {
      return { success: false, itemName: item.name, error: "没有数据可导出" };
    }

    const columns = AVAILABLE_COLUMNS.filter((col) => selectedColumns.has(col.key));
    if (columns.length === 0) {
      return { success: false, itemName: item.name, error: "请至少选择一列" };
    }

    try {
      if (config.dataFormat === "csv") {
        return await exportToCSV(data, columns, item.name);
      } else {
        return await exportToExcel(data, columns, item.name);
      }
    } catch (error) {
      return {
        success: false,
        itemName: item.name,
        error: error instanceof Error ? error.message : "导出失败",
      };
    }
  };

  // 导出为 CSV
  const exportToCSV = async (
    data: RawDataRow[],
    columns: ColumnDefinition[],
    itemName: string
  ): Promise<ExportResult> => {
    const headers = columns.map((col) => col.label).join(",");
    const rows: string[] = [];
    const batchSize = 100;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchRows = batch.map((row) =>
        columns
          .map((col) => {
            const value = row[col.key];
            const stringValue = value?.toString() ?? "";
            if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(",")
      );
      rows.push(...batchRows);

      const current = Math.min(i + batchSize, data.length);
      const percentage = Math.round((current / data.length) * 100);
      setProgress((prev) => ({
        ...prev,
        current,
        percentage,
        message: `正在处理数据... ${percentage}%`,
      }));

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const csvContent = config.includeHeaders ? [headers, ...rows].join("\n") : rows.join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const filename = `${itemName}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);

    return { success: true, itemName, filename };
  };

  // 导出为 Excel
  const exportToExcel = async (
    data: RawDataRow[],
    columns: ColumnDefinition[],
    itemName: string
  ): Promise<ExportResult> => {
    const exportData: Record<string, unknown>[] = [];
    const batchSize = 100;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchData = batch.map((row) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col) => {
          obj[col.label] = row[col.key];
        });
        return obj;
      });
      exportData.push(...batchData);

      const current = Math.min(i + batchSize, data.length);
      const percentage = Math.round((current / data.length) * 50);
      setProgress((prev) => ({
        ...prev,
        current,
        percentage,
        message: `正在处理数据... ${percentage}%`,
      }));

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    const colWidths = columns.map((col) => ({
      wch: Math.max(col.label.length * 2, 12),
    }));
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "数据");

    const filename = `${itemName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    return { success: true, itemName, filename };
  };

  // 批量导出
  const handleBatchExport = async () => {
    if (selectedItems.size === 0) return;

    setIsExporting(true);
    setResults([]);
    const targetItems = Array.from(selectedItems);

    setProgress({
      status: "exporting",
      current: 0,
      total: targetItems.length,
      percentage: 0,
      message: "准备导出...",
    });

    const exportResults: ExportResult[] = [];

    for (let i = 0; i < targetItems.length; i++) {
      const itemId = targetItems[i];
      const item = EXPORTABLE_ITEMS.find((i) => i.id === itemId);

      setProgress((prev) => ({
        ...prev,
        current: i,
        message: `正在导出: ${item?.name || itemId}`,
      }));

      let result: ExportResult;
      if (item?.type === "chart") {
        result = await exportChart(itemId);
      } else {
        result = await exportData(itemId);
      }

      exportResults.push(result);
      setResults([...exportResults]);

      // 添加小延迟避免浏览器阻塞
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setProgress((prev) => ({
      ...prev,
      current: targetItems.length,
      percentage: 100,
      status: "completed",
      message: "导出完成",
    }));

    setIsExporting(false);
  };

  // 获取预览内容
  const renderPreview = () => {
    if (!previewItem) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-neutral-400">
          <Eye className="mb-4 h-16 w-16" />
          <p>选择一个项目查看预览</p>
        </div>
      );
    }

    const item = EXPORTABLE_ITEMS.find((i) => i.id === previewItem);
    if (!item) return null;

    if (item.type === "chart") {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {item.name}
          </h3>
          <p className="text-sm text-neutral-500">{item.description}</p>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
            {previewItem === "quadrant-chart" && <QuadrantPreview ref={quadrantChartRef} />}
            {previewItem === "trend-chart" && <TrendPreview ref={trendChartRef} />}
            {previewItem === "keywords-chart" && <KeywordsPreview ref={keywordsChartRef} />}
          </div>
        </div>
      );
    } else {
      const data = previewItem === "filtered-data" ? filteredData : rawData;
      const columns = AVAILABLE_COLUMNS.filter((col) => selectedColumns.has(col.key));

      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {item.name}
          </h3>
          <p className="text-sm text-neutral-500">
            {item.description} · 共 {data.length} 条数据
          </p>
          <div className="max-h-[500px] overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-neutral-50 dark:bg-neutral-700">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      className="px-3 py-2 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((row, index) => (
                  <tr
                    key={index}
                    className="border-t border-neutral-100 dark:border-neutral-700"
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className="px-3 py-2 text-neutral-900 dark:text-neutral-100"
                      >
                        {row[col.key] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 10 && (
              <div className="border-t border-neutral-200 bg-neutral-50 px-3 py-2 text-center text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">
                还有 {data.length - 10} 行数据...
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // 等待客户端加载
  if (!isClient) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-6 dark:bg-neutral-900">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-blue-600" />
          <h2 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            加载中...
          </h2>
          <p className="text-neutral-500">正在恢复数据...</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-6 dark:bg-neutral-900">
        <div className="text-center">
          <BarChart3 className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
          <h2 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            暂无数据
          </h2>
          <p className="mb-6 text-neutral-500">请先上传数据文件以使用导出功能</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            前往上传
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 左侧导航 */}
      <ModuleNav />

      {/* 右侧内容区 */}
      <div style={{ marginLeft: '240px' }} className="min-h-screen flex flex-col">
        {/* 顶部栏 */}
        <TopBar />

        {/* 主内容 - 两列布局 */}
        <main className="flex flex-1 overflow-hidden">
        {/* 左侧：导出项目列表 */}
        <div className="w-[360px] flex-shrink-0 overflow-auto border-r border-[#E8ECF1] bg-white p-5">
          <div className="space-y-6">
            {/* 统计概览 */}
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h3 className="mb-3 text-sm font-medium text-blue-900 dark:text-blue-200">
                数据概览
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-600 dark:text-blue-400">总声量</span>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    {(stats?.totalBuzz || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">关键词数</span>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    {stats?.keywordCount || 0}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">平均YOY</span>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    {stats?.avgYoy ? `${stats.avgYoy.toFixed(1)}%` : "0%"}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">关键词数</span>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    {stats?.keywordCount || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* 可导出项目 */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  可导出项目
                </h3>
                <button
                  onClick={toggleSelectAll}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {selectedItems.size === EXPORTABLE_ITEMS.length ? "取消全选" : "全选"}
                </button>
              </div>

              <div className="space-y-2">
                {EXPORTABLE_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedItems.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={clsx(
                        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                          : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                      )}
                    >
                      {isSelected ? (
                        <SquareCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                      ) : (
                        <Square className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-400" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-neutral-500" />
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {item.name}
                          </span>
                          {item.type === "chart" ? (
                            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              图表
                            </span>
                          ) : (
                            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              数据
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-neutral-500">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 导出设置 */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                <Settings className="h-4 w-4" />
                导出设置
              </h3>

              {/* 图表导出设置 */}
              <div className="mb-4 space-y-3">
                <div>
                  <label className="mb-2 block text-xs text-neutral-600 dark:text-neutral-400">
                    图片清晰度
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((scale) => (
                      <button
                        key={scale}
                        onClick={() => setConfig((prev) => ({ ...prev, chartScale: scale as 1 | 2 | 3 }))}
                        className={clsx(
                          "flex-1 rounded-lg border py-2 text-sm transition-colors",
                          config.chartScale === scale
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-300"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400"
                        )}
                      >
                        {scale}x
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs text-neutral-600 dark:text-neutral-400">
                    数据导出格式
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfig((prev) => ({ ...prev, dataFormat: "excel" }))}
                      className={clsx(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm transition-colors",
                        config.dataFormat === "excel"
                          ? "border-green-500 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-900/20 dark:text-green-300"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400"
                      )}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </button>
                    <button
                      onClick={() => setConfig((prev) => ({ ...prev, dataFormat: "csv" }))}
                      className={clsx(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm transition-colors",
                        config.dataFormat === "csv"
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-300"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400"
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* 数据列选择 */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs text-neutral-600 dark:text-neutral-400">
                    导出列 ({selectedColumns.size}/{AVAILABLE_COLUMNS.length})
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllColumns}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      全选
                    </button>
                    <button
                      onClick={clearColumnSelection}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      清空
                    </button>
                  </div>
                </div>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 p-2 dark:border-neutral-700">
                  {AVAILABLE_COLUMNS.map((col) => (
                    <button
                      key={String(col.key)}
                      onClick={() => toggleColumn(col.key)}
                      className={clsx(
                        "flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors",
                        selectedColumns.has(col.key)
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-700"
                      )}
                    >
                      {selectedColumns.has(col.key) ? (
                        <SquareCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Square className="h-3.5 w-3.5" />
                      )}
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 导出按钮 */}
            <button
              onClick={handleBatchExport}
              disabled={selectedItems.size === 0 || isExporting}
              className={clsx(
                "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors",
                selectedItems.size === 0 || isExporting
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  导出中... {progress.current}/{progress.total}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  批量导出 ({selectedItems.size})
                </>
              )}
            </button>

            {/* 导出进度 */}
            {isExporting && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-blue-800 dark:text-blue-200">{progress.message}</span>
                  <span className="text-blue-600 dark:text-blue-400">{progress.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-400"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* 导出结果 */}
            {results.length > 0 && !isExporting && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  导出结果
                </h4>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={clsx(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                        result.success
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      )}
                    >
                      {result.success ? (
                        <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 flex-shrink-0 text-red-600" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={clsx(
                            "truncate font-medium",
                            result.success
                              ? "text-green-800 dark:text-green-200"
                              : "text-red-800 dark:text-red-200"
                          )}
                        >
                          {result.itemName}
                        </p>
                        {result.success ? (
                          <p className="truncate text-xs text-green-600 dark:text-green-400">
                            {result.filename}
                          </p>
                        ) : (
                          <p className="truncate text-xs text-red-600 dark:text-red-400">
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：预览区域 */}
        <div className="flex-1 overflow-auto bg-[#F5F7FA] p-5">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                导出预览
              </h2>
              <div className="flex gap-2">
                {EXPORTABLE_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPreviewItem(item.id)}
                    className={clsx(
                      "rounded-lg px-3 py-1.5 text-sm transition-colors",
                      previewItem === item.id
                        ? "bg-blue-600 text-white"
                        : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-[500px] rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
              {renderPreview()}
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}

// 四象限图预览
function QuadrantPreview({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) {
  const { rawData, filters } = useDataStore();
  const chartData = useMemo(() => {
    if (rawData.length === 0) return [];
    return filterData(rawData, filters).slice(0, 50);
  }, [rawData, filters]);

  const quadrantColors: Record<string, string> = {
    第一象限: "#22c55e",
    第二象限: "#3b82f6",
    第三象限: "#f59e0b",
    第四象限: "#ef4444",
    未知: "#9ca3af",
  };

  return (
    <div ref={ref} className="rounded-lg bg-white p-4">
      <h3 className="mb-4 text-center text-lg font-semibold">四象限分析</h3>
      <div className="relative h-80">
        {/* 简化的象限预览 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-4">
            {["第一象限", "第二象限", "第四象限", "第三象限"].map((quadrant) => {
              const count = chartData.filter((d) => d.象限图 === quadrant).length;
              return (
                <div
                  key={quadrant}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed"
                  style={{ borderColor: quadrantColors[quadrant] || "#9ca3af" }}
                >
                  <span className="text-sm font-medium" style={{ color: quadrantColors[quadrant] }}>
                    {quadrant}
                  </span>
                  <span className="text-2xl font-bold text-neutral-700">{count}</span>
                  <span className="text-xs text-neutral-400">个关键词</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-4 text-sm text-neutral-500">
        <span>X轴: 声量 (TTL Buzz)</span>
        <span>Y轴: 同比增速 (YOY)</span>
      </div>
    </div>
  );
}

// 趋势图预览
function TrendPreview({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) {
  const { rawData } = useDataStore();
  const categories = useMemo(() => {
    const cats = new Set<string>();
    rawData.forEach((d) => cats.add(d.CATEGORY));
    return Array.from(cats).slice(0, 5);
  }, [rawData]);

  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div ref={ref} className="rounded-lg bg-white p-4">
      <h3 className="mb-4 text-center text-lg font-semibold">趋势分析</h3>
      <div className="h-80">
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-4">
            {categories.map((cat, index) => (
              <div key={cat} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="w-20 text-sm text-neutral-600">{cat}</span>
                <div className="flex-1">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: colors[index % colors.length],
                      width: `${60 + ((index * 7) % 40)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-400">
            <span>1月</span>
            <span>3月</span>
            <span>6月</span>
            <span>9月</span>
            <span>12月</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 关键词排行预览
function KeywordsPreview({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) {
  const { rawData, filters } = useDataStore();
  const topKeywords = useMemo(() => {
    const data = filterData(rawData, filters);
    return data
      .sort((a, b) => b.TTL_Buzz - a.TTL_Buzz)
      .slice(0, 10)
      .map((d) => ({
        keyword: d.KEYWORDS,
        buzz: d.TTL_Buzz,
        yoy: d.TTL_Buzz_YOY || 0,
      }));
  }, [rawData, filters]);

  const maxBuzz = Math.max(...topKeywords.map((k) => k.buzz), 1);

  return (
    <div ref={ref} className="rounded-lg bg-white p-4">
      <h3 className="mb-4 text-center text-lg font-semibold">Top 关键词排行</h3>
      <div className="space-y-2">
        {topKeywords.map((item, index) => (
          <div key={item.keyword} className="flex items-center gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
              {index + 1}
            </span>
            <span className="w-24 flex-shrink-0 truncate text-sm text-neutral-700">
              {item.keyword}
            </span>
            <div className="flex-1">
              <div
                className="h-4 rounded bg-blue-500"
                style={{ width: `${(item.buzz / maxBuzz) * 100}%` }}
              />
            </div>
            <span className="w-16 text-right text-xs text-neutral-500">
              {item.buzz.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

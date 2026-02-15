"use client";

import { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Download, Loader2, FileSpreadsheet, FileText, Check, X, Square, SquareCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { useDataStore } from '@/store/useDataStore';
import { filterData } from '@/lib/data-processor';
import { RawDataRow } from '@/types';

// 导出格式类型
export type ExportFormat = 'csv' | 'excel';

// 列定义
export interface ColumnDefinition {
  key: keyof RawDataRow;
  label: string;
  defaultSelected: boolean;
}

// 导出配置
export interface DataExportOptions {
  format: ExportFormat;
  filename?: string;
  selectedColumns: (keyof RawDataRow)[];
  includeHeaders: boolean;
}

// 导出结果
export interface DataExportResult {
  success: boolean;
  filename: string;
  rowCount: number;
  error?: string;
}

// 所有可用列定义
export const AVAILABLE_COLUMNS: ColumnDefinition[] = [
  { key: 'YEAR', label: '年份', defaultSelected: true },
  { key: 'MONTH', label: '月份', defaultSelected: true },
  { key: 'CATEGORY', label: '品类', defaultSelected: true },
  { key: 'KEYWORDS', label: '关键词', defaultSelected: true },
  { key: '小红书_Buzz', label: '小红书声量', defaultSelected: true },
  { key: '抖音_Buzz', label: '抖音声量', defaultSelected: true },
  { key: 'TTL_Buzz', label: '总声量', defaultSelected: true },
  { key: 'TTL_Buzz_YOY', label: '声量同比增速', defaultSelected: true },
  { key: 'TTL_Buzz_MOM', label: '声量环比增速', defaultSelected: false },
  { key: '小红书_SEARCH', label: '小红书搜索量', defaultSelected: true },
  { key: '小红书_SEARCH_vs_Dec', label: '小红书搜索vs12月', defaultSelected: false },
  { key: '抖音_SEARCH', label: '抖音搜索量', defaultSelected: true },
  { key: '抖音_SEARCH_vs_Dec', label: '抖音搜索vs12月', defaultSelected: false },
  { key: '象限图', label: '象限分类', defaultSelected: true },
];

// 导出按钮组件
interface ExportButtonProps {
  onClick: () => void;
  isExporting: boolean;
  disabled?: boolean;
  format: ExportFormat;
  children: React.ReactNode;
}

function ExportButton({
  onClick,
  isExporting,
  disabled = false,
  format,
  children,
}: ExportButtonProps) {
  const Icon = format === 'excel' ? FileSpreadsheet : FileText;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isExporting}
      className={clsx(
        'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        format === 'excel'
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white',
        (disabled || isExporting) && 'cursor-not-allowed opacity-60'
      )}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  );
}

// 列选择器组件
interface ColumnSelectorProps {
  selectedColumns: Set<keyof RawDataRow>;
  onToggleColumn: (key: keyof RawDataRow) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
}

function ColumnSelector({
  selectedColumns,
  onToggleColumn,
  onSelectAll,
  onSelectNone,
}: ColumnSelectorProps) {
  const allSelected = selectedColumns.size === AVAILABLE_COLUMNS.length;
  const noneSelected = selectedColumns.size === 0;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          选择导出列 ({selectedColumns.size}/{AVAILABLE_COLUMNS.length})
        </h4>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            disabled={allSelected}
            className="text-xs text-blue-600 hover:underline disabled:text-neutral-400 disabled:no-underline"
          >
            全选
          </button>
          <span className="text-neutral-300">|</span>
          <button
            onClick={onSelectNone}
            disabled={noneSelected}
            className="text-xs text-blue-600 hover:underline disabled:text-neutral-400 disabled:no-underline"
          >
            清空
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {AVAILABLE_COLUMNS.map((column) => (
          <button
            key={String(column.key)}
            onClick={() => onToggleColumn(column.key)}
            className={clsx(
              'flex items-center gap-2 rounded-md p-2 text-left text-sm transition-colors',
              selectedColumns.has(column.key)
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'
            )}
          >
            {selectedColumns.has(column.key) ? (
              <SquareCheck className="h-4 w-4 flex-shrink-0" />
            ) : (
              <Square className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            )}
            <span className="truncate">{column.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 文件名输入组件
interface FilenameInputProps {
  value: string;
  onChange: (value: string) => void;
  format: ExportFormat;
}

function FilenameInput({ value, onChange, format }: FilenameInputProps) {
  const extension = format === 'excel' ? '.xlsx' : '.csv';
  const displayValue = value.endsWith(extension) ? value.slice(0, -extension.length) : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[\\/:*?"<>|]/g, '');
    onChange(newValue + extension);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        文件名:
      </label>
      <div className="flex flex-1 items-center rounded-lg border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          className="flex-1 bg-transparent px-3 py-1.5 text-sm text-neutral-900 outline-none dark:text-neutral-100"
          placeholder="导出数据"
        />
        <span className="px-3 text-sm text-neutral-500">{extension}</span>
      </div>
    </div>
  );
}

// 数据预览组件
interface DataPreviewProps {
  data: RawDataRow[];
  selectedColumns: (keyof RawDataRow)[];
  maxRows?: number;
}

function DataPreview({ data, selectedColumns, maxRows = 5 }: DataPreviewProps) {
  const previewData = data.slice(0, maxRows);
  const columns = AVAILABLE_COLUMNS.filter((col) => selectedColumns.includes(col.key));

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">
        没有数据可导出
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      <div className="border-b border-neutral-200 px-4 py-2 dark:border-neutral-700">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          数据预览 ({Math.min(data.length, maxRows)} / {data.length} 行)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-700">
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
            {previewData.map((row, index) => (
              <tr
                key={index}
                className="border-t border-neutral-100 dark:border-neutral-700"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-3 py-2 text-neutral-900 dark:text-neutral-100"
                  >
                    {row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 导出进度类型
export interface ExportProgress {
  status: 'idle' | 'preparing' | 'exporting' | 'completed' | 'error';
  current: number;
  total: number;
  percentage: number;
  message: string;
}

// 主组件
export interface DataExporterProps {
  onExportComplete?: (result: DataExportResult) => void;
}

export default function DataExporter({ onExportComplete }: DataExporterProps) {
  const { rawData, filters } = useDataStore();

  // 计算筛选后的数据
  const filteredData = useMemo(() => {
    if (!rawData.length) return [];
    return filterData(rawData, filters);
  }, [rawData, filters]);

  // 状态
  const [selectedColumns, setSelectedColumns] = useState<Set<keyof RawDataRow>>(
    () => new Set(AVAILABLE_COLUMNS.filter((col) => col.defaultSelected).map((col) => col.key))
  );
  const [filename, setFilename] = useState<string>(`导出数据_${new Date().toISOString().slice(0, 10)}.xlsx`);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const [exportResult, setExportResult] = useState<DataExportResult | null>(null);
  const [progress, setProgress] = useState<ExportProgress>({
    status: 'idle',
    current: 0,
    total: 0,
    percentage: 0,
    message: '',
  });

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

  // 全选
  const selectAll = useCallback(() => {
    setSelectedColumns(new Set(AVAILABLE_COLUMNS.map((col) => col.key)));
  }, []);

  // 清空选择
  const selectNone = useCallback(() => {
    setSelectedColumns(new Set());
  }, []);

  // 导出为 CSV（带进度）
  const exportToCSV = useCallback(async (data: RawDataRow[], columns: ColumnDefinition[]): Promise<DataExportResult> => {
    try {
      setProgress({
        status: 'preparing',
        current: 0,
        total: data.length,
        percentage: 0,
        message: '正在准备数据...',
      });

      // 构建 CSV 内容
      const headers = columns.map((col) => col.label).join(',');
      const rows: string[] = [];
      const batchSize = 100; // 每批处理100行

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const batchRows = batch.map((row) =>
          columns
            .map((col) => {
              const value = row[col.key];
              // 处理包含逗号或引号的值
              const stringValue = value?.toString() ?? '';
              if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            })
            .join(',')
        );
        rows.push(...batchRows);

        // 更新进度
        const current = Math.min(i + batchSize, data.length);
        const percentage = Math.round((current / data.length) * 100);
        setProgress({
          status: 'exporting',
          current,
          total: data.length,
          percentage,
          message: `正在处理数据... ${percentage}%`,
        });

        // 让出时间片，避免阻塞UI
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const csvContent = [headers, ...rows].join('\n');

      setProgress({
        status: 'exporting',
        current: data.length,
        total: data.length,
        percentage: 100,
        message: '正在生成文件...',
      });

      // 创建 Blob 并下载
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      return {
        success: true,
        filename: link.download,
        rowCount: data.length,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        rowCount: 0,
        error: error instanceof Error ? error.message : '导出失败',
      };
    }
  }, [filename]);

  // 导出为 Excel（带进度）
  const exportToExcel = useCallback(async (data: RawDataRow[], columns: ColumnDefinition[]): Promise<DataExportResult> => {
    try {
      setProgress({
        status: 'preparing',
        current: 0,
        total: data.length,
        percentage: 0,
        message: '正在准备数据...',
      });

      // 分批处理数据，显示进度
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

        // 更新进度
        const current = Math.min(i + batchSize, data.length);
        const percentage = Math.round((current / data.length) * 50); // 前50%用于数据准备
        setProgress({
          status: 'exporting',
          current,
          total: data.length,
          percentage,
          message: `正在处理数据... ${percentage}%`,
        });

        // 让出时间片
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      setProgress({
        status: 'exporting',
        current: data.length,
        total: data.length,
        percentage: 75,
        message: '正在生成 Excel 文件...',
      });

      // 创建工作簿
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // 设置列宽
      const colWidths = columns.map((col) => ({
        wch: Math.max(col.label.length * 2, 12),
      }));
      ws['!cols'] = colWidths;

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '数据');

      setProgress({
        status: 'exporting',
        current: data.length,
        total: data.length,
        percentage: 90,
        message: '正在下载文件...',
      });

      // 下载文件
      const actualFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
      XLSX.writeFile(wb, actualFilename);

      setProgress({
        status: 'exporting',
        current: data.length,
        total: data.length,
        percentage: 100,
        message: '导出完成',
      });

      return {
        success: true,
        filename: actualFilename,
        rowCount: data.length,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        rowCount: 0,
        error: error instanceof Error ? error.message : '导出失败',
      };
    }
  }, [filename]);

  // 执行导出
  const handleExport = useCallback(async () => {
    if (selectedColumns.size === 0) {
      setExportResult({
        success: false,
        filename: '',
        rowCount: 0,
        error: '请至少选择一列',
      });
      return;
    }

    if (filteredData.length === 0) {
      setExportResult({
        success: false,
        filename: '',
        rowCount: 0,
        error: '没有数据可导出',
      });
      return;
    }

    setIsExporting(true);
    setExportResult(null);

    const columns = AVAILABLE_COLUMNS.filter((col) => selectedColumns.has(col.key));

    let result: DataExportResult;
    if (exportFormat === 'csv') {
      result = await exportToCSV(filteredData, columns);
    } else {
      result = await exportToExcel(filteredData, columns);
    }

    setExportResult(result);
    setProgress((prev) => ({
      ...prev,
      status: result.success ? 'completed' : 'error',
    }));
    setIsExporting(false);
    onExportComplete?.(result);
  }, [selectedColumns, filteredData, exportFormat, exportToCSV, exportToExcel, onExportComplete]);

  // 是否有数据
  const hasData = rawData.length > 0;
  const hasFilteredData = filteredData.length > 0;

  // 是否正在导出中
  const isExportingActive = isExporting || progress.status === 'exporting' || progress.status === 'preparing';

  if (!hasData) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center gap-2 text-neutral-500">
          <FileSpreadsheet className="h-5 w-5" />
          <span>请先导入数据后再进行导出</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          数据导出
        </h3>
        <div className="text-sm text-neutral-500">
          共 {filteredData.length} 条数据
          {filteredData.length !== rawData.length && (
            <span className="text-neutral-400"> (筛选自 {rawData.length} 条)</span>
          )}
        </div>
      </div>

      {/* 格式选择 */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          导出格式:
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setExportFormat('excel')}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              exportFormat === 'excel'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300'
            )}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel (.xlsx)
          </button>
          <button
            onClick={() => setExportFormat('csv')}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              exportFormat === 'csv'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300'
            )}
          >
            <FileText className="h-4 w-4" />
            CSV (.csv)
          </button>
        </div>
      </div>

      {/* 文件名输入 */}
      <FilenameInput
        value={filename}
        onChange={setFilename}
        format={exportFormat}
      />

      {/* 列选择器 */}
      <ColumnSelector
        selectedColumns={selectedColumns}
        onToggleColumn={toggleColumn}
        onSelectAll={selectAll}
        onSelectNone={selectNone}
      />

      {/* 数据预览 */}
      <DataPreview
        data={filteredData}
        selectedColumns={Array.from(selectedColumns)}
      />

      {/* 导出按钮 */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-neutral-500">
          {selectedColumns.size === 0 && (
            <span className="text-red-500">请至少选择一列</span>
          )}
        </div>
        <ExportButton
          onClick={handleExport}
          isExporting={isExportingActive}
          disabled={selectedColumns.size === 0 || !hasFilteredData}
          format={exportFormat}
        >
          {isExportingActive ? '导出中...' : `导出${exportFormat === 'excel' ? 'Excel' : 'CSV'}`}
        </ExportButton>
      </div>

      {/* 导出进度条 */}
      {isExportingActive && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {progress.message}
            </span>
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {progress.percentage}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-400"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            已处理 {progress.current} / {progress.total} 行
          </div>
        </div>
      )}

      {/* 导出结果 */}
      {exportResult && !isExportingActive && (
        <div
          className={clsx(
            'rounded-lg border p-3',
            exportResult.success
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          )}
        >
          <div className="flex items-start gap-2">
            {exportResult.success ? (
              <Check className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            ) : (
              <X className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            )}
            <div className="flex-1">
              <p
                className={clsx(
                  'text-sm font-medium',
                  exportResult.success
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                )}
              >
                {exportResult.success ? '导出成功' : '导出失败'}
              </p>
              {exportResult.success ? (
                <p className="text-xs text-green-600 dark:text-green-400">
                  {exportResult.filename} ({exportResult.rowCount} 行)
                </p>
              ) : (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {exportResult.error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { DataExporter };

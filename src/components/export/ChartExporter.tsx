"use client";

import { useState, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2, Check, X, Image, FileImage, Square, SquareCheck } from 'lucide-react';
import { clsx } from 'clsx';

// 导出配置类型
export interface ExportOptions {
  scale: 1 | 2; // 图片缩放倍数
  format: 'png';
  quality?: number;
}

// 图表项类型
export interface ChartItem {
  id: string;
  name: string;
  ref: React.RefObject<HTMLDivElement | null>;
}

// ChartExporter 组件属性
interface ChartExporterProps {
  charts: ChartItem[];
  onExportComplete?: (exportedCount: number) => void;
}

// 导出进度信息
export interface ExportProgress {
  total: number;
  current: number;
  chartName: string;
  status: 'idle' | 'exporting' | 'completed' | 'error';
  error?: string;
}

// 导出结果
export interface ExportResult {
  success: boolean;
  chartId: string;
  chartName: string;
  error?: string;
}

// 组件 Ref 暴露的方法
export interface ChartExporterRef {
  exportChart: (chartId: string, options?: Partial<ExportOptions>) => Promise<ExportResult>;
  exportSelectedCharts: (chartIds: string[], options?: Partial<ExportOptions>) => Promise<ExportResult[]>;
  getProgress: () => ExportProgress;
}

// 默认导出配置
const defaultOptions: ExportOptions = {
  scale: 2,
  format: 'png',
  quality: 1,
};

// 导出按钮组件
interface ExportButtonProps {
  onClick: () => void;
  isExporting: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

function ExportButton({
  onClick,
  isExporting,
  disabled = false,
  size = 'md',
  variant = 'primary',
  children,
}: ExportButtonProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-200',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isExporting}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors',
        sizeClasses[size],
        variantClasses[variant],
        (disabled || isExporting) && 'cursor-not-allowed opacity-60'
      )}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {children}
    </button>
  );
}

// 尺寸选择器组件
interface ScaleSelectorProps {
  value: 1 | 2;
  onChange: (value: 1 | 2) => void;
}

function ScaleSelector({ value, onChange }: ScaleSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1 dark:border-neutral-700">
      <button
        onClick={() => onChange(1)}
        className={clsx(
          'rounded px-2 py-1 text-xs font-medium transition-colors',
          value === 1
            ? 'bg-blue-600 text-white'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
        )}
      >
        1x
      </button>
      <button
        onClick={() => onChange(2)}
        className={clsx(
          'rounded px-2 py-1 text-xs font-medium transition-colors',
          value === 2
            ? 'bg-blue-600 text-white'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
        )}
      >
        2x
      </button>
    </div>
  );
}

// 进度条组件
interface ProgressBarProps {
  progress: ExportProgress;
}

function ProgressBar({ progress }: ProgressBarProps) {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="mt-2 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-neutral-600 dark:text-neutral-400">
          {progress.status === 'exporting' && `正在导出: ${progress.chartName}`}
          {progress.status === 'completed' && '导出完成'}
          {progress.status === 'error' && '导出失败'}
          {progress.status === 'idle' && '准备就绪'}
        </span>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {progress.current}/{progress.total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className={clsx(
            'h-full transition-all duration-300',
            progress.status === 'error' ? 'bg-red-500' : 'bg-blue-600'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {progress.error && (
        <p className="mt-2 text-xs text-red-500">{progress.error}</p>
      )}
    </div>
  );
}

// 主导出组件
const ChartExporter = forwardRef<ChartExporterRef, ChartExporterProps>(
  function ChartExporter({ charts, onExportComplete }, ref) {
    const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set());
    const [scale, setScale] = useState<1 | 2>(2);
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState<ExportProgress>({
      total: 0,
      current: 0,
      chartName: '',
      status: 'idle',
    });

    // 切换图表选中状态
    const toggleChartSelection = useCallback((chartId: string) => {
      setSelectedCharts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(chartId)) {
          newSet.delete(chartId);
        } else {
          newSet.add(chartId);
        }
        return newSet;
      });
    }, []);

    // 全选/取消全选
    const toggleSelectAll = useCallback(() => {
      if (selectedCharts.size === charts.length) {
        setSelectedCharts(new Set());
      } else {
        setSelectedCharts(new Set(charts.map((c) => c.id)));
      }
    }, [charts, selectedCharts.size]);

    // 导出单个图表
    const exportChart = useCallback(
      async (chartId: string, options?: Partial<ExportOptions>): Promise<ExportResult> => {
        const chart = charts.find((c) => c.id === chartId);
        if (!chart) {
          return { success: false, chartId, chartName: '', error: '图表不存在' };
        }

        const chartRef = chart.ref;
        if (!chartRef || !chartRef.current) {
          return { success: false, chartId, chartName: chart.name, error: '图表引用无效' };
        }

        const exportOptions = { ...defaultOptions, ...options };

        try {
          setProgress({
            total: 1,
            current: 1,
            chartName: chart.name,
            status: 'exporting',
          });

          const canvas = await html2canvas(chartRef.current, {
            scale: exportOptions.scale,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true,
          });

          // 转换为 blob 并下载
          const dataUrl = canvas.toDataURL(`image/${exportOptions.format}`, exportOptions.quality);
          const link = document.createElement('a');
          link.download = `${chart.name}_${new Date().toISOString().slice(0, 10)}.${exportOptions.format}`;
          link.href = dataUrl;
          link.click();

          setProgress({
            total: 1,
            current: 1,
            chartName: chart.name,
            status: 'completed',
          });

          return { success: true, chartId, chartName: chart.name };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '导出失败';
          setProgress({
            total: 1,
            current: 1,
            chartName: chart.name,
            status: 'error',
            error: errorMessage,
          });
          return { success: false, chartId, chartName: chart.name, error: errorMessage };
        }
      },
      [charts]
    );

    // 批量导出选中的图表
    const exportSelectedCharts = useCallback(
      async (chartIds?: string[], options?: Partial<ExportOptions>): Promise<ExportResult[]> => {
        const targetIds = chartIds || Array.from(selectedCharts);
        if (targetIds.length === 0) {
          return [];
        }

        setIsExporting(true);
        const results: ExportResult[] = [];

        setProgress({
          total: targetIds.length,
          current: 0,
          chartName: '',
          status: 'exporting',
        });

        for (let i = 0; i < targetIds.length; i++) {
          const chartId = targetIds[i];
          const chart = charts.find((c) => c.id === chartId);
          if (chart) {
            setProgress((prev) => ({
              ...prev,
              current: i,
              chartName: chart.name,
            }));
          }

          const result = await exportChart(chartId, options);
          results.push(result);

          // 添加小延迟以确保 UI 更新
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        setProgress((prev) => ({
          ...prev,
          current: targetIds.length,
          status: 'completed',
        }));

        setIsExporting(false);
        onExportComplete?.(results.filter((r) => r.success).length);

        return results;
      },
      [charts, selectedCharts, exportChart, onExportComplete]
    );

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      exportChart,
      exportSelectedCharts: (chartIds?: string[], options?: Partial<ExportOptions>) =>
        exportSelectedCharts(chartIds, options),
      getProgress: () => progress,
    }), [exportChart, exportSelectedCharts, progress]);

    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            图表导出
          </h3>
          <ScaleSelector value={scale} onChange={setScale} />
        </div>

        {/* 图表列表 */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              可导出图表 ({charts.length})
            </span>
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              {selectedCharts.size === charts.length ? (
                <>
                  <SquareCheck className="h-4 w-4" />
                  取消全选
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  全选
                </>
              )}
            </button>
          </div>

          <div className="max-h-60 space-y-1 overflow-y-auto">
            {charts.map((chart) => (
              <button
                key={chart.id}
                onClick={() => toggleChartSelection(chart.id)}
                className={clsx(
                  'flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors',
                  selectedCharts.has(chart.id)
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'
                )}
              >
                {selectedCharts.has(chart.id) ? (
                  <SquareCheck className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Square className="h-4 w-4 flex-shrink-0" />
                )}
                <Image className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-sm">{chart.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 导出按钮 */}
        <div className="flex gap-2">
          <ExportButton
            onClick={() => exportSelectedCharts()}
            isExporting={isExporting}
            disabled={selectedCharts.size === 0}
          >
            <FileImage className="h-4 w-4" />
            导出选中 ({selectedCharts.size})
          </ExportButton>
        </div>

        {/* 导出进度 */}
        {(progress.status === 'exporting' || progress.status === 'completed' || progress.status === 'error') && (
          <ProgressBar progress={progress} />
        )}
      </div>
    );
  }
);

export default ChartExporter;
export { ChartExporter };

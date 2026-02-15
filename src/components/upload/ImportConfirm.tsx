'use client';

import { CheckCircle, FileSpreadsheet, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SheetInfo } from '@/types';

interface ImportConfirmProps {
  sheetCount: number;
  sheetNames: string[];
  sheetInfos: SheetInfo[];
  onConfirm: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ImportConfirm({
  sheetCount,
  sheetNames,
  sheetInfos,
  onConfirm,
  onBack,
  isLoading = false,
}: ImportConfirmProps) {
  // 计算预估导入总行数
  const totalRows = sheetInfos
    .filter((info) => sheetNames.includes(info.name))
    .reduce((sum, info) => sum + (info.rowCount || 0), 0);

  return (
    <div className="flex flex-col items-center py-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
        确认导入
      </h2>

      <p className="mb-6 text-center text-neutral-600 dark:text-neutral-400">
        您即将导入以下数据到系统中
      </p>

      {/* 导入摘要 */}
      <div className="mb-8 w-full max-w-md rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-neutral-900 dark:text-neutral-50">
            {sheetCount} 个 Sheet
          </span>
        </div>

        {/* 预估导入行数 */}
        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            预估导入数据行数:
          </span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {totalRows.toLocaleString()} 行
          </span>
        </div>

        <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            导入的Sheet:
          </p>
          <ul className="mt-1 list-inside list-disc">
            {sheetNames.map((name) => {
              const info = sheetInfos.find((s) => s.name === name);
              return (
                <li key={name}>
                  {name}
                  {info?.rowCount && (
                    <span className="ml-2 text-neutral-400">
                      ({info.rowCount.toLocaleString()} 行)
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回修改
        </Button>

        <Button
          onClick={onConfirm}
          disabled={isLoading}
          size="lg"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              导入中...
            </>
          ) : (
            <>
              确认导入
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        导入过程中可能会占用一些时间，请耐心等待
      </p>
    </div>
  );
}

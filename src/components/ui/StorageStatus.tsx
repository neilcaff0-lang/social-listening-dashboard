'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { Database, Trash2, CheckCircle } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { cn } from './Button';

interface StorageStatusProps {
  className?: string;
}

// 简单的 mounted 检测 hook，避免在 useEffect 中 setState
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function getStorageInfo() {
  try {
    const storage = localStorage.getItem('sns-dashboard-storage');
    if (storage) {
      const sizeInBytes = new Blob([storage]).size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      return {
        size: `${sizeInKB} KB`,
        lastUpdated: new Date().toLocaleString('zh-CN'),
      };
    }
    return { size: '0 KB', lastUpdated: null };
  } catch {
    return { size: '未知', lastUpdated: null };
  }
}

export function StorageStatus({ className }: StorageStatusProps) {
  const { rawData, categories, clearAllData } = useDataStore();
  const mounted = useMounted();

  const hasData = rawData.length > 0 || categories.length > 0;

  // 使用 useMemo 计算存储信息
  const storageInfo = useMemo(() => getStorageInfo(), [rawData.length, categories.length]);

  const handleClearStorage = () => {
    if (confirm('确定要清除所有本地存储的数据吗？此操作不可恢复。')) {
      clearAllData();
      localStorage.removeItem('sns-dashboard-storage');
    }
  };

  // 服务端渲染时不显示
  if (!mounted) {
    return (
      <div className={cn(
        'rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <Database className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-50">数据存储状态</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        hasData
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
          : 'border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            hasData
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-neutral-100 dark:bg-neutral-800'
          )}
        >
          {hasData ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <Database className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-50">
            数据存储状态
          </h3>

          {hasData ? (
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">存储大小:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {storageInfo.size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">数据行数:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {rawData.length.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">品类数量:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {categories.length}
                </span>
              </div>
              {storageInfo.lastUpdated && (
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">最后更新:</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {storageInfo.lastUpdated}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              暂无本地存储的数据
            </p>
          )}

          {hasData && (
            <button
              onClick={handleClearStorage}
              className="mt-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              清除数据
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 简化的存储状态指示器
export function StorageIndicator({ className }: StorageStatusProps) {
  const { rawData } = useDataStore();
  const hasData = rawData.length > 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium',
        hasData
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
        className
      )}
      title={hasData ? `已存储 ${rawData.length.toLocaleString()} 条数据` : '无本地数据'}
    >
      <Database className="h-3.5 w-3.5" />
      <span>{hasData ? '已存储' : '无数据'}</span>
    </div>
  );
}

'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { Database, Trash2, CheckCircle } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { cn } from '@/lib/utils';

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
        'rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5',
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2E8F0]">
            <Database className="h-5 w-5 text-[#A0AEC0]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#0F1419]">数据存储状态</h3>
            <p className="mt-1 text-sm text-[#A0AEC0]">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border p-5',
        hasData
          ? 'border-[#10B981]/30 bg-[#10B981]/5'
          : 'border-[#E2E8F0] bg-[#F8FAFC]',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            hasData
              ? 'bg-[#10B981]/10'
              : 'bg-[#E2E8F0]'
          )}
        >
          {hasData ? (
            <CheckCircle className="h-5 w-5 text-[#10B981]" />
          ) : (
            <Database className="h-5 w-5 text-[#A0AEC0]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#0F1419]">
            数据存储状态
          </h3>

          {hasData ? (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#718096]">存储大小:</span>
                <span className="font-medium text-[#0F1419]">
                  {storageInfo.size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718096]">数据行数:</span>
                <span className="font-medium text-[#0F1419]">
                  {rawData.length.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718096]">品类数量:</span>
                <span className="font-medium text-[#0F1419]">
                  {categories.length}
                </span>
              </div>
              {storageInfo.lastUpdated && (
                <div className="flex justify-between">
                  <span className="text-[#718096]">最后更新:</span>
                  <span className="font-medium text-[#0F1419]">
                    {storageInfo.lastUpdated}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-[#A0AEC0]">
              暂无本地存储的数据
            </p>
          )}

          {hasData && (
            <button
              onClick={handleClearStorage}
              className="mt-4 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/10"
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
        'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
        hasData
          ? 'bg-[#10B981]/10 text-[#10B981]'
          : 'bg-[#F1F5F9] text-[#A0AEC0]',
        className
      )}
      title={hasData ? `已存储 ${rawData.length.toLocaleString()} 条数据` : '无本地数据'}
    >
      <Database className="h-3.5 w-3.5" />
      <span>{hasData ? '已存储' : '无数据'}</span>
    </div>
  );
}

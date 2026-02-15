'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error('仪表盘错误:', error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-800 dark:bg-neutral-900">
        {/* 错误图标 */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* 标题 */}
        <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-neutral-50">
          仪表盘加载失败
        </h2>

        {/* 描述 */}
        <p className="mb-6 text-neutral-600 dark:text-neutral-400">
          加载仪表盘数据时出现问题，可能是数据格式不正确或数据已损坏。
        </p>

        {/* 错误详情（开发环境） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-left dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">
              {error.message}
            </p>
          </div>
        )}

        {/* 建议操作 */}
        <div className="mb-6 rounded-lg bg-neutral-50 p-4 text-left dark:bg-neutral-800">
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            建议操作：
          </p>
          <ul className="list-inside list-disc text-sm text-neutral-600 dark:text-neutral-400">
            <li>清除浏览器缓存后刷新页面</li>
            <li>重新上传数据文件</li>
            <li>检查数据文件格式是否正确</li>
          </ul>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

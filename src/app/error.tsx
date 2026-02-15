'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到控制台
    console.error('应用错误:', error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="mx-auto max-w-md text-center">
        {/* 错误图标 */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* 错误标题 */}
        <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          出错了
        </h1>

        {/* 错误描述 */}
        <p className="mb-6 text-neutral-600 dark:text-neutral-400">
          应用遇到了一个错误，请尝试刷新页面或返回首页
        </p>

        {/* 错误详情（开发环境显示） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-800 dark:bg-red-900/20">
            <p className="mb-2 text-sm font-medium text-red-800 dark:text-red-300">
              错误信息:
            </p>
            <pre className="overflow-auto text-xs text-red-700 dark:text-red-400">
              {error.message}
            </pre>
            {error.digest && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-500">
                错误 ID: {error.digest}
              </p>
            )}
          </div>
        )}

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

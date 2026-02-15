'use client';

import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="mx-auto max-w-md text-center">
        {/* 404 图标 */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <FileQuestion className="h-10 w-10 text-neutral-600 dark:text-neutral-400" />
          </div>
        </div>

        {/* 404 标题 */}
        <h1 className="mb-2 text-6xl font-bold text-neutral-900 dark:text-neutral-50">
          404
        </h1>

        {/* 副标题 */}
        <h2 className="mb-4 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          页面未找到
        </h2>

        {/* 描述 */}
        <p className="mb-8 text-neutral-600 dark:text-neutral-400">
          抱歉，您访问的页面不存在或已被移除。
          <br />
          请检查网址是否正确，或返回首页。
        </p>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={() => window.history.back()}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回上一页
            </Button>
          </button>
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>

        {/* 帮助链接 */}
        <div className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
          <p>
            需要帮助？请尝试以下链接：
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              首页
            </Link>
            <Link
              href="/upload"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              上传数据
            </Link>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              仪表盘
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

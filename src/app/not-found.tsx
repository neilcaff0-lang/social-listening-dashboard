'use client';

import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FA] px-4">
      <div className="mx-auto max-w-md text-center">
        {/* 404 图标 */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5F7FA] to-[#EEF1F5]">
            <FileQuestion className="h-10 w-10 text-[#9AA0AB]" />
          </div>
        </div>

        {/* 404 标题 */}
        <h1 className="mb-2 text-6xl font-bold text-[#1A1D23]">
          404
        </h1>

        {/* 副标题 */}
        <h2 className="mb-4 text-xl font-semibold text-[#5A6170]">
          页面未找到
        </h2>

        {/* 描述 */}
        <p className="mb-8 text-[#9AA0AB]">
          抱歉，您访问的页面不存在或已被移除。
          <br />
          请检查网址是否正确，或返回首页。
        </p>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8ECF1] bg-white px-5 py-2.5 text-sm font-medium text-[#5A6170] hover:bg-[#F5F7FA] hover:text-[#1A1D23] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回上一页
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#a29bfe] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/30 hover:shadow-xl transition-all"
          >
            <Home className="h-4 w-4" />
            返回首页
          </Link>
        </div>

        {/* 帮助链接 */}
        <div className="mt-8 text-sm text-[#9AA0AB]">
          <p>需要帮助？请尝试以下链接：</p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="text-[#6C5CE7] hover:text-[#5B4BD5] transition-colors"
            >
              首页
            </Link>
            <Link
              href="/upload"
              className="text-[#6C5CE7] hover:text-[#5B4BD5] transition-colors"
            >
              上传数据
            </Link>
            <Link
              href="/dashboard"
              className="text-[#6C5CE7] hover:text-[#5B4BD5] transition-colors"
            >
              仪表盘
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { PPTPage } from "@/types/analysis";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageManagerProps {
  pages: PPTPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onSavePage: (pageIndex: number) => void;
  onClearPage: (pageIndex: number) => void;
  onCopyPage?: (pageIndex: number) => void;
  hasUnsavedChanges?: boolean;
}

export default function PageManager({
  pages,
  currentPage,
  onPageChange,
  onSavePage,
  onClearPage,
  onCopyPage,
  hasUnsavedChanges = false,
}: PageManagerProps) {
  const [savedPages, setSavedPages] = useState<Set<number>>(new Set());
  const [copiedPage, setCopiedPage] = useState<number | null>(null);

  const handleSave = (index: number) => {
    onSavePage(index);
    setSavedPages((prev) => new Set([...prev, index]));
    setTimeout(() => {
      setSavedPages((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 1500);
  };

  const handleCopy = (index: number) => {
    onCopyPage?.(index);
    setCopiedPage(index);
    setTimeout(() => setCopiedPage(null), 1500);
  };

  const getPageStatus = (page: PPTPage) => {
    if (page.keywords.length > 0) {
      return "filled";
    }
    if (page.title) {
      return "partial";
    }
    return "empty";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          页面管理
        </h3>
        <span className="text-xs text-neutral-500">
          {currentPage + 1} / {pages.length}
        </span>
      </div>

      {/* 页面指示器 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 flex items-center gap-1.5 justify-center">
          {pages.map((page, index) => {
            const status = getPageStatus(page);
            const isActive = currentPage === index;
            const isSaved = savedPages.has(index);

            return (
              <button
                key={page.id}
                onClick={() => onPageChange(index)}
                className={cn(
                  "relative w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : status === "filled"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : status === "partial"
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200",
                  isSaved && "ring-2 ring-green-400"
                )}
              >
                {isSaved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
                {isActive && hasUnsavedChanges && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
          className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 页面操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleSave(currentPage)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
            savedPages.has(currentPage)
              ? "bg-green-100 text-green-700"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          )}
        >
          {savedPages.has(currentPage) ? (
            <>
              <Check className="h-3.5 w-3.5" />
              已保存
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              保存页面
            </>
          )}
        </button>

        <button
          onClick={() => handleCopy(currentPage)}
          className={cn(
            "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
            copiedPage === currentPage
              ? "bg-green-100 text-green-700"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          {copiedPage === currentPage ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          onClick={() => onClearPage(currentPage)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 当前页面信息 */}
      <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
        <div className="text-xs text-neutral-500 space-y-1">
          <div className="flex justify-between">
            <span>页面标题:</span>
            <span className="font-medium text-neutral-700">
              {pages[currentPage]?.title || "未命名"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>品类:</span>
            <span className="font-medium text-neutral-700">
              {pages[currentPage]?.category || "未选择"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>关键词:</span>
            <span className="font-medium text-neutral-700">
              {pages[currentPage]?.keywords.length || 0} / 4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

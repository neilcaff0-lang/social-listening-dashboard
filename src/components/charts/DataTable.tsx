"use client";

import { useState, useMemo, useEffect, forwardRef, useRef, useImperativeHandle } from "react";
import { useDataStore } from "@/store/useDataStore";
import { filterData, normalizePercentValue } from "@/lib/data-processor";
import { RawDataRow } from "@/types";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

type SortField = "KEYWORDS" | "CATEGORY" | "TTL_Buzz" | "TTL_Buzz_YOY" | "TTL_Buzz_MOM" | "SEARCH" | "象限图";
type SortDirection = "asc" | "desc";

interface DataTableProps {
  className?: string;
}

const DataTable = forwardRef<HTMLDivElement, DataTableProps>(function DataTable({ className }, ref) {
  const tableRef = useRef<HTMLDivElement>(null);

  // 暴露 ref 给父组件
  useImperativeHandle(ref, () => tableRef.current as HTMLDivElement);
  const { rawData, filters } = useDataStore();

  // 获取筛选后的数据（显示所有行，不按关键词聚合）
  const filteredData = useMemo(() => {
    const data = filterData(rawData, filters);
    // 为每行添加总搜索量字段
    return data.map((row) => ({
      ...row,
      SEARCH: (row.小红书_SEARCH || 0) + (row.抖音_SEARCH || 0),
    }));
  }, [rawData, filters]);

  // 状态管理
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("TTL_Buzz");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 搜索过滤
  const searchedData = useMemo(() => {
    if (!searchTerm.trim()) return filteredData;
    const term = searchTerm.toLowerCase().trim();
    return filteredData.filter((row) =>
      row.KEYWORDS?.toLowerCase().includes(term) ||
      row.CATEGORY?.toLowerCase().includes(term) ||
      row.象限图?.toLowerCase().includes(term)
    );
  }, [filteredData, searchTerm]);

  // 排序
  const sortedData = useMemo(() => {
    return [...searchedData].sort((a, b) => {
      let aVal: string | number = 0;
      let bVal: string | number = 0;

      switch (sortField) {
        case "KEYWORDS":
          aVal = a.KEYWORDS || "";
          bVal = b.KEYWORDS || "";
          break;
        case "CATEGORY":
          aVal = a.CATEGORY || "";
          bVal = b.CATEGORY || "";
          break;
        case "TTL_Buzz":
          aVal = a.TTL_Buzz || 0;
          bVal = b.TTL_Buzz || 0;
          break;
        case "TTL_Buzz_YOY":
          aVal = normalizePercentValue(a.TTL_Buzz_YOY);
          bVal = normalizePercentValue(b.TTL_Buzz_YOY);
          break;
        case "TTL_Buzz_MOM":
          aVal = normalizePercentValue(a.TTL_Buzz_MOM);
          bVal = normalizePercentValue(b.TTL_Buzz_MOM);
          break;
        case "SEARCH":
          aVal = a.SEARCH || 0;
          bVal = b.SEARCH || 0;
          break;
        case "象限图":
          aVal = a.象限图 || "";
          bVal = b.象限图 || "";
          break;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [searchedData, sortField, sortDirection]);

  // 分页
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // 当数据变化时重置页码 - 使用 requestAnimationFrame 避免同步 setState
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setCurrentPage(1);
    });
    return () => cancelAnimationFrame(timer);
  }, [searchTerm, pageSize, sortField, sortDirection]);

  // 处理排序点击
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // 格式化数字
  const formatNumber = (value: number | undefined) => {
    if (value === undefined || value === null) return "-";
    return value.toLocaleString();
  };

  // 格式化百分比
  // 直接使用Excel原始值，不做任何修改
  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === null) return "-";
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  // 获取排序图标
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-neutral-400" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    );
  };

  // 表格列定义
  const columns: { key: SortField; label: string; align: "left" | "right" }[] = [
    { key: "KEYWORDS", label: "关键词", align: "left" },
    { key: "CATEGORY", label: "品类", align: "left" },
    { key: "TTL_Buzz", label: "声量", align: "right" },
    { key: "TTL_Buzz_YOY", label: "YOY", align: "right" },
    { key: "TTL_Buzz_MOM", label: "MOM", align: "right" },
    { key: "SEARCH", label: "搜索量", align: "right" },
    { key: "象限图", label: "象限", align: "left" },
  ];

  return (
    <div ref={tableRef} className={`rounded-lg bg-white shadow-sm dark:bg-neutral-800 ${className || ''}`}>
      <div className="flex flex-col gap-4 border-b border-neutral-200 p-4 dark:border-neutral-700 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          数据明细
        </h2>

        {/* 搜索框 */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索关键词、品类、象限..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-50 dark:placeholder-neutral-400"
          />
        </div>
      </div>

      {/* 表格容器 - 响应式横向滚动 */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 bg-neutral-50 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`cursor-pointer whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  <span className={`flex items-center gap-1 ${col.align === "right" ? "justify-end" : "justify-start"}`}>
                    {col.label}
                    {getSortIcon(col.key)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr
                  key={`${row.KEYWORDS}-${row.YEAR}-${row.MONTH}`}
                  className={`transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50 ${
                    index % 2 === 0 ? "bg-white dark:bg-neutral-800" : "bg-neutral-50/50 dark:bg-neutral-800/50"
                  }`}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-50">
                    {row.KEYWORDS || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {row.CATEGORY || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-neutral-900 dark:text-neutral-50">
                    {formatNumber(row.TTL_Buzz)}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right text-sm ${normalizePercentValue(row.TTL_Buzz_YOY) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(normalizePercentValue(row.TTL_Buzz_YOY))}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right text-sm ${normalizePercentValue(row.TTL_Buzz_MOM) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(normalizePercentValue(row.TTL_Buzz_MOM))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-neutral-900 dark:text-neutral-50">
                    {formatNumber(row.SEARCH)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {row.象限图 ? (
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.象限图 === "明星象限" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                        row.象限图 === "潜力象限" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                        row.象限图 === "衰退象限" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                        row.象限图 === "谨慎观察" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300"
                      }`}>
                        {row.象限图}
                      </span>
                    ) : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-200 p-4 dark:border-neutral-700 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <span>每页</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-50"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>条</span>
          <span className="ml-4">
            共 {sortedData.length} 条
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded p-2 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            第 {currentPage} / {totalPages || 1} 页
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="rounded p-2 text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default DataTable;

// 辅助函数：将月份转换为数字
function getMonthNumber(month: string | number): number {
  if (!month && month !== 0) return 0;

  // 如果已经是数字，直接返回
  if (typeof month === 'number') {
    return month >= 1 && month <= 12 ? month : 0;
  }

  // 处理中文月份格式（如 '1月'、'12月'）
  const chineseMatch = month.match(/^(\d+)月?$/);
  if (chineseMatch) {
    return parseInt(chineseMatch[1], 10);
  }

  // 处理数字格式（如 '1'、'01'、'12'）
  const num = parseInt(month, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return num;
  }

  // 处理英文月份格式
  const englishMonths: Record<string, number> = {
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12,
  };

  const lowerMonth = month.toLowerCase();
  return englishMonths[lowerMonth] || 0;
}

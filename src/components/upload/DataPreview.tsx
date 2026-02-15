'use client';

import { useState, useMemo } from 'react';
import { Table } from 'lucide-react';
import { parseSheetData } from '@/lib/excel-parser';
import { RawDataRow } from '@/types';
import * as XLSX from 'xlsx';

interface DataPreviewProps {
  workbook: XLSX.WorkBook;
  selectedSheets: string[];
}

export function DataPreview({ workbook, selectedSheets }: DataPreviewProps) {
  const [activeSheet, setActiveSheet] = useState(selectedSheets[0] || '');

  // 解析选中Sheet的数据
  const sheetData = useMemo(() => {
    if (!activeSheet) return { headers: [], rows: [], totalRows: 0 };

    const data = parseSheetData(workbook, activeSheet);
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    // 只显示前10行
    const rows = data.slice(0, 10);

    return {
      headers,
      rows,
      totalRows: data.length,
    };
  }, [workbook, activeSheet]);

  // 计算每个选中Sheet的数据统计
  const sheetStats = useMemo(() => {
    return selectedSheets.map((sheetName) => {
      const data = parseSheetData(workbook, sheetName);
      return {
        name: sheetName,
        rowCount: data.length,
        colCount: data.length > 0 ? Object.keys(data[0]).length : 0,
      };
    });
  }, [workbook, selectedSheets]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          数据预览
        </h2>
        <div className="text-sm text-neutral-500">
          共 {selectedSheets.length} 个 Sheet ·{' '}
          {sheetStats.reduce((acc, s) => acc + s.rowCount, 0)} 行数据
        </div>
      </div>

      {/* Sheet 标签 */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-700">
        {selectedSheets.map((sheetName) => (
          <button
            key={sheetName}
            onClick={() => setActiveSheet(sheetName)}
            className={`
              flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors
              ${
                activeSheet === sheetName
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
              }
            `}
          >
            <Table className="h-4 w-4" />
            {sheetName}
          </button>
        ))}
      </div>

      {/* 数据表格 */}
      {sheetData.rows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left dark:bg-neutral-800">
              <tr>
                <th className="border-b border-neutral-200 px-3 py-2 font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                  #
                </th>
                {sheetData.headers.map((header) => (
                  <th
                    key={header}
                    className="border-b border-neutral-200 whitespace-nowrap px-3 py-2 font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {sheetData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="border-b border-neutral-200 px-3 py-2 text-neutral-500 dark:border-neutral-700">
                    {rowIndex + 1}
                  </td>
                  {sheetData.headers.map((header) => {
                    const value = (row as unknown as Record<string, unknown>)[header];
                    return (
                      <td
                        key={header}
                        className="border-b border-neutral-200 max-w-xs truncate px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
                        title={String(value ?? '')}
                      >
                        {value !== undefined && value !== null
                          ? typeof value === 'number'
                            ? value.toLocaleString()
                            : String(value)
                          : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-neutral-500">该Sheet没有数据</p>
      )}

      {/* 数据统计 */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-500">
        <span>当前Sheet: {sheetData.totalRows} 行</span>
        <span>显示前 {sheetData.rows.length} 行</span>
        {sheetData.totalRows > 10 && (
          <span className="text-amber-600 dark:text-amber-400">
            还有 {sheetData.totalRows - 10} 行未显示
          </span>
        )}
      </div>
    </div>
  );
}

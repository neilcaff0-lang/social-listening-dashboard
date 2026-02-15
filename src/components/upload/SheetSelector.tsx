'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { SheetInfo } from '@/types';

interface SheetSelectorProps {
  sheetInfos: SheetInfo[];
  selectedSheets: string[];
  onSelectionChange: (sheets: string[]) => void;
}

export function SheetSelector({
  sheetInfos,
  selectedSheets,
  onSelectionChange,
}: SheetSelectorProps) {
  const [selectAll, setSelectAll] = useState(selectedSheets.length === sheetInfos.length);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      onSelectionChange(sheetInfos.map((info) => info.name));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectSheet = (sheetName: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      newSelected = [...selectedSheets, sheetName];
    } else {
      newSelected = selectedSheets.filter((name) => name !== sheetName);
    }
    onSelectionChange(newSelected);
    setSelectAll(newSelected.length === sheetInfos.length);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          选择要导入的 Sheet
        </h2>
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onCheckedChange={handleSelectAll}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            全选
          </label>
        </div>
      </div>

      {sheetInfos.length === 0 ? (
        <p className="text-neutral-500">未找到任何 Sheet</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sheetInfos.map((sheet) => (
            <div
              key={sheet.name}
              onClick={() => handleSelectSheet(sheet.name, !selectedSheets.includes(sheet.name))}
              className={`
                relative cursor-pointer rounded-lg border p-4 transition-all
                ${
                  selectedSheets.includes(sheet.name)
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedSheets.includes(sheet.name)}
                  onCheckedChange={(checked) =>
                    handleSelectSheet(sheet.name, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-50">
                    {sheet.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {sheet.rowCount} 行 · {sheet.columns.length} 列
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">
                    列: {sheet.columns.slice(0, 5).join(', ')}
                    {sheet.columns.length > 5 && '...'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSheets.length > 0 && (
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          已选择 {selectedSheets.length} 个 Sheet，共{' '}
          {sheetInfos
            .filter((s) => selectedSheets.includes(s.name))
            .reduce((acc, s) => acc + s.rowCount, 0)}{' '}
          行数据
        </p>
      )}
    </div>
  );
}

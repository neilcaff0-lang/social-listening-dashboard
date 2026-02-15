'use client';

import { useState, useEffect, useRef } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Search, X } from 'lucide-react';

export default function KeywordSearch() {
  const { filters, setFilters } = useDataStore();
  const [inputValue, setInputValue] = useState(filters.keyword);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 监听输入变化，使用防抖
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setFilters({ keyword: inputValue });
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputValue, setFilters]);

  const handleClear = () => {
    setInputValue('');
    setFilters({ keyword: '' });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        关键词搜索
      </h3>
      <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入关键词搜索..."
            className="w-full rounded-md border border-neutral-300 bg-white py-2 pl-9 pr-8 text-sm placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <X className="h-3.5 w-3.5 text-neutral-400" />
            </button>
          )}
        </div>
        {filters.keyword && (
          <p className="mt-2 text-xs text-neutral-500">
            当前搜索: <span className="font-medium text-blue-600">{filters.keyword}</span>
          </p>
        )}
      </div>
    </div>
  );
}

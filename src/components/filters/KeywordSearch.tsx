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
      <label className="filter-label">关键词搜索</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入关键词搜索..."
          className="input pl-9 pr-8"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <X className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          </button>
        )}
      </div>
    </div>
  );
}

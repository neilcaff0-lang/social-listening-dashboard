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
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#5A6170]">关键词搜索</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA0AB]" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入关键词搜索..."
          className="w-full rounded-xl border border-[#E8ECF1] bg-white py-2.5 pl-9 pr-8 text-sm placeholder:text-[#9AA0AB] focus:border-[#6C5CE7] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 transition-all"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-[#F5F7FA] transition-colors"
          >
            <X className="h-3.5 w-3.5 text-[#9AA0AB]" />
          </button>
        )}
      </div>
    </div>
  );
}

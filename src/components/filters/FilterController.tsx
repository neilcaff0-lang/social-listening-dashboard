'use client';

import { useEffect, useRef } from 'react';
import { useDataStore } from '@/store/useDataStore';

// 防抖延迟（毫秒）
const DEBOUNCE_DELAY = 300;

export default function FilterController() {
  const { pendingFilters, applyFilters } = useDataStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 监听 pendingFilters 变化，应用防抖
  useEffect(() => {
    // 如果有暂存的筛选条件，应用防抖
    if (pendingFilters) {
      // 清除之前的计时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 设置新的防抖计时器
      timeoutRef.current = setTimeout(() => {
        applyFilters();
      }, DEBOUNCE_DELAY);
    }

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pendingFilters, applyFilters]);

  return null;
}

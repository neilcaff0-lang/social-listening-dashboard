import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RawDataRow, FilterState, Category, SheetInfo } from '@/types';

interface DataState {
  // 原始数据
  rawData: RawDataRow[];
  categories: Category[];
  sheetInfos: SheetInfo[];

  // 筛选状态
  filters: FilterState;

  // 暂存筛选状态（用于防抖）
  pendingFilters: FilterState | null;

  // UI状态
  sidebarOpen: boolean;
  isLoading: boolean;

  // Actions
  setRawData: (data: RawDataRow[], categories: Category[], sheetInfos: SheetInfo[]) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  // 防抖筛选相关
  setPendingFilters: (filters: Partial<FilterState>) => void;
  applyFilters: () => void;
  // 清除
  clearFilters: () => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  clearAllData: () => void;
}

// 默认筛选状态 - 设置为空不过滤
const defaultFilters: FilterState = {
  categories: [],
  timeFilter: { year: undefined, months: [] },
  quadrants: [],
  keyword: '',
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // 初始状态
      rawData: [],
      categories: [],
      sheetInfos: [],
      filters: defaultFilters,
      pendingFilters: null,
      sidebarOpen: true,
      isLoading: false,

      // Actions
      setRawData: (data, categories, sheetInfos) =>
        set({ rawData: data, categories, sheetInfos }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      // 设置暂存筛选状态
      setPendingFilters: (newFilters) =>
        set((state) => ({
          pendingFilters: { ...state.filters, ...newFilters },
        })),

      // 应用暂存的筛选状态
      applyFilters: () => {
        const { pendingFilters } = get();
        if (pendingFilters) {
          set({ filters: pendingFilters, pendingFilters: null });
        }
      },

      clearFilters: () => set({ filters: defaultFilters, pendingFilters: null }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setLoading: (loading) => set({ isLoading: loading }),

      clearAllData: () =>
        set({
          rawData: [],
          categories: [],
          sheetInfos: [],
          filters: defaultFilters,
          pendingFilters: null,
        }),
    }),
    {
      name: 'sns-dashboard-storage',
      partialize: (state) => ({
        rawData: state.rawData,
        categories: state.categories,
        sheetInfos: state.sheetInfos,
        filters: state.filters,
      }),
    }
  )
);

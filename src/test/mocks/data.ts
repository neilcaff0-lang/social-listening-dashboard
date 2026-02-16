import { RawDataRow, FilterState } from '@/types/index';

export const mockRawDataRow: RawDataRow = {
  YEAR: 2024,
  MONTH: '1月',
  CATEGORY: '裤子',
  SUBCATEGORY: '牛仔裤',
  KEYWORDS: '直筒裤',
  小红书_Buzz: 1000,
  抖音_Buzz: 2000,
  TTL_Buzz: 3000,
  TTL_Buzz_YOY: 0.25,
  TTL_Buzz_MOM: 0.1,
  小红书_SEARCH: 500,
  小红书_SEARCH_vs_Dec: 0.05,
  抖音_SEARCH: 800,
  抖音_SEARCH_vs_Dec: 0.08,
  象限图: '高潜',
};

export const createMockRawData = (overrides: Partial<RawDataRow> = {}): RawDataRow => ({
  ...mockRawDataRow,
  ...overrides,
});

export const mockFilterState: FilterState = {
  categories: [],
  timeFilter: { year: undefined, months: [] },
  quadrants: [],
  keyword: '',
};

export const createMockFilterState = (overrides: Partial<FilterState> = {}): FilterState => ({
  ...mockFilterState,
  ...overrides,
});

// 测试数据集
export const mockDataset: RawDataRow[] = [
  createMockRawData({ CATEGORY: '裤子', SUBCATEGORY: '牛仔裤', KEYWORDS: '直筒裤', TTL_Buzz: 3000, TTL_Buzz_YOY: 0.25 }),
  createMockRawData({ CATEGORY: '裤子', SUBCATEGORY: '牛仔裤', KEYWORDS: '阔腿裤', TTL_Buzz: 2500, TTL_Buzz_YOY: 0.15 }),
  createMockRawData({ CATEGORY: '裤子', SUBCATEGORY: '休闲裤', KEYWORDS: '运动裤', TTL_Buzz: 2000, TTL_Buzz_YOY: -0.05 }),
  createMockRawData({ CATEGORY: '包', SUBCATEGORY: '手提包', KEYWORDS: '单肩包', TTL_Buzz: 4000, TTL_Buzz_YOY: 0.35 }),
  createMockRawData({ CATEGORY: '包', SUBCATEGORY: '手提包', KEYWORDS: '托特包', TTL_Buzz: 3500, TTL_Buzz_YOY: 0.20 }),
  createMockRawData({ CATEGORY: '鞋', SUBCATEGORY: '运动鞋', KEYWORDS: '跑步鞋', TTL_Buzz: 5000, TTL_Buzz_YOY: 0.40 }),
  createMockRawData({ CATEGORY: '鞋', SUBCATEGORY: '运动鞋', KEYWORDS: '休闲鞋', TTL_Buzz: 3000, TTL_Buzz_YOY: 0.10 }),
];

// 非重点品类数据
export const mockOtherCategoryData: RawDataRow[] = [
  createMockRawData({ CATEGORY: '上衣', SUBCATEGORY: undefined, KEYWORDS: 'T恤', TTL_Buzz: 1500 }),
  createMockRawData({ CATEGORY: '配饰', SUBCATEGORY: undefined, KEYWORDS: '项链', TTL_Buzz: 800 }),
];

export const mockEmptyFilterState: FilterState = {
  categories: [],
  timeFilter: { months: [] },
  quadrants: [],
  keyword: '',
};

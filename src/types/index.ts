// 原始数据行
interface RawDataRow {
  YEAR: number;
  MONTH: string;
  CATEGORY: string;
  SUBCATEGORY?: string; // 细分类目（仅裤子、包、鞋有）
  KEYWORDS: string;
  小红书_Buzz: number;
  抖音_Buzz: number;
  TTL_Buzz: number;
  TTL_Buzz_YOY: number;
  TTL_Buzz_MOM: number;
  小红书_SEARCH: number;
  小红书_SEARCH_vs_Dec: number;
  抖音_SEARCH: number;
  抖音_SEARCH_vs_Dec: number;
  象限图: string;
}

// 有细分类目的品类
const SUBCATEGORY_CATEGORIES = ['裤子', '包', '鞋'] as const;
type SubcategoryCategory = typeof SUBCATEGORY_CATEGORIES[number];

// 品类
interface Category {
  id: string;
  name: string;
  sheetName: string;
}

// 时间筛选
interface TimeFilter {
  year?: number;
  months: string[];
}

// 筛选状态
interface FilterState {
  categories: string[];
  timeFilter: TimeFilter;
  quadrants: string[];
  keyword: string;
}

// 图表数据点
interface ChartDataPoint {
  keyword: string;
  buzz: number;
  yoy: number;
  search: number;
  quadrant: string;
  category: string;
}

// Sheet元数据
interface SheetInfo {
  name: string;
  rowCount: number;
  columns: string[];
}

export type {
  RawDataRow,
  Category,
  TimeFilter,
  FilterState,
  ChartDataPoint,
  SheetInfo,
  SubcategoryCategory,
};

export { SUBCATEGORY_CATEGORIES };

// 原始数据行
interface RawDataRow {
  YEAR: number;
  MONTH: string;
  CATEGORY: string;
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
};

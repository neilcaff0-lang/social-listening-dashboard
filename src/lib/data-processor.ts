import { RawDataRow, FilterState, ChartDataPoint, TimeFilter } from '@/types';

/**
 * 标准化百分比值
 * 原始数据是比率格式，需要乘以100转换为百分比
 * 例如：20 → 2000%, 0.98 → 98%
 * @param value - 原始比率值
 * @returns 百分比数值
 */
export function normalizePercentValue(value: number | undefined | null): number {
  if (value === undefined || value === null || isNaN(value)) return 0;
  return value * 100;
}

/**
 * 筛选数据
 * @param data - 原始数据数组
 * @param filters - 筛选条件
 * @returns 筛选后的数据
 */
export function filterData(
  data: RawDataRow[],
  filters: FilterState
): RawDataRow[] {
  return data.filter((row) => {
    // 品类筛选
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(row.CATEGORY)) {
        return false;
      }
    }

    // 时间筛选
    if (filters.timeFilter) {
      const { year, months } = filters.timeFilter;
      if (year && row.YEAR !== year) {
        return false;
      }
      if (months && months.length > 0 && !months.includes(row.MONTH)) {
        return false;
      }
    }

    // 象限筛选
    if (filters.quadrants.length > 0) {
      if (!row.象限图 || !filters.quadrants.includes(row.象限图)) {
        return false;
      }
    }

    // 关键词搜索
    if (filters.keyword && filters.keyword.trim() !== '') {
      const keyword = filters.keyword.toLowerCase().trim();
      if (!row.KEYWORDS || !row.KEYWORDS.toLowerCase().includes(keyword)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * 获取象限图数据
 * @param data - 原始数据数组
 * @param filters - 筛选条件
 * @returns 图表数据点数组
 */
export function getQuadrantData(
  data: RawDataRow[],
  filters: FilterState
): ChartDataPoint[] {
  const filteredData = filterData(data, filters);

  // 按关键词聚合数据（取最新的数据）
  const keywordMap = new Map<string, RawDataRow>();

  filteredData.forEach((row) => {
    const existing = keywordMap.get(row.KEYWORDS);
    // 如果没有该关键词的数据，或者当前行的年月更新，则更新数据
    if (!existing || (row.YEAR > existing.YEAR) ||
        (row.YEAR === existing.YEAR && getMonthNumber(row.MONTH) > getMonthNumber(existing.MONTH))) {
      keywordMap.set(row.KEYWORDS, row);
    }
  });

  return Array.from(keywordMap.values()).map((row) => ({
    keyword: row.KEYWORDS,
    buzz: row.TTL_Buzz || 0,
    yoy: normalizePercentValue(row.TTL_Buzz_YOY),
    search: (row.小红书_SEARCH || 0) + (row.抖音_SEARCH || 0),
    quadrant: row.象限图 || '未知',
    category: row.CATEGORY,
  }));
}

/**
 * 获取趋势图数据（按月份聚合）
 * @param data - 原始数据数组
 * @param filters - 筛选条件
 * @param metric - 指标类型：'buzz' | 'search' | 'yoy'
 * @returns 月份数据数组
 */
export function getTrendData(
  data: RawDataRow[],
  filters: FilterState,
  metric: 'buzz' | 'search' | 'yoy' = 'buzz'
): { month: string; value: number; category?: string }[] {
  const filteredData = filterData(data, filters);

  // 按月份和品类聚合
  const monthCategoryMap = new Map<string, { value: number; count: number }>();

  filteredData.forEach((row) => {
    const key = `${row.YEAR}-${row.MONTH}-${row.CATEGORY}`;
    const existing = monthCategoryMap.get(key) || { value: 0, count: 0 };

    let metricValue = 0;
    switch (metric) {
      case 'buzz':
        metricValue = row.TTL_Buzz || 0;
        break;
      case 'search':
        metricValue = (row.小红书_SEARCH || 0) + (row.抖音_SEARCH || 0);
        break;
      case 'yoy':
        metricValue = normalizePercentValue(row.TTL_Buzz_YOY);
        break;
    }

    monthCategoryMap.set(key, {
      value: existing.value + metricValue,
      count: existing.count + 1,
    });
  });

  // 转换为数组并按时间排序
  const result: { month: string; value: number; category?: string }[] = [];
  const monthSet = new Set<string>();

  filteredData.forEach((row) => {
    const key = `${row.YEAR}-${row.MONTH}-${row.CATEGORY}`;
    const data = monthCategoryMap.get(key);
    if (data && !monthSet.has(key)) {
      monthSet.add(key);
      result.push({
        month: `${row.YEAR}-${row.MONTH}`,
        value: data.value,
        category: row.CATEGORY,
      });
    }
  });

  // 按时间排序
  result.sort((a, b) => {
    const [yearA, monthA] = a.month.split('-');
    const [yearB, monthB] = b.month.split('-');
    const yearDiff = parseInt(yearA) - parseInt(yearB);
    if (yearDiff !== 0) return yearDiff;
    return getMonthNumber(monthA) - getMonthNumber(monthB);
  });

  return result;
}

/**
 * 获取 Top 关键词
 * @param data - 原始数据数组
 * @param filters - 筛选条件
 * @param limit - 返回数量限制
 * @param sortBy - 排序字段：'buzz' | 'yoy' | 'search'
 * @returns 图表数据点数组
 */
export function getTopKeywords(
  data: RawDataRow[],
  filters: FilterState,
  limit: number = 10,
  sortBy: 'buzz' | 'yoy' | 'search' = 'buzz'
): ChartDataPoint[] {
  const filteredData = filterData(data, filters);

  // 按关键词聚合数据（取最新的数据）
  const keywordMap = new Map<string, RawDataRow>();

  filteredData.forEach((row) => {
    const existing = keywordMap.get(row.KEYWORDS);
    // 如果没有该关键词的数据，或者当前行的年月更新，则更新数据
    if (!existing || (row.YEAR > existing.YEAR) ||
        (row.YEAR === existing.YEAR && getMonthNumber(row.MONTH) > getMonthNumber(existing.MONTH))) {
      keywordMap.set(row.KEYWORDS, row);
    }
  });

  const chartDataPoints: ChartDataPoint[] = Array.from(keywordMap.values()).map((row) => ({
    keyword: row.KEYWORDS,
    buzz: row.TTL_Buzz || 0,
    yoy: normalizePercentValue(row.TTL_Buzz_YOY),
    search: (row.小红书_SEARCH || 0) + (row.抖音_SEARCH || 0),
    quadrant: row.象限图 || '未知',
    category: row.CATEGORY,
  }));

  // 排序
  chartDataPoints.sort((a, b) => {
    switch (sortBy) {
      case 'buzz':
        return b.buzz - a.buzz;
      case 'yoy':
        return b.yoy - a.yoy;
      case 'search':
        return b.search - a.search;
      default:
        return b.buzz - a.buzz;
    }
  });

  return chartDataPoints.slice(0, limit);
}

/**
 * 计算统计指标
 * @param data - 原始数据数组
 * @param filters - 筛选条件
 * @returns 统计指标对象
 */
export function calculateStats(
  data: RawDataRow[],
  filters: FilterState
): {
  totalBuzz: number;
  avgYoy: number;
  totalSearch: number;
  keywordCount: number;
  topKeywords: string[];
} {
  const filteredData = filterData(data, filters);

  // 计算总声量（所有筛选数据的声量总和）
  const totalBuzz = filteredData.reduce((sum, row) => sum + (row.TTL_Buzz || 0), 0);

  // 计算平均 YOY（标准化百分比值）
  const yoyValues = filteredData.map(row => normalizePercentValue(row.TTL_Buzz_YOY));
  const avgYoy = yoyValues.length > 0
    ? yoyValues.reduce((sum, val) => sum + val, 0) / yoyValues.length
    : 0;

  // 计算总搜索量
  const totalSearch = filteredData.reduce((sum, row) =>
    sum + (row.小红书_SEARCH || 0) + (row.抖音_SEARCH || 0), 0);

  // 按关键词聚合（取最新的数据）- 用于统计关键词数量
  const keywordMap = new Map<string, RawDataRow>();
  filteredData.forEach((row) => {
    const existing = keywordMap.get(row.KEYWORDS);
    if (!existing || (row.YEAR > existing.YEAR) ||
        (row.YEAR === existing.YEAR && getMonthNumber(row.MONTH) > getMonthNumber(existing.MONTH))) {
      keywordMap.set(row.KEYWORDS, row);
    }
  });

  const keywords = Array.from(keywordMap.values());

  // 关键词数量
  const keywordCount = keywords.length;

  // Top 关键词（按声量排序）
  const topKeywords = keywords
    .sort((a, b) => (b.TTL_Buzz || 0) - (a.TTL_Buzz || 0))
    .slice(0, 10)
    .map(row => row.KEYWORDS);

  return {
    totalBuzz,
    avgYoy,
    totalSearch,
    keywordCount,
    topKeywords,
  };
}

/**
 * 获取所有可用月份
 * @param data - 原始数据数组
 * @returns 月份字符串数组（按时间排序）
 */
export function getAvailableMonths(data: RawDataRow[]): string[] {
  const monthSet = new Set<string>();

  data.forEach((row) => {
    if (row.YEAR && row.MONTH) {
      monthSet.add(`${row.YEAR}-${row.MONTH}`);
    }
  });

  const months = Array.from(monthSet).sort((a, b) => {
    const [yearA, monthA] = a.split('-');
    const [yearB, monthB] = b.split('-');
    const yearDiff = parseInt(yearA) - parseInt(yearB);
    if (yearDiff !== 0) return yearDiff;
    return getMonthNumber(monthA) - getMonthNumber(monthB);
  });

  return months;
}

/**
 * 获取所有可用品类
 * @param data - 原始数据数组
 * @returns 品类字符串数组
 */
export function getAvailableCategories(data: RawDataRow[]): string[] {
  const categorySet = new Set<string>();

  data.forEach((row) => {
    if (row.CATEGORY) {
      categorySet.add(row.CATEGORY);
    }
  });

  return Array.from(categorySet).sort();
}

/**
 * 获取所有可用象限
 * @param data - 原始数据数组
 * @returns 象限字符串数组
 */
export function getAvailableQuadrants(data: RawDataRow[]): string[] {
  const quadrantSet = new Set<string>();

  data.forEach((row) => {
    if (row.象限图) {
      quadrantSet.add(row.象限图);
    }
  });

  return Array.from(quadrantSet).sort();
}

/**
 * 获取所有可用年份
 * @param data - 原始数据数组
 * @returns 年份数字数组
 */
export function getAvailableYears(data: RawDataRow[]): number[] {
  const yearSet = new Set<number>();

  data.forEach((row) => {
    if (row.YEAR) {
      yearSet.add(row.YEAR);
    }
  });

  return Array.from(yearSet).sort((a, b) => a - b);
}

/**
 * 辅助函数：将月份转换为数字
 * @param month - 月份（可以是字符串如 '1月'、'01'、'January'，或数字）
 * @returns 月份数字（1-12）
 */
function getMonthNumber(month: string | number): number {
  if (!month && month !== 0) return 0;

  // 如果已经是数字，直接返回
  if (typeof month === 'number') {
    return month >= 1 && month <= 12 ? month : 0;
  }

  // 处理中文月份格式（如 '1月'、'12月'）
  const chineseMatch = month.match(/^(\d+)月?$/);
  if (chineseMatch) {
    return parseInt(chineseMatch[1], 10);
  }

  // 处理数字格式（如 '1'、'01'、'12'）
  const num = parseInt(month, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return num;
  }

  // 处理英文月份格式
  const englishMonths: Record<string, number> = {
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12,
  };

  const lowerMonth = month.toLowerCase();
  return englishMonths[lowerMonth] || 0;
}

/**
 * 自动分析数据并生成洞察
 * @param data - 原始数据数组
 * @param filters - 筛选条件
 * @returns 自动生成的洞察列表
 */
export function generateAutoInsights(
  data: RawDataRow[],
  filters: FilterState
): string[] {
  const filteredData = filterData(data, filters);
  const insights: string[] = [];

  if (filteredData.length === 0) return insights;

  // 按关键词聚合（取最新数据）
  const keywordMap = new Map<string, RawDataRow>();
  filteredData.forEach((row) => {
    const existing = keywordMap.get(row.KEYWORDS);
    if (!existing || (row.YEAR > existing.YEAR) ||
        (row.YEAR === existing.YEAR && getMonthNumber(row.MONTH) > getMonthNumber(existing.MONTH))) {
      keywordMap.set(row.KEYWORDS, row);
    }
  });

  const keywords = Array.from(keywordMap.values());

  // 1. 最高增长关键词
  const topGrowth = [...keywords].sort((a, b) =>
    (normalizePercentValue(b.TTL_Buzz_YOY) - normalizePercentValue(a.TTL_Buzz_YOY))
  )[0];
  if (topGrowth && normalizePercentValue(topGrowth.TTL_Buzz_YOY) > 50) {
    insights.push(`🚀 ${topGrowth.KEYWORDS} 增长最快 (+${normalizePercentValue(topGrowth.TTL_Buzz_YOY).toFixed(0)}%)`);
  }

  // 2. 最高声量关键词
  const topBuzz = [...keywords].sort((a, b) => (b.TTL_Buzz || 0) - (a.TTL_Buzz || 0))[0];
  if (topBuzz && topBuzz.TTL_Buzz > 0) {
    insights.push(`🔥 ${topBuzz.KEYWORDS} 声量最高 (${(topBuzz.TTL_Buzz / 1000).toFixed(1)}K)`);
  }

  // 3. 平均增长率
  const avgYoy = keywords.reduce((sum, k) => sum + normalizePercentValue(k.TTL_Buzz_YOY), 0) / keywords.length;
  if (Math.abs(avgYoy) > 5) {
    insights.push(`📈 整体${avgYoy > 0 ? '增长' : '下降'} ${Math.abs(avgYoy).toFixed(1)}%`);
  }

  // 4. 下降关键词预警
  const decliningKeywords = keywords.filter(k => normalizePercentValue(k.TTL_Buzz_YOY) < -20);
  if (decliningKeywords.length > 0) {
    insights.push(`⚠️ ${decliningKeywords.length} 个关键词下降超20%`);
  }

  // 5. 新兴趋势（低声量高增长）
  const emergingKeywords = keywords.filter(k =>
    (k.TTL_Buzz || 0) < avgBuzz(keywords) * 0.5 &&
    normalizePercentValue(k.TTL_Buzz_YOY) > 50
  );
  if (emergingKeywords.length > 0) {
    insights.push(`💡 ${emergingKeywords.length} 个新兴趋势关键词`);
  }

  return insights;
}

// 辅助函数：计算平均声量
function avgBuzz(keywords: RawDataRow[]): number {
  if (keywords.length === 0) return 0;
  return keywords.reduce((sum, k) => sum + (k.TTL_Buzz || 0), 0) / keywords.length;
}

/**
 * 自动推荐关注的关键词
 * @param data - 原始数据数组
 * @param filters - 筛选条件
 * @param limit - 返回数量限制
 * @returns 推荐的关键词列表
 */
export function getRecommendedKeywords(
  data: RawDataRow[],
  filters: FilterState,
  limit: number = 10
): { keyword: string; reason: string; score: number }[] {
  const filteredData = filterData(data, filters);

  if (filteredData.length === 0) return [];

  // 按关键词聚合
  const keywordMap = new Map<string, RawDataRow>();
  filteredData.forEach((row) => {
    const existing = keywordMap.get(row.KEYWORDS);
    if (!existing || (row.YEAR > existing.YEAR) ||
        (row.YEAR === existing.YEAR && getMonthNumber(row.MONTH) > getMonthNumber(existing.MONTH))) {
      keywordMap.set(row.KEYWORDS, row);
    }
  });

  const keywords = Array.from(keywordMap.values());
  const maxBuzz = Math.max(...keywords.map(k => k.TTL_Buzz || 0), 1);

  // 计算推荐分数
  const recommendations = keywords.map(k => {
    const yoy = normalizePercentValue(k.TTL_Buzz_YOY);
    const buzz = k.TTL_Buzz || 0;
    const buzzScore = buzz / maxBuzz * 50;
    const growthScore = Math.min(Math.max(yoy / 2, -25), 50);
    const score = buzzScore + growthScore;

    let reason = '';
    if (yoy > 50 && buzz > maxBuzz * 0.3) {
      reason = '高增长 + 高声量';
    } else if (yoy > 30) {
      reason = '快速增长';
    } else if (buzz > maxBuzz * 0.5) {
      reason = '高声量';
    } else if (yoy < -20) {
      reason = '需关注下降趋势';
    } else {
      reason = '稳定表现';
    }

    return { keyword: k.KEYWORDS, reason, score };
  });

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

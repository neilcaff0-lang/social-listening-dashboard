/**
 * 高级数据分析工具库
 * 提供对数坐标、归一化、相关性分析、异常检测等功能
 */

import { RawDataRow, FilterState, SUBCATEGORY_CATEGORIES } from '@/types';
import { filterData, normalizePercentValue, getMonthNumber } from './data-processor';

// ==========================================
// 1. 对数坐标转换
// ==========================================

/**
 * 对数坐标转换配置
 */
export interface LogScaleConfig {
  enabled: boolean;
  base: number;      // 对数底数，默认10
  minPositive: number; // 最小正值，用于处理0和负数
}

const defaultLogConfig: LogScaleConfig = {
  enabled: false,
  base: 10,
  minPositive: 0.01,
};

/**
 * 转换为对数坐标值
 * 处理0值和负数：使用 minPositive 作为偏移
 * @param value - 原始值
 * @param config - 对数配置
 * @returns 对数坐标值
 */
export function toLogScale(value: number, config: Partial<LogScaleConfig> = {}): number {
  const { base = 10, minPositive = 0.01 } = { ...defaultLogConfig, ...config };

  if (value <= 0) {
    return Math.log(minPositive) / Math.log(base);
  }

  return Math.log(value) / Math.log(base);
}

/**
 * 从对数坐标转回原始值
 * @param logValue - 对数坐标值
 * @param config - 对数配置
 * @returns 原始值
 */
export function fromLogScale(logValue: number, config: Partial<LogScaleConfig> = {}): number {
  const { base = 10 } = { ...defaultLogConfig, ...config };
  return Math.pow(base, logValue);
}

/**
 * 判断是否需要使用对数坐标
 * 当数据跨度超过阈值时建议使用
 * @param values - 数值数组
 * @param threshold - 跨度阈值，默认10倍
 * @returns 是否需要对数坐标
 */
export function shouldUseLogScale(values: number[], threshold: number = 10): boolean {
  const positiveValues = values.filter(v => v > 0);
  if (positiveValues.length < 2) return false;

  const min = Math.min(...positiveValues);
  const max = Math.max(...positiveValues);

  return max / min > threshold;
}

// ==========================================
// 2. 数据归一化
// ==========================================

export type NormalizationType = 'minmax' | 'zscore' | 'log';

/**
 * Min-Max 归一化
 * 将数据缩放到 [0, 1] 范围
 */
export function normalizeMinMax(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) return values.map(() => 0.5);

  return values.map(v => (v - min) / range);
}

/**
 * Z-Score 标准化
 * 将数据转换为均值为0，标准差为1的分布
 */
export function normalizeZScore(values: number[]): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);

  if (std === 0) return values.map(() => 0);

  return values.map(v => (v - mean) / std);
}

/**
 * 通用归一化函数
 */
export function normalize(values: number[], type: NormalizationType = 'minmax'): number[] {
  switch (type) {
    case 'minmax':
      return normalizeMinMax(values);
    case 'zscore':
      return normalizeZScore(values);
    case 'log':
      return normalizeMinMax(values.map(v => toLogScale(Math.abs(v))));
    default:
      return values;
  }
}

// ==========================================
// 3. 相关性分析
// ==========================================

/**
 * 计算皮尔逊相关系数
 * @param x - 第一个变量数组
 * @param y - 第二个变量数组
 * @returns 相关系数 (-1 到 1)
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * 生成相关性矩阵
 * @param data - 原始数据
 * @param metrics - 要分析的指标数组
 * @returns 相关性矩阵
 */
export interface CorrelationMatrix {
  labels: string[];
  matrix: number[][];
}

export function generateCorrelationMatrix(
  data: RawDataRow[],
  metrics: Array<{ key: keyof RawDataRow; label: string }>
): CorrelationMatrix {
  const values: number[][] = metrics.map(() => []);

  // 提取数值
  data.forEach(row => {
    metrics.forEach((metric, i) => {
      const val = row[metric.key];
      values[i].push(typeof val === 'number' ? val : 0);
    });
  });

  // 计算相关系数
  const matrix: number[][] = metrics.map((_, i) =>
    metrics.map((_, j) => calculateCorrelation(values[i], values[j]))
  );

  return {
    labels: metrics.map(m => m.label),
    matrix,
  };
}

// ==========================================
// 4. 异常检测
// ==========================================

export interface AnomalyResult {
  value: number;
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high';
  zScore: number;
}

/**
 * 使用 IQR 方法检测异常值
 * @param values - 数值数组
 * @returns 每个值的异常检测结果
 */
export function detectAnomaliesIQR(values: number[]): AnomalyResult[] {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // 计算 Q1 和 Q3
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];

  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // 计算均值和标准差用于 z-score
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);

  return values.map(value => {
    const isAnomaly = value < lowerBound || value > upperBound;
    const zScore = std === 0 ? 0 : (value - mean) / std;

    let severity: 'low' | 'medium' | 'high' = 'low';
    if (isAnomaly) {
      const absZ = Math.abs(zScore);
      if (absZ > 3) severity = 'high';
      else if (absZ > 2) severity = 'medium';
    }

    return { value, isAnomaly, severity, zScore };
  });
}

/**
 * 检测关键词的异常波动
 */
export interface KeywordAnomaly {
  keyword: string;
  month: string;
  metric: 'buzz' | 'yoy' | 'mom';
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
}

export function detectKeywordAnomalies(
  data: RawDataRow[],
  filters: FilterState
): KeywordAnomaly[] {
  const filteredData = filterData(data, filters);
  const anomalies: KeywordAnomaly[] = [];

  // 按关键词分组
  const keywordGroups = new Map<string, RawDataRow[]>();
  filteredData.forEach(row => {
    const existing = keywordGroups.get(row.KEYWORDS) || [];
    existing.push(row);
    keywordGroups.set(row.KEYWORDS, existing);
  });

  // 对每个关键词进行异常检测
  keywordGroups.forEach((rows, keyword) => {
    // 按时间排序
    rows.sort((a, b) => {
      const dateA = a.YEAR * 100 + getMonthNumber(a.MONTH);
      const dateB = b.YEAR * 100 + getMonthNumber(b.MONTH);
      return dateA - dateB;
    });

    // 检测声量异常
    const buzzValues = rows.map(r => r.TTL_Buzz || 0);
    const buzzAnomalies = detectAnomaliesIQR(buzzValues);

    buzzAnomalies.forEach((result, index) => {
      if (result.isAnomaly && result.severity !== 'low') {
        const row = rows[index];
        const avgBuzz = buzzValues.reduce((a, b) => a + b, 0) / buzzValues.length;
        anomalies.push({
          keyword,
          month: `${row.YEAR}-${row.MONTH}`,
          metric: 'buzz',
          value: result.value,
          expectedValue: avgBuzz,
          deviation: result.zScore,
          severity: result.severity,
        });
      }
    });

    // 检测 YOY 异常
    const yoyValues = rows.map(r => normalizePercentValue(r.TTL_Buzz_YOY));
    const yoyAnomalies = detectAnomaliesIQR(yoyValues);

    yoyAnomalies.forEach((result, index) => {
      if (result.isAnomaly && result.severity !== 'low' && Math.abs(result.value) > 50) {
        const row = rows[index];
        const avgYoy = yoyValues.reduce((a, b) => a + b, 0) / yoyValues.length;
        anomalies.push({
          keyword,
          month: `${row.YEAR}-${row.MONTH}`,
          metric: 'yoy',
          value: result.value,
          expectedValue: avgYoy,
          deviation: result.zScore,
          severity: result.severity,
        });
      }
    });
  });

  return anomalies.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
}

// ==========================================
// 5. 品类分析
// ==========================================

export interface CategoryAnalysis {
  category: string;
  totalBuzz: number;
  avgYoy: number;
  keywordCount: number;
  shareOfVoice: number;  // 声量份额
  growthMomentum: number; // 增长势头
}

export function analyzeCategories(
  data: RawDataRow[],
  filters: FilterState
): CategoryAnalysis[] {
  const filteredData = filterData(data, filters);

  // 按品类聚合
  const categoryMap = new Map<string, {
    totalBuzz: number;
    yoyValues: number[];
    keywords: Set<string>;
  }>();

  filteredData.forEach(row => {
    const existing = categoryMap.get(row.CATEGORY) || {
      totalBuzz: 0,
      yoyValues: [],
      keywords: new Set(),
    };

    existing.totalBuzz += row.TTL_Buzz || 0;
    existing.yoyValues.push(normalizePercentValue(row.TTL_Buzz_YOY));
    existing.keywords.add(row.KEYWORDS);

    categoryMap.set(row.CATEGORY, existing);
  });

  // 计算总声量用于份额计算
  const totalBuzz = Array.from(categoryMap.values())
    .reduce((sum, c) => sum + c.totalBuzz, 0);

  // 转换为分析结果
  const results: CategoryAnalysis[] = Array.from(categoryMap.entries()).map(([category, data]) => {
    const avgYoy = data.yoyValues.reduce((a, b) => a + b, 0) / data.yoyValues.length;

    return {
      category,
      totalBuzz: data.totalBuzz,
      avgYoy,
      keywordCount: data.keywords.size,
      shareOfVoice: totalBuzz > 0 ? (data.totalBuzz / totalBuzz) * 100 : 0,
      growthMomentum: avgYoy * Math.log(data.keywords.size + 1), // 综合考虑增长和规模
    };
  });

  return results.sort((a, b) => b.totalBuzz - a.totalBuzz);
}

// ==========================================
// 6. 趋势预测（简单线性回归）
// ==========================================

export interface TrendPrediction {
  slope: number;
  intercept: number;
  rSquared: number;
  nextValue: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

/**
 * 简单线性回归预测
 * @param values - 时间序列数据
 * @returns 预测结果
 */
export function predictTrend(values: number[]): TrendPrediction {
  const n = values.length;
  if (n < 2) {
    return {
      slope: 0,
      intercept: values[0] || 0,
      rSquared: 0,
      nextValue: values[0] || 0,
      trend: 'stable',
      confidence: 0,
    };
  }

  // 使用索引作为 x 值
  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 计算 R-squared
  const yMean = sumY / n;
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const ssResidual = y.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  const rSquared = ssTotal === 0 ? 0 : 1 - (ssResidual / ssTotal);

  // 预测下一个值
  const nextValue = slope * n + intercept;

  // 判断趋势
  let trend: 'up' | 'down' | 'stable' = 'stable';
  const avgValue = Math.abs(sumY / n);
  const changeRate = avgValue > 0 ? Math.abs(slope) / avgValue : 0;

  if (changeRate > 0.1) {
    trend = slope > 0 ? 'up' : 'down';
  }

  return {
    slope,
    intercept,
    rSquared,
    nextValue,
    trend,
    confidence: rSquared,
  };
}

// ==========================================
// 7. 季节性分析
// ==========================================

export interface SeasonalityData {
  month: number;
  avgBuzz: number;
  avgYoy: number;
  dataPoints: number;
}

export function analyzeSeasonality(
  data: RawDataRow[],
  filters: FilterState
): SeasonalityData[] {
  const filteredData = filterData(data, filters);

  // 按月份聚合
  const monthMap = new Map<number, { buzz: number[]; yoy: number[] }>();

  filteredData.forEach(row => {
    const month = getMonthNumber(row.MONTH);
    const existing = monthMap.get(month) || { buzz: [], yoy: [] };

    existing.buzz.push(row.TTL_Buzz || 0);
    existing.yoy.push(normalizePercentValue(row.TTL_Buzz_YOY));

    monthMap.set(month, existing);
  });

  // 计算每个月的平均值
  return Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
    const data = monthMap.get(month) || { buzz: [], yoy: [] };

    return {
      month,
      avgBuzz: data.buzz.length > 0
        ? data.buzz.reduce((a, b) => a + b, 0) / data.buzz.length
        : 0,
      avgYoy: data.yoy.length > 0
        ? data.yoy.reduce((a, b) => a + b, 0) / data.yoy.length
        : 0,
      dataPoints: data.buzz.length,
    };
  });
}

// ==========================================
// 8. 细分类目分析（仅裤子、包、鞋）
// ==========================================

export interface SubcategoryAnalysis {
  category: string;
  subcategory: string;
  totalBuzz: number;
  avgYoy: number;
  keywordCount: number;
  shareInCategory: number;
  topKeywords: { keyword: string; buzz: number; yoy: number }[];
}

export function hasSubcategories(category: string): boolean {
  return SUBCATEGORY_CATEGORIES.includes(category as any);
}

export function analyzeSubcategories(
  data: RawDataRow[],
  filters: FilterState,
  category: string
): SubcategoryAnalysis[] {
  if (!hasSubcategories(category)) return [];

  const filteredData = filterData(data, filters).filter(
    row => row.CATEGORY === category
  );

  const subcategoryMap = new Map<string, {
    totalBuzz: number;
    yoyValues: number[];
    keywords: Map<string, { buzz: number; yoy: number }>;
  }>();

  filteredData.forEach(row => {
    const subcategory = row.SUBCATEGORY || '未分类';
    const existing: {
      totalBuzz: number;
      yoyValues: number[];
      keywords: Map<string, { buzz: number; yoy: number }>;
    } = subcategoryMap.get(subcategory) || {
      totalBuzz: 0,
      yoyValues: [],
      keywords: new Map(),
    };

    existing.totalBuzz += row.TTL_Buzz || 0;
    existing.yoyValues.push(normalizePercentValue(row.TTL_Buzz_YOY));

    const keywordData = existing.keywords.get(row.KEYWORDS) || { buzz: 0, yoy: 0 };
    keywordData.buzz += row.TTL_Buzz || 0;
    keywordData.yoy = normalizePercentValue(row.TTL_Buzz_YOY);
    existing.keywords.set(row.KEYWORDS, keywordData);

    subcategoryMap.set(subcategory, existing);
  });

  const totalCategoryBuzz = Array.from(subcategoryMap.values())
    .reduce((sum, s) => sum + s.totalBuzz, 0);

  return Array.from(subcategoryMap.entries())
    .map(([subcategory, data]) => {
      const avgYoy = data.yoyValues.reduce((a, b) => a + b, 0) / data.yoyValues.length;
      const topKeywords = Array.from(data.keywords.entries())
        .map(([keyword, metrics]) => ({ keyword, ...metrics }))
        .sort((a, b) => b.buzz - a.buzz)
        .slice(0, 5);

      return {
        category,
        subcategory,
        totalBuzz: data.totalBuzz,
        avgYoy,
        keywordCount: data.keywords.size,
        shareInCategory: totalCategoryBuzz > 0
          ? (data.totalBuzz / totalCategoryBuzz) * 100
          : 0,
        topKeywords,
      };
    })
    .sort((a, b) => b.totalBuzz - a.totalBuzz);
}

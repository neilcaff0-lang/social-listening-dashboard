// 消费者维度分析相关类型

// 维度类型
export type DimensionType = 'all' | 'scene' | 'function' | 'material' | 'fit' | 'design' | 'other';

// 维度配置
export interface Dimension {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// 关键词数据
export interface KeywordData {
  id: string;
  name: string;
  heat: number;
  growth: number;
  dimension: DimensionType;
  color: string;
}

// 象限位置
export type QuadrantPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// 象限配置
export interface QuadrantConfig {
  id: QuadrantPosition;
  name: string;
  description: string;
}

// 象限槽位中的关键词
export interface QuadrantKeyword extends KeywordData {
  position: QuadrantPosition;
}

// PPT页面数据
export interface PPTPage {
  id: number;
  title: string;
  category: string;
  keywords: QuadrantKeyword[];
  insights: AIInsightData;
}

// AI洞察数据
export interface AIInsightData {
  core: string;
  trend: string;
  strategy: string;
}

// 播放模式状态
export interface PlayModeState {
  isPlaying: boolean;
  currentPage: number;
  totalPages: number;
}

// 拖拽相关类型
export interface DragItem {
  type: 'keyword';
  data: KeywordData;
}

// 图表数据点
export interface MiniChartDataPoint {
  name: string;
  heat: number;
  growth: number;
}

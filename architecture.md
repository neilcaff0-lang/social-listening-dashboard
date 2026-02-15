# SNS Dashboard 架构设计

## 项目概述

**项目名称**: SNS Analytics Dashboard
**项目类型**: 数据分析可视化 Web 应用
**核心功能**: 导入 SNS 社交媒体数据，通过多维筛选生成可视化图表，支持导出用于 PPT 汇报
**目标用户**: 电商运营、品牌市场人员

---

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图表库**: Recharts + ECharts (四象限图)
- **数据处理**: xlsx (Excel解析)
- **状态管理**: React Context + Zustand
- **部署**: Vercel (可选)

---

## 数据模型

### 原始数据结构

每个 Excel Sheet 包含以下字段:

```typescript
interface RawDataRow {
  YEAR: number;           // 年份: 2025, 2026
  MONTH: string;          // 月份: Jan, Feb, ...
  CATEGORY: string;       // 品类: 羽绒服, 防风衣, ...
  KEYWORDS: string;       // 关键词: 保暖, 户外, ...

  // 声量数据
  小红书_Buzz: number;
  抖音_Buzz: number;
  TTL_Buzz: number;       // 总声量
  TTL_Buzz_YOY: number;   // 同比增速
  TTL_Buzz_MOM: number;   // 环比增速

  // 搜索数据
  小红书_SEARCH: number;
  小红书_SEARCH_vs_Dec: number;
  抖音_SEARCH: number;
  抖音_SEARCH_vs_Dec: number;

  // 分析维度
  象限图: string;         // 第一/二/三/四象限
}
```

### 内部数据结构

```typescript
interface Category {
  id: string;
  name: string;           // 显示名称
  sheetName: string;      // Excel Sheet 名称
}

interface TimeFilter {
  year: number;
  months: string[];      // 选中的月份
}

interface FilterState {
  categories: string[];          // 选中的品类
  timeFilter: TimeFilter;        // 时间筛选
  quadrants: string[];           // 象限筛选
  keyword: string;               // 关键词搜索
}

interface ChartDataPoint {
  keyword: string;
  buzz: number;
  yoy: number;
  search: number;
  quadrant: string;
  category: string;
}
```

---

## 页面结构

```
/                           # 首页/仪表盘
  - 欢迎页面
  - 快速导入数据入口
  - 最近项目列表

/upload                    # 数据导入页
  - Excel 文件上传
  - Sheet 选择
  - 数据预览
  - 确认导入

/dashboard                 # 主仪表盘
  - 筛选侧边栏
    * 品类多选
    * 时间范围选择
    * 象限筛选
    * 关键词搜索
  - 图表展示区
    * 四象限图 (散点图)
    * 趋势图 (折线图)
    * Top关键词排行 (柱状图)
    * 颜色分析 (待定)
  - 数据表格
  - 导出功能区

/export                    # 导出配置页
  - 选择要导出的图表
  - 导出格式设置
  - 下载按钮
```

---

## 核心功能模块

### 1. 数据导入模块

- 支持 .xlsx / .xls 文件上传
- 自动解析所有 Sheet
- 数据验证和清洗
- 本地存储 (localStorage / IndexedDB)

### 2. 筛选引擎

- 多品类组合筛选
- 多时间维度筛选
- 象限过滤
- 关键词模糊搜索

### 3. 可视化组件

| 组件 | 用途 | 库 |
|------|------|-----|
| QuadrantChart | 四象限分析 | ECharts |
| TrendChart | 趋势折线图 | Recharts |
| BarChart | Top排行 | Recharts |
| DataTable | 数据明细 | TanStack Table |

### 4. 导出功能

- 图表导出为 PNG
- 数据导出为 CSV/Excel
- 一键复制到剪贴板

---

## 交互流程

```
1. 用户上传 Excel
       ↓
2. 系统解析 Sheet 和数据
       ↓
3. 进入 Dashboard，选择筛选条件
       ↓
4. 实时更新图表
       ↓
5. 勾选要导出的图表
       ↓
6. 下载图片，贴到 PPT
```

---

## 核心筛选逻辑

### 四象限图数据筛选

```typescript
function filterData(data: RawDataRow[], filters: FilterState): ChartDataPoint[] {
  return data.filter(row => {
    // 品类匹配
    if (filters.categories.length > 0 && !filters.categories.includes(row.CATEGORY)) {
      return false;
    }
    // 时间匹配
    if (!filters.timeFilter.months.includes(row.MONTH)) {
      return false;
    }
    // 象限匹配
    if (filters.quadrants.length > 0 && !filters.quadrants.includes(row.象限图)) {
      return false;
    }
    // 关键词搜索
    if (filters.keyword && !row.KEYWORDS.includes(filters.keyword)) {
      return false;
    }
    return true;
  }).map(row => ({
    keyword: row.KEYWORDS,
    buzz: row.TTL_Buzz,
    yoy: row.TTL_Buzz_YOY * 100,  // 转换为百分比
    search: row.小红书_SEARCH + row.抖音_SEARCH,
    quadrant: row.象限图,
    category: row.CATEGORY
  }));
}
```

### 象限计算规则

- **第一象限**: 高声量 + 高增长 (明星关键词)
- **第二象限**: 低声量 + 高增长 (潜力关键词)
- **第三象限**: 低声量 + 低增长 (衰退关键词)
- **第四象限**: 高声量 + 低增长 (成熟关键词)

---

## 项目目录结构

```
sns-dashboard/
├── app/
│   ├── page.tsx                    # 首页
│   ├── layout.tsx                  # 根布局
│   ├── upload/
│   │   └── page.tsx               # 数据导入页
│   ├── dashboard/
│   │   └── page.tsx               # 主仪表盘
│   └── export/
│       └── page.tsx                # 导出页
├── components/
│   ├── ui/                         # 基础 UI 组件
│   ├── charts/                    # 图表组件
│   │   ├── QuadrantChart.tsx
│   │   ├── TrendChart.tsx
│   │   └── TopKeywordsChart.tsx
│   ├── filters/                   # 筛选组件
│   │   ├── CategoryFilter.tsx
│   │   ├── TimeFilter.tsx
│   │   └── KeywordSearch.tsx
│   └── layout/                    # 布局组件
│       ├── Sidebar.tsx
│       └── Header.tsx
├── lib/
│   ├── utils.ts                   # 工具函数
│   ├── excel-parser.ts            # Excel 解析
│   └── data-processor.ts          # 数据处理
├── store/
│   └── useDataStore.ts            # Zustand 状态管理
├── types/
│   └── index.ts                   # 类型定义
├── public/
└── package.json
```

---

## 后续扩展

1. **多数据源支持**: CSV, JSON, API
2. **历史版本对比**: 对比不同月份的数据
3. **自定义报表**: 保存常用的筛选组合
4. **协作功能**: 导出配置分享
5. **自动化**: 定期抓取新数据 (需后端支持)

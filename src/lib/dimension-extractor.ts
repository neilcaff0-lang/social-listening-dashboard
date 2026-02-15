import { DimensionType, KeywordData } from "@/types/analysis";
import { RawDataRow } from "@/types";
import { normalizePercentValue } from "./data-processor";

// 维度关键词词典 - 用于识别关键词属于哪个维度
const DIMENSION_KEYWORDS: Record<string, string[]> = {
  // 全部 - 空数组，表示不进行过滤
  all: [],
  // 场景维度 - 使用场景、场合
  scene: [
    // 日常场景
    "日常", "通勤", "上班", "上学", "逛街", "休闲", "居家", "居家办公",
    // 运动场景
    "运动", "健身", "瑜伽", "跑步", "户外", "徒步", "登山", "骑行", "露营",
    // 社交场景
    "聚会", "约会", "派对", "宴会", "应酬", "应酬", "社交", "商务",
    // 特定场合
    "度假", "旅行", "旅游", "海边", "沙滩", "滑雪", "温泉", "野餐",
    "音乐节", "演唱会", "展览", "博物馆", "图书馆",
    // 季节场景
    "春季", "夏季", "秋季", "冬季", "春天", "夏天", "秋天", "冬天",
    "早晚", "日夜", "四季", "换季",
    // 特殊场景
    "面试", "拍照", "打卡", "探店", "看展", "旅行", "出差", "出国",
  ],

  // 功能维度 - 功能特性
  function: [
    // 基础功能
    "透气", "速干", "吸湿", "排汗", "防水", "防风", "保暖", "隔热",
    "防晒", "防紫外线", "抗UV", "遮光", "遮光", "防蚊", "抗菌",
    // 舒适功能
    "舒适", "柔软", "亲肤", "轻盈", "轻薄", "轻便", "无感", "裸感",
    "弹力", "弹性", "伸缩", "不紧绷", "不勒", "不束缚",
    // 耐用功能
    "耐磨", "耐穿", "耐用", "抗皱", "抗起球", "不易变形", "不掉色",
    "易打理", "免熨烫", "可机洗", "快干",
    // 修饰功能
    "显瘦", "显白", "显高", "遮肉", "修身", "塑形", "收腹", "提臀",
    "收胯", "遮胯", "遮肚", "遮手臂", "显腿长", "显腰细",
    // 其他功能
    "多功能", "多场景", "百搭", "易搭配", "好穿脱", "方便", "实用",
  ],

  // 材质维度 - 面料材质
  material: [
    // 天然纤维
    "棉", "纯棉", "全棉", "有机棉", "埃及棉", "长绒棉", "皮马棉",
    "麻", "亚麻", "苎麻", "汉麻",
    "丝", "真丝", "桑蚕丝", "柞蚕丝", "香云纱",
    "毛", "羊毛", "羊绒", "驼绒", "马海毛", "羊驼毛", "牦牛绒",
    "羽绒", "鸭绒", "鹅绒", "白鸭绒", "灰鸭绒",
    // 化学纤维
    "涤纶", "聚酯纤维", "尼龙", "锦纶", "氨纶", "莱卡", "腈纶",
    "粘胶", "人造丝", "莫代尔", "莱赛尔", "天丝", "铜氨丝",
    "醋酸", "三醋酸", "涤棉", "涤麻", "棉麻", "丝棉", "羊毛混纺",
    // 新型材料
    "竹纤维", "大豆纤维", "玉米纤维", "牛奶纤维", "海藻纤维",
    "石墨烯", "碳纤维", "相变材料", "气凝胶", "温控", "凉感", "暖感",
    // 面料工艺
    "针织", "梭织", "平纹", "斜纹", "缎纹", "提花", "印花", "扎染",
    "灯芯绒", "牛仔", "帆布", "府绸", "牛津纺", "雪纺", "蕾丝",
    "网纱", "欧根纱", "丝绒", "天鹅绒", "金丝绒", "摇粒绒", "珊瑚绒",
    "法兰绒", "华夫格", "罗纹", "毛圈", "毛巾布",
    // 皮革皮草
    "真皮", "牛皮", "羊皮", "猪皮", "麂皮", "磨砂皮", "漆皮",
    "人造革", "PU", "PVC", "超纤", "合成革",
    "皮草", "貂皮", "狐狸毛", "兔毛", "人造毛", "仿皮草",
  ],

  // 版型维度 - 版型剪裁
  fit: [
    // 宽松版型
    "宽松", "oversize", "落肩", "蝙蝠袖", "廓形", "茧型", "A字",
    "直筒", "H型", " Boydfriend", "男友风", "慵懒", "休闲",
    "大码", "加大", "加肥", "特大号", "松身", " roomy",
    // 修身版型
    "修身", "紧身", "贴身", "合身", " Slim", " skinny", " bodycon",
    "收腰", "收腰", "X型", "沙漏型", "S型", "曲线", "包臀",
    // 长度版型
    "短款", "超短", "露脐", "crop", "常规", "标准", "中长款",
    "长款", "加长", "超长", "及膝", "及踝", "拖地", "九分", "七分", "五分",
    "高腰", "中腰", "低腰", "超高腰", "自然腰", "松紧腰",
    // 袖型
    "长袖", "短袖", "无袖", "七分袖", "五分袖", "泡泡袖", "灯笼袖",
    "喇叭袖", "荷叶袖", "飞飞袖", "插肩袖", "连肩袖", "和服袖",
    // 领型
    "圆领", "V领", "U领", "方领", "一字领", "斜肩", "露肩", "吊带",
    "高领", "半高领", "中领", "翻领", "衬衫领", "POLO领", "娃娃领",
    "西装领", "戗驳领", "平驳领", "青果领", "连帽", "立领", "堆堆领",
    // 裤型
    "阔腿裤", "直筒裤", "小脚裤", "铅笔裤", "喇叭裤", "微喇", "哈伦裤",
    "锥形裤", "萝卜裤", "工装裤", "运动裤", "卫裤", "休闲裤", "西裤",
    "热裤", "短裤", "中裤", "五分裤", "七分裤", "九分裤", "拖地裤",
    "背带裤", "连体裤", "阔腿裤", "裙裤", "灯笼裤",
    // 裙型
    "A字裙", "伞裙", "百褶裙", "包臀裙", "铅笔裙", "鱼尾裙", "荷叶边裙",
    "蛋糕裙", "蓬蓬裙", "公主裙", "吊带裙", "背带裙", "半身裙", "连衣裙",
    "短裙", "中裙", "长裙", "超短裙", "迷笛裙", "及踝裙", "开叉裙",
  ],

  // 设计维度 - 设计风格
  design: [
    // 风格
    "简约", "极简", "性冷淡", "北欧", "日式", "日系", "韩系", "韩版",
    "欧美", "法式", "英伦", "复古", "vintage", "港风", "台系",
    "街头", "嘻哈", "朋克", "摇滚", "机车", "工装", "机能",
    "运动", "athleisure", "高尔夫", "网球", "学院", "preppy",
    "甜美", "可爱", "少女", "淑女", "优雅", "知性", "气质",
    "性感", "辣妹", "y2k", "千禧", "甜辣", "纯欲", "御姐",
    "中性", "无性别", "unisex", "男女同款",
    "民族", "波西米亚", "田园", "森系", "文艺", "小清新",
    "奢华", "高端", "轻奢", "高级感", "贵妇", "名媛",
    // 图案
    "纯色", "素色", "单色", "黑白", "条纹", "横条", "竖条", "格纹",
    "格子", "苏格兰格", "千鸟格", "维希格", "波点", "圆点", "碎花",
    "大花", "印花", "刺绣", "绣花", "贴布", "徽章", "logo",
    "几何", "抽象", "艺术", "油画", "水彩", "迷彩", "动物纹",
    "豹纹", "斑马纹", "蛇纹", "虎纹", "奶牛纹", "字母", "文字",
    "卡通", "联名", "IP", "动漫", "二次元", "游戏", "影视",
    // 细节
    "口袋", "大口袋", "多口袋", "拉链", "纽扣", "魔术贴", "系带",
    "绑带", "抽绳", "褶皱", "打褶", "压褶", "荷叶边", "木耳边",
    "花边", "蕾丝", "镂空", "透视", "露背", "露肩", "露腰",
    "破洞", "磨破", "水洗", "做旧", "渐变", "扎染", "拼接",
    "撞色", "拼色", "分割", "解构", "不对称", "层叠", "流苏",
    "毛边", "卷边", "挽边", "翻边", "开叉", "分叉", "分叉",
    "腰带", "腰封", "松紧", "橡筋", "罗纹", "螺纹", "坑条",
    // 工艺
    "手工", "定制", "高定", "成衣", "立体裁剪", "无缝", "一体成型",
    "环保", "可持续", "再生", "有机", "绿色", "零碳",
  ],

  // 其他
  other: [],
};

// 维度颜色映射
export const DIMENSION_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  all: {
    bg: "bg-slate-500",
    text: "text-slate-600",
    border: "border-slate-500",
    light: "bg-slate-50",
  },
  scene: {
    bg: "bg-emerald-500",
    text: "text-emerald-600",
    border: "border-emerald-500",
    light: "bg-emerald-50",
  },
  function: {
    bg: "bg-blue-500",
    text: "text-blue-600",
    border: "border-blue-500",
    light: "bg-blue-50",
  },
  material: {
    bg: "bg-amber-500",
    text: "text-amber-600",
    border: "border-amber-500",
    light: "bg-amber-50",
  },
  fit: {
    bg: "bg-purple-500",
    text: "text-purple-600",
    border: "border-purple-500",
    light: "bg-purple-50",
  },
  design: {
    bg: "bg-rose-500",
    text: "text-rose-600",
    border: "border-rose-500",
    light: "bg-rose-50",
  },
  other: {
    bg: "bg-gray-500",
    text: "text-gray-600",
    border: "border-gray-500",
    light: "bg-gray-50",
  },
};

/**
 * 检测关键词属于哪个维度
 * @param keyword - 关键词
 * @returns DimensionType - 维度类型
 */
export function detectDimension(keyword: string): DimensionType {
  if (!keyword) return "other";

  const lowerKeyword = keyword.toLowerCase();

  // 遍历每个维度的关键词列表
  for (const [dimension, keywords] of Object.entries(DIMENSION_KEYWORDS)) {
    if (dimension === "other") continue;

    for (const dimKeyword of keywords) {
      // 完全匹配或包含关系
      if (
        lowerKeyword === dimKeyword.toLowerCase() ||
        lowerKeyword.includes(dimKeyword.toLowerCase()) ||
        dimKeyword.toLowerCase().includes(lowerKeyword)
      ) {
        return dimension as DimensionType;
      }
    }
  }

  return "other";
}

/**
 * 从Excel数据中提取指定维度的关键词
 * @param rawData - 原始数据
 * @param category - 品类
 * @param dimension - 维度类型（"all" 显示所有关键词）
 * @param timeFilter - 可选的时间筛选
 * @returns KeywordData[] - 关键词数据列表
 */
export function extractKeywordsByDimension(
  rawData: RawDataRow[],
  category: string,
  dimension: string,
  timeFilter?: { year?: number; months?: string[] }
): KeywordData[] {
  if (!category || !rawData.length) return [];

  // 过滤出当前品类的数据
  let categoryData = rawData.filter((row) => row.CATEGORY === category);

  // 应用时间筛选
  if (timeFilter) {
    if (timeFilter.year !== undefined) {
      categoryData = categoryData.filter((row) => row.YEAR === timeFilter.year);
    }
    if (timeFilter.months && timeFilter.months.length > 0) {
      categoryData = categoryData.filter((row) =>
        timeFilter.months!.includes(row.MONTH)
      );
    }
  }

  if (!categoryData.length) return [];

  // 按关键词分组，计算总声量和平均增速
  const keywordMap = new Map<
    string,
    { heat: number; growth: number; count: number; months: string[]; detectedDimension: DimensionType }
  >();

  categoryData.forEach((row) => {
    const keyword = row.KEYWORDS;
    if (!keyword) return;

    // 检测关键词的维度
    const detectedDim = detectDimension(keyword);

    // 如果选择了"all"，显示所有关键词
    // 否则按维度过滤
    if (dimension !== "all") {
      // 如果选择了特定维度，只显示该维度的关键词
      if (dimension !== "other" && detectedDim !== dimension) {
        return;
      }
      // 如果选择了 "other" 维度，只显示未分类的关键词
      if (dimension === "other" && detectedDim !== "other") {
        return;
      }
    }

    const existing = keywordMap.get(keyword);
    if (existing) {
      existing.heat += row.TTL_Buzz || 0;
      existing.growth += normalizePercentValue(row.TTL_Buzz_YOY);
      existing.count += 1;
      if (row.MONTH && !existing.months.includes(row.MONTH)) {
        existing.months.push(row.MONTH);
      }
    } else {
      keywordMap.set(keyword, {
        heat: row.TTL_Buzz || 0,
        growth: normalizePercentValue(row.TTL_Buzz_YOY),
        count: 1,
        months: row.MONTH ? [row.MONTH] : [],
        detectedDimension: detectedDim,
      });
    }
  });

  // 转换为数组并按热度排序
  return Array.from(keywordMap.entries())
    .map(([name, data], index) => ({
      id: `${dimension}-${category}-${index}`,
      name,
      heat: Math.round(data.heat),
      growth: data.growth / data.count, // 直接使用Excel原始YOY平均值
      dimension: data.detectedDimension, // 使用检测到的维度
      color: DIMENSION_COLORS[data.detectedDimension].bg,
    }))
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 50); // 取前50个关键词
}

/**
 * 获取所有维度的关键词统计
 * @param rawData - 原始数据
 * @param category - 品类
 * @param timeFilter - 可选的时间筛选
 * @returns 各维度的关键词数量统计
 */
export function getDimensionStats(
  rawData: RawDataRow[],
  category: string,
  timeFilter?: { year?: number; months?: string[] }
): Record<string, number> {
  const stats: Record<string, number> = {
    all: 0,
    scene: 0,
    function: 0,
    material: 0,
    fit: 0,
    design: 0,
    other: 0,
  };

  if (!category || !rawData.length) return stats;

  let categoryData = rawData.filter((row) => row.CATEGORY === category);

  // 应用时间筛选
  if (timeFilter) {
    if (timeFilter.year !== undefined) {
      categoryData = categoryData.filter((row) => row.YEAR === timeFilter.year);
    }
    if (timeFilter.months && timeFilter.months.length > 0) {
      categoryData = categoryData.filter((row) =>
        timeFilter.months!.includes(row.MONTH)
      );
    }
  }

  const uniqueKeywords = new Set<string>();

  categoryData.forEach((row) => {
    if (row.KEYWORDS) {
      uniqueKeywords.add(row.KEYWORDS);
    }
  });

  uniqueKeywords.forEach((keyword) => {
    const dimension = detectDimension(keyword);
    stats[dimension]++;
  });

  return stats;
}

/**
 * 维度详细统计信息
 */
export interface DimensionDetailStats {
  keywordCount: number;
  totalBuzz: number;
  avgGrowth: number;
  topKeywords: Array<{
    name: string;
    buzz: number;
    growth: number;
  }>;
}

/**
 * 获取维度的详细统计信息
 * @param rawData - 原始数据
 * @param category - 品类
 * @param dimension - 维度
 * @param timeFilter - 可选的时间筛选
 * @returns 维度详细统计
 */
export function getDimensionDetailStats(
  rawData: RawDataRow[],
  category: string,
  dimension: DimensionType,
  timeFilter?: { year?: number; months?: string[] }
): DimensionDetailStats {
  const keywords = extractKeywordsByDimension(rawData, category, dimension, timeFilter);

  if (keywords.length === 0) {
    return {
      keywordCount: 0,
      totalBuzz: 0,
      avgGrowth: 0,
      topKeywords: [],
    };
  }

  const totalBuzz = keywords.reduce((sum, k) => sum + k.heat, 0);
  const avgGrowth = keywords.reduce((sum, k) => sum + k.growth, 0) / keywords.length;

  return {
    keywordCount: keywords.length,
    totalBuzz,
    avgGrowth,
    topKeywords: keywords.slice(0, 5).map((k) => ({
      name: k.name,
      buzz: k.heat,
      growth: k.growth,
    })),
  };
}

/**
 * 获取关键词的维度标签
 * @param keyword - 关键词
 * @returns 维度标签信息
 */
export function getKeywordDimensionLabel(keyword: string): {
  dimension: string;
  label: string;
  color: string;
} {
  const dimension = detectDimension(keyword);
  const labels: Record<string, string> = {
    all: "全部",
    scene: "场景",
    function: "功能",
    material: "材质",
    fit: "版型",
    design: "设计",
    other: "其他",
  };

  return {
    dimension,
    label: labels[dimension],
    color: DIMENSION_COLORS[dimension].bg,
  };
}

/**
 * 获取所有维度的关键词汇总
 * @param rawData - 原始数据
 * @param category - 品类
 * @param timeFilter - 可选的时间筛选
 * @returns 各维度关键词列表
 */
export function getAllDimensionKeywords(
  rawData: RawDataRow[],
  category: string,
  timeFilter?: { year?: number; months?: string[] }
): Record<string, KeywordData[]> {
  const result: Record<string, KeywordData[]> = {
    all: [],
    scene: [],
    function: [],
    material: [],
    fit: [],
    design: [],
    other: [],
  };

  const dimensions: string[] = ["all", "scene", "function", "material", "fit", "design", "other"];

  dimensions.forEach((dim) => {
    result[dim] = extractKeywordsByDimension(rawData, category, dim, timeFilter);
  });

  return result;
}

/**
 * 比较两个时间段的维度变化
 * @param rawData - 原始数据
 * @param category - 品类
 * @param period1 - 第一个时间段
 * @param period2 - 第二个时间段
 * @returns 各维度的变化情况
 */
export function compareDimensionPeriods(
  rawData: RawDataRow[],
  category: string,
  period1: { year: number; months?: string[] },
  period2: { year: number; months?: string[] }
): Record<DimensionType, {
  period1Buzz: number;
  period2Buzz: number;
  buzzChange: number;
  period1Keywords: number;
  period2Keywords: number;
  keywordChange: number;
}> {
  const dimensions: DimensionType[] = ["scene", "function", "material", "fit", "design", "other"];
  const result: Record<DimensionType, {
    period1Buzz: number;
    period2Buzz: number;
    buzzChange: number;
    period1Keywords: number;
    period2Keywords: number;
    keywordChange: number;
  }> = {} as Record<DimensionType, {
    period1Buzz: number;
    period2Buzz: number;
    buzzChange: number;
    period1Keywords: number;
    period2Keywords: number;
    keywordChange: number;
  }>;

  dimensions.forEach((dim) => {
    const keywords1 = extractKeywordsByDimension(rawData, category, dim, period1);
    const keywords2 = extractKeywordsByDimension(rawData, category, dim, period2);

    const period1Buzz = keywords1.reduce((sum, k) => sum + k.heat, 0);
    const period2Buzz = keywords2.reduce((sum, k) => sum + k.heat, 0);

    result[dim] = {
      period1Buzz,
      period2Buzz,
      buzzChange: period1Buzz > 0 ? ((period2Buzz - period1Buzz) / period1Buzz) * 100 : 0,
      period1Keywords: keywords1.length,
      period2Keywords: keywords2.length,
      keywordChange: keywords1.length > 0
        ? ((keywords2.length - keywords1.length) / keywords1.length) * 100
        : 0,
    };
  });

  return result;
}

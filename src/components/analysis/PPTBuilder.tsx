"use client";

import { useState, useMemo, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useDataStore } from "@/store/useDataStore";
import { extractKeywordsByDimension } from "@/lib/dimension-extractor";
import { QuadrantPosition, QuadrantKeyword, PPTPage } from "@/types/analysis";
import { Play, X, TrendingUp, Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import PlayMode from "./PlayMode";
import KeywordTrendChart from "./KeywordTrendChart";

// 默认页面
const defaultPages: PPTPage[] = [
  { id: 0, title: "页面 1", category: "", keywords: [], insights: { core: "", trend: "", strategy: "" } },
  { id: 1, title: "页面 2", category: "", keywords: [], insights: { core: "", trend: "", strategy: "" } },
  { id: 2, title: "页面 3", category: "", keywords: [], insights: { core: "", trend: "", strategy: "" } },
  { id: 3, title: "页面 4", category: "", keywords: [], insights: { core: "", trend: "", strategy: "" } },
];

// 象限配置
const quadrantConfig = {
  "top-left": { title: "明星关键词", desc: "高热度·高增长", color: "border-emerald-400 bg-emerald-50" },
  "top-right": { title: "潜力关键词", desc: "低热度·高增长", color: "border-blue-400 bg-blue-50" },
  "bottom-left": { title: "成熟关键词", desc: "高热度·低增长", color: "border-amber-400 bg-amber-50" },
  "bottom-right": { title: "观察关键词", desc: "低热度·低增长", color: "border-gray-300 bg-gray-50" },
};

// 维度颜色
const dimColors: Record<string, string> = {
  scene: "bg-emerald-500",
  function: "bg-blue-500",
  material: "bg-amber-500",
  fit: "bg-purple-500",
  design: "bg-rose-500",
  other: "bg-gray-500",
};

export default function PPTBuilder() {
  const { categories, rawData } = useDataStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [pages, setPages] = useState<PPTPage[]>(defaultPages);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlayMode, setIsPlayMode] = useState(false);

  // 提取所有关键词（不筛选时间）
  const keywords = useMemo(() => {
    if (!selectedCategory || !rawData.length) return [];
    return extractKeywordsByDimension(rawData, selectedCategory, "all", undefined);
  }, [rawData, selectedCategory]);

  // 当前页面数据
  const currentPageData = pages[currentPage];

  // 已放入象限的关键词ID
  const placedKeywordIds = new Set(currentPageData.keywords.map(k => k.id));

  // 可拖拽的关键词（未放入象限的）
  const availableKeywords = keywords.filter(k => !placedKeywordIds.has(k.id));

  // 处理拖拽
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const validPositions = ["top-left", "top-right", "bottom-left", "bottom-right"];

    // 从关键词池拖到象限
    if (source.droppableId === "keyword-pool" && validPositions.includes(destination.droppableId)) {
      const keyword = keywords.find(k => k.id === result.draggableId);
      if (keyword) {
        const position = destination.droppableId as QuadrantPosition;
        setPages(prev => {
          const newPages = [...prev];
          const page = { ...newPages[currentPage] };
          // 移除该位置已有的关键词
          page.keywords = page.keywords.filter(k => k.position !== position);
          // 添加新关键词
          page.keywords.push({ ...keyword, position });
          newPages[currentPage] = page;
          return newPages;
        });
      }
    }
  }, [keywords, currentPage]);

  // 从象限移除关键词
  const removeKeyword = (position: QuadrantPosition) => {
    setPages(prev => {
      const newPages = [...prev];
      newPages[currentPage] = {
        ...newPages[currentPage],
        keywords: newPages[currentPage].keywords.filter(k => k.position !== position)
      };
      return newPages;
    });
  };

  // 获取象限中的关键词
  const getQuadrantKeyword = (position: QuadrantPosition): QuadrantKeyword | undefined => {
    return currentPageData.keywords.find(k => k.position === position);
  };

  // 获取关键词的月度数据
  const getKeywordMonthlyData = useCallback((keywordName: string) => {
    if (!selectedCategory || !rawData.length) return [];

    const monthlyData = rawData
      .filter(row => row.KEYWORDS === keywordName && row.CATEGORY === selectedCategory)
      .map(row => ({
        month: `${row.YEAR}-${row.MONTH}`,
        buzz: row.TTL_Buzz || 0,
        yoy: row.TTL_Buzz_YOY || 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return monthlyData;
  }, [rawData, selectedCategory]);

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="h-full flex bg-white">
          {/* 左侧：关键词池 */}
          <div className="w-56 border-r border-gray-200 flex flex-col bg-gray-50">
            {/* 品类选择 */}
            <div className="p-3 border-b border-gray-200 bg-white">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">品类</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
              >
                <option value="">选择品类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* 关键词池 - 按维度分组 */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-3 py-2 border-b border-gray-200 bg-white flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">关键词</span>
                <span className="text-xs text-gray-400">{availableKeywords.length}</span>
              </div>
              <Droppable droppableId="keyword-pool">
                {(provided) => {
                  // 按维度分组
                  const groupedKeywords = availableKeywords.reduce((acc, kw) => {
                    const dim = kw.dimension || 'other';
                    if (!acc[dim]) acc[dim] = [];
                    acc[dim].push(kw);
                    return acc;
                  }, {} as Record<string, typeof availableKeywords>);

                  const dimNames: Record<string, string> = {
                    scene: '场景', function: '功能', material: '材质',
                    fit: '版型', design: '设计', other: '其他'
                  };

                  let globalIndex = 0;

                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 overflow-y-auto p-2"
                    >
                      {Object.entries(groupedKeywords).map(([dim, kws]) => (
                        <div key={dim} className="mb-2">
                          <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                            <div className={cn("w-1.5 h-1.5 rounded-full", dimColors[dim])} />
                            {dimNames[dim] || dim}
                            <span className="text-gray-300">({kws.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {kws.map((keyword) => {
                              const idx = globalIndex++;
                              return (
                                <Draggable key={keyword.id} draggableId={keyword.id} index={idx}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-grab border transition-all",
                                        "bg-white border-gray-100 hover:border-blue-300 hover:bg-blue-50",
                                        snapshot.isDragging && "shadow-md ring-2 ring-blue-400 scale-105 z-50"
                                      )}
                                      style={provided.draggableProps.style}
                                    >
                                      <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dimColors[keyword.dimension] || "bg-gray-400")} />
                                      <span className="text-gray-600 truncate max-w-[80px]">{keyword.name}</span>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {availableKeywords.length === 0 && (
                        <div className="text-sm text-gray-400 text-center w-full py-8">
                          {selectedCategory ? "暂无关键词" : "请先选择品类"}
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
            </div>
          </div>

          {/* 中间：PPT构建区 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 顶部工具栏 */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-gray-800">PPT构建器</h2>
                {selectedCategory && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded border border-blue-100">
                    {selectedCategory}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsPlayMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                播放
              </button>
            </div>

            {/* 四象限区域 */}
            <div className="flex-1 p-4 overflow-auto bg-gradient-to-br from-slate-50 to-gray-100">
              <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full min-h-[500px]">
                {(["top-left", "top-right", "bottom-left", "bottom-right"] as QuadrantPosition[]).map((position) => {
                  const config = quadrantConfig[position];
                  const keyword = getQuadrantKeyword(position);

                  return (
                    <Droppable key={position} droppableId={position}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "relative rounded-lg border-2 border-dashed flex flex-col transition-all overflow-hidden",
                            config.color,
                            snapshot.isDraggingOver && "border-solid ring-2 ring-blue-400 scale-[1.02] bg-blue-50"
                          )}
                        >
                          {/* 象限标题 */}
                          <div className="px-3 py-1.5 bg-white/60 border-b border-inherit">
                            <div className="text-xs font-semibold text-gray-700">{config.title}</div>
                            <div className="text-[10px] text-gray-400">{config.desc}</div>
                          </div>

                          {/* 内容区域 */}
                          <div className="flex-1 flex flex-col p-3 overflow-hidden">
                            {keyword ? (
                              <div className="flex-1 flex flex-col">
                                {/* 关键词信息 */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", dimColors[keyword.dimension])} />
                                    <span className="font-medium text-gray-800 text-sm truncate">{keyword.name}</span>
                                  </div>
                                  <button
                                    onClick={() => removeKeyword(position)}
                                    className="p-0.5 hover:bg-red-100 rounded text-gray-300 hover:text-red-500 flex-shrink-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* 数据指标 */}
                                <div className="flex items-center gap-3 mb-2 text-[10px] text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Flame className="w-2.5 h-2.5 text-orange-400" />
                                    {keyword.heat.toLocaleString()}
                                  </span>
                                  <span className={cn(
                                    "flex items-center gap-0.5 font-medium",
                                    keyword.growth >= 0 ? "text-green-500" : "text-red-500"
                                  )}>
                                    <TrendingUp className={cn("w-2.5 h-2.5", keyword.growth < 0 && "rotate-180")} />
                                    {keyword.growth >= 0 ? "+" : ""}{keyword.growth.toFixed(1)}%
                                  </span>
                                </div>

                                {/* 月度趋势图 */}
                                <div className="flex-1 min-h-0">
                                  <KeywordTrendChart
                                    data={getKeywordMonthlyData(keyword.name)}
                                    keywordName={keyword.name}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                  <Target className="w-4 h-4" />
                                </div>
                                <span className="text-xs">拖拽关键词</span>
                              </div>
                            )}
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 右侧：页面导航 */}
          <div className="w-40 border-l border-gray-200 flex flex-col bg-gray-50">
            <div className="px-3 py-2 border-b border-gray-200 bg-white">
              <span className="text-xs font-medium text-gray-500">页面</span>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(index)}
                  className={cn(
                    "w-full text-left px-2.5 py-2 rounded text-sm mb-1 transition-colors",
                    currentPage === index
                      ? "bg-blue-500 text-white font-medium shadow-sm"
                      : "hover:bg-gray-100 text-gray-600"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{page.title}</span>
                    {page.keywords.length > 0 && (
                      <span className={cn(
                        "text-[10px] px-1 rounded",
                        currentPage === index ? "bg-blue-400" : "bg-gray-200 text-gray-500"
                      )}>
                        {page.keywords.length}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>

      {/* 播放模式 */}
      <PlayMode
        isOpen={isPlayMode}
        pages={pages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onClose={() => setIsPlayMode(false)}
        category={selectedCategory}
      />
    </>
  );
}

"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { QuadrantPosition, QuadrantKeyword, DimensionType } from "@/types/analysis";
import { X, Plus, Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuadrantSlotProps {
  position: QuadrantPosition;
  keyword: QuadrantKeyword | null;
  onRemove: (position: QuadrantPosition) => void;
}

const positionConfig: Record<QuadrantPosition, { name: string; description: string; className: string; gradientClass: string }> = {
  "top-left": {
    name: "明星关键词",
    description: "高热度·高增长",
    className: "border-t-4 border-l-4 border-emerald-500",
    gradientClass: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
  },
  "top-right": {
    name: "潜力关键词",
    description: "低热度·高增长",
    className: "border-t-4 border-r-4 border-blue-500",
    gradientClass: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
  },
  "bottom-left": {
    name: "成熟关键词",
    description: "高热度·低增长",
    className: "border-b-4 border-l-4 border-amber-500",
    gradientClass: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
  },
  "bottom-right": {
    name: "待观察关键词",
    description: "低热度·低增长",
    className: "border-b-4 border-r-4 border-neutral-400",
    gradientClass: "from-neutral-50 to-slate-50 dark:from-neutral-800/50 dark:to-slate-800/50",
  },
};

// 与 DimensionSelector 保持一致的颜色
const dimensionColors: Record<string, string> = {
  all: "bg-slate-500",
  scene: "bg-emerald-500",
  function: "bg-blue-500",
  material: "bg-amber-500",
  fit: "bg-purple-500",
  design: "bg-rose-500",
  other: "bg-gray-500",
};

export default function QuadrantSlot({
  position,
  keyword,
  onRemove,
}: QuadrantSlotProps) {
  const config = positionConfig[position];

  return (
    <Droppable droppableId={position}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            "relative h-full min-h-[120px] rounded-lg border-2 bg-gradient-to-br transition-all duration-200",
            config.className,
            config.gradientClass,
            snapshot.isDraggingOver
              ? "bg-blue-50 border-blue-400 shadow-lg scale-[1.02] dark:bg-blue-900/20"
              : "border-dashed border-neutral-300 dark:border-neutral-700"
          )}
        >
          {/* 象限标题 */}
          <div className="absolute top-2 left-2 right-2">
            <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {config.name}
            </div>
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
              {config.description}
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex items-center justify-center h-full p-4 pt-10">
            {keyword ? (
              <Draggable draggableId={`slot-${position}`} index={0}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "w-full p-3 rounded-lg bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 transition-all duration-200",
                      snapshot.isDragging
                        ? "shadow-xl ring-2 ring-blue-400 rotate-3"
                        : "hover:shadow-md"
                    )}
                    style={provided.draggableProps.style}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full flex-shrink-0 shadow-sm",
                          dimensionColors[keyword.dimension]
                        )}
                      />
                      <span className="flex-1 font-semibold text-neutral-800 dark:text-neutral-200 text-sm truncate">
                        {keyword.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(position);
                        }}
                        className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-5 text-xs">
                      <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span>{keyword.heat.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={cn(
                          "h-3 w-3",
                          keyword.growth >= 0 ? "text-green-500" : "text-red-500"
                        )} />
                        <span
                          className={cn(
                            "font-medium",
                            keyword.growth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {keyword.growth >= 0 ? "+" : ""}
                          {keyword.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400 dark:text-neutral-500">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">拖拽关键词到此处</span>
              </div>
            )}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

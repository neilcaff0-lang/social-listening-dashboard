"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import { KeywordData, DimensionType } from "@/types/analysis";
import { Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableListProps {
  keywords: KeywordData[];
  dimension: string;
}

const dimensionColors: Record<string, string> = {
  all: "bg-slate-500",
  scene: "bg-emerald-500",
  function: "bg-blue-500",
  material: "bg-amber-500",
  fit: "bg-purple-500",
  design: "bg-rose-500",
  other: "bg-gray-500",
};

const dimensionBgColors: Record<string, string> = {
  all: "bg-slate-50 border-slate-200",
  scene: "bg-emerald-50 border-emerald-200",
  function: "bg-blue-50 border-blue-200",
  material: "bg-amber-50 border-amber-200",
  fit: "bg-purple-50 border-purple-200",
  design: "bg-rose-50 border-rose-200",
  other: "bg-gray-50 border-gray-200",
};

export default function DraggableList({ keywords, dimension }: DraggableListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          关键词列表
        </h3>
        <span className="text-xs text-neutral-500">
          共 {keywords.length} 个
        </span>
      </div>

      <Droppable droppableId="keyword-list" isDropDisabled={true}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1"
          >
            {keywords.map((keyword, index) => (
              <Draggable
                key={keyword.id}
                draggableId={keyword.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "p-3 rounded-lg border cursor-move transition-all duration-200",
                      "hover:shadow-md hover:scale-[1.02]",
                      dimensionBgColors[dimension],
                      snapshot.isDragging
                        ? "shadow-lg ring-2 ring-blue-400 rotate-2"
                        : ""
                    )}
                    style={provided.draggableProps.style}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full flex-shrink-0",
                          dimensionColors[dimension]
                        )}
                      />
                      <span className="flex-1 font-medium text-neutral-800 text-sm truncate">
                        {keyword.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-6">
                      <div className="flex items-center gap-1 text-xs text-neutral-600">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span>{keyword.heat.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-neutral-600">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span
                          className={cn(
                            keyword.growth >= 0 ? "text-green-600" : "text-red-600"
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
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

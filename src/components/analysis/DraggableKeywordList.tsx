"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import { KeywordData, DimensionType } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface DraggableKeywordListProps {
  keywords: KeywordData[];
  dimension: DimensionType;
  dimensionName: string;
}

const dimensionColors: Record<string, { bg: string; text: string; border: string; light: string }> = {
  all: { bg: "bg-slate-500", text: "text-slate-600", border: "border-slate-300", light: "bg-slate-50" },
  scene: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-300", light: "bg-emerald-50" },
  function: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-300", light: "bg-blue-50" },
  material: { bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-300", light: "bg-amber-50" },
  fit: { bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-300", light: "bg-purple-50" },
  design: { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-300", light: "bg-rose-50" },
  other: { bg: "bg-gray-500", text: "text-gray-600", border: "border-gray-300", light: "bg-gray-50" },
};

export default function DraggableKeywordList({
  keywords,
  dimension,
  dimensionName,
}: DraggableKeywordListProps) {
  const colors = dimensionColors[dimension];

  if (keywords.length === 0) return null;

  return (
    <div className="mb-3">
      {/* 维度标题 */}
      <div className="flex items-center gap-2 mb-1.5 px-1">
        <div className={cn("w-2 h-2 rounded-full", colors.bg)} />
        <span className={cn("text-xs font-semibold", colors.text)}>
          {dimensionName}
        </span>
        <span className="text-[10px] text-neutral-400">
          ({keywords.length})
        </span>
      </div>

      {/* 关键词列表 */}
      <Droppable droppableId={`keyword-list-${dimension}`} isDropDisabled={true}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-wrap gap-1"
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
                      "px-2 py-1 rounded text-[11px] cursor-move transition-all duration-150 border",
                      colors.light,
                      colors.border,
                      "hover:shadow-sm hover:scale-[1.02]",
                      snapshot.isDragging && "shadow-md ring-1 ring-blue-400 scale-105"
                    )}
                    style={provided.draggableProps.style}
                    title={`热度: ${keyword.heat.toLocaleString()} | 增速: ${keyword.growth >= 0 ? '+' : ''}${keyword.growth}%`}
                  >
                    <span className="text-neutral-700 font-medium truncate max-w-[80px] inline-block">
                      {keyword.name}
                    </span>
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

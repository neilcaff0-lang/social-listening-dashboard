"use client";

import { Dimension, DimensionType } from "@/types/analysis";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Zap,
  Layers,
  Maximize,
  Palette,
  FolderOpen,
} from "lucide-react";

interface DimensionSelectorProps {
  activeDimension: string;
  onDimensionChange: (dimension: string) => void;
}

const dimensions: Dimension[] = [
  {
    id: "all",
    name: "全部",
    icon: "FolderOpen",
    description: "显示所有关键词",
  },
  {
    id: "scene",
    name: "场景",
    icon: "MapPin",
    description: "使用场景分析",
  },
  {
    id: "function",
    name: "功能",
    icon: "Zap",
    description: "功能特性分析",
  },
  {
    id: "material",
    name: "材质",
    icon: "Layers",
    description: "材质成分分析",
  },
  {
    id: "fit",
    name: "版型",
    icon: "Maximize",
    description: "版型剪裁分析",
  },
  {
    id: "design",
    name: "设计",
    icon: "Palette",
    description: "设计风格分析",
  },
  {
    id: "other",
    name: "其他",
    icon: "FolderOpen",
    description: "其他关键词",
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin,
  Zap,
  Layers,
  Maximize,
  Palette,
  FolderOpen,
};

// 维度颜色映射
const dimensionColors: Record<string, string> = {
  all: "from-slate-600 to-slate-700",
  scene: "from-emerald-500 to-teal-600",
  function: "from-blue-500 to-indigo-600",
  material: "from-amber-500 to-orange-600",
  fit: "from-purple-500 to-violet-600",
  design: "from-rose-500 to-pink-600",
  other: "from-gray-500 to-slate-600",
};

export const getDimensionColor = (dimension: string): string => {
  return dimensionColors[dimension] || dimensionColors.other;
};

export const getDimensionName = (dimension: string): string => {
  const dim = dimensions.find((d) => d.id === dimension);
  return dim?.name || "其他";
};

export default function DimensionSelector({
  activeDimension,
  onDimensionChange,
}: DimensionSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
        维度选择
      </h3>
      <div className="flex flex-col gap-1.5">
        {dimensions.map((dim) => {
          const Icon = iconMap[dim.icon];
          const isActive = activeDimension === dim.id;
          const activeColor = dimensionColors[dim.id];

          return (
            <button
              key={dim.id}
              onClick={() => onDimensionChange(dim.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group",
                "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                isActive
                  ? `bg-gradient-to-r ${activeColor} text-white shadow-md`
                  : "bg-white text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800"
              )}
              title={dim.description}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-600"
                )}
              />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{dim.name}</span>
                {!isActive && (
                  <p className="text-xs text-neutral-400 truncate">
                    {dim.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

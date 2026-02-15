"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Grid3X3,
  TrendingUp,
  FileText,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  description?: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "首页",
    icon: Home,
    href: "/",
    description: "返回首页",
  },
  {
    id: "overview",
    label: "数据概览",
    icon: LayoutDashboard,
    href: "/dashboard",
    description: "查看关键指标和整体数据",
  },
  {
    id: "quadrant",
    label: "四象限分析",
    icon: Grid3X3,
    href: "/dashboard?view=quadrant",
    description: "声量与增速分布分析",
  },
  {
    id: "trend",
    label: "趋势分析",
    icon: TrendingUp,
    href: "/dashboard?view=trend",
    description: "时间维度趋势变化",
  },
  {
    id: "ppt",
    label: "PPT构建器",
    icon: FileText,
    href: "/analysis",
    description: "拖拽生成分析幻灯片",
  },
  {
    id: "import",
    label: "数据导入",
    icon: Upload,
    href: "/upload",
    description: "上传Excel数据文件",
  },
];

export default function ModuleNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (item: NavItem) => {
    if (item.id === "home") {
      return pathname === "/";
    }
    if (item.id === "overview" && pathname === "/dashboard") {
      return true;
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <nav
      className={cn(
        "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r bg-white transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-950",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* 折叠按钮 */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-6 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700",
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* 导航列表 */}
      <div className="flex h-full flex-col py-4">
        <div className="flex-1 space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300"
                  )}
                />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* 底部设置 */}
        <div className="border-t border-neutral-200 px-2 pt-2 dark:border-neutral-800">
          <Link
            href="/settings"
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200",
              collapsed && "justify-center px-2"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300" />
            {!collapsed && <span className="truncate">设置</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}

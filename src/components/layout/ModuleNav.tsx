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
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  {
    id: "overview",
    label: "数据概览",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    id: "quadrant",
    label: "四象限分析",
    icon: Grid3X3,
    href: "/dashboard?view=quadrant",
  },
  {
    id: "trend",
    label: "趋势分析",
    icon: TrendingUp,
    href: "/dashboard?view=trend",
  },
  {
    id: "ppt",
    label: "PPT构建器",
    icon: FileText,
    href: "/analysis",
  },
  {
    id: "import",
    label: "数据导入",
    icon: Upload,
    href: "/upload",
  },
];

export default function ModuleNav() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.id === "overview" && pathname === "/dashboard") {
      return true;
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <nav className="app-sidebar">
      {/* Logo 区域 */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-[hsl(var(--border))]">
        <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-[hsl(var(--foreground))]">SNS Analytics</span>
        </div>
      </div>

      {/* 导航列表 */}
      <div className="flex-1 py-4">
        <div className="px-4 mb-2">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] px-2">菜单</span>
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "nav-item",
                  active && "active"
                )}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 底部设置 */}
      <div className="border-t border-[hsl(var(--border))] p-4">
        <Link
          href="/settings"
          className="nav-item"
        >
          <Settings className="nav-icon" />
          <span>设置</span>
        </Link>
      </div>
    </nav>
  );
}

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
    <nav className="fixed left-0 top-0 z-30 h-screen w-[220px] border-r border-[#E8ECF1] bg-white overflow-y-auto">
      <div className="flex h-full flex-col">
        {/* Logo 区域 */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] flex items-center justify-center shadow-lg shadow-[#6C5CE7]/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-[#1A1D23]">SNS</span>
            <span className="ml-1 text-xs font-medium text-[#5A6170]">Analytics</span>
          </div>
        </div>

        {/* 导航列表 */}
        <div className="flex-1 px-3">
          <div className="mb-3 px-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6170]">
              导航菜单
            </span>
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
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-[#6C5CE7]/10 to-[#a29bfe]/5 text-[#6C5CE7]"
                      : "text-[#5A6170] hover:bg-[#F5F7FA] hover:text-[#1A1D23]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                      active
                        ? "bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] text-white shadow-md shadow-[#6C5CE7]/25"
                        : "bg-[#F5F7FA] text-[#9AA0AB] group-hover:bg-[#EEF1F5] group-hover:text-[#5A6170]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 底部设置 */}
        <div className="border-t border-[#E8ECF1] p-4">
          <Link
            href="/settings"
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#5A6170] hover:bg-[#F5F7FA] hover:text-[#1A1D23] transition-all duration-200"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F7FA] text-[#9AA0AB] group-hover:bg-[#EEF1F5] group-hover:text-[#5A6170] transition-all">
              <Settings className="h-4 w-4" />
            </div>
            <span className="truncate">设置</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

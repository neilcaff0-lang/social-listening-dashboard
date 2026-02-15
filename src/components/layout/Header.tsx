"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-neutral-800 dark:bg-neutral-950/95 dark:supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            SNS Analytics
          </span>
        </Link>

        {/* 右侧工具栏 */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle size="sm" />
        </div>
      </div>
    </header>
  );
}

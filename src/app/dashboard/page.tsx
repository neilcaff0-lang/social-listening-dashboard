"use client";

import { useDataStore } from "@/store/useDataStore";
import Header from "@/components/layout/Header";
import ModuleNav from "@/components/layout/ModuleNav";
import FilterBar from "@/components/layout/FilterBar";
import MainContent from "@/components/layout/MainContent";

export default function DashboardPage() {
  const { rawData } = useDataStore();
  const hasData = rawData.length > 0;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* 顶部导航栏 */}
      <Header />

      <div className="flex">
        {/* 左侧模块导航 */}
        <ModuleNav />

        {/* 右侧内容区 */}
        <div className="flex flex-1 flex-col transition-all md:ml-56">
          {/* 顶部筛选栏 */}
          <FilterBar />

          {/* 主内容区 */}
          <MainContent />
        </div>
      </div>
    </div>
  );
}

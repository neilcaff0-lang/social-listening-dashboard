"use client";

import ModuleNav from "@/components/layout/ModuleNav";
import TopBar from "@/components/layout/Header";
import FilterBar from "@/components/layout/FilterBar";
import MainContent from "@/components/layout/MainContent";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* 左侧导航 - fixed */}
      <ModuleNav />

      {/* 右侧内容区 - 偏移侧边栏宽度 */}
      <div style={{ marginLeft: '220px' }} className="min-h-screen">
        {/* 顶部栏 */}
        <TopBar />

        {/* 筛选栏 */}
        <FilterBar />

        {/* 主内容区 */}
        <MainContent />
      </div>
    </div>
  );
}

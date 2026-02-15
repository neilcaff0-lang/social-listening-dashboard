"use client";

import Header from "@/components/layout/Header";
import ModuleNav from "@/components/layout/ModuleNav";
import PPTBuilder from "@/components/analysis/PPTBuilder";

export default function AnalysisPage() {
  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* 顶部导航栏 */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧模块导航 */}
        <ModuleNav />

        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden md:ml-56">
          {/* PPT构建器 */}
          <PPTBuilder />
        </div>
      </div>
    </div>
  );
}

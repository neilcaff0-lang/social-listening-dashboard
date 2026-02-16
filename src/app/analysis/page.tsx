"use client";

import ModuleNav from "@/components/layout/ModuleNav";
import TopBar from "@/components/layout/TopBar";
import PPTBuilder from "@/components/analysis/PPTBuilder";

export default function AnalysisPage() {
  return (
    <div className="app-layout bg-[hsl(var(--background))]">
      {/* 左侧导航 */}
      <ModuleNav />

      {/* 右侧内容区 */}
      <div className="app-main">
        {/* 顶部栏 */}
        <TopBar />

        {/* PPT构建器 */}
        <PPTBuilder />
      </div>
    </div>
  );
}

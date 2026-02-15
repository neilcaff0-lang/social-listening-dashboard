"use client";

import ModuleNav from "@/components/layout/ModuleNav";
import TopBar from "@/components/layout/Header";
import PPTBuilder from "@/components/analysis/PPTBuilder";

export default function AnalysisPage() {
  return (
    <div className="h-screen bg-[#F5F7FA] overflow-hidden">
      {/* 左侧导航 */}
      <ModuleNav />

      {/* 右侧内容区 */}
      <div style={{ marginLeft: '220px' }} className="h-screen flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <TopBar />

        {/* PPT构建器 */}
        <PPTBuilder />
      </div>
    </div>
  );
}

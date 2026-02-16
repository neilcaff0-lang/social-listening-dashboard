"use client";

import ModuleNav from "@/components/layout/ModuleNav";
import TopBar from "@/components/layout/TopBar";
import FilterBar from "@/components/layout/FilterBar";
import MainContent from "@/components/layout/MainContent";

export default function DashboardPage() {
  return (
    <div className="app-layout bg-[hsl(var(--background))]">
      <ModuleNav />
      <div className="app-main">
        <TopBar />
        <FilterBar />
        <MainContent />
      </div>
    </div>
  );
}

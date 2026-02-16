'use client';

import { useDataStore } from '@/store/useDataStore';
import { Checkbox } from '@/components/ui/Checkbox';

export default function CategoryFilter() {
  const { categories, filters, pendingFilters, setPendingFilters } = useDataStore();

  // 使用 pendingFilters 或当前 filters 来显示状态
  const displayFilters = pendingFilters ?? filters;
  const selectedCategories = displayFilters.categories;

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    if (checked) {
      setPendingFilters({ categories: [...selectedCategories, categoryName] });
    } else {
      setPendingFilters({ categories: selectedCategories.filter((c) => c !== categoryName) });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setPendingFilters({ categories: categories.map((c) => c.name) });
    } else {
      setPendingFilters({ categories: [] });
    }
  };

  const allSelected = selectedCategories.length === categories.length && categories.length > 0;
  const someSelected = selectedCategories.length > 0 && !allSelected;

  return (
    <div className="space-y-2">
      <label className="filter-label">品类筛选</label>
      <div className="filter-panel">
        {categories.length > 0 ? (
          <div className="space-y-3">
            {/* 全选复选框 */}
            <Checkbox
              label={`全选 (${categories.length})`}
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={handleSelectAll}
            />
            <div className="divider" />
            {/* 品类列表 */}
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {categories.map((category) => (
                <Checkbox
                  key={category.id}
                  label={category.name}
                  checked={selectedCategories.includes(category.name)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.name, checked ?? false)
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">暂无品类数据</p>
        )}
      </div>
    </div>
  );
}

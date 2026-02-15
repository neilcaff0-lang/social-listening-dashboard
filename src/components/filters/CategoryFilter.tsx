'use client';

import { useDataStore } from '@/store/useDataStore';
import { Checkbox } from '@/components/ui/Checkbox';

export default function CategoryFilter() {
  const { categories, filters, setPendingFilters } = useDataStore();

  const selectedCategories = filters.categories;

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
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#5A6170]">品类筛选</label>
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-3">
        {categories.length > 0 ? (
          <div className="space-y-2">
            {/* 全选复选框 */}
            <Checkbox
              label={`全选 (${categories.length})`}
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={handleSelectAll}
            />
            <div className="border-t border-[#E8ECF1] pt-2" />
            {/* 品类列表 */}
            <div className="max-h-40 space-y-1.5 overflow-y-auto">
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
          <p className="text-sm text-[#9AA0AB]">暂无品类数据</p>
        )}
      </div>
    </div>
  );
}

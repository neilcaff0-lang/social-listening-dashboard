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
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        品类筛选
      </h3>
      <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        {categories.length > 0 ? (
          <div className="space-y-2">
            {/* 全选复选框 */}
            <Checkbox
              label={`全选 (${categories.length})`}
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={handleSelectAll}
            />
            <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700" />
            {/* 品类列表 */}
            <div className="max-h-48 space-y-2 overflow-y-auto">
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
          <p className="text-sm text-neutral-500">暂无品类数据</p>
        )}
      </div>
    </div>
  );
}

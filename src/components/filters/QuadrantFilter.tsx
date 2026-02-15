'use client';

import { useDataStore } from '@/store/useDataStore';
import { Checkbox } from '@/components/ui/Checkbox';

// 象限配置
const QUADRANTS = [
  {
    id: '第一象限',
    label: '第一象限',
    description: '高声量高增长',
    color: 'bg-green-500',
  },
  {
    id: '第二象限',
    label: '第二象限',
    description: '低声量高增长',
    color: 'bg-blue-500',
  },
  {
    id: '第三象限',
    label: '第三象限',
    description: '低声量低增长',
    color: 'bg-gray-500',
  },
  {
    id: '第四象限',
    label: '第四象限',
    description: '高声量低增长',
    color: 'bg-orange-500',
  },
];

export default function QuadrantFilter() {
  const { filters, setPendingFilters } = useDataStore();

  const selectedQuadrants = filters.quadrants;

  const handleQuadrantChange = (quadrantId: string, checked: boolean) => {
    if (checked) {
      setPendingFilters({ quadrants: [...selectedQuadrants, quadrantId] });
    } else {
      setPendingFilters({ quadrants: selectedQuadrants.filter((q) => q !== quadrantId) });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setPendingFilters({ quadrants: QUADRANTS.map((q) => q.id) });
    } else {
      setPendingFilters({ quadrants: [] });
    }
  };

  const allSelected =
    selectedQuadrants.length === QUADRANTS.length && QUADRANTS.length > 0;
  const someSelected = selectedQuadrants.length > 0 && !allSelected;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        象限筛选
      </h3>
      <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        <div className="space-y-2">
          {/* 全选 */}
          <Checkbox
            label="全选"
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={handleSelectAll}
          />
          <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700" />

          {/* 象限列表 */}
          <div className="space-y-2">
            {QUADRANTS.map((quadrant) => (
              <div
                key={quadrant.id}
                className="flex items-start gap-2 rounded p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <Checkbox
                  label={quadrant.label}
                  checked={selectedQuadrants.includes(quadrant.id)}
                  onCheckedChange={(checked) =>
                    handleQuadrantChange(quadrant.id, checked ?? false)
                  }
                />
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500">
                    {quadrant.description}
                  </span>
                  <span
                    className={`mt-0.5 h-2 w-2 rounded-full ${quadrant.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

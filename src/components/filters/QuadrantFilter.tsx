'use client';

import { useDataStore } from '@/store/useDataStore';
import { Checkbox } from '@/components/ui/Checkbox';

// 象限配置
const QUADRANTS = [
  {
    id: '第一象限',
    label: '第一象限',
    description: '高声量高增长',
    color: 'bg-[hsl(var(--success))]',
  },
  {
    id: '第二象限',
    label: '第二象限',
    description: '低声量高增长',
    color: 'bg-[hsl(var(--primary))]',
  },
  {
    id: '第三象限',
    label: '第三象限',
    description: '低声量低增长',
    color: 'bg-[hsl(var(--muted-foreground))]',
  },
  {
    id: '第四象限',
    label: '第四象限',
    description: '高声量低增长',
    color: 'bg-[hsl(var(--warning))]',
  },
];

export default function QuadrantFilter() {
  const { filters, pendingFilters, setPendingFilters } = useDataStore();

  // 使用 pendingFilters 或当前 filters 来显示状态
  const displayFilters = pendingFilters ?? filters;
  const selectedQuadrants = displayFilters.quadrants;

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
      <label className="filter-label">象限筛选</label>
      <div className="filter-panel">
        <div className="space-y-3">
          {/* 全选 */}
          <Checkbox
            label="全选"
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={handleSelectAll}
          />
          <div className="divider" />

          {/* 象限列表 */}
          <div className="space-y-2">
            {QUADRANTS.map((quadrant) => (
              <div
                key={quadrant.id}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[hsl(var(--accent))] transition-colors"
              >
                <Checkbox
                  label={quadrant.label}
                  checked={selectedQuadrants.includes(quadrant.id)}
                  onCheckedChange={(checked) =>
                    handleQuadrantChange(quadrant.id, checked ?? false)
                  }
                />
                <span className="text-[11px] text-[hsl(var(--muted-foreground))] ml-auto">
                  {quadrant.description}
                </span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${quadrant.color}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useDataStore } from '@/store/useDataStore';
import { Checkbox } from '@/components/ui/Checkbox';

// 象限配置
const QUADRANTS = [
  {
    id: '第一象限',
    label: '第一象限',
    description: '高声量高增长',
    color: 'bg-[#00C48C]',
  },
  {
    id: '第二象限',
    label: '第二象限',
    description: '低声量高增长',
    color: 'bg-[#6C5CE7]',
  },
  {
    id: '第三象限',
    label: '第三象限',
    description: '低声量低增长',
    color: 'bg-[#9AA0AB]',
  },
  {
    id: '第四象限',
    label: '第四象限',
    description: '高声量低增长',
    color: 'bg-[#FAAD14]',
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
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#5A6170]">象限筛选</label>
      <div className="rounded-xl border border-[#E8ECF1] bg-white p-3">
        <div className="space-y-2">
          {/* 全选 */}
          <Checkbox
            label="全选"
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={handleSelectAll}
          />
          <div className="border-t border-[#E8ECF1] pt-2" />

          {/* 象限列表 */}
          <div className="space-y-1.5">
            {QUADRANTS.map((quadrant) => (
              <div
                key={quadrant.id}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[#F5F7FA] transition-colors"
              >
                <Checkbox
                  label={quadrant.label}
                  checked={selectedQuadrants.includes(quadrant.id)}
                  onCheckedChange={(checked) =>
                    handleQuadrantChange(quadrant.id, checked ?? false)
                  }
                />
                <span className="text-[10px] text-[#9AA0AB] ml-auto">
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

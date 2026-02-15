'use client';

import { cn } from '@/components/ui/Button';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800',
        className
      )}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
    >
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  );
}

interface SkeletonStatCardProps {
  className?: string;
}

export function SkeletonStatCard({ className }: SkeletonStatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonChartProps {
  className?: string;
}

export function SkeletonChart({ className }: SkeletonChartProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
    >
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="mt-4 h-[300px] w-full rounded-lg" />
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
    >
      {/* Header */}
      <div className="flex gap-4 border-b border-neutral-200 p-4 dark:border-neutral-800">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex gap-4 border-b border-neutral-100 p-4 last:border-0 dark:border-neutral-800/50"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonDashboardProps {
  className?: string;
}

export function SkeletonDashboard({ className }: SkeletonDashboardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={`stat-${i}`} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Full Width Chart */}
      <SkeletonChart />

      {/* Table */}
      <SkeletonTable rows={5} columns={6} />
    </div>
  );
}

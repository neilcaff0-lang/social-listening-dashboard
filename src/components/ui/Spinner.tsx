'use client';

import { cn } from '@/components/ui/Button';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-neutral-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-500',
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingOverlayProps {
  children: React.ReactNode;
  isLoading: boolean;
  text?: string;
  className?: string;
}

export function LoadingOverlay({
  children,
  isLoading,
  text = '加载中...',
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80">
          <Spinner size="lg" />
          {text && (
            <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingCard({
  title = '正在加载',
  description = '请稍候...',
  className,
}: LoadingCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-12 dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
    >
      <Spinner size="lg" />
      <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-neutral-50">
        {title}
      </h3>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {description}
      </p>
    </div>
  );
}

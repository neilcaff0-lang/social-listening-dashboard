import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="flex flex-col items-center">
        <Spinner size="lg" />
        <h2 className="mt-4 text-lg font-medium text-neutral-900 dark:text-neutral-50">
          页面加载中...
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          请稍候
        </p>
      </div>
    </div>
  );
}

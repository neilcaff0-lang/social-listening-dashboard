'use client';

import { XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/components/ui/Button';

interface ErrorAlertProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function ErrorAlert({
  title,
  message,
  type = 'error',
  onClose,
  className,
  children,
}: ErrorAlertProps) {
  const styles = {
    error: {
      container: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-800 dark:text-red-300',
      message: 'text-red-700 dark:text-red-400',
    },
    warning: {
      container: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-300',
      message: 'text-yellow-700 dark:text-yellow-400',
    },
    info: {
      container: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-300',
      message: 'text-blue-700 dark:text-blue-400',
    },
  };

  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[type];
  const style = styles[type];

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4',
        style.container,
        className
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', style.icon)} />
        <div className="flex-1">
          {title && (
            <h3 className={cn('mb-1 font-medium', style.title)}>
              {title}
            </h3>
          )}
          <p className={cn('text-sm', style.message)}>{message}</p>
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'flex-shrink-0 rounded p-1 hover:bg-black/5 dark:hover:bg-white/5',
              style.icon
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface FileUploadErrorProps {
  error: string | null;
  onClear?: () => void;
}

export function FileUploadError({ error, onClear }: FileUploadErrorProps) {
  if (!error) return null;

  return (
    <ErrorAlert
      title="文件上传失败"
      message={error}
      type="error"
      onClose={onClear}
      className="mt-4"
    />
  );
}

interface DataParseErrorProps {
  error: string | null;
  details?: string[];
  onClear?: () => void;
}

export function DataParseError({ error, details, onClear }: DataParseErrorProps) {
  if (!error) return null;

  return (
    <ErrorAlert
      title="数据解析失败"
      message={error}
      type="error"
      onClose={onClear}
      className="mt-4"
    >
      {details && details.length > 0 && (
        <ul className="mt-2 list-inside list-disc text-sm text-red-600 dark:text-red-400">
          {details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      )}
    </ErrorAlert>
  );
}

interface ChartErrorProps {
  error: string | null;
  onRetry?: () => void;
}

export function ChartError({ error, onRetry }: ChartErrorProps) {
  if (!error) return null;

  return (
    <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <AlertTriangle className="mb-2 h-8 w-8 text-yellow-500" />
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          重试
        </button>
      )}
    </div>
  );
}

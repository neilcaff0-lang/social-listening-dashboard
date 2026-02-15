'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/components/ui/Button';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: '浅色' },
    { value: 'dark', icon: Moon, label: '深色' },
    { value: 'system', icon: Monitor, label: '系统' },
  ];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800',
        className
      )}
    >
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center justify-center rounded-md transition-all',
            sizeClasses[size],
            theme === value
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
          )}
          title={label}
          aria-label={`切换到${label}主题`}
        >
          <Icon className={iconSizes[size]} />
        </button>
      ))}
    </div>
  );
}

export function ThemeDropdown({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: '浅色主题' },
    { value: 'dark', icon: Moon, label: '深色主题' },
    { value: 'system', icon: Monitor, label: '跟随系统' },
  ];

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  return (
    <div className={cn('relative group', className)}>
      <button
        className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        aria-label="切换主题"
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{currentTheme?.label}</span>
      </button>

      {/* 下拉菜单 */}
      <div className="absolute right-0 top-full z-50 mt-1 hidden w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg group-hover:block dark:border-neutral-700 dark:bg-neutral-800">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors',
              theme === value
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {theme === value && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

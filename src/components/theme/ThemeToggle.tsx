'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

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
      className={`inline-flex items-center gap-1 rounded-xl bg-[#F1F5F9] p-1 ${className || ''}`}
    >
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            flex items-center justify-center rounded-lg transition-all duration-200
            ${sizeClasses[size]}
            ${theme === value
              ? 'bg-white text-[#6C5CE7] shadow-sm'
              : 'text-[#A0AEC0] hover:text-[#718096]'
            }
          `}
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
  const { theme, setTheme } = useTheme();

  const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: '浅色主题' },
    { value: 'dark', icon: Moon, label: '深色主题' },
    { value: 'system', icon: Monitor, label: '跟随系统' },
  ];

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  return (
    <div className={`relative group ${className || ''}`}>
      <button
        className="flex items-center gap-2 rounded-xl bg-[#F1F5F9] px-3 py-2 text-sm font-medium text-[#4A5568] hover:text-[#0F1419] transition-colors"
        aria-label="切换主题"
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{currentTheme?.label}</span>
      </button>

      {/* 下拉菜单 */}
      <div className="absolute right-0 top-full z-50 mt-1 hidden w-40 rounded-xl border border-[#E2E8F0] bg-white py-1 shadow-lg group-hover:block">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors
              ${theme === value
                ? 'bg-gradient-to-r from-[#6C5CE7]/10 to-[#a29bfe]/5 text-[#6C5CE7]'
                : 'text-[#4A5568] hover:bg-[#F8FAFC] hover:text-[#0F1419]'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            {label}
            {theme === value && (
              <span className="ml-auto text-xs text-[#6C5CE7]">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

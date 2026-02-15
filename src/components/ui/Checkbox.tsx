'use client';

import { InputHTMLAttributes, forwardRef, ChangeEventHandler, useId, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check, Minus } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, onCheckedChange, indeterminate, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      onCheckedChange?.(e.target.checked);
    };

    // 处理 indeterminate 状态
    useEffect(() => {
      const input = document.getElementById(inputId) as HTMLInputElement | null;
      if (input) {
        input.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate, inputId]);

    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            id={inputId}
            checked={checked}
            onChange={handleChange}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-neutral-300 bg-white transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:checked:border-blue-500 dark:checked:bg-blue-500 dark:hover:border-blue-400 dark:focus:ring-blue-400"
            {...props}
          />
          <Check
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white transition-opacity",
              indeterminate ? "opacity-0" : "opacity-0 peer-checked:opacity-100"
            )}
            strokeWidth={3}
          />
          <Minus
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white",
              indeterminate ? "opacity-100" : "opacity-0"
            )}
            strokeWidth={3}
          />
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className="cursor-pointer text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, cn };

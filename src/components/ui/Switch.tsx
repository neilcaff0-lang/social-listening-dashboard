"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: "sm" | "md";
  disabled?: boolean;
}

export function Switch({
  checked,
  onCheckedChange,
  size = "md",
  disabled = false,
}: SwitchProps) {
  const sizeClasses = {
    sm: "w-9 h-5",
    md: "w-11 h-6",
  };

  const thumbSize = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
  };

  const thumbTranslate = {
    sm: checked ? "translate-x-4" : "translate-x-0.5",
    md: checked ? "translate-x-5" : "translate-x-0.5",
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        sizeClasses[size],
        checked ? "bg-blue-600" : "bg-gray-200",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className="sr-only">{checked ? "开启" : "关闭"}</span>
      <span
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          thumbSize[size],
          thumbTranslate[size]
        )}
      />
    </button>
  );
}

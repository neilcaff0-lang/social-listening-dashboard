"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: `
        bg-gradient-to-r from-[#6C5CE7] to-[#a29bfe]
        text-white
        shadow-lg shadow-[#6C5CE7]/25
        hover:shadow-xl hover:shadow-[#6C5CE7]/30
        hover:-translate-y-0.5
        active:translate-y-0 active:shadow-lg
      `,
      secondary: `
        bg-[#F1F5F9]
        text-[#0F1419]
        border border-[#E2E8F0]
        shadow-sm
        hover:bg-[#E2E8F0]
        hover:border-[#CBD5E0]
      `,
      outline: `
        bg-transparent
        text-[#6C5CE7]
        border-2 border-[#6C5CE7]
        hover:bg-[#6C5CE7]/5
        hover:border-[#5B4BD5]
        hover:text-[#5B4BD5]
      `,
      ghost: `
        bg-transparent
        text-[#718096]
        hover:bg-[#F1F5F9]
        hover:text-[#0F1419]
      `,
      danger: `
        bg-[#EF4444]
        text-white
        shadow-lg shadow-red-500/25
        hover:bg-[#DC2626]
        hover:shadow-xl
      `,
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2.5",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-semibold",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, cn };

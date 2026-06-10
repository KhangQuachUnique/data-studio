import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@renderer/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";
type ButtonSize = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-theme-plum text-white shadow-sm hover:bg-theme-ink disabled:bg-theme-mauve/60",
  secondary:
    "bg-theme-cream/85 text-theme-ink ring-1 ring-theme-plum/15 hover:bg-white disabled:text-theme-plum/40",
  ghost:
    "bg-transparent text-theme-plum hover:bg-theme-lilac/30 disabled:text-theme-plum/45",
  danger: "bg-[#B85C6B] text-white hover:bg-[#9F4959] disabled:bg-theme-blush",
  dark: "bg-theme-lilac/70 text-theme-ink ring-1 ring-theme-plum/18 hover:bg-theme-lilac disabled:text-theme-plum/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-8 px-3 text-[0.82rem]",
  md: "min-h-10 px-4 text-[0.9rem]",
  icon: "h-9 w-9 p-0",
};

export function Button({
  children,
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition focus:outline-none focus:ring-2 focus:ring-theme-plum/20 disabled:opacity-70",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}>
      {children}
    </button>
  );
}

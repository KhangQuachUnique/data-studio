import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@renderer/shared/lib/cn";

type BadgeTone = "mint" | "lavender" | "peach" | "blue" | "dark" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, string> = {
  mint: "bg-theme-sage text-theme-ink ring-theme-plum/10",
  lavender: "bg-theme-lilac text-theme-ink ring-theme-plum/15",
  peach: "bg-theme-butter text-theme-ink ring-theme-plum/10",
  blue: "bg-theme-mist text-theme-ink ring-theme-plum/10",
  dark: "bg-theme-plum text-white ring-theme-plum",
  neutral: "bg-theme-cream text-theme-plum ring-theme-plum/15",
};

export function Badge({
  children,
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[0.72rem] font-bold capitalize ring-1",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

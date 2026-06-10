import type { ReactNode } from "react";
import { cn } from "@renderer/shared/lib/cn";

interface EmptyStateProps {
  children: ReactNode;
  className?: string;
  title: string;
}

export function EmptyState({ children, className, title }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-theme-plum/20 bg-white/45 p-5",
        className,
      )}
    >
      <strong className="text-base font-bold text-theme-ink">{title}</strong>
      <p className="mt-1 text-sm text-theme-ink/65">{children}</p>
    </div>
  );
}

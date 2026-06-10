import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@renderer/shared/lib/cn";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "div" | "section" | "article";
}

export function Card({
  as: Component = "div",
  children,
  className,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-lg border border-theme-plum/12 bg-theme-cream/78 shadow-sm backdrop-blur",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

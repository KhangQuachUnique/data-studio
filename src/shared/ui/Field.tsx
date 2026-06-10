import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@renderer/shared/lib/cn";

interface FieldProps {
  children: ReactNode;
  label: string;
}

export function Field({ children, label }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-bold text-theme-ink/80">
      {label}
      {children}
    </label>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 rounded-lg border border-theme-plum/15 bg-white/75 px-3 text-theme-ink outline-none transition placeholder:text-theme-plum/35 focus:border-theme-plum/35 focus:ring-4 focus:ring-theme-lilac/35",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 resize-y rounded-lg border border-theme-plum/15 bg-white/75 px-3 py-2 text-theme-ink outline-none transition placeholder:text-theme-plum/35 focus:border-theme-plum/35 focus:ring-4 focus:ring-theme-lilac/35",
        className,
      )}
      {...props}
    />
  );
}

import type { FormHTMLAttributes, ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "./Button";
import { cn } from "@renderer/shared/lib/cn";

interface DialogProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  description?: string;
  onClose: () => void;
  title: string;
}

export function Dialog({
  children,
  className,
  description,
  onClose,
  title,
  ...props
}: DialogProps) {
  return (
    <div
      aria-labelledby="dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-20 grid place-items-center bg-theme-ink/35 p-5 backdrop-blur-sm"
      role="dialog"
    >
      <form
        className={cn(
          "grid w-full max-w-[440px] gap-4 rounded-lg border border-white/70 bg-theme-cream p-5 shadow-soft-panel",
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-normal" id="dialog-title">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-theme-ink/65">{description}</p>
            ) : null}
          </div>
          <Button aria-label="Close dialog" onClick={onClose} size="icon" variant="secondary">
            <FiX aria-hidden="true" />
          </Button>
        </div>
        {children}
      </form>
    </div>
  );
}

import { cn } from "@/lib/utils";
import React from "react";

export type NeuInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function NeuInput({ className, label, ...props }: NeuInputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <span className="text-sm font-medium text-[var(--color-text-muted)] pl-2">{label}</span>}
      <input
        className={cn(
          "w-full rounded-2xl bg-[var(--color-bg-base)] px-4 py-2 text-[var(--color-text-main)] placeholder-[var(--color-text-muted)]/50",
          "shadow-neu-pressed outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/30 transition-all",
          className
        )}
        {...props}
      />
    </div>
  );
}



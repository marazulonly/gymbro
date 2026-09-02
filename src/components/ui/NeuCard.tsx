import { cn } from "@/lib/utils";
import React from "react";

export type NeuCardProps = React.HTMLAttributes<HTMLDivElement> & {
  inset?: boolean;
};

export function NeuCard({ className, inset, children, ...props }: NeuCardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-[var(--color-bg-base)] text-[var(--color-text-main)] p-6 transition-colors duration-200",
        inset ? "shadow-neu-pressed" : "shadow-neu-flat",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}



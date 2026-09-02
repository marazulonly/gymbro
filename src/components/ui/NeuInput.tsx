import { cn } from "@/lib/utils";
import React from "react";

export type NeuInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function NeuInput({ className, label, ...props }: NeuInputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <span className="text-sm font-medium text-[#718096] pl-2">{label}</span>}
      <input
        className={cn(
          "w-full rounded-2xl bg-[#E0E5EC] px-4 py-2 text-[#2D3748] placeholder-[#718096]/50",
          "shadow-neu-pressed outline-none focus:ring-2 focus:ring-[#4D7CFE]/20 transition-all",
          className
        )}
        {...props}
      />
    </div>
  );
}



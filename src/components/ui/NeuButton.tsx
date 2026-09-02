import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";

export type NeuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "circle";
  isActive?: boolean;
};

export function NeuButton({
  className,
  variant = "secondary",
  isActive = false,
  children,
  ...props
}: NeuButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center justify-center font-medium transition-all duration-200 outline-none",
        "bg-[#E0E5EC] text-[#718096]",
        isActive ? "shadow-neu-pressed text-[#4D7CFE]" : "shadow-neu-flat active:shadow-neu-pressed",
        variant === "circle" ? "rounded-full p-3 shadow-neu-circle" : "rounded-2xl px-6 py-3",
        variant === "primary" && !isActive && "text-[#4D7CFE]",
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}



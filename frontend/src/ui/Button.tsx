import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/ui/cn";

type Variant = "primary" | "ghost" | "subtle";
type Size = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-soft shadow-glow disabled:bg-accent-muted",
  ghost: "text-zinc-300 hover:bg-surface-raised hover:text-white",
  subtle: "bg-surface-raised text-zinc-200 hover:bg-surface-border",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  icon: "h-10 w-10",
};

/** Premium, accessible button primitive used across the toolbar and controls. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "subtle", size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-all duration-150 focus:outline-none focus-visible:ring-2",
        "focus-visible:ring-accent/60 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

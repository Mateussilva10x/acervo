"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          // Variants
          variant === "primary" &&
            "bg-gold text-primary-foreground hover:bg-gold-dark rounded-xl",
          variant === "outline" &&
            "border border-border bg-transparent text-foreground hover:bg-secondary rounded-xl",
          variant === "ghost" &&
            "bg-transparent text-foreground hover:bg-secondary rounded-xl",
          variant === "destructive" &&
            "bg-destructive text-destructive-foreground hover:opacity-90 rounded-xl",
          // Sizes
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-5 text-sm",
          size === "lg" && "h-12 px-8 text-base",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };

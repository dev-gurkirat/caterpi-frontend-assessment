import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = {
  primary: "bg-navy text-white hover:bg-navy-deep",
  secondary: "border border-border bg-surface text-navy hover:bg-surface-muted",
  copper: "bg-copper text-white hover:bg-copper-hover",
  ghost: "border border-white/45 bg-white/10 text-white hover:bg-white/15",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClassName(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-10 items-center justify-center rounded-full px-3.5 py-2 text-sm font-semibold transition-colors sm:px-4 sm:py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:opacity-60",
    buttonVariants[variant],
    className,
  );
}

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={buttonClassName(variant, className)}
    >
      {children}
    </button>
  );
}

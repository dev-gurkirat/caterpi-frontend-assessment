import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
  as?: "article" | "div" | "section";
  muted?: boolean;
};

export function Card({
  children,
  className,
  as: Tag = "div",
  muted = false,
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-border/40 bg-surface p-4 sm:p-6",
        muted && "border-dashed",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

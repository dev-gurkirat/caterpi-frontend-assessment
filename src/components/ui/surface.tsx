import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SurfaceProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
};

export function Surface({
  children,
  className,
  as: Tag = "section",
}: SurfaceProps) {
  return (
    <Tag
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

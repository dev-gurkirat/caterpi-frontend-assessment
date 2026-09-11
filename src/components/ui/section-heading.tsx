import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight text-navy">
          {title}
        </h2>
        {children}
      </div>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-muted">{description}</p>
      ) : null}
    </div>
  );
}

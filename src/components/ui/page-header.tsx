import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-4">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-[2.15rem] sm:leading-[1.15]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-xl text-base leading-7 text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}

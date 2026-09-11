import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card muted className={cn(className)}>
      {icon ? (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-navy/10 text-navy">
          {icon}
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="mb-4 h-1.5 w-10 rounded-full bg-copper/50"
        />
      )}
      <div className="space-y-2">
        <h2 className="font-display text-lg font-semibold tracking-tight text-navy">
          {title}
        </h2>
        <p className="max-w-xl text-sm leading-6 text-muted">{description}</p>
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

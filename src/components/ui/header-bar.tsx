import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type HeaderBarProps = {
  left: ReactNode;
  right?: ReactNode;
  className?: string;
};

export function HeaderBar({ left, right, className }: HeaderBarProps) {
  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-30 border-b border-border bg-surface shadow-card",
          className,
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
          <div className="min-w-0">{left}</div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </header>
      <div className="h-16 shrink-0" aria-hidden="true" />
    </>
  );
}

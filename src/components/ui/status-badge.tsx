"use client";

import type { VerificationStatus } from "@/lib/domain/types";
import { getVerificationStatusLabel } from "@/lib/domain/verification";
import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<VerificationStatus, string> = {
  verified: "bg-verified/10 text-verified",
  not_attempted: "bg-surface-muted text-navy",
};

type StatusBadgeProps = {
  status: VerificationStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        STATUS_STYLES[status],
        className,
      )}
    >
      {getVerificationStatusLabel(status)}
    </span>
  );
}

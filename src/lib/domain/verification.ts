import type { VerificationStatus } from "@/lib/domain/types";

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  verified: "Verified",
  not_attempted: "Not attempted",
};

export function getVerificationStatusLabel(
  status: VerificationStatus,
): string {
  return VERIFICATION_STATUS_LABELS[status];
}

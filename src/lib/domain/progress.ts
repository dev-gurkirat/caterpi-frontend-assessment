import type { PublicCapability } from "@/lib/domain/types";

/**
 * Overall verification progress as a 0-100 percentage.
 * Incomplete records return null instead of breaking the UI.
 */
export function calculateOverallProgress(
  capabilities: PublicCapability[],
): number | null {
  if (capabilities.length === 0) {
    return null;
  }

  const levels = capabilities.flatMap((capability) => capability.levels);

  if (levels.length > 0) {
    const verifiedCount = levels.filter(
      (level) => level.status === "verified",
    ).length;
    return Math.round((verifiedCount / levels.length) * 100);
  }

  const scores = capabilities
    .map((capability) => capability.score)
    .filter((score): score is number => score !== null);

  if (scores.length === 0) {
    return null;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round(total / scores.length);
}

export function countVerifiedLevels(capabilities: PublicCapability[]): number {
  return capabilities.reduce(
    (count, capability) =>
      count +
      capability.levels.filter((level) => level.status === "verified").length,
    0,
  );
}

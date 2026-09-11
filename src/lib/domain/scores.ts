/**
 * Keep score-scale assumptions in one place.
 * The live review may change scores from 0-100 to 0-5.
 */
const DEFAULT_SCORE_MIN = 0;
const DEFAULT_SCORE_MAX = 100;

export function clampScore(
  score: number,
  min = DEFAULT_SCORE_MIN,
  max = DEFAULT_SCORE_MAX,
): number {
  return Math.min(max, Math.max(min, score));
}

export function formatCapabilityScore(score: number | null): string {
  if (score === null) {
    return "Not scored";
  }

  return `${Math.round(clampScore(score))}%`;
}

export function scoreToChartRatio(score: number | null): number {
  if (score === null) {
    return 0;
  }

  return clampScore(score) / DEFAULT_SCORE_MAX;
}

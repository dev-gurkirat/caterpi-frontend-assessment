import type { DataResult } from "@/lib/data/results";

const VISIBILITY_SAVE_ERROR =
  "Could not update sharing. Your previous setting was kept.";

export function applyVisibilitySaveResult(
  requested: boolean,
  result: DataResult<{ isPublic: boolean }>,
): { isPublic: boolean; error: string | null } {
  if (result.status === "ok") {
    return { isPublic: result.data.isPublic, error: null };
  }

  return {
    isPublic: !requested,
    error:
      result.status === "unavailable" ? result.message : VISIBILITY_SAVE_ERROR,
  };
}

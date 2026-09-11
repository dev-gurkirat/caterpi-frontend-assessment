"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { savePassportVisibility } from "@/lib/data/visibility-actions";
import { applyVisibilitySaveResult } from "@/lib/data/visibility-state";
import { cn } from "@/lib/cn";

type VisibilityToggleProps = {
  initialIsPublic: boolean;
};

export function VisibilityToggle({ initialIsPublic }: VisibilityToggleProps) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const nextValue = !isPublic;
    setIsPublic(nextValue);
    setIsSaving(true);
    setError(null);

    const result = await savePassportVisibility(nextValue);
    const nextState = applyVisibilitySaveResult(nextValue, result);

    setIsPublic(nextState.isPublic);
    setError(nextState.error);
    setIsSaving(false);

    if (nextState.error) {
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        role="switch"
        aria-checked={isPublic}
        aria-busy={isSaving}
        disabled={isSaving}
        onClick={handleToggle}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full ring-1 ring-border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:opacity-70",
          isPublic ? "bg-copper" : "bg-surface-muted",
        )}
      >
        <span className="sr-only">
          {isPublic ? "Make profile private" : "Make profile public"}
        </span>
        <span
          className={cn(
            "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            isPublic && "translate-x-5",
          )}
        />
      </button>
      <p className="text-xs text-muted">
        {isSaving ? "Saving…" : isPublic ? "Public" : "Private"}
      </p>
      {error ? (
        <p className="max-w-[16rem] text-left text-xs text-danger sm:text-right" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

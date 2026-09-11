import type { LevelVerification } from "@/lib/domain/types";
import { cn } from "@/lib/cn";

type LevelPipsProps = {
  levels: LevelVerification[];
};

export function LevelPips({ levels }: LevelPipsProps) {
  return (
    <ul className="flex items-center gap-1.5" aria-label="Verification levels">
      {levels.map((level) => {
        const verified = level.status === "verified";

        return (
          <li
            key={level.level}
            title={`Level ${level.level}: ${verified ? "Verified" : "Not attempted"}`}
            aria-label={`Level ${level.level}: ${verified ? "Verified" : "Not attempted"}`}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              verified
                ? "bg-verified text-white"
                : "bg-surface-muted text-muted",
            )}
          >
            {level.level}
          </li>
        );
      })}
    </ul>
  );
}

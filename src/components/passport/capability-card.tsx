import Link from "next/link";
import { LevelPips } from "@/components/passport/level-pips";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/domain/routes";
import { formatCapabilityScore } from "@/lib/domain/scores";
import type { PublicCapability } from "@/lib/domain/types";

type CapabilityCardProps = {
  capability: PublicCapability & { id?: string };
  href?: string;
};

export function CapabilityCard({
  capability,
  href,
}: CapabilityCardProps) {
  const verifiedCount = capability.levels.filter(
    (level) => level.status === "verified",
  ).length;
  const highestVerified = [...capability.levels]
    .reverse()
    .find((level) => level.status === "verified");

  return (
    <Card as="article" className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-display text-lg font-semibold tracking-tight break-words text-navy">
          {capability.name}
        </h3>
        <p className="shrink-0 font-display text-xl font-semibold tabular-nums text-navy">
          {formatCapabilityScore(capability.score)}
        </p>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">
        {verifiedCount} of {capability.levels.length} levels verified
        {highestVerified
          ? ` · highest at level ${highestVerified.level}`
          : " · none verified yet"}
      </p>
      <div className="mt-4">
        <LevelPips levels={capability.levels} />
      </div>
      {href || capability.id ? (
        <Link
          href={href ?? ROUTES.capability(capability.id ?? "")}
          className="mt-auto pt-5 text-sm font-semibold text-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
        >
          View details
        </Link>
      ) : null}
    </Card>
  );
}

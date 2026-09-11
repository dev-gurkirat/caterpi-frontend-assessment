import type { Metadata } from "next";
import { CapabilityCard } from "@/components/passport/capability-card";
import { CapabilityRadar } from "@/components/passport/capability-radar";
import { IdentityPanel } from "@/components/passport/identity-panel";
import {
  PassportEmptyState,
  PassportErrorState,
  PassportSignInState,
} from "@/components/passport/passport-states";
import { VisibilityToggle } from "@/components/passport/visibility-toggle";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { getMyPassport } from "@/lib/data/passport";
import { ROUTES } from "@/lib/domain/routes";
import { countVerifiedLevels } from "@/lib/domain/progress";

export const metadata: Metadata = {
  title: "My Skills Passport",
};

export default async function PassportPage() {
  const result = await getMyPassport();

  if (result.status === "unauthenticated") {
    return <PassportSignInState />;
  }

  if (result.status === "unavailable") {
    return <PassportErrorState message={result.message} />;
  }

  if (result.status !== "ok") {
    return <PassportEmptyState />;
  }

  const passport = result.data;
  const progressPercent = passport.overallProgress ?? 0;
  const verifiedCount = countVerifiedLevels(passport.capabilities);

  return (
    <div className="space-y-6 sm:space-y-8">
      <IdentityPanel
        eyebrow="My skills passport"
        title={passport.displayName}
        description={passport.role}
        stats={[
          { value: String(verifiedCount), label: "Verified" },
          { value: String(passport.capabilities.length), label: "Capabilities" },
          {
            value:
              passport.overallProgress === null
                ? "—"
                : `${passport.overallProgress}%`,
            label: "Progress",
          },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <Card as="article" className="flex flex-col">
          <h2 className="font-display text-xl font-semibold tracking-tight text-navy">
            Capability scores
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Capabilities without a score stay at the centre.
          </p>
          <div className="mt-6 flex flex-1 items-center justify-center">
            <CapabilityRadar capabilities={passport.capabilities} />
          </div>
        </Card>

        <div className="grid gap-4">
          <Card as="article">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold tracking-tight text-navy">
                  Public profile
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {passport.isPublic
                    ? "Anyone with the link can view your public profile."
                    : "Keep this private, or share a public profile when you are ready."}
                </p>
                {passport.isPublic ? (
                  <ButtonLink
                    href={ROUTES.publicPassport(passport.username)}
                    variant="secondary"
                    className="mt-4 w-full sm:w-auto"
                  >
                    View public profile
                  </ButtonLink>
                ) : null}
              </div>
              <VisibilityToggle initialIsPublic={passport.isPublic} />
            </div>
          </Card>
          <Card as="article" className="flex flex-col justify-center">
            <ProgressMeter
              label="Overall verification"
              valueLabel={
                passport.overallProgress === null
                  ? "Not available"
                  : `${passport.overallProgress}%`
              }
              percent={progressPercent}
            />
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold tracking-tight text-navy">
          Capabilities
        </h2>
        {passport.capabilities.length === 0 ? (
          <EmptyState
            title="No capabilities yet"
            description="Your capabilities will appear here once they have been added."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {passport.capabilities.map((capability) => (
              <CapabilityCard
                key={capability.id}
                capability={capability}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

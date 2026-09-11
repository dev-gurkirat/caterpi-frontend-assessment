import type { Metadata } from "next";
import { CapabilityCard } from "@/components/passport/capability-card";
import { CapabilityRadar } from "@/components/passport/capability-radar";
import { IdentityPanel } from "@/components/passport/identity-panel";
import { PassportErrorState } from "@/components/passport/passport-states";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { containsPrivatePublicFields } from "@/lib/data/mappers";
import { getPublicPassport } from "@/lib/data/passport";
import {
  calculateOverallProgress,
  countVerifiedLevels,
} from "@/lib/domain/progress";
import type { PublicPassport } from "@/lib/domain/types";

type PublicPassportPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: PublicPassportPageProps): Promise<Metadata> {
  const { username } = await params;
  const result = await getPublicPassport(username);

  if (result.status !== "ok") {
    return { title: "Public passport" };
  }

  return { title: `${result.data.displayName} · Public passport` };
}

export default async function PublicPassportPage({
  params,
}: PublicPassportPageProps) {
  const { username } = await params;
  const result = await getPublicPassport(username);

  if (result.status === "unavailable") {
    return <PassportErrorState message={result.message} />;
  }

  if (result.status !== "ok") {
    return (
      <EmptyState
        title="This passport is not available"
        description="The profile may be private, or the link may be incorrect."
      />
    );
  }

  const passport = result.data;

  if (containsPrivatePublicFields(passport)) {
    return (
      <EmptyState
        title="This passport is not available"
        description="The profile may be private, or the link may be incorrect."
      />
    );
  }

  return <PublicPassportView passport={passport} />;
}

function PublicPassportView({ passport }: { passport: PublicPassport }) {
  const progress = calculateOverallProgress(passport.capabilities);
  const verifiedCount = countVerifiedLevels(passport.capabilities);

  return (
    <div className="space-y-6 sm:space-y-8">
      <IdentityPanel
        eyebrow="Public passport"
        title={passport.displayName}
        description={passport.role}
        stats={[
          { value: String(verifiedCount), label: "Verified" },
          {
            value: String(passport.capabilities.length),
            label: "Capabilities",
          },
          {
            value: progress === null ? "—" : `${progress}%`,
            label: "Progress",
          },
        ]}
      />

      <section>
        <Card as="article">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-semibold tracking-tight text-navy">
                Capability scores
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Capabilities without a score stay at the centre.
              </p>
              <div className="mt-6">
                <ProgressMeter
                  label="Overall verification"
                  valueLabel={
                    progress === null ? "Not available" : `${progress}%`
                  }
                  percent={progress ?? 0}
                />
              </div>
            </div>
            <div className="flex justify-center lg:w-[300px] lg:shrink-0">
              <CapabilityRadar capabilities={passport.capabilities} />
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold tracking-tight text-navy">
          Capabilities
        </h2>
        {passport.capabilities.length === 0 ? (
          <EmptyState
            title="No capabilities yet"
            description="Public capabilities will appear here once they have been added."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {passport.capabilities.map((capability) => (
              <CapabilityCard
                key={capability.name}
                capability={capability}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

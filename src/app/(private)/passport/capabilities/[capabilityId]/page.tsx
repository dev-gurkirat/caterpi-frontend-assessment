import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PassportEmptyState,
  PassportErrorState,
  PassportSignInState,
} from "@/components/passport/passport-states";
import { IdentityPanel } from "@/components/passport/identity-panel";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCapabilityAssessments, getMyPassport } from "@/lib/data/passport";
import { formatSubmittedDate, formatVerificationLevel } from "@/lib/domain/labels";
import { ROUTES } from "@/lib/domain/routes";
import { formatCapabilityScore } from "@/lib/domain/scores";
import type { AssessmentSummary } from "@/lib/domain/types";

export const metadata: Metadata = {
  title: "Capability detail",
};

export default async function CapabilityDetailPage({
  params,
}: {
  params: Promise<{ capabilityId: string }>;
}) {
  const { capabilityId } = await params;
  const [passportResult, assessmentsResult] = await Promise.all([
    getMyPassport(),
    getCapabilityAssessments(capabilityId),
  ]);

  if (passportResult.status === "unauthenticated") {
    return <PassportSignInState />;
  }

  if (passportResult.status === "unavailable") {
    return <PassportErrorState message={passportResult.message} />;
  }

  if (passportResult.status !== "ok") {
    return <PassportEmptyState />;
  }

  const capability = passportResult.data.capabilities.find(
    (item) => item.id === capabilityId,
  );

  if (!capability) {
    notFound();
  }

  if (assessmentsResult.status === "unauthenticated") {
    return <PassportSignInState />;
  }

  const verifiedCount = capability.levels.filter(
    (level) => level.status === "verified",
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <IdentityPanel
        eyebrow="Capability"
        title={capability.name}
        description="Verification levels and assessment history"
        stats={[
          {
            value: formatCapabilityScore(capability.score),
            label: "Score",
          },
          {
            value: `${verifiedCount}/${capability.levels.length}`,
            label: "Verified",
          },
          {
            value:
              assessmentsResult.status === "ok"
                ? String(assessmentsResult.data.length)
                : "—",
            label: "Assessments",
          },
        ]}
        actions={
          <ButtonLink href={ROUTES.passport} variant="ghost">
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to passport</span>
          </ButtonLink>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {capability.levels.map((level) => (
          <Card
            key={level.level}
            as="article"
            className="flex items-center justify-between gap-3"
          >
            <p className="font-display text-lg font-semibold text-navy">
              Level {level.level}
            </p>
            <StatusBadge status={level.status} />
          </Card>
        ))}
      </section>

      {assessmentsResult.status === "unavailable" ? (
        <PassportErrorState message={assessmentsResult.message} />
      ) : assessmentsResult.status === "ok" ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-navy">
            Assessment history
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {assessmentsResult.data.map((assessment) => (
              <AssessmentHistoryCard
                key={assessment.id}
                assessment={assessment}
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title="No assessments yet"
          description="Completed assessments will appear here."
        />
      )}
    </div>
  );
}

function AssessmentHistoryCard({
  assessment,
}: {
  assessment: AssessmentSummary;
}) {
  return (
    <Card as="article" className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold tracking-tight text-navy">
          {assessment.title}
        </h3>
        <StatusBadge status={assessment.verificationStatus} />
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Level
          </dt>
          <dd className="mt-1 text-sm font-semibold text-navy">
            {formatVerificationLevel(assessment.verificationLevel)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Score
          </dt>
          <dd className="mt-1 text-sm font-semibold text-navy">
            {formatCapabilityScore(assessment.score)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Submitted
          </dt>
          <dd className="mt-1 text-sm font-semibold text-navy">
            {formatSubmittedDate(assessment.submittedAt)}
          </dd>
        </div>
      </dl>
      <div className="mt-auto pt-5">
        <ButtonLink
          href={ROUTES.assessment(assessment.id)}
          variant="secondary"
          className="w-full sm:w-auto"
        >
          View evidence
        </ButtonLink>
      </div>
    </Card>
  );
}

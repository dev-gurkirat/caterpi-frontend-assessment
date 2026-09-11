import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PassportErrorState,
  PassportSignInState,
} from "@/components/passport/passport-states";
import { IdentityPanel } from "@/components/passport/identity-panel";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAssessmentEvidence } from "@/lib/data/evidence";
import { getMyAssessment } from "@/lib/data/passport";
import {
  formatSubmittedDate,
  formatVerificationLevel,
  getEvidenceUnavailableMessage,
} from "@/lib/domain/labels";
import { ROUTES } from "@/lib/domain/routes";
import { formatCapabilityScore } from "@/lib/domain/scores";
import { getVerificationStatusLabel } from "@/lib/domain/verification";
import type { EvidenceRecord } from "@/lib/domain/types";

export const metadata: Metadata = {
  title: "Assessment evidence",
};

export default async function AssessmentEvidencePage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  const assessmentResult = await getMyAssessment(assessmentId);

  if (assessmentResult.status === "unauthenticated") {
    return <PassportSignInState />;
  }

  if (assessmentResult.status === "unavailable") {
    return <PassportErrorState message={assessmentResult.message} />;
  }

  if (assessmentResult.status !== "ok") {
    notFound();
  }

  const assessment = assessmentResult.data;
  const evidenceResult = await getAssessmentEvidence(assessmentId);

  if (evidenceResult.status === "unauthenticated") {
    return <PassportSignInState />;
  }

  const backHref = assessment.capabilitySlug
    ? ROUTES.capability(assessment.capabilitySlug)
    : ROUTES.passport;

  const meta = [
    {
      label: "Level",
      value: formatVerificationLevel(assessment.verificationLevel),
    },
    { label: "Score", value: formatCapabilityScore(assessment.score) },
    { label: "Submitted", value: formatSubmittedDate(assessment.submittedAt) },
    {
      label: "Assessor",
      value: assessment.assessorStatus?.trim() || "Not available",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <IdentityPanel
        eyebrow="Assessment"
        title={assessment.title}
        description={assessment.capabilityName ?? "Capability not available"}
        stats={meta}
        actions={
          <>
            <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
              {getVerificationStatusLabel(assessment.verificationStatus)}
            </span>
            <ButtonLink href={backHref} variant="ghost">
              <span className="sm:hidden">Back</span>
              <span className="hidden sm:inline">
                {assessment.capabilitySlug
                  ? "Back to capability"
                  : "Back to passport"}
              </span>
            </ButtonLink>
          </>
        }
      />

      {evidenceResult.status === "unavailable" ? (
        <PassportErrorState message={evidenceResult.message} />
      ) : evidenceResult.status === "ok" ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-navy">
            Evidence
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {evidenceResult.data.map((record) => (
              <EvidenceCard key={record.id} record={record} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title="No evidence provided"
          description={getEvidenceUnavailableMessage("not_provided")}
        />
      )}
    </div>
  );
}

function EvidenceCard({ record }: { record: EvidenceRecord }) {
  if (record.available && record.url) {
    return (
      <Card as="article" className="flex h-full flex-col">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper">
          File
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-navy">
          {record.fileName ?? "Evidence file"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          Supporting file for this assessment.
        </p>
        <div className="mt-auto pt-5">
          <ButtonLink
            href={record.url}
            variant="copper"
            className="w-full sm:w-auto"
            target="_blank"
            rel="noreferrer"
          >
            Open file
          </ButtonLink>
        </div>
      </Card>
    );
  }

  return (
    <Card as="article" muted className="flex h-full flex-col">
      <h3 className="font-display text-lg font-semibold tracking-tight text-navy">
        Evidence unavailable
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        {getEvidenceUnavailableMessage(record.unavailableReason)}
      </p>
    </Card>
  );
}

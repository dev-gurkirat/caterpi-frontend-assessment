import { calculateOverallProgress } from "@/lib/domain/progress";
import type {
  AssessmentSummary,
  CapabilitySummary,
  EvidenceRecord,
  LevelVerification,
  PrivatePassport,
  PublicPassport,
  VerificationLevel,
  VerificationStatus,
} from "@/lib/domain/types";
import { VERIFICATION_LEVELS } from "@/lib/domain/types";
import type {
  AssessmentResultRow,
  CapabilityLevelRow,
  EvidenceRow,
  TalentCapabilityRow,
  TalentRow,
} from "@/lib/data/schema";

export function parseBooleanFlag(value: boolean | string | null | undefined): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value.toLowerCase() === "public";
  }

  return false;
}

export function parseScore(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function parseVerificationLevel(
  value: number | string | null | undefined,
): VerificationLevel | null {
  const numeric = typeof value === "string" ? Number(value) : value;

  if (numeric === 1 || numeric === 2 || numeric === 3) {
    return numeric;
  }

  return null;
}

export function normalizeVerificationStatus(
  value: string | null | undefined,
): VerificationStatus {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, "_");

  if (normalized === "verified") {
    return "verified";
  }

  return "not_attempted";
}

export function completeLevelSet(
  levels: LevelVerification[],
): LevelVerification[] {
  return VERIFICATION_LEVELS.map((level) => {
    const match = levels.find((item) => item.level === level);
    return match ?? { level, status: "not_attempted" };
  });
}

export function mapCapabilitySummary(
  row: TalentCapabilityRow,
  levelRows: CapabilityLevelRow[],
): CapabilitySummary | null {
  const related = Array.isArray(row.capabilities)
    ? row.capabilities[0]
    : row.capabilities;
  const name = related?.name?.trim();

  if (!related || !name) {
    return null;
  }

  const levels = completeLevelSet(
    levelRows
      .filter((level) => level.capability_id === row.capability_id)
      .map((level) => {
        const parsedLevel = parseVerificationLevel(level.level);
        if (!parsedLevel) {
          return null;
        }

        return {
          level: parsedLevel,
          status: normalizeVerificationStatus(level.status),
        };
      })
      .filter((level): level is LevelVerification => level !== null),
  );

  return {
    id: related.slug?.trim() || row.capability_id,
    name,
    score: parseScore(row.score),
    levels,
  };
}

export function mapAssessmentSummary(row: AssessmentResultRow): AssessmentSummary {
  const related = Array.isArray(row.capabilities)
    ? row.capabilities[0]
    : row.capabilities;

  return {
    id: row.id,
    title: row.title?.trim() || "Assessment",
    capabilityId: row.capability_id,
    capabilityName: related?.name?.trim() || null,
    capabilitySlug: related?.slug?.trim() || null,
    verificationLevel: parseVerificationLevel(row.verification_level),
    score: parseScore(row.score),
    verificationStatus: normalizeVerificationStatus(row.verification_status),
    submittedAt: row.submitted_at,
    assessorStatus: row.assessor_status,
  };
}

export function fileNameFromStoragePath(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? null;
}

export type HomeEvidenceCandidate = {
  assessmentId: string;
  storagePath: string | null;
  expiresAt: string | null;
  submittedAt: string | null;
};

/** Prefer an assessment with a usable file so the home shortcut is not a missing-file demo. */
export function pickHomeEvidenceAssessmentId(
  rows: HomeEvidenceCandidate[],
  now = new Date(),
): string | null {
  const available = rows
    .filter((row) =>
      mapEvidenceRecord(
        {
          id: row.assessmentId,
          assessment_id: row.assessmentId,
          storage_path: row.storagePath,
          expires_at: row.expiresAt,
        },
        now,
      ).available,
    )
    .sort((left, right) => {
      const leftTime = left.submittedAt ? Date.parse(left.submittedAt) : 0;
      const rightTime = right.submittedAt ? Date.parse(right.submittedAt) : 0;
      return rightTime - leftTime;
    });

  return available[0]?.assessmentId ?? null;
}

export function mapEvidenceRecord(
  row: EvidenceRow,
  now = new Date(),
): EvidenceRecord {
  const fileName = fileNameFromStoragePath(row.storage_path);

  if (!row.storage_path) {
    return {
      id: row.id,
      assessmentId: row.assessment_id,
      fileName,
      available: false,
      url: null,
      unavailableReason: "missing",
    };
  }

  if (row.expires_at && new Date(row.expires_at) <= now) {
    return {
      id: row.id,
      assessmentId: row.assessment_id,
      fileName,
      available: false,
      url: null,
      unavailableReason: "expired",
    };
  }

  return {
    id: row.id,
    assessmentId: row.assessment_id,
    fileName,
    available: true,
    url: null,
    unavailableReason: null,
  };
}

export function toPrivatePassport(
  talent: TalentRow,
  capabilities: CapabilitySummary[],
): PrivatePassport {
  return {
    displayName: talent.display_name?.trim() || "Talent",
    role: talent.role?.trim() || "Role not set",
    username: talent.username,
    isPublic: parseBooleanFlag(talent.is_public),
    overallProgress: calculateOverallProgress(capabilities),
    capabilities,
  };
}

/**
 * Public payload constructor. Email, internal IDs, and internal
 * assessment metadata are intentionally omitted.
 */
export function toPublicPassport(
  talent: TalentRow,
  capabilities: CapabilitySummary[],
): PublicPassport {
  return {
    username: talent.username,
    displayName: talent.display_name?.trim() || "Talent",
    role: talent.role?.trim() || "Role not set",
    capabilities: capabilities.map((capability) => ({
      name: capability.name,
      score: capability.score,
      levels: capability.levels,
    })),
  };
}

export function containsPrivatePublicFields(payload: unknown): boolean {
  const serialized = JSON.stringify(payload).toLowerCase();
  return (
    serialized.includes('"email":') ||
    serialized.includes('"id":') ||
    serialized.includes('"assessorstatus":') ||
    serialized.includes('"talent_id":')
  );
}

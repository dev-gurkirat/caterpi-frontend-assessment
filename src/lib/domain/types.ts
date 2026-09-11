/**
 * Product-level types for the Talent Skills Passport.
 * UI components consume these types; Supabase rows are mapped in `src/lib/data`.
 */

export const VERIFICATION_STATUSES = ["verified", "not_attempted"] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const VERIFICATION_LEVELS = [1, 2, 3] as const;

export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];

export type LevelVerification = {
  level: VerificationLevel;
  status: VerificationStatus;
};

export type PublicCapability = {
  name: string;
  score: number | null;
  levels: LevelVerification[];
};

export type CapabilitySummary = PublicCapability & {
  id: string;
};

export type AssessmentSummary = {
  id: string;
  title: string;
  capabilityId: string;
  capabilityName: string | null;
  capabilitySlug: string | null;
  verificationLevel: VerificationLevel | null;
  score: number | null;
  verificationStatus: VerificationStatus;
  submittedAt: string | null;
  assessorStatus: string | null;
};

export type EvidenceRecord = {
  id: string;
  assessmentId: string;
  fileName: string | null;
  available: boolean;
  url: string | null;
  unavailableReason:
    | "missing"
    | "inaccessible"
    | "expired"
    | "not_provided"
    | null;
};

/**
 * Authenticated passport. May include fields that must never
 * appear on the public route.
 */
export type PrivatePassport = {
  displayName: string;
  role: string;
  username: string;
  isPublic: boolean;
  overallProgress: number | null;
  capabilities: CapabilitySummary[];
};

/**
 * Public-safe passport payload.
 * Must not include email, internal IDs, or internal assessment metadata.
 */
export type PublicPassport = {
  username: string;
  displayName: string;
  role: string;
  capabilities: PublicCapability[];
};

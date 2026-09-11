export const TABLES = {
  talents: "talents",
  capabilities: "capabilities",
  talentCapabilities: "talent_capabilities",
  capabilityLevels: "capability_levels",
  assessmentResults: "assessment_results",
  evidence: "evidence",
} as const;

export const STORAGE_BUCKETS = {
  evidence: "evidence",
} as const;

/** Public-safe talent fields. Never include email or other private columns. */
export const PUBLIC_TALENT_COLUMNS =
  "username, display_name, role" as const;

/** Server lookup for a public profile. `id` is used only to join capabilities. */
export const PUBLIC_TALENT_LOOKUP_COLUMNS =
  "id, username, display_name, role" as const;

export const PRIVATE_TALENT_COLUMNS =
  "id, username, display_name, role, is_public" as const;

export type TalentRow = {
  id?: string;
  username: string;
  display_name: string | null;
  role: string | null;
  is_public: boolean | string | null;
  email?: string | null;
};

export type CapabilityRow = {
  id: string;
  name: string;
  slug?: string | null;
};

export type TalentCapabilityRow = {
  talent_id?: string;
  capability_id: string;
  score: number | string | null;
  capabilities?: CapabilityRow | CapabilityRow[] | null;
};

export type CapabilityLevelRow = {
  capability_id: string;
  level: number | string | null;
  status: string | null;
};

export type AssessmentResultRow = {
  id: string;
  talent_id?: string;
  capability_id: string;
  title: string | null;
  verification_level: number | string | null;
  score: number | string | null;
  verification_status: string | null;
  submitted_at: string | null;
  assessor_status: string | null;
  capabilities?: CapabilityRow | CapabilityRow[] | null;
};

export type EvidenceRow = {
  id: string;
  assessment_id: string;
  storage_path: string | null;
  expires_at: string | null;
};

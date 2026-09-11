import { describe, expect, it } from "vitest";
import {
  completeLevelSet,
  containsPrivatePublicFields,
  mapAssessmentSummary,
  mapCapabilitySummary,
  mapEvidenceRecord,
  normalizeVerificationStatus,
  parseBooleanFlag,
  parseScore,
  pickHomeEvidenceAssessmentId,
  toPrivatePassport,
  toPublicPassport,
} from "@/lib/data/mappers";
import { calculateOverallProgress, countVerifiedLevels } from "@/lib/domain/progress";
import { getEvidenceUnavailableMessage } from "@/lib/domain/labels";
import { getEvidencePreviewHref } from "@/lib/domain/home-links";
import { formatCapabilityScore, scoreToChartRatio } from "@/lib/domain/scores";
import { isUuid } from "@/lib/data/ids";
import { PRIVATE_TALENT_COLUMNS, PUBLIC_TALENT_COLUMNS } from "@/lib/data/schema";
import { applyVisibilitySaveResult } from "@/lib/data/visibility-state";
import { readPublicSupabaseConfig } from "@/lib/supabase/env";
import type { TalentRow } from "@/lib/data/schema";
import type { CapabilitySummary as DomainCapability } from "@/lib/domain/types";

const talent: TalentRow = {
  id: "talent-1",
  username: "sample-talent",
  display_name: "Ada Example",
  role: "Marketing specialist",
  is_public: true,
  email: "ada@example.com",
};

const capabilities: DomainCapability[] = [
  {
    id: "cap-seo",
    name: "SEO",
    score: 63,
    levels: [
      { level: 1, status: "verified" },
      { level: 2, status: "verified" },
      { level: 3, status: "not_attempted" },
    ],
  },
];

describe("readPublicSupabaseConfig", () => {
  it("returns null when public values are missing", () => {
    expect(readPublicSupabaseConfig({})).toBeNull();
    expect(
      readPublicSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toBeNull();
  });

  it("returns only the public URL and anon key", () => {
    expect(
      readPublicSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      anonKey: "public-anon-key",
    });
  });
});

describe("ids", () => {
  it("accepts uuid values and rejects placeholder route ids", () => {
    expect(isUuid("3b1c0f2a-8d44-4e1a-9c3f-2a7b6d1e0c9a")).toBe(true);
    expect(isUuid("sample")).toBe(false);
    expect(isUuid("seo")).toBe(false);
  });
});

describe("score and status mapping", () => {
  it("formats scores in one place and handles missing values", () => {
    expect(formatCapabilityScore(63)).toBe("63%");
    expect(formatCapabilityScore(null)).toBe("Not scored");
    expect(scoreToChartRatio(50)).toBe(0.5);
    expect(scoreToChartRatio(null)).toBe(0);
  });

  it("parses partial numeric scores without crashing", () => {
    expect(parseScore(null)).toBeNull();
    expect(parseScore("84")).toBe(84);
    expect(parseScore("n/a")).toBeNull();
  });

  it("normalises known statuses and treats unknown values as not attempted", () => {
    expect(normalizeVerificationStatus("Verified")).toBe("verified");
    expect(normalizeVerificationStatus("not attempted")).toBe("not_attempted");
    expect(normalizeVerificationStatus("mystery")).toBe("not_attempted");
  });

  it("fills missing verification levels so incomplete records still render", () => {
    expect(completeLevelSet([{ level: 1, status: "verified" }])).toEqual([
      { level: 1, status: "verified" },
      { level: 2, status: "not_attempted" },
      { level: 3, status: "not_attempted" },
    ]);
  });

  it("uses a capability slug in the dashboard id when one exists", () => {
    const mapped = mapCapabilitySummary(
      {
        capability_id: "uuid-seo",
        score: 63,
        capabilities: { id: "uuid-seo", name: "SEO", slug: "seo" },
      },
      [{ capability_id: "uuid-seo", level: 1, status: "verified" }],
    );

    expect(mapped?.id).toBe("seo");
    expect(mapped?.score).toBe(63);
    expect(mapped?.levels[2]?.status).toBe("not_attempted");
  });
});

describe("progress", () => {
  it("returns null for empty capability lists", () => {
    expect(calculateOverallProgress([])).toBeNull();
  });

  it("uses verified levels when they exist", () => {
    expect(calculateOverallProgress(capabilities)).toBe(67);
    expect(countVerifiedLevels(capabilities)).toBe(2);
  });
});

describe("public and private mapping", () => {
  it("keeps private records from leaking into the public payload", () => {
    const publicPassport = toPublicPassport(talent, capabilities);

    expect(publicPassport).toEqual({
      username: "sample-talent",
      displayName: "Ada Example",
      role: "Marketing specialist",
      capabilities: [
        {
          name: "SEO",
          score: 63,
          levels: capabilities[0]?.levels,
        },
      ],
    });
    expect(containsPrivatePublicFields(publicPassport)).toBe(false);
    expect("email" in publicPassport).toBe(false);
    expect("id" in publicPassport).toBe(false);
    expect(JSON.stringify(publicPassport)).not.toContain("talent-1");
    expect(JSON.stringify(publicPassport)).not.toContain("cap-seo");
    expect(JSON.stringify(publicPassport)).not.toContain("ada@example.com");
    expect(JSON.stringify(publicPassport)).not.toContain("assessor");
  });

  it("can still map a private passport for the authenticated dashboard", () => {
    const privatePassport = toPrivatePassport(talent, capabilities);
    expect(privatePassport.username).toBe("sample-talent");
    expect(privatePassport.isPublic).toBe(true);
    expect(privatePassport.capabilities[0]?.id).toBe("cap-seo");
  });

  it("parses visibility flags from boolean or string values", () => {
    expect(parseBooleanFlag(true)).toBe(true);
    expect(parseBooleanFlag("public")).toBe(true);
    expect(parseBooleanFlag("false")).toBe(false);
  });
});

describe("evidence mapping", () => {
  const now = new Date("2026-09-11T10:00:00.000Z");

  it("marks missing and expired evidence without throwing", () => {
    expect(
      mapEvidenceRecord(
        {
          id: "ev-1",
          assessment_id: "as-1",
          storage_path: null,
          expires_at: null,
        },
        now,
      ).unavailableReason,
    ).toBe("missing");

    expect(
      mapEvidenceRecord(
        {
          id: "ev-2",
          assessment_id: "as-1",
          storage_path: "seo/file.pdf",
          expires_at: "2026-09-01T00:00:00.000Z",
        },
        now,
      ).unavailableReason,
    ).toBe("expired");
  });

  it("keeps a file name for available evidence before a signed URL is attached", () => {
    const mapped = mapEvidenceRecord(
      {
        id: "ev-3",
        assessment_id: "as-1",
        storage_path: "user-1/seo-fundamentals.txt",
        expires_at: null,
      },
      now,
    );

    expect(mapped.available).toBe(true);
    expect(mapped.fileName).toBe("seo-fundamentals.txt");
    expect(mapped.url).toBeNull();
  });

  it("explains missing, expired, and inaccessible evidence", () => {
    expect(getEvidenceUnavailableMessage("missing")).toBe(
      "This file could not be found.",
    );
    expect(getEvidenceUnavailableMessage("expired")).toBe(
      "This file is no longer available.",
    );
    expect(getEvidenceUnavailableMessage("inaccessible")).toBe(
      "This file cannot be opened.",
    );
    expect(getEvidenceUnavailableMessage("not_provided")).toBe(
      "No supporting files were provided for this assessment.",
    );
  });

  it("picks a home shortcut assessment that has a usable file", () => {
    const now = new Date("2026-09-11T10:00:00.000Z");
    const availableId = "as-seo-fundamentals";

    expect(
      pickHomeEvidenceAssessmentId(
        [
          {
            assessmentId: "as-seo-applied",
            storagePath: null,
            expiresAt: null,
            submittedAt: "2026-05-04T11:30:00.000Z",
          },
          {
            assessmentId: "as-content",
            storagePath: "user-1/expired-content.txt",
            expiresAt: "2020-01-01T00:00:00.000Z",
            submittedAt: "2026-04-18T14:00:00.000Z",
          },
          {
            assessmentId: availableId,
            storagePath: "user-1/seo-fundamentals.txt",
            expiresAt: null,
            submittedAt: "2026-03-12T09:00:00.000Z",
          },
        ],
        now,
      ),
    ).toBe(availableId);
  });

  it("maps incomplete assessment rows instead of dropping them", () => {
    const mapped = mapAssessmentSummary({
      id: "as-incomplete",
      capability_id: "cap-1",
      title: null,
      verification_level: null,
      score: null,
      verification_status: null,
      submitted_at: null,
      assessor_status: null,
    });

    expect(mapped.title).toBe("Assessment");
    expect(mapped.verificationLevel).toBeNull();
    expect(mapped.score).toBeNull();
  });
});

describe("public talent columns", () => {
  it("does not select email or other private fields for public profiles", () => {
    expect(PUBLIC_TALENT_COLUMNS).not.toMatch(/email|is_public/);
    expect(PRIVATE_TALENT_COLUMNS).not.toMatch(/email/);
  });
});

describe("home evidence preview", () => {
  it("opens a real assessment route instead of a capability page", () => {
    const assessmentId = "3b1c0f2a-8d44-4e1a-9c3f-2a7b6d1e0c9a";

    expect(getEvidencePreviewHref(assessmentId, true)).toBe(
      `/passport/assessments/${assessmentId}`,
    );
    expect(getEvidencePreviewHref(assessmentId, true)).not.toContain(
      "/capabilities/",
    );
    expect(getEvidencePreviewHref(null, true)).toBe("/passport");
    expect(getEvidencePreviewHref(null, false)).toBe("/login");
  });
});

describe("visibility save rollback", () => {
  it("keeps the saved value when the update succeeds", () => {
    expect(
      applyVisibilitySaveResult(true, {
        status: "ok",
        data: { isPublic: true },
      }),
    ).toEqual({ isPublic: true, error: null });
  });

  it("restores the previous value when the update fails", () => {
    expect(
      applyVisibilitySaveResult(true, {
        status: "unavailable",
        message: "This page could not be loaded. Please try again later.",
      }),
    ).toEqual({
      isPublic: false,
      error: "This page could not be loaded. Please try again later.",
    });

    expect(applyVisibilitySaveResult(false, { status: "empty" })).toEqual({
      isPublic: true,
      error: "Could not update sharing. Your previous setting was kept.",
    });
  });
});

import { getAuthenticatedUser } from "@/lib/auth/session";
import { mapEvidenceRecord } from "@/lib/data/mappers";
import { isUuid } from "@/lib/data/ids";
import { unavailable, type DataResult } from "@/lib/data/results";
import {
  STORAGE_BUCKETS,
  TABLES,
  type EvidenceRow,
} from "@/lib/data/schema";
import type { EvidenceRecord } from "@/lib/domain/types";
import { LOAD_ERROR_MESSAGE } from "@/lib/domain/labels";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const DEMO_AVAILABLE_FILE = "seo-fundamentals.txt";

export async function getAssessmentEvidence(
  assessmentId: string,
): Promise<DataResult<EvidenceRecord[]>> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  await ensureDemoEvidence(supabase, user.id);

  if (!isUuid(assessmentId)) {
    return { status: "not_found" };
  }

  const { data, error } = await supabase
    .from(TABLES.evidence)
    .select("id, assessment_id, storage_path, expires_at")
    .eq("assessment_id", assessmentId);

  if (error) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  const rows = (data ?? []) as EvidenceRow[];

  if (rows.length === 0) {
    return { status: "empty" };
  }

  const records = await Promise.all(
    rows.map(async (row) => {
      const mapped = mapEvidenceRecord(row);

      if (!mapped.available || !row.storage_path) {
        return mapped;
      }

      const { data: signed, error: signedError } = await supabase.storage
        .from(STORAGE_BUCKETS.evidence)
        .createSignedUrl(row.storage_path, 60 * 10);

      if (signedError || !signed?.signedUrl) {
        return {
          ...mapped,
          available: false,
          url: null,
          unavailableReason: "inaccessible" as const,
        };
      }

      return {
        ...mapped,
        url: signed.signedUrl,
      };
    }),
  );

  return { status: "ok", data: records };
}

export async function ensureDemoEvidence(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await supabase.rpc("seed_demo_evidence");
  await uploadDemoEvidenceFile(supabase, userId);
}

async function uploadDemoEvidenceFile(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const path = `${userId}/${DEMO_AVAILABLE_FILE}`;
  const { data: existing } = await supabase.storage
    .from(STORAGE_BUCKETS.evidence)
    .list(userId, { search: DEMO_AVAILABLE_FILE });

  if (existing?.some((item) => item.name === DEMO_AVAILABLE_FILE)) {
    return;
  }

  await supabase.storage.from(STORAGE_BUCKETS.evidence).upload(
    path,
    new Blob(
      [
        "Caterpi demo evidence\nSEO fundamentals practical\nStored in the private evidence bucket.",
      ],
      { type: "text/plain" },
    ),
    { upsert: true, contentType: "text/plain" },
  );
}

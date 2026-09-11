import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  mapAssessmentSummary,
  mapCapabilitySummary,
  parseBooleanFlag,
  toPrivatePassport,
  toPublicPassport,
} from "@/lib/data/mappers";
import { ensureDemoEvidence } from "@/lib/data/evidence";
import { isUuid } from "@/lib/data/ids";
import { unavailable, type DataResult } from "@/lib/data/results";
import {
  PUBLIC_TALENT_LOOKUP_COLUMNS,
  PRIVATE_TALENT_COLUMNS,
  TABLES,
  type AssessmentResultRow,
  type CapabilityLevelRow,
  type TalentCapabilityRow,
  type TalentRow,
} from "@/lib/data/schema";
import type { AssessmentSummary, CapabilitySummary, PrivatePassport, PublicPassport } from "@/lib/domain/types";
import { LOAD_ERROR_MESSAGE } from "@/lib/domain/labels";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

export async function getMyPassport(): Promise<DataResult<PrivatePassport>> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  let talent = await loadOwnTalent(supabase, user.id);

  if (talent.status === "unavailable") {
    return talent;
  }

  if (talent.status !== "ok") {
    const seeded = await seedDemoPassport(supabase, user.id);

    if (seeded.status !== "ok") {
      return seeded;
    }

    talent = await loadOwnTalent(supabase, user.id);
  }

  if (talent.status !== "ok") {
    return talent.status === "unavailable" ? talent : { status: "empty" };
  }

  await ensureDemoEvidence(supabase, user.id);

  let capabilities = await loadCapabilities(supabase, talent.data.id);

  if (capabilities.status === "empty") {
    const seeded = await seedDemoPassport(supabase, user.id);

    if (seeded.status === "ok") {
      capabilities = await loadCapabilities(supabase, talent.data.id);
    } else if (seeded.status === "unavailable") {
      return seeded;
    }
  }

  if (capabilities.status !== "ok" && capabilities.status !== "empty") {
    return capabilities;
  }

  return {
    status: "ok",
    data: toPrivatePassport(
      talent.data.row,
      capabilities.status === "ok" ? capabilities.data : [],
    ),
  };
}

export const getPublicPassport = cache(async function getPublicPassport(
  username: string,
): Promise<DataResult<PublicPassport>> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  const { data: talent, error } = await supabase
    .from(TABLES.talents)
    .select(PUBLIC_TALENT_LOOKUP_COLUMNS)
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  if (!talent?.id) {
    return { status: "not_found" };
  }

  const capabilities = await loadCapabilities(supabase, talent.id);

  if (capabilities.status !== "ok" && capabilities.status !== "empty") {
    return capabilities;
  }

  return {
    status: "ok",
    data: toPublicPassport(
      talent as TalentRow,
      capabilities.status === "ok" ? capabilities.data : [],
    ),
  };
});

export async function updatePassportVisibility(
  isPublic: boolean,
): Promise<DataResult<{ isPublic: boolean; username: string }>> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const { data, error } = await supabase
    .from(TABLES.talents)
    .update({ is_public: isPublic })
    .eq("id", user.id)
    .select("is_public, username")
    .maybeSingle();

  if (error) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  if (!data) {
    return { status: "empty" };
  }

  return {
    status: "ok",
    data: {
      isPublic: parseBooleanFlag((data as TalentRow).is_public),
      username: (data as TalentRow).username,
    },
  };
}

export async function getCapabilityAssessments(
  capabilityId: string,
): Promise<DataResult<AssessmentSummary[]>> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const resolved = await resolveCapabilityUuid(supabase, capabilityId);

  if (resolved.status !== "ok") {
    return resolved;
  }

  const { data, error } = await supabase
    .from(TABLES.assessmentResults)
    .select(
      "id, capability_id, title, verification_level, score, verification_status, submitted_at, assessor_status, capabilities(name, slug)",
    )
    .eq("talent_id", user.id)
    .eq("capability_id", resolved.data)
    .order("submitted_at", { ascending: false });

  if (error) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  const assessments = (data ?? [])
    .map((row) => mapAssessmentSummary(row as AssessmentResultRow));

  if (assessments.length === 0) {
    return { status: "empty" };
  }

  return { status: "ok", data: assessments };
}

export async function getMyAssessment(
  assessmentId: string,
): Promise<DataResult<AssessmentSummary>> {
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
    .from(TABLES.assessmentResults)
    .select(
      "id, capability_id, title, verification_level, score, verification_status, submitted_at, assessor_status, capabilities(name, slug)",
    )
    .eq("id", assessmentId)
    .eq("talent_id", user.id)
    .maybeSingle();

  if (error) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  if (!data) {
    return { status: "not_found" };
  }

  return {
    status: "ok",
    data: mapAssessmentSummary(data as AssessmentResultRow),
  };
}

async function loadOwnTalent(
  supabase: SupabaseClient,
  userId: string,
): Promise<DataResult<{ id: string; row: TalentRow }>> {
  const { data: talent, error: talentError } = await supabase
    .from(TABLES.talents)
    .select(PRIVATE_TALENT_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (talentError) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  if (!talent?.id) {
    return { status: "empty" };
  }

  return {
    status: "ok",
    data: { id: talent.id, row: talent as TalentRow },
  };
}

async function seedDemoPassport(supabase: SupabaseClient, userId: string): Promise<DataResult<true>> {
  const { error } = await supabase.rpc("seed_demo_passport");

  if (error) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  await ensureDemoEvidence(supabase, userId);
  return { status: "ok", data: true };
}

async function resolveCapabilityUuid(
  supabase: SupabaseClient,
  capabilityIdOrSlug: string,
): Promise<DataResult<string>> {
  const { data: bySlug, error: slugError } = await supabase
    .from(TABLES.capabilities)
    .select("id")
    .eq("slug", capabilityIdOrSlug)
    .maybeSingle();

  if (slugError) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  if (bySlug?.id) {
    return { status: "ok", data: bySlug.id };
  }

  if (!isUuid(capabilityIdOrSlug)) {
    return { status: "not_found" };
  }

  const { data: byId, error: idError } = await supabase
    .from(TABLES.capabilities)
    .select("id")
    .eq("id", capabilityIdOrSlug)
    .maybeSingle();

  if (idError) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  if (!byId?.id) {
    return { status: "not_found" };
  }

  return { status: "ok", data: byId.id };
}

async function loadCapabilities(
  supabase: SupabaseClient,
  talentId: string,
): Promise<DataResult<CapabilitySummary[]>> {
  const { data: capabilityRows, error: capabilityError } = await supabase
    .from(TABLES.talentCapabilities)
    .select("capability_id, score, capabilities(id, name, slug)")
    .eq("talent_id", talentId);

  if (capabilityError) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  const { data: levelRows, error: levelError } = await supabase
    .from(TABLES.capabilityLevels)
    .select("capability_id, level, status")
    .eq("talent_id", talentId);

  if (levelError) {
    return unavailable(LOAD_ERROR_MESSAGE);
  }

  const capabilities = ((capabilityRows ?? []) as TalentCapabilityRow[])
    .map((row) =>
      mapCapabilitySummary(row, (levelRows ?? []) as CapabilityLevelRow[]),
    )
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (capabilities.length === 0) {
    return { status: "empty" };
  }

  return { status: "ok", data: capabilities };
}

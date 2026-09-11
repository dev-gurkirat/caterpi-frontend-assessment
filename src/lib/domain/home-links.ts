import { ROUTES } from "@/lib/domain/routes";

/**
 * Home-page shortcut to Screen B. Never reuse a capability URL.
 * Signed-out users go to sign-in. Signed-in users without an
 * assessment land on the passport instead of a 404.
 */
export function getEvidencePreviewHref(
  assessmentId: string | null,
  signedIn: boolean,
): string {
  if (assessmentId) {
    return ROUTES.assessment(assessmentId);
  }

  return signedIn ? ROUTES.passport : ROUTES.login;
}

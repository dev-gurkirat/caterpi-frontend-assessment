export const LOAD_ERROR_MESSAGE =
  "This page could not be loaded. Please try again later.";

export const SIGN_IN_UNAVAILABLE_MESSAGE =
  "Sign in is unavailable right now. Please try again later.";

export const ACCOUNT_CREATED_MESSAGE =
  "Account created. Sign in with your email and password.";

export function formatVerificationLevel(level: number | null): string {
  return level ? `Level ${level}` : "Not available";
}

export function getEvidenceUnavailableMessage(
  reason: "missing" | "inaccessible" | "expired" | "not_provided" | null,
): string {
  if (reason === "expired") {
    return "This file is no longer available.";
  }

  if (reason === "inaccessible") {
    return "This file cannot be opened.";
  }

  if (reason === "missing") {
    return "This file could not be found.";
  }

  return "No supporting files were provided for this assessment.";
}

export function formatSubmittedDate(value: string | null): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

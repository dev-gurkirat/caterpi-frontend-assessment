export const ROUTES = {
  login: "/login",
  home: "/",
  passport: "/passport",
  capability: (capabilityId: string) =>
    `/passport/capabilities/${encodeURIComponent(capabilityId)}`,
  assessment: (assessmentId: string) =>
    `/passport/assessments/${encodeURIComponent(assessmentId)}`,
  publicPassport: (username: string) =>
    `/p/${encodeURIComponent(username.trim())}`,
} as const;

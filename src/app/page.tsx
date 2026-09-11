import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { HeaderActions } from "@/components/layout/header-actions";
import { PassportSeal } from "@/components/passport/passport-seal";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { HeaderBar } from "@/components/ui/header-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getHomeEvidenceAssessmentId, getMyPassport } from "@/lib/data/passport";
import { getEvidencePreviewHref } from "@/lib/domain/home-links";
import { ROUTES } from "@/lib/domain/routes";

export default async function HomePage() {
  const user = await getAuthenticatedUser();
  const signedIn = Boolean(user);
  const [passportResult, assessmentResult] = signedIn
    ? await Promise.all([getMyPassport(), getHomeEvidenceAssessmentId()])
    : [null, null];
  const myUsername =
    passportResult?.status === "ok" ? passportResult.data.username : null;
  const isPublic =
    passportResult?.status === "ok" ? passportResult.data.isPublic : false;
  const publicHref = myUsername
    ? ROUTES.publicPassport(myUsername)
    : ROUTES.login;
  const evidenceHref = getEvidencePreviewHref(
    assessmentResult?.status === "ok" ? assessmentResult.data : null,
    signedIn,
  );

  const previewLinks = [
    {
      href: ROUTES.passport,
      title: "My Skills Passport",
      description:
        "Your name, role, overall progress, capability scores, and public sharing.",
      label: "Passport",
    },
    {
      href: ROUTES.capability("seo"),
      title: "Capability detail",
      description:
        "Level status for a capability, plus the assessments that support it.",
      label: "Capability",
    },
    {
      href: evidenceHref,
      title: "Assessment evidence",
      description:
        "Title, level, score, status, date, assessor, and supporting files.",
      label: "Evidence",
    },
    {
      href: publicHref,
      title: "Public profile",
      description: myUsername
        ? isPublic
          ? `A public-safe summary at /p/${myUsername}.`
          : "Turn sharing on in your passport to publish a public profile."
        : "A public-safe summary of verified capabilities — never email or files.",
      label: "Public",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <HeaderBar
        left={<BrandMark subtitle="Skills passport" />}
        right={<HeaderActions signedIn={signedIn} />}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-6 sm:py-12">
        <section className="relative overflow-hidden rounded-2xl bg-navy text-white">
          <PassportSeal
            size={180}
            className="pointer-events-none absolute -right-6 -top-8 opacity-[0.12]"
          />
          <div className="relative grid items-center gap-6 p-5 sm:gap-8 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_auto]">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-copper sm:text-xs">
                Talent skills passport
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl sm:leading-[1.15] md:text-4xl">
                A verified record of what you can do.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                Caterpi keeps capability scores, verification levels, and
                assessment evidence in one passport. Share a public profile only
                when you choose to.
              </p>
              {!signedIn ? (
                <div className="flex flex-wrap gap-3 pt-1">
                  <ButtonLink href={ROUTES.login} variant="copper">
                    Sign in
                  </ButtonLink>
                </div>
              ) : signedIn && isPublic && myUsername ? (
                <div className="flex flex-wrap gap-3 pt-1">
                  <ButtonLink
                    href={ROUTES.publicPassport(myUsername)}
                    variant="ghost"
                  >
                    View public profile
                  </ButtonLink>
                </div>
              ) : null}
            </div>
            <div className="hidden justify-end lg:flex">
              <PassportSeal size={112} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper">
              01
            </p>
            <h2 className="mt-3 font-display text-lg font-semibold tracking-tight text-navy">
              Review your passport
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              See overall progress, a capability radar, and a score for each
              area — including capabilities that are not scored yet.
            </p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper">
              02
            </p>
            <h2 className="mt-3 font-display text-lg font-semibold tracking-tight text-navy">
              Open assessment evidence
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Each result shows level, score, status, date, and assessor, with
              files that are available, missing, or no longer accessible.
            </p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper">
              03
            </p>
            <h2 className="mt-3 font-display text-lg font-semibold tracking-tight text-navy">
              Control public sharing
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Your passport stays private until you turn sharing on. Public
              viewers see name, role, and scores — never email or evidence.
            </p>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-xl font-semibold tracking-tight text-navy sm:text-2xl">
              Open a passport screen
            </h2>
            <p className="text-sm leading-6 text-muted">
              The required views for your skills passport, capability history,
              assessment evidence, and public profile.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {previewLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
              >
                <Card className="flex h-full flex-col transition-transform group-hover:-translate-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper">
                    {item.label}
                  </p>
                  <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                    {item.description}
                  </p>
                  <span className="mt-5 text-sm font-semibold text-copper">
                    Open
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card as="article" className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper">
              Capabilities
            </p>
            <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-navy">
              Scores and verification levels
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Each capability can include a score and three verification levels.
              Incomplete records still appear, so a missing score or unattempted
              level does not break the passport.
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-navy">
              <li>Capability name, score, and level status</li>
              <li>Assessment history for that capability</li>
              <li>Overall progress across verified levels</li>
            </ul>
          </Card>
          <Card as="article" className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper">
              Privacy
            </p>
            <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-navy">
              Private by default
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Assessment files, assessor details, and internal IDs stay on your
              signed-in passport. A public profile uses the same empty state
              whether the username is unknown or simply not shared.
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-navy">
              <li>Toggle sharing from My Skills Passport</li>
              <li>Public view shows only public-safe fields</li>
              <li>Evidence files remain behind sign-in</li>
            </ul>
          </Card>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-navy px-5 py-6 text-white sm:px-8 sm:py-8">
          <PassportSeal
            size={140}
            className="pointer-events-none absolute -right-8 -bottom-10 opacity-[0.12]"
          />
          <div className="relative max-w-xl space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Your verified skills, ready to share.
            </h2>
            <p className="text-sm leading-6 text-white/80">
              Sign in to view live capability scores and evidence. Keep the
              passport private, or publish a public profile from the dashboard.
            </p>
            {!signedIn ? (
              <ButtonLink href={ROUTES.login} variant="copper">
                Sign in
              </ButtonLink>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

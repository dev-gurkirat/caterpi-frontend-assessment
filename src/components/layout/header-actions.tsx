"use client";

import Link from "next/link";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ButtonLink } from "@/components/ui/button-link";
import { ROUTES } from "@/lib/domain/routes";
import { cn } from "@/lib/cn";

type HeaderActionsProps = {
  signedIn: boolean;
  active?: "passport";
  signedOutHref?: "login" | "home";
};

export function HeaderActions({
  signedIn,
  active,
  signedOutHref = "login",
}: HeaderActionsProps) {
  return (
    <nav aria-label="Account" className="flex items-center gap-0.5 sm:gap-2">
      {signedIn ? (
        <>
          <Link
            href={ROUTES.passport}
            aria-current={active === "passport" ? "page" : undefined}
            className={cn(
              "rounded-full px-2.5 py-1.5 text-sm font-semibold transition-colors sm:px-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper",
              active === "passport"
                ? "bg-navy text-white"
                : "text-muted hover:bg-surface-muted hover:text-navy",
            )}
          >
            <span className="sm:hidden">Passport</span>
            <span className="hidden sm:inline">My Passport</span>
          </Link>
          <SignOutButton />
        </>
      ) : signedOutHref === "home" ? (
        <ButtonLink href={ROUTES.home} variant="secondary">
          Home
        </ButtonLink>
      ) : (
        <ButtonLink href={ROUTES.login}>Sign in</ButtonLink>
      )}
    </nav>
  );
}

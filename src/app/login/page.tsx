import type { Metadata } from "next";
import { LoginForm } from "@/app/login/login-form";
import { BrandMark } from "@/components/layout/brand-mark";
import { HeaderActions } from "@/components/layout/header-actions";
import { HeaderBar } from "@/components/ui/header-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAuthenticatedUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="flex flex-1 flex-col">
      <HeaderBar
        left={<BrandMark subtitle="Skills passport" />}
        right={
          <HeaderActions signedIn={Boolean(user)} signedOutHref="home" />
        }
      />
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-8 px-4 pt-8 pb-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center lg:gap-10">
        <div className="max-w-xl space-y-2.5 sm:space-y-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-copper sm:text-xs">
            Account
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-navy sm:text-3xl sm:leading-[1.15] md:text-4xl">
            Sign in to your passport
          </h1>
          <p className="text-sm leading-6 text-muted sm:text-base sm:leading-7">
            View your capability scores, assessment history, and supporting
            files.
          </p>
        </div>
        <LoginForm />
      </main>
      <SiteFooter />
    </div>
  );
}

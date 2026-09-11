import { ButtonLink } from "@/components/ui/button-link";
import { ROUTES } from "@/lib/domain/routes";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16">
      <div className="space-y-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-copper">
          Not found
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-5xl sm:leading-[1.08]">
          This page is not available.
        </h1>
        <p className="max-w-xl text-base leading-7 text-muted">
          The link may be incorrect, or this passport may not be public.
        </p>
      </div>
      <div className="mt-8">
        <ButtonLink href={ROUTES.home}>Back to home</ButtonLink>
      </div>
    </div>
  );
}

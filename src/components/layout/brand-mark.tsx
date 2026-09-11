import Link from "next/link";
import { PassportSeal } from "@/components/passport/passport-seal";
import { ROUTES } from "@/lib/domain/routes";
import { cn } from "@/lib/cn";

type BrandMarkProps = {
  href?: string;
  subtitle?: string;
  className?: string;
};

export function BrandMark({
  href = ROUTES.home,
  subtitle,
  className,
}: BrandMarkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-w-0 items-center gap-2 rounded-md sm:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper",
        className,
      )}
    >
      <PassportSeal size={32} className="shrink-0 sm:hidden" />
      <PassportSeal size={36} className="hidden shrink-0 sm:block" />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="font-display text-base font-semibold tracking-tight text-navy sm:text-lg">
          Caterpi
        </span>
        {subtitle ? (
          <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted sm:inline">
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

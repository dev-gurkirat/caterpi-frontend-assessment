import type { ReactNode } from "react";
import { PassportSeal } from "@/components/passport/passport-seal";
import { cn } from "@/lib/cn";

type IdentityStat = {
  value: string;
  label: string;
};

type IdentityPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats?: IdentityStat[];
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function IdentityPanel({
  eyebrow,
  title,
  description,
  stats,
  meta,
  actions,
  className,
}: IdentityPanelProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl bg-navy text-white",
        className,
      )}
    >
      <PassportSeal
        size={168}
        className="pointer-events-none absolute -right-8 -top-8 opacity-[0.12]"
      />
      <div className="relative p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          {actions ? (
            <div className="order-first flex flex-wrap items-center justify-end gap-2 sm:order-last sm:max-w-[14rem] sm:shrink-0 md:max-w-none">
              {actions}
            </div>
          ) : null}
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-7">
            <PassportSeal size={56} className="hidden shrink-0 sm:block" />
            <div className="min-w-0 space-y-2.5 sm:space-y-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-copper sm:text-xs">
                {eyebrow}
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight break-words text-white sm:text-3xl sm:leading-[1.15] md:text-4xl">
                {title}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                {description}
              </p>
              {meta}
              {stats && stats.length > 0 ? (
                <dl className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                  {stats.map((stat) => (
                    <div key={stat.label} className="min-w-0">
                      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/55">
                        {stat.label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-white sm:text-base">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

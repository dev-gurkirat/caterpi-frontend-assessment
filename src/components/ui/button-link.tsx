import type { ReactNode } from "react";
import Link from "next/link";
import { buttonClassName, type ButtonVariant } from "@/components/ui/button";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  target?: "_blank";
  rel?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  target,
  rel,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={buttonClassName(variant, className)}
    >
      {children}
    </Link>
  );
}

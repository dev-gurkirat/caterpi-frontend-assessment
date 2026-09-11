"use client";

import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/layout/brand-mark";
import { HeaderActions } from "@/components/layout/header-actions";
import { HeaderBar } from "@/components/ui/header-bar";
import { ROUTES } from "@/lib/domain/routes";

export function PrivateHeader() {
  const pathname = usePathname();
  const passportActive =
    pathname === ROUTES.passport || pathname.startsWith(`${ROUTES.passport}/`);

  return (
    <HeaderBar
      left={<BrandMark subtitle="My passport" />}
      right={
        <HeaderActions
          signedIn
          active={passportActive ? "passport" : undefined}
        />
      }
    />
  );
}

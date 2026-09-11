import type { ReactNode } from "react";
import { PrivateHeader } from "@/components/layout/private-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <PrivateHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

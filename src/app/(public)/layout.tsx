import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/public-header";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
        {children}
      </main>
    </div>
  );
}

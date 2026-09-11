"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16">
      <div className="space-y-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-danger">
          Something went wrong
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-5xl sm:leading-[1.08]">
          This page could not be loaded.
        </h1>
        <p className="max-w-xl text-base leading-7 text-muted">
          Try again. If it continues, refresh the page.
        </p>
      </div>
      <Button className="mt-8 w-fit" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function CapabilityDetailLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <Skeleton className="h-28 rounded-[20px]" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-[18px]" />
        <Skeleton className="h-20 rounded-[18px]" />
        <Skeleton className="h-20 rounded-[18px]" />
      </div>
      <Skeleton className="h-40 rounded-[18px]" />
    </div>
  );
}

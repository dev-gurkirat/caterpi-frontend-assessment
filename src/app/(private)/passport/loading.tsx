import { Skeleton } from "@/components/ui/skeleton";

export default function PassportLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <Skeleton className="h-64 rounded-[20px]" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-[18px]" />
        <div className="grid gap-5">
          <Skeleton className="h-36 rounded-[18px]" />
          <Skeleton className="h-28 rounded-[18px]" />
        </div>
      </div>
    </div>
  );
}

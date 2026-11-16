import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <PageContainer className="space-y-6 pb-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-[320px] rounded-xl lg:col-span-3" />
        <Skeleton className="h-[320px] rounded-xl lg:col-span-2" />
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-[300px] rounded-xl lg:col-span-3" />
        <Skeleton className="h-[300px] rounded-xl lg:col-span-2" />
      </div>
    </PageContainer>
  );
}

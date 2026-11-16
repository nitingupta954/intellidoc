"use client";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer className="space-y-6 py-12">
      <ErrorState
        title="Dashboard could not load"
        message="We could not read your workspace activity. Try again, or check your connection."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </PageContainer>
  );
}

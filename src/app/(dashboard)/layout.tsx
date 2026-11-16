import { AppShell } from "@/components/layout/app-shell";
import { OnboardingTour } from "@/components/layout/OnboardingTour";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <OnboardingTour />
      {children}
    </AppShell>
  );
}

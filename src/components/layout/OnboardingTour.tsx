"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Joyride, STATUS } from "react-joyride";

const TOUR_COMPLETED_KEY = "intellidoc_tour_completed";

const TOUR_STEPS = [
  {
    target: "[data-tour='workspace-selector']",
    title: "Switch workspaces",
    content:
      "Each workspace has its own members, documents, collections, and chat history. Switch here to move between isolated environments.",
    placement: "right" as const,
    skipBeacon: true,
    spotlightPadding: 6,
    spotlightRadius: 8,
  },
  {
    target: "[data-tour='nav-kb']",
    title: "Organize with collections",
    content:
      "Collections group related documents so answers stay focused. The AI searches only within the context you select.",
    placement: "right" as const,
    skipBeacon: true,
    spotlightPadding: 6,
    spotlightRadius: 8,
  },
  {
    target: "[data-tour='nav-docs']",
    title: "Upload and process documents",
    content:
      "Add PDFs and text files here. Processing status is visible per document, and indexed documents become searchable automatically.",
    placement: "right" as const,
    skipBeacon: true,
    spotlightPadding: 6,
    spotlightRadius: 8,
  },
  {
    target: "[data-tour='nav-chat']",
    title: "Ask with citations",
    content:
      "Ask questions across your workspace or a single collection. Answers cite the source passages they were grounded in.",
    placement: "right" as const,
    skipBeacon: true,
    spotlightPadding: 6,
    spotlightRadius: 8,
  },
];

function targetsReady() {
  return TOUR_STEPS.every((step) => {
    const element = document.querySelector(step.target);
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

export function OnboardingTour() {
  const [run, setRun] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/dashboard") return;
    if (localStorage.getItem(TOUR_COMPLETED_KEY) === "true") return;

    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;

    const tryStart = () => {
      if (cancelled) return;
      if (targetsReady()) {
        localStorage.setItem(TOUR_COMPLETED_KEY, "true");
        setRun(true);
        return;
      }
      if (attempts < 20) {
        attempts += 1;
        timer = window.setTimeout(tryStart, 150);
      }
    };

    timer = window.setTimeout(tryStart, 350);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [pathname]);

  const handleJoyrideCallback = (data: {
    status: string;
  }) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setRun(false);
    }
  };

  const JoyrideComponent = Joyride as unknown as React.ComponentType<
    Record<string, unknown>
  >;

  return (
    <JoyrideComponent
      steps={TOUR_STEPS}
      run={run}
      continuous
      scrollToFirstStep
      callback={handleJoyrideCallback}
      options={{
        primaryColor: "var(--primary)",
        textColor: "var(--foreground)",
        backgroundColor: "var(--card)",
        overlayColor: "var(--overlay)",
        arrowColor: "var(--card)",
        zIndex: 1000,
        showProgress: true,
        buttons: ["back", "close", "primary", "skip"],
        width: 380,
      }}
      locale={{
        skip: "Skip tour",
        last: "Done",
      }}
      styles={{
        tooltip: {
          borderRadius: 16,
          padding: 24,
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-overlay)",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        tooltipTitle: {
          fontSize: "1.125rem",
          fontWeight: 600,
          marginBottom: 8,
          color: "var(--foreground)",
        },
        tooltipContent: {
          fontSize: "0.875rem",
          lineHeight: 1.65,
          color: "var(--muted-foreground)",
          textAlign: "left",
          padding: 0,
        },
        buttonClose: {
          color: "var(--muted-foreground)",
        },
        buttonNext: {
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: "0.875rem",
          fontWeight: 500,
        },
        buttonBack: {
          marginRight: 8,
          color: "var(--muted-foreground)",
          fontSize: "0.875rem",
          fontWeight: 500,
        },
        buttonSkip: {
          color: "var(--muted-foreground)",
          fontSize: "0.875rem",
          fontWeight: 500,
        },
        progress: {
          color: "var(--muted-foreground)",
        },
      }}
    />
  );
}

"use client";

import { Progress } from "@/components/ui/progress";

interface TokenMeterProps {
  lifetimeGranted: number;
  lifetimeSpent: number;
}

function formatPercentage(value: number): string {
  if (value <= 0) return "0%";
  if (value < 0.01) return "<0.01%";
  if (value < 1) return `${value.toFixed(2)}%`;
  return `${Math.round(value)}%`;
}

export function TokenMeter({ lifetimeGranted, lifetimeSpent }: TokenMeterProps) {
  const percentage =
    lifetimeGranted > 0
      ? Math.min(100, Math.max(0, (lifetimeSpent / lifetimeGranted) * 100))
      : 0;
  const remaining = Math.max(0, lifetimeGranted - lifetimeSpent);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-foreground">Lifetime usage</span>
        <span className="text-muted-foreground tabular-nums">
          {lifetimeSpent.toLocaleString()} /{" "}
          {lifetimeGranted.toLocaleString()} credits
        </span>
      </div>
      <Progress
        value={percentage}
        aria-label="Lifetime credit usage"
        aria-valuetext={`${formatPercentage(percentage)} of lifetime credits used`}
        className="h-2"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{formatPercentage(percentage)} used</span>
        <span>{remaining.toLocaleString()} credits remaining</span>
      </div>
    </div>
  );
}

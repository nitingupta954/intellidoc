"use client";

import * as React from "react";
import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  hint?: string;
  change?: {
    label: string;
    tone?: "positive" | "neutral" | "negative";
  };
}

export function StatCard({
  title,
  value,
  icon,
  iconBg,
  hint,
  change,
}: StatCardProps) {
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-xl border border-border bg-card p-5 text-card-foreground shadow-card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="truncate text-sm text-muted-foreground">{title}</h3>
          {hint ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`About ${title}`}
                >
                  <Info className="size-3.5" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs leading-relaxed">
                {hint}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            iconBg
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {value}
        </span>
        {change ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              change.tone === "negative"
                ? "bg-destructive-soft text-destructive"
                : change.tone === "neutral"
                  ? "bg-neutral-soft text-neutral-foreground"
                  : "bg-success-soft text-success-foreground"
            )}
          >
            {change.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

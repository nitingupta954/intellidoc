"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

const TONE_CLASSES = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  neutral: "bg-neutral",
} as const

export interface ProgressBarProps extends React.ComponentProps<"div"> {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  tone?: keyof typeof TONE_CLASSES
}

function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  tone = "primary",
  className,
  ...props
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100
  const clamped = Math.min(Math.max(value, 0), safeMax)
  const percentage = Math.round((clamped / safeMax) * 100)

  return (
    <div data-slot="progress-bar" className={cn("w-full space-y-1.5", className)} {...props}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-2 text-xs">
          {label ? <span className="text-muted-foreground">{label}</span> : <span />}
          {showValue ? (
            <span className="font-medium text-foreground tabular-nums">{percentage}%</span>
          ) : null}
        </div>
      ) : null}
      <Progress
        value={clamped}
        max={safeMax}
        aria-label={label ?? "Progress"}
        className="h-1.5"
        indicatorClassName={TONE_CLASSES[tone]}
      />
    </div>
  )
}

export { ProgressBar }

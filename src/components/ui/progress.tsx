"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string
}) {
  const percentage = Math.min(Math.max(value ?? 0, 0), 100)

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={percentage}
      className={cn(
        "relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full bg-primary transition-[width] duration-200 ease-out",
          indicatorClassName
        )}
        style={{
          width: `${percentage}%`,
          minWidth: percentage > 0 ? 2 : 0,
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }

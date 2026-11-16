import * as React from "react"
import { AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface ErrorStateProps extends React.ComponentProps<"div"> {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  action?: React.ReactNode
  compact?: boolean
}

function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  action,
  compact = false,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive-soft text-center",
        compact ? "gap-2 p-6" : "gap-3 p-10",
        className
      )}
      {...props}
    >
      <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </div>
      <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
      {message ? <p className="max-w-sm text-sm text-muted-foreground">{message}</p> : null}
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          {retryLabel}
        </Button>
      ) : action ? (
        <div className="mt-2">{action}</div>
      ) : null}
    </div>
  )
}

export { ErrorState }

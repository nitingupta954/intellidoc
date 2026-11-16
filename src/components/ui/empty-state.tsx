import * as React from "react"

import { cn } from "@/lib/utils"

export interface EmptyStateProps extends React.ComponentProps<"div"> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}

function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card text-center",
        compact ? "gap-2 p-6" : "gap-3 p-10",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground [&_svg]:size-5">
          {icon}
        </div>
      ) : null}
      <h3 className={cn("font-heading font-semibold text-foreground", compact ? "text-sm" : "text-base")}>
        {title}
      </h3>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export { EmptyState }

import * as React from "react"

import { cn } from "@/lib/utils"

export interface PageHeaderProps extends React.ComponentProps<"header"> {
  title: string
  description?: string
  breadcrumbs?: React.ReactNode
  actions?: React.ReactNode
  badge?: React.ReactNode
}

function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {breadcrumbs ? <div>{breadcrumbs}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading text-2xl leading-8 font-semibold tracking-[-0.01em] text-foreground md:text-[28px] md:leading-9">
              {title}
            </h1>
            {badge}
          </div>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}

export { PageHeader }

import * as React from "react"

import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.ComponentProps<"div"> {
  variant?: "default" | "fullBleed"
  padded?: boolean
}

function PageContainer({
  variant = "default",
  padded = false,
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        "w-full",
        variant === "default" && "mx-auto max-w-[1200px]",
        variant === "fullBleed" && "max-w-none",
        padded && "px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  )
}

export { PageContainer }

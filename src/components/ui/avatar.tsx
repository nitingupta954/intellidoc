"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/format"

const SIZE_CLASSES = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-12 text-sm",
} as const

export interface AvatarProps extends React.ComponentProps<"span"> {
  src?: string | null
  name?: string | null
  size?: keyof typeof SIZE_CLASSES
}

function Avatar({ src, name, size = "md", className, ...props }: AvatarProps) {
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    setFailed(false)
  }, [src])

  const showImage = Boolean(src) && !failed

  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent font-medium text-accent-foreground ring-1 ring-border",
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src ?? undefined}
          alt={name ?? "User avatar"}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
      {!showImage ? <span className="sr-only">{name ?? "User"}</span> : null}
    </span>
  )
}

export { Avatar }

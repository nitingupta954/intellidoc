import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Info,
  Loader2,
} from "lucide-react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "border-border bg-neutral-soft text-neutral-foreground",
        info: "border-info/20 bg-info-soft text-info-foreground",
        success: "border-success/20 bg-success-soft text-success-foreground",
        warning: "border-warning/20 bg-warning-soft text-warning-foreground",
        danger: "border-destructive/20 bg-destructive-soft text-destructive",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[11px]",
        md: "px-2 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, size, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone, size }), className)}
      {...props}
    />
  )
}

type StatusTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>

const STATUS_TONES: Record<string, StatusTone> = {
  active: "success",
  complete: "success",
  completed: "success",
  indexed: "success",
  ready: "success",
  success: "success",
  verified: "success",
  paid: "success",
  processing: "warning",
  pending: "warning",
  uploading: "warning",
  ingesting: "warning",
  warning: "warning",
  paused: "warning",
  open: "info",
  uploaded: "info",
  info: "info",
  failed: "danger",
  error: "danger",
  canceled: "danger",
  cancelled: "danger",
  expired: "danger",
  danger: "danger",
  rejected: "danger",
  archived: "neutral",
  closed: "neutral",
  draft: "neutral",
}

const STATUS_ICONS: Record<StatusTone, React.ReactNode> = {
  success: <CheckCircle2 aria-hidden="true" />,
  warning: <Clock aria-hidden="true" />,
  danger: <AlertTriangle aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
  neutral: <Circle aria-hidden="true" />,
}

export interface StatusBadgeProps extends Omit<BadgeProps, "tone" | "children"> {
  status: string
  label?: string
  tone?: StatusTone
  showIcon?: boolean
}

function humanizeStatus(status: string): string {
  const words = status.replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function StatusBadge({
  status,
  label,
  tone,
  showIcon = true,
  className,
  ...props
}: StatusBadgeProps) {
  const normalized = status.toLowerCase()
  const resolvedTone = tone ?? STATUS_TONES[normalized] ?? "neutral"
  const text = label ?? humanizeStatus(status)
  const isLoading = normalized === "processing" || normalized === "ingesting"

  return (
    <Badge tone={resolvedTone} className={className} {...props}>
      {showIcon ? (
        isLoading ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          STATUS_ICONS[resolvedTone]
        )
      ) : null}
      {text}
    </Badge>
  )
}

export { Badge, StatusBadge, badgeVariants }
export type { StatusTone }

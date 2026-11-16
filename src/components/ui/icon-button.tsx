"use client"

import * as React from "react"

import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface IconButtonProps extends ButtonProps {
  "aria-label": string
  tooltip?: React.ReactNode
  tooltipSide?: "top" | "right" | "bottom" | "left"
}

function IconButton({
  tooltip,
  tooltipSide = "top",
  variant = "ghost",
  size = "icon",
  ...props
}: IconButtonProps) {
  const label = props["aria-label"]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          {...props}
          aria-label={label}
        />
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{tooltip ?? label}</TooltipContent>
    </Tooltip>
  )
}

export { IconButton }

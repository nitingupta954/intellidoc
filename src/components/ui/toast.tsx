"use client"

import { useTheme } from "next-themes"
import { Toaster as SonnerToaster, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme()

  return (
    <SonnerToaster
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "system"}
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group border border-border bg-popover text-popover-foreground shadow-overlay rounded-xl text-sm",
          title: "font-medium text-foreground",
          description: "text-muted-foreground text-xs",
          actionButton: "bg-primary text-primary-foreground rounded-md text-xs font-medium",
          cancelButton: "bg-muted text-muted-foreground rounded-md text-xs font-medium",
          closeButton: "border-border bg-popover text-muted-foreground hover:text-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }

"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface SearchInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: string
  onValueChange: (value: string) => void
  containerClassName?: string
}

function SearchInput({
  value,
  onValueChange,
  className,
  containerClassName,
  placeholder = "Search…",
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className={cn("pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden", className)}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onValueChange("")}
          className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Clear search"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

export { SearchInput }

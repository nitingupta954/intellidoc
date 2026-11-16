"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface DataTableColumn<T> {
  id: string
  header: React.ReactNode
  headerLabel?: string
  cell: (row: T) => React.ReactNode
  sortValue?: (row: T) => string | number
  sortable?: boolean
  align?: "left" | "center" | "right"
  className?: string
  hideOnMobile?: boolean
  mobileLabel?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  stickyHeader?: boolean
  emptyState?: React.ReactNode
  defaultSort?: { id: string; direction: "asc" | "desc" }
  caption?: string
  className?: string
}

const ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

export function DataTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  stickyHeader = false,
  emptyState,
  defaultSort,
  caption,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState(defaultSort ?? null)

  const sortedData = React.useMemo(() => {
    if (!sort) return data
    const column = columns.find((item) => item.id === sort.id)
    if (!column?.sortValue) return data
    const direction = sort.direction === "asc" ? 1 : -1
    return [...data].sort((a, b) => {
      const left = column.sortValue!(a)
      const right = column.sortValue!(b)
      if (left === right) return 0
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * direction
      }
      return String(left).localeCompare(String(right)) * direction
    })
  }, [data, columns, sort])

  function toggleSort(column: DataTableColumn<T>) {
    if (!column.sortable || !column.sortValue) return
    setSort((current) => {
      if (current?.id !== column.id) return { id: column.id, direction: "asc" }
      return {
        id: column.id,
        direction: current.direction === "asc" ? "desc" : "asc",
      }
    })
  }

  function handleRowKeyDown(event: React.KeyboardEvent, row: T) {
    if (!onRowClick) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onRowClick(row)
    }
  }

  if (data.length === 0) {
    return (
      <div className={className}>
        {emptyState ?? (
          <DataTableEmpty>No results found.</DataTableEmpty>
        )}
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="hidden w-full overflow-x-auto rounded-xl border border-border bg-card md:block">
        <Table>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <TableHeader
            className={cn(
              "bg-muted/50 [&_tr]:border-border",
              stickyHeader && "sticky top-0 z-10 bg-card"
            )}
          >
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => {
                const active = sort?.id === column.id
                const sortable = column.sortable && column.sortValue
                return (
                  <TableHead
                    key={column.id}
                    aria-sort={
                      active ? (sort?.direction === "asc" ? "ascending" : "descending") : "none"
                    }
                    className={cn(
                      "h-10 px-4 text-xs font-medium text-muted-foreground",
                      ALIGN_CLASSES[column.align ?? "left"],
                      column.className
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                          column.align === "right" && "flex-row-reverse"
                        )}
                      >
                        {column.header}
                        {active ? (
                          sort?.direction === "asc" ? (
                            <ArrowUp className="size-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="size-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow
                key={rowKey(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, row) : undefined}
                className={cn(
                  "border-border",
                  onRowClick &&
                    "cursor-pointer transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                )}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(
                      "whitespace-normal px-4 py-3 align-middle",
                      ALIGN_CLASSES[column.align ?? "left"],
                      column.className
                    )}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {sortedData.map((row) => (
          <div
            key={rowKey(row)}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, row) : undefined}
            className={cn(
              "rounded-xl border border-border bg-card p-4 shadow-card",
              onRowClick &&
                "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <dl className="space-y-2">
              {columns
                .filter((column) => !column.hideOnMobile)
                .map((column) => (
                  <div
                    key={column.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <dt className="shrink-0 text-xs text-muted-foreground">
                      {column.mobileLabel ??
                        (typeof column.header === "string"
                          ? column.header
                          : column.headerLabel)}
                    </dt>
                    <dd className="min-w-0 text-right text-sm">{column.cell(row)}</dd>
                  </div>
                ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DataTableEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

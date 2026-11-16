"use client"

import * as React from "react"
import {
  Archive,
  CheckCircle2,
  Download,
  FileText,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Users,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Badge, StatusBadge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { ProgressBar } from "@/components/ui/progress-bar"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"

type DocumentRow = {
  id: string
  name: string
  type: string
  status: "indexed" | "processing" | "failed"
  size: string
  updated: number
}

const TABLE_ROWS: DocumentRow[] = [
  { id: "1", name: "Quarterly report.pdf", type: "PDF", status: "indexed", size: "1.2 MB", updated: 4 },
  { id: "2", name: "Pricing policy.docx", type: "DOCX", status: "processing", size: "840 KB", updated: 2 },
  { id: "3", name: "Old invoice.csv", type: "CSV", status: "failed", size: "41 KB", updated: 9 },
]

const TABLE_COLUMNS: DataTableColumn<DocumentRow>[] = [
  {
    id: "name",
    header: "Name",
    mobileLabel: "Document",
    sortable: true,
    sortValue: (row) => row.name,
    cell: (row) => (
      <span className="flex items-center gap-2 font-medium">
        <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
        {row.name}
      </span>
    ),
  },
  {
    id: "type",
    header: "Type",
    mobileLabel: "Type",
    sortable: true,
    sortValue: (row) => row.type,
    cell: (row) => row.type,
  },
  {
    id: "size",
    header: "Size",
    mobileLabel: "Size",
    align: "right",
    cell: (row) => <span className="tabular-nums">{row.size}</span>,
  },
  {
    id: "status",
    header: "Status",
    mobileLabel: "Status",
    sortable: true,
    sortValue: (row) => row.status,
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    id: "updated",
    header: "Updated",
    mobileLabel: "Updated",
    sortable: true,
    sortValue: (row) => row.updated,
    align: "right",
    cell: (row) => `${row.updated} days ago`,
  },
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-card">
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function ButtonSamples() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add document">
        <Plus aria-hidden="true" />
      </Button>
    </div>
  )
}

export function KitchenSink() {
  const [search, setSearch] = React.useState("")
  const [modalOpen, setModalOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState(true)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1200px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dev" }, { label: "UI" }]} className="mb-3" />
            <h1 className="font-heading text-[28px] leading-9 font-semibold tracking-[-0.01em]">
              Design system
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Phase 1 kitchen sink. Every primitive, every state, light and dark. Removed in Phase 11.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <Section title="Tokens" description="CSS variables drive every primitive in both themes.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {[
              ["primary", "var(--primary)"],
              ["accent", "var(--accent)"],
              ["background", "var(--background)"],
              ["card", "var(--card)"],
              ["muted", "var(--muted)"],
              ["border", "var(--border)"],
              ["ring", "var(--ring)"],
              ["success", "var(--success)"],
              ["warning", "var(--warning)"],
              ["destructive", "var(--destructive)"],
              ["info", "var(--info)"],
              ["neutral", "var(--neutral)"],
              ["foreground", "var(--foreground)"],
              ["sidebar", "var(--sidebar)"],
            ].map(([label, value]) => (
              <div key={label} className="space-y-1.5">
                <div
                  className="h-12 rounded-lg border border-border"
                  style={{ backgroundColor: value }}
                />
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Light preview" description="Default tokens">
            <div className="space-y-3">
              <ButtonSamples />
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="indexed" />
                <StatusBadge status="processing" />
                <StatusBadge status="failed" />
              </div>
              <Input placeholder="Document name" />
            </div>
          </Section>
          <div className="dark rounded-xl border border-border bg-background p-5 text-foreground">
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-lg font-semibold">Dark preview</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Same primitives, dark tokens</p>
              </div>
              <ButtonSamples />
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="indexed" />
                <StatusBadge status="processing" />
                <StatusBadge status="failed" />
              </div>
              <Input placeholder="Document name" />
            </div>
          </div>
        </div>

        <Section title="Buttons" description="Variants, sizes, loading and disabled.">
          <ButtonSamples />
        </Section>

        <Section title="Icon buttons" description="aria-label is required; tooltip is automatic.">
          <div className="flex flex-wrap items-center gap-2">
            <IconButton aria-label="Add document" variant="default">
              <Plus aria-hidden="true" />
            </IconButton>
            <IconButton aria-label="Download report">
              <Download aria-hidden="true" />
            </IconButton>
            <IconButton aria-label="Edit document" variant="outline">
              <Pencil aria-hidden="true" />
            </IconButton>
            <IconButton aria-label="Delete document" variant="destructive">
              <Trash2 aria-hidden="true" />
            </IconButton>
            <IconButton aria-label="More actions" variant="ghost">
              <MoreHorizontal aria-hidden="true" />
            </IconButton>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover for tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>
          </div>
        </Section>

        <Section title="Form controls" description="Default, filled, invalid, disabled, textarea, search and select.">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="ks-name" className="text-sm font-medium">Document name</label>
              <Input id="ks-name" placeholder="e.g. Q3 financial report" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ks-invalid" className="text-sm font-medium">Invalid</label>
              <Input id="ks-invalid" aria-invalid defaultValue="not-a-valid-email" />
              <p className="text-xs text-destructive">Enter a valid email address.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ks-disabled" className="text-sm font-medium">Disabled</label>
              <Input id="ks-disabled" placeholder="Read only" disabled />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ks-search" className="text-sm font-medium">Search</label>
              <SearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search documents"
                aria-label="Search documents"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ks-select" className="text-sm font-medium">Role</label>
              <Select defaultValue="viewer">
                <SelectTrigger id="ks-select" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ks-textarea" className="text-sm font-medium">Notes</label>
              <Textarea id="ks-textarea" placeholder="Add a description" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="ks-switch"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
            <label htmlFor="ks-switch" className="text-sm">Email notifications</label>
            <Switch checked={false} disabled aria-label="Disabled switch" />
          </div>
        </Section>

        <Section title="Badges" description="Tone is never the only signal; icons and text always accompany color.">
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="info">Info</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="danger">Danger</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {["indexed", "uploaded", "processing", "failed", "pending", "active", "canceled", "archived"].map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
        </Section>

        <Section title="Tabs and breadcrumbs">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Documents", href: "/documents" },
              { label: "Quarterly report" },
            ]}
          />
          <Tabs defaultValue="documents">
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Documents tab content
            </TabsContent>
            <TabsContent value="members" className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Members tab content
            </TabsContent>
            <TabsContent value="settings" className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Settings tab content
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Dropdown menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Open menu
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Pencil aria-hidden="true" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download aria-hidden="true" /> Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 aria-hidden="true" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section title="Dialogs and toasts">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>Open confirm</Button>
            <Button variant="outline" onClick={() => toast("Document uploaded")}>Default toast</Button>
            <Button variant="outline" onClick={() => toast.success("Document indexed")}>Success toast</Button>
            <Button variant="outline" onClick={() => toast.error("Upload failed")}>Error toast</Button>
            <Button variant="outline" onClick={() => toast.warning("Credits running low")}>Warning toast</Button>
            <Button variant="outline" onClick={() => toast.info("Indexing started")}>Info toast</Button>
          </div>
          <Modal
            open={modalOpen}
            onOpenChange={setModalOpen}
            title="Create knowledge base"
            description="Group related documents into a collection."
            footer={
              <>
                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button onClick={() => setModalOpen(false)}>Create</Button>
              </>
            }
          >
            <div className="space-y-1.5">
              <label htmlFor="ks-modal-name" className="text-sm font-medium">Name</label>
              <Input id="ks-modal-name" placeholder="e.g. Finance" />
            </div>
          </Modal>
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Delete document?"
            description="This permanently removes the document and its indexed content. This cannot be undone."
            confirmLabel="Delete"
            onConfirm={() => { toast.success("Document deleted") }}
          />
        </Section>

        <Section title="Data table" description="Sortable headers, sticky option, hover rows and mobile stacked cards.">
          <DataTable
            data={TABLE_ROWS}
            columns={TABLE_COLUMNS}
            rowKey={(row) => row.id}
            defaultSort={{ id: "updated", direction: "desc" }}
            caption="Documents"
          />
          <DataTable
            data={[]}
            columns={TABLE_COLUMNS}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                icon={<FolderOpen aria-hidden="true" />}
                title="No documents yet"
                description="Upload a document to get started."
                action={<Button><Plus aria-hidden="true" /> Upload</Button>}
              />
            }
          />
        </Section>

        <Section title="Avatars">
          <div className="flex flex-wrap items-center gap-3">
            <Avatar name="Nitin Gupta" size="sm" />
            <Avatar name="Nitin Gupta" size="md" />
            <Avatar name="Nitin Gupta" size="lg" />
            <Avatar name="Alice" size="md" />
            <Avatar src="/missing-avatar.png" name="Broken Image" size="md" />
          </div>
        </Section>

        <Section title="Progress">
          <div className="grid gap-4 md:grid-cols-2">
            <ProgressBar value={0} label="Not started" showValue />
            <ProgressBar value={45} label="Indexing documents" showValue />
            <ProgressBar value={78} tone="success" label="Storage used" showValue />
            <ProgressBar value={100} label="Complete" showValue tone="neutral" />
            <ProgressBar value={92} tone="warning" label="Credits used" showValue />
            <ProgressBar value={100} tone="danger" label="Failed uploads" showValue />
          </div>
        </Section>

        <Section title="Loading and states">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 rounded-lg border border-border p-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <EmptyState
              compact
              icon={<Archive aria-hidden="true" />}
              title="No archived documents"
              description="Archived documents will appear here."
              action={<Button variant="outline" size="sm">View documents</Button>}
            />
            <ErrorState
              compact
              message="We could not load this document."
              onRetry={() => toast.info("Retrying…")}
            />
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Team plan</CardTitle>
                <CardDescription>Manage billing and seats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Users className="size-4" aria-hidden="true" /> 12 of 20 seats used
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" aria-hidden="true" /> SSO enabled
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="size-4" aria-hidden="true" />
                  Workspace settings
                </CardTitle>
                <CardDescription>Configure indexing and retention</CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressBar value={64} label="Monthly credits" showValue />
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  )
}

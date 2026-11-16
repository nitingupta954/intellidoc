"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  Eye,
  FileText,
  Folder as FolderIcon,
  MessageSquare,
  MoreVertical,
  Trash2,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, formatFileName, formatFileSize, formatMimeType } from "@/lib/format";

interface DocumentTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  folders?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents: any[];
  onOpenFolder?: (id: string) => void;
  onDelete: (id: string) => void;
}

export function getDocumentName(doc: {
  filename?: string | null;
  title?: string | null;
}): string {
  return (
    formatFileName(doc.filename || "") ||
    doc.title ||
    doc.filename ||
    "Untitled document"
  );
}

export function isDocumentIndexed(doc: { status?: string | null }): boolean {
  const status = String(doc.status || "").toUpperCase();
  return ["INDEXED", "READY", "COMPLETE", "COMPLETED"].includes(status);
}

export function DocumentStatus({ doc }: { doc: any }) {
  const status = String(doc.status || "").toUpperCase();
  const isError = ["ERROR", "FAILED", "CANCELLED", "CANCELED"].includes(status);
  const isProcessing = ["UPLOADED", "PROCESSING", "PENDING", "INGESTING"].includes(status);
  const isIndexed = isDocumentIndexed(doc);

  const badge = isIndexed ? (
    <StatusBadge status="indexed" label="Indexed" />
  ) : isProcessing ? (
    <StatusBadge status="processing" label="Processing" />
  ) : isError ? (
    <StatusBadge status="failed" label="Error" />
  ) : (
    <StatusBadge status={doc.status || "unknown"} />
  );

  if (!isError || !doc.errorMessage) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-help">{badge}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {doc.errorMessage}
      </TooltipContent>
    </Tooltip>
  );
}

export function DocumentActions({
  doc,
  onDelete,
  align = "end",
  showChat = false,
}: {
  doc: any;
  onDelete: (id: string) => void;
  align?: "start" | "end";
  showChat?: boolean;
}) {
  const router = useRouter();
  const name = getDocumentName(doc);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${name}`}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {showChat ? (
          <DropdownMenuItem
            onSelect={() =>
              router.push(
                `/chat?documentId=${doc.id}&documentTitle=${encodeURIComponent(name)}`
              )
            }
            className="gap-2"
          >
            <MessageSquare className="size-4" /> Chat with document
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onSelect={() => router.push(`/documents/${doc.id}`)}
          className="gap-2"
        >
          <Eye className="size-4" /> Open preview
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2">
          <a href={`/api/documents/${doc.id}/download`} download>
            <Download className="size-4" /> Download
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="gap-2"
          onSelect={() => onDelete(doc.id)}
        >
          <Trash2 className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DocumentTable({
  folders = [],
  documents,
  onOpenFolder,
  onDelete,
}: DocumentTableProps) {
  const router = useRouter();

  return (
    <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-card md:block">
      <table className="w-full min-w-[980px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[27%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[16%]" />
          <col className="w-[13%]" />
          <col className="w-[11%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead className="border-b border-border bg-muted/40">
          <tr className="text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Size</th>
            <th className="px-4 py-3 font-medium">Uploaded by</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Uploaded</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {folders.map((folder) => (
            <tr
              key={`folder-${folder.id}`}
              className="group cursor-pointer transition-colors hover:bg-muted/40"
              onClick={() => onOpenFolder?.(folder.id)}
            >
              <td className="px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
                    <FolderIcon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="truncate font-medium text-foreground group-hover:text-primary-accent">
                    {folder.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">Folder</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {formatDate(folder.createdAt)}
              </td>
              <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                Open
              </td>
            </tr>
          ))}

          {documents.map((doc) => {
            const name = getDocumentName(doc);
            return (
              <tr
                key={doc.id}
                className="group cursor-pointer transition-colors hover:bg-muted/40"
                onClick={() => router.push(`/documents/${doc.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-accent">
                      <FileText className="size-4" aria-hidden="true" />
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/documents/${doc.id}`}
                          className="truncate font-medium text-foreground hover:underline"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {name}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-sm">
                        {doc.filename || name}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone="neutral" size="sm">
                    {formatMimeType(doc.mimeType)}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {formatFileSize(doc.fileSize || 0)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar name={doc.user?.name || doc.user?.email} size="sm" aria-hidden="true" />
                    <span className="truncate text-muted-foreground">
                      {doc.user?.name || doc.user?.email || "Unknown"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <DocumentStatus doc={doc} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  <span title={new Date(doc.createdAt).toLocaleString()}>
                    {formatDate(doc.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(
                          `/chat?documentId=${doc.id}&documentTitle=${encodeURIComponent(name)}`
                        );
                      }}
                    >
                      <MessageSquare className="size-3.5" />
                      <span className="hidden lg:inline">Chat</span>
                    </Button>
                    <DocumentActions doc={doc} onDelete={onDelete} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

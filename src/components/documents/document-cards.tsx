"use client";

import Link from "next/link";
import { FileText, Folder as FolderIcon } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DocumentActions,
  DocumentStatus,
  getDocumentName,
} from "@/components/documents/document-table";
import { formatDate, formatFileSize, formatMimeType } from "@/lib/format";

interface DocumentCardsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  folders?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents: any[];
  onOpenFolder?: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocumentCards({
  folders = [],
  documents,
  onOpenFolder,
  onDelete,
}: DocumentCardsProps) {
  return (
    <div className="space-y-3 md:hidden">
      {folders.map((folder) => (
        <button
          key={`folder-${folder.id}`}
          type="button"
          onClick={() => onOpenFolder?.(folder.id)}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-card transition-colors hover:bg-muted/40"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
            <FolderIcon className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
              {folder.name}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Folder · created {formatDate(folder.createdAt)}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">Open</span>
        </button>
      ))}

      {documents.map((doc) => {
        const name = getDocumentName(doc);
        return (
          <article
            key={doc.id}
            className="rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/documents/${doc.id}`}
                  className="block truncate text-sm font-medium text-foreground hover:underline"
                  title={doc.filename || name}
                >
                  {name}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <Badge tone="neutral" size="sm">
                    {formatMimeType(doc.mimeType)}
                  </Badge>
                  <span>{formatFileSize(doc.fileSize || 0)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(doc.createdAt)}</span>
                </div>
              </div>
              <DocumentActions doc={doc} onDelete={onDelete} showChat />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
              <div className="flex min-w-0 items-center gap-2">
                <Avatar name={doc.user?.name || doc.user?.email} size="sm" />
                <span className="truncate text-xs text-muted-foreground">
                  {doc.user?.name || doc.user?.email || "Unknown"}
                </span>
              </div>
              <DocumentStatus doc={doc} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

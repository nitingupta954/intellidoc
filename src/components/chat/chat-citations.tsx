"use client";

import Link from "next/link";
import { BookOpen, ExternalLink, FileText, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { formatFileName } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CitationSource {
  id: string;
  title: string;
  snippet: string;
  score: number | null;
  page?: string;
  section?: string;
  documentId?: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function textValue(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function idValue(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function normalizeScore(value: unknown): number | null {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numeric) || numeric < 0) return null;
  const percentage = numeric <= 1 ? numeric * 100 : numeric;
  return Math.min(100, Math.max(0, percentage));
}

export function getCitationSources(citations: unknown): CitationSource[] {
  if (!Array.isArray(citations)) return [];

  return citations.map((raw, index) => {
    const citation = asRecord(raw);
    const metadata = asRecord(citation.metadata);
    const title =
      textValue(
        citation.document_title,
        citation.documentTitle,
        citation.doc_name,
        citation.docName,
        citation.filename,
        citation.file_name,
        citation.fileName,
        citation.title,
        metadata.document_title,
        metadata.documentTitle,
        metadata.doc_name,
        metadata.docName,
        metadata.filename,
        metadata.file_name,
        metadata.fileName,
        metadata.title
      ) || `Source ${index + 1}`;

    const snippet = textValue(
      citation.full_text,
      citation.text_snippet,
      citation.textSnippet,
      citation.excerpt,
      citation.text,
      citation.content,
      metadata.full_text,
      metadata.text_snippet,
      metadata.excerpt,
      metadata.text
    );

    const score = normalizeScore(
      citation.score ??
        citation.relevance_score ??
        citation.relevanceScore ??
        citation.similarity ??
        citation.confidence ??
        metadata.score
    );

    const page = idValue(
      citation.page_number,
      citation.pageNumber,
      citation.page,
      metadata.page_number,
      metadata.pageNumber,
      metadata.page
    );

    const section = textValue(
      citation.section,
      citation.heading,
      citation.chapter,
      metadata.section,
      metadata.heading,
      metadata.chapter
    );

    const documentId = idValue(
      citation.document_id,
      citation.documentId,
      citation.doc_id,
      citation.docId,
      metadata.document_id,
      metadata.documentId,
      metadata.doc_id,
      metadata.docId
    );

    return {
      id: idValue(citation.id, citation.chunk_id, citation.chunkId) || `source-${index}`,
      title,
      snippet,
      score,
      page,
      section: section || undefined,
      documentId,
    };
  });
}

export function CitationSourceGrid({
  citations,
  messageId,
  onOpenSources,
}: {
  citations: unknown;
  messageId: string;
  onOpenSources: (messageId: string) => void;
}) {
  const sources = getCitationSources(citations);
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <BookOpen className="size-3.5" aria-hidden="true" />
        Sources
        <span className="text-muted-foreground/70">({sources.length})</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {sources.slice(0, 4).map((source, index) => (
          <button
            key={`${source.id}-${index}`}
            type="button"
            onClick={() => onOpenSources(messageId)}
            className="flex min-w-0 items-start gap-2 rounded-lg border border-border bg-card/60 p-2.5 text-left transition-colors hover:border-primary/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary-accent">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-1.5">
                <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate text-xs font-medium text-foreground">
                  {formatFileName(source.title)}
                </span>
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                {source.score !== null ? (
                  <span>{Math.round(source.score)}% match</span>
                ) : null}
                {source.page ? <span>Page {source.page}</span> : null}
                {source.section ? (
                  <span className="max-w-[140px] truncate">{source.section}</span>
                ) : null}
              </span>
            </span>
          </button>
        ))}
      </div>
      <Button
        type="button"
        variant="link"
        size="xs"
        className="mt-1 h-auto px-0 text-xs"
        onClick={() => onOpenSources(messageId)}
      >
        View all {sources.length} {sources.length === 1 ? "source" : "sources"}
      </Button>
    </div>
  );
}

export function SourcesPanel({
  citations,
  onClose,
  className,
}: {
  citations: unknown;
  onClose?: () => void;
  className?: string;
}) {
  const sources = getCitationSources(citations);

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-card", className)}>
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-heading text-sm font-semibold">Sources</h2>
          {sources.length > 0 ? (
            <Badge tone="neutral" size="sm">
              {sources.length}
            </Badge>
          ) : null}
        </div>
        {onClose ? (
          <IconButton
            aria-label="Close sources"
            tooltip="Close sources"
            size="icon-sm"
            onClick={onClose}
          >
            <X className="size-4" />
          </IconButton>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-thin">
        {sources.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <BookOpen className="size-4" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium">No sources yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ask a question and the retrieved document passages will appear here.
            </p>
          </div>
        ) : (
          <ol className="space-y-3">
            {sources.map((source, index) => (
              <li key={`${source.id}-${index}`}>
                <article className="rounded-lg border border-border bg-background/60 p-3">
                  <div className="flex items-start gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary-accent">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium text-foreground"
                        title={source.title}
                      >
                        {formatFileName(source.title)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {source.score !== null ? (
                          <Badge tone="neutral" size="sm">
                            {Math.round(source.score)}% match
                          </Badge>
                        ) : null}
                        {source.page ? (
                          <Badge tone="neutral" size="sm">
                            Page {source.page}
                          </Badge>
                        ) : null}
                        {source.section ? (
                          <Badge tone="neutral" size="sm" className="max-w-full">
                            <span className="truncate">{source.section}</span>
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {source.snippet ? (
                    <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-xs leading-relaxed text-muted-foreground scrollbar-thin">
                      {source.snippet}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      No excerpt included in this citation.
                    </p>
                  )}

                  {source.documentId ? (
                    <Button
                      asChild
                      variant="outline"
                      size="xs"
                      className="mt-2 h-auto py-1"
                    >
                      <Link href={`/documents/${source.documentId}`}>
                        <ExternalLink className="size-3" />
                        Open document
                      </Link>
                    </Button>
                  ) : null}
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

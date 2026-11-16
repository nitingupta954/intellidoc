"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquare,
  MoreVertical,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "@/components/layout/page-container";
import { StatusBadge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorState } from "@/components/ui/error-state";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceStore } from "@/store/workspace-store";
import {
  formatDate,
  formatEmbeddingModel,
  formatFileSize,
  formatFileName,
  formatMimeType,
} from "@/lib/format";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DocumentDetails({ doc }: { doc: any }) {
  const suggestedQuestions: string[] = Array.isArray(doc.suggestedQuestions)
    ? doc.suggestedQuestions.filter(
        (question: unknown): question is string => typeof question === "string"
      )
    : [];

  return (
    <div className="space-y-5 p-4">
      <div>
        <h2 className="font-heading text-sm font-semibold">Document details</h2>
        <dl className="mt-3 space-y-3.5 text-sm">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge
                status={doc.status}
                title={doc.errorMessage || undefined}
              />
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Uploaded</dt>
            <dd
              className="font-medium"
              title={new Date(doc.createdAt).toLocaleString("en-IN")}
            >
              {formatDate(doc.createdAt)}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">File size</dt>
            <dd className="font-medium">{formatFileSize(doc.fileSize || 0)}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Content type</dt>
            <dd className="truncate font-medium" title={doc.mimeType || "Unknown"}>
              {formatMimeType(doc.mimeType)}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 border-t border-border pt-3">
            <dt className="text-xs text-muted-foreground">Indexed chunks</dt>
            <dd className="font-medium">
              {typeof doc.chunkCount === "number"
                ? `${doc.chunkCount.toLocaleString("en-US")} chunks`
                : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Embedding model</dt>
            <dd className="w-fit max-w-full break-words rounded-md bg-muted px-2 py-1 text-xs font-medium">
              {formatEmbeddingModel(doc.embeddingModel)}
            </dd>
          </div>
        </dl>
      </div>

      {doc.summary ? (
        <section className="border-t border-border pt-4">
          <h3 className="font-heading text-sm font-semibold">Summary</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {doc.summary}
          </p>
        </section>
      ) : null}

      {suggestedQuestions.length > 0 ? (
        <section className="border-t border-border pt-4">
          <h3 className="font-heading text-sm font-semibold">
            Suggested questions
          </h3>
          <ul className="mt-2 space-y-2">
            {suggestedQuestions.map((question, index) => (
              <li
                key={`${question}-${index}`}
                className="rounded-md bg-muted/60 px-2.5 py-2 text-xs leading-relaxed text-muted-foreground"
              >
                {question}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export default function DocumentPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;
  const { activeWorkspaceId } = useWorkspaceStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!documentId || !activeWorkspaceId) return;
    setIsSharing(true);
    try {
      const res = await fetch("/api/shared-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: documentId,
          resourceType: "DOCUMENT",
          workspaceId: activeWorkspaceId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const url = `${window.location.origin}/shared/${data.token}`;
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied to clipboard!");
      } else {
        throw new Error("Failed to share");
      }
    } catch {
      toast.error("Could not generate share link.");
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(() => {
    if (!documentId) return;

    fetch(`/api/documents/${documentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch document");
        return res.json();
      })
      .then((data) => {
        if (data.document) {
          setDoc(data.document);
        } else {
          setError("Document not found");
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [documentId]);

  if (loading) {
    return (
      <PageContainer className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-6 w-56 max-w-[60vw]" />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 gap-4">
          <Skeleton className="min-h-[50vh] flex-1" />
          <Skeleton className="hidden w-80 shrink-0 lg:block" />
        </div>
      </PageContainer>
    );
  }

  if (error || !doc) {
    return (
      <PageContainer className="flex h-full items-center justify-center">
        <ErrorState
          title="Error loading document"
          message={error || "Document not found"}
          action={
            <Button asChild variant="outline">
              <Link href="/documents">Back to documents</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const displayName = formatFileName(doc.title || doc.filename);
  const fileUrl = `/api/documents/${documentId}/download`;
  const isPdf = /pdf/i.test(doc.mimeType || "");
  const viewerUrl = isPdf ? `${fileUrl}#zoom=page-width` : fileUrl;
  const isPreviewable =
    /pdf|text|json/i.test(doc.mimeType || "") ||
    /csv|markdown/i.test(doc.mimeType || "");
  const chatHref = `/chat?documentId=${doc.id}&documentTitle=${encodeURIComponent(displayName)}`;

  return (
    <PageContainer className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:flex-1">
          <IconButton
            aria-label="Back to documents"
            tooltip="Back to documents"
            asChild
          >
            <Link href="/documents">
              <ArrowLeft className="size-4" />
            </Link>
          </IconButton>

          <div className="min-w-0 flex-1">
            <Breadcrumbs
              items={[
                { label: "Documents", href: "/documents" },
                { label: displayName },
              ]}
            />
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <h1
                className="truncate font-heading text-lg font-semibold tracking-tight sm:text-xl"
                title={doc.filename}
              >
                {displayName}
              </h1>
              <StatusBadge
                status={doc.status}
                title={doc.errorMessage || undefined}
                className="shrink-0"
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5">
          <IconButton
            aria-label="Share document"
            tooltip="Copy share link"
            size="icon-sm"
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Share2 className="size-4" />
            )}
          </IconButton>

          <Button asChild className="gap-2">
            <Link href={chatHref} aria-label="Chat with this document">
              <MessageSquare className="size-4" />
              <span className="hidden sm:inline">Chat with this doc</span>
              <span className="sm:hidden">Chat</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Download document"
            title="Download document"
          >
            <a href={fileUrl} download={doc.filename}>
              <Download className="size-4" />
            </a>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="More document actions"
                title="More document actions"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild className="gap-2">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  Open in new tab
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {doc.errorMessage ? (
        <div
          role="alert"
          className="flex shrink-0 items-start gap-2 rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-xs text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-medium">Document processing issue</p>
            <p className="mt-0.5 break-words text-destructive/90">
              {doc.errorMessage}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="relative flex min-h-[60vh] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-muted/30 lg:min-h-0">
          {isPreviewable ? (
            <iframe
              src={viewerUrl}
              className="h-full w-full flex-1 border-none bg-background"
              title={doc.filename}
            />
          ) : (
            <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-background text-muted-foreground shadow-sm">
                <FileText className="size-6" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-base font-semibold">
                Preview not available
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                This file type cannot be previewed in the browser. Download the
                file to view it, or chat with it to get grounded answers.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href={fileUrl} download={doc.filename}>
                  <Download className="size-3.5" />
                  Download file
                </a>
              </Button>
            </div>
          )}
        </div>

        <details className="group rounded-xl border border-border bg-card lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
            Document details
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border">
            <DocumentDetails doc={doc} />
          </div>
        </details>

        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="h-full overflow-y-auto rounded-xl border border-border bg-card scrollbar-thin">
            <DocumentDetails doc={doc} />
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}

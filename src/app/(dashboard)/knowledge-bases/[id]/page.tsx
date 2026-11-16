"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilePlus2, FolderOpen, Loader2, MessageSquare } from "lucide-react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import {
  DocumentTable,
  isDocumentIndexed,
} from "@/components/documents/document-table";
import { DocumentCards } from "@/components/documents/document-cards";
import { AddExistingDialog } from "@/components/knowledge-bases/add-existing-dialog";
import { useKbDetails } from "@/hooks/use-kb-details";
import { formatFileSize } from "@/lib/format";

export default function KnowledgeBaseDetailPage() {
  const router = useRouter();
  const {
    kb,
    documents,
    loading,
    isAddExistingOpen,
    setIsAddExistingOpen,
    workspaceDocuments,
    selectedDocumentIds,
    isLinking,
    documentToDelete,
    setDocumentToDelete,
    isDeleting,
    deleteDocument,
    handleLinkDocuments,
    toggleDocumentSelection,
  } = useKbDetails();

  if (loading) {
    return (
      <PageContainer className="flex h-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading collection…</p>
      </PageContainer>
    );
  }

  if (!kb) {
    return (
      <PageContainer className="flex h-full flex-col items-center justify-center">
        <EmptyState
          icon={<FolderOpen aria-hidden="true" />}
          title="Collection not found"
          description="This collection does not exist or you do not have access to it."
          action={
            <Button asChild>
              <Link href="/knowledge-bases">Back to knowledge bases</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const indexedCount = documents.filter(isDocumentIndexed).length;
  const storage = documents.reduce((total, doc) => total + (doc.fileSize || 0), 0);

  return (
    <PageContainer className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title={kb.name}
        description={kb.description || "No description"}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Knowledge Bases", href: "/knowledge-bases" },
              { label: kb.name },
            ]}
          />
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setIsAddExistingOpen(true)}>
              <FilePlus2 className="size-4" />
              Add existing
            </Button>
            <Button
              onClick={() => router.push(`/chat?knowledgeBaseId=${kb.id}`)}
            >
              <MessageSquare className="size-4" />
              Chat with collection
            </Button>
          </>
        }
      />

      <dl className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card shadow-card">
        <div className="p-4">
          <dt className="text-xs text-muted-foreground">Documents</dt>
          <dd className="mt-1 text-xl font-semibold text-foreground">
            {documents.length}
          </dd>
        </div>
        <div className="p-4">
          <dt className="text-xs text-muted-foreground">AI ready</dt>
          <dd className="mt-1 text-xl font-semibold text-success">{indexedCount}</dd>
        </div>
        <div className="p-4">
          <dt className="text-xs text-muted-foreground">Storage</dt>
          <dd className="mt-1 text-xl font-semibold text-foreground">
            {formatFileSize(storage)}
          </dd>
        </div>
      </dl>

      {documents.length === 0 ? (
        <EmptyState
          icon={<FolderOpen aria-hidden="true" />}
          title="No documents in this collection"
          description="Upload documents in the Documents page, then add them here to chat against this collection."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => setIsAddExistingOpen(true)}>
                <FilePlus2 className="size-4" />
                Add existing documents
              </Button>
              <Button variant="outline" asChild>
                <Link href="/documents">Go to documents</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <DocumentCards
            documents={documents}
            onDelete={setDocumentToDelete}
          />
          <DocumentTable
            documents={documents}
            onDelete={setDocumentToDelete}
          />
        </>
      )}

      <AddExistingDialog
        isAddExistingOpen={isAddExistingOpen}
        setIsAddExistingOpen={setIsAddExistingOpen}
        workspaceDocuments={workspaceDocuments}
        selectedDocumentIds={selectedDocumentIds}
        toggleDocumentSelection={toggleDocumentSelection}
        handleLinkDocuments={handleLinkDocuments}
        isLinking={isLinking}
      />

      <ConfirmDialog
        open={!!documentToDelete}
        onOpenChange={(open) => !open && !isDeleting && setDocumentToDelete(null)}
        title="Delete this document?"
        description="This permanently removes the document from the workspace and from this collection. This action cannot be undone."
        confirmLabel="Delete document"
        onConfirm={async () => {
          if (documentToDelete) await deleteDocument(documentToDelete);
        }}
      />
    </PageContainer>
  );
}

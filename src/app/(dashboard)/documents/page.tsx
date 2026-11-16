"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  Building2,
  ChevronDown,
  FileSearch,
  Filter,
  FolderPlus,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { useDocuments } from "@/hooks/use-documents";
import { useWorkspaceStore } from "@/store/workspace-store";
import { UploadSection } from "@/components/documents/upload-section";
import { DocumentTable } from "@/components/documents/document-table";
import { DocumentCards } from "@/components/documents/document-cards";
import { DocumentDialogs } from "@/components/documents/document-dialogs";
import { formatMimeType } from "@/lib/format";

type SortValue =
  | "date-desc"
  | "date-asc"
  | "name-asc"
  | "name-desc"
  | "size-desc"
  | "size-asc";

const SORT_LABELS: Record<SortValue, string> = {
  "date-desc": "Newest first",
  "date-asc": "Oldest first",
  "name-asc": "Name A–Z",
  "name-desc": "Name Z–A",
  "size-desc": "Largest first",
  "size-asc": "Smallest first",
};

export default function DocumentsPage() {
  const router = useRouter();
  const { workspaces } = useWorkspaceStore();
  const {
    activeWorkspaceId,
    isUploading,
    loadingDocs,
    documentToDelete,
    setDocumentToDelete,
    isDeleting,
    currentFolderId,
    setCurrentFolderId,
    isCreatingFolder,
    setIsCreatingFolder,
    newFolderName,
    setNewFolderName,
    fileInputRef,
    kbs,
    selectedKb,
    setSelectedKb,
    isDragOver,
    uploadQueue,
    dismissUploadQueue,
    displayedFolders,
    displayedDocuments,
    currentFolder,
    folderPath,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileChange,
    confirmDelete,
    handleCreateFolder,
  } = useDocuments();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState<SortValue>("date-desc");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 200);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
  }, [currentFolderId]);

  const workspaceName = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId
  )?.name;

  const availableTypes = useMemo(
    () =>
      Array.from(
        new Set(displayedDocuments.map((doc) => formatMimeType(doc.mimeType)))
      ).sort(),
    [displayedDocuments]
  );

  const filteredFolders = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return displayedFolders
      .filter((folder) => !query || folder.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [debouncedSearch, displayedFolders]);

  const filteredDocuments = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return displayedDocuments
      .filter((doc) => {
        const name = `${doc.filename || ""} ${doc.title || ""}`.toLowerCase();
        if (query && !name.includes(query)) return false;

        if (statusFilter !== "all") {
          const status = String(doc.status || "").toUpperCase();
          if (statusFilter === "indexed" && !["INDEXED", "READY"].includes(status)) {
            return false;
          }
          if (
            statusFilter === "processing" &&
            !["UPLOADED", "PROCESSING", "PENDING", "INGESTING"].includes(status)
          ) {
            return false;
          }
          if (
            statusFilter === "error" &&
            !["ERROR", "FAILED", "CANCELLED", "CANCELED"].includes(status)
          ) {
            return false;
          }
        }

        if (
          typeFilter !== "all" &&
          formatMimeType(doc.mimeType) !== typeFilter
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case "name-asc":
            return (a.filename || a.title || "").localeCompare(
              b.filename || b.title || ""
            );
          case "name-desc":
            return (b.filename || b.title || "").localeCompare(
              a.filename || a.title || ""
            );
          case "size-desc":
            return (b.fileSize || 0) - (a.fileSize || 0);
          case "size-asc":
            return (a.fileSize || 0) - (b.fileSize || 0);
          case "date-asc":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case "date-desc":
          default:
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
      });
  }, [debouncedSearch, displayedDocuments, sort, statusFilter, typeFilter]);

  const activeFilterCount =
    (statusFilter === "all" ? 0 : 1) + (typeFilter === "all" ? 0 : 1);
  const hasItems = displayedFolders.length > 0 || displayedDocuments.length > 0;
  const hasResults = filteredFolders.length > 0 || filteredDocuments.length > 0;
  const hasFilters = Boolean(debouncedSearch.trim()) || activeFilterCount > 0;

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const breadcrumbItems = [
    { label: "Documents", onClick: () => setCurrentFolderId(null) },
    ...folderPath.map((folder, index) => ({
      label: folder.name,
      onClick:
        index === folderPath.length - 1
          ? undefined
          : () => setCurrentFolderId(folder.id),
    })),
  ];

  return (
    <PageContainer
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-8 backdrop-blur-sm">
          <div className="flex w-full max-w-xl flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary bg-card p-10 text-center shadow-overlay">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary-accent">
              <Upload className="size-6" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold">Drop files to upload</h2>
            <p className="text-sm text-muted-foreground">
              Files will be added to{" "}
              <span className="font-medium text-foreground">
                {selectedKb
                  ? kbs.find((kb) => kb.id === selectedKb)?.name
                  : workspaceName || "your workspace"}
              </span>
              {currentFolder ? ` in ${currentFolder.name}` : ""}.
            </p>
          </div>
        </div>
      ) : null}

      <PageHeader
        title="Documents"
        description="Upload, organize, and chat with the files in this workspace."
        breadcrumbs={
          currentFolderId ? <Breadcrumbs items={breadcrumbItems} /> : undefined
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setIsCreatingFolder(true)}
              variant="outline"
              disabled={!activeWorkspaceId}
              data-tour="new-folder"
            >
              <FolderPlus className="size-4" />
              New folder
            </Button>
            <Button
              onClick={() => {
                if (!activeWorkspaceId) {
                  toast.error("Please select a workspace first");
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={isUploading || !activeWorkspaceId}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {isUploading ? "Uploading…" : "Upload files"}
            </Button>
          </div>
        }
      />

      <UploadSection
        isUploading={isUploading}
        activeWorkspaceId={activeWorkspaceId}
        workspaceName={workspaceName}
        currentFolderName={currentFolder?.name}
        kbs={kbs}
        selectedKb={selectedKb}
        setSelectedKb={setSelectedKb}
        uploadQueue={uploadQueue}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        onDismissQueue={dismissUploadQueue}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search documents and folders"
          containerClassName="max-w-md"
          aria-label="Search documents"
        />

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="size-4" />
                Filters
                {activeFilterCount > 0 ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                ) : null}
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <DropdownMenuRadioItem value="all">
                  All statuses
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="indexed">
                  Indexed
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="processing">
                  Processing
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="error">
                  Error
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Type</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <DropdownMenuRadioItem value="all">
                  All types
                </DropdownMenuRadioItem>
                {availableTypes.map((type) => (
                  <DropdownMenuRadioItem key={type} value={type}>
                    {type}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              {hasFilters ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={clearFilters} className="gap-2">
                    <X className="size-4" /> Clear filters
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortValue)}
              aria-label="Sort documents"
              className="h-9 appearance-none rounded-lg border border-input bg-card pl-9 pr-8 text-sm text-foreground shadow-card outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="pb-6">
        {loadingDocs ? (
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/5" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : !activeWorkspaceId ? (
          <EmptyState
            icon={<Building2 aria-hidden="true" />}
            title="No workspace selected"
            description="Select or create a workspace before uploading and managing documents."
            action={
              <Button onClick={() => router.push("/settings/team")}>
                Manage workspaces
              </Button>
            }
          />
        ) : !hasItems ? (
          <EmptyState
            icon={<FolderPlus aria-hidden="true" />}
            title={currentFolderId ? "This folder is empty" : "No documents yet"}
            description={
              currentFolderId
                ? "Upload a file here, or create a subfolder to keep things organized."
                : "Upload your first document, or create a folder to organize your workspace."
            }
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!activeWorkspaceId}
                >
                  <Upload className="size-4" />
                  Upload files
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingFolder(true)}
                >
                  <FolderPlus className="size-4" />
                  New folder
                </Button>
              </div>
            }
          />
        ) : !hasResults ? (
          <EmptyState
            icon={<FileSearch aria-hidden="true" />}
            title="No matching documents"
            description="Try a different search term or clear the active filters."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear search and filters
              </Button>
            }
          />
        ) : (
          <>
            <DocumentCards
              folders={filteredFolders}
              documents={filteredDocuments}
              onOpenFolder={setCurrentFolderId}
              onDelete={setDocumentToDelete}
            />
            <DocumentTable
              folders={filteredFolders}
              documents={filteredDocuments}
              onOpenFolder={setCurrentFolderId}
              onDelete={setDocumentToDelete}
            />
          </>
        )}
      </div>

      <DocumentDialogs
        documentToDelete={documentToDelete}
        setDocumentToDelete={setDocumentToDelete}
        confirmDelete={confirmDelete}
        isDeleting={isDeleting}
        isCreatingFolder={isCreatingFolder}
        setIsCreatingFolder={setIsCreatingFolder}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        handleCreateFolder={handleCreateFolder}
      />
    </PageContainer>
  );
}

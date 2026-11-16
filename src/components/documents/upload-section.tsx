"use client";

import { useId } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface UploadQueueItem {
  name: string;
  progress: number;
  size?: number;
  status: "pending" | "uploading" | "done" | "error";
  errorMessage?: string;
}

export interface UploadDestination {
  id: string;
  name: string;
}

interface UploadSectionProps {
  isUploading: boolean;
  activeWorkspaceId: string | null;
  workspaceName?: string;
  currentFolderName?: string;
  kbs: UploadDestination[];
  selectedKb: string;
  setSelectedKb: (id: string) => void;
  uploadQueue: UploadQueueItem[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDismissQueue: () => void;
}

export function UploadSection({
  isUploading,
  activeWorkspaceId,
  workspaceName,
  currentFolderName,
  kbs,
  selectedKb,
  setSelectedKb,
  uploadQueue,
  fileInputRef,
  handleFileChange,
  onDismissQueue,
}: UploadSectionProps) {
  const selectId = useId();
  const selectedDestination =
    kbs.find((kb) => kb.id === selectedKb)?.name || workspaceName || "Workspace";

  const openFilePicker = () => {
    if (!activeWorkspaceId) {
      toast.error("Please select a workspace first");
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <section
      data-tour="upload-zone"
      className="rounded-xl border border-border bg-card shadow-card"
      aria-label="Upload documents"
    >
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={openFilePicker}
          disabled={!activeWorkspaceId}
          className={cn(
            "group flex min-h-12 flex-1 items-center gap-3 rounded-lg border border-dashed border-border px-3 text-left transition-colors",
            "hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            !activeWorkspaceId && "cursor-not-allowed opacity-60"
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">
              {isUploading ? "Uploading files…" : "Drag and drop files, or browse"}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              PDF, DOCX, PPTX, TXT, MD, CSV, JSON · up to 20 MB each
            </span>
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <label
            htmlFor={selectId}
            className="hidden text-xs font-medium text-muted-foreground sm:block"
          >
            Upload to
          </label>
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <select
              id={selectId}
              value={selectedKb}
              onChange={(event) => setSelectedKb(event.target.value)}
              disabled={isUploading || !activeWorkspaceId}
              className="h-9 w-full max-w-[240px] appearance-none truncate rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
              title={`Upload to ${selectedDestination}`}
            >
              <option value="">{workspaceName || "Workspace"}</option>
              {kbs.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <Button
            type="button"
            onClick={openFilePicker}
            disabled={isUploading || !activeWorkspaceId}
            loading={isUploading}
            className="shrink-0"
          >
            Upload
          </Button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.docx,.pptx,.txt,.md,.csv,.json"
        disabled={!activeWorkspaceId}
        multiple
      />

      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
        {isUploading ? "Uploading to" : "Uploads go to"}{" "}
        <span className="font-medium text-foreground">{selectedDestination}</span>
        {currentFolderName ? (
          <>
            {" "}in <span className="font-medium text-foreground">{currentFolderName}</span>
          </>
        ) : null}
      </div>

      {uploadQueue.length > 0 ? (
        <div className="border-t border-border">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Uploads
            </p>
            {!isUploading ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={onDismissQueue}
                aria-label="Dismiss upload results"
              >
                <X className="size-3.5" />
              </Button>
            ) : null}
          </div>
          <ul className="max-h-44 space-y-2 overflow-y-auto px-3 pb-3 scrollbar-thin">
            {uploadQueue.map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className="rounded-lg border border-border bg-background/60 p-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                      item.status === "done" && "bg-success-soft text-success",
                      item.status === "error" && "bg-destructive-soft text-destructive",
                      (item.status === "pending" || item.status === "uploading") &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    {item.status === "done" ? (
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    ) : item.status === "error" ? (
                      <AlertCircle className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-xs font-medium text-foreground" title={item.name}>
                        {item.name}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {item.status === "done"
                          ? "Uploaded"
                          : item.status === "error"
                            ? "Failed"
                            : `${item.progress}%`}
                      </span>
                    </div>
                    {item.status === "error" ? (
                      <p className="mt-0.5 text-[11px] text-destructive">
                        {item.errorMessage || "Upload failed"}
                      </p>
                    ) : (
                      <Progress
                        value={item.progress}
                        className="mt-1.5 h-1"
                        indicatorClassName={cn(
                          item.status === "done" && "bg-success"
                        )}
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

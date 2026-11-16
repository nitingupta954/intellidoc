"use client";

import Link from "next/link";
import { Building2, FilePlus2, FolderPlus, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspace-store";

interface DashboardHeaderProps {
  firstName: string;
  initialWorkspaceName: string | null;
}

export function DashboardHeader({
  firstName,
  initialWorkspaceName,
}: DashboardHeaderProps) {
  const { workspaces, activeWorkspaceId } = useWorkspaceStore();
  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId
  );
  const workspaceName = activeWorkspace?.name ?? initialWorkspaceName;

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="neutral" className="max-w-full">
              <Building2 aria-hidden="true" />
              <span className="truncate">{workspaceName ?? "Workspace"}</span>
            </Badge>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground md:text-[28px]">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            A focused view of your documents, questions, and what needs
            attention across your workspaces.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button asChild>
            <Link href="/documents">
              <FilePlus2 className="size-4" aria-hidden="true" />
              Upload Document
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/chat">
              <MessageSquare className="size-4" aria-hidden="true" />
              Ask a question
            </Link>
          </Button>
          <Button asChild variant="ghost" className="sm:hidden xl:inline-flex">
            <Link href="/knowledge-bases">
              <FolderPlus className="size-4" aria-hidden="true" />
              New collection
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

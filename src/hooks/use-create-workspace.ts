"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/store/workspace-store";

export function useCreateWorkspace() {
  const { loadWorkspaces, setActiveWorkspace } = useWorkspaceStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWorkspaceName, description: newWorkspaceDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Workspace created");
        setIsCreateOpen(false);
        setNewWorkspaceName("");
        setNewWorkspaceDesc("");
        await loadWorkspaces();
        setActiveWorkspace(data.workspace.id);
      } else {
        toast.error(data.error || "Failed to create workspace");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreateOpen,
    setIsCreateOpen,
    newWorkspaceName,
    setNewWorkspaceName,
    newWorkspaceDesc,
    setNewWorkspaceDesc,
    isCreating,
    handleCreateWorkspace,
  };
}

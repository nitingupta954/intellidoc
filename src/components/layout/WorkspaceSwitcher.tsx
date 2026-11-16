"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/store/workspace-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WorkspaceDialog } from "@/components/team/workspace-dialog";
import { useCreateWorkspace } from "@/hooks/use-create-workspace";
import { Building2, Check, ChevronDown, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function WorkspaceSwitcher({ collapsed = false, onNavigate }: WorkspaceSwitcherProps) {
  const { workspaces, activeWorkspaceId, loadWorkspaces, setActiveWorkspace, isLoading } =
    useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const create = useCreateWorkspace();

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);

  const menu = (
    <DropdownMenuContent
      align="start"
      side={collapsed ? "right" : "bottom"}
      sideOffset={8}
      collisionPadding={8}
      className="w-64"
    >
      <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
      {isLoading ? (
        <DropdownMenuItem disabled>
          <Loader2 className="size-4 animate-spin" />
          Loading workspaces...
        </DropdownMenuItem>
      ) : workspaces.length === 0 ? (
        <DropdownMenuItem disabled>No workspaces yet</DropdownMenuItem>
      ) : (
        workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={() => {
              setActiveWorkspace(workspace.id);
              setOpen(false);
              onNavigate?.();
            }}
            className="gap-2 py-2"
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary-accent">
              <Building2 className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
            {activeWorkspaceId === workspace.id ? (
              <Check className="size-4 shrink-0 text-primary-accent" />
            ) : null}
          </DropdownMenuItem>
        ))
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={() => {
          setOpen(false);
          create.setIsCreateOpen(true);
        }}
        className="gap-2 py-2 text-primary-accent focus:text-primary-accent"
      >
        <Plus className="size-4" />
        Create workspace
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  const triggerContent = (
    <>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary-accent">
        <Building2 className="size-3.5" />
      </span>
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
            {activeWorkspace?.name || "Select workspace"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </>
      ) : null}
    </>
  );

  const triggerButton = (
    <Button
      variant="outline"
      aria-label={collapsed ? "Switch workspace" : undefined}
      className={cn(
        "group h-9 border-border bg-background font-normal shadow-none hover:bg-muted",
        collapsed ? "w-9 justify-center px-0" : "w-full justify-start gap-2 px-2.5"
      )}
      data-tour="workspace-selector"
    >
      {triggerContent}
    </Button>
  );

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">{activeWorkspace?.name || "Switch workspace"}</TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
        )}
        {menu}
      </DropdownMenu>

      <WorkspaceDialog
        isOpen={create.isCreateOpen}
        setIsOpen={create.setIsCreateOpen}
        workspaceName={create.newWorkspaceName}
        setWorkspaceName={create.setNewWorkspaceName}
        workspaceDesc={create.newWorkspaceDesc}
        setWorkspaceDesc={create.setNewWorkspaceDesc}
        onCreate={create.handleCreateWorkspace}
        isCreating={create.isCreating}
        trigger={null}
      />
    </>
  );
}

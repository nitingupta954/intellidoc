"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface WorkspaceDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  workspaceDesc: string;
  setWorkspaceDesc: (desc: string) => void;
  onCreate: () => Promise<void>;
  isCreating: boolean;
  trigger?: React.ReactNode | null;
}

export function WorkspaceDialog({
  isOpen,
  setIsOpen,
  workspaceName,
  setWorkspaceName,
  workspaceDesc,
  setWorkspaceDesc,
  onCreate,
  isCreating,
  trigger,
}: WorkspaceDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger === null ? null : (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              <Plus className="size-4" aria-hidden="true" />
              Create workspace
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a workspace</DialogTitle>
          <DialogDescription>
            Workspaces keep documents, collections, and conversations isolated.
            You will be the owner of this workspace.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onCreate();
          }}
        >
          <div className="space-y-2">
            <label htmlFor="workspace-name" className="text-sm font-medium">
              Workspace name
            </label>
            <Input
              id="workspace-name"
              autoFocus
              required
              maxLength={80}
              placeholder="e.g. Engineering team"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="workspace-description"
              className="text-sm font-medium"
            >
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="workspace-description"
              rows={3}
              maxLength={300}
              placeholder="What will this workspace be used for?"
              value={workspaceDesc}
              onChange={(event) => setWorkspaceDesc(event.target.value)}
            />
          </div>
          <DialogFooter className="-mx-0 -mb-0 mt-2 rounded-none border-0 bg-transparent p-0">
            <Button
              type="submit"
              loading={isCreating}
              disabled={!workspaceName.trim()}
            >
              Create workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

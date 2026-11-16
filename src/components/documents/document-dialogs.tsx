"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";

interface DocumentDialogsProps {
  documentToDelete: string | null;
  setDocumentToDelete: (id: string | null) => void;
  confirmDelete: () => void | Promise<void>;
  isDeleting: boolean;
  isCreatingFolder: boolean;
  setIsCreatingFolder: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  handleCreateFolder: (e: React.FormEvent) => void;
}

export function DocumentDialogs({
  documentToDelete,
  setDocumentToDelete,
  confirmDelete,
  isDeleting,
  isCreatingFolder,
  setIsCreatingFolder,
  newFolderName,
  setNewFolderName,
  handleCreateFolder,
}: DocumentDialogsProps) {
  return (
    <>
      <ConfirmDialog
        open={!!documentToDelete}
        onOpenChange={(open) => !open && !isDeleting && setDocumentToDelete(null)}
        title="Delete this document?"
        description="This permanently removes the document, its extracted text, and its indexed chunks. This action cannot be undone."
        confirmLabel="Delete document"
        onConfirm={async () => {
          await confirmDelete();
        }}
      />

      <AlertDialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create a new folder</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a name for the folder. Uploaded files can be moved into it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form
            className="py-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleCreateFolder(event);
            }}
          >
            <Input
              type="text"
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              placeholder="Folder name"
              autoFocus
            />
          </form>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleCreateFolder(event);
              }}
              disabled={!newFolderName.trim()}
            >
              Create folder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

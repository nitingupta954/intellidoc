"use client";

import { UserPlus } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InviteDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  inviteRole: string;
  setInviteRole: (role: string) => void;
  onInvite: () => Promise<void>;
  isInviting: boolean;
}

export function InviteDialog({
  isOpen,
  setIsOpen,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  onInvite,
  isInviting,
}: InviteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" aria-hidden="true" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            Send an invitation to join this workspace. Role permissions apply
            once they accept.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onInvite();
          }}
        >
          <div className="space-y-2">
            <label htmlFor="invite-email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="invite-email"
              type="email"
              autoFocus
              required
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="invite-role" className="text-sm font-medium">
              Role
            </label>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Admins can manage members and workspace content. Members can use
              the workspace.
            </p>
          </div>
          <DialogFooter className="-mx-0 -mb-0 mt-2 rounded-none border-0 bg-transparent p-0">
            <Button
              type="submit"
              loading={isInviting}
              disabled={!inviteEmail.trim()}
            >
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

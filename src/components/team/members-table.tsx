"use client";

import { useState } from "react";
import { Shield, Trash2, User } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, type StatusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatPlanName } from "@/lib/format";

interface Member {
  id: string;
  userId: string;
  role: string;
  createdAt: string | Date;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface MembersTableProps {
  isLoading: boolean;
  members: Member[];
  isOwnerOrAdmin: boolean;
  currentUserId?: string;
  onRemoveMember: (userId: string) => Promise<void>;
}

const ROLE_TONES: Record<string, StatusTone> = {
  OWNER: "success",
  ADMIN: "info",
  MEMBER: "neutral",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <Badge tone={ROLE_TONES[role] ?? "neutral"}>
      {role === "OWNER" || role === "ADMIN" ? (
        <Shield aria-hidden="true" />
      ) : (
        <User aria-hidden="true" />
      )}
      {formatPlanName(role)}
    </Badge>
  );
}

export function MembersTable({
  isLoading,
  members,
  isOwnerOrAdmin,
  currentUserId,
  onRemoveMember,
}: MembersTableProps) {
  const [pendingRemove, setPendingRemove] = useState<Member | null>(null);

  const canRemove = (member: Member) =>
    isOwnerOrAdmin &&
    member.userId !== currentUserId &&
    member.role !== "OWNER";

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<User aria-hidden="true" />}
        title="No members yet"
        description="Invite a teammate to collaborate in this workspace."
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const name = member.user.name || member.user.email || "Unknown member";
              return (
                <TableRow key={member.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={name} size="sm" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {member.user.name ||
                            member.user.email?.split("@")[0] ||
                            "Unknown"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.user.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={member.role} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(member.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {canRemove(member) ? (
                      <IconButton
                        aria-label={`Remove ${name}`}
                        tooltip="Remove member"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-destructive-soft hover:text-destructive"
                        onClick={() => setPendingRemove(member)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </IconButton>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden">
        {members.map((member) => {
          const name = member.user.name || member.user.email || "Unknown member";
          return (
            <li
              key={member.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={name} size="sm" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {member.user.name ||
                        member.user.email?.split("@")[0] ||
                        "Unknown"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.user.email || "No email"}
                    </p>
                  </div>
                </div>
                <RoleBadge role={member.role} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">
                  Joined {formatDate(member.createdAt)}
                </span>
                {canRemove(member) ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive-soft hover:text-destructive"
                    onClick={() => setPendingRemove(member)}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Remove
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(null);
        }}
        title="Remove this member?"
        description={`${pendingRemove?.user.name || pendingRemove?.user.email || "This member"} will lose access to this workspace. Their account and other workspaces are not affected.`}
        confirmLabel="Remove member"
        onConfirm={async () => {
          if (!pendingRemove) return;
          await onRemoveMember(pendingRemove.userId);
          setPendingRemove(null);
        }}
      />
    </>
  );
}

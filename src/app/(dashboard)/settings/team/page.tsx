"use client";

import { useSession } from "next-auth/react";
import { Building2, Lock, Users } from "lucide-react";

import { InviteDialog } from "@/components/team/invite-dialog";
import { MembersTable } from "@/components/team/members-table";
import { WorkspaceDialog } from "@/components/team/workspace-dialog";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { formatPlanName } from "@/lib/format";

export default function TeamSettingsPage() {
  const { data: session } = useSession();
  const {
    activeWorkspaceId,
    activeWorkspace,
    isOwnerOrAdmin,
    members,
    isLoading,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    isInviteOpen,
    setIsInviteOpen,
    isInviting,
    isCreateOpen,
    setIsCreateOpen,
    newWorkspaceName,
    setNewWorkspaceName,
    newWorkspaceDesc,
    setNewWorkspaceDesc,
    isCreating,
    handleInvite,
    handleRemoveMember,
    handleCreateWorkspace,
  } = useTeamSettings();

  const workspaceDialogElement = (
    <WorkspaceDialog
      isOpen={isCreateOpen}
      setIsOpen={setIsCreateOpen}
      workspaceName={newWorkspaceName}
      setWorkspaceName={setNewWorkspaceName}
      workspaceDesc={newWorkspaceDesc}
      setWorkspaceDesc={setNewWorkspaceDesc}
      onCreate={handleCreateWorkspace}
      isCreating={isCreating}
    />
  );

  if (!activeWorkspaceId) {
    return (
      <PageContainer className="space-y-8 pb-8">
        <PageHeader
          title="Workspace & team"
          description="Create a workspace to group documents, collections, and conversations."
        />
        <EmptyState
          icon={<Building2 aria-hidden="true" />}
          title="No workspace selected"
          description="Create a workspace to start collaborating with your team."
          action={workspaceDialogElement}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8 pb-8">
      <PageHeader
        title="Workspace & team"
        description="Manage workspace access and membership."
        actions={workspaceDialogElement}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-4 text-primary-accent" aria-hidden="true" />
                {activeWorkspace?.name || "Workspace"}
              </CardTitle>
              <CardDescription>
                {activeWorkspace?.description ||
                  "This workspace keeps its documents and conversations together."}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">
                <Lock aria-hidden="true" />
                Isolated workspace
              </Badge>
              {activeWorkspace?.role ? (
                <Badge tone="neutral">
                  Your role: {formatPlanName(activeWorkspace.role)}
                </Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Members, documents, collections, and chat history are scoped to this
            workspace. Switching workspaces replaces the data shown across the
            app; access is checked against your membership before data is
            returned.
          </p>
        </CardContent>
      </Card>

      <section aria-labelledby="members-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-muted-foreground" aria-hidden="true" />
            <h2
              id="members-title"
              className="font-heading text-lg font-semibold text-foreground"
            >
              Members
            </h2>
            <Badge tone="neutral">{members.length}</Badge>
          </div>
          {isOwnerOrAdmin ? (
            <InviteDialog
              isOpen={isInviteOpen}
              setIsOpen={setIsInviteOpen}
              inviteEmail={inviteEmail}
              setInviteEmail={setInviteEmail}
              inviteRole={inviteRole}
              setInviteRole={setInviteRole}
              onInvite={handleInvite}
              isInviting={isInviting}
            />
          ) : null}
        </div>

        <MembersTable
          isLoading={isLoading}
          members={members}
          isOwnerOrAdmin={isOwnerOrAdmin}
          currentUserId={session?.user?.id}
          onRemoveMember={handleRemoveMember}
        />
      </section>
    </PageContainer>
  );
}

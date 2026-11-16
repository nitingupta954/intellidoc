"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Edit2,
  Loader2,
  MessageSquarePlus,
  MoreVertical,
  SearchX,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import {
  useConversationStore,
  type Conversation,
} from "@/store/conversation-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";

const DAY_MS = 86_400_000;
const dayFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function groupConversations(conversations: Conversation[]) {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayKey = dayFormatter.format(now);
  const yesterdayKey = dayFormatter.format(yesterday);
  const groups: Array<{ label: string; conversations: Conversation[] }> = [
    { label: "Pinned", conversations: [] },
    { label: "Today", conversations: [] },
    { label: "Yesterday", conversations: [] },
    { label: "Previous 7 days", conversations: [] },
    { label: "Older", conversations: [] },
  ];

  for (const conversation of conversations) {
    if (conversation.isPinned) {
      groups[0].conversations.push(conversation);
      continue;
    }

    const updatedAt = new Date(conversation.updatedAt);
    const dayKey = dayFormatter.format(updatedAt);
    const daysAgo = Math.floor((today - startOfDay(updatedAt)) / DAY_MS);
    if (dayKey === todayKey) groups[1].conversations.push(conversation);
    else if (dayKey === yesterdayKey) groups[2].conversations.push(conversation);
    else if (daysAgo <= 7) groups[3].conversations.push(conversation);
    else groups[4].conversations.push(conversation);
  }

  return groups.filter((group) => group.conversations.length > 0);
}

export function ChatSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    loadConversations,
    deleteConversation,
    renameConversation,
    isLoading,
    walletBalance,
    isBYOK,
    fetchWalletBalance,
  } = useConversationStore();

  const { activeWorkspaceId } = useWorkspaceStore();

  const [search, setSearch] = useState("");
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(
    null
  );
  const renameLockRef = useRef(false);

  useEffect(() => {
    if (activeWorkspaceId) {
      loadConversations(activeWorkspaceId);
    }
    fetchWalletBalance();
  }, [loadConversations, activeWorkspaceId, fetchWalletBalance]);

  const handleNewChat = () => {
    setActiveConversation(null);
    onNavigate?.();
  };

  const handleSelect = (id: string) => {
    setActiveConversation(id);
    onNavigate?.();
  };

  const handleDelete = (
    event: { stopPropagation: () => void },
    id: string
  ) => {
    event.stopPropagation();
    setConversationToDelete(id);
  };

  const handleRenameStart = (
    event: { stopPropagation: () => void },
    id: string,
    currentTitle: string
  ) => {
    event.stopPropagation();
    renameLockRef.current = false;
    setIsRenaming(id);
    setRenameValue(currentTitle);
  };

  const handleRenameSubmit = async (
    event: React.KeyboardEvent | React.FocusEvent,
    id: string
  ) => {
    if ("key" in event) {
      if (event.key === "Escape") {
        renameLockRef.current = true;
        setIsRenaming(null);
        return;
      }
      if (event.key !== "Enter") return;
      event.preventDefault();
    }
    event.stopPropagation();
    if (renameLockRef.current) return;
    renameLockRef.current = true;
    if (renameValue.trim()) {
      await renameConversation(id, renameValue.trim());
    }
    setIsRenaming(null);
  };

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter(
      (conversation) =>
        !query || conversation.title.toLowerCase().includes(query)
    );
  }, [conversations, search]);

  const groupedConversations = useMemo(
    () => groupConversations(visibleConversations),
    [visibleConversations]
  );

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col border-r border-border bg-card",
        className
      )}
    >
      <div className="flex shrink-0 flex-col gap-3 border-b border-border p-4">
        <Button onClick={handleNewChat} className="w-full justify-start gap-2">
          <MessageSquarePlus className="size-4" />
          New chat
        </Button>
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search chats"
          aria-label="Search chats"
        />
      </div>

      {!isBYOK && walletBalance !== null && walletBalance < 5000 ? (
        <div className="mx-3 mt-3 flex shrink-0 flex-col gap-1.5 rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-destructive">
            <AlertCircle className="size-3.5" aria-hidden="true" />
            Low credits
          </span>
          <span className="text-muted-foreground">
            {walletBalance.toLocaleString()} credits remaining.
          </span>
          <Link
            href="/billing"
            className="font-medium text-primary-accent hover:underline"
          >
            Refill credits
          </Link>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mb-2 size-5 animate-spin" />
            <span className="text-sm">Loading chats…</span>
          </div>
        ) : groupedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-3 py-10 text-center">
            <span className="mb-2 flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <SearchX className="size-4" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium">
              {search ? "No matching chats" : "No chats yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search
                ? "Try a different title."
                : "Start a conversation to see it here."}
            </p>
          </div>
        ) : (
          groupedConversations.map((group) => (
            <section key={group.label} className="mb-4">
              <h2 className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h2>
              <div className="space-y-0.5">
                {group.conversations.map((conversation) => {
                  const isActive = activeConversationId === conversation.id;
                  return (
                    <div
                      key={conversation.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelect(conversation.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleSelect(conversation.id);
                        }
                      }}
                      className={cn(
                        "group flex min-h-9 items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-accent font-medium text-accent-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        {isRenaming === conversation.id ? (
                          <Input
                            value={renameValue}
                            onChange={(event) => setRenameValue(event.target.value)}
                            onKeyDown={(event) =>
                              handleRenameSubmit(event, conversation.id)
                            }
                            onBlur={(event) =>
                              handleRenameSubmit(event, conversation.id)
                            }
                            onClick={(event) => event.stopPropagation()}
                            autoFocus
                            className="h-7 px-2 text-sm"
                            aria-label="Chat title"
                          />
                        ) : (
                          <div className="truncate" title={conversation.title}>
                            {conversation.title}
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Actions for ${conversation.title}`}
                            className="shrink-0 opacity-100 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <MoreVertical className="size-3.5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="gap-2"
                            onSelect={(event) =>
                              handleRenameStart(
                                event,
                                conversation.id,
                                conversation.title
                              )
                            }
                          >
                            <Edit2 className="size-3.5" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            className="gap-2"
                            onSelect={(event) =>
                              handleDelete(event, conversation.id)
                            }
                          >
                            <Trash2 className="size-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!conversationToDelete}
        onOpenChange={(open) => !open && setConversationToDelete(null)}
        title="Delete this chat?"
        description="This permanently deletes the conversation and its messages. This action cannot be undone."
        confirmLabel="Delete chat"
        onConfirm={async () => {
          if (conversationToDelete) {
            await deleteConversation(conversationToDelete);
            setConversationToDelete(null);
          }
        }}
      />
    </div>
  );
}

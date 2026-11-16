"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  BrainCircuit,
  ChevronDown,
  Download,
  FileDown,
  FileText,
  Info,
  Loader2,
  Menu,
  PanelLeft,
  PanelRight,
  Share2,
} from "lucide-react";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import {
  getCitationSources,
  SourcesPanel,
} from "@/components/chat/chat-citations";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { useChat } from "@/hooks/use-chat";
import { exportAsMarkdown, exportAsPdf } from "@/lib/export-chat";
import { formatFileName } from "@/lib/format";

function ChatContent() {
  const {
    messages,
    isGenerating,
    activeConversationId,
    input,
    setInput,
    isChatSidebarOpen,
    setIsChatSidebarOpen,
    hasKey,
    messagesEndRef,
    scrollContainerRef,
    showJumpToLatest,
    scrollToBottom,
    handleScroll,
    kbs,
    setSelectedKbId,
    docDetails,
    isSharing,
    docId,
    docTitle,
    activeConversation,
    currentKbId,
    handleSend,
    handleTranscript,
    handleKeyDown,
    handleShare,
  } = useChat();

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isSourcesDrawerOpen, setIsSourcesDrawerOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [sourcesMessageId, setSourcesMessageId] = useState<string | null>(null);

  const sourceMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          String(message.role || "").toLowerCase() === "assistant" &&
          getCitationSources(message.citations).length > 0
      ),
    [messages]
  );

  const latestSourceMessageId =
    sourceMessages[sourceMessages.length - 1]?.id ?? null;

  useEffect(() => {
    setSourcesMessageId(latestSourceMessageId);
  }, [latestSourceMessageId]);

  const activeSourceMessage =
    messages.find((message) => message.id === sourcesMessageId) ??
    sourceMessages[sourceMessages.length - 1];

  const sourceCount = getCitationSources(activeSourceMessage?.citations).length;

  const currentKb = kbs.find((kb) => kb.id === currentKbId);
  const scopeLabel = docId
    ? formatFileName(docTitle || "Current document")
    : currentKb?.name || "All workspace documents";
  const isScopeFixed = Boolean(activeConversationId || docId);

  const handleOpenSources = (messageId: string) => {
    setSourcesMessageId(messageId);
    if (window.matchMedia("(min-width: 1280px)").matches) {
      setIsSourcesOpen(true);
    } else {
      setIsSourcesDrawerOpen(true);
    }
    if (!showJumpToLatest) {
      requestAnimationFrame(() => scrollToBottom("auto"));
    }
  };

  const handleToggleSources = () => {
    if (window.matchMedia("(min-width: 1280px)").matches) {
      setIsSourcesOpen((open) => !open);
    } else {
      setIsSourcesDrawerOpen(true);
    }
    if (!showJumpToLatest) {
      requestAnimationFrame(() => scrollToBottom("auto"));
    }
  };

  return (
    <PageContainer
      variant="fullBleed"
      className="flex h-full min-h-0 overflow-hidden rounded-xl border border-border bg-card"
    >
      {isChatSidebarOpen ? (
        <aside className="hidden w-[280px] shrink-0 lg:block 2xl:w-[300px]">
          <ChatSidebar />
        </aside>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <IconButton
                aria-label="Open chat history"
                tooltip="Chat history"
                size="icon-sm"
                className="lg:hidden"
                onClick={() => setIsHistoryDrawerOpen(true)}
              >
                <Menu className="size-4" />
              </IconButton>

              <IconButton
                aria-label={
                  isChatSidebarOpen ? "Hide chat history" : "Show chat history"
                }
                tooltip={
                  isChatSidebarOpen ? "Hide chat history" : "Show chat history"
                }
                size="icon-sm"
                className="hidden lg:inline-flex"
                onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
              >
                <PanelLeft className="size-4" />
              </IconButton>

              <span
                className={`hidden size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ${
                  isSourcesOpen ? "2xl:flex" : "sm:flex"
                }`}
              >
                <BrainCircuit className="size-4" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <h1 className="truncate font-heading text-sm font-semibold">
                  IntelliDoc Assistant
                </h1>
                <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 shrink-0 rounded-full bg-success" />
                  {docId ? (
                    <span
                      className="inline-flex min-w-0 items-center gap-1"
                      title={scopeLabel}
                    >
                      <FileText className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{scopeLabel}</span>
                    </span>
                  ) : kbs.length > 0 ? (
                    <span className="relative inline-flex min-w-0 items-center">
                      <select
                        value={currentKbId}
                        onChange={(event) => setSelectedKbId(event.target.value)}
                        disabled={isScopeFixed}
                        aria-label="Chat scope"
                        title={
                          isScopeFixed
                            ? "Scope is fixed for this conversation"
                            : "Choose a collection scope"
                        }
                        className="h-6 max-w-[220px] appearance-none truncate rounded-full border border-border bg-background py-0 pl-2 pr-6 text-[11px] font-medium text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-80"
                      >
                        <option value="">All workspace documents</option>
                        {kbs.map((kb) => (
                          <option key={kb.id} value={kb.id}>
                            {kb.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-1.5 size-3 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </span>
                  ) : (
                    <span className="truncate" title={scopeLabel}>
                      {scopeLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <IconButton
                aria-label="Toggle sources"
                tooltip={
                  sourceCount > 0 ? `Sources (${sourceCount})` : "Sources"
                }
                size="icon-sm"
                disabled={messages.length === 0}
                onClick={handleToggleSources}
              >
                <span className="relative">
                  <PanelRight className="size-4" />
                  {sourceCount > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-semibold leading-none text-primary-foreground">
                      {sourceCount > 9 ? "9+" : sourceCount}
                    </span>
                  ) : null}
                </span>
              </IconButton>

              {activeConversationId && messages.length > 0 ? (
                <IconButton
                  aria-label="Share chat"
                  tooltip="Copy share link"
                  size="icon-sm"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Share2 className="size-4" />
                  )}
                </IconButton>
              ) : null}

              {messages.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Export chat"
                      title="Export chat"
                    >
                      <Download className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="gap-2"
                      onSelect={() =>
                        exportAsMarkdown(
                          messages,
                          activeConversation?.title || "IntelliDoc Chat"
                        )
                      }
                    >
                      <FileText className="size-3.5" />
                      Export as Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2"
                      onSelect={() =>
                        exportAsPdf(
                          messages,
                          activeConversation?.title || "IntelliDoc Chat"
                        )
                      }
                    >
                      <FileDown className="size-3.5" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}

              <IconButton
                aria-label="About this chat"
                tooltip="About this chat"
                size="icon-sm"
                onClick={() => setIsInfoOpen(true)}
              >
                <Info className="size-4" />
              </IconButton>
            </div>
          </header>

          <div className="relative min-h-0 flex-1">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin"
            >
              <ChatMessages
                messages={messages}
                isGenerating={isGenerating}
                hasKey={hasKey}
                messagesEndRef={messagesEndRef}
                docTitle={docTitle}
                docDetails={docDetails}
                setInput={setInput}
                activeConversationId={activeConversationId}
                onOpenSources={handleOpenSources}
              />
            </div>

            {showJumpToLatest && messages.length > 0 ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="pointer-events-auto gap-1.5 rounded-full shadow-md"
                  onClick={() => scrollToBottom()}
                >
                  <ArrowDown className="size-3.5" />
                  Jump to latest
                </Button>
              </div>
            ) : null}
          </div>

          <ChatInput
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            onTranscript={handleTranscript}
            handleKeyDown={handleKeyDown}
            isGenerating={isGenerating}
            hasKey={hasKey}
          />
        </div>

        {isSourcesOpen ? (
          <aside className="hidden w-[300px] shrink-0 border-l border-border xl:block 2xl:w-[340px]">
            <SourcesPanel
              citations={activeSourceMessage?.citations}
              onClose={() => setIsSourcesOpen(false)}
            />
          </aside>
        ) : null}
      </div>

      <Drawer
        open={isHistoryDrawerOpen}
        onOpenChange={setIsHistoryDrawerOpen}
        direction="left"
      >
        <DrawerContent className="w-[300px] max-w-[85vw] p-0">
          <DrawerTitle className="sr-only">Chat history</DrawerTitle>
          <ChatSidebar
            className="border-r-0"
            onNavigate={() => setIsHistoryDrawerOpen(false)}
          />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isSourcesDrawerOpen}
        onOpenChange={setIsSourcesDrawerOpen}
        direction="right"
      >
        <DrawerContent className="w-[90vw] max-w-[380px] p-0">
          <DrawerTitle className="sr-only">Sources</DrawerTitle>
          <SourcesPanel
            citations={activeSourceMessage?.citations}
            onClose={() => setIsSourcesDrawerOpen(false)}
            className="border-l-0"
          />
        </DrawerContent>
      </Drawer>

      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>About this chat</DialogTitle>
            <DialogDescription>
              Answers are grounded in passages retrieved from your workspace
              documents.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Scope
              </p>
              <div className="mt-1.5">
                <Badge tone="neutral" size="sm" className="max-w-full">
                  <span className="truncate">{scopeLabel}</span>
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">
              Citations show the source file, match score, and—when
              available—the page or section used. Open the Sources panel to read
              the retrieved excerpts and jump to a document.
            </p>
            <p className="text-muted-foreground">
              IntelliDoc may use web search when document evidence is
              insufficient. It asks for confirmation before doing so. Verify
              important information using the cited sources.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}

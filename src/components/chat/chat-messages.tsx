"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BrainCircuit, FileText, Loader2, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CitationSourceGrid } from "./chat-citations";
import { CreditExhaustedModal } from "./CreditExhaustedModal";
import { SuggestionButton } from "./suggestion-button";
import { SynthesisBadge } from "./SynthesisBadge";
import { WebSearchConfirmCard } from "./WebSearchConfirmCard";
import { formatFileName } from "@/lib/format";
import { useConversationStore } from "@/store/conversation-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function normalizeRole(role: unknown): string {
  return String(role || "").toLowerCase();
}

interface ChatMessagesProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[];
  isGenerating: boolean;
  hasKey: boolean | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  docTitle?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  docDetails: any;
  setInput: (t: string) => void;
  activeConversationId?: string | null;
  onOpenSources: (messageId: string) => void;
}

export function ChatMessages({
  messages,
  isGenerating,
  hasKey,
  messagesEndRef,
  docTitle,
  docDetails,
  setInput,
  activeConversationId,
  onOpenSources,
}: ChatMessagesProps) {
  const resolveWebSearch = useConversationStore((state) => state.resolveWebSearch);
  const router = useRouter();

  useEffect(() => {
    if (hasKey === false) {
      router.push("/billing");
    }
  }, [hasKey, router]);

  if (hasKey === false) {
    return (
      <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center space-y-4 px-4 text-center">
        <Loader2 className="size-6 animate-spin text-primary" />
        <h2 className="font-heading text-lg font-semibold">
          Redirecting to Billing…
        </h2>
        <p className="text-sm text-muted-foreground">
          You need AI credits or an API key to continue.
        </p>
      </div>
    );
  }

  if (messages.length === 0) {
    const suggestedQuestions: string[] = Array.isArray(
      docDetails?.suggestedQuestions
    )
      ? docDetails.suggestedQuestions
      : [];

    return (
      <div className="mx-auto flex min-h-full max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm">
          {docTitle ? (
            <FileText className="size-5" aria-hidden="true" />
          ) : (
            <MessageSquare className="size-5" aria-hidden="true" />
          )}
        </span>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {docTitle
            ? `Chat with ${formatFileName(docTitle)}`
            : "How can I help you today?"}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {docTitle
            ? docDetails?.summary ||
              "Ask a question about this document. Answers include citations from the retrieved passages."
            : "Ask about your documents or choose a collection scope. Answers are grounded in your workspace content."}
        </p>

        {!docTitle ? (
          <Button asChild variant="outline" size="sm" className="mt-5">
            <Link href="/documents">Browse documents</Link>
          </Button>
        ) : null}

        {suggestedQuestions.length > 0 ? (
          <div className="mt-7 w-full">
            <p className="mb-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Suggested questions
            </p>
            <div className="grid w-full gap-2">
              {suggestedQuestions.map((question, index) => (
                <SuggestionButton
                  key={`${question}-${index}`}
                  text={question}
                  onClick={(text) => setInput(text)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[760px] space-y-6 px-4 py-6">
      {messages.map((msg, idx) => (
        <div
          key={msg.id}
          className={
            normalizeRole(msg.role) === "user"
              ? "flex justify-end"
              : "flex items-start gap-3"
          }
        >
          {normalizeRole(msg.role) === "assistant" ? (
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary">
              <BrainCircuit className="size-3.5" aria-hidden="true" />
            </span>
          ) : null}

          <div
            className={
              normalizeRole(msg.role) === "user"
                ? "max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm leading-relaxed text-foreground"
                : "min-w-0 flex-1"
            }
          >
            {normalizeRole(msg.role) === "assistant" ? (
              <div className="prose prose-sm max-w-none text-sm leading-relaxed dark:prose-invert prose-p:my-1.5 prose-headings:my-3 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-pre:my-3 prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-muted/60 prose-a:text-primary prose-strong:text-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
                {msg.isStreaming && isGenerating && idx === messages.length - 1 ? (
                  <span
                    className="ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-full bg-primary align-text-bottom"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{msg.content}</div>
            )}

            {msg.citations && msg.citations.length > 0 ? (
              <CitationSourceGrid
                citations={msg.citations}
                messageId={msg.id}
                onOpenSources={onOpenSources}
              />
            ) : null}

            {msg.needsConfirmation ? (
              <WebSearchConfirmCard
                pendingId={msg.needsConfirmation.pendingId}
                verdict={msg.needsConfirmation.verdict}
                reason={msg.needsConfirmation.reason}
                goodDocsCount={msg.needsConfirmation.goodDocsCount}
                answerability={msg.needsConfirmation.answerability}
                onResolve={(pendingId, consent) => {
                  if (activeConversationId) {
                    resolveWebSearch(activeConversationId, pendingId, consent);
                  }
                }}
                resolved={msg.confirmationResolved}
              />
            ) : null}

            {msg.isSynthesized && !msg.needsConfirmation ? (
              <SynthesisBadge />
            ) : null}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
      <CreditExhaustedModal />
    </div>
  );
}

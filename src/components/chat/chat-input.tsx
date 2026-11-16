"use client";

import { useEffect, useRef } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VoiceInputButton } from "./VoiceInputButton";

interface ChatInputProps {
  input: string;
  setInput: (t: string) => void;
  handleSend: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isGenerating: boolean;
  hasKey: boolean | null;
  onTranscript?: (text: string) => void;
}

export function ChatInput({
  input,
  setInput,
  handleSend,
  handleKeyDown,
  isGenerating,
  hasKey,
  onTranscript,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, 160);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 160 ? "auto" : "hidden";
  }, [input]);

  return (
    <div className="shrink-0 border-t border-border bg-background/95 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur">
      <div className="mx-auto w-full max-w-[760px]">
        <div className="flex items-end gap-1 rounded-xl border border-border bg-card p-1.5 shadow-sm transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/30">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasKey === false
                ? "Add an API key to continue…"
                : "Ask about your documents…"
            }
            disabled={hasKey === false}
            aria-label="Chat message"
            rows={1}
            className="min-h-10 max-h-40 flex-1 resize-none scrollbar-thin border-none bg-transparent px-3 py-2.5 text-base leading-relaxed outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          />

          {onTranscript ? (
            <VoiceInputButton
              onTranscript={onTranscript}
              disabled={hasKey === false || isGenerating}
            />
          ) : null}

          <Button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isGenerating || hasKey === false}
            size="icon"
            aria-label={isGenerating ? "Generating response" : "Send message"}
            className="mb-0.5 mr-0.5 size-9 shrink-0 rounded-lg"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>

        <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
          IntelliDoc AI can make mistakes. Verify important information using the
          provided citations.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiSettingsProps {
  openApiKey: string;
  setOpenApiKey: (val: string) => void;
  maskedOpenApiKey: string | null;
  isOpenAiKeySaving: boolean;
  onSaveOpenApiKey: () => Promise<void>;
  onRevokeOpenApiKey: () => Promise<void>;
  geminiKey: string;
  setGeminiKey: (val: string) => void;
  maskedGeminiKey: string | null;
  isSystemGeminiKey: boolean;
  isGeminiKeySaving: boolean;
  onSaveGeminiKey: () => Promise<void>;
  onRevokeGeminiKey: () => Promise<void>;
  isKeyLoading: boolean;
}

type KeyProvider = "openai" | "gemini";

function MaskedKey({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Masked key copied");
      window.setTimeout(() => setCopied(false), 1_500);
    } catch {
      toast.error("Could not copy the key");
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
        {value}
      </code>
      <IconButton
        aria-label={`Copy ${label}`}
        tooltip={copied ? "Copied" : "Copy masked key"}
        size="icon-xs"
        onClick={copy}
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </IconButton>
    </div>
  );
}

export function ApiSettings({
  openApiKey,
  setOpenApiKey,
  maskedOpenApiKey,
  isOpenAiKeySaving,
  onSaveOpenApiKey,
  onRevokeOpenApiKey,
  geminiKey,
  setGeminiKey,
  maskedGeminiKey,
  isSystemGeminiKey,
  isGeminiKeySaving,
  onSaveGeminiKey,
  onRevokeGeminiKey,
  isKeyLoading,
}: ApiSettingsProps) {
  const [pendingRevoke, setPendingRevoke] = useState<KeyProvider | null>(null);

  const handleRevoke = async () => {
    if (pendingRevoke === "openai") {
      await onRevokeOpenApiKey();
    } else if (pendingRevoke === "gemini") {
      await onRevokeGeminiKey();
    }
  };

  const revokeLabel =
    pendingRevoke === "openai" ? "OpenAI" : pendingRevoke === "gemini" ? "Gemini" : "";

  if (isKeyLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading API keys">
        <Skeleton className="h-[220px] rounded-xl" />
        <Skeleton className="h-[260px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="pt-3">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary-accent" aria-hidden="true" />
                OpenAI API key
              </CardTitle>
              <CardDescription>
                Used for OpenAI chat and embeddings when selected.
              </CardDescription>
            </div>
            <Badge tone={maskedOpenApiKey ? "success" : "neutral"}>
              {maskedOpenApiKey ? "Saved" : "Not configured"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {maskedOpenApiKey ? (
            <MaskedKey label="OpenAI API key" value={maskedOpenApiKey} />
          ) : (
            <div className="max-w-md space-y-2">
              <label htmlFor="openai-api-key" className="text-sm font-medium">
                OpenAI API key
              </label>
              <Input
                id="openai-api-key"
                type="password"
                placeholder="sk-..."
                value={openApiKey}
                onChange={(event) => setOpenApiKey(event.target.value)}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Keys are stored encrypted. The full key is never returned to the
                browser after saving.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          {maskedOpenApiKey ? (
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:bg-destructive-soft hover:text-destructive"
              onClick={() => setPendingRevoke("openai")}
              disabled={isOpenAiKeySaving}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Revoke key
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void onSaveOpenApiKey()}
              loading={isOpenAiKeySaving}
              disabled={!openApiKey.trim()}
            >
              Save OpenAI key
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card className="pt-3">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary-accent" aria-hidden="true" />
                Gemini API key
              </CardTitle>
              <CardDescription>
                Use the system default key or bring your own Gemini key.
              </CardDescription>
            </div>
            <Badge
              tone={
                isSystemGeminiKey
                  ? "info"
                  : maskedGeminiKey
                    ? "success"
                    : "neutral"
              }
            >
              {isSystemGeminiKey
                ? "System default"
                : maskedGeminiKey
                  ? "Saved"
                  : "Not configured"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSystemGeminiKey ? (
            <div className="rounded-lg border border-info/20 bg-info-soft p-3 text-sm">
              <p className="font-medium text-info-foreground">
                System default key active
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add a personal Gemini key below to override the shared default.
              </p>
            </div>
          ) : maskedGeminiKey ? (
            <MaskedKey label="Gemini API key" value={maskedGeminiKey} />
          ) : null}

          <div className="max-w-md space-y-2">
            <label htmlFor="gemini-api-key" className="text-sm font-medium">
              {maskedGeminiKey && !isSystemGeminiKey
                ? "Replace Gemini API key"
                : "Gemini API key"}
            </label>
            <Input
              id="gemini-api-key"
              type="password"
              placeholder="AIza..."
              value={geminiKey}
              onChange={(event) => setGeminiKey(event.target.value)}
              autoComplete="off"
            />
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-accent underline-offset-4 hover:underline"
            >
              Get a free Gemini key
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-end gap-2">
          {maskedGeminiKey && !isSystemGeminiKey ? (
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:bg-destructive-soft hover:text-destructive"
              onClick={() => setPendingRevoke("gemini")}
              disabled={isGeminiKeySaving}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Revoke key
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={() => void onSaveGeminiKey()}
            loading={isGeminiKeySaving}
            disabled={!geminiKey.trim()}
          >
            Save Gemini key
          </Button>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={pendingRevoke !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRevoke(null);
        }}
        title={`Revoke ${revokeLabel} API key?`}
        description="Requests that rely on this key will stop until another key is saved. This cannot be undone."
        confirmLabel="Revoke key"
        onConfirm={handleRevoke}
      />
    </div>
  );
}

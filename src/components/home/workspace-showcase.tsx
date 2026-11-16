import {
  ArrowRight,
  Building2,
  FileText,
  FolderKanban,
  Quote,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

const flow = [
  {
    label: "Workspace",
    icon: Building2,
    title: "Your team's boundary",
    detail: "Members and roles decide who can enter.",
  },
  {
    label: "Collection",
    icon: FolderKanban,
    title: "A focused source set",
    detail: "Retrieval can be limited to one collection.",
  },
  {
    label: "Documents",
    icon: FileText,
    title: "Processed and indexed",
    detail: "Each file shows its processing state.",
  },
  {
    label: "Answer",
    icon: Quote,
    title: "Grounded in the source",
    detail: "Answers stay tied to the passages used.",
  },
];

export function WorkspaceShowcase() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-border bg-card/40 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-accent">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From workspace to source-backed answer.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every question follows the same path. The active workspace sets the
            boundary, the collection narrows the sources, and the answer points
            back to the documents it used.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
          {flow.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="contents">
                <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {step.label}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {step.detail}
                  </p>
                  {index === 0 ? (
                    <Badge tone="info" size="sm" className="mt-3">
                      Isolated
                    </Badge>
                  ) : null}
                  {index === 2 ? (
                    <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
                      <p className="truncate rounded border border-border bg-muted/40 px-2 py-1">
                        system_architecture.pdf
                      </p>
                      <p className="truncate rounded border border-border bg-muted/40 px-2 py-1">
                        bert_pretraining.pdf
                      </p>
                    </div>
                  ) : null}
                  {index === 3 ? (
                    <p className="mt-3 line-clamp-3 rounded border border-border bg-muted/40 px-2 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
                      “IntelliDoc uses RabbitMQ as the message broker for
                      asynchronous document ingestion.”
                    </p>
                  ) : null}
                </div>
                {index < flow.length - 1 ? (
                  <div className="flex justify-center py-1 lg:px-1">
                    <ArrowRight
                      className="size-4 rotate-90 text-muted-foreground/60 lg:rotate-0"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Illustrative flow using example document names and an answer from the
          product.
        </p>
      </div>
    </section>
  );
}

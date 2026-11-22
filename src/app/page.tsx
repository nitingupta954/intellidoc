import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  ChartColumn,
  CheckCircle2,
  FileDown,
  FileStack,
  FileText,
  FolderTree,
  KeyRound,
  LibraryBig,
  LockKeyhole,
  MailPlus,
  MessagesSquare,
  Share2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { ProductShot } from "@/components/home/product-shot";
import { WorkspaceShowcase } from "@/components/home/workspace-showcase";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/config/pricing";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "IntelliDoc AI | Document intelligence with citations",
  description:
    "Upload your documents, organize them into focused collections, and ask questions with answers grounded in the source passages. Built for teams that need to verify what they read.",
  alternates: {
    canonical: `${env.NEXT_PUBLIC_SITE_URL}`,
  },
  openGraph: {
    title: "IntelliDoc AI | Document intelligence with citations",
    description:
      "Workspaces, focused collections, and citation-backed answers for document-heavy teams.",
    url: env.NEXT_PUBLIC_SITE_URL,
    siteName: "IntelliDoc AI",
    type: "website",
  },
};

const FEATURES = [
  {
    icon: FileStack,
    title: "Multi-Format Upload",
    description:
      "Upload PDFs, DOCX, PPTX, TXT, Markdown, CSV, and JSON files, with progress that follows every file from upload to index.",
  },
  {
    icon: FolderTree,
    title: "Folder Organization",
    description:
      "Keep related documents together with nested folders and breadcrumbs, so even large workspaces stay easy to navigate.",
  },
  {
    icon: Sparkles,
    title: "Auto Summaries",
    description:
      "Generate concise AI summaries for faster understanding, then ask questions from the points that matter most.",
  },
  {
    icon: MessagesSquare,
    title: "RAG Chat",
    description:
      "Chat with your documents using retrieval-augmented generation grounded in the passages that support each answer.",
  },
  {
    icon: FileDown,
    title: "Chat Export",
    description:
      "Export conversations as Markdown or PDF whenever you need a portable record of the discussion.",
  },
  {
    icon: Share2,
    title: "Shared Links",
    description:
      "Share secure, expiring links to documents and conversations, with access scoped to the people you choose.",
  },
  {
    icon: LibraryBig,
    title: "Knowledge Bases",
    description:
      "Organize documents into knowledge bases that scope retrieval to the right content for every conversation.",
  },
  {
    icon: ShieldCheck,
    title: "Security & RBAC",
    description:
      "Control access with owner, admin, and member roles, plus workspace isolation across everything you store.",
  },
  {
    icon: ChartColumn,
    title: "Analytics Dashboard",
    description:
      "Monitor document counts, query activity, storage usage, and active users from a single workspace overview.",
  },
  {
    icon: KeyRound,
    title: "Bring Your Own Key",
    description:
      "Use the system Gemini default or connect your own Gemini or OpenAI key. Saved keys stay masked after saving.",
  },
  {
    icon: MailPlus,
    title: "Email Invitations",
    description:
      "Invite teammates by email through SMTP and give each person the workspace role they need from day one.",
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description:
      "An asynchronous pipeline indexes every document and keeps its live status visible while the work runs.",
  },
];

const PROOF_POINTS = [
  "Membership-scoped workspaces",
  "Collection and document scoping",
  "Answers grounded in cited passages",
];

export default function Home() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "IntelliDoc AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...PLANS.map((plan) => plan.priceAmount)),
      highPrice: Math.max(...PLANS.map((plan) => plan.priceAmount)),
      offerCount: PLANS.length,
      offers: PLANS.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: plan.priceAmount,
        priceCurrency: plan.currency,
      })),
    },
  };

  return (
    <>
      <JsonLd data={schemaData} />
      <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[760px] bg-[linear-gradient(to_right,rgb(148_163_184_/_0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(148_163_184_/_0.12)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
          aria-hidden="true"
        />

        <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BrainCircuit className="size-4" aria-hidden="true" />
              </span>
              <span className="font-heading text-base font-semibold tracking-tight">
                IntelliDoc
              </span>
            </Link>

            <nav
              aria-label="Primary"
              className="ml-6 hidden items-center gap-6 text-sm text-muted-foreground md:flex"
            >
              <a href="#product" className="transition-colors hover:text-foreground">
                Product
              </a>
              <a href="#features" className="transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#how-it-works" className="transition-colors hover:text-foreground">
                How it works
              </a>
              <Link href="/pricing" className="transition-colors hover:text-foreground">
                Pricing
              </Link>
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">
                  Get started
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="relative">
          <section className="mx-auto max-w-6xl px-5 pb-14 pt-16 text-center sm:pt-24">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-card">
              <Sparkles className="size-3.5 text-primary-accent" aria-hidden="true" />
              Document intelligence, grounded in sources
            </div>

            <h1 className="mx-auto mt-6 max-w-4xl text-balance font-heading text-4xl font-semibold leading-[1.06] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              The most modern{" "}
              <span className="inline-block">AI-powered</span> document
              intelligence platform.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Upload the documents your team already relies on, organize them
              into focused collections, and ask questions that lead back to the
              passages they came from.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Start free
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#product">See the product</a>
              </Button>
            </div>

            <ul className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:flex-row">
              {PROOF_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-1.5">
                  <CheckCircle2
                    className="size-3.5 text-success"
                    aria-hidden="true"
                  />
                  {point}
                </li>
              ))}
            </ul>

            <ProductShot
              src="/landing/chat.png"
              alt="IntelliDoc AI chat showing a question about the message broker used by IntelliDoc, an answer grounded in the architecture document, and the active workspace scope."
              width={1440}
              height={820}
              priority
              caption="Ask with a workspace or collection scope, then check the answer against the source."
              className="mx-auto mt-14 max-w-6xl text-left"
            />
          </section>

          <section className="mx-auto max-w-6xl px-5 pb-20">
            <div className="sm:mx-auto sm:max-w-3xl">
              <Link
                href="/register"
                className="group flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary/30 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-heading text-lg font-semibold text-foreground">
                    Bring your own documents. Keep your own process.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start with a workspace, upload a file, and ask your first
                    question in minutes.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-accent">
                  Create a workspace
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </div>
          </section>

          <section id="product" className="scroll-mt-24 pb-4">
            <div className="mx-auto max-w-6xl px-5">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-accent">
                    The product
                  </p>
                  <h2 className="mt-3 max-w-xl font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    A calm control room for document-heavy work.
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:justify-self-end">
                  See what needs attention, what changed recently, and which
                  questions are being asked across your workspaces. The same
                  structure carries through documents, collections, and chat.
                </p>
              </div>

              <div className="mt-10 grid gap-8">
                <ProductShot
                  src="/landing/dashboard.png"
                  alt="IntelliDoc dashboard showing workspace statistics, recent knowledge activity, recent documents, and a weekly query activity chart."
                  width={1440}
                  height={820}
                  caption="Dashboard: real workspace totals, recent activity, and document processing states."
                />
                <ProductShot
                  src="/landing/documents.png"
                  alt="IntelliDoc documents page showing folder breadcrumbs, a drag-and-drop upload area, search, filters, and indexed PDF rows."
                  width={1440}
                  height={820}
                  caption="Documents: folders, drag-and-drop upload, search, status, and a direct path into chat."
                  className="lg:px-16"
                />
              </div>
            </div>
          </section>

          <section
            id="features"
            className="relative scroll-mt-24 overflow-hidden px-5 py-20 sm:py-24"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(148_163_184_/_0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgb(148_163_184_/_0.1)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-6xl">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-accent">
                  Features
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Everything between upload and a trustworthy answer.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  No hidden retrieval paths and no mystery answers. The product
                  keeps the source structure visible from the first upload to the
                  final citation.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <article
                      key={feature.title}
                      className="group h-full rounded-xl border border-border bg-card p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-primary/25 hover:shadow-lg"
                    >
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary-accent ring-1 ring-primary/10 transition-colors group-hover:bg-primary/15">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-4 text-sm font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <WorkspaceShowcase />

          <section className="px-5 py-20 sm:py-24">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-primary text-primary-foreground">
              <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">
                    Access and isolation
                  </p>
                  <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                    Access follows the workspace.
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-primary-foreground/70">
                    Documents, collections, and conversations belong to a
                    workspace. Access is checked against membership before the
                    data is returned, and model keys stay server-side.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="mt-7 border-white/20 bg-white/5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                  >
                    <Link href="/register">
                      Get started
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                <ul className="grid gap-3">
                  {[
                    {
                      icon: LockKeyhole,
                      title: "Membership checks",
                      body: "Workspace routes resolve access before returning documents, messages, or analytics.",
                    },
                    {
                      icon: KeyRound,
                      title: "Masked model keys",
                      body: "Saved OpenAI and Gemini keys are never returned in full to the browser.",
                    },
                    {
                      icon: FileText,
                      title: "Scoped retrieval",
                      body: "Questions can be limited to a collection or a single document before retrieval runs.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.title}
                        className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.055] p-4"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{item.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-primary-foreground/65">
                            {item.body}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </section>

          <section className="px-5 pb-24">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Bring your documents. Ask better questions.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                Create a workspace, add a document, and see the answer next to
                the source it came from.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/register">
                    Start free
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/pricing">View pricing</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border px-5 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BrainCircuit className="size-3" aria-hidden="true" />
              </span>
              <span>© {new Date().getFullYear()} IntelliDoc AI</span>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-5">
              <Link href="/pricing" className="transition-colors hover:text-foreground">
                Pricing
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">
                Terms
              </Link>
              <Link href="/contact" className="transition-colors hover:text-foreground">
                Contact
              </Link>
              <a
                href="https://github.com/nitingupta954/intellidoc"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                GitHub
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}

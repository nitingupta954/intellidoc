import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { ActivityRow } from "@/components/dashboard/activity-row";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { QueryActivityChart } from "@/components/dashboard/query-activity-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { getDashboardData, getDocumentStatusMeta } from "@/lib/dashboard-data";
import { formatRelative } from "@/lib/format";

function formatTimeSaved(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
  return `${hours}h ${remainingMinutes}m`;
}

function insightIcon(tone: "warning" | "info" | "neutral") {
  if (tone === "warning") {
    return <AlertTriangle className="size-4" aria-hidden="true" />;
  }
  if (tone === "info") {
    return <Clock3 className="size-4" aria-hidden="true" />;
  }
  return <Sparkles className="size-4" aria-hidden="true" />;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await getDashboardData(session.user.id);
  const firstName =
    session.user.name?.trim().split(/\s+/)[0] ||
    session.user.email?.split("@")[0] ||
    "there";

  return (
    <PageContainer className="space-y-6 pb-8">
      <DashboardHeader
        firstName={firstName}
        initialWorkspaceName={data.primaryWorkspaceName}
      />

      <section aria-label="Workspace statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Documents"
            value={data.totalDocuments.toLocaleString()}
            icon={<FileText size={18} />}
            iconBg="bg-info-soft text-info"
            hint="Documents across every workspace you belong to."
          />
          <StatCard
            title="AI Queries"
            value={data.aiQueries.toLocaleString()}
            icon={<MessageSquare size={18} />}
            iconBg="bg-accent text-primary-accent"
            hint="Questions you have asked across your workspaces."
          />
          <StatCard
            title="Time Saved"
            value={formatTimeSaved(data.timeSavedMinutes)}
            icon={<Clock3 size={18} />}
            iconBg="bg-success-soft text-success"
            hint={`Estimated at 5 minutes saved per AI query (${data.aiQueries.toLocaleString()} ${
              data.aiQueries === 1 ? "query" : "queries"
            }).`}
          />
        </div>
      </section>

      <div className="grid min-w-0 gap-4 lg:grid-cols-5">
        <Card className="min-w-0 lg:col-span-3">
          <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                Recent knowledge activity
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                The latest uploads and questions across your workspaces.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="-mr-2 shrink-0">
              <Link href="/documents">
                View documents
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-1">
            {data.activity.length > 0 ? (
              <div>
                {data.activity.map((activity, index) => (
                  <ActivityRow
                    key={`${activity.type}-${activity.id}`}
                    icon={
                      activity.type === "document" ? (
                        <FileText size={16} aria-hidden="true" />
                      ) : (
                        <MessageSquare size={16} aria-hidden="true" />
                      )
                    }
                    title={activity.title}
                    meta={`${formatRelative(activity.date)} · ${
                      activity.type === "document" ? "Document" : "Conversation"
                    }`}
                    href={activity.href}
                    isLast={index === data.activity.length - 1}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                icon={<Sparkles aria-hidden="true" />}
                title="No activity yet"
                description="Your uploads and questions will appear here as you build your knowledge base."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/documents">Upload a document</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                Recent documents
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                The five most recently added files.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="-mr-2 shrink-0">
              <Link href="/documents">
                View all
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-1">
            {data.recentDocuments.length > 0 ? (
              <ul className="divide-y divide-border">
                {data.recentDocuments.map((document) => {
                  const status = getDocumentStatusMeta(document.status);
                  return (
                    <li key={document.id}>
                      <Link
                        href={`/documents/${document.id}`}
                        className="-mx-2 flex min-w-0 items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <FileText className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {document.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            Added {formatRelative(document.createdAt)}
                          </span>
                        </span>
                        <StatusBadge
                          status={status.label}
                          tone={status.tone}
                          label={status.label}
                          showIcon={false}
                          size="sm"
                          className="shrink-0"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                compact
                icon={<FileText aria-hidden="true" />}
                title="No documents yet"
                description="Upload your first file to start asking source-backed questions."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/documents">Upload a document</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <QueryActivityChart />
        </div>

        <Card className="min-w-0 lg:col-span-2">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary-accent">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  AI insights
                </h2>
                <p className="text-sm text-muted-foreground">
                  Signals from your actual workspace data.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.insights.length > 0 ? (
              <ul className="space-y-3">
                {data.insights.map((insight) => (
                  <li
                    key={insight.id}
                    className="rounded-lg border border-border bg-muted/25 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                          insight.tone === "warning"
                            ? "bg-warning-soft text-warning-foreground"
                            : insight.tone === "info"
                              ? "bg-info-soft text-info-foreground"
                              : "bg-accent text-accent-foreground"
                        }`}
                      >
                        {insightIcon(insight.tone)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {insight.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {insight.body}
                        </p>
                        <Button
                          asChild
                          variant="link"
                          size="sm"
                          className="mt-2 h-auto p-0 text-xs"
                        >
                          <Link href={insight.href}>
                            {insight.action}
                            <ArrowRight className="size-3.5" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                icon={<CheckCircle2 aria-hidden="true" />}
                title="Nothing needs attention"
                description="Your documents are indexed and your credit balance is healthy."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge tone="neutral" size="sm">
          {data.workspaceCount} {data.workspaceCount === 1 ? "workspace" : "workspaces"}
        </Badge>
        Statistics include every workspace you can access.
      </p>
    </PageContainer>
  );
}

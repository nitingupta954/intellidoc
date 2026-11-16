"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MessageSquare, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceStore } from "@/store/workspace-store";

interface QueryPoint {
  name: string;
  queries: number;
}

type ChartState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: QueryPoint[] };

export function QueryActivityChart() {
  const { activeWorkspaceId, workspaces } = useWorkspaceStore();
  const [state, setState] = useState<ChartState>({ status: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  const load = useCallback(async () => {
    if (!activeWorkspaceId) {
      setState({ status: "ready", data: [] });
      return;
    }

    setState({ status: "loading" });
    try {
      const response = await fetch(
        `/api/analytics?workspaceId=${encodeURIComponent(activeWorkspaceId)}`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        throw new Error("Query activity is unavailable right now.");
      }
      const payload = (await response.json()) as { queryData?: QueryPoint[] };
      setState({ status: "ready", data: payload.queryData ?? [] });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Query activity is unavailable right now.",
      });
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    void load();
  }, [load, retryKey]);

  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId
  );
  const total = state.status === "ready"
    ? state.data.reduce((sum, point) => sum + (point.queries || 0), 0)
    : 0;

  return (
    <section
      aria-labelledby="query-activity-title"
      className="rounded-xl border border-border bg-card p-5 shadow-card"
    >
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="query-activity-title"
            className="font-heading text-base font-semibold text-foreground"
          >
            AI query activity
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Questions asked in {activeWorkspace?.name ?? "your active workspace"}{" "}
            over the last 7 days.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {total.toLocaleString()} {total === 1 ? "query" : "queries"}
        </span>
      </div>

      {state.status === "loading" ? (
        <div className="space-y-3" aria-label="Loading query activity">
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </div>
      ) : state.status === "error" ? (
        <ErrorState
          compact
          title="Could not load query activity"
          message={state.message}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetryKey((key) => key + 1)}
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </Button>
          }
        />
      ) : !activeWorkspaceId ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
          <p className="text-sm font-medium text-foreground">
            Select a workspace to see query activity.
          </p>
        </div>
      ) : total === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <MessageSquare className="size-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-foreground">
            No questions in this workspace yet
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Ask your first question to start building a query history for this
            workspace.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-1">
            <Link href="/chat">Ask a question</Link>
          </Button>
        </div>
      ) : (
        <div className="h-[220px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={state.data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="query-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                dy={6}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <RechartsTooltip
                cursor={{ stroke: "var(--border)" }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  boxShadow: "var(--shadow-overlay)",
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                formatter={(value) => {
                  const count = Number(value ?? 0);
                  return [
                    `${count} ${count === 1 ? "query" : "queries"}`,
                    "Queries",
                  ];
                }}
              />
              <Area
                type="monotone"
                dataKey="queries"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#query-fill)"
                isAnimationActive={false}
                activeDot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

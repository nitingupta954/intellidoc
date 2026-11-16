"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Filter, Receipt, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { BillingSettings } from "@/components/settings/BillingSettings";
import { Badge, StatusBadge, type StatusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { formatDate, formatPlanName } from "@/lib/format";

interface PaymentRecord {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  createdAt: string;
}

interface SubscriptionSummary {
  plan: string;
  planName: string;
  price: string;
  period: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
}

type PaymentFilter = "all" | "success" | "pending" | "failed" | "refunded";

const PAGE_SIZE = 8;

const STATUS_META: Record<
  string,
  { label: string; tone: StatusTone; group: PaymentFilter }
> = {
  SUCCESS: { label: "Success", tone: "success", group: "success" },
  COMPLETED: { label: "Success", tone: "success", group: "success" },
  PENDING: { label: "Pending", tone: "warning", group: "pending" },
  FAILED: { label: "Failed", tone: "danger", group: "failed" },
  REFUNDED: { label: "Refunded", tone: "info", group: "refunded" },
};

function getStatusMeta(status: string) {
  return (
    STATUS_META[String(status || "").toUpperCase()] ?? {
      label: formatPlanName(status) || "Unknown",
      tone: "neutral" as const,
      group: "all" as const,
    }
  );
}

function getRecordPlan(plan: string) {
  if (/pack$/i.test(plan)) {
    return `${formatPlanName(plan.replace(/\s*pack$/i, ""))} pack`;
  }
  return formatPlanName(plan);
}

function formatPaymentAmount(amount: number, currency: string) {
  if (!Number.isFinite(amount) || amount <= 0) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function PaymentStatus({ status }: { status: string }) {
  const meta = getStatusMeta(status);
  return <StatusBadge status={status} label={meta.label} tone={meta.tone} />;
}

function CopyOrderButton({ orderId }: { orderId: string }) {
  const [copied, setCopied] = useState(false);
  const canCopy = Boolean(orderId && orderId !== "-");

  const copy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      toast.success("Order ID copied");
      window.setTimeout(() => setCopied(false), 1_500);
    } catch {
      toast.error("Could not copy the order ID");
    }
  };

  return (
    <IconButton
      aria-label={copied ? "Order ID copied" : "Copy order ID"}
      tooltip={copied ? "Copied" : "Copy order ID"}
      size="icon-xs"
      onClick={copy}
      disabled={!canCopy}
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
    </IconButton>
  );
}

export default function BillingPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    Promise.all([
      fetch("/api/subscriptions/current", { cache: "no-store" }).then(
        async (response) => {
          if (!response.ok) return null;
          return (await response.json()) as SubscriptionSummary;
        }
      ),
      fetch("/api/payments/history", { cache: "no-store" }).then(
        async (response) => {
          if (!response.ok) throw new Error("Payment history unavailable");
          return (await response.json()) as { payments?: PaymentRecord[] };
        }
      ),
    ])
      .then(([subscriptionData, paymentData]) => {
        if (cancelled) return;
        setSubscription(subscriptionData);
        setPayments(paymentData.payments ?? []);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const filteredPayments = useMemo(() => {
    if (filter === "all") return payments;
    return payments.filter(
      (payment) => getStatusMeta(payment.status).group === filter
    );
  }, [filter, payments]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagePayments = filteredPayments.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );
  const rangeStart = filteredPayments.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filteredPayments.length);

  return (
    <PageContainer className="space-y-8 pb-8">
      <PageHeader
        title="Billing & plans"
        description="Manage AI credits, review your current plan, and inspect payment history."
      />

      {subscription ? (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Current plan</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {subscription.planName} · {subscription.price} /{" "}
                {subscription.period}
              </p>
            </div>
            <Badge tone="info">
              {formatPlanName(subscription.subscriptionStatus || "active")}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {subscription.currentPeriodEnd
                ? `Current period ends ${formatDate(subscription.currentPeriodEnd)}`
                : "No renewal date is set for this plan."}
            </span>
            <Button asChild variant="outline" size="sm">
              <Link href="/pricing">Compare plans</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <BillingSettings />

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary-accent">
                <Receipt className="size-4" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>Payment history</CardTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Credit purchases and plan payments on this account.
                </p>
              </div>
            </div>
            <Badge tone="neutral">
              {filteredPayments.length} transaction
              {filteredPayments.length === 1 ? "" : "s"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as PaymentFilter)}
            >
              <SelectTrigger className="w-[170px]" aria-label="Filter payments by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-5" aria-busy="true" aria-label="Loading payment history">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : loadError ? (
            <div className="p-5">
              <ErrorState
                compact
                title="Payment history could not load"
                message="Your payments are still safe. Try loading the page again."
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
            </div>
          ) : payments.length === 0 ? (
            <div className="p-5">
              <EmptyState
                compact
                icon={<Receipt aria-hidden="true" />}
                title="No payments yet"
                description="Refill your AI credits to see transactions here."
              />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-5">
              <EmptyState
                compact
                icon={<Receipt aria-hidden="true" />}
                title="No matching payments"
                description="Try a different status filter."
                action={
                  <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                    Clear filter
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagePayments.map((payment) => (
                      <TableRow key={payment.id} className="border-border">
                        <TableCell className="whitespace-nowrap text-foreground/80">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-accent">
                            {getRecordPlan(payment.plan)}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-foreground">
                          {formatPaymentAmount(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>
                          <PaymentStatus status={payment.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="max-w-[160px] truncate font-mono text-xs text-muted-foreground">
                              {payment.razorpayOrderId}
                            </span>
                            <CopyOrderButton orderId={payment.razorpayOrderId} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <ul className="divide-y divide-border md:hidden">
                {pagePayments.map((payment) => (
                  <li key={payment.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {getRecordPlan(payment.plan)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                      <PaymentStatus status={payment.status} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-heading text-lg font-semibold text-foreground">
                        {formatPaymentAmount(payment.amount, payment.currency)}
                      </span>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate font-mono text-xs text-muted-foreground">
                          {payment.razorpayOrderId}
                        </span>
                        <CopyOrderButton orderId={payment.razorpayOrderId} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
                <span>
                  Showing {rangeStart}–{rangeEnd} of {filteredPayments.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-xs tabular-nums">
                    Page {safePage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

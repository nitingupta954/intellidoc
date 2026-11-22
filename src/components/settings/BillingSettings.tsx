"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, KeyRound, RefreshCw, Zap } from "lucide-react";

import { TokenMeter } from "./TokenMeter";
import { useRazorpayCheckout } from "@/components/payments/RazorpayCheckout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CREDIT_PACKS } from "@/lib/creditPacks";
import { formatPlanName } from "@/lib/format";

interface WalletState {
  balance: number;
  lifetimeGranted: number;
  lifetimeSpent: number;
  isBYOK: boolean;
}

export function BillingSettings() {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/wallet", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load your credit balance.");
      setWallet(await response.json());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void fetchWallet();
  }, [fetchWallet]);

  const { handleCreditPurchase } = useRazorpayCheckout({
    onSuccess: () => {
      void fetchWallet();
      setLoadingPackId(null);
    },
    onFailure: () => {
      setLoadingPackId(null);
    },
  });

  const handleBuy = async (packId: string) => {
    setLoadingPackId(packId);
    await handleCreditPurchase(packId);
  };

  if (status === "loading") {
    return (
      <div className="space-y-8" aria-busy="true" aria-label="Loading credits">
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[184px] rounded-xl" />
          <Skeleton className="h-[184px] rounded-xl" />
        </div>
        <div>
          <Skeleton className="mb-4 h-5 w-28" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[230px] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <ErrorState
        title="Credits could not load"
        message="We could not read your wallet balance. Try again in a moment."
        action={
          <Button variant="outline" onClick={() => void fetchWallet()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        }
      />
    );
  }

  if (wallet?.isBYOK) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary-accent" aria-hidden="true" />
            Bring your own key
          </CardTitle>
          <CardDescription>
            Your OpenAI or Gemini requests use your own key, so AI credits are
            not metered for this account.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline">
            <Link href="/settings">Manage API keys</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <section className="space-y-8" aria-labelledby="credit-overview-title">
      <h2
        id="credit-overview-title"
        className="font-heading text-lg font-semibold text-foreground"
      >
        Credit overview
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="pt-3">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5 text-primary-accent" aria-hidden="true" />
                  Current balance
                </CardTitle>
                <CardDescription>
                  Credits available for AI questions and summaries.
                </CardDescription>
              </div>
              {(wallet?.balance ?? 0) <= 1_000 ? (
                <Badge tone="warning">Low</Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-heading text-4xl font-semibold tracking-tight text-foreground">
                {(wallet?.balance ?? 0).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">credits</span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader>
            <CardTitle>Usage metrics</CardTitle>
            <CardDescription>
              Lifetime credits granted and spent on this account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TokenMeter
              lifetimeGranted={wallet?.lifetimeGranted || 0}
              lifetimeSpent={wallet?.lifetimeSpent || 0}
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4">
          <h3 className="font-heading text-base font-semibold text-foreground">
            Refill credits
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            One-time top-ups. Your plan and credit balance stay unchanged until
            you choose a pack.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {Object.values(CREDIT_PACKS).map((pack) => {
            const pricePerThousand =
              (pack.priceInr / pack.credits) * 1_000;
            const priceLabel = new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 2,
            }).format(pricePerThousand);

            return (
              <Card key={pack.id} className="flex min-w-0 flex-col pt-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="size-4 text-primary-accent" aria-hidden="true" />
                    {formatPlanName(pack.id)} pack
                  </CardTitle>
                  <CardDescription>One-time credit top-up</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="font-heading text-3xl font-semibold text-foreground">
                    ₹{pack.priceInr.toLocaleString("en-IN")}
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {pack.credits.toLocaleString()} credits
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {priceLabel} per 1,000 credits
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    loading={loadingPackId === pack.id}
                    disabled={loadingPackId !== null && loadingPackId !== pack.id}
                    onClick={() => void handleBuy(pack.id)}
                  >
                    Buy {formatPlanName(pack.id).toLowerCase()}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

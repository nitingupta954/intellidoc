"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MainSidebar } from "@/components/layout/MainSidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "intellidoc_sidebar_collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    }
  }, [collapsed, hydrated]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleMobileOpenChange = (open: boolean) => {
    setMobileOpen(open);
    if (!open) {
      setTimeout(() => mobileMenuButtonRef.current?.focus(), 0);
    }
  };

  return (
    <div className="h-dvh w-full overflow-hidden bg-background text-foreground">
      <MainSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <MobileSidebar open={mobileOpen} onOpenChange={handleMobileOpenChange} />

      <div
        className={cn(
          "flex h-full flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[264px]"
        )}
      >
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur lg:hidden">
          <Button
            ref={mobileMenuButtonRef}
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
          >
            <Menu className="size-5" />
          </Button>
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-heading text-xs font-semibold text-primary-foreground">
              ID
            </span>
            <span className="truncate font-heading text-sm font-semibold tracking-tight">
              IntelliDoc
            </span>
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-8 scrollbar-thin sm:p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

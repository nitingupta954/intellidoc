"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  Database,
  Files,
  LayoutDashboard,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WorkspaceSwitcher } from "@/components/layout/WorkspaceSwitcher";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

interface SidebarContentProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
  mobile?: boolean;
}

const PRIMARY_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/knowledge-bases", label: "Knowledge Bases", icon: Database, tour: "nav-kb" },
  { href: "/documents", label: "Documents", icon: Files, tour: "nav-docs" },
  { href: "/chat", label: "AI Chat", icon: MessageSquare, tour: "nav-chat" },
];

const SECONDARY_NAV = [
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarContent({
  collapsed = false,
  onToggle,
  onNavigate,
  onClose,
  mobile = false,
}: SidebarContentProps) {
  const pathname = usePathname() || "";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "flex shrink-0 items-center",
          collapsed ? "flex-col justify-center gap-1 px-2 py-3" : "h-16 justify-between px-3"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn(
            "flex min-w-0 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            collapsed ? "justify-center" : "gap-2.5"
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary font-heading text-sm font-semibold text-primary-foreground">
            ID
          </span>
          {!collapsed ? (
            <span className="truncate font-heading text-base font-semibold tracking-tight text-foreground">
              IntelliDoc
            </span>
          ) : null}
        </Link>

        {mobile ? (
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close navigation">
            <X className="size-5" />
          </Button>
        ) : collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggle}
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="text-muted-foreground"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
      </div>

      <div className={cn("shrink-0", collapsed ? "px-2 pb-3" : "px-3 pb-4")}>
        <WorkspaceSwitcher collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      <nav aria-label="Primary" className={cn("flex-1 overflow-y-auto", collapsed ? "px-2" : "px-3")}>
        <ul className="space-y-1">
          {PRIMARY_NAV.map((item) => (
            <li key={item.href}>
              <SidebarLink
                href={item.href}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
                active={isActive(pathname, item.href)}
                dataTour={item.tour}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className={cn("shrink-0 border-t border-sidebar-border pt-3", collapsed ? "px-2 pb-3" : "px-3 pb-3")}>
        <ul className="space-y-1">
          {SECONDARY_NAV.map((item) => (
            <li key={item.href}>
              <SidebarLink
                href={item.href}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
                active={isActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
        <div className={cn("mt-2 border-t border-sidebar-border pt-2", collapsed && "flex justify-center")}>
          <UserMenu collapsed={collapsed} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  active: boolean;
  dataTour?: string;
  onNavigate?: () => void;
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  collapsed,
  active,
  dataTour,
  onNavigate,
}: SidebarLinkProps) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      data-tour={dataTour}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center rounded-lg text-sm outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        collapsed ? "mx-auto size-10 justify-center" : "h-10 gap-3 px-3",
        active
          ? "bg-accent font-medium text-primary-accent"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-5 shrink-0" strokeWidth={active ? 2.1 : 1.8} aria-hidden="true" />
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

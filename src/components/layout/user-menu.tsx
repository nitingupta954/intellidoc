"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { ChevronsUpDown, LogOut, Moon, Sun } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function UserMenu({ collapsed = false, onNavigate }: UserMenuProps) {
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const user = session?.user;
  const name = user?.name || "User";
  const email = user?.email || "No email";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    onNavigate?.();
    await signOut({ callbackUrl: "/login" });
  };

  const trigger = (
    <button
      type="button"
      aria-label={collapsed ? "Account menu" : undefined}
      className={cn(
        "group flex w-full items-center rounded-lg text-left text-sm outline-none transition-colors",
        "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        collapsed ? "h-9 w-9 justify-center" : "gap-2.5 px-2 py-2"
      )}
    >
      <Avatar src={user?.image} name={name} size="md" className="size-8" />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">{name}</span>
            <span className="block truncate text-xs text-muted-foreground">{email}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </>
      ) : null}
    </button>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span className="block font-medium">{name}</span>
            <span className="block text-background/70">{email}</span>
          </TooltipContent>
        </Tooltip>
      ) : (
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      )}

      <DropdownMenuContent
        align="start"
        side={collapsed ? "right" : "top"}
        sideOffset={8}
        collisionPadding={8}
        className="w-64"
      >
        <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
          <Avatar src={user?.image} name={name} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">{name}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{email}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="gap-2 py-2"
        >
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
          Toggle theme
          <DropdownMenuShortcut className="tracking-normal">
            {resolvedTheme === "dark" ? "Dark" : "Light"}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          onSelect={() => {
            void handleSignOut();
          }}
          className="gap-2 py-2"
        >
          <LogOut className="size-4" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

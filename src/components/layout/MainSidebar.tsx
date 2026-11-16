"use client";

import { SidebarContent } from "@/components/layout/sidebar-content";
import { cn } from "@/lib/utils";

interface MainSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function MainSidebar({ collapsed, onToggle }: MainSidebarProps) {
  return (
    <aside
      data-collapsed={collapsed || undefined}
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex",
        collapsed ? "w-[72px]" : "w-[264px]"
      )}
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}

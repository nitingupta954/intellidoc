"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SidebarContent } from "@/components/layout/sidebar-content";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const close = () => onOpenChange(false);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="left" shouldScaleBackground={false} autoFocus>
      <DrawerContent
        style={{ width: 280, maxWidth: "85vw" }}
        className="border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <DrawerTitle className="sr-only">Navigation</DrawerTitle>
        <DrawerDescription className="sr-only">
          Main navigation, workspaces and account menu
        </DrawerDescription>
        <SidebarContent mobile onNavigate={close} onClose={close} />
      </DrawerContent>
    </Drawer>
  );
}

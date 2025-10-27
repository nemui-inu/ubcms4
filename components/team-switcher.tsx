"use client";

import { Zap } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useUser } from "@/context/user-context";

export function TeamSwitcher() {
  const { userData } = useUser();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/">
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <Zap className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-bold">UBCMS</span>
              <span className="truncate text-xs">{userData?.role}</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

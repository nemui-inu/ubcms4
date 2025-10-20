"use client";

import * as React from "react";
import {
  Building2,
  Gauge,
  LayoutDashboardIcon,
  User,
  Users,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import NavMain from "./nav-main";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  items: [
    {
      title: "Dashboard",
      icon: LayoutDashboardIcon,
      url: "/dashboard",
    },
    {
      title: "Rooms",
      icon: Building2,
      url: "/rooms",
    },
    {
      title: "Tenants",
      icon: Users,
      url: "/users/tenants",
    },
    {
      title: "Collectors",
      icon: User,
      url: "/users/collectors",
    },
    {
      title: "Rates",
      icon: Gauge,
      url: "/rates",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

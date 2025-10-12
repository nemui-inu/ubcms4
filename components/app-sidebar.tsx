import {
  LayoutDashboard,
  Gauge,
  User,
  Building,
  ReceiptText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: LayoutDashboard,
  },
  {
    title: "Rates",
    url: "#",
    icon: Gauge,
  },
  {
    title: "Bills",
    url: "#",
    icon: ReceiptText,
  },
  {
    title: "Rooms",
    url: "#",
    icon: Building,
  },
  {
    title: "Users",
    url: "#",
    icon: User,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="w-[230px]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>UBCMS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

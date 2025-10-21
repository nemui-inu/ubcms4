"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/context/user-context";

const NavMain = ({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) => {
  const pathname = usePathname();
  const [selected, setSelected] = useState<string | null>(pathname);

  const handleClick = (url: string) => {
    setSelected(url);
  };

  const { userData } = useUser();
  if (!userData) return null;

  if (userData.role !== "Admin") {
    items = items.filter((item) => item.title === "Dashboard");
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
        {" Controls"}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = selected === item.url;

            return (
              <SidebarMenuItem
                key={item.title}
                className={`transition-colors ${
                  isActive ? "rounded-sm bg-secondary" : ""
                }`}
                onClick={() => handleClick(item.url)}
              >
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default NavMain;

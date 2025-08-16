"use client"

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router";
export function NavMain({
  data
}) {
  console.log(data)
  return (
    <SidebarGroup> 
      {data.map((group, i) =>
        group.NavGroup ? (
          <div key={i}>
            {console.log(group.NavGroup.NavLabel)}
            <SidebarGroupLabel>{group.NavGroup.NavLabel}</SidebarGroupLabel>
            <SidebarMenu>
              {group.NavGroup.NavItems.map((item, j) => (
                <SidebarMenuItem key={j}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        ) : null
      )}
    </SidebarGroup>
  );
}

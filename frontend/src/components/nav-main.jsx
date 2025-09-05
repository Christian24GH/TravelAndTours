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
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Link } from "react-router";
export function NavMain({
  data
}) {
  const curLocation = location.pathname
  
  return (
    <SidebarGroup> 
      <SidebarGroupContent className="flex flex-col gap-2">
        {data.map((group, i) => {
          return (
              group.NavGroup ? (
              <div key={i}>
                <SidebarGroupLabel>{group.NavGroup.NavLabel}</SidebarGroupLabel>
                <SidebarMenu>
                  {group.NavGroup.NavItems.map((item, j) => (
                    <SidebarMenuItem key={j}>
                      <SidebarMenuButton asChild isActive={item.url == curLocation}>
                        <Link to={item.url}>
                          <item.icon/>
                        {item.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            ) : 
            
            group.title ? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={item.url == curLocation}>
                    <Link to={group.url}>
                      <group.icon/>
                      {group.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )
            :null
          )
        })}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

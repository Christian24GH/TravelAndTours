import * as React from "react";
import { Link } from "@inertiajs/react";
import { Frame, Map, PieChart, Settings2, SquareTerminal } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarMenuButton,
} from "@/components/ui/sidebar";

export function CustomHeader({ ...props }) {
    return (
        <Link href="#">
            <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <PieChart className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Travel And Tours</span>
                </div>
            </SidebarMenuButton>
        </Link>
    );
}


import { routes } from "@/routes";
export function AppSidebar() {
    
    const NavItems = [
        {
            title: "Dashboard",
            url: routes.dashboard,
            icon: SquareTerminal,
        },
        {
            title: "Logistics II",
            url: routes.logisticsII,
            icon: SquareTerminal,
        },
        {
            title: "Login",
            url: routes.login,
            icon: Map,
        },
    ];

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <CustomHeader/>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={NavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser/>
            </SidebarFooter>
        </Sidebar>
    );
}

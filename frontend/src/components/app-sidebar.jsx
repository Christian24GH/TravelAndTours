import {
  Car,
  Command,
  LifeBuoy,
  PieChartIcon,
  Send,
  WrenchIcon
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "TestUser",
    email: "test@testingf.com",
    avatar: "/avatars/shadcn.jpg",
    role: 'Logistics II'
  },

  logisticsIINav: [
    {
      NavGroup: {
        NavLabel: 'Fleet and Vehicles',
        NavItems: [
          {
            title: "Dashboard",
            url: '/logisticsII',
            icon: PieChartIcon,
          },
          {
            title: "Vehicles",
            url: '/logisticsII/fleet',
            icon: Car,
          },
          {
            title: "Maintenance",
            url: '/logisticsII/maintenance',
            icon: WrenchIcon,
          },
        ],
      }
    },
    {}
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div
                  className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Travel and Tours</span>
                  <span className="truncate text-xs">
                    {data.user.role == "Logistics II" && "Logistics"}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.user.role == "Logistics II" && (<NavMain data={data.logisticsIINav} />)}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

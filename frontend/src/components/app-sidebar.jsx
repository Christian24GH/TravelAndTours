import {
  Car,
  Command,
  LifeBuoy,
  PieChartIcon,
  Send,
  WrenchIcon,
  BookOpenCheckIcon,
  Gauge,
  ChartSpline,
  User,
  TagsIcon,
  HistoryIcon,
  LogsIcon,
  MapPinIcon
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavLink } from "react-router-dom"
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

import { Skeleton } from '@/components/ui/skeleton'

import AuthContext from "../context/AuthProvider"
import { useContext } from "react"

const data = {
  /** Logistics 2 NavItems */
  logisticsIINav: [
    {
      NavGroup: {
        NavLabel: 'Analytics',
        NavItems: [
          {
            title: "Dashboard",
            url: '/logisticsII',
            icon: Gauge,
          },
          {
            title: "Trip Cost Analysis",
            url: '#',
            icon: ChartSpline,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Fleet',
        NavItems: [
          {
            title: "Vehicles",
            url: '/logisticsII/vehicles',
            icon: Car,
          },
          {
            title: "Maintenance",
            url: '#',
            icon: WrenchIcon,
          },
          {
            title: "Drivers",
            url: '#',
            icon: User,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Reservation and Dispatch',
        NavItems: [
          {
            title: "Reservations",
            url: '/logisticsII/reservation',
            icon: BookOpenCheckIcon,
          },
          {
            title: "Dispatch Orders",
            url: '/logisticsII/dispatch',
            icon: TagsIcon,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Logs',
        NavItems: [
          {
            title: "Trip History",
            url: '#',
            icon: HistoryIcon,
          },
          {
            title: "Trip Logs",
            url: '#',
            icon: LogsIcon,
          },
        ],
      }
    }
  ],
  HRINav: [
    {
      NavGroup: {
        NavLabel: 'Human Resources',
        NavItems: [
          {
            title: "Talent Development",
            url: '/hr2m',
            icon: ChartSpline,
          },
          {
            title: "Employees Profile",
            url: '/hr2e',
            icon: User,
          },
          {
            title: "HR Admin",
            url: '/hr2a',
            icon: User,
          },
        ],
      }
    }
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

export function AppSidebar({...props}) {
  const { auth, logout, loading } = useContext(AuthContext)
  const user = {
    name: auth?.name,
    role: auth?.role,
    avatar: null,
    email: auth?.email
  }

  return (
    <Sidebar variant="inset" {...props}>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <a href="#">
              <div
                className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
              >
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Travel and Tours</span>
                <span className="truncate text-xs">
                  {user.role == "logisticsII Admin" && "Logistics"}
                  {user.role == "HR2 Admin" && "Human Resources"}
                  {user.role == "Employee" && "Employee"}
                </span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent className="flex flex-col gap-2">
      {/* HR 2 */}
      {user.role == "HR2 Admin" && (<NavLink data={data.HRINav} />)}
    </SidebarContent>
    <SidebarFooter>
      <NavUser user={user} logout={logout} />
    </SidebarFooter>
  </Sidebar>
);
}

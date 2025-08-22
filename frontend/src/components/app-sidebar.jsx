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
  ClockIcon,
  ClockAlertIcon,
  FileIcon,
  FileCheckIcon,
  CalendarCheckIcon,
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
            url: '/logisticsII/fleet',
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
            url: '#',
            icon: BookOpenCheckIcon,
          },
          {
            title: "Dispatch Orders",
            url: '#',
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

  /** HR3 NavItems */
  hr3Nav: [
    {
      NavGroup: {
        NavLabel: 'Analytics',
        NavItems: [
          {
            title: "Dashboard",
            url: '/hr3',
            icon: Gauge,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Time and Attendance',
        NavItems: [
          {
            title: "Time and Attendance",
            url: '/hr3/attendance',
            icon: ClockIcon,
          },
          {
            title: "Not Attended",
            url: '#',
            icon: ClockAlertIcon,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Timesheet Management',
        NavItems: [
          {
            title: "Timesheet",
            url: '/hr3/timesheet',
            icon: BookOpenCheckIcon,
          },
          {
            title: "Request",
            url: '#',
            icon: FileIcon,
          },
          {
            title: "Approved Timesheets",
            url: '#',
            icon: FileCheckIcon,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Shift and Schedule',
        NavItems: [
          {
            title: "Shift Management",
            url: '/hr3/schedule',
            icon: CalendarCheckIcon,
          },
          {
            title: "Trip Logs",
            url: '#',
            icon: LogsIcon,
          },
        ],
      }
    },
        {
      NavGroup: {
        NavLabel: 'Leave Management',
        NavItems: [
          {
            title: "Leave Requests",
            url: '/hr3/leave',
            icon: HistoryIcon,
          },
          {
            title: "Trip Logs",
            url: '#',
            icon: LogsIcon,
          },
        ],
      }
    },
        {
      NavGroup: {
        NavLabel: 'Claims and Reimbursements',
        NavItems: [
          {
            title: "Claims Management",
            url: '/hr3/claims',
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
              <a href={ user.role === "LogisticsII Admin" ? "/logisticsII" : user.role === "HR3 Manager" ? "/hr3" : "/"}>
                <div
                  className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Travel and Tours</span>
                  <span className="truncate text-xs">
                    {loading ? (<Skeleton className="w-2/3 h-full"/>) : user.role == "LogisticsII Admin" ? "Logistics" : '' || user.role == "HR3 Manager" ? "Human Resources 3" : ''}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-2">
        
        {loading ? (
            // Skeleton Placeholder while loading
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <>
              {user.role === "LogisticsII Admin" ? 
              (<NavMain data={data.logisticsIINav}/>) // add more here via ?(<NavMain data={data.yoursidebaritems}/>)
              : null}
              {user.role === "HR3 Manager" ? 
              (<NavMain data={data.hr3Nav}/>) // add more here via ?(<NavMain data={data.yoursidebaritems}/>)
              : null}
            </>
          )
        }
      </SidebarContent>
      <SidebarFooter>
        {loading ? 
          (<Skeleton className="w-full h-full"/>) : (<NavUser user={user} logout={logout} />)
        }
      </SidebarFooter>
    </Sidebar>
  );
}

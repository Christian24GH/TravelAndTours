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
import { useContext, useState } from "react"

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
  /** HR2 NavItems */
  HRINav: [
    {
      NavGroup: {
        NavLabel: 'Human Resources 2',
        NavItems: [
          {
            title: "Dashboard",
            url: '/hr2/db',
            icon: Command,
          },
          {
            type: 'collapsible',
            title: 'Talent & Career',
            icon: LogsIcon,
            children: [
              {
                title: "Competency",
                url: '/hr2/cms',
                icon: PieChartIcon,
              },
              {
                title: "Learning",
                url: '/hr2/lms',
                icon: BookOpenCheckIcon,
              },
              {
                title: "Training",
                url: '/hr2/tms',
                icon: Gauge,
              },
              {
                title: "Succession",
                url: '/hr2/sps',
                icon: ChartSpline,
              },
            ]
          },
          {
            title: "Employee Self-Service",
            url: '/hr2/ess',
            icon: User,
          },
          {
            title: "HRAdmin (ForData)",
            url: '/hr2/admin',
            icon: User,
          },
        ],
      }
    },
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

  const renderNavGroups = (navArray, openTalentGroup, toggleTalentGroup) => (
    navArray.map((group, idx) => (
      <div key={idx} className="mb-2">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {group.NavGroup.NavLabel}
        </div>
        <SidebarMenu>
          {group.NavGroup.NavItems.map((item, i) => (
            item.type === 'collapsible' ? (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 rounded justify-between"
                    onClick={toggleTalentGroup}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon && <item.icon className="size-4" />}
                      <span>{item.title}</span>
                    </span>
                    <span>{openTalentGroup ? '▾' : '▸'}</span>
                  </button>
                </SidebarMenuButton>
                {openTalentGroup && item.children && (
                  <SidebarMenu className="ml-4 border-l border-gray-200">
                    {item.children.map((child, j) => (
                      <SidebarMenuItem key={j}>
                        <SidebarMenuButton asChild>
                          <a href={child.url} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded">
                            {child.icon && <child.icon className="size-4" />}
                            <span>{child.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                )}
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded">
                    {item.icon && <item.icon className="size-4" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          ))}
        </SidebarMenu>
      </div>
    ))
  )

  // Collapsible state for HR2 Talent group
  const [openTalentGroup, setOpenTalentGroup] = useState(true);
  const toggleTalentGroup = () => setOpenTalentGroup((v) => !v);

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
                    {user.role === "logisticsII Admin" && "Logistics"}
                    {user.role === "HR2 Admin" && "Human Resources"}
                    {user.role === "Employee" && "Employee"}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-2">
        {user.role === "HR2 Admin" && renderNavGroups(data.HRINav, openTalentGroup, toggleTalentGroup)}
        {user.role === "logisticsII Admin" && renderNavGroups(data.logisticsIINav)}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} logout={logout} />
      </SidebarFooter>
    </Sidebar>
  );
}

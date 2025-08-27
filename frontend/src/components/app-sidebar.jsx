import {
  Car,
  Command,
  LifeBuoy,
  Send,
  WrenchIcon,
  BookOpenCheckIcon,
  Gauge,
  ChartSpline,
  User,
  TagsIcon,
  HistoryIcon,
  LogsIcon,
  IdCard,
  UserRoundPen,
  HandCoins,
  BanknoteArrowDown,
  ChevronRight
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
import { useContext, useState } from "react"
import { Link } from "react-router-dom"

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

  /** HR4 NavItems */
  HR4Nav: [
    {
      NavGroup: {
        NavLabel: 'Analytics',
        NavItems: [
          {
            title: "Dashboard",
            url: '/HR4',
            icon: Gauge,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Master Data',
        NavItems: [
          {
            title: "Employee Records",
            url: '/HR4/Records',
            icon: IdCard,
          },
          {
            title: "Job & Positions",
            url: '/HR4/Jobs',
            icon: UserRoundPen,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Payroll',
        NavItems: [
          {
            title: "Payroll Processing",
            url: '/HR4/PayrollPage',
            icon: HandCoins,
          },
          {
            title: "Tax & Compliance",
            url: '#',
            icon: BanknoteArrowDown,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Compensation',
        NavItems: [
          {
            title: "Salary Structures",
            url: '#',
            icon: HistoryIcon,
          },
          {
            title: "Incentives & Bonuses",
            url: '#',
            icon: LogsIcon,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'HR Analytics',
        NavItems: [
          {
            title: "Workforce Insights",
            url: '#',
            icon: HistoryIcon,
          },
          {
            title: "Attrition Risk & KPIs",
            url: '#',
            icon: LogsIcon,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Benefits & HMO',
        NavItems: [
          {
            title: "Health & Benefits",
            url: '#',
            icon: HistoryIcon,
          },
          {
            title: "Claims & Usage Reports",
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

export function AppSidebar({ ...props }) {
  const { auth, logout, loading } = useContext(AuthContext)
  const user = {
    name: auth?.name,
    role: auth?.role,
    avatar: null,
    email: auth?.email
  }

  // ✅ Track open/close state for HR4 modules
  const [openModules, setOpenModules] = useState({})
  const toggleModule = (idx) => {
    setOpenModules(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

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
                    {loading ? (<Skeleton className="w-2/3 h-full" />) : user.role == "LogisticsII Admin" ? "Logistics" : user.role == "HR4 Admin" ? "HR4" : ''}
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
              (<NavMain data={data.logisticsIINav} />) // add more here via ?(<NavMain data={data.yoursidebaritems}/>)
              : null}

            {user.role === "HR4 Admin" && (
              <SidebarMenu>
                {data.HR4Nav.map((group, idx) => (
                  <SidebarMenuItem key={idx}>
                    {group.NavGroup.NavLabel === "Analytics" ? (
                      // Analytics
                      <>
                        <div className="px-2 py-1 text-xs font text-sidebar-secondary">
                          {group.NavGroup.NavLabel}
                        </div>
                        <SidebarMenu className="pl-4">
                          {group.NavGroup.NavItems.map((item, i) => (
                            <SidebarMenuItem key={i}>
                              <SidebarMenuButton asChild>
                                <Link to={item.url} className="flex items-center gap-2">
                                  <item.icon className="size-4" />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </>
                    ) : (
                      // Other groups: Dropdown
                      <>
                        <SidebarMenuButton
                          size="md"
                          onClick={() => toggleModule(idx)}
                          className="flex justify-between items-center"
                        >
                          {group.NavGroup.NavLabel}
                          <ChevronRight
                            className={`transition-transform duration-200 ${openModules[idx] ? "rotate-90" : ""}`}
                            size={16}
                          />
                        </SidebarMenuButton>

                        {openModules[idx] && (
                          <SidebarMenu className="pl-4">
                            {group.NavGroup.NavItems.map((item, i) => (
                              <SidebarMenuItem key={i}>
                                <SidebarMenuButton asChild>
                                  <Link to={item.url} className="flex items-center gap-2">
                                    <item.icon className="size-4" />
                                    <span>{item.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        )}
                      </>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </>
        )
        }
      </SidebarContent>
      <SidebarFooter>
        {loading ?
          (<Skeleton className="w-full h-full" />) : (<NavUser user={user} logout={logout} />)
        }
      </SidebarFooter>
    </Sidebar>
  );
}




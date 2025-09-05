import {
  Car,
  Command,
  Calendar,
  FileText,
  Tag,
  BookOpen,
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
            title: "Make Reservation",
            url: '/logisticsII/reservation/make',
            icon: MapPinIcon,
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

  HR1Nav: [
  {
    NavGroup: {
      NavLabel: 'Analytics',
      NavItems: [
        { title: "Dashboard", url: '/hr1', icon: Gauge },
      ],
    },
  },
  {
    NavGroup: {
      NavLabel: 'Applicant Management',
      NavItems: [
        { title: "Applicant List", url: '/hr1/applicants', icon: User },
        { title: "Interview Scheduling", url: '/hr1/applicants/interviews', icon: Calendar },
      ],
    },
  },
  {
    NavGroup: {
      NavLabel: 'Recruitment Management',
      NavItems: [
        { title: "Job Postings", url: '/hr1/jobposting', icon: FileText },
        { title: "Offer Management", url: '/hr1/recruitment/offers', icon: Tag },
      ],
    },
  },
  {
    NavGroup: {
      NavLabel: 'New Hire Onboarding',
      NavItems: [
        { title: "Onboarding Checklist", url: '/hr1/onboarding/checklist', icon: BookOpen },
        { title: "Orientation Schedule", url: '/hr1/onboarding/orientation', icon: Calendar },
      ],
    },
  },
  {
    NavGroup: {
      NavLabel: 'Initial Performance Management',
      NavItems: [
        { title: "Performance Reviews", url: '/hr1/performance/reviews', icon: BookOpen },
        { title: "Feedback & Coaching", url: '/hr1/performance/feedback', icon: LifeBuoy },
      ],
    },
  },
  {
    NavGroup: {
      NavLabel: 'Social Recognition',
      NavItems: [
        { title: "Awards & Badges", url: '/hr1/recognition/awards', icon: Tag },
        { title: "Team Recognition", url: '/hr1/recognition/team', icon: Calendar },
      ],
    },
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

  return (
    <Sidebar variant="floating" {...props}>
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
                    {loading ? (<Skeleton className="w-2/3 h-full"/>) : user.role == "LogisticsII Admin" ? "Logistics" : ''}
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
              {user.role === "HR1 Admin" ? 
              (<NavMain data={data.HR1Nav}/>) // add more here via ?(<NavMain data={data.yoursidebaritems}/>)
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
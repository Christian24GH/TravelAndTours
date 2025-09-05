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
  MapPinIcon,
  GlobeIcon
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

import logo from '@/assets/finallogo.avif'
const data = {

  /** Logistics 1 NavItems */
  logisticsINav: [
    {
      NavGroup: {
        NavLabel: 'Smart Warehousing System',
        NavItems: [
          {
            title: "Inventory Management",
            url: '/logistics1/inventory-management',
            icon: Gauge,
          },
          {
            title: "Storage Organization",
            url: '/logisticsI/storage-organization',
            icon: PieChartIcon,
          },
          {
            title: "Stock Monitoring",
            url: '/logisticsI/stock-monitoring',
            icon: ChartSpline,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Procurement & Sourcing Management',
        NavItems: [
          {
            title: "Supplier Management",
            url: '/logistic1/supplier-management',
            icon: User,
          },
          {
            title: "Purchase Processing",
            url: '/logistic1/purchase-processing',
            icon: WrenchIcon,
          },
          {
            title: "Expense Records",
            url: '/logistic1/expense-records',
            icon: LifeBuoy,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Project Logistic Tracker',
        NavItems: [
          {
            title: "Equipment Scheduling",
            url: '/logistic1/equipment-scheduling',
            icon: BookOpenCheckIcon,
          },
          {
            title: "Delivery & Transport Tracking",
            url: '/logistic1/delivery-transport-tracking',
            icon: TagsIcon,
          },
          {
            title: "Tour Reports",
            url: '/logistic1/tour-reports',
            icon: HistoryIcon,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Asset Lifecycle & Maintenance',
        NavItems: [
          {
            title: "Asset Registration & QR Tagging",
            url: '/logistic1/asset-registration',
            icon: User,
          },
          {
            title: "Predictive Maintenance",
            url: '/logistic1/predictive-maintenance',
            icon: WrenchIcon,
          },
          {
            title: "Maintenance History",
            url: '/logistic1/maintenance-history',
            icon: LogsIcon,
          },
        ],
      }
    },
    {
      NavGroup: {
        NavLabel: 'Document Tracking & Logistics Records',
        NavItems: [
          {
            title: "Delivery Receipts",
            url: '/logistic1/delivery-receipts',
            icon: BookOpenCheckIcon,
          },
          {
            title: "Check-In/Check-Out Logs",
            url: '/logistic1/check-in-out-logs',
            icon: LifeBuoy,
          },
          {
            title: "Logistics Reports",
            url: '/logistic1/logistics-reports',
            icon: HistoryIcon,
          },
        ],
      }
    },
  ],


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
            url: '/logisticsII/drivers',
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
                  className="bg-[var(--vivid-neon-pink)] text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GlobeIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">JOLI Travel and Tours</span>
                  <span className="truncate text-xs">
                    {loading ? (<Skeleton className="w-2/3 h-full"/>) :
                     user.role == "LogisticsI Admin"  ? 'Logistics I Admin' : //just copy this line
                     user.role == "LogisticsII Admin" ? 'Logistics II Admin' :
                     //and place it here

                     null
                    }
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
            <div className="flex flex-col gap-2 px-2 h-full">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="flex-1 w-full" />
              <Skeleton className="flex-1 w-full" />
            </div>
          ) : (
            <>
              {user.role === "LogisticsII Admin" ? 
              (<NavMain data={data.logisticsIINav}/>) 
              : user.role === "LogisticsI Admin" ? 
              (<NavMain data={data.logisticsINav}/>) // add more here via ?(<NavMain data={data.yoursidebaritems}/>)
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
